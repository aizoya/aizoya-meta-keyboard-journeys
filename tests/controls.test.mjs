import test from 'node:test';import assert from 'node:assert/strict';
import {validateAction,fixtureURL,summarize,replaySource} from '../policy.mjs';
import {fixtureAction} from '../runner.mjs';
import {createApp} from '../server.mjs';
test('keyboard executor rejects every pointer, fill, focus and script escape',()=>{
 for(const a of [{kind:'click',target:'blue'},{kind:'fill',text:'blue'},{kind:'focus',target:'blue'},{kind:'evaluate',code:'document.body.click()'},{kind:'press',key:'Control+L'},{kind:'press',key:'Tab',target:'blue'}])assert.throws(()=>validateAction(a,'keyboard'));
 assert.deepEqual(validateAction({kind:'press',key:'ArrowRight'},'keyboard'),{kind:'press',key:'ArrowRight'});
});
test('pointer targets and replay exports cannot carry selectors or code',()=>{
 for(const target of ['#blue',`blue"]');throw new Error("x")//`,'https://example.com']){
  assert.throws(()=>validateAction({kind:'click',target},'mouse'));
  assert.throws(()=>replaySource([{kind:'click',target}],'fixed','mouse'));
 }
 assert.match(replaySource([{kind:'press',key:'Tab'}],'broken','keyboard'),/toHaveAttribute\('data-complete', 'true'\)/);
});
test('fixture entry restricts origins and variants',()=>{
 assert.equal(fixtureURL('http://127.0.0.1:8787','fixed'),'http://127.0.0.1:8787/fixture/fixed');
 for(const origin of ['http://example.com','file:///tmp/x','https://localhost'])assert.throws(()=>fixtureURL(origin,'fixed'));
 assert.throws(()=>fixtureURL('http://localhost:8787','../../secret'));
});
test('failed bounded search remains a review lead and infrastructure failure stays separate',()=>{
 const good={status:'observed',completed:true},bad={status:'observed',completed:false};
 assert.equal(summarize(good,bad).status,'needs_review');assert.match(summarize(good,bad).detail,/cannot prove/);
 assert.equal(summarize(good,{status:'infrastructure_error'}).status,'infrastructure_error');
 assert.equal(summarize(bad,bad).status,'inconclusive');assert.equal(summarize(good,good).status,'completed_both');
});
test('fixture replay can explore the valid arrow-key alternative without clicking',()=>{
 assert.deepEqual(fixtureAction({focus:{target:'sand',role:'radio'},selected:'No color selected'},'keyboard',0),{kind:'press',key:'ArrowRight'});
 assert.deepEqual(fixtureAction({focus:{target:'finish'},selected:'Blue selected'},'keyboard',3),{kind:'press',key:'Enter'});
});
async function harness(t,run){const app=createApp({port:0,run});await new Promise(r=>app.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.close(r)));const base=`http://127.0.0.1:${app.address().port}`;
 return async(method,p,body,cookie,origin=null)=>fetch(base+p,{method,headers:{Origin:origin||base,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});}
const fake=async(_origin,variant,planner)=>({variant,planner,keyboard:{actions:[{kind:'press',key:'Tab'}],trace:[]},summary:{status:'needs_review'}});
test('actual HTTP: run records require the session that created them',async t=>{
 const call=await harness(t,fake);const a=await call('POST','/api/run',{variant:'broken',planner:'fixture_replay'});assert.equal(a.status,201);const cookie=a.headers.get('set-cookie').split(';')[0];const record=await a.json();
 assert.equal((await call('GET',`/api/runs/${record.id}`,null,cookie)).status,200);
 assert.equal((await call('GET',`/api/runs/${record.id}`)).status,404);
 assert.equal((await call('POST','/api/replay',{id:record.id})).status,404);
 assert.equal((await call('GET',`/api/runs/${record.id}/test`,null,cookie)).status,200);
});
test('actual HTTP: cross-origin execution is rejected before the runner',async t=>{
 let calls=0;const call=await harness(t,async()=>{calls++;return {};});
 assert.equal((await call('POST','/api/run',{variant:'fixed',planner:'fixture_replay'},null,'https://attacker.example')).status,403);assert.equal(calls,0);
});
test('actual HTTP: unconfigured Meta never silently becomes a fixture replay',async t=>{
 let calls=0;const call=await harness(t,async()=>{calls++;return {};});
 const res=await call('POST','/api/run',{variant:'fixed',planner:'meta'});assert.equal(res.status,409);assert.equal((await res.json()).error,'meta_not_configured');assert.equal(calls,0);
});
test('actual HTTP: arbitrary fixture or planner is rejected',async t=>{
 let calls=0;const call=await harness(t,async()=>{calls++;return {};});
 for(const v of [{variant:'https://example.com',planner:'fixture_replay'},{variant:'fixed',planner:'saved_actions'},{variant:'fixed',planner:'unknown'}])assert.equal((await call('POST','/api/run',v)).status,422);
 assert.equal(calls,0);
});
test('actual HTTP: backend exception is not a completed run',async t=>{
 const call=await harness(t,async()=>{throw Error('private failure detail');});const res=await call('POST','/api/run',{variant:'fixed',planner:'fixture_replay'});assert.equal(res.status,503);const body=await res.json();assert.equal(body.error,'runner_failure');assert.equal(body.id,undefined);
});


test('internal runner can open heldout while public variant set remains unchanged',async()=>{
 const {VARIANTS,OWNED_FIXTURES,fixtureURL}=await import('../policy.mjs');
 assert.equal(VARIANTS.has('heldout'),false);
 assert.equal(OWNED_FIXTURES.has('heldout'),true);
 assert.equal(fixtureURL('http://127.0.0.1:8787','heldout'),'http://127.0.0.1:8787/fixture/heldout');
});
