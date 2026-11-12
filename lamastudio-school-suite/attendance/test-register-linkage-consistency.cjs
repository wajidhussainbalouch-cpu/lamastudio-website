'use strict';
/** Shared-day, mismatched-ID attendance consistency checks using only fake data.
 * Never calls the real school backend and never writes a spreadsheet. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const studentSource=fs.readFileSync(path.join(__dirname,'student-attendance-v2.html'),'utf8');
const teacherSource=fs.readFileSync(path.join(__dirname,'teacher-attendance.html'),'utf8');
const dashboardSource=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
function section(s,a,b){const st=s.indexOf(a),en=s.indexOf(b,st+a.length);
 assert.ok(st>=0&&en>st,'Missing source span: '+a);
 return s.slice(st,en);
}
const day='2026-11-12',students=[
 {id:'student-new',enrlNo:'1',name:'Ali',class:'4'},
 {id:'s2',enrlNo:'2',name:'Rukhsana',class:'Playgroup'},
 {id:'s3',enrlNo:'3',name:'Jabir',class:'Playgroup'}
];
const state={students,chosen:new Map(),linkageWarnings:new Map(),history:[]};
const id=s=>String(s.id),enr=s=>String(s.enrlNo),status=v=>{
 const value=String(v??'').trim().toLowerCase();
 return ['present','p'].includes(value)?'Present':['absent','a'].includes(value)?'Absent':['leave','l','on leave'].includes(value)?'Leave':'';
};
const fn=new Function('state','id','enr','status','asDate',
 section(studentSource,'function hydrateSavedDate(rows,date){','/**\n * Prefer a small admin-only day snapshot.')+
 'return hydrateSavedDate;')(state,id,enr,status,v=>String(v||'').slice(0,10));
const stale=[{id:'attendance1',studentId:'student-old',enrlNo:'1',date:day,status:'Absent'}];
fn(stale,day);
assert.equal(state.chosen.size,0,'Stale student ID must not be counted as confirmed by enrollment alone');
assert.match(state.linkageWarnings.get('student-new'),/different Student ID/);
fn([{id:'attendance1',studentId:'student-new',enrlNo:'1',date:day,status:'absent'}],day);
assert.equal(state.chosen.get('student-new').status,'Absent','Matching ID and enrollment must resolve once');
assert.equal(state.linkageWarnings.size,0);
fn([
 {id:'a',studentId:'student-new',enrlNo:'1',date:day,status:'Absent'},
 {id:'b',studentId:'student-new',enrlNo:'1',date:day,status:'Present'}
],day);
assert.equal(state.chosen.size,0,'Two conflicting saved records must not be verified');
assert.match(state.linkageWarnings.get('student-new'),/Multiple saved rows/);
const teacherStatusSource=section(teacherSource,'const status=r=>','const reason=r=>');
const teacherStatus=new Function(teacherStatusSource+'return status;')();
assert.equal(teacherStatus({status:'present'}),'Present');
assert.equal(teacherStatus({status:' ON LEAVE ' }),'Leave');
assert.equal(teacherStatus({status:' absent ' }),'Absent');

const elements=new Map();
const document={getElementById:key=>{
 if(!elements.has(key))elements.set(key,{textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){}}});
 return elements.get(key);
}};
const normalizeAttendanceDate=v=>String(v||'').slice(0,10);
const esc=v=>String(v??'');
const studentRenderer=new Function('document','localISODate','normalizeAttendanceDate','esc',
 section(dashboardSource,'function renderStudentAttendanceCard(attendance,students,attendanceLoaded=true){','function normalizeAttendanceDate(value){')+
 'return renderStudentAttendanceCard;')(document,()=>day,normalizeAttendanceDate,esc);
studentRenderer(stale,students);
const elt=id=>document.getElementById(id);
assert.equal(elt('studentAttAbsent').textContent,0,'Dashboard must not count a saved row with a mismatched student ID');
assert.equal(elt('studentAttUnmarked').textContent,3);
assert.match(elt('studentAttHint').textContent,/Verification warning: 1 student attendance row/);
assert.doesNotMatch(elt('dashboardAbsentFollowup').innerHTML,/Ali ·/,'No parent followup for unverified linkage');
studentRenderer([{id:'attendance2',studentId:'student-new',enrlNo:'1',date:day,status:'Absent'}],students);
assert.equal(elt('studentAttAbsent').textContent,1);
assert.equal(elt('studentAttUnmarked').textContent,2);
const teacherRenderer=new Function('document','localISODate','normalizeAttendanceDate','Chart','destroyChart',
 section(dashboardSource,'function renderTeacherAttendanceAnalytics(teachers,records,attendanceLoaded=true){','async function renderAssessmentExtraOverview(){')+
 'return renderTeacherAttendanceAnalytics;')(document,()=>day,normalizeAttendanceDate,undefined,()=>{});
const teachers=[{id:'teacher-new',name:'Zahid',assignedClass:'4'},{id:'t2',name:'Tahira',assignedClass:'Playgroup'}];
teacherRenderer(teachers,[{teacherId:'teacher-old',date:day,status:'Leave'}],true);
assert.equal(elt('taTotal').textContent,2);
assert.equal(elt('taPresent').textContent,0);
assert.equal(elt('taLeave').textContent,0,'Unmatched teacher IDs must never appear as verified leave');
assert.match(elt('taCoverage').textContent,/Saved teacher IDs do not match roster/);
assert.doesNotMatch(elt('dashboardStaffFollowup').innerHTML,/Zahid ·/);
teacherRenderer(teachers,[{teacherId:'teacher-new',date:day,status:'Leave'}],true);
assert.equal(elt('taLeave').textContent,1);
console.log('PASS: dashboard and register agree about verified vs stale student IDs; unlinked teacher IDs are not counted, and status casing is normalized.');
