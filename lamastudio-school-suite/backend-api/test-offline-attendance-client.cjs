/**
 * Mocked browser attendance workflow regression.
 * Run: node lamastudio-school-suite/backend-api/test-offline-attendance-client.cjs
 * Crypto is intentionally MOCKED: checks control flow, not AES/PBKDF2 security.
 * No real network, Google Sheets, Apps Script, or production data is used.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/offline-attendance.js'),'utf8');
const assert=(value,label)=>{if(!value)throw Error('FAIL: '+label);};
async function main(){
 let online=true,saveError=false,cloud=[],counter=0,activeBlob=null,downloaded=null;
 const db=new Map(),base64=new Map(),checks=[];
 const enc=s=>Uint8Array.from([...s].map(c=>c.charCodeAt(0)));
 const dec=a=>String.fromCharCode(...new Uint8Array(a));
 const btoa=s=>{const key='B'+(++counter);base64.set(key,s);return key;};
 const atob=key=>{if(!base64.has(key))throw Error('Invalid base64 token');return base64.get(key);};
 const crypto={
  getRandomValues:a=>(a.fill(23),a),randomUUID:()=>String(++counter),
  subtle:{
   importKey:async(_f,b)=>dec(b),deriveKey:async(_alg,k)=>k,
   encrypt:async(_alg,k,b)=>enc('AUTH'+k+':'+dec(b)).map(x=>x^17),
   decrypt:async(_alg,k,b)=>{
    const s=dec(Uint8Array.from(b).map(x=>x^17));
    if(!s.startsWith('AUTH'+k+':'))throw Error('Invalid password');
    return enc(s.slice(('AUTH'+k+':').length));
   }
  }
 };
 // Model an atomic IndexedDB readwrite transaction. Nested put() inside
 // get.onsuccess must commit before oncomplete, or abort without any write.
 const indexedDB={open(){
  const req={};
  Promise.resolve().then(()=>{
   req.result={createObjectStore(){},close(){},transaction(){
    let aborted=false,committed=false,pending=null,insideGet=false;
    const tx={error:null,oncomplete:null,onabort:null,onerror:null,
      abort(){aborted=true;Promise.resolve().then(()=>tx.onabort?.());}};
    function finish(){
      if(aborted||committed)return;
      committed=true;
      if(pending)db.set(pending.schoolId,pending);
      tx.oncomplete?.();
    }
    tx.objectStore=()=>({
      get(k){
       const r={};
       Promise.resolve().then(()=>{
        if(aborted)return;
        r.result=db.get(k);
        insideGet=true;
        r.onsuccess?.();
        insideGet=false;
        finish();
       });
       return r;
      },
      put(v){
       pending=v;
       const r={};
       if(!insideGet)Promise.resolve().then(()=>{if(!aborted){r.onsuccess?.();finish();}});
       return r;
      }
    });
    return tx;
   }};
   req.onupgradeneeded?.();req.onsuccess?.();
  });
  return req;
 }};
 const students=[
  {id:'a',name:'Student A',class:'5',section:'A',enrlNo:'01'},
  {id:'b',name:'Student B',class:'5',section:'A',enrlNo:'02'}
 ];
 const api={
  getSession:role=>!role||role==='school'?{role:'school',schoolId:'sch_recovery',apiKey:'mock'}:null,
  offlineAttendanceSnapshot:async()=>({schoolId:'sch_recovery',role:'school',students,
   attendance:cloud.map(r=>({...r}))}),
  bulkAttendance:async(date,records)=>{
   if(saveError)throw Error('Mock timeout');
   for(const r of records){
    const current=cloud.find(x=>x.date===date&&x.studentId===r.studentId);
    if(current)current.status=r.status;
    else cloud.push({studentId:r.studentId,enrlNo:r.enrlNo,date,status:r.status});
   }
   return {saved:records.length,inserted:records.length,updated:0};
  }
 };
 function node(tag){
  return {tag,children:[],textContent:'',value:'',disabled:false,hidden:false,files:[],
   style:{},dataset:{},classList:{toggle(){}},
   append(...args){this.children.push(...args);},
   replaceChildren(...args){this.children=args;},
   add(x){this.children.push(x);},
   click(){if(tag==='a')downloaded=activeBlob;}
  };
 }
 function boot(){
  const nodes=new Map(),element=id=>{
   if(!nodes.has(id))nodes.set(id,node(id));return nodes.get(id);
  };
  const options={
   document:{getElementById:element,createElement:node},LamaAPI:api,
   sessionStorage:{getItem:()=>JSON.stringify({schoolId:'sch_recovery',token:'mock-verified'})},
   navigator:{get onLine(){return online;},storage:{persist:async()=>true}},
   window:{indexedDB},indexedDB,isSecureContext:true,crypto,
   TextEncoder:function(){this.encode=enc;},
   TextDecoder:function(){this.decode=dec;},btoa,atob,
   Option:function(t,v){return{value:v,textContent:t};},
   location:{search:'?role=school'},
   URLSearchParams:class{get(){return'school';}},
   addEventListener:()=>{},confirm:()=>true,
   Blob:function(parts){this.content=parts.join('');activeBlob=this;},
   URL:{createObjectURL:()=> 'blob:mock',revokeObjectURL(){}},
   setTimeout:()=>{}
  };
  new Function(...Object.keys(options),source)(...Object.values(options));
  return element;
 }
 const tick=()=>Promise.resolve().then(()=>Promise.resolve());
 async function click(el){if(!el.onclick)throw Error('Missing action: '+el.tag);await el.onclick();await tick();}
 function check(condition,description){assert(condition,description);checks.push(description);}
 let get=boot();await tick();
 get('offlinePass').value='strong-passphrase';
 await click(get('prepare'));
 check(db.size===1,'Prepared encrypted device vault');
 online=false;
 await click(get('bulkPresent'));
 check(get('queueInfo').textContent.includes('2 attendance changes'),'One-tap bulk Present queues two records');
 check(cloud.length===0,'Offline edits do not write server records');
 await click(get('backup'));
 check(downloaded?.content?.includes('lama-offline-attendance-backup'),'Encrypted backup download');
 check(!downloaded.content.includes('Student A'),'No plaintext student name in backup');
 const backup=downloaded.content;
 db.clear();
 get=boot();await tick();
 get('backupFile').files=[{size:backup.length,text:async()=>backup}];
 get('offlinePass').value='wrong-passphrase';
 await click(get('restoreBackup'));
 check(db.size===0,'Wrong password cannot restore backup');
 get('offlinePass').value='strong-passphrase';
 await click(get('restoreBackup'));
 check(db.size===1,'Valid backup persists to empty device vault');
 check(get('queueInfo').textContent.includes('2 attendance changes'),'Pending marks survive encrypted restore');
 await click(get('restoreBackup'));
 check(get('actionStatus').textContent.includes('Restore failed'),'Restore refuses to overwrite existing vault');
 online=true;saveError=true;
 await click(get('sync'));
 check(get('queueInfo').textContent.includes('2 attendance changes'),'Failed network save retains drafts');
 saveError=false;await click(get('sync'));
 check(cloud.length===2&&cloud.every(s=>s.status==='Present'),'Recovered marks written to mock server');
 check(get('queueInfo').textContent.includes('0 attendance changes'),'Verified queue removes only confirmed drafts');
 console.log('PASS: '+checks.length+' mocked offline browser cases: '+checks.join('; '));
}
main().catch(err=>{console.error(err);process.exitCode=1;});
