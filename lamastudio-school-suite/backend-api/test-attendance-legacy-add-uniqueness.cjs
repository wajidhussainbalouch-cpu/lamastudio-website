'use strict';
// Synthetic Apps Script attendance checks. Does not access any school database.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'code.gs'),'utf8');
const start=code.indexOf('function attendanceSchoolDayKey_(raw, zone){');
const end=code.indexOf('function addRecord(ctx, collection, record) {',start);
assert.ok(start>=0&&end>start,'Cannot locate atomic attendance helpers');
assert.match(code.slice(end,end+4000),/if\(collection==='attendance'\)return addAttendanceRecordWithLock_\(ctx,record,sheet,headers\)/);
const headers=['id','studentId','enrlNo','class','date','status','createdAt'];
const toRow=(keys,record)=>keys.map(key=>record[key]??'');
const toRecord=(keys,row)=>Object.fromEntries(keys.map((key,i)=>[key,row[i]]));
const Utilities={formatDate:(d,timeZone)=>{
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
 const part=key=>parts.find(x=>x.type===key).value;
 return part('year')+'-'+part('month')+'-'+part('day');
}};
const Session={getScriptTimeZone:()=> 'Asia/Karachi'};
let seq=0,held=false,lockedCount=0,releasedCount=0,deny=false,addAudits=0;
const LockService={getScriptLock:()=>({
 tryLock:()=>{if(deny||held)return false;held=true;lockedCount++;return true},
 releaseLock:()=>{assert.equal(held,true);held=false;releasedCount++}
})};
const studentHeaders=['id','enrlNo','class','section','name'];
const studentRecords=Array.from({length:8},(_,i)=>({
 id:'s'+(i+1),enrlNo:String(i===5?5:i+1),class:i===5?'5':'4',section:'A',name:'Student '+(i+1)
}));
const studentRows=[studentHeaders,...studentRecords.map(student=>toRow(studentHeaders,student))];
const getCollectionSheet=(_ctx,collection)=>{
 assert.equal(collection,'students','Only the school-specific roster may be read');
 return {headers:studentHeaders,sheet:{getDataRange:()=>({getValues:()=>studentRows.map(row=>row.slice())})}};
};
const sameClass=(a,b)=>String(a||'').trim().toLowerCase().replace(/^class\s*/,'')===String(b||'').trim().toLowerCase().replace(/^class\s*/,'');
const api=new Function('LockService','Utilities','Session','rowToRecord','recordToRow','genId','writeAudit','getCollectionSheet','sameClass','teacherOwns',
 code.slice(start,end)+'return {attendanceSchoolDayKey_,attendanceStatusKey_,addAttendanceRecordWithLock_};'
)(LockService,Utilities,Session,toRecord,toRow,()=> 'att_'+(++seq),()=>{addAudits++},getCollectionSheet,sameClass,()=>true);
const rows=[headers],sheet={getDataRange:()=>({getValues:()=>rows.map(x=>x.slice())}),appendRow:x=>rows.push(x.slice())};
const ctx={ss:{getSpreadsheetTimeZone:()=> 'Asia/Karachi'},schoolId:'school-test',auditActor:{id:'admin-test'}};
const record=(values={})=>({studentId:'s1',enrlNo:'1',class:'4',date:'2026-11-12',status:'Present',...values});
const add=data=>api.addAttendanceRecordWithLock_(ctx,data,sheet,headers);
assert.equal(api.attendanceSchoolDayKey_(new Date('2026-11-11T19:00:00.000Z'),'Asia/Karachi'),'2026-11-12');
assert.equal(api.attendanceSchoolDayKey_('12/11/2026','Asia/Karachi'),'2026-11-12');
assert.equal(api.attendanceSchoolDayKey_('2026-02-31','Asia/Karachi'),'');
assert.equal(api.attendanceStatusKey_(' ON LEAVE '),'Leave');
let result=add(record());
assert.equal(result.id,'att_1');
assert.equal(rows.length,2);assert.equal(addAudits,1);
result=add(record({status:'P'}));
assert.equal(result.id,'att_1','Repeated identical attendance should return original ID');
assert.equal(rows.length,2,'Never append duplicate row');
assert.equal(addAudits,1);
assert.throws(()=>add(record({status:'Absent'})),/already exists.*different status/i);
add(record({studentId:'s2',enrlNo:'2'}));
add(record({date:'2026-11-13'}));
assert.equal(rows.length,4);
rows.push(toRow(headers,record({id:'native',studentId:'s3',enrlNo:'3',date:new Date('2026-11-11T19:00:00.000Z'),status:'Absent'})));
assert.equal(add(record({studentId:'s3',enrlNo:'3',status:'A'})).id,'native');
rows.push(toRow(headers,record({id:'old',studentId:'',enrlNo:'5',class:'4'})));
assert.equal(add(record({studentId:'s5',enrlNo:'5',class:'4'})).id,'old');
assert.ok(add(record({studentId:'s6',enrlNo:'5',class:'5'})).id);
rows.push(toRow(headers,record({id:'dup1',studentId:'s7',enrlNo:'7'})));
rows.push(toRow(headers,record({id:'dup2',studentId:'s7',enrlNo:'7'})));
const before=rows.length;
assert.throws(()=>add(record({studentId:'s7',enrlNo:'7'})),/Duplicate saved attendance/);
assert.equal(rows.length,before);
assert.throws(()=>add(record({date:'2026-02-31'})),/valid student ID, date/);
assert.throws(()=>add(record({studentId:''})),/valid student ID/);
assert.throws(()=>add(record({status:'Invalid'})),/Present\/Absent\/Leave/);
assert.throws(()=>add(record({studentId:'unknown',enrlNo:'999'})),/school roster/);
assert.throws(()=>add(record({studentId:'s2',enrlNo:'1'})),/enrollment does not match/);
assert.throws(()=>add(record({studentId:'s2',enrlNo:'2',class:'5'})),/class does not match/);
assert.throws(()=>add(record({studentId:'s2',enrlNo:'2',section:'B'})),/section does not match/);
deny=true;
assert.throws(()=>add(record({studentId:'s8',enrlNo:'8'})),/busy/);
deny=false;
assert.equal(rows.length,before);
assert.equal(held,false);
assert.equal(lockedCount,releasedCount,'No leaked script locks');
console.log('PASS: legacy attendance adds are lock-protected, idempotent, date-safe and duplicate-aware.');
