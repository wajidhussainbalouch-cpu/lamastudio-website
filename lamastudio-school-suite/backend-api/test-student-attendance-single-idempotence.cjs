/*
 * Simulates the actual single-student attendance Add path with a lock,
 * ambiguous retries, duplicate cloud rows and class authorization.
 * No school data or Apps Script instance is accessed.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const backend=fs.readFileSync(path.join(__dirname,'code.gs'),'utf8');
const a=backend.indexOf('function addStudentAttendanceOnce_(ctx, submitted) {');
const b=backend.indexOf('function addRecord(ctx, collection, record) {',a);
assert.ok(a>=0&&b>a,'The new attendance source function is missing');
const rosterHeaders=['id','enrlNo','name','class','section'];
const roster=[rosterHeaders,['s1','2','Pupil One','Playgroup',''],['s2','3','Pupil Two','Playgroup',''],['s3','4','Pupil Three','Class 5','']];
const headers=['id','studentId','enrlNo','studentName','class','section','date','status','markedBy','createdAt'];
let rows=[headers],inLock=false,appended=0,flushes=0,idx=0;
const sheet={getDataRange:()=>({getValues:()=>rows.map(x=>[...x])}),
 appendRow:values=>{rows.push([...values]);appended++;}};
const studentSheet={getDataRange:()=>({getValues:()=>roster.map(x=>[...x])})};
const record=(h,v)=>Object.fromEntries(h.map((key,i)=>[key,v[i]]));
const recordToRow=(h,obj)=>h.map(key=>obj[key]??'');
const mock={
 LockService:{getScriptLock:()=>({tryLock:()=>{assert.equal(inLock,false);inLock=true;return true;},releaseLock:()=>{assert.equal(inLock,true);inLock=false;}})},
 getCollectionSheet:(_ctx,name)=>name==='students'?{sheet:studentSheet,headers:rosterHeaders}:{sheet,headers},
 rowToRecord:record,recordToRow,genId:()=> 'att-'+(++idx),
 SpreadsheetApp:{flush:()=>{flushes++;}},
 Session:{getScriptTimeZone:()=> 'Asia/Karachi'},
 Utilities:{formatDate:()=> '2026-11-10'},
 teacherStudentAccess_:(ctx,info)=>{
  const student=roster.slice(1).map(x=>record(rosterHeaders,x)).find(r=>r.id===info.studentId);
  if(!student||student.class!==ctx.teacher.assignedClass)throw Error('Student outside assigned class');
  return student;
 },
 writeAudit:()=>{}
};
const save=new Function(...Object.keys(mock),backend.slice(a,b)+'return addStudentAttendanceOnce_;')(...Object.values(mock));
const teacher={role:'teacher',teacher:{name:'Teacher A',assignedClass:'Playgroup'},schoolId:'school-one',ss:{getSpreadsheetTimeZone:()=> 'Asia/Karachi'}};
const day='2026-11-10',request={studentId:'s1',enrlNo:'2',date:day,status:'Present'};
const first=save(teacher,request);
assert.equal(first.studentId,'s1');
assert.equal(appended,1);
assert.equal(rows.length,2);
const repeated=save(teacher,request);
assert.equal(repeated.id,first.id,'Retried HTTP POST must return the same attendance record');
assert.equal(appended,1,'Ambiguous HTTP retry must never append another student/day');
assert.equal(flushes,1,'An exact repeat should not write to Sheets');
assert.throws(()=>save(teacher,{...request,status:'Absent'}),/different status/);
assert.equal(appended,1,'Conflicting marks must never overwrite');
assert.throws(()=>save(teacher,{...request,date:'2026-02-30'}),/Invalid attendance date/);
assert.throws(()=>save(teacher,{...request,status:'Unknown'}),/Invalid attendance status/);
assert.throws(()=>save(teacher,{...request,studentId:'s3',enrlNo:'4'}),/outside assigned class/);
assert.equal(appended,1);
const second=save(teacher,{studentId:'s2',enrlNo:'3',date:day,status:'Absent'});
assert.equal(second.studentId,'s2');
assert.equal(appended,2);
rows.push([...rows[1]]);
assert.throws(()=>save(teacher,request),/Existing duplicate attendance/);
assert.equal(inLock,false,'The Sheets script lock must be released on all errors');
assert.ok(backend.includes("if (collection === 'attendance') return addStudentAttendanceOnce_(ctx,record)"));
console.log('PASS: existing student/day add reuses row, rejects conflicting status/class, prevents duplicates and releases locks.');
