const variant=location.pathname.split('/').pop();
const options=document.querySelector('#options');let selected=null;let sequence=0;
const trace=[];const start=performance.now();
const heldout=variant==='heldout';
const adaptive=variant==='adaptive';
const choices=heldout
 ?[{value:'ocean',label:'Ocean',target:'option-a',style:'blue'},{value:'dune',label:'Dune',target:'option-b',style:'sand'}]
 :(variant==='reordered'
   ?[{value:'blue',label:'Blue',target:'blue',style:'blue'},{value:'sand',label:'Sand',target:'sand',style:'sand'}]
   :[{value:'sand',label:'Sand',target:'sand',style:'sand'},{value:'blue',label:'Blue',target:'blue',style:'blue'}]);
const desired=heldout?'ocean':'blue';
if(heldout||adaptive){
 document.querySelector('#task').innerHTML='<strong>Your task</strong><br>Choose Ocean, then place it in the demo kit.';
 document.querySelector('#option-legend').textContent='Choose a finish';
 document.querySelector('#finish').textContent='Place in demo kit';
 document.querySelector('#selection').textContent='No finish selected';
 document.querySelector('#receipt').textContent='Your demo kit is empty.';
}
function record(type,extra={}){const e=document.activeElement;trace.push({sequence:++sequence,type,at_ms:Math.round(performance.now()-start),focus:e?.dataset.target||e?.id||e?.tagName,...extra});parent.postMessage({type:'fixture-event',variant,event:trace.at(-1)},location.origin);}
let unavailable=null;
if(adaptive){
 document.querySelector('#task').innerHTML='<strong>Your task</strong><br>Complete the inventory check. Select a finish; if inventory changes, choose the remaining available finish, then place it in the demo kit.';
 document.querySelector('#option-legend').textContent='Choose an available finish';
 document.querySelector('#finish').textContent='Place in demo kit';
 document.querySelector('#selection').textContent='Both finishes are currently available.';
 document.querySelector('#receipt').textContent='Your demo kit is empty.';
}
function select(value){
 const choice=choices.find(c=>c.value===value);
 if(adaptive&&unavailable===null){
  unavailable=value;selected=null;
  const other=choices.find(c=>c.value!==value);
  const blocked=options.querySelector(`[data-value="${value}"]`);blocked.disabled=true;blocked.classList.remove('selected');
  document.querySelector('#selection').textContent=`${choice.label} became unavailable after the inventory update. Choose ${other.label}, the remaining available finish.`;
  document.querySelector('#finish').disabled=true;record('inventory_update',{unavailable:value,remaining:other.value});return;
 }
 if(adaptive&&value===unavailable)return;
 selected=value;document.querySelector('#selection').textContent=`${choice.label} selected and available`;document.querySelector('#finish').disabled=false;options.querySelectorAll('[data-target]').forEach(e=>{const active=e.dataset.value===value;e.classList.toggle('selected',active);if(e.getAttribute('role')==='radio')e.setAttribute('aria-checked',String(active));});record('selection',{value});
}
for(const choice of choices){
 const el=document.createElement(['fixed','reordered','trap','heldout','adaptive'].includes(variant)?'button':'div');
 el.dataset.target=choice.target;el.dataset.journeyTarget=choice.target;el.dataset.value=choice.value;el.className='option '+choice.style;el.textContent=choice.label;el.addEventListener('click',()=>select(choice.value));
 if(['fixed','reordered','trap','heldout','adaptive'].includes(variant)){el.type='button';el.setAttribute('aria-pressed','false');el.addEventListener('click',()=>options.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===el))));}
 if(variant==='alternate'){el.setAttribute('role','radio');el.setAttribute('aria-checked','false');el.tabIndex=choice.value==='sand'?0:-1;el.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const other=options.querySelector(`[data-value="${choice.value==='blue'?'sand':'blue'}"]`);el.tabIndex=-1;other.tabIndex=0;other.focus();select(other.dataset.value);}if([' ','Enter'].includes(e.key)){e.preventDefault();select(choice.value);}});}
 if(variant==='space-only'){el.setAttribute('role','button');el.tabIndex=0;el.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();select(choice.value);}});}
 options.append(el);
}
if(variant==='trap'){options.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const buttons=[...options.querySelectorAll('button')];const next=buttons[(buttons.indexOf(document.activeElement)+1)%buttons.length];next.focus();}});}
if(variant==='alternate'){options.setAttribute('role','radiogroup');options.setAttribute('aria-label','Organizer color');}
document.querySelector('#hint').textContent=heldout?'Use only the keyboard. Move through the finish choices, choose Ocean, then place it in the demo kit.':adaptive?'Use the keyboard. Inventory changes after the first selection; read the updated status and recover using the remaining enabled finish.':variant==='alternate'?'Tab to the color group. Use arrow keys to choose Blue, Tab to the add button, then Enter.':'Use Tab to move between controls and Enter or Space to activate a control.';
document.querySelector('#finish').addEventListener('click',()=>{const done=adaptive?Boolean(selected&&selected!==unavailable):selected===desired;const r=document.querySelector('#receipt');r.dataset.complete=String(done);r.dataset.journeyComplete=String(done);r.textContent=adaptive?(done?`${choices.find(c=>c.value===selected).label} finish placed after the inventory change. Demo task complete.`:'Choose the remaining available finish before placing it.'):(heldout?(done?'Ocean finish placed. Demo task complete.':'Dune placed. The task asks for Ocean; choose again.'):(done?'Blue organizer added. Practice task complete.':'Sand added. The task asks for Blue; choose again.'));record('outcome',{complete:done});});
document.addEventListener('focusin',()=>record('focus'));
document.addEventListener('keydown',e=>record('key',{key:e.key,trusted:e.isTrusted}),true);
document.addEventListener('click',e=>record('click',{target:e.target.dataset?.target||e.target.tagName,trusted:e.isTrusted,activation:e.detail===0?'keyboard_or_programmatic':'pointer'}),true);
record('ready');
function reportSize(){parent.postMessage({type:'fixture-size',variant,height:Math.ceil(document.body.getBoundingClientRect().height)},location.origin);}
new ResizeObserver(reportSize).observe(document.body);
window.addEventListener('load',reportSize);
