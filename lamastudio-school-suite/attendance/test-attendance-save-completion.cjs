/**
 * LAMA School Suite attendance UX and fast confirmation regression.
 * Executes production page functions with fake data; no live Apps Script calls.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'student-attendance-v2.html'),'utf8');
function section(a,b){
 const start=html.indexOf(a),end=html.indexOf(b,start);
 assert.ok(start>=0&&end>start,'Missing production UI section: '+a);
 return html.slice(start,end);
}
const date='2026-11-10';
const roster=Array.from({length:349},(_,i)=>({
 id:'student-'+(i+1),name:'Pupil '+(i+1),
 enrlNo:String(i+100),class:i<38?'5':'6'
}));
const chosen=new Map();
for(let i=0;i<38;i++)chosen.set(roster[i].id,{status:i<20?'Present':'Absent'});
const dirty=new Set(roster.slice(0,38).map(s=>s.id));
const state={students:roster,chosen,dirty,history:[],rosterReady:true,historyReady:true,
 loadedDate:date,loading:false,saving:false,pendingVerification:null,integrityBlocked:0};
const nodes=new Map([
 ['date',{value:date}],['class',{value:'5'}],['completion',{textContent:''}],
 ['save',{disabled:false,onclick:null}],['stage',{textContent:''}]
]);
const $=key=>nodes.get(key)||nodes.set(key,{value:'',textContent:''}).get(key);
const id=s=>s.id,cls=s=>s.class,enr=s=>s.enrlNo,status=x=>x;
const banner=new Function('state','$','id','cls',
 section('function attendanceCompletion(){','function render(){')+
 'return attendanceCompletion;')(state,$,id,cls);
let message=banner(),label=nodes.get('completion').textContent;
assert.ok(label.includes('Class 5 — 0/38 saved and verified'));
assert.ok(!label.includes('Class attendance completed'));
state.pendingVerification={date,records:roster.slice(0,38).map(s=>({studentId:s.id,
 status:chosen.get(s.id).status,enrlNo:s.enrlNo}))};
banner();
assert.ok(nodes.get('completion').textContent.includes('awaiting server verification'));
assert.ok(!nodes.get('completion').textContent.includes('Class attendance completed'));
state.pendingVerification=null;dirty.clear();
banner();
label=nodes.get('completion').textContent;
assert.ok(label.includes('Class 5 — 38/38 saved and verified (20 Present, 18 Absent, 0 Leave)'));
assert.ok(label.includes('✓ Class attendance completed'));
assert.ok(label.includes('Whole school: 38/349 confirmed, 311 remaining'));
nodes.get('class').value='';
banner();
label=nodes.get('completion').textContent;
assert.ok(label.includes('Whole school — 38/349 saved and verified'));
assert.ok(!label.includes('Whole school attendance completed'));
for(let i=38;i<roster.length;i++)chosen.set(roster[i].id,{status:'Present'});
banner();
assert.ok(nodes.get('completion').textContent.includes('Whole school attendance completed'));
nodes.get('class').value='5';
dirty.clear();chosen.clear();
let renders=0;
const bulk=new Function('state','$','visible','id','render',
 section("$('bulk').onclick=()=>{",'/**\n * The server can accept')+
 "return $('bulk').onclick;")(state,$,()=>roster.slice(0,38),id,()=>renders++);
state.historyReady=true;state.pendingVerification=null;state.integrityBlocked=0;
bulk();
assert.equal(dirty.size,38);
assert.equal(renders,1,'Mark visible present should update 38 records in one render');
for(let i=0;i<38;i++)chosen.set(roster[i].id,{status:i<20?'Present':'Absent'});
const pending=roster.slice(0,38);
state.history=[];dirty.clear();
pending.forEach(s=>dirty.add(s.id));
nodes.get('date').value=date;
let saveCalls=0,readCalls=0;const messages=[];
const api={
 bulkAttendance:async(when,records)=>{
  assert.equal(when,date);assert.equal(records.length,38);saveCalls++;
  return {saved:38,inserted:38,updated:0,verification:'confirmed',
   verifiedDateRecords:records.map((r,i)=>({
    id:'attendance-'+i,studentId:r.studentId,enrlNo:r.enrlNo,
    date:r.date,status:r.status
   }))};
 },
 attendanceDateSnapshot:async()=>{readCalls++;return []},
 list:async()=>{readCalls++;return []}
};
const helpers=section('function hydrateSavedDate(rows,date){','async function load(){');
const save=section('async function verifyPendingAttendance(fastDateRows=null){',"$('clearDate').onclick=");
const deps={
 state,$,LamaAPI:api,validAdminWriteSession:()=>true,
 message:x=>messages.push(String(x)),render:()=>{},
 timeout:async p=>p,array:v=>Array.isArray(v)?v:null,
 asDate:x=>String(x||'').slice(0,10),status,id,cls,enr,
 duplicateAttendanceGroups:()=>0,qrSaving:false,confirm:()=>true,
 setInterval:()=>1,clearInterval:()=>{}
};
const actions=new Function(...Object.keys(deps),
 helpers+save+"return {save:$('save').onclick,verifyPendingAttendance};"
)(...Object.values(deps));
(async()=>{
 await actions.save();
 assert.equal(saveCalls,1);
 assert.equal(readCalls,0,'Server verified snapshot must avoid a second history request');
 assert.equal(state.dirty.size,0,'Verified marks cannot remain locally unsaved');
 assert.equal(state.pendingVerification,null);
 assert.equal(state.history.length,38);
 assert.ok(nodes.get('stage').textContent.includes('Attendance saved and verified'));
 assert.ok(messages.some(x=>x.includes('Present: 20 · Absent: 18')));
 banner();
 assert.ok(nodes.get('completion').textContent.includes('38/38 saved and verified'));
 assert.ok(nodes.get('completion').textContent.includes('Whole school: 38/349 confirmed, 311 remaining'));
 console.log('PASS: 20 Present + 18 Absent saved for class 5, 311 school-wide pending, 1 render for 38 marks, no extra HTTP read after verified save.');
})().catch(error=>{console.error(error);process.exitCode=1;});
