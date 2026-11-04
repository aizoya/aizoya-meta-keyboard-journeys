import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {createApp} from '../server.mjs';
import {runComparison} from '../runner.mjs';
import {replaySource} from '../policy.mjs';
import {observeJourneyTarget} from '../target-contract.mjs';

// Real Chromium, scripted planner, owned fixtures. No Meta requests.
const app=createApp({port:8787});
const results=[];
await mkdir('artifacts',{recursive:true});
await new Promise(resolve=>app.listen(8787,'127.0.0.1',resolve));
try{
 for(const variant of ['broken','fixed','alternate','reordered','space-only','trap']){
  const result=await runComparison('http://127.0.0.1:8787',variant);
  assert.equal(result.mouse?.status,'observed',JSON.stringify(result.summary));
  assert.equal(result.mouse.completed,true);
  assert.equal(result.keyboard.status,'observed');
  assert.equal(result.keyboard.completed,!['broken','trap'].includes(variant));
  assert.equal(result.summary.status,['broken','trap'].includes(variant)?'needs_review':'completed_both');
  assert(result.keyboard.actions.every(action=>action.kind==='press'));
  assert.equal(result.ai_connected,false);
  const replay=await runComparison('http://127.0.0.1:8787',variant,'saved_actions',result);
  assert.equal(replay.replay?.consistent,true);
  for(const lane of ['mouse','keyboard']){
   const last=result[lane].trace.at(-1);
   await writeFile(`artifacts/${variant}-${lane}.png`,Buffer.from(last.screenshot,'base64'));
  }
  results.push({variant,summary:result.summary,mouse_completed:result.mouse.completed,keyboard_completed:result.keyboard.completed,keyboard_actions:result.keyboard.actions,replay:replay.replay});
  if(variant==='fixed')await writeFile('artifacts/export-fixed.spec.mjs',replaySource(result.keyboard.actions,variant,'keyboard'));
 }
 // Run the actual exported test against the same live fixture server.
 const exitCode=await new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test','--config=playwright.acceptance.config.mjs'],{stdio:'inherit'});
  child.on('error',reject);child.on('close',resolve);
 });
 assert.equal(exitCode,0,'Exported Playwright test must actually run and pass');
 await import('./export-recorded-preview.mjs');
 const {chromium}=createRequire(import.meta.url)('playwright');
 const browser=await chromium.launch({headless:true});
 try{
  const contractContext=await browser.newContext({viewport:{width:800,height:650}});
  try{
   const page=await contractContext.newPage();await page.goto('http://127.0.0.1:8787/fixture/fixed');
   let state=await observeJourneyTarget(page);assert.equal(state.complete,false);assert.deepEqual(state.controls.map(c=>c.target),['sand','blue','finish']);
   for(const key of ['Tab','Tab','Space','Tab','Enter'])await page.keyboard.press(key);
   state=await observeJourneyTarget(page);assert.equal(state.complete,true);assert.match(state.outcome,/task complete/i);
  }finally{await contractContext.close();}
  for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
   const context=await browser.newContext({viewport,acceptDownloads:true});
   try{
    const page=await context.newPage();
    await page.goto('http://127.0.0.1:8787');
    await page.waitForFunction(()=>!document.querySelector('#recorded-variant').disabled);
    assert.equal(await page.locator('#recorded-variant').inputValue(),'broken','Recorded examples preload without opening the gallery');
    let posts=0;const track=request=>{if(request.method()==='POST')posts++;};page.on('request',track);
    await page.locator('#recorded-gallery summary').click();
    for(const variant of ['broken','fixed','alternate','reordered','space-only','trap']){
     await page.locator('#recorded-variant').selectOption(variant);
     const expected=['broken','trap'].includes(variant)?'The keyboard attempt did not complete':'Both routes completed';
     assert.equal(await page.locator('#recorded-title').textContent(),expected);
     await page.waitForFunction(()=>['recorded-mouse','recorded-keyboard'].every(id=>document.getElementById(id).naturalWidth>0));
    }
    const recordingEvent=page.waitForEvent('download');await page.locator('#recorded-download').click();
    const recording=await recordingEvent;assert.equal(recording.suggestedFilename(),'recorded-trap.json');
    await recording.saveAs(`artifacts/recorded-download-${viewport.width}.json`);
    assert.equal(posts,0,'Viewing and downloading recordings must not start a comparison');
    page.off('request',track);await page.locator('#recorded-gallery summary').click();
    assert.equal(await page.locator('#variant').isVisible(),false,'Advanced options start collapsed');
    assert.equal(await page.locator('#store').isVisible(),false,'Manual practice starts collapsed');
    await page.locator('#run').click();
    await page.locator('#result-title').filter({hasText:'The keyboard attempt stopped'}).waitFor({timeout:60000});
    await page.locator('#try-fixed').click();

    await page.locator('#result-title').filter({hasText:'Both checkout attempts finished'}).waitFor({timeout:60000});
    assert.equal(await page.locator('#keyboard-status').textContent(),'Task completed');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'No horizontal page overflow');
    await page.locator('#technical-evidence summary').click();
    const downloadEvent=page.waitForEvent('download');
    await page.locator('#export-test').click();
    const download=await downloadEvent;
    assert.equal(download.suggestedFilename(),'keyboard-route.spec.mjs');
    await download.saveAs(`artifacts/ui-export-${viewport.width}.spec.mjs`);
    await page.locator('#replay').click();
    await page.locator('#replay-status').filter({hasText:'reproduced the same observed outcomes'}).waitFor({timeout:60000});
    // A failed replay must preserve the evidence already displayed.
    await page.route('**/api/replay',route=>route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:'session_run_limit'})}));
    await page.locator('#replay').click();
    await page.locator('#message').filter({hasText:'six-check limit'}).waitFor({timeout:10000});
    assert.equal(await page.locator('#result').isVisible(),true,'Failed replay must keep prior evidence visible');
    assert.equal(await page.locator('#keyboard-status').textContent(),'Task completed');
    assert.equal(await page.locator('#download').isVisible(),true,'Prior evidence remains downloadable');
    await page.unroute('**/api/replay');
    await page.screenshot({path:`artifacts/ui-${viewport.width}.png`,fullPage:true});
   }finally{await context.close();}
  }
  const offline=await browser.newContext({viewport:{width:390,height:844}});
  try{
   const page=await offline.newPage();let networkRequests=0;
   page.on('request',request=>{if(/^https?:/.test(request.url()))networkRequests++;});
   await page.goto(pathToFileURL(path.resolve('artifacts/AIZOYA_Recorded_Browser_Preview.html')).href);
   await page.waitForFunction(()=>!document.querySelector('#recorded-variant').disabled);
   await page.locator('#recorded-variant').selectOption('fixed');
   assert.equal(await page.locator('#recorded-title').textContent(),'Both routes completed');
   await page.waitForFunction(()=>document.getElementById('recorded-keyboard').naturalWidth>0);
   assert.equal(networkRequests,0,'Standalone preview must load without external network requests');
   await page.screenshot({path:'artifacts/offline-preview.png',fullPage:true});
  }finally{await offline.close();}
 }finally{await browser.close();}
 await writeFile('artifacts/browser-acceptance.json',JSON.stringify({planner:'scripted_fixture_no_AI',results,exported_test_passed:true},null,2));
 console.log('Real browser acceptance passed: six comparisons, six replays, exported test, and desktop/mobile-width UI compare-export-replay. No Meta inference.');
}finally{await new Promise(resolve=>app.close(resolve));}
