import test from 'node:test';
import assert from 'node:assert/strict';
import {request as httpRequest} from 'node:http';
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
