'use strict';
// Synthetic staff attendance only: never reads or writes live Google Sheets.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'code.gs'),'utf8');
const a=source.indexOf('function attendanceSchoolDayKey_(raw, zone){');
const b=source.indexOf('function addRecord(ctx, collection, record) {',a);
assert.ok(a>=0&&b>a);
const helpers=source.slice(a,b);
assert.match(source.slice(b,b+4500),/if\(collection==='teacherAttendance'\)return addTeacherAttendanceWithLock_/);
assert.match(source.slice(source.indexOf('function updateRecord('),source.indexOf('function removeRecord(')),/Cannot move saved attendance to another date via Update/);

const teacherHeaders=['id','name','assignedClass'],attendanceHeaders=['id','teacherId','teacherName','date','status','markedBy','createdAt','remarks'];
const toRecord=(keys,row)=>Object.fromEntries(keys.map((key,i)=>[key,row[i]]));
const toRow=(keys,rec)=>keys.map(key=>rec[key]??'');
const teachers=[teacherHeaders,['t1','Zahid','4'],['t2','Tahira','Playgroup']];
const saved=[attendanceHeaders];
const teacherSheet={getDataRange:()=>({getValues:()=>teachers.map(x=>x.slice())})};
const attendanceSheet={getDataRange:()=>({getValues:()=>saved.map(x=>x.slice())}),appendRow:x=>saved.push(x.slice())};
const getCollectionSheet=(ctx,name)=>name==='teachers'?{sheet:teacherSheet,headers:teacherHeaders}:null;
const Utilities={formatDate:(d,zone)=>{
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
 const pick=k=>parts.find(x=>x.type===k).value;
 return pick('year')+'-'+pick('month')+'-'+pick('day');
}};
const Session={getScriptTimeZone:()=> 'Asia/Karachi'};
let seq=0,locked=false,acquired=0,released=0,auditCount=0;
const LockService={getScriptLock:()=>({
 tryLock:()=>{if(locked)return false;locked=true;acquired++;return true},
 releaseLock:()=>{locked=false;released++}
})};
const {addTeacherAttendanceWithLock_}=new Function('LockService','Session','Utilities','rowToRecord','recordToRow','getCollectionSheet','genId','writeAudit',
 helpers+'return {addTeacherAttendanceWithLock_};'
)(LockService,Session,Utilities,toRecord,toRow,getCollectionSheet,()=> 'staff-att-'+(++seq),()=>{auditCount++});
const ctx={ss:{getSpreadsheetTimeZone:()=> 'Asia/Karachi'},schoolId:'demo',auditActor:{id:'admin'}};
const input=(fields={})=>({teacherId:'t1',teacherName:'Zahid',date:'2026-11-12',status:'Present',remarks:'',...fields});
const add=r=>addTeacherAttendanceWithLock_(ctx,r,attendanceSheet,attendanceHeaders);
const first=add(input());
assert.equal(first.id,'staff-att-1');
assert.equal(saved.length,2);
assert.equal(auditCount,1);
assert.equal(add(input({status:'P'})).id,first.id);
assert.equal(saved.length,2);
assert.throws(()=>add(input({status:'Leave'})),/different status or remark/);
assert.throws(()=>add(input({remarks:'Late'})),/different status or remark/);
assert.throws(()=>add(input({teacherId:'not-a-teacher'})),/not found in this school/);
assert.equal(saved.length,2);
const second=add(input({teacherId:'t2',teacherName:'Tahira',date:'2026-11-13',status:'Leave',remarks:'Approved'}));
assert.ok(second.id);
saved.push(toRow(attendanceHeaders,input({id:'native',teacherId:'t2',date:new Date('2026-11-11T19:00:00Z'),status:'Absent'})));
assert.equal(add(input({teacherId:'t2',status:'a'})).id,'native');
saved.push(toRow(attendanceHeaders,input({id:'dup1',teacherId:'t1',date:'2026-11-14'})));
saved.push(toRow(attendanceHeaders,input({id:'dup2',teacherId:'t1',date:'2026-11-14'})));
const count=saved.length;
assert.throws(()=>add(input({date:'2026-11-14'})),/Duplicate staff attendance/);
assert.equal(saved.length,count);
assert.equal(locked,false);
assert.equal(acquired,released,'ScriptLock must always be released');
console.log('PASS: legacy teacherAttendance saves verify roster, dates, statuses, remarks and same-day idempotency under ScriptLock.');
