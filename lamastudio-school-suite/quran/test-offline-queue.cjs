/* Node 22 encrypted Quran IndexedDB queue test — no real student data. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),
 vm=require('node:vm'),{webcrypto}=require('node:crypto');
const src=fs.readFileSync(path.join(__dirname,'offline-queue.js'),'utf8');
function indexedDbMock(){
 const stores=new Map();
 const db={
  objectStoreNames:{contains:n=>stores.has(n)},
  createObjectStore:n=>{const s=new Map();stores.set(n,s);return s},
  transaction:(name,mode)=>{
   const tx={error:null,oncomplete:null,onabort:null,onerror:null};
   const rows=stores.get(name);
   if(!rows)throw Error('Missing store '+name);
   tx.objectStore=()=>({
    get:id=>request(()=>rows.get(id)||null,false),
    getAll:()=>request(()=>[...rows.values()].map(v=>({...v})),false),
    add:value=>request(()=>{
     if(rows.has(value.id))throw Error('ConstraintError');
     rows.set(value.id,{...value});return value.id
    },true),
    put:value=>request(()=>{rows.set(value.id,{...value});return value.id},true),
    delete:id=>request(()=>{rows.delete(id);return undefined},true)
   });
   function request(op,mutation){
    const req={result:undefined,error:null,onsuccess:null,onerror:null};
    queueMicrotask(()=>{
     try{req.result=op();if(req.onsuccess)req.onsuccess();
      if(mutation&&tx.oncomplete)tx.oncomplete();
     }catch(e){req.error=e;tx.error=e;if(req.onerror)req.onerror();
      if(tx.onabort)tx.onabort()}
    });
    return req;
   }
   return tx;
  }
 };
 return {indexedDB:{open:()=>{
  const req={result:db,error:null,onupgradeneeded:null,onsuccess:null,onerror:null};
  queueMicrotask(()=>{if(req.onupgradeneeded)req.onupgradeneeded();if(req.onsuccess)req.onsuccess()});
  return req;
 }},stores};
}
const fake=indexedDbMock(),mod={exports:{}};
const context={module:mod,crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,
 btoa,atob,indexedDB:fake.indexedDB,Date,JSON,Set,Map,String,Array,Error,Number,
 Object,Boolean,Promise,console,queueMicrotask};
vm.runInNewContext(src,context,{filename:'offline-queue.js'});
const {QuranQueue,sameLesson}=mod.exports;
const scope={schoolId:'school-A',role:'teacher',accountId:'teacher-1'};
const record=(id,status='Present')=>({studentId:'s1',programme:'Qaida',
 date:'2026-11-10',lesson:'Teacher-approved page 1',attendance:status,requestId:id,
 mistakes:'Teacher-private correction note'});
(async()=>{
 const vault=new QuranQueue(scope);
 await vault.unlock('a-unique-local-passphrase-123');
 await vault.stage(record('quran_request_one'));
 assert.equal((await vault.entries()).length,1);
 const disk=[...fake.stores.get('queue').values()][0];
 assert.ok(disk.cipher&&!JSON.stringify(disk).includes('Teacher-private correction note'),
  'Sensitive lesson text must not be stored plaintext');
 await vault.cacheSnapshot({students:[{id:'s1',name:'Student One',class:'Playgroup',
  photo:'private-photo',phone:'12345678'}],
  settings:{programmes:['Qaida']},
  records:{enrollments:[{studentId:'s1',programme:'Qaida',teacherId:'teacher-1',status:'Active'}]}});
 const snap=await vault.readSnapshot();
 assert.equal(snap.students[0].name,'Student One');
 assert.equal(snap.students[0].photo,undefined);
 assert.equal(snap.students[0].phone,undefined);
 vault.lock();
 await assert.rejects(vault.entries(),/Unlock/);
 const reopened=new QuranQueue(scope);
 await assert.rejects(reopened.unlock('wrong-local-passphrase-xxxx'),/Incorrect offline passphrase/);
 await reopened.unlock('a-unique-local-passphrase-123');
 assert.equal((await reopened.entries()).length,1,'Queued entries survive a new vault instance');
 const otherSchool=new QuranQueue({schoolId:'school-B',role:'teacher',accountId:'teacher-1'});
 await otherSchool.unlock('other-school-passphrase-1234');
 assert.equal((await otherSchool.entries()).length,0,'Another school cannot inspect first school queue');
 let writes=0,cloud=[];
 let result=await reopened.sync(
  async()=>({records:{lessons:cloud}}),
  async rec=>{writes++;cloud.push({...rec});return {verified:true}}
 );
 assert.equal(result.verified,1);assert.equal(writes,1);
 assert.equal((await reopened.entries()).length,0);
 await reopened.stage(record('quran_request_two'));
 cloud=[];
 await assert.rejects(reopened.sync(async()=>({records:{lessons:cloud}}),
  async rec=>{writes++;cloud.push({...rec});throw Error('Internet dropped after server write')}),
  /submitted but not verified/i);
 assert.equal((await reopened.entries())[0].state,'attempted');
 // A fresh session rechecks saved server rows and performs zero new writes.
 result=await (new QuranQueue(scope)).unlock('a-unique-local-passphrase-123').then(async()=>{
  const newSession=new QuranQueue(scope);
  await newSession.unlock('a-unique-local-passphrase-123');
  return newSession.sync(async()=>({records:{lessons:cloud}}),
   async()=>{throw Error('RETRY MUST NOT HAPPEN')});
 });
 assert.equal(result.verified,1);
 assert.equal((await reopened.entries()).length,0);
 await reopened.stage(record('quran_request_three'));
 cloud=[];
 await assert.rejects(reopened.sync(async()=>({records:{lessons:cloud}}),
  async()=>{writes++;throw Error('Ambiguous save failure')}),
  /not verified/);
 const before=writes;
 await assert.rejects(reopened.sync(async()=>({records:{lessons:cloud}}),
  async()=>{writes++;throw Error('Duplicate send attempted')}),
  /No second write was sent/);
 assert.equal(writes,before,'Ambiguous attempted record must not post again');
 await reopened.stage(record('quran_request_four'));
 cloud.push({...record('quran_request_four','Absent')});
 await assert.rejects(reopened.sync(async()=>({records:{lessons:cloud}}),
  async()=>{writes++;}),/conflict/);
 assert.equal((await reopened.entries()).length,2,'Conflicting queued work remains encrypted');
 assert.equal(sameLesson(record('x'),record('x','Absent')),false);
 assert.ok(src.includes('iterations:ROUNDS')&&src.includes('ROUNDS=250000'));
 console.log('PASS: AES-GCM vault, scope isolation, password validation, privacy-redacted snapshot, offline stage, verified sync and no automatic ambiguous retry.');
})().catch(e=>{console.error(e);process.exitCode=1;});
