'use strict';
/* Synthetic data only. No live school records or Apps Script writes. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'portals/teacher/index.html'),'utf8');
function between(start,end){
 const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing source block '+start);
 return source.slice(a,b);
}
const helpers=between('function attendanceDay(raw){','function schoolMatch(r){');
const save=between('async function saveAttendance(){','function loadAbsentees(){');
const fixtureFactory=new Function('config',[
 "const norm=s=>String(s??'').trim().toLowerCase();",
 "const messages=[],requests=[],statusNode={textContent:'',className:''};",
 "const dateNode={value:config.date||'2026-11-12'};",
 "const saveButton={disabled:false,textContent:'💾 Save',dataset:{}};",
 "const $=id=>id==='attDate'?dateNode:id==='attendanceSyncStatus'?statusNode:null;",
 "const students=config.students||[{id:'s1',enrlNo:'1',name:'Ali',class:'4'}];",
 "let me={schoolId:'sch-demo',assignedClass:'4',teacherId:'t1',timezone:'Asia/Karachi'};",
 "let myStudents=students;",
 "let attendance=config.initial?config.initial.map(x=>({...x})):[];",
 "let attendanceLoaded=config.loaded!==false;",
 "let attendanceLoadError='',attendanceSaving=false,attendanceWriteHold=false;",
 "const server=attendance.map(x=>({...x}));",
 "const document={",
 " querySelector:()=>saveButton,",
 " querySelectorAll:()=>config.selected===null?[]:(config.selected||[{studentId:'s1',status:'Present'}]).map(item=>({",
 "  dataset:{studentId:item.studentId},",
 "  querySelector:()=>item.status?{dataset:{status:item.status}}:null",
 " }))};",
 "const myStudent=id=>students.find(s=>String(s.id)===String(id));",
 "const message=text=>messages.push(text);",
 "const loadAttendanceList=()=>{};",
 "const LamaAPI={",
 " add:async (collection,record)=>{requests.push({action:'add',collection,record});if(config.failWrite)throw Error('Simulated backend timeout');const saved={...record,id:'record-'+(server.length+1)};if(!config.ignoreWrite)server.push(saved);return saved;},",
 " update:async (collection,id,patch)=>{requests.push({action:'update',collection,id,patch});if(config.failWrite)throw Error('Simulated backend timeout');const target=server.find(r=>r.id===id);if(!target)throw Error('Unknown saved record');if(!config.ignoreWrite)Object.assign(target,patch);return {...target,...patch};}",
 "};",
 "async function refresh(){if(config.failReload){attendanceLoaded=false;attendanceLoadError='Backend attendance list unavailable';return;}attendance=server.map(x=>({...x}));attendanceLoaded=true;attendanceLoadError='';}",
 helpers,
 save,
 "return {saveAttendance,messages,requests,statusNode,saveButton,server,attendanceDay,savedRowsFor,currentDayDuplicates,getFlags:()=>({attendanceLoaded,attendanceWriteHold,attendanceSaving}),setLoaded:value=>{attendanceLoaded=value}};"
].join('\n'));

(async()=>{
 const native='2026-11-11T19:00:00.000Z';
 let env=fixtureFactory({loaded:false});
 await env.saveAttendance();
 assert.equal(env.requests.length,0);
 assert.match(env.messages.at(-1),/not been verified/i);
 assert.equal(env.attendanceDay(native),'2026-11-12');

 env=fixtureFactory({initial:[{id:'old1',studentId:'s1',date:native,status:'Present'}]});
 await env.saveAttendance();
 assert.equal(env.requests.length,0,'Unchanged marks should not be written again');
 assert.match(env.messages.at(-1),/No new attendance changes/i);

 env=fixtureFactory({initial:[
  {id:'old1',studentId:'s1',date:native,status:'Absent'},
  {id:'old2',studentId:'s1',date:'2026-11-12',status:'Present'}
 ]});
 await env.saveAttendance();
 assert.equal(env.requests.length,0,'Existing duplicate must block saves');
 assert.match(env.messages.at(-1),/duplicate/i);

 env=fixtureFactory({selected:[{studentId:'s1',status:'Absent'}],initial:[{id:'old1',studentId:'s1',date:native,status:'Present'}]});
 await env.saveAttendance();
 assert.equal(env.requests.length,1);
 assert.equal(env.requests[0].action,'update');
 assert.equal(env.requests[0].id,'old1');
 assert.equal(env.getFlags().attendanceWriteHold,false);
 assert.match(env.messages.at(-1),/saved successfully and verified/i);
 assert.equal(env.savedRowsFor({id:'s1'},'2026-11-12').length,1);

 env=fixtureFactory({selected:[{studentId:'s1',status:'Absent'}]});
 await env.saveAttendance();
 assert.equal(env.requests[0].action,'add');
 assert.equal(env.server.length,1);
 assert.match(env.messages.at(-1),/saved successfully and verified/i);
 assert.equal(env.getFlags().attendanceSaving,false);

 env=fixtureFactory({selected:[{studentId:'s1',status:'Present'}],ignoreWrite:true});
 await env.saveAttendance();
 assert.equal(env.requests.length,1);
 assert.equal(env.getFlags().attendanceWriteHold,true,'Read-back mismatch locks further writes');
 assert.doesNotMatch(env.messages.at(-1),/✓ Attendance saved successfully/);
 await env.saveAttendance();
 assert.equal(env.requests.length,1,'Uncertain response must not be retried');

 env=fixtureFactory({selected:[{studentId:'s1',status:'Present'}],failReload:true});
 await env.saveAttendance();
 assert.equal(env.getFlags().attendanceLoaded,false);
 assert.equal(env.getFlags().attendanceWriteHold,true);
 assert.doesNotMatch(env.messages.at(-1),/✓ Attendance saved successfully/);

 env=fixtureFactory({selected:[{studentId:'s1',status:'Present'}],failWrite:true});
 await env.saveAttendance();
 assert.equal(env.getFlags().attendanceWriteHold,true);
 assert.equal(env.requests.length,1);
 assert.match(env.messages.at(-1),/NOT fully verified/i);
 assert.match(source,/const locked=!attendanceLoaded\|\|attendanceSaving\|\|attendanceWriteHold\|\|!!duplicates.length/);
 assert.match(source,/if\(!document.hidden&&me.schoolId&&!attendanceSaving\)/);
 assert.match(source,/if\(me.schoolId&&!attendanceSaving\)/);
 console.log('PASS: school-local dates, duplicates, no-history, unchanged marks, verified add/update, read-back uncertainty and write locks.');
})().catch(error=>{console.error(error);process.exitCode=1});
