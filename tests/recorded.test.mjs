import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createApp} from '../server.mjs';
test('recorded examples preserve source provenance and exact captured-image hashes',async()=>{
 const data=JSON.parse(await readFile(new URL('../public/recorded/manifest.json',import.meta.url)));
 assert.equal(data.is_live,false);assert.equal(data.ai_connected,false);
 assert.equal(data.source_run_id,41561886365);assert.equal(data.source_commit,'ca48b78d4d6f5d5845f6512e3ff4539201544a53');
 assert.equal(data.results.length,6);
 for(const row of data.results){
  assert.equal(row.replay.consistent,true);
  for(const lane of ['mouse','keyboard']){
   const name=`${row.variant}-${lane}.png`;
   const bytes=await readFile(new URL('../public/recorded/'+name,import.meta.url));
   assert.equal(createHash('sha256').update(bytes).digest('hex'),data.image_sha256[name]);
  }
 }
});
test('recorded example assets are read-only static resources without allocating a session',async t=>{
 let calls=0;const app=createApp({port:0,run:async()=>{calls++;throw Error('must not run');}});
 await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>app.close(resolve)));
 const base=`http://127.0.0.1:${app.address().port}`;
 for(const path of ['/recorded/manifest.json','/recorded/broken-keyboard.png','/recorded.js']){
  const response=await fetch(base+path);assert.equal(response.status,200);assert.equal(response.headers.get('set-cookie'),null);await response.arrayBuffer();
 }
 assert.equal((await fetch(base+'/recorded/unknown-keyboard.png')).status,404);
 assert.equal(calls,0);
});
