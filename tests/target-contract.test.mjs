import test from 'node:test';
import assert from 'node:assert/strict';
import {validateJourneyConfig,sameTargetOrigin} from '../target-contract.mjs';

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
