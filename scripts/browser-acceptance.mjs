import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {createApp} from '../server.mjs';
import {runComparison} from '../runner.mjs';
import {replaySource} from '../policy.mjs';

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
 const {chromium}=createRequire(import.meta.url)('playwright');
 const browser=await chromium.launch({headless:true});
 try{
  for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
   const context=await browser.newContext({viewport,acceptDownloads:true});
   try{
    const page=await context.newPage();
    await page.goto('http://127.0.0.1:8787');
    await page.locator('#variant').selectOption('fixed');
    await page.waitForFunction(()=>{const frame=document.querySelector('#store');return frame.contentDocument?.body.getBoundingClientRect().height<=frame.clientHeight+2;});
    await page.locator('#run').click();
    await page.locator('#result-title').filter({hasText:'Both routes completed'}).waitFor({timeout:60000});
    assert.equal(await page.locator('#keyboard-status').textContent(),'Task completed');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'No horizontal page overflow');
    const downloadEvent=page.waitForEvent('download');
    await page.locator('#export-test').click();
    const download=await downloadEvent;
    assert.equal(download.suggestedFilename(),'keyboard-route.spec.mjs');
    await download.saveAs(`artifacts/ui-export-${viewport.width}.spec.mjs`);
    await page.locator('#replay').click();
    await page.locator('#replay-status').filter({hasText:'reproduced the same observed outcomes'}).waitFor({timeout:60000});
    await page.screenshot({path:`artifacts/ui-${viewport.width}.png`,fullPage:true});
   }finally{await context.close();}
  }
 }finally{await browser.close();}
 await writeFile('artifacts/browser-acceptance.json',JSON.stringify({planner:'scripted_fixture_no_AI',results,exported_test_passed:true},null,2));
 console.log('Real browser acceptance passed: six comparisons, six replays, exported test, and desktop/mobile-width UI compare-export-replay. No Meta inference.');
}finally{await new Promise(resolve=>app.close(resolve));}
