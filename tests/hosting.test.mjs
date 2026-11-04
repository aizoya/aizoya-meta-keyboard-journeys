import test from 'node:test';
import assert from 'node:assert/strict';
import {request as httpRequest} from 'node:http';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {createApp} from '../server.mjs';
import {exportOrigin,replaySource} from '../policy.mjs';

test('export destinations reject credentials, paths and unsafe protocols',()=>{
 for(const value of ['javascript:alert(1)','http://judge.example','https://user:password@judge.example','https://judge.example/path','https://judge.example/?key=x','https://judge.example/#x'])assert.throws(()=>exportOrigin(value));
 assert.equal(exportOrigin('https://judge.example/'),'https://judge.example');
 assert.throws(()=>createApp({publicOrigin:'http://localhost:8787'}),/https/);
});

async function server(t,publicOrigin=null){
 let calls=0;
 const app=createApp({port:0,publicOrigin,run:async(origin,variant,planner)=>{calls++;return {variant,planner,keyboard:{actions:[{kind:'press',key:'Tab'}]},summary:{status:'needs_review'}};}});
 await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>app.close(resolve)));
 const base=`http://127.0.0.1:${app.address().port}`;
 return {base,calls:()=>calls,request:(method,path,{host,origin,cookie,forwarded}={})=>new Promise((resolve,reject)=>{
  const body=method==='POST'?JSON.stringify({variant:'fixed',planner:'fixture_replay'}):'';
  const req=httpRequest(base+path,{method,headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body),Origin:origin||base,...(host?{Host:host}:{}),...(cookie?{Cookie:cookie}:{}),...(forwarded?{'X-Forwarded-Host':forwarded}: {})}},res=>{
   let text='';res.setEncoding('utf8');res.on('data',c=>text+=c);res.on('end',()=>resolve({status:res.statusCode,headers:{get:key=>{const value=res.headers[key.toLowerCase()];return Array.isArray(value)?value.join(','):value;}},text:async()=>text,json:async()=>JSON.parse(text)}));
  });req.on('error',reject);req.end(body);
 })};
}

test('configured HTTPS host gets a Secure session and the correct exported test URL',async t=>{
 const s=await server(t,'https://judge.example');
 const response=await s.request('POST','/api/run',{host:'judge.example',origin:'https://judge.example'});
 assert.equal(response.status,201);
 const cookie=response.headers.get('set-cookie');assert.match(cookie,/; Secure/);assert.match(cookie,/HttpOnly/);
 const record=await response.json();
 const exported=await s.request('GET',`/api/runs/${record.id}/test`,{host:'judge.example',cookie:cookie.split(';')[0]});
 const source=await exported.text();assert.equal(exported.status,200);assert(source.includes('https://judge.example/fixture/fixed'));assert(!source.includes('127.0.0.1'));
 assert.equal(s.calls(),1);
});

test('public POST rejects an insecure or foreign origin and ignores forwarded-host claims',async t=>{
 const s=await server(t,'https://judge.example');
 for(const origin of ['http://judge.example','https://attacker.example']){
  assert.equal((await s.request('POST','/api/run',{host:'judge.example',origin})).status,403);
 }
 assert.equal((await s.request('POST','/api/run',{host:'attacker.example',origin:'https://judge.example',forwarded:'judge.example'})).status,403);
 assert.equal(s.calls(),0);
});

test('local reproduction exports the actual server port and leaves local cookies usable',async t=>{
 const s=await server(t);
 const response=await s.request('POST','/api/run');assert.equal(response.status,201);
 const cookie=response.headers.get('set-cookie');assert.doesNotMatch(cookie,/; Secure/);
 const record=await response.json();
 const exported=await s.request('GET',`/api/runs/${record.id}/test`,{cookie:cookie.split(';')[0]});
 assert((await exported.text()).includes(s.base+'/fixture/fixed'));
 assert(replaySource([{kind:'press',key:'Tab'}],'fixed','keyboard').includes('http://127.0.0.1:8787/fixture/fixed'));
});

test('practice pages and status do not consume the saved-run session pool',async t=>{
 const s=await server(t);
 for(let i=0;i<60;i++){
  const response=await s.request('GET',i%2?'/fixture/fixed':'/api/status');
  assert.equal(response.status,200);assert.equal(response.headers.get('set-cookie'),undefined);
 }
 assert.equal((await s.request('POST','/api/run')).status,201);
});

test('Vercel preview trusts only its configured platform hostname',async t=>{
 const oldFlag=process.env.VERCEL,oldURL=process.env.VERCEL_URL;
 process.env.VERCEL='1';process.env.VERCEL_URL='candidate-preview.vercel.app';
 t.after(()=>{if(oldFlag===undefined)delete process.env.VERCEL;else process.env.VERCEL=oldFlag;if(oldURL===undefined)delete process.env.VERCEL_URL;else process.env.VERCEL_URL=oldURL;});
 const s=await server(t,'https://meta.aizoya.com');
 const response=await s.request('POST','/api/run',{host:'candidate-preview.vercel.app',origin:'https://candidate-preview.vercel.app'});
 assert.equal(response.status,201);assert.match(response.headers.get('set-cookie'),/; Secure/);
 assert.equal((await s.request('POST','/api/run',{host:'other-preview.vercel.app',origin:'https://other-preview.vercel.app'})).status,403);
});

test('unknown routes and rejected requests cannot exhaust sessions',async t=>{
 const s=await server(t);
 for(let i=0;i<60;i++){
  for(const [method,path,options,status]of [
   ['GET','/favicon.ico',{},404],
   ['GET','/api/runs/abc',{},404],
   ['POST','/api/run',{origin:'https://attacker.example'},403],
   ['POST','/unknown',{},404]
  ]){
   const r=await s.request(method,path,options);
   assert.equal(r.status,status);assert.equal(r.headers.get('set-cookie'),undefined);
  }
 }
 assert.equal((await s.request('POST','/api/run')).status,201);
});
test('obsolete development host is rejected without terminating the server',async t=>{
 const s=await server(t);
 assert.equal((await s.request('GET','/api/status',{host:'terminal.local:4173'})).status,403);
 assert.equal((await s.request('GET','/api/status')).status,200);
});
test('asset errors are contained and the same server remains usable',async t=>{
 const app=createApp({port:0,readAsset:async()=>{throw Error('private-asset-path');}});
 await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>app.close(resolve)));
 const base='http://127.0.0.1:'+app.address().port;
 const failed=await fetch(base+'/app.js');
 assert.equal(failed.status,500);assert.deepEqual(await failed.json(),{error:'internal_error'});
 assert.equal((await fetch(base+'/api/status')).status,200);
});


test('judge page exposes permanent Meta evidence and honest scope',async t=>{
 const s=await server(t);
 const response=await s.request('GET','/');
 assert.equal(response.status,200);
 const html=await response.text();
 assert.match(html,/Read adaptive result/);
 assert.match(html,/recovered after the interface changed/i);
 assert.match(html,/inventory changes/i);
 assert.match(html,/41770415998/);
 assert.match(html,/A saved route stopped\. Muse recovered from fresh state/i);
 assert.match(html,/Read fixed-route counterfactual/i);
 assert.match(html,/41772230270/);
 assert.match(html,/does not prove that every deterministic policy fails/i);
 assert.match(html,/Earlier held-out result/);
 assert.match(html,/Inspect the exact held-out JSON and screenshots/);
 assert.match(html,/href="\/provenance\/meta-heldout-v3\/result\.json"/);
 assert.match(html,/href="\/evaluation\/heldout-v3-plan\.json"/);
 assert.match(html,/provenance\/meta-heldout-v3\/result\.json/);
 assert.match(html,/recovered after the interface changed/i);
 assert.match(html,/Six requests, no retry/i);
 assert.match(html,/Read obstacle result/);
 assert.match(html,/meta-obstacle-v2\/result\.json/);
 assert.match(html,/Bounded run did not complete; the focus cycle is recorded/i);
 assert.match(html,/PRECOMMITTED OBSTACLE CHECK · NOV 3/i);
 assert.match(html,/raw runner labeled the terminal/i);
 assert.match(html,/Inspect the exact obstacle JSON/);
 assert.match(html,/&quot;evaluation&quot;: &quot;precommitted_obstacle_v2&quot;/);
 assert.match(html,/not an accessibility audit/i);
 assert.match(html,/interactive examples below are scripted and make no AI request/i);
 assert.match(html,/Put a keyboard journey/i);
 assert.match(html,/CI_INTEGRATION\.md/);
 assert.match(html,/github-actions-keyboard-journey\.yml/);
 assert.match(html,/reusable customer-owned local targets/i);
 assert.match(html,/See the exact integration contract/i);
 assert.match(html,/journey\.config\.json/);
 assert.match(html,/data-journey-complete/);
 assert.match(html,/href="#try">Check the sample journey/i);
 assert.match(html,/id="try" class="workspace"/);
 assert.match(html,/For frontend teams/i);
 assert.match(html,/result-caveat/);
 assert.match(html,/Read the 2-minute case study/);
 assert.match(html,/href="\/case-study"/);
 assert.match(html,/AIZOYA_Keyboard_Journeys_Case_Study_2026\.pdf/);
});

test('case study gives judges a mobile-friendly overview and stable downloads',async t=>{
 const s=await server(t);
 const page=await s.request('GET','/case-study');
 assert.equal(page.status,200);assert.equal(page.headers.get('content-type'),'text/html; charset=utf-8');
 const html=await page.text();
 assert.match(html,/A saved route stopped/);assert.match(html,/Muse recovered/);assert.match(html,/Same adaptive fixture/);
 assert.match(html,/model cannot award itself a pass/i);assert.match(html,/Claim boundary/);
 assert.match(html,/meta\.aizoya\.com/);assert.match(html,/aizoya-meta-keyboard-journeys/);
 const pdf=await s.request('GET','/assets/AIZOYA_Keyboard_Journeys_Case_Study_2026.pdf');
 assert.equal(pdf.status,200);assert.equal(pdf.headers.get('content-type'),'application/pdf');
 const image=await s.request('GET','/assets/AIZOYA_Keyboard_Journeys_Thumbnail_3x2.png');
 assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');
});

test('every judge-facing proof route serves the committed bytes with the correct type',async t=>{
 const s=await server(t);
 const assets={
  '/evaluation/heldout-v3-plan.json':'application/json; charset=utf-8',
  '/evaluation/obstacle-v2-plan.json':'application/json; charset=utf-8',
  '/provenance/meta-heldout-v3/result.json':'application/json; charset=utf-8',
  '/provenance/meta-heldout-v3/manifest.json':'application/json; charset=utf-8',
  '/provenance/meta-heldout-v3/keyboard.png':'image/png',
  '/provenance/meta-heldout-v3/replay.png':'image/png',
  '/provenance/meta-adaptive-v1/result.json':'application/json; charset=utf-8',
  '/provenance/meta-adaptive-v1/manifest.json':'application/json; charset=utf-8',
  '/provenance/meta-adaptive-v1/keyboard.png':'image/png',
  '/provenance/meta-adaptive-v1/replay.png':'image/png',
  '/provenance/meta-adaptive-counterfactual-v1/result.json':'application/json; charset=utf-8',
  '/provenance/meta-adaptive-counterfactual-v1/manifest.json':'application/json; charset=utf-8',
  '/provenance/meta-adaptive-counterfactual-v1/final.png':'image/png',
  '/provenance/meta-obstacle-v2/result.json':'application/json; charset=utf-8',
  '/provenance/meta-obstacle-v2/manifest.json':'application/json; charset=utf-8',
  '/provenance/meta-obstacle-v2/keyboard.png':'image/png'
 };
 for(const [route,mime]of Object.entries(assets)){
  const response=await fetch(s.base+route);assert.equal(response.status,200,route);assert.equal(response.headers.get('content-type'),mime,route);
  const served=Buffer.from(await response.arrayBuffer());const committed=await readFile(new URL('../public'+route,import.meta.url));
  assert.equal(createHash('sha256').update(served).digest('hex'),createHash('sha256').update(committed).digest('hex'),route);
 }
 assert.equal((await fetch(s.base+'/provenance/unknown/result.json')).status,404);
});


test('held-out evaluation fixture is served without enabling it in the public API',async t=>{
 const s=await server(t);
 const fixture=await s.request('GET','/fixture/heldout');
 assert.equal(fixture.status,200);
 const html=await fixture.text();
 assert.match(html,/id="task"/);
 const attempt=await s.request('POST','/api/run');
 assert.equal(attempt.status,201);
});
