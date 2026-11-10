/**
 * Offline encrypted vault fail-closed regression (no browser, secrets or network).
 * Run: node lamastudio-school-suite/js/test-offline-write-failures.cjs
 * Loads the actual writeVault implementation, stubs WebCrypto and IndexedDB
 * compare-and-set, and checks failure handling without real student records.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'offline-attendance.js'),'utf8');
const a=source.indexOf('async function writeVault(requireOnlineAuth=false){');
const b=source.indexOf('function passphrase(){',a);
assert.ok(a>=0&&b>a,'Cannot isolate production encrypted writeVault source');
const implementation=source.slice(a,b);
const state={data:{drafts:[],schoolId:'test'},key:'mock-key',salt:new Uint8Array(16),
  storeVersion:null,staleVault:false};
let failEncrypt=false,failStore='',calls=0,committed=null,identityValid=true;
const crypto={
 getRandomValues:bytes=>{bytes.fill(11);return bytes;},
 subtle:{encrypt:async(algorithm,key,bytes)=>{
  assert.equal(algorithm.name,'AES-GCM');
  assert.equal(key,'mock-key');
  if(failEncrypt)throw Error('WebCrypto rejected encryption');
  return bytes;
 }}
};
const TextEncoder=function(){this.encode=text=>Uint8Array.from([...text].map(c=>c.charCodeAt(0)%256));};
const b64=value=>Array.from(new Uint8Array(value)).join('-');
async function saveVaultCas(record,expected){
 calls++;
 if(failStore)throw Error(failStore);
 assert.equal(expected,committed?.ciphertext||null,'Expected last persisted ciphertext');
 committed=record;
 return record.ciphertext;
}
const writeVault=new Function('state','crypto','TextEncoder','b64','vaultId','saveVaultCas','authorizedWriter',
  implementation+'return writeVault;')(state,crypto,TextEncoder,b64,'test#school-admin',saveVaultCas,()=>identityValid);
(async()=>{
 await writeVault();
 assert.equal(calls,1);assert.equal(state.storeVersion,committed.ciphertext);
 assert.equal(state.staleVault,false);
 const saved=committed,version=state.storeVersion;
 state.data.drafts.push({studentId:'s1',date:'2026-11-10',status:'Present'});
 failEncrypt=true;
 await assert.rejects(writeVault(),/WebCrypto rejected encryption/);
 assert.equal(state.staleVault,true,'Crypto failure must block edits');
 assert.equal(state.storeVersion,version,'Crypto failure cannot advance persisted version');
 assert.equal(committed,saved,'Crypto failure cannot commit attendance');
 const callsAfterEncryption=calls;
 failEncrypt=false;
 await assert.rejects(writeVault(),/Lock and Unlock/);
 assert.equal(calls,callsAfterEncryption,'Blocked stale state must not retry unsafe writes');
 // Simulate a successful Lock/Unlock of the still-persisted encrypted version.
 state.staleVault=false;state.data={drafts:[],schoolId:'test'};
 failStore='QuotaExceededError: storage full';
 await assert.rejects(writeVault(),/storage full/);
 assert.equal(state.staleVault,true,'Quota errors must block local changes');
 assert.equal(state.storeVersion,version);
 assert.equal(committed,saved);
 state.staleVault=false;
 failStore='OFFLINE_VAULT_CHANGED: Another tab saved newer attendance';
 await assert.rejects(writeVault(),/OFFLINE_VAULT_CHANGED/);
 assert.equal(state.staleVault,true,'Concurrent-tab conflict must block local changes');
 state.staleVault=false;
 failStore='';
 await writeVault();
 assert.equal(state.staleVault,false);
 assert.equal(state.storeVersion,committed.ciphertext);
 const persisted=committed,expected=state.storeVersion;
 identityValid=false;
 await assert.rejects(writeVault(true),/Account changed during secure offline preparation/);
 assert.equal(state.staleVault,true,'Online roster preparation must fail closed after identity switch');
 assert.equal(state.storeVersion,expected);
 assert.equal(committed,persisted,'No local save under switched school identity');
 state.staleVault=false;
 await writeVault(false);
 assert.equal(state.staleVault,false,'Offline attendance may still save without online authentication');
 assert.equal(committed.ciphertext,expected,'Mock ciphertext remains stable for same data');
 console.log('PASS: encrypted writes, quota/CAS recovery, online preparation login recheck, and offline editing without live login.');
})().catch(error=>{console.error(error);process.exitCode=1;});
