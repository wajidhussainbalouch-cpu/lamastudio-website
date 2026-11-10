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
const syncSource=extract('async function sync(automatic=false){','function showNextReview(){');
const reviewSource=extract('function showNextReview(){','async function downloadEncryptedBackup(){');
const cloudRecheckSource=extract('async function recheckCloud(student,date){','function showNextReview(){');
const choiceSource=extract('async function setChoice(student,date,value){','async function prepare(){');
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
 const state={data:{roster:[students[0]]}};
 const run=new Function('readSnapshot','validatedSnapshot','normalizedStudents','dateValue','status','state',
   batchSource+'return readPendingSnapshots;')(get,validated,normalizedStudents,dateValue,status,state);
 let result=await run([...requestedDates,...requestedDates.slice(0,5)]);
 assert.deepEqual(calls.map(c=>c.length),[90,90,15],'Date windows should be batched');
 assert.equal(result.attendance.length,196,'Recent repeat must not duplicate history');
 // A very large rural school's attendance responses must use fewer dates
 // so a 5,000-student roster never exceeds the server's 75k row limit.
 calls.length=0;state.data.roster=Array.from({length:5000},()=>students[0]);
 await run(requestedDates.slice(0,13));
 assert.deepEqual(calls.map(c=>c.length),[6,6,1]);
 state.data.roster=[students[0]];
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
 if(mode==='cloud-conflict')cloud.push({date,studentId:'id0',enrlNo:'100',status:'Absent'});
 let writes=0,identityValid=true;
 const dependencies={
  state,online:()=>true,authorizedWriter:()=>identityValid,
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
   if(mode==='auth-switched'&&sent.length===1)identityValid=false;
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
async function choiceSafetyTests(){
 const student={id:'id42',name:'Student 42'};
 const date='2026-11-09';
 const draft={studentId:'id42',date,status:'Present',baseStatus:'',syncIssue:'conflict',serverStatus:'Absent'};
 const state={busy:false,staleVault:false,data:{history:{},drafts:[draft]}};
 let writes=0,notice='';
 const ctx={
  state,draftFor:(s,d)=>state.data.drafts.find(x=>x.studentId===s.id&&x.date===d),
  validDate:()=>true,text:(_id,t)=>{notice=t;},keyFor:(d,id)=>d+'|'+id,
  baseline:()=>'',writeVault:async()=>{writes++;},render:()=>{},
  crypto:{randomUUID:()=>'new-draft-id'}
 };
 const setChoice=new Function(...Object.keys(ctx),choiceSource+'return setChoice;')(...Object.values(ctx));
 await setChoice(student,date,'Absent');
 assert.equal(writes,0,'Clicking a conflict cannot silently erase its review flag');
 assert.equal(state.data.drafts[0].syncIssue,'conflict');
 assert.ok(notice.includes('unresolved sync review'));
 delete draft.syncIssue;delete draft.serverStatus;
 await setChoice(student,date,'Present');
 assert.equal(writes,0,'Same attendance choice should not rewrite a local draft');
 await setChoice(student,date,'Absent');
 assert.equal(writes,1,'Changing a clear draft should save encrypted local work');
 assert.equal(state.data.drafts.length,1);
 assert.equal(state.data.drafts[0].status,'Absent');
}
async function cloudRecheckTests(){
 const date='2026-10-16',student={id:'s1',name:'Student A',enrlNo:'101',className:'5'};
 let serverStatus='Absent',currentStudent={...student},badSchool=false,
   failNetwork=false,failSave=false,changeLogin=false,connected=true,
   writes=0,reads=0,notices=[];
 const draft={date,studentId:'s1',status:'Present',baseStatus:'',syncIssue:'conflict',serverStatus:'Absent'};
 const state={busy:false,staleVault:false,data:{drafts:[draft]}};
 const dependencies={
  state,online:()=>connected,draftFor:(s,d)=>state.data.drafts.find(x=>x.studentId===s.id&&x.date===d),
  validDate:()=>true,render:()=>{},text:(target,msg)=>{notices.push(String(msg));},
  authorizedWriter:()=>!changeLogin,
  readSnapshot:async dates=>{
   reads++;assert.deepEqual(dates,[date]);
   if(failNetwork)throw Error('Connection lost');
   return {schoolId:badSchool?'wrong-school':'school-test',role:'school',
     students:[currentStudent],attendance:serverStatus?[{date,studentId:'s1',status:serverStatus}]:[]};
  },
  validatedSnapshot:result=>{
   if(result.schoolId!=='school-test'||result.role!=='school')throw Error('Cross-school cloud snapshot');
   return result;
  },
  normalizedStudents:rows=>rows,
  sameStudentId:(a,b)=>a.id===b.id&&a.enrlNo===b.enrlNo,
  historyIndex:rows=>Object.fromEntries(rows.map(x=>[x.date+'|'+x.studentId,x.status])),
  keyFor:(d,id)=>d+'|'+id,
  writeVault:async()=>{if(failSave)throw Error('Mock IndexedDB CAS conflict');writes++;}
 };
 const recheck=new Function(...Object.keys(dependencies),
   cloudRecheckSource+'return recheckCloud;')(...Object.values(dependencies));
 await recheck(student,date);
 assert.equal(draft.syncIssue,'conflict','Disagreeing cloud status remains a conflict');
 assert.equal(draft.serverStatus,'Absent');
 assert.equal(writes,1);
 assert.equal(state.data.drafts.length,1,'Read-only recheck never deletes a local draft');
 serverStatus='Present';
 await recheck(student,date);
 assert.equal(draft.syncIssue,'unverified','Matching cloud mark remains queued until Sync Now');
 assert.equal(draft.serverStatus,'Present');
 assert.equal(state.data.drafts.length,1);
 serverStatus='';
 await recheck(student,date);
 assert.equal(draft.syncIssue,undefined,'Original baseline restores normal conflict-checked sync');
 assert.equal(draft.serverStatus,'');
 assert.equal(state.data.drafts.length,1);
 draft.syncIssue='conflict';
 currentStudent={...student,enrlNo:'different'};
 await recheck(student,date);
 assert.equal(draft.syncIssue,'student-changed','Changed enrollment requires staff review');
 assert.equal(draft.serverStatus,undefined);
 currentStudent={...student};
 draft.syncIssue='conflict';draft.serverStatus='Absent';
 const checkpoint={...draft},saved=writes;
 failNetwork=true;
 await recheck(student,date);
 assert.deepEqual(draft,checkpoint,'Network error must leave local draft intact');
 assert.equal(writes,saved);
 failNetwork=false;badSchool=true;
 await recheck(student,date);
 assert.deepEqual(draft,checkpoint,'Cross-school result must leave local draft intact');
 assert.equal(writes,saved);
 badSchool=false;changeLogin=true;
 await recheck(student,date);
 assert.deepEqual(draft,checkpoint,'Changed login must block recheck');
 assert.equal(writes,saved);
 changeLogin=false;failSave=true;
 await recheck(student,date);
 assert.deepEqual(draft,checkpoint,'Failed local CAS must restore review state');
 assert.equal(writes,saved);
 failSave=false;connected=false;
 const beforeReads=reads;
 await recheck(student,date);
 assert.equal(reads,beforeReads,'Offline action never reaches cloud API');
 assert.equal(writes,saved);
 assert.ok(notices.some(s=>s.includes('Read-only cloud recheck:')));
}
function reviewNavigationTests(){
 const state={busy:false,staleVault:false,reviewCursor:null,data:{
   drafts:[{studentId:'id495',date:'2026-10-02',syncIssue:'conflict'},
     {studentId:'id111',date:'2026-09-01',syncIssue:'unverified'}],
   roster:[{id:'id495',name:'Student 495'},{id:'id111',name:'Student 111'}]
 }};
 const nodes=new Map();
 const $=id=>{if(!nodes.has(id))nodes.set(id,{value:''});return nodes.get(id);};
 let renderCount=0,notice='';
 const fn=new Function('state','$','text','render','keyFor',reviewSource+'return showNextReview;')(
   state,$,(_target,value)=>{notice=value;},()=>{renderCount++;},
   (date,id)=>date+'|'+id);
 fn();
 assert.equal($('attDate').value,'2026-09-01');
 assert.equal($('attSearch').value,'id111');
 assert.equal($('attFilter').value,'review');
 fn();
 assert.equal($('attDate').value,'2026-10-02');
 assert.equal($('attSearch').value,'id495','Find next must advance to second flag');
 fn();
 assert.equal($('attDate').value,'2026-09-01','Review navigation must wrap to first flag');
 assert.equal($('attClass').value,'');
 assert.ok(renderCount===3&&notice.includes('cloud was NOT overwritten'));
 state.data.drafts=[];fn();
 assert.equal(state.reviewCursor,null,'Review cursor resets when all flags resolved');
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
 assert.ok(rejected.state.data.drafts.every(d=>d.syncIssue==='unverified'),
  'Unverified records must be flagged for review after failed upload');
 const ambiguous=buildSyncScenario('first-ambiguous');
 await ambiguous.run(false);
 assert.deepEqual(ambiguous.sent,[500],'Never continue blindly after lost acknowledgment');
 assert.equal(ambiguous.state.data.drafts.length,2,'Remaining unsent drafts must stay queued');
 assert.equal(ambiguous.cloud.length,500);
 assert.equal(ambiguous.state.autoPaused,true);
 const conflict=buildSyncScenario('cloud-conflict');
 await conflict.run(false);
 assert.deepEqual(conflict.sent,[500,1]);
 assert.equal(conflict.state.data.drafts.length,1,'Conflicting draft must not be overwritten');
 assert.equal(conflict.state.data.drafts[0].studentId,'id0');
 assert.equal(conflict.state.data.drafts[0].syncIssue,'conflict','Conflict should be visible after sync');
 assert.equal(conflict.state.data.drafts[0].serverStatus,'Absent','Last confirmed server status must be shown for review');
 assert.equal(conflict.cloud[0].status,'Absent','The cloud attendance must be preserved');
 const switched=buildSyncScenario('auth-switched');
 await switched.run(false);
 assert.deepEqual(switched.sent,[500],'Account switch must stop before second upload');
 assert.equal(switched.cloud.length,500);
 assert.equal(switched.state.data.drafts.length,2,'Unsent local changes survive account switch');
 assert.equal(switched.state.autoPaused,true);
 assert.ok(switched.messages.some(m=>String(m.value).includes('login changed during sync')));
}
(async()=>{
 await snapshotTests();
 await syncTests();
 await choiceSafetyTests();
 await cloudRecheckTests();
 reviewNavigationTests();
 console.log('PASS: >90-date snapshot windows, duplicate history, changing-roster safety, privacy/transport failures, 500-record chunk writes, per-student cloud status, cycling review navigation, account switching, blocked unsafe draft edits, read-only cloud rechecks and ambiguous sync retention.');
})().catch(err=>{console.error(err);process.exitCode=1;});
