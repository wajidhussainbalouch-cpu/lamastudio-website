/*
 * Reject unsafe encrypted offline vaults before Unlock / Restore Backup.
 * Uses real production validateVaultData() with fake decrypted school data.
 * No real school accounts, Google Sheets, storage or encryption are accessed.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'offline-attendance.js'),'utf8');
const a=source.indexOf('function validateVaultData(data){');
const b=source.indexOf('function sameStudentId(a,b){',a);
assert.ok(a>=0&&b>a,'Could not isolate encrypted vault validation');
const validate=new Function('schoolId','vaultId','validDate','keyFor',
 source.slice(a,b)+'return validateVaultData;')(
 'school-one','school-one#school-admin',
 day=>{
  if(typeof day!=='string'||!/^\\d{4}-\\d{2}-\\d{2}$/.test(day))return false;
  const parsed=new Date(day+'T12:00:00Z');
  return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===day;
 },
 (date,id)=>date+'|'+id
);
const day='2026-11-10';
const sample=()=>({
 schoolId:'school-one',accountScope:'school-one#school-admin',
 preparedAt:'2026-11-10T00:00:00.000Z',
 roster:[
  {id:'s1',name:'Student A',enrlNo:'001',className:'4',section:'A'},
  {id:'s2',name:'Student B',enrlNo:'002',className:'4',section:'A'}
 ],
 history:{[day+'|s1']:'Absent'},
 drafts:[
  {id:'draft-1',studentId:'s1',date:day,status:'Present',baseStatus:'Absent'},
  {id:'draft-2',studentId:'s2',date:day,status:'Leave',baseStatus:'',
    syncIssue:'conflict',serverStatus:'Present'}
 ]
});
function denied(name,edit,pattern){
 const data=sample();edit(data);
 assert.throws(()=>validate(data),pattern,'Unsafe '+name+' backup should not unlock');
}
assert.equal(validate(sample()).drafts.length,2,'Normal encrypted vault remains recoverable');
denied('wrong school',d=>d.schoolId='school-two',/different-school/);
denied('wrong role/account',d=>d.accountScope='school-one#teacher#t1',/different-school/);
denied('duplicate student ID in roster',d=>d.roster[1].id='s1',/duplicate student IDs/);
denied('unknown student',d=>d.drafts[1].studentId='missing',/invalid pending/);
denied('duplicate date and student',d=>{
 d.drafts[1].studentId='s1';
},/duplicate pending attendance/);
denied('repeated draft ID',d=>d.drafts[1].id=d.drafts[0].id,/duplicate pending attendance/);
denied('blank draft ID',d=>d.drafts[0].id='  ',/invalid pending/);
denied('non-string student ID in draft',d=>d.drafts[0].studentId=1,/invalid pending/);
denied('invalid calendar date',d=>d.drafts[0].date='2026-02-30',/invalid pending/);
denied('invalid choice',d=>d.drafts[0].status='Unknown',/invalid pending/);
denied('invalid baseline',d=>d.drafts[0].baseStatus='Maybe',/invalid pending/);
denied('invalid conflict metadata',d=>d.drafts[1].serverStatus='Attended',/invalid pending/);
denied('already-verified draft',d=>d.drafts[0].verified=true,/invalid pending/);
denied('unknown history student',d=>d.history[day+'|deleted-student']='Present',/invalid saved attendance history/);
denied('unknown history status',d=>d.history[day+'|s1']='Maybe',/invalid saved attendance history/);
denied('invalid history date',d=>d.history['2026-02-30|s1']='Absent',/invalid saved attendance history/);
denied('malformed history key',d=>d.history['s1']='Present',/invalid saved attendance history/);
const legitimate=sample();
legitimate.drafts[0].syncIssue='unverified';
legitimate.drafts[0].serverStatus='';
assert.equal(validate(legitimate).drafts.length,2,'Unverified records must remain recoverable');
assert.ok(source.match(/async function unlock\(\)[\s\S]*?validateVaultData\(data\)/),
 'Unlock must validate before using decrypted data');
assert.ok(source.match(/async function restoreEncryptedBackup\(\)[\s\S]*?validateVaultData\(data\)/),
 'Restore must validate decrypted data before committing');
console.log('PASS: legitimate offline vault, 17 unsafe vault/backup cases, uncertain drafts and both entrypoint validation guards.');
