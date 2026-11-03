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
 const code=`let calls=0;globalThis.fetch=async()=>{calls++;return {ok:true,json:async()=>({model:'fake-test-only',choices:[{finish_reason:'stop',message:{content:JSON.stringify({action:'press:Tab'})}}]})}};const {metaAction}=await import('./meta.mjs');await metaAction({},'keyboard','test',[]);try{await metaAction({},'keyboard','test',[]);process.exitCode=1}catch(e){if(e.message!=='meta_request_allowance_exhausted')throw e}if(calls!==1)process.exitCode=1;`;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{env:{...isolated,MODEL_API_KEY:'test-placeholder-not-a-real-key',PASSAGE_ENABLE_META:'1',PASSAGE_MAX_META_CALLS:'1'},encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
});
test('manual Meta smoke suppresses arbitrary provider exception details',()=>{
 const code=`globalThis.fetch=async()=>{throw Error('sensitive-synthetic-provider-detail')};await import('./scripts/meta-smoke.mjs');`;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{env:{...isolated,MODEL_API_KEY:'test-placeholder-not-a-real-key',PASSAGE_ENABLE_META:'1',PASSAGE_MAX_META_CALLS:'1'},encoding:'utf8'});
 assert.equal(r.status,1);assert.doesNotMatch(r.stderr,/sensitive-synthetic-provider-detail|test-placeholder/);assert.equal(JSON.parse(r.stderr).retried,false);
});

test('Meta request uses minimal reasoning without increasing the token allowance',()=>{
 const code=`globalThis.fetch=async(url,options)=>{const body=JSON.parse(options.body);if(body.reasoning_effort!=='minimal'||body.max_tokens!==300)throw Error('request budget changed');return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'{"action":"stop"}'}}]})}};await (await import('./meta.mjs')).metaAction({},'keyboard','test',[]);`;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{env:{...isolated,MODEL_API_KEY:'test-placeholder-not-a-real-key',PASSAGE_ENABLE_META:'1',PASSAGE_MAX_META_CALLS:'1'},encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
});
test('incomplete smoke reports only safe metadata and never retries',()=>{
 const code=`let calls=0;globalThis.fetch=async()=>{if(++calls>1)throw Error('retried');return {ok:true,json:async()=>({secret:'private-body-marker',usage:{completion_tokens:300,completion_tokens_details:{reasoning_tokens:300},extra:'private-body-marker'},choices:[{finish_reason:'length',message:{content:'private-body-marker'}}]})}};await import('./scripts/meta-smoke.mjs');`;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{env:{...isolated,MODEL_API_KEY:'test-placeholder-not-a-real-key',PASSAGE_ENABLE_META:'1',PASSAGE_MAX_META_CALLS:'1'},encoding:'utf8'});
 assert.equal(r.status,1);assert.doesNotMatch(r.stderr,/private-body-marker|test-placeholder/);
 const result=JSON.parse(r.stderr);
 assert.equal(result.code,'meta_incomplete');assert.equal(result.retried,false);
 assert.deepEqual(result.diagnostics,{finish_reason:'length',has_visible_content:true,completion_tokens:300,reasoning_tokens:300});
});
test('untrusted provider metadata cannot leak through incomplete diagnostics',()=>{
 const code=`globalThis.fetch=async()=>({ok:true,json:async()=>({usage:{completion_tokens:'private-marker',completion_tokens_details:{reasoning_tokens:-1}},choices:[{finish_reason:'private-marker',message:{}}]})});await import('./scripts/meta-smoke.mjs');`;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{env:{...isolated,MODEL_API_KEY:'test-placeholder-not-a-real-key',PASSAGE_ENABLE_META:'1',PASSAGE_MAX_META_CALLS:'1'},encoding:'utf8'});
 assert.equal(r.status,1);assert.doesNotMatch(r.stderr,/private-marker/);
 assert.deepEqual(JSON.parse(r.stderr).diagnostics,{finish_reason:'unknown',has_visible_content:false,completion_tokens:null,reasoning_tokens:null});
});

for(const [label,response,expected] of [
 ['network failure',null,'meta_network_error'],
 ['invalid response JSON',{ok:true,json:async()=>{throw Error('private-provider-text')}},'meta_response_json_invalid'],
 ['null response',{ok:true,json:async()=>null},'meta_response_shape_invalid'],
 ['invalid action JSON',{ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'private-provider-text'}}]})},'meta_action_json_invalid'],
 ['disallowed keyboard click',{ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'{"kind":"click","target":"blue"}'}}]})},'meta_action_not_allowed']
]){
 test('smoke distinguishes '+label+' without exposing provider content',()=>{
  const responseCode=response===null?"throw Error('private-provider-text')":'return '+(
   label==='invalid response JSON'?"{ok:true,json:async()=>{throw Error('private-provider-text')}}":
   label==='null response'?"{ok:true,json:async()=>null}":
   label==='invalid action JSON'?`{ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'private-provider-text'}}]})}`:
   `{ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'{"kind":"click","target":"blue"}'}}]})}`
  );
  const code=`let calls=0;globalThis.fetch=async()=>{if(++calls>1)throw Error('retry');${responseCode}};await import('./scripts/meta-smoke.mjs');`;
  const r=spawnSync(process.execPath,['--input-type=module','-e',code],{env:{...isolated,MODEL_API_KEY:'test-placeholder-not-a-real-key',PASSAGE_ENABLE_META:'1',PASSAGE_MAX_META_CALLS:'1'},encoding:'utf8'});
  assert.equal(r.status,1);assert.doesNotMatch(r.stderr,/private-provider-text|test-placeholder/);
  assert.equal(JSON.parse(r.stderr).code,expected);assert.equal(JSON.parse(r.stderr).requests_reserved,1);
 });
}

test('every advertised action decodes to a permitted executor action in its mode',()=>{
 const code=`import assert from 'node:assert/strict';import {validateAction} from './policy.mjs';const {metaAction}=await import('./meta.mjs');let next;globalThis.fetch=async(url,options)=>{const body=JSON.parse(options.body);assert.equal(body.response_format.json_schema.strict,true);assert.ok(body.response_format.json_schema.schema.properties.action.enum.includes(next));return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({action:next})}}]})}};for(const mode of ['keyboard','mouse'])for(const value of ['press:Tab','press:Shift+Tab','press:Enter','press:Space','press:ArrowRight','press:ArrowLeft','press:ArrowDown','press:ArrowUp','press:Escape','stop',...(mode==='mouse'?['click:blue','click:sand','click:finish']:[])]){next=value;const r=await metaAction({},mode,'test',[]);assert.deepEqual(validateAction(r.action,mode),r.action);if(mode==='keyboard')assert.notEqual(r.action.kind,'click');}`;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{env:{...isolated,MODEL_API_KEY:'test-placeholder-not-a-real-key',PASSAGE_ENABLE_META:'1',PASSAGE_MAX_META_CALLS:'30'},encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
});
test('wire decoder rejects extra fields, unknown commands and keyboard clicks',()=>{
 const code=`import assert from 'node:assert/strict';const {metaAction}=await import('./meta.mjs');let value;globalThis.fetch=async()=>({ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify(value)}}]})});for(value of [{action:'click:blue'},{action:'press:Tab',target:'blue'},{action:'press:Delete'},{action:'eval:code'},{kind:'press',key:'Tab'},null,[],{action:'stop',explanation:'ignored?'}])await assert.rejects(metaAction({},'keyboard','test',[]),{message:'meta_action_not_allowed'});`;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{env:{...isolated,MODEL_API_KEY:'test-placeholder-not-a-real-key',PASSAGE_ENABLE_META:'1',PASSAGE_MAX_META_CALLS:'30'},encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
});
