import http from 'node:http';import {readFile} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {randomBytes,randomUUID} from 'node:crypto';
import {VARIANTS,replaySource,exportOrigin} from './policy.mjs';import {runComparison} from './runner.mjs';import {metaStatus} from './meta.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
export function createApp({port=8787,hostname='127.0.0.1',run=runComparison,publicOrigin=process.env.PUBLIC_ORIGIN||null,readAsset=readFile}={}){
 const configuredOrigins=[publicOrigin,...(process.env.VERCEL==='1'&&process.env.VERCEL_URL?[`https://${process.env.VERCEL_URL}`]:[])].filter(Boolean);
 const externalOrigins=configuredOrigins.map(value=>new URL(exportOrigin(value)));
 if(externalOrigins.some(value=>value.protocol!=='https:'))throw Error('public_origin_requires_https');
 const sessions=new Map();let active=0;
 const app=http.createServer(async(req,res)=>{
  const actualPort=port||app.address()?.port;const host=req.headers.host;const allowed=new Set([`localhost:${actualPort}`,`127.0.0.1:${actualPort}`,...externalOrigins.map(value=>value.host)]);
  const isExternal=externalOrigins.find(value=>value.host===host);const requestOrigin=isExternal?isExternal.origin:`http://${host}`;
  const reply=(code,data,mime='application/json')=>{const bytes=mime==='application/json'?Buffer.from(JSON.stringify(data)):Buffer.from(data);res.writeHead(code,{'Content-Type':mime,'Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'"});res.end(bytes);};
  try{
  if(!allowed.has(host))return reply(403,{error:'untrusted_host'});
  const url=new URL(req.url,`http://${host}`);const now=Date.now();
  // Static owned fixtures need no session; runner contexts must not consume
  // the limited session pool intended for saved comparisons.
  if(req.method==='GET'){
   const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css','/fixture.js':'fixture.js','/fixture.css':'fixture.css','/recorded.js':'recorded.js','/recorded/manifest.json':'recorded/manifest.json',
    '/evaluation/heldout-v3-plan.json':'evaluation/heldout-v3-plan.json','/evaluation/obstacle-v2-plan.json':'evaluation/obstacle-v2-plan.json',
    '/provenance/meta-heldout-v3/result.json':'provenance/meta-heldout-v3/result.json','/provenance/meta-heldout-v3/manifest.json':'provenance/meta-heldout-v3/manifest.json','/provenance/meta-heldout-v3/keyboard.png':'provenance/meta-heldout-v3/keyboard.png','/provenance/meta-heldout-v3/replay.png':'provenance/meta-heldout-v3/replay.png',
    '/provenance/meta-obstacle-v2/result.json':'provenance/meta-obstacle-v2/result.json','/provenance/meta-obstacle-v2/manifest.json':'provenance/meta-obstacle-v2/manifest.json','/provenance/meta-obstacle-v2/keyboard.png':'provenance/meta-obstacle-v2/keyboard.png'};
   const recordedImage=/^\/recorded\/(broken|fixed|alternate|reordered|space-only|trap)-(mouse|keyboard)\.png$/.test(url.pathname);
   if(files[url.pathname]||recordedImage||/^\/fixture\/(broken|fixed|alternate|reordered|space-only|trap|heldout)$/.test(url.pathname)){
    const file=files[url.pathname]||(recordedImage?url.pathname.slice(1):'fixture.html');const mime=file.endsWith('.png')?'image/png':file.endsWith('.json')?'application/json; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8';return reply(200,await readAsset(path.join(root,'public',file)),mime);
   }
   if(url.pathname==='/api/status')return reply(200,{meta:metaStatus(),scope:'owned_fixture_only',public_release:false,persistence:'session_memory_1_hour',name_status:'working_description_not_cleared_brand'});
  }
  for(const [id,s]of sessions)if(s.expires<now&&!s.busy)sessions.delete(id);
  let token=String(req.headers.cookie||'').match(/(?:^|; )passage=([a-f0-9]{48})(?:;|$)/)?.[1];
  let session=sessions.get(token);

  if(req.method==='GET'){
   const match=url.pathname.match(/^\/api\/runs\/([a-f0-9-]+)(\/test)?$/);
   if(match){const saved=session?.runs.get(match[1]);if(!saved)return reply(404,{error:'not_found'});if(match[2]){if(!saved.keyboard)return reply(409,{error:'no_trace'});return reply(200,replaySource(saved.keyboard.actions,saved.variant,'keyboard',requestOrigin),'text/plain; charset=utf-8');}return reply(200,saved);}
   return reply(404,{error:'not_found'});
  }
  if(req.method!=='POST'||!['/api/run','/api/replay'].includes(url.pathname))return reply(404,{error:'not_found'});
  if(req.headers.origin!==requestOrigin)return reply(403,{error:'untrusted_origin'});
  if(req.headers['content-type']?.split(';')[0]!=='application/json')return reply(415,{error:'json_required'});
  const size=Number(req.headers['content-length']);if(!Number.isInteger(size)||size<2||size>2000)return reply(413,{error:'request_size'});
  if(session?.busy||active>=2)return reply(429,{error:'runner_busy'});
  if(session?.runs.size>=6)return reply(429,{error:'session_run_limit'});
  let data;try{let body='';for await(const c of req){body+=c;if(Buffer.byteLength(body)>2000)throw Error();}data=JSON.parse(body);}catch{return reply(400,{error:'invalid_request'});}
  if(!data||typeof data!=='object'||Array.isArray(data))return reply(400,{error:'invalid_request'});
  const prior=url.pathname==='/api/replay'?session?.runs.get(data.id):null;
  if(url.pathname==='/api/replay'&&!prior?.keyboard)return reply(404,{error:'not_found'});
  const variant=prior?.variant||data.variant;const planner=prior?'saved_actions':data.planner;
  if(!VARIANTS.has(variant)||!['fixture_replay','meta','saved_actions'].includes(planner))return reply(422,{error:'invalid_mode'});
  if(planner==='saved_actions'&&!prior)return reply(422,{error:'invalid_mode'});
  if(planner==='meta'&&(!metaStatus().configured||!metaStatus().enabled||metaStatus().max_calls<1))return reply(409,{error:'meta_not_configured'});
  // Allocate only after path, origin, payload, replay ownership and mode validation.
  if(!session){if(sessions.size>=50)return reply(503,{error:'session_capacity'});token=randomBytes(24).toString('hex');session={expires:now+3600000,busy:false,runs:new Map()};sessions.set(token,session);res.setHeader('Set-Cookie',`passage=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600${isExternal?'; Secure':''}`);}
  session.busy=true;active++;
  try{const result=await run(`http://127.0.0.1:${actualPort}`,variant,planner,prior);const record={...result,id:randomUUID()};session.runs.set(record.id,record);return reply(201,record);}
  catch{return reply(503,{error:'runner_failure'});}
  finally{session.busy=false;active--;}
  }catch{
   if(!res.headersSent)return reply(500,{error:'internal_error'});
   res.destroy();
  }
 });
 return app;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);const option=name=>{const i=args.indexOf(name);return i<0?undefined:args[i+1];};
 const port=Number(option('--port')||process.env.PORT||8787);const hostname=option('--host')||process.env.HOST||'127.0.0.1';
 if(!Number.isInteger(port)||port<1||port>65535||!['127.0.0.1','0.0.0.0','localhost'].includes(hostname))throw Error('invalid_listen_options');
 createApp({port,hostname}).listen(port,hostname,()=>console.log(`Local development candidate: http://127.0.0.1:${port}`));
}
