/* LAMA Quran Academy v11 — tests canonical development sources, not deployed Apps Script. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const backend=fs.readFileSync(path.join(root,'lamastudio-school-suite/backend-api/code.gs'),'utf8');
const v8=fs.readFileSync(path.join(root,'quran-academy/backend/quran-academy-v8.gs'),'utf8');
const begin=backend.indexOf('function quranV11PublicRecord_('),end=backend.indexOf('function listRecords(',begin);
assert(begin>0&&end>begin,'Version 11 public record filter must be present');
const publicRecord=vm.runInNewContext(backend.slice(begin,end)+'\nquranV11PublicRecord_',Object.create(null));
let passed=0;
function test(label,fn){fn();passed++;console.log('PASS '+label);}
const student={id:'s1',name:'Fictional learner',class:'1',password:'LEGACY_PASSWORD',apiKey:'TOKEN',passwordHash:'HASH',passwordSalt:'SALT',salt:'OLD',resetToken:'RESET',recoveryToken:'RECOVER',sessionToken:'SESSION'};
test('Student API record strips authentication fields',()=>{
 const item=publicRecord('students',student);
 for(const key of ['password','apiKey','passwordHash','passwordSalt','salt','resetToken','recoveryToken','sessionToken'])assert(!Object.hasOwn(item,key),'Disclosed '+key);
 assert.equal(item.id,'s1');assert.equal(item.name,'Fictional learner');
});
test('Source record is not modified',()=>assert.equal(student.apiKey,'TOKEN'));
test('Other collection retains original semantics',()=>assert.equal(publicRecord('attendance',student),student));
test('Null student record is safe',()=>assert.equal(publicRecord('students',null),null));
for(const action of ['list','get','add','update']){
 test(action+' API response applies redaction',()=>{
  const from=backend.indexOf("case '"+action+"':");assert(from>0,'Missing route '+action);
  let to=backend.indexOf("case '",from+6);if(to<0)to=from+800;
  assert(backend.slice(from,to).includes('quranV11PublicRecord_'),'Unfiltered '+action+' response');
 });
}
const gb=v8.indexOf('function quranV8Guard_('),ge=v8.indexOf('function quranV8Id_(',gb);
assert(gb>=0&&ge>gb);
const gate=vm.runInNewContext(v8.slice(gb,ge)+'\nquranV8Guard_',{
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==='QURAN_V8_PILOT_SCHOOLS'?'SCH_A':''})},
 resolveContext:p=>({role:p.role,schoolId:p.schoolId}),
 verifySchoolAdminToken:()=>({id:'admin'}),findSchoolRow:()=>({obj:{status:'Active',sheetId:'test'}}),
 getRegistrySheet:()=>({}),SpreadsheetApp:{openById:()=>({})}
});
test('Legacy student Quran pilot is blocked',()=>assert.throws(()=>gate({role:'student',schoolId:'SCH_A'}),/paused pending secure student authentication/));
test('Teacher pilot remains usable within allowlist',()=>assert.equal(gate({role:'teacher',schoolId:'SCH_A'}).role,'teacher'));
test('Out-of-scope school is denied',()=>assert.throws(()=>gate({role:'teacher',schoolId:'SCH_B'}),/not enabled/));
console.log(passed+' canonical-source tests passed; no live school services accessed.');
