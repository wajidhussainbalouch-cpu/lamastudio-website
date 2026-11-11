/**
 * Admin dashboard attendance KPI and token-only checklist regression.
 * Only fake records; no network/database writes.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'dashboard.html'),'utf8');
const start=html.indexOf('function renderStudentAttendanceCard(attendance,students,attendanceLoaded=true){');
const end=html.indexOf('function normalizeAttendanceDate(value){',start);
assert.ok(start>=0&&end>start,'Admin attendance renderer not found');
const elements=new Map();
const getElementById=id=>{
 if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){}}});
 return elements.get(id);
};
const document={getElementById};
const today='2026-11-11';
const render=new Function('document','localISODate','normalizeAttendanceDate','esc',
 html.slice(start,end)+'return renderStudentAttendanceCard;')(
 document,()=>today,v=>String(v||'').slice(0,10),v=>String(v??''));
const students=[
 {id:'s1',enrlNo:'2',class:'Playgroup',name:'Rukhsana'},
 {id:'s2',enrlNo:'3',class:'Playgroup',name:'Jabir'},
 {id:'s3',enrlNo:'4',class:'4',name:'Third Pupil'}
];
const records=[
 {studentId:'s1',date:today,status:'Present'},
 {studentId:'s2',date:today,status:'Present'}
];
render(records,students);
assert.equal(getElementById('studentAttRate').textContent,'67%');
assert.equal(getElementById('attendanceRatioDisplay').textContent,'67%');
assert.equal(getElementById('studentAttPresent').textContent,2);
assert.equal(getElementById('studentAttUnmarked').textContent,1);
assert.match(getElementById('studentAttHint').textContent,/Present among marked: 100%/);
assert.match(getElementById('studentAttClasses').innerHTML,/0\/1 marked/);
render([...records,{studentId:'s3',date:today,status:'Absent'}],students);
assert.equal(getElementById('studentAttRate').textContent,'100%');
assert.equal(getElementById('studentAttAbsent').textContent,1);
assert.equal(getElementById('studentAttUnmarked').textContent,0);
assert.match(getElementById('studentAttHint').textContent,/Present among marked: 67%/);
render([],students);
assert.equal(getElementById('studentAttRate').textContent,'0%');
assert.match(getElementById('studentAttHint').textContent,/0 of 3 students marked/);
render(records,students,false);
assert.equal(getElementById('studentAttRate').textContent,'—','Failed attendance read must not look like 0%');
assert.equal(getElementById('studentAttPresent').textContent,'—');
assert.match(getElementById('studentAttHint').textContent,/could not be loaded/);
assert.match(getElementById('dashboardAbsentFollowup').textContent,/Follow-up paused/);
render(records,students,true);
assert.equal(getElementById('studentAttRate').textContent,'67%');

const scriptMatch=html.match(/<script id="lama-daily-checklist-script">([\s\S]*?)<\/script>/);
assert.ok(scriptMatch,'Daily checklist source script missing');
const box=name=>({
 dataset:{taskCheck:name},checked:false,disabled:true,
 addEventListener(){},
 closest(){return {classList:{toggle(){}},querySelector(){return {textContent:''}}}}
});
const boxes=['attendance','teachers','students','parents','notices'].map(box);
const root={
 querySelectorAll:()=>boxes,
 querySelector:selector=>boxes.find(b=>selector.includes('"'+b.dataset.taskCheck+'"'))
};
elements.set('dailyChecklist',root);
elements.set('dailyChecklistProgress',{textContent:''});
document.readyState='complete';
document.addEventListener=()=>{};
const window={
 LamaAPI:{getSession:()=>null},
 __dashboardData:{
  students,attendance:records,
  teachers:[{id:'t1'},{id:'t2'}],
  teacherAttendance:[
   {teacherId:'t1',date:today,status:'Present'},
   {teacherId:'t2',date:today,status:'Present'}
  ]
 },
 addEventListener(){}
};
const sessionStorage={getItem:()=>JSON.stringify({schoolId:'school-1',token:'mock-token'})};
const localStorage={getItem:()=>null,setItem(){}};
new Function('window','document','sessionStorage','localStorage','localISODate','normalizeAttendanceDate','LamaAPI',
 scriptMatch[1])(window,document,sessionStorage,localStorage,()=>today,v=>String(v||'').slice(0,10),window.LamaAPI);
assert.equal(boxes.find(b=>b.dataset.taskCheck==='teachers').checked,true);
assert.equal(boxes.find(b=>b.dataset.taskCheck==='attendance').checked,false);
assert.match(getElementById('dailyChecklistProgress').textContent,/1 of 5 completed/);
window.__dashboardData.attendance=[...records,{studentId:'s3',date:today,status:'Present'}];
window.__dashboardData.studentAttendanceLoaded=false;
window.lamaRefreshDailyChecklist();
assert.equal(boxes.find(b=>b.dataset.taskCheck==='attendance').checked,false,
 'A failed student-attendance read cannot auto-complete the checklist even with stale saved data.');
window.__dashboardData.studentAttendanceLoaded=true;
window.lamaRefreshDailyChecklist();
assert.equal(boxes.find(b=>b.dataset.taskCheck==='attendance').checked,true,
 'Three unique saved students must auto-complete student checklist.');
assert.match(getElementById('dailyChecklistProgress').textContent,/2 of 5 completed/);
console.log('PASS: 67% coverage vs 100% marked presence; failed reads show unknown not zero; token-only checklist respects verified 3/3 students and 2/2 teachers.');
