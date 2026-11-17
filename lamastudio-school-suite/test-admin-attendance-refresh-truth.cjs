'use strict';
// Synthetic dashboard data only. Does not access or modify a real school sheet.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'dashboard.html'),'utf8');
function section(from,to){
 const a=src.indexOf(from),b=src.indexOf(to,a+from.length);
 assert.ok(a>=0&&b>a,'Missing source: '+from);
 return src.slice(a,b);
}
const nodes=new Map();
const document={getElementById:key=>{
 if(!nodes.has(key))nodes.set(key,{
  innerHTML:'',textContent:'',innerText:'',style:{},classList:{add(){},remove(){},toggle(){}}
 });
 return nodes.get(key);
}};
const $=id=>document.getElementById(id);
const window={__dashboardSchoolTimeZone:'Asia/Karachi',__dashboardVerified:{students:true,teachers:true,attendance:true,teacherAttendance:true}};
const localISODate=()=> '2026-11-17';
const dateFns=new Function('window','Intl','console',
 section('function schoolTeacherAttendanceDay(value){','function renderTeacherAttendanceAnalytics(teachers,records,meta=null){')+
 'return {schoolTeacherAttendanceDay,schoolTeacherToday};'
)(window,Intl,console);
const schoolDay=dateFns.schoolTeacherAttendanceDay;
assert.equal(schoolDay('2026-11-17'),'2026-11-17');
assert.equal(schoolDay('2026-11-16T19:00:00.000Z'),'2026-11-17','UTC native Sheets date must match Pakistan school day');
assert.equal(schoolDay('17/11/2026'),'2026-11-17','DD/MM/YYYY supported');
assert.equal(schoolDay('11/17/2026'),'2026-11-17','Unambiguous MM/DD/YYYY Sheets date supported');
assert.equal(schoolDay('2026-02-31'),'2026-02-31'); // Date-only keys are preserved without reinterpreting them.
assert.equal(schoolDay('31/02/2026'),'','Impossible split date must be rejected.');
const reportStaff=new Function('document','window','schoolTeacherToday','schoolTeacherAttendanceDay','destroyChart','charts','chartDefaults','Chart',
 section('function renderTeacherAttendanceAnalytics(teachers,records,meta=null){','async function renderAssessmentExtraOverview(){')+
 'return renderTeacherAttendanceAnalytics;'
)(document,window,()=> '2026-11-17',schoolDay,()=>{}, {},()=>({}),undefined);
const teachers=Array.from({length:7},(_,i)=>({id:'t'+(i+1),name:'Teacher '+(i+1),assignedClass:String(i+1),status:'Active'}));
const staff=teachers.map(t=>({teacherId:t.id,date:'2026-11-16T19:00:00.000Z',status:'Present'}));
reportStaff(teachers,staff,{verified:true,rosterVerified:true});
assert.equal($('teacherAttDisplay').textContent,'7 / 7','Saved 7/7 must survive the UTC Sheets date conversion');
assert.equal($('notMarkedDisplay').textContent,'0 not marked today');
assert.equal($('taCoverage').textContent,'7 / 7 marked · 100% coverage');
reportStaff(teachers,[],{verified:false,rosterVerified:true});
assert.equal($('teacherAttDisplay').textContent,'— / 7','Failed read must not become false 0/7');
assert.match($('notMarkedDisplay').textContent,/not verified/i);
assert.match($('taPending').textContent,/could not be loaded/i);
reportStaff(teachers,[],{verified:true,rosterVerified:true});
assert.equal($('teacherAttDisplay').textContent,'0 / 7','Successful empty read is different from a failed read');
staff.push({teacherId:'t1',date:'2026-11-17',status:'Absent'});
reportStaff(teachers,staff,{verified:true,rosterVerified:true});
assert.equal($('teacherAttDisplay').textContent,'6 / 7','Duplicates cannot be silently overwritten');
assert.match($('notMarkedDisplay').textContent,/need review/);
assert.match($('taPending').textContent,/duplicate/);
const mismatched=teachers.map((t,i)=>({teacherId:'other'+i,date:'2026-11-17',status:'Present'}));
reportStaff(teachers,mismatched,{verified:true,rosterVerified:true});
assert.equal($('teacherAttDisplay').textContent,'— / 7','Unmatched teacher IDs must never be called 0/7 or 7/7');
assert.match($('taPending').textContent,/do not match/i);
const norm=new Function(section('function normalizeAttendanceDate(value){','function schoolTeacherAttendanceDay(value){')+
 'return normalizeAttendanceDate;')();
const studentReport=new Function('document','window','localISODate','normalizeAttendanceDate','classAttendanceUrl','esc',
 section('function renderStudentAttendanceCard(attendance,students,meta=null){','function normalizeAttendanceDate(value){')+
 'return renderStudentAttendanceCard;'
)(document,window,localISODate,norm,(name,day)=>'/attendance?class='+encodeURIComponent(name)+'&date='+day,v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
const students=[
 ...Array.from({length:7},(_,i)=>({id:'s'+(i+1),enrlNo:String(i+1),name:'Learner '+(i+1),class:'1'})),
 ...Array.from({length:6},(_,i)=>({id:'s'+(i+8),enrlNo:String(i+8),name:'Learner '+(i+8),class:'5'})),
 ...Array.from({length:20},(_,i)=>({id:'s'+(i+14),enrlNo:String(i+14),name:'Learner '+(i+14),class:'3'}))
];
const studentMarks=students.slice(0,13).map((st,i)=>({studentId:st.id,date:'2026-11-17',status:i<7?'Present':'Absent'}));
studentReport(studentMarks,students,{verified:true});
assert.equal($('attendanceRatioDisplay').textContent,'54%','Seven of thirteen marked students = 54%');
assert.equal($('studentAttUnmarked').textContent,20);
assert.equal($('absentTodayCount').textContent,'6 absent among marked');
assert.match($('attendanceCompletionNote').textContent,/13 \/ 33 students marked/);
assert.match($('attendanceCompletionNote').textContent,/2 \/ 3 classes complete/);
assert.match($('studentAttClassCount').textContent,/2 \/ 3 classes complete/);
studentReport(studentMarks,students,{verified:false});
assert.equal($('attendanceRatioDisplay').textContent,'—');
assert.match($('absentTodayCount').textContent,/not verified/);
assert.match($('dashboardAbsentFollowup').textContent,/requires verified/);
studentReport([...studentMarks,{studentId:'s1',date:'2026-11-17',status:'Absent'}],students,{verified:true});
assert.equal($('studentAttPresent').textContent,6,'Conflicting student mark cannot be treated as verified present');
assert.match($('studentAttHint').textContent,/duplicate student attendance/);
const load=new Function('LamaAPI','console',
 section('async function verifiedRegisterList(key){','function handleLogout(){')+'return verifiedRegisterList;'
)({list:async(key)=>{if(key==='teacherAttendance')throw Error('Sheet timeout');if(key==='attendance')return [];return {records:[{id:'record-1'}]}}}, {warn(){}});
(async()=>{
 const failed=await load('teacherAttendance');assert.equal(failed.ok,false);assert.equal(failed.rows.length,0);
 const trulyEmpty=await load('attendance');assert.equal(trulyEmpty.ok,true);assert.equal(trulyEmpty.rows.length,0);
 const populated=await load('teachers');assert.equal(populated.ok,true);assert.equal(populated.rows.length,1);
 const scripts=[...src.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
 for(const script of scripts)new vm.Script(script,{filename:'dashboard inline'});
 console.log('PASS: 7/7 school-date normalization, error vs empty state, partial-class rates, duplicate quarantine and full dashboard JavaScript parsing.');
})().catch(error=>{console.error(error);process.exitCode=1});
