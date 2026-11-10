/*
 * Tests actual teacher portal student-attendance save/readback source with
 * fake class data and browser controls. Never sends requests to a school.
 * node lamastudio-school-suite/portals/teacher/test-attendance-save-verification.cjs
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function extract(first,last){
 const a=src.indexOf(first),b=src.indexOf(last,a);
 assert.ok(a>=0&&b>a,'Production source section missing: '+first);
 return src.slice(a,b);
}
const matching=extract('function myStudent(id){','function mine(r){');
const operations=extract('function loadAttendanceList(){','function loadAbsentees(){');
const stats=extract('function updateStats(){','function header(){');
const date='2026-11-10';
const people=[
 {id:'s1',enrlNo:'2',name:'Pupil One',gender:'Male'},
 {id:'s2',enrlNo:'3',name:'Pupil Two',gender:'Female'}
];
const nodes=new Map([
 ['attDate',{value:date,disabled:false}],
 ['attendanceList',{innerHTML:''}],
 ['attendanceEmpty',{classList:{toggle:()=>{}}}],
 ['attendanceVerifyNote',{textContent:'',classList:{toggle:()=>{}}}],
 ['attendanceRecheck',{disabled:false,classList:{toggle:()=>{}}}]
]);
const $=id=>nodes.get(id)||nodes.set(id,{textContent:'',classList:{toggle:()=>{}}}).get(id);
const button={disabled:false,textContent:'Save',dataset:{}};
const selected=people.map(s=>({
 dataset:{studentId:s.id},
 querySelector:selector=>selector.startsWith('.att-btn')?{dataset:{status:'Present'}}:null
}));
const document={
 querySelector:selector=>selector.includes('saveAttendance')?button:null,
 querySelectorAll:selector=>selector.includes('[data-student-id]')?selected:[],
};
let writes=0,changes=0,cloud=[],failRead=false;
const notices=[];
const ctx={
 me:{schoolId:'test-school',assignedClass:'Playgroup',teacherId:'teacher1'},
 myStudents:people,$,document,esc:x=>String(x||''),contact:()=>'',norm:x=>String(x||'').trim().toLowerCase(),
 message:text=>notices.push(text),localDate:()=>date,
 LamaAPI:{
  add:async(_collection,record)=>{writes++;return{id:'a'+writes,...record}},
  update:async()=>{changes++;return{id:'existing'}},
  list:async collection=>{
   assert.equal(collection,'attendance');
   if(failRead)throw Error('Readback connection lost');
   return cloud.map(r=>({...r}));
  }
 }
};
const factory=new Function('ctx',[
 'const {me,myStudents,$,document,esc,contact,norm,message,localDate,LamaAPI}=ctx;',
 'let attendance=[],attendanceReadReady=true,attendanceSavePending=null,attendanceVerifyBusy=false,attendanceSaveBusy=false;',
 'const attendanceDrafts=new Map();',
 matching,
 'function renderAll(){loadAttendanceList();}',
 operations,
 'return {saveAttendance,verifyTeacherStudentPending,loadAttendanceList,',
 '  get pending(){return attendanceSavePending;},get records(){return attendance;},',
 '  get readReady(){return attendanceReadReady;}};'
].join('\n'));
const page=factory(ctx);
(async()=>{
 page.loadAttendanceList();
 await page.saveAttendance();
 assert.equal(writes,2,'Two selected students must submit exactly two records');
 assert.equal(page.pending.records.length,2,'Unverified marks must be retained');
 assert.ok(nodes.get('attendanceVerifyNote').textContent.toLowerCase().includes('unverified'));
 assert.equal(button.disabled,true,'Save must remain blocked while pending');
 await page.saveAttendance();
 assert.equal(writes,2,'Repeated Save must never submit pending student records');
 cloud=[
  {studentId:'s1',date:'2026-11-09',status:'Present'},
  {studentId:'s2',date:'2026-11-09',status:'Present'}
 ];
 await page.verifyTeacherStudentPending();
 assert.ok(page.pending.problem.includes('UTC'),'Previous UTC day is a clue, not confirmation');
 assert.equal(writes,2);
 cloud=[
  {studentId:'s1',date,status:'Present'},
  {studentId:'s1',date,status:'Present'},
  {studentId:'s2',date,status:'Present'}
 ];
 await page.verifyTeacherStudentPending();
 assert.ok(page.pending.problem.includes('duplicate'),'Duplicate cloud student/day must remain pending');
 cloud=[
  {studentId:'s1',date,status:'Absent'},
  {studentId:'s2',date,status:'Present'}
 ];
 await page.verifyTeacherStudentPending();
 assert.ok(page.pending.problem.includes('status mismatch'));
 failRead=true;
 await page.verifyTeacherStudentPending();
 assert.ok(page.pending,'Network readback error must not clear local pending queue');
 failRead=false;
 cloud=[
  {studentId:'s1',date,status:'Present'},
  {studentId:'s2',date,status:'Present'}
 ];
 await page.verifyTeacherStudentPending();
 assert.equal(page.pending,null,'Two unique matching rows complete verification');
 assert.equal(page.records.length,2);
 assert.equal(writes,2,'Verification must make no extra writes');
 assert.equal(changes,0,'No unexpected existing-row update');
 assert.equal(button.disabled,false,'Save can be used for future edits after verification');
 // The dashboard must not report false zero while the attendance read has
 // failed or a write is awaiting verification.
 const dash=new Function('ctx',[
  'const {me,myStudents,$,norm,localDate}=ctx;',
  'let attendance=[],attendanceReadReady=false,attendanceSavePending=null;',
  'const homework=[];',
  matching,
  stats,
  'return (rows,ready,pending)=>{attendance=rows;attendanceReadReady=ready;',
  'attendanceSavePending=pending;updateStats();return {',
  "present:$('statPresent').textContent,absent:$('statAbsent').textContent,",
  "hint:$('statAttendanceHint').textContent};};"
 ].join('\n'))(ctx);
 let display=dash([],false,null);
 assert.equal(display.present,'—','Failed cloud read must not appear as 0 Present');
 display=dash(cloud,true,{records:[{studentId:'s1'}]});
 assert.equal(display.present,'—','Pending write cannot appear independently verified');
 display=dash(cloud,true,null);
 assert.equal(display.present,2,'Verified rows should update the teacher dashboard');
 assert.ok(display.hint.includes('Saved'));
 console.log('PASS: teacher portal two-pupil write stays pending, blocks repeat POST, diagnoses UTC/duplicate/status/network and updates verified dashboard totals.');
})().catch(err=>{console.error(err);process.exitCode=1;});
