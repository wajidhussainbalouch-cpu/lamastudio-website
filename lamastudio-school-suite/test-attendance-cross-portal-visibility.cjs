'use strict';
// Simulated shared Google Sheets rows. NEVER writes to a real school database.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname;
const admin=fs.readFileSync(path.join(root,'attendance/student-attendance-v2.html'),'utf8');
const teacher=fs.readFileSync(path.join(root,'portals/teacher/index.html'),'utf8');
const helper=fs.readFileSync(path.join(root,'js/teacher-register-helpers.js'),'utf8');
function between(text,a,b){const start=text.indexOf(a),end=text.indexOf(b,start+a.length);assert.ok(start>=0&&end>start,'Missing source '+a);return text.slice(start,end)}
const parts=[
 between(admin,'const id=s=>','const asDate=v=>'),
 between(admin,'const asDate=v=>','const array=v=>'),
 between(admin,'const status=x=>','function verifiedCard(raw){'),
 between(admin,'function inspectSavedDayAttendance(rows,students,day){','function attendanceHoldKey(){')
];
const parseAdmin=new Function('LamaAPI','Intl','console',parts.join('\n')+'return {inspect:inspectSavedDayAttendance,asDate,id,cls};');
const adminApi=parseAdmin({getSession:()=>({timezone:'Asia/Karachi'})},Intl,{warn(){}});
const teacherCtx={window:{LamaTeacherSchoolTimeZone:'Asia/Karachi'}};
vm.createContext(teacherCtx);vm.runInContext(helper,teacherCtx);
const teacherApi=teacherCtx.window.LamaTeacherRegister;
const allStudents=[
 {id:'s-001',enrlNo:'1',name:'Ali',class:'4',gender:'Male',fatherGuardian:'Rehman'},
 {id:'s-002',enrlNo:'2',name:'Sara',class:'4',gender:'Female',fatherGuardian:'Parent Sara'},
 {id:'s-003',enrlNo:'9',name:'Bilal',class:'5',gender:'Male',fatherGuardian:'Parent Bilal'}
];
const selectedClass=allStudents.filter(s=>s.class==='4');
const iso='2026-11-17';
const sheetTimestamp='2026-11-16T19:00:00.000Z'; // Google Sheets midnight in Pakistan
let sharedSheet=[]; // Both portal loaders consume exactly these saved rows.
function upsert(studentId,status){
 const index=sharedSheet.findIndex(r=>r.studentId===studentId);
 const student=allStudents.find(s=>s.id===studentId);
 assert.ok(student);
 const row={
  id:'att-'+studentId,schoolId:'school-A',studentId:student.id,
  enrlNo:student.enrlNo,class:student.class,section:'',date:sheetTimestamp,
  status,studentName:student.name
 };
 if(index>=0)sharedSheet[index]=row;else sharedSheet.push(row);
}
function adminRead(students=allStudents){return adminApi.inspect(sharedSheet,students,iso)}
function teacherRead(){return teacherApi.snapshot(sharedSheet.filter(r=>r.class==='4'),selectedClass,iso)}
function selectedStatus(result,id){return result.chosen.get(id)?.status}
function teacherStatus(result,id){return result.unique.get(id)?.status}
// School Admin saves all three students (including Class 5).
upsert('s-001','Present');upsert('s-002','Absent');upsert('s-003','Leave');
let adminAll=adminRead(),teacherClass=teacherRead(),adminClass=adminRead(selectedClass);
assert.equal(adminAll.chosen.size,3,'All classes must display all verified marks');
assert.equal(adminClass.chosen.size,2,'Admin Class 4 displays only Class 4 students');
assert.equal(teacherClass.unique.size,2,'Teacher class view displays 2 students, not whole-school 3');
assert.equal(teacherStatus(teacherClass,'s-001'),'Present','Teacher must see admin-saved Present');
assert.equal(teacherStatus(teacherClass,'s-002'),'Absent','Teacher must see admin-saved Absent');
assert.equal(selectedStatus(adminAll,'s-003'),'Leave','Whole-school register preserves Class 5');
assert.equal(teacherApi.day(sheetTimestamp),iso,'Both portals must resolve a Google Sheets timestamp to the school date');
assert.equal(adminApi.asDate(sheetTimestamp),iso,'Admin uses the same school-local date');
// Teacher corrects student S002 from Absent to Present.
upsert('s-002','Present');
adminAll=adminRead();teacherClass=teacherRead();
assert.equal(selectedStatus(adminAll,'s-002'),'Present','Admin whole-school view must see teacher correction');
assert.equal(selectedStatus(adminRead(selectedClass),'s-002'),'Present','Admin Class 4 view must see teacher correction');
// Admin corrects S001 from Present to Absent.
upsert('s-001','Absent');
teacherClass=teacherRead();
assert.equal(teacherStatus(teacherClass,'s-001'),'Absent','Teacher must see admin correction after reloading');
assert.equal(selectedStatus(adminRead(),'s-001'),'Absent');
assert.equal(adminRead().chosen.size,3,'Correction must update an existing row, not append another');
const completionSource=between(admin,'function renderRegisterCount(visibleCount,totalCount){','function renderTotals(all){');
const countNode={textContent:''};
const selectNode={value:''};
const renderCountFactory=new Function('state','classStudents','select','id','registerNeedsReview',
 completionSource.replaceAll(String.fromCharCode(36),'select')+'return renderRegisterCount;');
const allResult=adminRead();
const selected=allResult.chosen;
const fullCount=renderCountFactory({chosen:selected,conflicts:new Map(),dirty:new Set(),historyReady:true},
 ()=>allStudents,key=>key==='count'?countNode:selectNode,adminApi.id,()=>false);
fullCount(3,3);
assert.match(countNode.textContent,/attendance completed/,'Whole school completed when all registered marks are saved');
selected.delete('s-003');
fullCount(3,3);
assert.match(countNode.textContent,/attendance partly marked/,'Incomplete school cannot be called completed');
const classCount=renderCountFactory({chosen:adminRead(selectedClass).chosen,conflicts:new Map(),dirty:new Set(),historyReady:true},
 ()=>selectedClass,key=>key==='count'?countNode:({value:'4'}),adminApi.id,()=>false);
classCount(2,2);
assert.match(countNode.textContent,/students in 4.*attendance completed/,'Class 4 completed independently of Class 5');

assert.equal(teacherApi.totals(selectedClass,teacherClass,new Map()).Absent.total,1);
assert.equal(teacherApi.totals(selectedClass,teacherClass,new Map()).Absent.boys,1);
assert.equal(teacherApi.totals(selectedClass,teacherClass,new Map()).Present.girls,1);
// An ambiguous historical duplicate must NOT pick first/last across roles.
sharedSheet.push({...sharedSheet[0],id:'duplicate-legacy',status:'Present'});
assert.equal(adminRead().conflicts.size,1,'Admin detects duplicate student/date');
assert.equal(teacherRead().duplicates.size,1,'Teacher detects same duplicate');
assert.equal(adminRead().chosen.has('s-001'),false);
assert.equal(teacherRead().unique.has('s-001'),false);
// Backend prevents teacher from reading other class; frontend reinforces boundary.
const fn=between(teacher,'function scopedAttendanceRows(rows){','async function loadSavedAttendance(expected=null){');
const classMatcher=new Function('rows','myStudents','teacherClass','schoolId',
 'const schoolMatch=r=>!r.schoolId||r.schoolId===schoolId;'+
 'const classMatch=r=>r.class===teacherClass;'+
 'const myStudent=id=>myStudents.find(s=>s.id===id);'+
 'const TeacherRegister={enrollment:s=>s.enrlNo};'+
 fn+'return scopedAttendanceRows(rows);');
const scoped=classMatcher(sharedSheet,selectedClass,'4','school-A');
assert.equal(scoped.length,3,'Class 5 mark excluded, Class 4 duplicate retained for review');
assert.ok(scoped.every(r=>r.class==='4'));
const unknown={id:'att-unknown',schoolId:'school-A',studentId:'missing',class:'4',date:iso,status:'Present'};
const scopedUnknown=classMatcher([...sharedSheet,unknown],selectedClass,'4','school-A');
assert.ok(scopedUnknown.includes(unknown),'Unknown saved Class 4 IDs must be surfaced, not silently dropped');
assert.equal(teacherApi.snapshot(scopedUnknown,selectedClass,iso).unmatched.length,1);
assert.match(teacher,/Date\.now\(\)-lastAttendanceVerifiedAt>15000/,'Teacher reopens Attendance to re-read recent admin marks');
assert.match(teacher,/if\(t==='attendance'/,'Teacher attendance tab must have refresh-on-open');
assert.match(admin,/\$\('class'\)\.value/,'Admin attendance register supports selected class filter');
const scripts=[...admin.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
for(const snippet of scripts)new vm.Script(snippet,{filename:'admin attendance inline'});
const teacherScripts=[...teacher.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
for(const snippet of teacherScripts)new vm.Script(snippet,{filename:'teacher attendance inline'});
console.log('PASS: Admin→teacher marks, teacher→admin updates, whole-school/class counts, school timezone, duplicate holds and class isolation.');
,'id','registerNeedsReview',
 completionSource+'return renderRegisterCount;')(
 {chosen:checked.chosen,conflicts:checked.conflicts,dirty:new Set(),historyReady:true},
 ()=>allStudents,key=>key==='count'?countNode:classInput,adminApi.id,()=>false
);
renderCount(3,3);
assert.match(countNode.textContent,/attendance completed/,'Whole-school register displays completion after all classes saved');
const chosen=checked.chosen;
chosen.delete('s-003');
renderCount(3,3);
assert.match(countNode.textContent,/attendance partly marked/,'One unmarked class must not be called whole-school complete');
const renderClassCount=new Function('state','classStudents','
assert.equal(teacherApi.totals(selectedClass,teacherClass,new Map()).Absent.total,1);
assert.equal(teacherApi.totals(selectedClass,teacherClass,new Map()).Absent.boys,1);
assert.equal(teacherApi.totals(selectedClass,teacherClass,new Map()).Present.girls,1);
// An ambiguous historical duplicate must NOT pick first/last across roles.
sharedSheet.push({...sharedSheet[0],id:'duplicate-legacy',status:'Present'});
assert.equal(adminRead().conflicts.size,1,'Admin detects duplicate student/date');
assert.equal(teacherRead().duplicates.size,1,'Teacher detects same duplicate');
assert.equal(adminRead().chosen.has('s-001'),false);
assert.equal(teacherRead().unique.has('s-001'),false);
// Backend prevents teacher from reading other class; frontend reinforces boundary.
const fn=between(teacher,'function scopedAttendanceRows(rows){','async function loadSavedAttendance(expected=null){');
const classMatcher=new Function('rows','myStudents','teacherClass','schoolId',
 'const schoolMatch=r=>!r.schoolId||r.schoolId===schoolId;'+
 'const classMatch=r=>r.class===teacherClass;'+
 'const myStudent=id=>myStudents.find(s=>s.id===id);'+
 'const TeacherRegister={enrollment:s=>s.enrlNo};'+
 fn+'return scopedAttendanceRows(rows);');
const scoped=classMatcher(sharedSheet,selectedClass,'4','school-A');
assert.equal(scoped.length,3,'Class 5 mark excluded, Class 4 duplicate retained for review');
assert.ok(scoped.every(r=>r.class==='4'));
const unknown={id:'att-unknown',schoolId:'school-A',studentId:'missing',class:'4',date:iso,status:'Present'};
const scopedUnknown=classMatcher([...sharedSheet,unknown],selectedClass,'4','school-A');
assert.ok(scopedUnknown.includes(unknown),'Unknown saved Class 4 IDs must be surfaced, not silently dropped');
assert.equal(teacherApi.snapshot(scopedUnknown,selectedClass,iso).unmatched.length,1);
assert.match(teacher,/Date\.now\(\)-lastAttendanceVerifiedAt>15000/,'Teacher reopens Attendance to re-read recent admin marks');
assert.match(teacher,/if\(t==='attendance'/,'Teacher attendance tab must have refresh-on-open');
assert.match(admin,/\$\('class'\)\.value/,'Admin attendance register supports selected class filter');
const scripts=[...admin.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
for(const snippet of scripts)new vm.Script(snippet,{filename:'admin attendance inline'});
const teacherScripts=[...teacher.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
for(const snippet of teacherScripts)new vm.Script(snippet,{filename:'teacher attendance inline'});
console.log('PASS: Admin→teacher marks, teacher→admin updates, whole-school/class counts, school timezone, duplicate holds and class isolation.');
,'id','registerNeedsReview',
 completionSource+'return renderRegisterCount;')(
 {chosen:adminRead(selectedClass).chosen,conflicts:new Map(),dirty:new Set(),historyReady:true},
 ()=>selectedClass,key=>key==='count'?countNode:({value:'4'}),adminApi.id,()=>false
);
renderClassCount(2,2);
assert.match(countNode.textContent,/students in 4.+attendance completed/,'Selected class completion is independent of other classes');

assert.equal(teacherApi.totals(selectedClass,teacherClass,new Map()).Absent.total,1);
assert.equal(teacherApi.totals(selectedClass,teacherClass,new Map()).Absent.boys,1);
assert.equal(teacherApi.totals(selectedClass,teacherClass,new Map()).Present.girls,1);
// An ambiguous historical duplicate must NOT pick first/last across roles.
sharedSheet.push({...sharedSheet[0],id:'duplicate-legacy',status:'Present'});
assert.equal(adminRead().conflicts.size,1,'Admin detects duplicate student/date');
assert.equal(teacherRead().duplicates.size,1,'Teacher detects same duplicate');
assert.equal(adminRead().chosen.has('s-001'),false);
assert.equal(teacherRead().unique.has('s-001'),false);
// Backend prevents teacher from reading other class; frontend reinforces boundary.
const fn=between(teacher,'function scopedAttendanceRows(rows){','async function loadSavedAttendance(expected=null){');
const classMatcher=new Function('rows','myStudents','teacherClass','schoolId',
 'const schoolMatch=r=>!r.schoolId||r.schoolId===schoolId;'+
 'const classMatch=r=>r.class===teacherClass;'+
 'const myStudent=id=>myStudents.find(s=>s.id===id);'+
 'const TeacherRegister={enrollment:s=>s.enrlNo};'+
 fn+'return scopedAttendanceRows(rows);');
const scoped=classMatcher(sharedSheet,selectedClass,'4','school-A');
assert.equal(scoped.length,3,'Class 5 mark excluded, Class 4 duplicate retained for review');
assert.ok(scoped.every(r=>r.class==='4'));
const unknown={id:'att-unknown',schoolId:'school-A',studentId:'missing',class:'4',date:iso,status:'Present'};
const scopedUnknown=classMatcher([...sharedSheet,unknown],selectedClass,'4','school-A');
assert.ok(scopedUnknown.includes(unknown),'Unknown saved Class 4 IDs must be surfaced, not silently dropped');
assert.equal(teacherApi.snapshot(scopedUnknown,selectedClass,iso).unmatched.length,1);
assert.match(teacher,/Date\.now\(\)-lastAttendanceVerifiedAt>15000/,'Teacher reopens Attendance to re-read recent admin marks');
assert.match(teacher,/if\(t==='attendance'/,'Teacher attendance tab must have refresh-on-open');
assert.match(admin,/\$\('class'\)\.value/,'Admin attendance register supports selected class filter');
const scripts=[...admin.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
for(const snippet of scripts)new vm.Script(snippet,{filename:'admin attendance inline'});
const teacherScripts=[...teacher.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
for(const snippet of teacherScripts)new vm.Script(snippet,{filename:'teacher attendance inline'});
console.log('PASS: Admin→teacher marks, teacher→admin updates, whole-school/class counts, school timezone, duplicate holds and class isolation.');
