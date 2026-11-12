/* Simulate successful and uncertain staff attendance using the current Save function. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'teacher-attendance.html'),'utf8');
const a=html.indexOf('function verifySubmittedRecords(items,returned,day){');
const b=html.indexOf('function setPeriod(){',a);
assert.ok(a>=0&&b>a,'Current Save and readback verification functions are required');
assert.match(html,/if\(pendingVerification\)return toast\('Previous Save is unverified/);
assert.match(html,/if\(pendingSaveMatches\(\)\)/);
assert.match(html,/teacherLoadPercent'\)\.textContent='Not verified'/);
assert.match(html,/duplicateTeacherIds\.length/);
const code=html.slice(a,b);
function createPage(submit){
 const date='2026-11-12',teacher={id:'t1',name:'Teacher One'},teachers=[teacher],
   selected=new Map([['t1',{status:'Present',remarks:''}]]),dirty=new Set(['t1']);
 const nodes=new Map([['date',{value:date}],['teacherLoadElapsed',{textContent:''}],
   ['teacherLoadStage',{textContent:''}],['teacherLoadPercent',{textContent:''}],
   ['teacherLoadBar',{style:{}}]]);
 const $=id=>nodes.get(id)||nodes.set(id,{textContent:'',value:'',style:{}}).get(id);
 const notices=[];
 const ctx={
  teachers,selected,dirty,$,date,
  LamaAPI:{bulkTeacherAttendanceVerified:submit},
  status:r=>['Present','Absent','Leave'].includes(r?.status)?r.status:'',
  recDate:r=>String(r?.date||'').slice(0,10),
  reason:r=>String(r?.remarks||''),
  id:t=>t.id,name:t=>t.name,
  holidayReason:()=>false,fmt:day=>day,toast:s=>notices.push(String(s)),
  render(){},renderHistory(){},teacherLoadUpdate(){},setBusy(){}
 };
 const setup=[
  "let busy=false,editing=true,attendanceHistoryLoaded=true,fastDailyAvailable=true,",
  "pendingVerification=null,loadedDate=ctx.date,records=[],historyLoaded=true,",
  "historyRecords=[],verifiedAt=0,lastSaveVerified=0,duplicateTeacherIds=[];",
  "const {teachers,selected,dirty,$,LamaAPI,status,recDate,reason,id,name,holidayReason,",
  "toast,render,renderHistory,teacherLoadUpdate,setBusy,fmt}=ctx;",
  "const unsupportedTeacherAction=()=>false;",
  "const performance={now:()=>100};"
 ].join('\n');
 const actions=new Function('ctx',setup+code+
  'return {save,get pending(){return pendingVerification},get historyLoaded(){return historyLoaded},get lastSaveVerified(){return lastSaveVerified}};')(ctx);
 return {actions,ctx,notices};
}
(async()=>{
 let writes=0;
 const success=createPage(async(day,items)=>{
  writes++;assert.equal(day,'2026-11-12');assert.equal(items.length,1);
  return {verified:true,date:day,records:[{id:'rec1',teacherId:'t1',date:day,status:'Present',remarks:''}]};
 });
 await success.actions.save();
 assert.equal(writes,1);
 assert.equal(success.actions.pending,null,'Success must clear pending state after server readback');
 assert.equal(success.ctx.dirty.size,0,'Confirmed mark must clear unsaved selection');
 assert.ok(success.actions.lastSaveVerified,'Successful server verification must be remembered');
 assert.ok(success.notices.some(x=>x.includes('Save successful')));
 assert.equal(success.actions.historyLoaded,false,'Stale salary history must be invalidated');

 let uncertainWrites=0;
 const uncertain=createPage(async()=>{uncertainWrites++;throw Error('Connection lost after server accepted write')});
 await uncertain.actions.save();
 assert.equal(uncertainWrites,1);
 assert.ok(uncertain.actions.pending,'Unknown write result must remain pending');
 assert.equal(uncertain.ctx.dirty.size,1);
 await uncertain.actions.save();
 assert.equal(uncertainWrites,1,'An unknown write must never be re-submitted');
 assert.ok(uncertain.notices.some(x=>x.includes('do NOT save twice')||x.includes('do not Save again')));
 console.log('PASS: confirmed staff batch shows Save successful; connection failure remains pending and blocks repeat submissions.');
})().catch(e=>{console.error(e);process.exitCode=1});
