'use strict';
// Synthetic in-memory Sheets only; never accesses a live school database.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'code.gs'),'utf8');
const extract=(start,end)=>{
 const a=src.indexOf(start),b=src.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Backend source marker unavailable: '+start);
 return src.slice(a,b);
};
const dayHelpers=extract('function attendanceSchoolDayKey_(raw, zone){','function addAttendanceRecordWithLock_(');
const updateHelper=extract('function updateAttendanceRecordWithLock_(ctx,collection,id,patch){','function updateRecord(ctx, collection, id, patch) {');
assert.match(src,/if\(collection==='attendance'\|\|collection==='teacherAttendance'\)\s*return updateAttendanceRecordWithLock_\(ctx,collection,id,patch\)/);
const columns={
 attendance:['id','studentId','enrlNo','class','section','date','status','teacherId','markedBy'],
 teacherAttendance:['id','teacherId','date','status','remarks','markedBy']
};
const fixtures={};
for(const [name,headers] of Object.entries(columns)){
 const rows=[headers.slice()];
 fixtures[name]={rows,headers,sheet:{
  getDataRange:()=>({getValues:()=>rows.map(x=>x.slice())}),
  getRange:(r,c,h,w)=>({setValues:values=>{
    assert.equal(h,1);assert.equal(w,headers.length);assert.equal(values.length,1);
    rows[r-1]=values[0].slice();
  }})
 }};
}
const toRow=(hs,r)=>hs.map(k=>r[k]??'');
const toRecord=(hs,r)=>Object.fromEntries(hs.map((k,i)=>[k,r[i]]));
const add=(name,record)=>fixtures[name].rows.push(toRow(fixtures[name].headers,record));
const roster={
 schoolA:{'s1':{id:'s1',class:'4',section:'A'},'s2':{id:'s2',class:'2',section:'A'}},
 schoolB:{'s9':{id:'s9',class:'4',section:'A'}}
};
const ctx={role:'school',schoolId:'schoolA',ss:{getSpreadsheetTimeZone:()=> 'Asia/Karachi'},auditActor:{id:'admin'}};
const teacher={...ctx,role:'teacher',teacher:{assignedClass:'4',assignedSection:'A'},auditActor:{id:'teacher'}};
const Utilities={formatDate:(date,zone)=>{
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
 const part=k=>parts.find(x=>x.type===k).value;
 return part('year')+'-'+part('month')+'-'+part('day');
}};
let held=false,obtained=0,released=0,deny=false,audits=0;
const LockService={getScriptLock:()=>({
 tryLock:()=>{if(deny||held)return false;held=true;obtained++;return true},
 releaseLock:()=>{assert.equal(held,true);held=false;released++}
})};
const sameClass=(a,b)=>String(a??'').trim().toLowerCase().replace(/^class\s*/,'')===String(b??'').trim().toLowerCase().replace(/^class\s*/,'');
const teacherOwns=(scope,record)=>sameClass(scope.teacher.assignedClass,record.class)&&sameClass(scope.teacher.assignedSection,record.section);
const teacherStudentAccess_=(scope,record)=>{
 const st=roster[scope.schoolId]?.[record.studentId];
 if(!st||!teacherOwns(scope,st))throw Error('Student outside assigned class');
 return st;
};
const api=new Function('LockService','Utilities','Session','getCollectionSheet','rowToRecord','recordToRow','sameClass','teacherOwns','teacherStudentAccess_','writeAudit',
 dayHelpers+updateHelper+'return {updateAttendanceRecordWithLock_};'
)(
 LockService,Utilities,{getScriptTimeZone:()=> 'Asia/Karachi'},
 (scope,name)=>{assert.equal(scope.schoolId,'schoolA');return fixtures[name];},
 toRecord,toRow,sameClass,teacherOwns,teacherStudentAccess_,()=>{audits++}
);
const update=(name,id,patch,scope=ctx)=>api.updateAttendanceRecordWithLock_(scope,name,id,patch);
add('attendance',{id:'a1',studentId:'s1',enrlNo:'11',class:'4',section:'A',date:new Date('2026-11-11T19:00:00Z'),status:'Present'});
assert.equal(update('attendance','a1',{status:'Absent',date:'2026-11-12'}).status,'Absent');
assert.equal(fixtures.attendance.rows.length,2,'Update must not append a row');
assert.equal(audits,1,'Successful update is audited');
assert.throws(()=>update('attendance','a1',{date:'2026-11-13',status:'Present'}),/another date/);
assert.throws(()=>update('attendance','a1',{studentId:'s2'}),/identity/);
assert.throws(()=>update('attendance','a1',{class:'2'}),/identity/);
assert.throws(()=>update('attendance','a1',{status:'unknown'}),/Present, Absent or Leave/);
assert.equal(audits,1,'Rejected edits are not audited');
add('attendance',{id:'a2',studentId:'s1',enrlNo:'11',class:'4',section:'A',date:'2026-11-12',status:'Present'});
assert.throws(()=>update('attendance','a1',{status:'Present'}),/Duplicate saved attendance/);
assert.equal(audits,1);
fixtures.attendance.rows.pop();
assert.equal(update('attendance','a1',{status:'Present'},teacher).status,'Present','Assigned teacher may update own student');
const wrongTeacher={...teacher,teacher:{assignedClass:'2',assignedSection:'A'}};
assert.throws(()=>update('attendance','a1',{status:'Absent'},wrongTeacher),/outside assigned class/);
assert.equal(audits,2);
add('teacherAttendance',{id:'t1',teacherId:'t6',date:'2026-11-12',status:'Present',remarks:''});
assert.equal(update('teacherAttendance','t1',{status:'Leave',remarks:'Approved'}).status,'Leave');
assert.equal(fixtures.teacherAttendance.rows.length,2);
assert.throws(()=>update('teacherAttendance','t1',{teacherId:'t9'}),/identity/);
add('teacherAttendance',{id:'t2',teacherId:'t6',date:'2026-11-12',status:'Present'});
assert.throws(()=>update('teacherAttendance','t1',{status:'Present'}),/Duplicate saved attendance/);
assert.throws(()=>update('teacherAttendance','unknown',{status:'Present'}),/Record not found/);
const before=audits;
deny=true;
assert.throws(()=>update('attendance','a1',{status:'Absent'}),/busy/);
deny=false;
assert.equal(audits,before);
assert.equal(held,false);
assert.equal(obtained,released,'Every acquired lock must be released');
console.log('PASS: attendance corrections are serialized, audited, school- and class-scoped, and block duplicates or identity/date changes.');
