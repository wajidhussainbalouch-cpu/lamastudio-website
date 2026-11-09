/*
 * Non-destructive IndexedDB compare-and-set regression checks.
 * Run: node lamastudio-school-suite/js/test-offline-vault-cas.cjs
 * This simulates two open browser tabs writing one encrypted vault.
 * It is NOT a substitute for real Android Chrome/IndexedDB testing.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'offline-attendance.js'),'utf8');
const start=source.indexOf('async function saveVaultCas(');
const end=source.indexOf('async function derive(',start);
assert.ok(start>=0&&end>start,'Offline compare-and-set function not found');
const fnBody=source.slice(start,end);
const rows=new Map(),vaultId='test-school#teacher#test-user';
function database(){
 return Promise.resolve({
  transaction(name,mode){
   assert.equal(name,'vaults');assert.equal(mode,'readwrite');
   let aborted=false,pending=null;
   const tx={error:null,oncomplete:null,onabort:null,onerror:null,
    abort(){aborted=true;Promise.resolve().then(()=>tx.onabort?.());}};
   tx.objectStore=()=>({
    get(key){
     const req={result:null,onsuccess:null};
     Promise.resolve().then(()=>{
      if(aborted)return;
      req.result=rows.get(key);
      req.onsuccess?.();
      if(!aborted){
       if(pending)rows.set(key,pending);
       tx.oncomplete?.();
      }
     });
     return req;
    },
    put(record){pending=record;}
   });
   return tx;
  },
  close(){}
 });
}
const saveVaultCas=new Function('database','vaultId',fnBody+'return saveVaultCas;')(database,vaultId);
(async()=>{
 const first=await saveVaultCas({schoolId:vaultId,ciphertext:'encrypted-v1'},null);
 assert.equal(first,'encrypted-v1');
 assert.equal(rows.get(vaultId).ciphertext,'encrypted-v1');
 const second=await saveVaultCas({schoolId:vaultId,ciphertext:'encrypted-v2'},first);
 assert.equal(second,'encrypted-v2');
 await assert.rejects(
  saveVaultCas({schoolId:vaultId,ciphertext:'stale-data'},first),
  /OFFLINE_VAULT_CHANGED/
 );
 assert.equal(rows.get(vaultId).ciphertext,'encrypted-v2','Stale tab overwrote newer draft!');
 await assert.rejects(
  saveVaultCas({schoolId:vaultId,ciphertext:'duplicate-new'},null),
  /OFFLINE_VAULT_CHANGED/
 );
 assert.equal(rows.get(vaultId).ciphertext,'encrypted-v2');
 const third=await saveVaultCas({schoolId:vaultId,ciphertext:'encrypted-v3'},second);
 assert.equal(third,'encrypted-v3');
 console.log('PASS: first save, versioned update, stale-tab rejection, restore collision protection and subsequent update.');
})().catch(error=>{console.error(error);process.exitCode=1;});
