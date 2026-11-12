/**
 * Batch save / sheet-local day readback tests with 38 fake students.
 * No real Google Sheets records or Apps Script deployment are accessed.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const raw=fs.readFileSync(path.join(__dirname,'bulk-attendance-backend.gs'),'utf8');
const from=raw.indexOf('function bulkAttendanceRecords(params) {');
const until=raw.indexOf('/**\n * One private, idempotent parent-portal notification per student/date.',from);
assert.ok(from>=0&&until>from,'Production bulk attendance and day-snapshot helper were not found');
const src=raw.slice(from,until);
const rosterHeaders=['id','enrlNo','name','class','section'];
const schoolStudents=Array.from({length:38},(_,i)=>['s'+(i+1),String(100+i),'Pupil '+(i+1),'5','']);
const attendanceHeaders=['id','studentId','studentName','class','date','status','markedBy','createdAt','enrlNo','section'];
let attendance=[attendanceHeaders],locks=0,reads=0,flushes=0,notifications=0,ids=0,stale=false;
const roster={getDataRange:()=>({getValues:()=>[rosterHeaders,...schoolStudents]})};
const attendanceSheet={
 getDataRange(){reads++;const snapshot=stale&&flushes>0?[attendanceHeaders]:attendance;return{getValues:()=>snapshot.map(row=>[...row])}},
 getLastRow(){return attendance.length},
 getRange(row,col,count,width){
  assert.equal(col,1);assert.equal(width,attendanceHeaders.length);
  return {setValues:values=>{
   assert.equal(values.length,count);
   for(let i=0;i<count;i++)attendance[row+i-1]=[...values[i]];
  }};
 }
};
const rowToRecord=(headers,row)=>Object.fromEntries(headers.map((k,i)=>[k,row[i]]));
const recordToRow=(headers,obj)=>headers.map(k=>obj[k]??'');
const tzDay=(date,tz)=>{
 const fmt=new Intl.DateTimeFormat('en-US',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'});
 const parts=fmt.formatToParts(date),read=t=>parts.find(p=>p.type===t).value;
 return read('year')+'-'+read('month')+'-'+read('day');
};
const deps={
 resolveContext:p=>({role:'school',schoolId:p.schoolId,
  ss:{getSpreadsheetTimeZone:()=> 'Asia/Karachi'}}),
 checkPermission:(_ctx,action,col)=>{assert.equal(action,'add');assert.equal(col,'attendance')},
 LockService:{getScriptLock:()=>({tryLock:()=>{assert.equal(locks,0);locks++;return true},
  releaseLock:()=>{locks--;}})},
 getCollectionSheet:(_ctx,col)=>col==='students'?{sheet:roster,headers:rosterHeaders}:
  {sheet:attendanceSheet,headers:attendanceHeaders},
 rowToRecord,recordToRow,genId:()=> 'att-'+(++ids),
 Session:{getScriptTimeZone:()=> 'UTC'},
 Utilities:{formatDate:(d,tz)=>tzDay(d,tz)},
 SpreadsheetApp:{flush:()=>{flushes++}},
 syncAttendanceParentNotifications:()=>{notifications++;return {created:0,updated:0,error:''}}
};
const funcs=new Function(...Object.keys(deps),src+
 'return {bulkAttendanceRecords,readAttendanceDateRecords_};')(...Object.values(deps));
const day='2026-11-10',batch=schoolStudents.map((s,i)=>({
 studentId:s[0],enrlNo:s[1],date:day,status:i<20?'Present':'Absent'
}));
const request={role:'school',schoolId:'school-one',date:day,records:batch};
const result=funcs.bulkAttendanceRecords(request);
assert.equal(result.saved,38);
assert.equal(result.inserted,38);
assert.equal(result.updated,0);
assert.equal(result.verification,'confirmed');
assert.equal(result.verifiedDateRecords.length,38);
assert.equal(result.verifiedDateRecords.filter(r=>r.status==='Present').length,20);
assert.equal(result.verifiedDateRecords.filter(r=>r.status==='Absent').length,18);
assert.equal(attendance.length,39);
assert.equal(locks,0);
assert.equal(notifications,1);
// Readback of a true Sheets Date representing local midnight Nov 10 must
// NEVER be interpreted as Nov 9 in Pakistan.
const firstRow=attendance[1];
const dateIndex=attendanceHeaders.indexOf('date');
firstRow[dateIndex]=new Date('2026-11-09T19:00:00Z');
const localRows=funcs.readAttendanceDateRecords_(deps.resolveContext(request),day);
assert.equal(localRows.length,38);
assert.equal(localRows.find(r=>r.studentId==='s1').date,day);
assert.equal(tzDay(firstRow[dateIndex],'Asia/Karachi'),day);
assert.throws(()=>funcs.readAttendanceDateRecords_(deps.resolveContext(request),'2026-02-30'),/Invalid attendance date/);
// A second request may repeat an acknowledged batch, but cannot append
// another set of students for the same date.
const again=funcs.bulkAttendanceRecords(request);
assert.equal(again.inserted,0);
assert.equal(again.updated,38);
assert.equal(attendance.length,39,'Repeated batch must not append duplicates');
assert.equal(again.verifiedDateRecords.length,38);
attendance.push([...attendance[1]]);
assert.throws(()=>funcs.bulkAttendanceRecords(request),/Existing duplicate attendance/);
attendance.pop();
stale=true;
assert.throws(()=>funcs.bulkAttendanceRecords(request),/could not be independently verified/);
assert.equal(locks,0,'All script locks must release on uncertain writes');
assert.equal(notifications,2,'Notification work must not run after uncertain readback');
// The date-only read action must require existing admin authorization and POST.
const master=fs.readFileSync(path.join(__dirname,'code.gs'),'utf8');
assert.ok(master.includes("case 'attendanceDateSnapshot':"));
assert.ok(master.includes('records:readAttendanceDateRecords_(resolveContext(params),params.date)'));
const get=master.slice(master.indexOf('function doGet(e)'));
assert.ok(get.includes("'attendanceDateSnapshot'"),'Token-bearing date read must not be accepted by GET');
console.log('PASS: 38 marks save once, 20 present/18 absent verified from Sheets, local dates stable, duplicate and stale readback blocked.');
