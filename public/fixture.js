const variant=location.pathname.split('/').pop();
const options=document.querySelector('#options');let selected=null;let sequence=0;
const trace=[]; const start=performance.now();
function record(type,extra={}){const e=document.activeElement;trace.push({sequence:++sequence,type,at_ms:Math.round(performance.now()-start),focus:e?.dataset.target||e?.id||e?.tagName,...extra});parent.postMessage({type:'fixture-event',variant,event:trace.at(-1)},location.origin);}
function select(color){selected=color;document.querySelector('#selection').textContent=`${color==='blue'?'Blue':'Sand'} selected`;document.querySelector('#finish').disabled=false;options.querySelectorAll('[data-target]').forEach(e=>{e.classList.toggle('selected',e.dataset.target===color);if(e.getAttribute('role')==='radio')e.setAttribute('aria-checked',String(e.dataset.target===color));});record('selection',{value:color});}
for(const color of ['sand','blue']){
 const el=document.createElement(variant==='fixed'?'button':'div');el.dataset.target=color;el.className='option '+color;el.textContent=color==='blue'?'Blue':'Sand';el.addEventListener('click',()=>select(color));
 if(variant==='fixed'){el.type='button';el.setAttribute('aria-pressed','false');el.addEventListener('click',()=>options.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===el))));}
 if(variant==='alternate'){el.setAttribute('role','radio');el.setAttribute('aria-checked','false');el.tabIndex=color==='sand'?0:-1;el.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const other=options.querySelector(`[data-target="${color==='blue'?'sand':'blue'}"]`);el.tabIndex=-1;other.tabIndex=0;other.focus();select(other.dataset.target);}if([' ','Enter'].includes(e.key)){e.preventDefault();select(color);}});}
 options.append(el);
}
if(variant==='alternate'){options.setAttribute('role','radiogroup');options.setAttribute('aria-label','Organizer color');}
document.querySelector('#hint').textContent=variant==='alternate'?'Tab to the color group. Use arrow keys to choose Blue, Tab to the add button, then Enter.':'Use Tab to move between controls and Enter or Space to activate a control.';
document.querySelector('#finish').addEventListener('click',()=>{const done=selected==='blue';const r=document.querySelector('#receipt');r.dataset.complete=String(done);r.textContent=done?'Blue organizer added. Practice task complete.':'Sand added. The task asks for Blue; choose again.';record('outcome',{complete:done});});
document.addEventListener('focusin',()=>record('focus'));
document.addEventListener('keydown',e=>record('key',{key:e.key,trusted:e.isTrusted}),true);
document.addEventListener('click',e=>record('click',{target:e.target.dataset?.target||e.target.tagName,trusted:e.isTrusted,activation:e.detail===0?'keyboard_or_programmatic':'pointer'}),true);
record('ready');
