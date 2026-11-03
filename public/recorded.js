const byId=id=>document.getElementById(id);
const labels={broken:'Original control',fixed:'Corrected control',alternate:'Arrow-key control',reordered:'Different tab order','space-only':'Space-key control',trap:'Focus-trap control'};
let manifest,current,started=false;
function show(){
 const row=manifest.results.find(r=>r.variant===byId('recorded-variant').value);
 if(!row||!Object.hasOwn(labels,row.variant))return;
 current=row;
 byId('recorded-title').textContent=row.summary.title;
 byId('recorded-detail').textContent=row.summary.detail;
 for(const lane of ['mouse','keyboard']){
  byId(`recorded-${lane}-status`).textContent=row[`${lane}_completed`]?'Task completed':'Attempt not completed';
  byId(`recorded-${lane}`).src=globalThis.RECORDED_EXPORT?.images[`${row.variant}-${lane}.png`]||`/recorded/${row.variant}-${lane}.png`;
 }
 byId('recorded-actions').textContent='Recorded keyboard actions: '+row.keyboard_actions.map(a=>a.key).join(' → ');
 byId('recorded-replay').textContent=row.replay.consistent?'Saved actions reproduced the same outcomes in the recorded verification. No replay is being started now.':'The recording did not establish a consistent replay.';
 byId('recorded-provenance').textContent=`Archived ${new Date(manifest.archived_at).toLocaleString()} · source commit ${manifest.source_commit.slice(0,7)} · run ${manifest.source_run_id}.`;
 byId('recorded-source').href=`https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/${manifest.source_run_id}`;
 byId('recorded-result').hidden=false;
}
async function loadRecorded(){
 if(started)return;started=true;
 try{
  if(globalThis.RECORDED_EXPORT){manifest=globalThis.RECORDED_EXPORT.manifest;}else{const response=await fetch('/recorded/manifest.json');if(!response.ok)throw Error();manifest=await response.json();}
  if(manifest.is_live!==false||manifest.ai_connected!==false||!Number.isSafeInteger(manifest.source_run_id)||!/^[a-f0-9]{40}$/.test(manifest.source_commit)||!Array.isArray(manifest.results)||manifest.results.length!==6)throw Error();
  const select=byId('recorded-variant');select.replaceChildren();
  for(const row of manifest.results){if(!Object.hasOwn(labels,row.variant))throw Error();const option=document.createElement('option');option.value=row.variant;option.textContent=labels[row.variant];select.append(option);}
  select.disabled=false;show();
 }catch{started=false;byId('recorded-message').textContent='Recorded examples are unavailable. You can still try the practice store below.';}
}
byId('recorded-gallery').addEventListener('toggle',()=>{if(byId('recorded-gallery').open)loadRecorded();});
loadRecorded();
byId('recorded-variant').addEventListener('change',show);
byId('recorded-download').addEventListener('click',()=>{
 if(!current)return;
 const data={kind:'recorded_scripted_example',is_live:false,ai_connected:false,source_commit:manifest.source_commit,source_run_id:manifest.source_run_id,archived_at:manifest.archived_at,source_artifact_sha256:manifest.artifact_sha256,result:current,image_sha256:manifest.image_sha256};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download=`recorded-${current.variant}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
