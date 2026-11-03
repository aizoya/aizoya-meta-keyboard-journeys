import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(await readFile(path.join(root,'public/recorded/manifest.json'),'utf8'));
const images={};
for(const row of manifest.results)for(const lane of ['mouse','keyboard']){
 const name=`${row.variant}-${lane}.png`;
 images[name]='data:image/png;base64,'+(await readFile(path.join(root,'public/recorded',name))).toString('base64');
}
const original=await readFile(path.join(root,'public/index.html'),'utf8');
const start=original.indexOf('<details id="recorded-gallery"');
const end=original.indexOf('</details>',start)+10;
if(start<0||end<10)throw Error('Recorded gallery markup missing');
const gallery=original.slice(start,end).replace('<details id=','<details open id=');
const css=await readFile(path.join(root,'public/style.css'),'utf8');
const js=await readFile(path.join(root,'public/recorded.js'),'utf8');
const data=JSON.stringify({manifest,images}).replaceAll('<','\\u003c');
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>AIZOYA · Recorded browser preview</title><style>${css}main{max-width:1100px;padding-top:25px}.hero{padding:15px 0}.hero h1{font-size:48px}.intro{position:static!important;max-width:700px!important}.recorded-gallery{margin-bottom:50px}</style></head><body><main><header><p class="eyebrow">AIZOYA / RECORDED BROWSER PREVIEW</p><h1>Inspect the journey.</h1><p class="intro">Six verified practice-store recordings. This preview runs locally with no server, API key or live model call. It is an evidence gallery, not the full application.</p></header>${gallery}</main><script>globalThis.RECORDED_EXPORT=${data};</script><script>${js}\nrequestAnimationFrame(()=>document.getElementById('recorded-gallery').dispatchEvent(new Event('toggle')));</script></body></html>`;
const target=path.join(root,process.argv.includes('--deliverable')?'previews':'artifacts','AIZOYA_Recorded_Browser_Preview.html');
await mkdir(path.dirname(target),{recursive:true});await writeFile(target,html);console.log(target);
