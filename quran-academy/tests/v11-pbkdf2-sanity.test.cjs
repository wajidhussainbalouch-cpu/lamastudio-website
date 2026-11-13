'use strict';
// Run: node quran-academy/tests/v11-pbkdf2-sanity.test.cjs
// Only public fictional test vectors. No school data or credentials.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../backend/school-suite-student-auth-v11.gs'),'utf8');
const asBuffer=v=>Array.isArray(v)?Buffer.from(v.map(b=>(Number(b)+256)&255)):Buffer.from(String(v),'utf8');
const signed=b=>Array.from(b,v=>v>127?v-256:v);
const Utilities={
 computeHmacSha256Signature:(value,key)=>signed(crypto.createHmac('sha256',asBuffer(key)).update(asBuffer(value)).digest()),
 newBlob:value=>({getBytes:()=>signed(Buffer.from(String(value),'utf8'))})
};
const context=vm.createContext({Utilities});
vm.runInContext(source,context,{filename:'school-suite-student-auth-v11.gs'});
const password='Fictional-password-123';
const settings={pepper:'fictional-pepper-never-use-in-production-000000'};
const actual=context.q11Derive_(password,settings,'SCH_X','stu_X','fictitioussalt',3);
const prekey=crypto.createHmac('sha256',Buffer.from(settings.pepper)).update(password).digest();
const expected=crypto.pbkdf2Sync(prekey,Buffer.from('q11|SCH_X|stu_X|fictitioussalt'),3,32,'sha256').toString('hex');
assert.equal(actual,expected);
assert.equal(actual,'8a50fe0ac2da1bcbc3635b6ce531147abff3a42dfbb818770fdc9d493fdc867d');
assert.notEqual(actual,context.q11Derive_('different-password',settings,'SCH_X','stu_X','fictitioussalt',3));
console.log('PASS: canonical v11 Apps Script PBKDF2-HMAC-SHA256 derivation matches Node crypto and public test vector.');
console.log('NOTE: 3-round vector proves implementation shape only. It does NOT benchmark 20,000-150,000 rounds or Google Apps Script performance.');
