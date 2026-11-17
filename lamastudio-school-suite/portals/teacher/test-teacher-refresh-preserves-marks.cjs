'use strict';
// Simulated intermittent teacher API. No real students or School Sheet access.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const helperSrc=fs.readFileSync(path.join(__dirname,'../../js/teacher-register-helpers.js'),'utf8');
const i=source.indexOf('let refreshPromise=null;'),j=source.indexOf('function renderAll(){',i);
assert.ok(i>=0&&j>i,'Missing independent attendance reload implementation');
const helperCtx={window:{}};vm.createContext(helperCtx);vm.runInContext(helperSrc,helperCtx);
const h=helperCtx.window.LamaTeacherRegister;
let failRead=true,renderCount=0,studentReads=0,attendanceReads=0;
const student={id:'s1',enrlNo:'1',name:'Student 1',class:'1'};
const old={id:'old',studentId:'s1',enrlNo:'1',date:'2026-11-16',status:'Absent'};
const saved={id:'saved',studentId:'s1',enrlNo:'1',date:'2026-11-17',status:'Present'};
const stub={
 TeacherRegister:h,
 LamaAPI:{list:async name=>{
  if(name==='students'){studentReads++;throw Error('Student register timed out after 20 seconds')}
  if(name==='attendance'){attendanceReads++;if(failRead)throw Error('Attendance history timed out');return [old,saved]}
  return [];
 }},
 me:{schoolId:'school-a',assignedClass:'1'},
 localDate:()=> '2026-11-17',
 norm:x=>String(x||'').toLowerCase(),
 schoolMatch:()=>true,
 classMatch:r=>String(r.class||'')==='1',
 scope:r=>String(r.class||'')==='1',
 myStudent:id=>id==='s1'?student:null,
 renderAll:()=>{renderCount++},
 console:{warn(){}},
 setTimeout,clearTimeout,
 Date,Map,Promise,
 student,old
};
const $=id=>id==='attDate'?{value:'2026-11-17'}:id==='verifyTeacherAttendance'?{addEventListener(){}}:{textContent:''};
stub.$=$;
const declarations=[
 "let myStudents=[student],attendance=[old],homework=[],notices=[],results=[];",
 "let rosterReady=true,attendanceReady=true,homeworkReady=false,attendanceIssue='',attendanceSaving=false,attendanceUncertain=false;",
 "let draftAttendance=new Map([['s1','Present']]),editingAttendance=new Set(),selectedAttendanceDay='2026-11-17';",
 source.slice(i,j),
 "globalThis.api={refresh,loadSavedAttendance,verifyTeacherAttendance,state:()=>({attendance,attendanceReady,attendanceUncertain,attendanceIssue,drafts:[...draftAttendance],studentCount:myStudents.length})};"
].join('\n');
const ctx=vm.createContext(stub);
vm.runInContext(declarations,ctx);
(async()=>{
 await ctx.api.refresh();
 const missing=ctx.api.state();
 assert.equal(studentReads,0,'Cached school roster must not be requested again on attendance refresh');
 assert.equal(missing.attendance.length,1,'Failed read must preserve cached attendance');
 assert.equal(missing.attendance[0].id,'old');
 assert.equal(missing.drafts.length,1,'Unsaved status selection survives refresh');
 assert.equal(missing.attendanceReady,false,'Read timeout cannot be called verified');
 assert.match(missing.attendanceIssue,/timed out/);
 failRead=false;
 await ctx.api.verifyTeacherAttendance();
 const recovered=ctx.api.state();
 assert.equal(recovered.attendance.length,2);
 assert.equal(recovered.drafts.length,0,'Correct readback clears pending draft only after match');
 assert.equal(recovered.attendanceReady,true);
 assert.equal(recovered.attendanceUncertain,false);
 assert.equal(studentReads,0,'Verify saved attendance needs no full student register request');
 assert.ok(attendanceReads>=2);
 assert.ok(renderCount>=2);
 console.log('PASS: failed attendance reload preserves cached/draft marks, and readback recovers without a new student-register fetch.');
})().catch(error=>{console.error(error);process.exitCode=1});
