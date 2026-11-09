/*
 * Offline sync batching tests. Mocked server and storage only.
 * node lamastudio-school-suite/js/test-offline-sync-batching.cjs
 * Confirms actual client source never attempts >90 dates/request or >500
 * attendance records/save and retains drafts on uncertain acknowledgments.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'offline-attendance.js'),'utf8');
function extract(begin,end){
 const a=source.indexOf(begin),b=source.indexOf(end,a);
 assert.ok(a>=0&&b>a,'Failed to isolate client function '+begin);
 return source.slice(a,b);
}
const batchSource=extract('async function readPendingSnapshots(dates){','const sendBulk=');
const syncSource=extract('async function sync(automatic=false){','async function downloadEncryptedBackup(){');
const dateValue=x=>String(x||'').slice(0,10);
const status=x=>['Present','Absent','Leave'].includes(x)?x:'';
const normalizedStudents=rows=>rows.map(r=>({
 id:String(r.id),name:String(r.name||''),enrlNo:String(r.enrlNo||''),
 className:String(r.className||r.class||''),section:String(r.section||'')
}));
const students=[{id:'s1',name:'Student 1',enrlNo:'101',class:'5',section:'A'}];
const day=n=>new Date(Date.UTC(2026,0,1+n)).toISOString().slice(0,10);
const requestedDates=Array.from({length:195},(_,i)=>day(i));
async function snapshotTests(){
 const calls=[];
 let mutatedRoster=false,changedStatus=false,wrongSchool=false,failCall=0;
 const get=async dates=>{
  calls.push(dates);
  if(dates.length>90)throw Error('Backend limits date list to 90');
  if(failCall&&calls.length===failCall)throw Error('Temporary server failure');
  const recent={date:'2026-11-07',studentId:'s1',enrlNo:'101',status:changedStatus&&calls.length>1?'Absent':'Present'};
  return {role:'school',schoolId:wrongSchool?'different-school':'school-one',
   students:mutatedRoster&&calls.length>1?[{...students[0],name:'Changed during sync'}]:students,
   attendance:[recent,...dates.map(date=>({date,studentId:'s1',enrlNo:'101',status:'Present'}))]};
 };
 const validated=s=>{
  if(s.schoolId!=='school-one'||s.role!=='school')throw Error('Cross-school snapshot');
  return s;
 };
 const run=new Function('readSnapshot','validatedSnapshot','normalizedStudents','dateValue','status',
   batchSource+'return readPendingSnapshots;')(get,validated,normalizedStudents,dateValue,status);
 let result=await run([...requestedDates,...requestedDates.slice(0,5)]);
 assert.deepEqual(calls.map(c=>c.length),[90,90,15],'Date windows should be batched');
 assert.equal(result.attendance.length,196,'Recent repeat must not duplicate history');
 calls.length=0;mutatedRoster=true;
 await assert.rejects(run(requestedDates),/roster changed/);
 calls.length=0;mutatedRoster=false;changedStatus=true;
 await assert.rejects(run(requestedDates),/Attendance changed/);
 calls.length=0;changedStatus=false;wrongSchool=true;
 await assert.rejects(run([day(1)]),/Cross-school/);
 calls.length=0;wrongSchool=false;failCall=2;
 await assert.rejects(run(requestedDates),/Temporary server failure/);
 calls.length=0;failCall=0;
 result=await run([]);
 assert.equal(calls.length,1);
 assert.equal(calls[0].length,0);
}
function buildSyncScenario(mode){
 const roster=Array.from({length:502},(_,i)=>({
  id:'id'+i,name:'Student '+i,enrlNo:String(i+100),className:'5',section:'A'
 }));
 const date='2026-11-09';
 const data={roster,history:{},drafts:roster.map((s,i)=>({
  id:'draft-'+i,studentId:s.id,date,status:'Present',baseStatus:''
 }))};
 const state={data,busy:false,staleVault:false,autoPaused:false};
 const cloud=[],sent=[],messages=[];
 let writes=0;
 const dependencies={
  state,online:()=>true,authorizedWriter:()=>true,
  render:()=>{},text:(target,value)=>messages.push({target,value}),
  readPendingSnapshots:async dates=>{
   assert.ok(dates.length===502&&dates.every(d=>d===date),'Preflight includes all 502 pending records');
   return {schoolId:'school-one',role:'school',students:roster,attendance:cloud.map(r=>({...r}))};
  },
  normalizedStudents:rows=>rows,
  historyIndex:rows=>Object.fromEntries(rows.map(r=>[r.date+'|'+r.studentId,r.status])),
  keyFor:(d,id)=>d+'|'+id,
  sameStudentId:(a,b)=>a.id===b.id&&a.enrlNo===b.enrlNo,
  sendBulk:async(d,records)=>{
   sent.push(records.length);
   assert.ok(records.length<=500,'Oversized write submitted');
   if(mode==='second-rejected'&&sent.length===2)throw Error('Simulated failed save');
   for(const r of records)cloud.push({...r,date:d});
   if(mode==='first-ambiguous'&&sent.length===1)throw Error('Acknowledgment lost after server saved');
   return {saved:records.length,inserted:records.length,updated:0};
  },
  readSnapshot:async dates=>{
   assert.deepEqual(dates,[date]);
   return {schoolId:'school-one',role:'school',students:roster,attendance:cloud.map(r=>({...r}))};
  },
  validatedSnapshot:s=>s,
  writeVault:async()=>{writes++;}
 };
 const run=new Function(...Object.keys(dependencies),syncSource+'return sync;')(...Object.values(dependencies));
 return {run,state,cloud,sent,messages,get writes(){return writes;}};
}
async function syncTests(){
 const ok=buildSyncScenario('success');
 await ok.run(false);
 assert.deepEqual(ok.sent,[500,2]);
 assert.equal(ok.state.data.drafts.length,0);
 assert.equal(ok.cloud.length,502);
 assert.ok(ok.writes>=3);
 const rejected=buildSyncScenario('second-rejected');
 await rejected.run(false);
 assert.deepEqual(rejected.sent,[500,2]);
 assert.equal(rejected.state.data.drafts.length,2,'Unverified second group must stay queued');
 assert.equal(rejected.cloud.length,500);
 assert.equal(rejected.state.autoPaused,true);
 const ambiguous=buildSyncScenario('first-ambiguous');
 await ambiguous.run(false);
 assert.deepEqual(ambiguous.sent,[500],'Never continue blindly after lost acknowledgment');
 assert.equal(ambiguous.state.data.drafts.length,2,'Remaining unsent drafts must stay queued');
 assert.equal(ambiguous.cloud.length,500);
 assert.equal(ambiguous.state.autoPaused,true);
}
(async()=>{
 await snapshotTests();
 await syncTests();
 console.log('PASS: >90-date snapshot windows, duplicate history, changing-roster safety, privacy/transport failures, 500-record chunk writes and ambiguous sync retention.');
})().catch(err=>{console.error(err);process.exitCode=1;});
