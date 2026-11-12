'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const backend=fs.readFileSync(path.join(root,'backend-api','code.gs'),'utf8');
const page=fs.readFileSync(path.join(__dirname,'teacher-attendance.html'),'utf8');
const client=fs.readFileSync(path.join(root,'js','api-client.js'),'utf8');
assert.match(client,/teacherAttendanceDailySnapshot:/);
assert.match(client,/bulkTeacherAttendanceVerified:/);

const from=backend.indexOf('function teacherAttendanceDate_(value, tz) {');
const to=backend.indexOf('function getRecord(ctx, collection, id) {',from);
assert.ok(from>=0&&to>from,'Fast attendance backend functions missing');

const teacherHeaders=['id','name','subject','assignedClass','designation','status','contact','photo'];
const attendanceHeaders=['id','teacherId','teacherName','date','status','markedBy','createdAt','remarks'];
const teacherData=Array.from({length:7},(_,i)=>({
 id:'t'+(i+1),name:'Teacher '+(i+1),subject:'General',
 assignedClass:i===0?'5':i===1?'4':i<4?'Playgroup':'6',
 designation:'Teacher',status:'Active',contact:'',photo:''
}));
const attendanceData=[{id:'a1',teacherId:'t1',teacherName:'Teacher 1',
 date:new Date('2026-11-11T19:00:00.000Z'),status:'Present',
 markedBy:'Admin',createdAt:'2026-11-11',remarks:''}];
class Sheet{
 constructor(headers,rows){this.headers=headers;this.rows=rows}
 getDataRange(){return {getValues:()=>[this.headers.slice(),...this.rows.map(r=>this.headers.map(k=>r[k]??''))]}}
 getLastRow(){return this.rows.length+1}
 getRange(row,col,nRows,nCols){
  assert.equal(col,1);assert.equal(nCols,this.headers.length);
  return {setValues:arr=>{
   assert.equal(arr.length,nRows);
   for(let j=0;j<nRows;j++){
    const at=row+j-2;
    const obj=Object.fromEntries(this.headers.map((k,i)=>[k,arr[j][i]]));
    if(at<this.rows.length)this.rows[at]=obj;
    else if(at===this.rows.length)this.rows.push(obj);
    else throw Error('Sheet row gap');
   }
  }};
 }
}
const teacherSheet=new Sheet(teacherHeaders,teacherData.map(x=>({...x})));
const attendanceSheet=new Sheet(attendanceHeaders,attendanceData.map(x=>({...x})));
const rowToRecord=(headers,row)=>Object.fromEntries(headers.map((k,i)=>[k,row[i]]));
const recordToRow=(headers,rec)=>headers.map(k=>rec[k]??'');
const ctx={role:'school',schoolId:'sch_test',ss:{getSpreadsheetTimeZone:()=> 'Asia/Karachi'},auditActor:{id:'admin-1'}};
const getCollectionSheet=(_ctx,collection)=>collection==='teachers'?{sheet:teacherSheet,headers:teacherHeaders}:
 collection==='teacherAttendance'?{sheet:attendanceSheet,headers:attendanceHeaders}:
 (()=>{throw Error('Bad collection')})();
const Utilities={formatDate:(dt,tz)=>{
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(dt);
 const get=k=>parts.find(p=>p.type===k)?.value;
 return get('year')+'-'+get('month')+'-'+get('day');
}};
let lockCount=0,flushed=0,nextId=0;
const audits=[];
const factory=new Function(
 'resolveContext','getCollectionSheet','rowToRecord','recordToRow','Utilities','Session','LockService',
 'SpreadsheetApp','assertSchoolWritable','checkPermission','genId','writeAudit',
 backend.slice(from,to)+'return {teacherAttendanceDate_,teacherAttendanceDailySnapshot_,bulkTeacherAttendanceVerified_};');
const svc=factory(
 p=>{if(p.schoolId!=='sch_test')throw Error('Cross-school access denied');return ctx},
 getCollectionSheet,rowToRecord,recordToRow,Utilities,
 {getScriptTimeZone:()=> 'Asia/Karachi'},
 {getScriptLock:()=>({tryLock:()=>{lockCount++;return true},releaseLock:()=>{lockCount--}})},
 {flush:()=>{flushed++}},
 ()=>{},()=>{},
 prefix=>prefix+'_'+(++nextId),
 (...args)=>audits.push(args)
);
const date='2026-11-12';
assert.equal(svc.teacherAttendanceDate_(new Date('2026-11-11T19:00:00Z'),'Asia/Karachi'),date);
assert.equal(svc.teacherAttendanceDate_('12/11/2026','Asia/Karachi'),date);
assert.equal(svc.teacherAttendanceDate_('2026-11-12','Asia/Karachi'),date);
assert.throws(()=>svc.teacherAttendanceDailySnapshot_({schoolId:'another',date}),/Cross-school/);
assert.equal(svc.teacherAttendanceDailySnapshot_({schoolId:'sch_test',date}).records.length,1);
const items=teacherData.map(t=>({teacherId:t.id,status:'Present',remarks:''}));
const first=svc.bulkTeacherAttendanceVerified_({schoolId:'sch_test',date,records:items});
assert.equal(first.verified,true);
assert.equal(first.saved,7);
assert.equal(first.records.length,7);
assert.equal(first.duplicates.length,0);
assert.equal(new Set(first.records.map(x=>x.teacherId)).size,7);
assert.equal(attendanceSheet.rows.length,7,'Native Sheets Date should update, not append a duplicate');
assert.equal(flushed,1);
assert.equal(lockCount,0);
const second=svc.bulkTeacherAttendanceVerified_({schoolId:'sch_test',date,records:items});
assert.equal(second.saved,7);
assert.equal(attendanceSheet.rows.length,7,'Idempotent save must never append second copy');
const changed=svc.bulkTeacherAttendanceVerified_({schoolId:'sch_test',date,
 records:[{teacherId:'t2',status:'Absent',remarks:'Sick'}]});
assert.equal(changed.records[0].status,'Absent');
assert.equal(changed.records[0].remarks,'Sick');
assert.equal(attendanceSheet.rows.length,7);
assert.throws(()=>svc.bulkTeacherAttendanceVerified_({schoolId:'sch_test',date,records:[items[0],items[0]]}),/Duplicate teacher ID/);
assert.throws(()=>svc.bulkTeacherAttendanceVerified_({schoolId:'sch_test',date,records:[{teacherId:'not-registered',status:'Present'}]}),/not registered/);
assert.throws(()=>svc.bulkTeacherAttendanceVerified_({schoolId:'another',date,records:[items[0]]}),/Cross-school/);
const before=attendanceSheet.rows.length;
attendanceSheet.rows.push({...attendanceSheet.rows[0],id:'duplicate-a1'});
assert.throws(()=>svc.bulkTeacherAttendanceVerified_({schoolId:'sch_test',date,records:[items[0]]}),/Duplicate teacher\/date/);
assert.equal(attendanceSheet.rows.length,before+1,'Unsafe duplicates must not be deleted or changed');
assert.equal(lockCount,0);

const helperFrom=page.indexOf('function teacherClass(t){');
const helperTo=page.indexOf('function render(){',helperFrom);
assert.ok(helperFrom>=0&&helperTo>helperFrom);
const nodes=new Map(),$=key=>{
 if(!nodes.has(key))nodes.set(key,{value:'',textContent:'',innerHTML:''});
 return nodes.get(key);
};
$('date').value=date;$('classFilter').value='5';
const frontendFactory=new Function('teachers','records','dirty','selected','attendanceHistoryLoaded','pendingVerification','duplicateTeacherIds','$','id','status','reason','recDate','fld','esc',
 page.slice(helperFrom,helperTo)+'return {teacherMetrics,updateTeacherCoverage};');
const selected=new Map(),dirty=new Set(),recDate=r=>date,
 fld=(t,...keys)=>keys.map(k=>t[k]).find(Boolean)||'',
 status=r=>['Present','Absent','Leave'].includes(r.status)?r.status:'',
 reason=r=>String(r.remarks||''),id=t=>t.id,esc=v=>String(v).replace(/&/g,'&amp;');
const ui=frontendFactory(teacherData,first.records,dirty,selected,true,null,[],$,id,status,reason,recDate,fld,esc);
const all=ui.teacherMetrics(teacherData);
assert.equal(all.percent,100);
assert.equal(all.Present,7);
assert.equal(all.unmarked,0);
ui.updateTeacherCoverage();
assert.equal($('total').textContent,1,'Class 5 must show exactly one teacher');
assert.equal($('present').textContent,1);
assert.equal($('schoolTotal').textContent,7);
assert.equal($('schoolPresent').textContent,7);
assert.match($('schoolAttendanceCoverage').textContent,/100% verified/);
assert.match($('teacherClassCoverageRows').innerHTML,/Playgroup/);
assert.match(page,/Save successful!/);
assert.match(page,/Attendance history unavailable/);
assert.match(page,/Saving may have reached the server/);
assert.match(page,/teacherLoadPercent'\)\.textContent='Not verified'/);
console.log('PASS: seven teachers, 100% verified; class 5 shows 1/1, school 7/7; date shifted native Sheets rows, idempotent batch and duplicate blocking.');
