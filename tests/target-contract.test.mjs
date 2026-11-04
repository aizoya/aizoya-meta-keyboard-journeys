import test from 'node:test';
import assert from 'node:assert/strict';
import {validateJourneyConfig,sameTargetOrigin,buildTargetFailure} from '../target-contract.mjs';

const valid={schema_version:1,name:'customer-checkout',url:'http://127.0.0.1:3000/checkout',task:'Choose Blue and add it to the cart'};
test('customer CI target accepts an owned loopback application',()=>{
 const config=validateJourneyConfig(valid);assert.equal(config.url,'http://127.0.0.1:3000/checkout');assert.equal(sameTargetOrigin('http://127.0.0.1:3000/receipt',config),true);
});
test('customer CI target rejects remote, credentialed and extended configuration',()=>{
 for(const url of ['https://example.com/checkout','http://user:pass@localhost:3000/checkout','file:///tmp/app'])assert.throws(()=>validateJourneyConfig({...valid,url}));
 assert.throws(()=>validateJourneyConfig({...valid,selector:'body'}),/unknown_config_field/);
});
test('customer CI target validates task and schema bounds',()=>{
 assert.throws(()=>validateJourneyConfig({...valid,schema_version:2}),/unsupported_schema/);
 assert.throws(()=>validateJourneyConfig({...valid,task:'x'}),/invalid_task/);
 assert.throws(()=>validateJourneyConfig({...valid,name:'!'}),/invalid_name/);
});
test('customer CI target always creates a safe structured failure result',()=>{
 const target=validateJourneyConfig({...valid});
 const trace=[{index:0,action:null,state:{complete:false}},{index:1,action:{kind:'press',key:'Tab'},state:{complete:false},provider:{private:'drop'}}];
 const bounded=buildTargetFailure({message:'meta_incomplete',trace,target,requestsReserved:8,elapsedMs:1200});
 assert.equal(bounded.status,'needs_review');assert.equal(bounded.classification,'bounded_meta_incomplete');assert.equal(bounded.steps[1].provider,undefined);assert.deepEqual(bounded.actions,[{kind:'press',key:'Tab'}]);
 const crashed=buildTargetFailure({message:'private filesystem path',trace,target,requestsReserved:1,elapsedMs:20});
 assert.equal(crashed.status,'infrastructure_error');assert.equal(crashed.classification,'runner_failure');assert.doesNotMatch(JSON.stringify(crashed),/filesystem/);
});
