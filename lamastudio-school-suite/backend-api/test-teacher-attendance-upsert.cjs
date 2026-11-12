/* Locked/idempotent staff attendance save on mocked Google Sheets only. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'code.gs'),'utf8');
const from=source.indexOf('function upsertTeacherAttendance_(ctx, record, expectedId) {');
const to=source.indexOf('function addRecord(ctx, collection, record) {',from);
assert.ok(from>=0&&to>from,'Missing teacher attendance upsert implementation');
const hTeacher=['id','name','status'];
const hAttendance=['id','teacherId','teacherName','date','status','markedBy','createdAt','remarks'];
const teachers=[hTeacher,['t1','Teacher One','Active']];
const marks=[hAttendance];
const audits=[];
let counter=0,flushes=0,locks=0;
const sheet=rows=>({
 getDataRange:()=>({getValues:()=>rows.map(r=>r.slice())}),
 appendRow:row=>rows.push(row.slice()),
 getRange:(line)=>({setValues:matrix=>{rows[line-1]=matrix[0].slice();}})
});
const ctx={role:'school',schoolId:'school-one',auditActor:{id:'admin1',name:'Admin One'},
 ss:{getSpreadsheetTimeZone:()=> 'Asia/Karachi'}};
const day=(date,tz)=>{
 const p=new Intl.DateTimeFormat('en-US',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:tz}).formatToParts(date);
 const f=x=>p.find(q=>q.type===x).value;
 return f('year')+'-'+f('month')+'-'+f('day');
};
const deps={
 LockService:{getScriptLock:()=>({tryLock:()=>{locks++;return true;},releaseLock:()=>{locks--;}})},
 getCollectionSheet:(_ctx,name)=>name==='teachers'?{sheet:sheet(teachers),headers:hTeacher}:{sheet:sheet(marks),headers:hAttendance},
 rowToRecord:(headers,row)=>Object.fromEntries(headers.map((h,i)=>[h,row[i]])),
 recordToRow:(headers,obj)=>headers.map(h=>obj[h]??''),
 Session:{getScriptTimeZone:()=> 'UTC'},
 Utilities:{formatDate:(d,tz)=>day(d,tz)},
 genId:()=> 'tat-'+(++counter),
 SpreadsheetApp:{flush:()=>{flushes++;}},
 writeAudit:(_ss,_school,_actor,action,collection,id)=>audits.push({action,collection,id})
};
const save=new Function(...Object.keys(deps),source.slice(from,to)+'return upsertTeacherAttendance_;')(...Object.values(deps));
const item={teacherId:'t1',date:'2026-11-10',status:'Present',remarks:''};
const first=save(ctx,item);
assert.equal(first.id,'tat-1');
assert.equal(marks.length,2);
assert.equal(marks[1][hAttendance.indexOf('date')],'2026-11-10');
const duplicate=save(ctx,item);
assert.equal(duplicate.id,first.id);
assert.equal(marks.length,2,'Retry must not append duplicate teacher/day');
assert.equal(audits.length,1,'No extra audit on no-op retry');
marks[1][hAttendance.indexOf('date')]=new Date('2026-11-09T19:00:00.000Z');
const timestampRetry=save(ctx,item);
assert.equal(timestampRetry.id,first.id,'Sheet-local midnight must match original day');
assert.equal(marks.length,2);
const corrected=save(ctx,{...item,status:'Absent',remarks:'Sick'});
assert.equal(corrected.id,first.id);
assert.equal(marks.length,2,'Correction should update same daily row');
assert.equal(corrected.status,'Absent');
assert.equal(audits.length,2);
assert.equal(audits[1].action,'update');
const edit=save(ctx,{...item,status:'Leave',remarks:'Approved leave'},first.id);
assert.equal(edit.id,first.id);
assert.equal(marks.length,2,'Editing must reuse the original teacher/day row');
assert.throws(()=>save(ctx,{...item,status:'Absent'},'stale-record-id'),
 /row changed while editing/,'Stale record ID cannot silently alter a newer entry');
assert.throws(()=>save(ctx,{...item,date:'2026-11-11'},first.id),
 /row changed while editing/,'Correction cannot reassign a different attendance date');
assert.throws(()=>save(ctx,{...item,teacherId:'unknown'}),/Teacher not found/);
assert.throws(()=>save(ctx,{...item,date:'2026-02-30'}),/Invalid teacher attendance/);
assert.throws(()=>save(ctx,{...item,status:'Maybe'}),/Invalid teacher attendance/);
assert.throws(()=>save({...ctx,role:'teacher'},item),/Verified School Administrator/);
assert.equal(locks,0,'All script locks must be released');
// The public updateRecord route must go through this same locked upsert.
const u0=source.indexOf('function updateRecord(ctx, collection, id, patch) {');
const u1=source.indexOf('function removeRecord(ctx, collection, id) {',u0);
assert.ok(u0>=0&&u1>u0);
const updateDeps={
 assertSchoolWritable:()=>{},checkPermission:()=>{},
 upsertTeacherAttendance_:(school,patch,expectedId)=>save(school,patch,expectedId)
};
const update=new Function(...Object.keys(updateDeps),
 source.slice(u0,u1)+'return updateRecord;')(...Object.values(updateDeps));
const viaUpdate=update(ctx,'teacherAttendance',first.id,{
 teacherId:'t1',date:'2026-11-10',status:'Present',remarks:''});
assert.equal(viaUpdate.id,first.id);
assert.equal(marks.length,2,'The direct update route must not append any new date rows');
assert.throws(()=>update(ctx,'teacherAttendance','bad-id',{
 teacherId:'t1',date:'2026-11-10',status:'Absent'}),/row changed while editing/);
assert.throws(()=>update(ctx,'teacherAttendance',first.id,{
 status:'Absent'}),/correction requires teacher ID and date/);
assert.equal(locks,0,'Update route must release its save lock');
marks.push(marks[1].slice());
assert.throws(()=>save(ctx,item),/Duplicate teacher attendance already exists/);

assert.ok(flushes>=2);
console.log('PASS: teacher attendance upsert handles retry, timezone, correction, duplicates, validation, and lock release.');
