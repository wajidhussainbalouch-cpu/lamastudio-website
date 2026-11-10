/* Simulate uncertain staff attendance using the actual save/verify functions. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'teacher-attendance.html'),'utf8');
const i=html.indexOf('async function verifyTeacherPending(){');
const j=html.indexOf('function setPeriod(){',i);
assert.ok(i>=0&&j>i);
const code=html.slice(i,j);
(async()=>{
 const date='2026-11-10',teacher={id:'t1',name:'Teacher One'};
 const teachers=[teacher],selected=new Map([['t1',{status:'Present',remarks:''}]]),
  dirty=new Set(['t1']),cloud=[],messages=[];
 const nodes=new Map([['date',{value:date}]]);
 const $=id=>nodes.get(id)||nodes.set(id,{value:''}).get(id);
 let writes=0;
 const ctx={
  date,teachers,selected,dirty,$,
  LamaAPI:{
   add:async(_collection,p)=>{writes++;return {id:'rec1',...p};},
   update:async()=>{throw Error('Unexpected update');},
   list:async()=>cloud
  },
  arr:v=>Array.isArray(v)?v:v?.records||[],
  status:r=>['Present','Absent','Leave'].includes(r?.status)?r.status:'',
  recDate:r=>String(r?.date||'').slice(0,10),
  reason:r=>String(r?.remarks||''),
  id:t=>t.id,name:t=>t.name,
  verifiedStaffAttendanceAdmin:()=>true,holidayReason:()=>false,
  toast:s=>messages.push(String(s)),render:()=>{},renderHistory:()=>{}
 };
 const setup=[
  'let busy=false,teacherPendingVerification=null,editing=true,attendanceHistoryLoaded=true;',
  'let loadedDate=ctx.date,records=[];',
  'const {$,teachers,selected,dirty,LamaAPI,arr,status,recDate,reason,id,name,',
  'verifiedStaffAttendanceAdmin,holidayReason,toast,render,renderHistory}=ctx;',
  'const setBusy=v=>{busy=v};',
  'const teacherQrPending=new Set();',
  code,
  'return {save,verifyTeacherPending,get pending(){return teacherPendingVerification},',
  'get dirty(){return dirty},get records(){return records}};'
 ].join('\n');
 const actions=new Function('ctx',setup)(ctx);
 await actions.save();
 assert.equal(writes,1);
 assert.equal(actions.dirty.size,1,'Teacher mark must stay pending until server verification');
 assert.ok(actions.pending);
 await actions.save();
 assert.equal(writes,1,'Unconfirmed staff mark may not be submitted twice');
 cloud.push({teacherId:'t1',date,status:'Present',remarks:''});
 cloud.push({teacherId:'t1',date,status:'Present',remarks:''});
 await actions.verifyTeacherPending();
 assert.ok(actions.pending,'Duplicate cloud records cannot confirm a staff save');
 cloud.pop();
 await actions.verifyTeacherPending();
 assert.equal(actions.pending,null);
 assert.equal(actions.dirty.size,0);
 assert.equal(actions.records.length,1);
 console.log('PASS: staff save locks uncertain record, blocks repeat POST and verifies one matching cloud row.');
})().catch(error=>{console.error(error);process.exitCode=1;});
