'use strict';
/**
 * Secure Quran lesson offline queue for School Suite teachers/admins.
 * - Encrypted IndexedDB (AES-GCM, PBKDF2 SHA-256 250,000 rounds).
 * - School/account scope, no password or API key persisted.
 * - Request ID enforced server-side; first ambiguous POST is "attempted"
 *   and cannot auto-send again after refresh.
 * - Offline queue is not proof of backend saving.
 */
(function(root,factory){
 const exports=factory();
 if(typeof module==='object'&&module.exports)module.exports=exports;
 if(root)root.LamaQuranOffline=exports;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 const DB_NAME='lama_quran_offline_v1',DB_VERSION=1,ROUNDS=250000;
 const encoder=new TextEncoder(),decoder=new TextDecoder();
 function bytes(n){const x=new Uint8Array(n);crypto.getRandomValues(x);return x}
 function b64(a){
  let s='';for(const v of new Uint8Array(a))s+=String.fromCharCode(v);
  return btoa(s);
 }
 function unb64(s){return Uint8Array.from(atob(s),x=>x.charCodeAt(0))}
 function requiredScope(scope){
  if(!scope||!scope.schoolId||!['school','teacher'].includes(scope.role)||!scope.accountId)
   throw Error('Authorized school/teacher account required for encrypted Quran queue');
  return [String(scope.schoolId),String(scope.role),String(scope.accountId)].join('|');
 }
 function requestId(record){
  const id=String(record?.requestId||'');
  if(!/^[A-Za-z0-9_-]{12,120}$/.test(id))throw Error('Unique Quran lesson request ID required');
  return id;
 }
 function permittedLesson(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid lesson draft');
  const allowed=['studentId','programme','date','lesson','surah','ayahFrom','ayahTo','juz',
   'sabaq','sabqi','manzil','mistakes','revision','attendance','teacherRemarks','parentNote','requestId'];
  const record={};
  for(const k of allowed)if(Object.prototype.hasOwnProperty.call(input,k))record[k]=String(input[k]??'');
  if(!record.studentId||!record.programme||!record.date||!record.attendance)throw Error('Incomplete Quran lesson');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(record.date))throw Error('Invalid local lesson date');
  if(!['Present','Absent','Leave'].includes(record.attendance))throw Error('Invalid Quran attendance');
  requestId(record);
  if(JSON.stringify(record).length>7000)throw Error('Lesson exceeds secure queue size');
  return record;
 }
 function openDb(){
  return new Promise((resolve,reject)=>{
   if(typeof indexedDB==='undefined')return reject(Error('Encrypted offline storage unavailable'));
   const req=indexedDB.open(DB_NAME,DB_VERSION);
   req.onupgradeneeded=()=>{
    const db=req.result;
    if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta',{keyPath:'id'});
    if(!db.objectStoreNames.contains('queue'))db.createObjectStore('queue',{keyPath:'id'});
    if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots',{keyPath:'id'});
   };
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||Error('Cannot open encrypted offline storage'));
  });
 }
 function get(db,store,id){
  return new Promise((resolve,reject)=>{
   const tx=db.transaction(store,'readonly'),req=tx.objectStore(store).get(id);
   req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
  });
 }
 function all(db,store){
  return new Promise((resolve,reject)=>{
   const tx=db.transaction(store,'readonly'),req=tx.objectStore(store).getAll();
   req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);
  });
 }
 function modify(db,store,method,item){
  return new Promise((resolve,reject)=>{
   const tx=db.transaction(store,'readwrite'),req=tx.objectStore(store)[method](item);
   tx.oncomplete=()=>resolve(true);
   tx.onabort=()=>reject(tx.error||req.error||Error('Offline write aborted'));
   tx.onerror=()=>{};
  });
 }
 async function derive(pass,salt){
  const base=await crypto.subtle.importKey('raw',encoder.encode(pass),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ROUNDS,hash:'SHA-256'},
   base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 }
 async function seal(key,value){
  const iv=bytes(12),content=encoder.encode(JSON.stringify(value));
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,content);
  return {iv:b64(iv),cipher:b64(ciphertext)};
 }
 async function unseal(key,record){
  const content=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(record.iv)},key,unb64(record.cipher));
  return JSON.parse(decoder.decode(content));
 }
 function sameLesson(expected,actual){
  // A request-ID collision with a different student/date/status/target is not success.
  return !!actual&&['studentId','programme','date','attendance','lesson','sabaq','sabqi','manzil']
   .every(k=>String(expected[k]??'')===String(actual[k]??''));
 }
 class QuranQueue{
  constructor(scope){this.scope=requiredScope(scope);this.db=null;this.key=null}
  async open(){if(!this.db)this.db=await openDb();return this}
  isUnlocked(){return !!this.key}
  async unlock(passphrase){
   if(typeof passphrase!=='string'||passphrase.length<12)throw Error('Offline passphrase must contain at least 12 characters');
   await this.open();
   let meta=await get(this.db,'meta',this.scope);
   if(!meta){
    const salt=bytes(16),key=await derive(passphrase,salt);
    const encrypted=await seal(key,{scope:this.scope,version:1,proof:'LAMA_QURAN_VAULT'});
    try{await modify(this.db,'meta','add',{id:this.scope,salt:b64(salt),...encrypted})}
    catch(error){
     // Another tab may have initialized the vault; verify rather than replace.
     meta=await get(this.db,'meta',this.scope);
     if(!meta)throw error;
    }
    if(!meta){this.key=key;return true}
   }
   const key=await derive(passphrase,unb64(meta.salt));
   let decoded;
   try{decoded=await unseal(key,meta)}catch(_){throw Error('Incorrect offline passphrase or damaged vault')}
   if(decoded.scope!==this.scope||decoded.proof!=='LAMA_QURAN_VAULT')
    throw Error('Offline vault belongs to another school or account');
   this.key=key;return true;
  }
  lock(){this.key=null}
  requireUnlocked(){if(!this.key)throw Error('Unlock the encrypted Quran offline vault first')}
  keyFor(id){return this.scope+'#'+id}
  async entries(){
   this.requireUnlocked();await this.open();
   const enc=(await all(this.db,'queue')).filter(r=>r.id.startsWith(this.scope+'#'));
   const result=[];
   for(const item of enc){
    const decoded=await unseal(this.key,item);
    if(decoded.scope!==this.scope||decoded.kind!=='lessons'||decoded.requestId!==requestId(decoded.record))
     throw Error('Offline Quran queue identity mismatch; stop syncing');
    result.push(decoded);
   }
   return result.sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
  }
  async count(){await this.open();return (await all(this.db,'queue')).filter(x=>x.id.startsWith(this.scope+'#')).length}
  async stage(input){
   this.requireUnlocked();await this.open();
   const record=permittedLesson(input),id=requestId(record);
   const entry={scope:this.scope,kind:'lessons',requestId:id,record,
     state:'queued',createdAt:new Date().toISOString()};
   const ciphertext=await seal(this.key,entry);
   await modify(this.db,'queue','add',{id:this.keyFor(id),...ciphertext});
   return {state:'queued',requestId:id};
  }
  async updateEntry(entry){
   this.requireUnlocked();await this.open();
   if(entry.scope!==this.scope)throw Error('Wrong offline queue owner');
   const ciphertext=await seal(this.key,entry);
   await modify(this.db,'queue','put',{id:this.keyFor(entry.requestId),...ciphertext});
  }
  async deleteVerified(id){
   this.requireUnlocked();await this.open();
   await modify(this.db,'queue','delete',this.keyFor(id));
  }
  async cacheSnapshot(snapshot){
   this.requireUnlocked();await this.open();
   // Don't persist photos, phone numbers, passwords or server login credentials.
   const safe={scope:this.scope,recordedAt:new Date().toISOString(),
    settings:snapshot.settings,
    records:{enrollments:(snapshot.records?.enrollments||[]).map(r=>({
     id:r.id,studentId:r.studentId,programme:r.programme,teacherId:r.teacherId,status:r.status,
     level:r.level}))},
    students:(snapshot.students||[]).map(s=>({
     id:s.id,name:s.name,class:s.class,section:s.section}))};
   const encrypted=await seal(this.key,safe);
   await modify(this.db,'snapshots','put',{id:this.scope,...encrypted});
  }
  async readSnapshot(){
   this.requireUnlocked();await this.open();
   const item=await get(this.db,'snapshots',this.scope);
   if(!item)return null;
   const decoded=await unseal(this.key,item);
   if(decoded.scope!==this.scope)throw Error('Offline Quran snapshot owner mismatch');
   return decoded;
  }
  /**
   * Sync safety: check cloud before writing; persist attempted marker before POST.
   * No automatic retry after a network-ambiguous first attempt.
   * read() returns role-scoped Quran bootstrap; write(record) verifies via server.
   */
  async sync(read,write){
   this.requireUnlocked();
   if(typeof read!=='function'||typeof write!=='function')throw Error('Invalid Quran sync adapter');
   let verified=0,pending=0;
   for(const item of await this.entries()){
    const latest=await read();
    const hits=(latest?.records?.lessons||[]).filter(r=>r.requestId===item.requestId);
    if(hits.length>1)throw Error('Duplicate Quran cloud request ID; stop and contact School Administrator');
    if(hits.length===1){
     if(!sameLesson(item.record,hits[0]))throw Error('Quran sync conflict for request '+item.requestId);
     await this.deleteVerified(item.requestId);verified++;continue;
    }
    if(item.state==='attempted'){
     pending++;
     // It might arrive later even though this read did not see it.
     throw Error('Quran save acknowledgment uncertain. No second write was sent. Review cloud records before recovery.');
    }
    if(item.state!=='queued')throw Error('Unknown offline Quran queue state');
    item.state='attempted';
    await this.updateEntry(item);
    // A crash or failed fetch from this point is ambiguous. On a future
    // reload, only read-only verification is permitted.
    try{
     await write(item.record);
     const after=await read();
     const matches=(after?.records?.lessons||[]).filter(r=>r.requestId===item.requestId);
     if(matches.length!==1||!sameLesson(item.record,matches[0]))
      throw Error('Quran lesson not independently verified in school database');
     await this.deleteVerified(item.requestId);verified++;
    }catch(error){
     throw Error('Quran lesson was submitted but not verified: '+(error.message||String(error))+
      '. Do not submit again; use read-only verification.');
    }
   }
   return {verified,pending};
  }
 }
 return {QuranQueue,permittedLesson,sameLesson};
});