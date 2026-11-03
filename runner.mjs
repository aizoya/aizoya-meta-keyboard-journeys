import {createRequire} from 'node:module';
import {validateAction,fixtureURL,sameFixtureOrigin,summarize} from './policy.mjs';
import {metaAction} from './meta.mjs';
const require=createRequire(import.meta.url);
export async function observe(page){return page.evaluate(()=>{
 const e=document.activeElement;
 return {focus:{target:e?.dataset.target||null,tag:e?.tagName||null,role:e?.getAttribute('role')||null,text:(e?.textContent||'').slice(0,100)},selected:document.querySelector('#selection')?.textContent,complete:document.querySelector('#receipt')?.dataset.complete==='true',outcome:document.querySelector('#receipt')?.textContent,controls:[...document.querySelectorAll('[data-target]')].map(n=>({target:n.dataset.target,tag:n.tagName,role:n.getAttribute('role'),tabIndex:n.tabIndex,disabled:Boolean(n.disabled)}))};
 });}
export function fixtureAction(observation,mode,step){
 // Explicit fixture replay, not an AI planner or held-out evaluation.
 if(observation.complete)return {kind:'stop'};
 if(mode==='mouse')return {kind:'click',target:step===0?'blue':'finish'};
 if(observation.focus.target==='blue'&&!observation.selected?.startsWith('Blue'))return {kind:'press',key:'Space'};
 if(observation.focus.role==='radio'&&observation.focus.target==='sand')return {kind:'press',key:'ArrowRight'};
 if(observation.focus.target==='finish'&&observation.selected?.startsWith('Blue'))return {kind:'press',key:'Enter'};
 return {kind:'press',key:'Tab'};
}
export async function execute(page,action,mode){
 validateAction(action,mode);
 if(action.kind==='press')await page.keyboard.press(action.key);
 else if(action.kind==='click')await page.locator(`[data-target="${action.target}"]`).click({timeout:1500});
}
export async function runLane(browser,origin,variant,mode,planner='fixture_replay',actions=null){
 const context=await browser.newContext({viewport:{width:800,height:650},serviceWorkers:'block',acceptDownloads:false});
 const trace=[];let page;const started=Date.now();
 try{
  await context.route('**/*',route=>{const u=new URL(route.request().url());return u.origin===origin&&['/fixture/','/fixture.'].some(p=>u.pathname.startsWith(p))?route.continue():route.abort();});
  page=await context.newPage();page.on('dialog',d=>d.dismiss());page.on('popup',p=>p.close());
  await page.goto(fixtureURL(origin,variant),{waitUntil:'networkidle',timeout:8000});
  await page.waitForSelector('[data-target="blue"]');
  let state=await observe(page);
  trace.push({index:0,action:null,state,screenshot:(await page.screenshot({type:'png'})).toString('base64')});
  const limit=actions?actions.length:14;
  for(let step=0;step<limit&&!state.complete;step++){
   if(Date.now()-started>45000)throw Error('run_timeout');
   if(!sameFixtureOrigin(page.url(),origin))throw Error('navigation_blocked');
   const decision=actions?{action:actions[step]}:planner==='meta'?await metaAction(state,mode,'Add the Blue organizer to the practice kit',trace.map(x=>({action:x.action,state:x.state}))):{action:fixtureAction(state,mode,step)};
   validateAction(decision.action,mode);if(decision.action.kind==='stop')break;
   await execute(page,decision.action,mode);state=await observe(page);
   trace.push({index:trace.length,action:decision.action,state,provider:decision.provider||null,screenshot:(await page.screenshot({type:'png'})).toString('base64')});
  }
  return {mode,planner,variant,status:'observed',completed:state.complete,elapsed_ms:Date.now()-started,trace,actions:trace.flatMap(t=>t.action?[t.action]:[]),last_state:state};
 }catch(error){return {mode,planner,variant,status:'infrastructure_error',completed:false,error:String(error.message).startsWith('meta_')?error.message:'runner_failure',elapsed_ms:Date.now()-started,trace,actions:trace.flatMap(t=>t.action?[t.action]:[])};}
 finally{await context.close();}
}
export async function runComparison(origin,variant,planner='fixture_replay',prior=null){
 let browser;
 try{
  const {chromium}=require('playwright');
  browser=await chromium.launch({headless:true,timeout:10000});
  const mouse=await runLane(browser,origin,variant,'mouse',planner,prior?.mouse.actions);
  const keyboard=await runLane(browser,origin,variant,'keyboard',planner,prior?.keyboard.actions);
  const result={created_at:new Date().toISOString(),variant,planner,mouse,keyboard,summary:summarize(mouse,keyboard),scope:'owned_fixture_only',ai_connected:planner==='meta'&&[...mouse.trace,...keyboard.trace].some(t=>t.provider)};
  if(prior)result.replay={source_id:prior.id,consistent:mouse.status==='observed'&&keyboard.status==='observed'&&mouse.completed===prior.mouse.completed&&keyboard.completed===prior.keyboard.completed,meaning:'Same observed outcome after replaying the saved actions, not proof of universal accessibility.'};
  return result;
 }catch{ return {created_at:new Date().toISOString(),variant,planner,scope:'owned_fixture_only',ai_connected:false,summary:{status:'infrastructure_error',title:'Browser runner unavailable',detail:'Install the pinned Playwright browser in the application runtime. You can still try the practice store manually. No comparison result was produced.'}}; }
 finally{if(browser)await browser.close();}
}
