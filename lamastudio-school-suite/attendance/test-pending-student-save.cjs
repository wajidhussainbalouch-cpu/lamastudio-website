/* Simulate an accepted but unverified student attendance save, using real UI functions. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'student-attendance-v2.html'),'utf8');
const first=html.indexOf('async function verifyPendingAttendance(fastDateRows=null){');
const last=html.indexOf("$('clearDate').onclick=",first);
assert.ok(first>=0&&last>first);
const source=html.slice(first,last);
const helpersStart=html.indexOf('function hydrateSavedDate(rows,date){');
const helpersEnd=html.indexOf('async function load(){',helpersStart);
assert.ok(helpersStart>=0&&helpersEnd>helpersStart);
const helpers=html.slice(helpersStart,helpersEnd);
(async()=>{
 const date='2026-11-10',student={id:'s1',name:'Student 1',enrlNo:'001',class:'5'};
 const state={students:[student],history:[],chosen:new Map([['s1',{status:'Present'}]]),
  dirty:new Set(['s1']),pendingVerification:null,historyReady:true,loadedDate:date,
  loading:false,saving:false};
 const nodes=new Map([['date',{value:date}],['save',{onclick:null}]]);
 const $=id=>nodes.get(id)||nodes.set(id,{value:''}).get(id);
 let writes=0;
 const cloud=[],messages=[];
 const deps={
  state,$,render:()=>{},message:s=>messages.push(String(s)),validAdminWriteSession:()=>true,
  LamaAPI:{
   bulkAttendance:async(_,records)=>{writes++;assert.equal(records.length,1);return {saved:1,inserted:1,updated:0};},
   list:async()=>cloud
  },
  timeout:async p=>p,array:x=>Array.isArray(x)?x:null,
  asDate:x=>String(x||'').slice(0,10),status:x=>x,
  id:x=>x.id,enr:x=>x.enrlNo,cls:x=>x.class,duplicateAttendanceGroups:()=>0,
  qrSaving:false,confirm:()=>true,setInterval:()=>1,clearInterval:()=>{}
 };
 const actions=new Function(...Object.keys(deps),
  helpers+source+"return {save:$('save').onclick,verifyPendingAttendance};"
 )(...Object.values(deps));
 await actions.save();
 assert.equal(writes,1);
 assert.equal(state.dirty.size,1,'Unverified draft was lost');
 assert.equal(state.pendingVerification.records.length,1);
 assert.ok(messages.some(s=>s.includes('not confirmed')),'User needs an unresolved warning');
 await actions.save();
 assert.equal(writes,1,'Unverified marks may not be submitted twice');
 cloud.push({studentId:'s1',date,status:'Present'});
 cloud.push({studentId:'s1',date,status:'Present'});
 await actions.verifyPendingAttendance();
 assert.equal(state.dirty.size,1,'Two duplicate cloud rows are not reliable confirmation');
 cloud.pop();
 await actions.verifyPendingAttendance();
 assert.equal(state.dirty.size,0);
 assert.equal(state.pendingVerification,null);
 assert.equal(state.history.length,1);
 console.log('PASS: student readback failure retains selected mark, blocks second save and verifies unique record.');
})().catch(e=>{console.error(e);process.exitCode=1;});
