export const VARIANTS = new Set(['broken','fixed','alternate','reordered','space-only','trap']);
export const KEYS = new Set(['Tab','Shift+Tab','Enter','Space','ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Escape']);
export function validateAction(action,mode){
  if(!action||typeof action!=='object'||Array.isArray(action))throw Error('invalid_action');
  if(action.kind==='press'&&Object.keys(action).sort().join(',')==='key,kind'&&KEYS.has(action.key))return action;
  if(mode==='mouse'&&action.kind==='click'&&Object.keys(action).sort().join(',')==='kind,target'&&['blue','sand','finish'].includes(action.target))return action;
  if(action.kind==='stop'&&Object.keys(action).length===1)return action;
  throw Error('action_not_allowed');
}
export function fixtureURL(origin,variant){
  if(!VARIANTS.has(variant))throw Error('invalid_variant');
  const u=new URL(origin);if(!['127.0.0.1','localhost'].includes(u.hostname)||u.protocol!=='http:')throw Error('local_origin_required');
  return `${u.origin}/fixture/${variant}`;
}
export function sameFixtureOrigin(url,origin){try{return new URL(url).origin===origin&&new URL(url).pathname.startsWith('/fixture/');}catch{return false;}}
export function summarize(mouse,keyboard){
  if(mouse.status==='infrastructure_error'||keyboard.status==='infrastructure_error')return {status:'infrastructure_error',title:'The runner could not finish',detail:'No accessibility finding was made.'};
  if(mouse.completed&&keyboard.completed)return {status:'completed_both',title:'Both routes completed',detail:'This task completed in both recorded runs. This is not an accessibility certification.'};
  if(mouse.completed&&!keyboard.completed)return {status:'needs_review',title:'The keyboard attempt did not complete',detail:'The mouse route completed. Review the recorded keyboard attempts; bounded search cannot prove that no keyboard route exists.'};
  return {status:'inconclusive',title:'The comparison is inconclusive',detail:'The mouse route did not establish the expected outcome.'};
}
export function replaySource(actions,variant,mode){
  if(!VARIANTS.has(variant))throw Error('invalid_variant');
  const checked=actions.map(a=>validateAction(a,mode));
  const lines=checked.filter(a=>a.kind!=='stop').map(a=>a.kind==='press'?`  await page.keyboard.press(${JSON.stringify(a.key)});`:`  await page.locator('[data-target="${a.target}"]').click();`);
  return `// Generated from observed actions; draft for review. No model-generated code is executed.\nimport { test, expect } from '@playwright/test';\ntest('recorded ${mode} route: ${variant}', async ({ page }) => {\n  await page.goto('http://127.0.0.1:8787/fixture/${variant}');\n${lines.join('\n')}\n  await expect(page.locator('#receipt')).toHaveAttribute('data-complete', 'true');\n});\n`;
}
