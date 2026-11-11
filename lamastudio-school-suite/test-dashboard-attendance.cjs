/**
 * Admin dashboard attendance KPI and token-only checklist regression.
 * Only fake records; no network/database writes.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'dashboard.html'),'utf8');
const start=html.indexOf('function renderStudentAttendanceCard(attendance,students){');
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
console.log('PASS: 2/3 coverage 67%, 2/2 present among marked 100%; class 4 incomplete; token-only admin checklist auto-confirms 2/2 teachers.');
