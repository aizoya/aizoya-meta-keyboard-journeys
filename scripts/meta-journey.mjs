import {metaStatus} from '../meta.mjs';

const status=metaStatus();
const variant=process.env.META_JOURNEY_VARIANT||'fixed';
const allowedVariant=['fixed','heldout'].includes(variant);
const ready=status.configured&&status.enabled&&status.max_calls===8&&allowedVariant;
if(process.argv.includes('--check')){
 console.log(JSON.stringify({mode:'configuration_only_no_request',variant,ready,max_requests:8,max_output_tokens_per_request:300}));
}else if(!ready){
 console.error('Not run. Require an allowed variant, a server credential, PASSAGE_ENABLE_META=1 and PASSAGE_MAX_META_CALLS=8.');
 process.exitCode=2;
}else{
 const {mkdir,writeFile}=await import('node:fs/promises');
 const {createApp}=await import('../server.mjs');
 const {runLane}=await import('../runner.mjs');
 const {chromium}=await import('playwright');
 const app=createApp({port:8787});
 let browser,listening=false;
 try{
  await new Promise((resolve,reject)=>{app.once('error',reject);app.listen(8787,'127.0.0.1',resolve);});listening=true;
  browser=await chromium.launch({headless:true,timeout:10000});
  const lane=await runLane(browser,'http://127.0.0.1:8787',variant,'keyboard','meta');
  // Replay is action-only: it must not consume any more model requests.
  const beforeReplay=metaStatus().calls_reserved;
  const replay=lane.status==='observed'&&lane.completed
   ?await runLane(browser,'http://127.0.0.1:8787',variant,'keyboard','saved_actions',lane.actions):null;
  const replayMadeNoCalls=metaStatus().calls_reserved===beforeReplay;
  const passed=lane.status==='observed'&&lane.completed&&lane.trace.some(t=>t.provider)&&
   lane.actions.every(a=>a.kind==='press')&&replay?.status==='observed'&&replay.completed&&replayMadeNoCalls;
  const result={
   status:passed?'passed':'failed',
   scope:`one_owned_${variant}_fixture_keyboard_only`,
   evaluation:variant==='heldout'?'precommitted_heldout_v1':'known_fixed_fixture',
   mouse_comparison:'not_tested',other_variants:'not_tested',public_deployment:'AI remains disabled',
   requests_reserved:metaStatus().calls_reserved,max_requests:8,retried:false,
   keyboard_completed:lane.completed,runner_status:lane.status,
   error:lane.error?.startsWith('meta_')?lane.error:lane.status==='infrastructure_error'?'runner_failure':null,
   saved_action_replay_completed:replay?.completed||false,replay_made_no_model_calls:replayMadeNoCalls,
   actions:lane.actions,elapsed_ms:lane.elapsed_ms,
   steps:lane.trace.map(t=>({index:t.index,action:t.action,state:t.state}))
  };
  await mkdir('artifacts/meta-journey',{recursive:true});
  await writeFile('artifacts/meta-journey/result.json',JSON.stringify(result,null,2));
  for(const [name,run]of [['keyboard',lane],['replay',replay]]){
   const frame=run?.trace.at(-1)?.screenshot;
   if(frame)await writeFile('artifacts/meta-journey/'+name+'.png',Buffer.from(frame,'base64'));
  }
  console.log(JSON.stringify(result));
  if(!passed)process.exitCode=1;
 }catch{
  console.error(JSON.stringify({status:'infrastructure_error',requests_reserved:metaStatus().calls_reserved,retried:false}));
  process.exitCode=1;
 }finally{
  if(browser)await browser.close();
  if(listening)await new Promise(resolve=>app.close(resolve));
 }
}
