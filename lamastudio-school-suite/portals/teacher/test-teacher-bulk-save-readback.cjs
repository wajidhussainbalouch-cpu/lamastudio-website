'use strict';
// Fake class register only. No real teacher or child records used or written.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const section=(start,end)=>{const a=html.indexOf(start),b=html.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,'Missing '+start);return html.slice(a,b)};
const saveCode=section('async function saveAttendance(){','function loadAbsentees(){');
const roster=Array.from({length:51},(_,i)=>({
 id:'s'+(i+1),enrlNo:String(1000+i),name:'Synthetic learner '+(i+1),class:'1'
}));
function harness(readbackOk){
 const source=[
  "const day='2026-11-17';",
  "const me={schoolId:'school-1',assignedClass:'1'};",
  "const myStudents=roster;",
  "let attendanceSaving=false,attendanceReady=true,attendanceUncertain=false,attendanceWriteUncertain=false,attendanceIssue='',attendanceSaveNote='';",
  "let draftAttendance=new Map(roster.map(s=>[s.id,'Present']));",
  "let editingAttendance=new Set(),selectedAttendanceDay=day;",
  "const status={textContent:''};",
  "const $=id=>id==='attDate'?{value:day}:status;",
  "const TeacherRegister={enrollment:s=>s.enrlNo};",
  "const myStudent=id=>roster.find(x=>x.id===id);",
  "const attendanceSnapshot=()=>({unique:new Map(),duplicates:new Map(),unmatched:[]});",
  "const confirm=()=>true;",
  "const message=t=>{throw Error('Unexpected message: '+t)};",
  "let requests=0,reads=0,rendered=0;",
  "const LamaAPI={bulkAttendance:async(date,records)=>{assert.equal(date,day);assert.equal(records.length,51);assert.ok(records.every(x=>x.status==='Present'));requests++;return {saved:records.length,updated:0,inserted:records.length}}};",
  "const loadSavedAttendance=async(expected)=>{reads++;assert.equal(expected.size,51);if(!readbackOk)throw Error('Student register timed out after 20 seconds');draftAttendance.clear();editingAttendance.clear();attendanceWriteUncertain=false;};",
  "const updateStats=()=>{};",
  "const renderAll=()=>{rendered++};",
  saveCode,
  "globalThis.output={saveAttendance,readState:()=>({requests,reads,rendered,attendanceReady,attendanceUncertain,attendanceWriteUncertain,attendanceIssue,dirty:draftAttendance.size,saving:attendanceSaving,status:status.textContent})};"
 ].join('\n');
 const context={roster,assert,readbackOk,console:{warn(){}}};
 vm.runInNewContext(source,context);
 return context.output;
}
(async()=>{
 const ok=harness(true);await ok.saveAttendance();
 const good=ok.readState();
 assert.equal(good.requests,1,'51 students sent in one server request, not 51 individual writes');
 assert.equal(good.reads,1);
 assert.equal(good.dirty,0);
 assert.equal(good.attendanceReady,true);
 assert.equal(good.attendanceUncertain,false);
 assert.equal(good.attendanceWriteUncertain,false,'Verified readback resolves write hold');
 const fail=harness(false);await fail.saveAttendance();
 const pending=fail.readState();
 assert.equal(pending.requests,1);
 assert.equal(pending.dirty,51,'Do not throw away 51 selected marks on readback timeout');
 assert.equal(pending.attendanceUncertain,true);
 assert.equal(pending.attendanceWriteUncertain,true,'Readback timeout retains a write-uncertain hold');
 assert.equal(pending.attendanceReady,false);
 assert.match(pending.status,/not verified/i);
 await fail.saveAttendance();
 assert.equal(fail.readState().requests,1,'Unknown outcome must never be resubmitted automatically');
 console.log('PASS: 51 marks use one bulk write; successful readback clears drafts, timeout retains marks and blocks retry.');
})().catch(error=>{console.error(error);process.exitCode=1});
