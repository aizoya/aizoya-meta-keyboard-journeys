import {metaAction,metaStatus} from '../meta.mjs';

// Transport smoke only: synthetic observation, one request, no browser verdict.
const s=metaStatus();
const ready=s.configured&&s.enabled&&s.max_calls===1;
if(process.argv.includes('--check')){
 console.log(JSON.stringify({mode:'configuration_only_no_request',configured:s.configured,enabled:s.enabled,one_request_allowance:s.max_calls===1,ready}));
}else if(!ready){
 console.error('Not run. Configure the server credential, explicitly enable Meta and set PASSAGE_MAX_META_CALLS=1.');
 process.exitCode=2;
}else{
 try{
  const decision=await metaAction({focus:{target:'sand',tag:'BUTTON',role:null,text:'Sand'},selected:'No color selected',complete:false,outcome:'',controls:[{target:'sand',tag:'BUTTON',role:null,tabIndex:0,disabled:false},{target:'blue',tag:'BUTTON',role:null,tabIndex:0,disabled:false},{target:'finish',tag:'BUTTON',role:null,tabIndex:0,disabled:false}]},'keyboard','Add the Blue organizer to the practice kit',[]);
  console.log(JSON.stringify({status:'valid_provider_action',scope:'synthetic_transport_smoke_only',action:decision.action,model:decision.provider.model||null,usage:decision.provider.usage,requests_reserved:metaStatus().calls_reserved,browser_task_completion:'not_tested'}));
 }catch(error){
  // Never log a raw provider body, key, headers or arbitrary exception text.
  const code=/^meta_(http_\d{3}|not_configured|request_allowance_exhausted|incomplete)$/.test(error.message)?error.message:'provider_or_action_validation_failed';
  console.error(JSON.stringify({status:'failed',code,requests_reserved:metaStatus().calls_reserved,retried:false}));
  process.exitCode=1;
 }
}
