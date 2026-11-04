import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {validateJourneyConfig,sameTargetOrigin,observeJourneyTarget} from '../target-contract.mjs';
import {validateAction,KEYS} from '../policy.mjs';
import {metaAction,metaStatus} from '../meta.mjs';

const configPath=process.argv.find(a=>a.startsWith('--config='))?.slice(9)||'journey.config.json';
let target;
try{target=validateJourneyConfig(JSON.parse(await readFile(configPath,'utf8')));}catch(error){console.error(JSON.stringify({status:'configuration_error',error:error.message}));process.exit(2);}
const checkOnly=process.argv.includes('--check');
const provider=metaStatus();
const ready=provider.configured&&provider.enabled&&provider.max_calls===8;
if(checkOnly){
 console.log(JSON.stringify({status:'configuration_only_no_request',target:{name:target.name,url:target.url,task:target.task},contract:{controls:'[data-journey-target]',selected:'[data-journey-selected]',complete:'[data-journey-complete="true"]',outcome:'[data-journey-outcome]'},allowed_keys:[...KEYS],meta_ready:ready,max_requests:8}));
 process.exit(0);
}
if(!ready){console.error(JSON.stringify({status:'configuration_error',error:'meta_not_ready'}));process.exit(2);}

const {chromium}=await import('playwright');
let browser,context;const trace=[],started=Date.now();
try{
 browser=await chromium.launch({headless:true,timeout:10000});
 context=await browser.newContext({viewport:{width:1000,height:720},serviceWorkers:'block',acceptDownloads:false});
 await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(target.url).origin?route.continue():route.abort());
 const page=await context.newPage();page.on('dialog',d=>d.dismiss());page.on('popup',p=>p.close());
 await page.goto(target.url,{waitUntil:'networkidle',timeout:10000});
 await page.waitForSelector('[data-journey-target]',{timeout:5000});
 let state=await observeJourneyTarget(page);
 trace.push({index:0,action:null,state});
 for(let step=0;step<8&&!state.complete;step++){
  if(!sameTargetOrigin(page.url(),target))throw Error('navigation_blocked');
  const decision=await metaAction(state,'keyboard',target.task,trace.map(x=>({action:x.action,state:x.state})));
  validateAction(decision.action,'keyboard');
  if(decision.action.kind==='stop')break;
  await page.keyboard.press(decision.action.key);
  state=await observeJourneyTarget(page);
  trace.push({index:trace.length,action:decision.action,state,provider:decision.provider||null});
 }
 const result={schema_version:1,status:state.complete?'completed':'needs_review',scope:'customer_owned_local_target_keyboard_only',target:{name:target.name,url:target.url,task:target.task},requests_reserved:metaStatus().calls_reserved,max_requests:8,retried:false,keyboard_completed:state.complete,actions:trace.flatMap(x=>x.action?[x.action]:[]),elapsed_ms:Date.now()-started,steps:trace.map(({provider,...step})=>step),limitations:['local same-origin target only','keyboard lane only','bounded noncompletion is a review lead','not an accessibility certification']};
 await mkdir('artifacts/ci-target',{recursive:true});await writeFile('artifacts/ci-target/result.json',JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));if(!state.complete)process.exitCode=1;
}catch(error){
 const bounded=error.message==='meta_incomplete'&&trace.length>0;
 const result=bounded?{schema_version:1,status:'needs_review',classification:'bounded_meta_incomplete',scope:'customer_owned_local_target_keyboard_only',target:{name:target.name,url:target.url,task:target.task},requests_reserved:metaStatus().calls_reserved,max_requests:8,retried:false,keyboard_completed:false,actions:trace.flatMap(x=>x.action?[x.action]:[]),elapsed_ms:Date.now()-started,steps:trace.map(({provider,...step})=>step),limitations:['local same-origin target only','keyboard lane only','bounded noncompletion is a review lead','not an accessibility certification']}:{status:'infrastructure_error',error:String(error.message).startsWith('meta_')?error.message:'runner_failure',requests_reserved:metaStatus().calls_reserved,retried:false};
 if(bounded){await mkdir('artifacts/ci-target',{recursive:true});await writeFile('artifacts/ci-target/result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}else console.error(JSON.stringify(result));
 process.exitCode=1;
}
finally{if(context)await context.close();if(browser)await browser.close();}
