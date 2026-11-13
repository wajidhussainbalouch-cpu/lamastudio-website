/* LAMA Quran Academy v11 — deterministic tests of the actual School Suite source.
 * Run: node quran-academy/tests/test-v11-redaction.cjs
 * No network, school sheets, Apps Script deployment or real learner data. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const text=fs.readFileSync(path.resolve(__dirname,'../../lamastudio-school-suite/backend-api/code.gs'),'utf8');
const h0=text.indexOf('function quranV11PublicRecord_(');
const h1=text.indexOf('\nfunction listRecords(',h0);
assert.ok(h0>=0&&h1>h0,'v11 redaction function missing from backend');
const sanitize=new Function(text.slice(h0,h1)+'\nreturn quranV11PublicRecord_;')();
const p0=text.indexOf("case 'list':",text.indexOf('function handleRequest('));
const p1=text.indexOf("case 'remove':",p0);
assert.ok(p0>=0&&p1>p0,'generic CRUD routes missing');
const routes=text.slice(p0,p1);
const invoke=new Function(
  'params','listRecords','getRecord','addRecord','updateRecord','resolveContext','quranV11PublicRecord_',
  'switch(params.action){'+routes+'default:throw Error("Missing route");}'
);
let count=0;
function test(label,fn){fn();count++;console.log('PASS',label);}
const example={
  id:'fictional-student-1',name:'Fictional Learner',class:'1',section:'A',
  password:'FAKE-PASSWORD',apiKey:'FAKE-KEY',passwordHash:'FAKE-HASH',
  passwordSalt:'FAKE-SALT',salt:'SALT',resetToken:'RESET',
  recoveryToken:'RECOVERY',sessionToken:'SESSION',accessToken:'ACCESS',
  refreshToken:'REFRESH',authToken:'AUTH',secret:'SECRET'
};
const forbidden=['password','apiKey','passwordHash','passwordSalt','salt','resetToken',
  'recoveryToken','sessionToken','accessToken','refreshToken','authToken','secret'];
const mock={
  listRecords:()=>[example],getRecord:()=>example,addRecord:()=>example,
  updateRecord:()=>example,resolveContext:()=>({role:'teacher',schoolId:'SAMPLE'})
};
function response(action,collection){
  return invoke({action,collection},mock.listRecords,mock.getRecord,mock.addRecord,
    mock.updateRecord,mock.resolveContext,sanitize);
}
for(const collection of ['students','teachers']){
  for(const action of ['list','get','add','update']){
    test(collection+' '+action+' response has no credential fields',()=>{
      const result=response(action,collection);
      const rec=action==='list'?result.records[0]:result.record;
      assert.equal(result.status,'success');
      for(const field of forbidden)assert.equal(Object.hasOwn(rec,field),false,'Leaked '+field);
      assert.equal(rec.name,'Fictional Learner');
      assert.equal(rec.class,'1');
    });
  }
}
test('Sanitizer does not alter source object',()=>{
  sanitize('students',example);
  assert.equal(example.password,'FAKE-PASSWORD');
  assert.equal(example.apiKey,'FAKE-KEY');
});
test('Non-secret fields retained',()=>{
  const rec=sanitize('students',example);
  assert.equal(rec.id,'fictional-student-1');
  assert.equal(rec.section,'A');
});
test('Other collection preserved by reference',()=>assert.equal(sanitize('homework',example),example));
test('Null student record stays null',()=>assert.equal(sanitize('students',null),null));
test('Generic remove route preserved',()=>assert.match(text,/case 'remove':/));
test('Legacy login remains unmigrated, deliberately blocked from release',()=>{
  const a=text.indexOf('function studentLogin('),b=text.indexOf('function authorizeStudent(',a);
  assert.ok(a>=0&&b>a);
  assert.match(text.slice(a,b),/row\.password/);
  assert.match(text.slice(a,b),/apiKey:\s*row\.apiKey/);
});
console.log(count+' Version 11 source-based checks passed; mocks only, no live accounts tested.');
