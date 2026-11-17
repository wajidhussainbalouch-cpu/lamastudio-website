'use strict';
// Synthetic teacher spreadsheet. No real logins, images, or Google Sheets access.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.join(__dirname,'../');
const backend=fs.readFileSync(path.join(base,'backend-api/code.gs'),'utf8');
const api=fs.readFileSync(path.join(base,'js/api-client.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'manage-teachers.html'),'utf8');
function section(src,a,b){
 const x=src.indexOf(a),y=src.indexOf(b,x+a.length);
 assert.ok(x>=0&&y>x,'Missing source: '+a);
 return src.slice(x,y);
}
const secretFields=new Function(section(backend,'function safeTeacherPublicRecord_(teacher){','/** Enforce a real 600×800 JPEG'));
const publicRecord=secretFields()||null;
// The isolated snippet defines a function; use an explicit return.
const redact=new Function(section(backend,'function safeTeacherPublicRecord_(teacher){','/** Enforce a real 600×800 JPEG')+'return safeTeacherPublicRecord_;')();
const safe=redact({id:'t-007',loginId:'t-007',name:'Zafar Hussain',passwordHash:'private-hash',apiKey:'private-key',password:'private',salt:'x'});
assert.equal(safe.loginId,'t-007');
for(const key of ['passwordHash','apiKey','password','salt'])assert.equal(key in safe,false,'Credential leaked: '+key);
const headers=['id','name','loginId','passwordHash','apiKey','status','photo'];
const row=[headers[0],...headers.slice(1)];
const saved=[headers.slice(),['t1','Zafar Hussain','t-007','OLD_HASH','OLD_KEY','Active','']];
let locked=false,writes=0,audits=0,tokenValidated=0;
const schoolId='test-school';
const staffSheet={
 getDataRange:()=>({getValues:()=>saved.map(x=>x.slice())}),
 getRange:(row,col,rows,cols)=>({setValues:values=>{assert.equal(locked,true);assert.equal(rows,1);assert.equal(cols,headers.length);saved[row-1]=values[0].slice();writes++}})
};
const ss={getSpreadsheetTimeZone:()=> 'Asia/Karachi'};
const backendSnippet=section(backend,'function resetTeacherPassword_(p){','/** School Admin action: create a teacher account');
const reset=new Function('requireSchoolAdminWrite','LockService','resolveContext','getCollectionSheet','rowToRecord','hashPassword','Utilities','recordToRow','writeAudit',
 backendSnippet+'return resetTeacherPassword_;')(
 p=>{assert.equal(p.schoolId,schoolId);tokenValidated++;return {id:'admin01'}},
 {getScriptLock:()=>({tryLock:()=>{if(locked)return false;locked=true;return true},releaseLock:()=>{locked=false}})},
 ()=>({ss,schoolId}),
 (_ctx,key)=>{assert.equal(key,'teachers');return {sheet:staffSheet,headers}},
 (names,values)=>Object.fromEntries(names.map((h,i)=>[h,values[i]])),
 (password,id)=>'HASH('+password.length+':'+id+')',
 {getUuid:()=> 'NEW_KEY'},
 (names,record)=>names.map(k=>record[k]??''),
 ()=>{audits++}
);
const req={schoolId,teacherId:'t1',newPassword:'SecurePassword2026!',confirmReset:true};
assert.throws(()=>reset({...req,newPassword:'short'}),/8–128/);
assert.throws(()=>reset({...req,newPassword:'onlyletters'}),/letter and a number/);
assert.throws(()=>reset({...req,confirmReset:false}),/confirmation/);
assert.equal(writes,0);
const result=reset(req);
assert.equal(result.loginId,'t-007');
assert.equal(result.reset,true);
assert.equal(result.sessionsRevoked,true);
assert.equal(saved[1][3],'HASH(19:t1)');
assert.equal(saved[1][4],'NEW_KEY','Old teacher API key must be rotated');
assert.equal(writes,1);assert.equal(audits,1);assert.equal(locked,false);
assert.ok(tokenValidated>=1);
assert.match(backend,/collection==='teachers'\)records=records\.map\(safeTeacherPublicRecord_\)/);
assert.match(backend,/collection==='teachers'\?safeTeacherPublicRecord_\(r\):r/);
assert.match(api,/resetTeacherPassword:async\(teacherId,newPassword\)/);
assert.match(api,/action === 'resetTeacherPassword' \|\|/);
assert.match(backend,/protectedActions=\['resetTeacherPassword'/);
for(const id of ['p_loginId','p_newPassword','p_confirmPassword','copyTeacherLogin','resetTeacherPassword','p_staffCode','p_whatsapp','p_employmentType','p_specialization','p_emergencyContactName','p_photoGallery','p_photoCamera','p_photoPreview','new_photoGallery','new_photoCamera','new_photoPreview']){
 assert.match(html,new RegExp('id="'+id+'"'),'Missing form control '+id);
}
assert.doesNotMatch(html,/id="p_photo"[^>]+type="url"|id="photo"[^>]+type="url"/);
assert.match(html,/type="file" accept="image\/\*" capture="environment"/);
assert.match(html,/LamaTeacherPhotos\.resize\(file\)/);
for(const code of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean))new vm.Script(code);
console.log('PASS: username available, teacher secrets redacted, reset requires school admin, hashes password, revokes sessions, and UI supports camera/gallery.');
