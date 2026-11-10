/*
 * Offline attendance must never silently sync marks from a student's previous
 * class/section if the school roster was reassigned while the phone was offline.
 * Runs against the actual production sameStudentId and sync() functions using
 * mocked school/teacher and cloud responses; never touches live school data.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'offline-attendance.js'),'utf8');
function extract(from,to){
 const i=source.indexOf(from),j=source.indexOf(to,i);
 assert.ok(i>=0&&j>i,'Could not isolate '+from);
 return source.slice(i,j);
}
const sameStudentId=new Function(extract('function sameStudentId(a,b){','function baseline(')+'return sameStudentId;')();
const syncCode=extract('async function sync(automatic=false){','async function recheckCloud(');
const original={id:'std1',name:'Pupil 1',enrlNo:'001',className:'4',section:'A'};
const classChanged={...original,className:'5'};
const sectionChanged={...original,section:'B'};
const enrollmentChanged={...original,enrlNo:'002'};
assert.ok(sameStudentId(original,{...original}));
assert.ok(!sameStudentId(original,classChanged),'Class transfer must not be considered identical');
assert.ok(!sameStudentId(original,sectionChanged),'Section transfer must not be considered identical');
assert.ok(!sameStudentId(original,enrollmentChanged),'Enrollment changes must be reviewed');
assert.ok(sameStudentId(original,{...original,className:' 4 ',section:' a '}),'Formatting-only changes are safe');
function scenario(mode){
 const date='2026-11-09';
 const originalRoster=[original,{id:'std2',name:'Pupil 2',enrlNo:'002',className:'4',section:'A'}];
 const serverPreflight=originalRoster.map((s,i)=>{
  if(i!==0)return {...s};
  return mode==='preflight-class'?classChanged:
   mode==='preflight-section'?sectionChanged:{...s};
 });
 const serverReadback=originalRoster.map((s,i)=>{
  if(i!==0)return {...s};
  return mode==='readback-class'?classChanged:
   mode==='readback-section'?sectionChanged:{...s};
 });
 const data={
  roster:originalRoster,
  history:{},
  drafts:originalRoster.map(s=>({studentId:s.id,date,status:'Present',baseStatus:''}))
 };
 const state={busy:false,staleVault:false,data,autoPaused:false};
 const server=new Map(),sent=[],notices=[];
 const context={
  state,online:()=>true,authorizedWriter:()=>true,render:()=>{},
  text:(_id,message)=>notices.push(String(message)),
  readPendingSnapshots:async dates=>{
   assert.deepEqual(dates,[date,date]);
   return {schoolId:'school-demo',role:'school',students:serverPreflight,
    attendance:[]};
  },
  normalizedStudents:rows=>rows.map(row=>({...row})),
  keyFor:(d,id)=>d+'|'+id,
  sameStudentId,
  historyIndex:rows=>Object.fromEntries(rows.map(r=>[r.date+'|'+r.studentId,r.status])),
  sendBulk:async(d,records)=>{
   sent.push(records.map(r=>r.studentId));
   for(const rec of records)server.set(rec.studentId,{date:d,studentId:rec.studentId,status:rec.status});
   return {saved:records.length,inserted:records.length,updated:0};
  },
  readSnapshot:async dates=>{
   assert.deepEqual(dates,[date]);
   return {schoolId:'school-demo',role:'school',students:serverReadback,
    attendance:[...server.values()]};
  },
  validatedSnapshot:s=>s,
  writeVault:async()=>{}
 };
 const run=new Function(...Object.keys(context),syncCode+'return sync;')(...Object.values(context));
 return {run,state,server,sent,notices};
}
(async()=>{
 for(const mode of ['preflight-class','preflight-section']){
  const x=scenario(mode);await x.run(false);
  assert.deepEqual(x.sent,[['std2']],mode+': only still-enrolled pupil can sync');
  assert.equal(x.server.has('std1'),false,'Transferred pupil must not be sent');
  assert.equal(x.state.data.drafts.length,1);
  assert.equal(x.state.data.drafts[0].studentId,'std1');
  assert.equal(x.state.data.drafts[0].syncIssue,'student-changed');
 }
 for(const mode of ['readback-class','readback-section']){
  const x=scenario(mode);await x.run(false);
  assert.deepEqual(x.sent,[['std1','std2']]);
  assert.equal(x.state.data.drafts.length,1,'Transferred pupil retains local draft after upload');
  assert.equal(x.state.data.drafts[0].studentId,'std1');
  assert.equal(x.state.data.drafts[0].syncIssue,'student-changed');
  assert.equal(x.state.autoPaused,true);
 }
 const unchanged=scenario('unchanged');await unchanged.run(false);
 assert.deepEqual(unchanged.sent,[['std1','std2']]);
 assert.equal(unchanged.state.data.drafts.length,0,'Unchanged roster can sync and verify');
 console.log('PASS: actual student identity guard, class/section preflight transfer, readback transfer and unchanged roster.');
})().catch(error=>{console.error(error);process.exitCode=1;});
