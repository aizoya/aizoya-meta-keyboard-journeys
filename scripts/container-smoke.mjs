import assert from 'node:assert/strict';
const base='http://127.0.0.1:8787';
let ready=false;
for(let i=0;i<30;i++){try{const r=await fetch(base+'/api/status');if(r.ok){const status=await r.json();assert.equal(status.meta.enabled,false);ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,1000));}
assert(ready,'Container did not become ready');
const response=await fetch(base+'/api/run',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({variant:'fixed',planner:'fixture_replay'})});
assert.equal(response.status,201);
const cookie=response.headers.get('set-cookie').split(';')[0];
const run=await response.json();
assert.equal(run.summary.status,'completed_both',JSON.stringify(run.summary));
assert.equal(run.ai_connected,false);
const replay=await fetch(base+'/api/replay',{method:'POST',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({id:run.id})});
assert.equal(replay.status,201);
assert.equal((await replay.json()).replay.consistent,true);
const exported=await fetch(base+'/api/runs/'+run.id+'/test',{headers:{Cookie:cookie}});
assert.equal(exported.status,200);assert((await exported.text()).includes(base+'/fixture/fixed'));
console.log('Container verified: real Chromium comparison, same-instance replay and export. No Meta calls. Cross-instance persistence remains unverified.');
