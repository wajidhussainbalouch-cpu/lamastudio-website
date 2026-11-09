/*
 * Offline attendance regression tests (no production sheets or accounts).
 * Run: node lamastudio-school-suite/backend-api/test-offline-attendance-backend.cjs
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
function functionFrom(source,name,mocks){
 return new Function(...Object.keys(mocks),source+';return '+name+';')(...Object.values(mocks));
}
const sh={students:['id','enrlNo','name','class','section'],attendance:['id','studentId','enrlNo','date','status','studentName','class','section','markedBy','createdAt']};
function attendanceHarness(){
 const rows={students:[sh.students,['s1','101','Student A','5','A'],['s2','102','Student B','5','A'],['s3','103','Student C','4','B']],attendance:[sh.attendance]};
 let role='school',nextId=1;
 const sheet=key=>({
  getDataRange(){return{getValues:()=>rows[key].map(r=>r.slice())};},
  getLastRow:()=>rows[key].length,
  getRange(row,col,n,m){return{setValues(v){
   v.forEach((r,i)=>{rows[key][row-1+i]=r.slice();});
  }};}
 });
 const mocks={
  resolveContext:()=>({role,teacher:{assignedClass:'Class 5',assignedSection:'A',name:'Teacher'}}),
  checkPermission:()=>{},
  getCollectionSheet:(_,key)=>({sheet:sheet(key),headers:sh[key]}),
  rowToRecord:(headers,r)=>Object.fromEntries(headers.map((k,i)=>[k,r[i]])),
  recordToRow:(headers,o)=>headers.map(k=>o[k]||''),
  genId:()=>String(nextId++),
  sameClass:(a,b)=>String(a).replace(/^Class /i,'')===String(b).replace(/^Class /i,''),
  LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
  Session:{getScriptTimeZone:()=>'Asia/Karachi'},
  Utilities:{formatDate:d=>d.toISOString().slice(0,10)},
  SpreadsheetApp:{flush(){}},
  syncAttendanceParentNotifications:()=>({created:0,updated:0,error:''})
 };
 const raw=read('bulk-attendance-backend.gs');
 const onlyBulk=raw.slice(0,raw.indexOf('/**\n * One private, idempotent'));
 assert.ok(onlyBulk.length>5000,'bulk code extraction failed');
 return {bulk:functionFrom(onlyBulk,'bulkAttendanceRecords',mocks),rows,setRole:r=>{role=r;}};
}
function attendanceTests(){
 const {bulk,rows,setRole}=attendanceHarness();
 const rec=(studentId,status,baseStatus)=>({date:'2026-11-09',studentId,status,baseStatus});
 let result=bulk({date:'2026-11-09',records:[rec('s1','Present','')]});
 assert.equal(result.inserted,1);
 assert.equal(rows.attendance.length,2);
 assert.throws(()=>bulk({date:'2026-11-09',records:[rec('s1','Absent','')]}),/conflict/);
 assert.equal(rows.attendance[1][4],'Present');
 result=bulk({date:'2026-11-09',records:[rec('s1','Absent','Present')]});
 assert.equal(result.updated,1);
 const state=JSON.stringify(rows.attendance);
 assert.throws(()=>bulk({date:'2026-11-09',records:[
  rec('s2','Present',''),rec('s1','Leave','Present')
 ]}),/conflict/);
 assert.equal(JSON.stringify(rows.attendance),state,'mixed stale batch must write nothing');
 setRole('teacher');
 assert.throws(()=>bulk({date:'2026-11-09',records:[rec('s3','Present','')]}),/not assigned/);
 assert.equal(bulk({date:'2026-11-09',records:[rec('s2','Present','')]}).saved,1);
 assert.equal(bulk({date:'2026-11-09',records:[{date:'2026-11-09',studentId:'s2',status:'Leave'}]}).updated,1);
 assert.throws(()=>bulk({date:'2026-11-09',records:[rec('s1','Leave','invalid')]}),/baseline/);
 assert.throws(()=>bulk({date:'2026-02-30',records:[rec('s1','Leave','Absent')]}),/date/);
}
function snapshotTests(){
 const students=[
  {id:'s1',name:'Student A',class:'5',section:'A',enrlNo:'101',password:'DO NOT LEAK'},
  {id:'s2',name:'Student B',class:'4',section:'B',enrlNo:'102',password:'DO NOT LEAK'}
 ];
 const attendance=[
  {id:'a1',studentId:'s1',enrlNo:'101',date:new Date(Date.now()-86400000).toISOString().slice(0,10),status:'Present'},
  {id:'a2',studentId:'s2',enrlNo:'102',date:'2020-01-01',status:'Absent'}
 ];
 const mocks={
  requireSchoolAdminWrite:p=>{if(p.token!=='valid')throw Error('Unauthorized');},
  resolveContext:p=>{
   if(p.role==='teacher'&&p.apiKey!=='valid-teacher')throw Error('Unauthorized');
   return{role:p.role||'school',schoolId:'school-1'};
  },
  listRecords:(ctx,kind)=>{
   const source=kind==='students'?students:attendance;
   return ctx.role==='teacher'?source.filter(r=>kind==='students'?r.class==='5':r.studentId==='s1'):source;
  },
  Session:{getScriptTimeZone:()=>'Asia/Karachi'},
  Utilities:{formatDate:d=>d.toISOString().slice(0,10)}
 };
 const get=functionFrom(read('offline-attendance-snapshot.gs'),'lamaOfflineAttendanceSnapshot_',mocks);
 assert.throws(()=>get({role:'school',token:'invalid'}),/Unauthorized/);
 assert.throws(()=>get({role:'teacher',apiKey:'invalid'}),/Unauthorized/);
 assert.throws(()=>get({role:'student'}),/Only a verified/);
 const school=get({role:'school',token:'valid'});
 assert.equal(school.students.length,2);
 assert.equal(school.students[0].password,undefined);
 assert.equal(school.attendance.some(r=>r.date==='2020-01-01'),false);
 const older=get({role:'school',token:'valid',dates:['2020-01-01']});
 assert.equal(older.attendance.some(r=>r.date==='2020-01-01'),true);
 const teacher=get({role:'teacher',apiKey:'valid-teacher'});
 assert.equal(teacher.students.length,1);
 assert.equal(teacher.attendance.every(r=>r.studentId==='s1'),true);
 assert.equal(teacher.attendance.length,1,'recent teacher attendance should be included');
 assert.throws(()=>get({role:'school',token:'valid',dates:['2026-02-30']}),/Invalid/);
 assert.throws(()=>get({role:'school',token:'valid',dates:Array(91).fill('2020-01-01')}),/Invalid/);
}
attendanceTests();
snapshotTests();
console.log('PASS: locked attendance baseline, class scope, legacy compatibility, privacy and snapshot authorization. Mock data only.');
