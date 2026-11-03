import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const isolated={...process.env,MODEL_API_KEY:'',PASSAGE_ENABLE_META:'0',PASSAGE_MAX_META_CALLS:'0'};
test('manual Meta smoke refuses missing configuration without a request',()=>{
 const r=spawnSync(process.execPath,['scripts/meta-smoke.mjs'],{env:isolated,encoding:'utf8'});
 assert.equal(r.status,2);assert.match(r.stderr,/Not run/);
});
test('configuration-only Meta inspection makes no request even with credentials configured',()=>{
 const code=`process.argv.push('--check');globalThis.fetch=()=>{throw Error('network must not run')};await import('./scripts/meta-smoke.mjs');`;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{env:{...isolated,MODEL_API_KEY:'test-placeholder-not-a-real-key',PASSAGE_ENABLE_META:'1',PASSAGE_MAX_META_CALLS:'1'},encoding:'utf8'});
 assert.equal(r.status,0);assert.equal(JSON.parse(r.stdout).ready,true);
});
test('Meta transport reserves the only request and refuses a second dispatch',()=>{
 const code=`let calls=0;globalThis.fetch=async()=>{calls++;return {ok:true,json:async()=>({model:'fake-test-only',choices:[{finish_reason:'stop',message:{content:JSON.stringify({kind:'press',key:'Tab'})}}]})}};const {metaAction}=await import('./meta.mjs');await metaAction({},'keyboard','test',[]);try{await metaAction({},'keyboard','test',[]);process.exitCode=1}catch(e){if(e.message!=='meta_request_allowance_exhausted')throw e}if(calls!==1)process.exitCode=1;`;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{env:{...isolated,MODEL_API_KEY:'test-placeholder-not-a-real-key',PASSAGE_ENABLE_META:'1',PASSAGE_MAX_META_CALLS:'1'},encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
});
test('manual Meta smoke suppresses arbitrary provider exception details',()=>{
 const code=`globalThis.fetch=async()=>{throw Error('sensitive-synthetic-provider-detail')};await import('./scripts/meta-smoke.mjs');`;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{env:{...isolated,MODEL_API_KEY:'test-placeholder-not-a-real-key',PASSAGE_ENABLE_META:'1',PASSAGE_MAX_META_CALLS:'1'},encoding:'utf8'});
 assert.equal(r.status,1);assert.doesNotMatch(r.stderr,/sensitive-synthetic-provider-detail|test-placeholder/);assert.equal(JSON.parse(r.stderr).retried,false);
});
