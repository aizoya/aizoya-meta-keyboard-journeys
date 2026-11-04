const LOOPBACK=new Set(['127.0.0.1','localhost','::1']);

export function validateJourneyConfig(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('invalid_config');
 const allowed=['schema_version','name','url','task'];
 if(Object.keys(input).some(k=>!allowed.includes(k)))throw Error('unknown_config_field');
 if(input.schema_version!==1)throw Error('unsupported_schema');
 if(typeof input.name!=='string'||!/^[-a-z0-9_ ]{3,60}$/i.test(input.name))throw Error('invalid_name');
 if(typeof input.task!=='string'||input.task.length<5||input.task.length>240)throw Error('invalid_task');
 const url=new URL(input.url);
 if(url.protocol!=='http:'||!LOOPBACK.has(url.hostname)||url.username||url.password||url.hash)throw Error('local_target_required');
 return {schema_version:1,name:input.name,url:url.href,task:input.task};
}

export function sameTargetOrigin(value,target){
 try{return new URL(value).origin===new URL(target.url).origin;}catch{return false;}
}

// Customer contract: add these data attributes to controls and deterministic outcome UI.
export async function observeJourneyTarget(page){
 return page.evaluate(()=>{
  const active=document.activeElement;
  const complete=document.querySelector('[data-journey-complete]');
  const selected=document.querySelector('[data-journey-selected]');
  const outcome=document.querySelector('[data-journey-outcome]')||complete;
  return {
   focus:{target:active?.getAttribute('data-journey-target')||null,tag:active?.tagName||null,role:active?.getAttribute('role')||null,text:(active?.textContent||'').trim().slice(0,100)},
   selected:selected?.textContent?.trim()||null,
   complete:complete?.getAttribute('data-journey-complete')==='true',
   outcome:outcome?.textContent?.trim().slice(0,200)||null,
   controls:[...document.querySelectorAll('[data-journey-target]')].slice(0,40).map(node=>({target:node.getAttribute('data-journey-target'),tag:node.tagName,role:node.getAttribute('role'),tabIndex:node.tabIndex,disabled:Boolean(node.disabled)}))
  };
 });
}
