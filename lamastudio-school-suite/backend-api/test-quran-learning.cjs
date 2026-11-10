/**
 * End-to-end mock for real quran-learning.gs source.
 * No actual Apps Script deployment, network or school spreadsheet is changed.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'quran-learning.gs'),'utf8');
class Sheet {
 constructor(headers){this.rows=headers.length?[headers.slice()]:[];this.getParent=()=>this.owner;}
 getLastColumn(){return this.rows[0]?.length||0;}
 getDataRange(){return {getValues:()=>this.rows.map(r=>r.slice())};}
 getRange(row,col,count=1,width=this.getLastColumn()){
  return {getValues:()=>Array.from({length:count},(_,i)=>
   Array.from({length:width},(_,j)=>this.rows[row-1+i]?.[col-1+j]??'')),
   setValues:values=>{
    for(let i=0;i<values.length;i++){
     if(!this.rows[row-1+i])this.rows[row-1+i]=[];
     for(let j=0;j<values[i].length;j++)this.rows[row-1+i][col-1+j]=values[i][j];
    }
   }};
 }
 appendRow(values){this.rows.push(values.slice());}
 setFrozenRows(){}
}
class Book {
 constructor(){this.tabs=new Map();}
 getSheetByName(name){return this.tabs.get(name)||null;}
 insertSheet(name){if(this.tabs.has(name))throw Error('duplicate sheet');const sheet=new Sheet([]);sheet.owner=this;this.tabs.set(name,sheet);return sheet;}
 add(name,head,rows=[]){const s=new Sheet(head);s.owner=this;s.rows.push(...rows.map(r=>r.slice()));this.tabs.set(name,s);return s;}
 getSpreadsheetTimeZone(){return 'Asia/Karachi';}
}
const A=new Book(),B=new Book(),master=new Book();
A.add('Students',['id','enrlNo','name','class','section','photo'],[
 ['sA1','1','Student A One','Playgroup','',''],['sA2','2','Student A Two','Class 3','','']]);
A.add('Teachers',['id','name','status','assignedClass','assignedSection'],[
 ['tA1','Teacher A One','Active','Playgroup',''],['tA2','Teacher A Two','Active','Class 3','']]);
B.add('Students',['id','enrlNo','name','class','section','photo'],[
 ['sB1','1','Student B One','Playgroup','','']]);
B.add('Teachers',['id','name','status','assignedClass','assignedSection'],[
 ['tB1','Teacher B','Active','Playgroup','']]);
const registry=[
 {schoolId:'A',name:'School A',status:'Active',apiKey:'keyA',sheetId:'A'},
 {schoolId:'B',name:'School B',status:'Active',apiKey:'keyB',sheetId:'B'}
];
master.add('Registry',['schoolId','name','status','apiKey','sheetId'],registry.map(s=>Object.values(s)));
let idCount=0,flushed=0;
const codeDeps={
 getRegistrySheet:()=>master.getSheetByName('Registry'),
 findSchoolRow:(_sheet,test)=>{const x=registry.find(test);return x?{obj:x}:null;},
 authorizeAdmin:token=>{if(token!=='SUPER')throw Error('Super Admin required');return true;},
 verifySchoolAdminToken:p=>{
  if(!((p.schoolId==='A'&&p.token==='tokenA')||(p.schoolId==='B'&&p.token==='tokenB')))
   throw Error('Verified school admin token required');
  return{id:'admin-'+p.schoolId,name:'School Admin'};
 },
 resolveContext:p=>{
  const school=registry.find(s=>s.schoolId===p.schoolId);
  if(!school||school.status!=='Active')throw Error('School unavailable');
  if(p.role==='school'){
   if(p.apiKey!==school.apiKey)throw Error('Wrong school key');
   return {role:'school',schoolId:p.schoolId,ss:p.schoolId==='A'?A:B};
  }
  if(p.role==='teacher'){
   const book=p.schoolId==='A'?A:B,teacher=book.getSheetByName('Teachers').rows.slice(1)
    .find(row=>row[0]===p.teacherId);
   if(!teacher||p.apiKey!=='teach-'+p.teacherId)throw Error('Invalid teacher credentials');
   return {role:'teacher',schoolId:p.schoolId,ss:book,
    teacher:{id:teacher[0],name:teacher[1],assignedClass:teacher[3],assignedSection:teacher[4]}};
  }
  if(p.role==='student'){
   const book=p.schoolId==='A'?A:B,student=book.getSheetByName('Students').rows.slice(1)
    .find(row=>row[0]===p.studentId);
   if(!student||p.apiKey!=='student-'+p.studentId)throw Error('Invalid student credentials');
   return {role:'student',schoolId:p.schoolId,ss:book,student:{id:student[0],name:student[2],class:student[3],section:student[4]}};
  }
  throw Error('Invalid role');
 },
 getCollectionSheet:(ctx,name)=>{
  const tab=name==='students'?'Students':'Teachers',sheet=ctx.ss.getSheetByName(tab);
  return {sheet,headers:sheet.rows[0]};
 },
 ensureSheetHeaders:(sheet,heads)=>{for(const h of heads)if(!sheet.rows[0].includes(h))sheet.rows[0].push(h);},
 rowToRecord:(headers,row)=>Object.fromEntries(headers.map((k,i)=>[k,row[i]??''])),
 recordToRow:(headers,record)=>headers.map(h=>record[h]??''),
 genId:()=> 'q'+(++idCount),
 LockService:{getScriptLock:()=>{let held=false;return{tryLock:()=>{if(held)throw Error('Lock re-entry');held=true;return true},releaseLock:()=>{held=false}}}},
 SpreadsheetApp:{flush:()=>{flushed++}},
 Utilities:{formatDate:(date,zone,format)=>{assert.equal(format,'yyyy-MM-dd');return date.toISOString().slice(0,10)}},
 Session:{getScriptTimeZone:()=> 'Asia/Karachi'},
 teacherOwns:(ctx,student)=>student.class===ctx.teacher.assignedClass,
 sameClass:(a,b)=>String(a||'').toLowerCase()===String(b||'').toLowerCase()
};
const api=new Function(...Object.keys(codeDeps),source+';return {quranHandleRequest_,quranDate_,quranValidateLesson_};')(...Object.values(codeDeps));
const school=p=>({role:'school',schoolId:'A',token:'tokenA',...p});
const teacher=p=>({role:'teacher',schoolId:'A',teacherId:'tA1',apiKey:'teach-tA1',...p});
const parent=p=>({role:'student',schoolId:'A',studentId:'sA1',apiKey:'student-sA1',...p});
const call=(action,p)=>api.quranHandleRequest_({...p,action}).result;
assert.equal(call('quranStatus',school({})).enabled,false,'Default denied');
assert.equal(A.getSheetByName('QuranLessons'),null,'Disabled school must not create Quran tables');
assert.throws(()=>call('quranOverview',teacher({})),/not activated/);
assert.throws(()=>call('quranAdminSetSchool',{adminApiKey:'wrong',targetSchoolId:'A',enabled:true,hifzEnabled:false}),/Super Admin/);
assert.throws(()=>call('quranAdminSetSchool',{adminApiKey:'SUPER',targetSchoolId:'A',enabled:false,hifzEnabled:true}),/Hifz cannot/);
assert.deepEqual(call('quranAdminSetSchool',{adminApiKey:'SUPER',targetSchoolId:'A',enabled:true,hifzEnabled:true}).enabled,true);
assert.equal(call('quranStatus',school({})).enabled,true);
assert.equal(call('quranStatus',{role:'school',schoolId:'B',token:'tokenB'}).enabled,false,'School B remains denied');
assert.throws(()=>call('quranConfigure',school({programmes:['hifz','qaida','qaida']})),/unique valid/);
assert.deepEqual(call('quranConfigure',school({programmes:['qaida','hifz','islamicStudies']})).programmes,
 ['qaida','hifz','islamicStudies']);
assert.throws(()=>call('quranEnroll',school({studentId:'sB1',teacherId:'tA1',programCode:'qaida'})),/Student unavailable/);
const enrolled=call('quranEnroll',school({
 studentId:'sA1',teacherId:'tA1',programCode:'qaida',level:'Book 1 lesson 1'
}));
assert.equal(enrolled.studentId,'sA1');
assert.equal(A.getSheetByName('Students').rows.length,3,'No new student account created');
assert.equal(call('quranOverview',school({})).students,1);
assert.equal(call('quranOverview',teacher({})).students,1);
const lesson={enrollmentId:enrolled.id,date:'2026-11-10',sessionType:'lesson',
 lessonTitle:'Arabic letter recognition',quality:'Good',parentFeedback:'Practise the assigned page.',
 teacherRemarks:'Private observation',mistakes:'Correction notes',published:true,
 clientRequestId:'request00001',expectedVersion:0};
const saved=call('quranSaveLesson',teacher(lesson));
assert.equal(saved.version,1);
assert.equal(saved.studentId,'sA1');
assert.equal(call('quranSaveLesson',teacher(lesson)).id,saved.id,'Network retry must not append');
assert.equal(A.getSheetByName('QuranLessons').rows.length,2,'One lesson per person/date/type');
assert.throws(()=>call('quranSaveLesson',teacher({...lesson,clientRequestId:'request00002'})),/changed on another device/);
const corrected=call('quranSaveLesson',teacher({...lesson,clientRequestId:'request00003',expectedVersion:1,
 lessonTitle:'Teacher-reviewed updated lesson'}));
assert.equal(corrected.version,2);
assert.equal(A.getSheetByName('QuranLessons').rows.length,2,'Correction updates, not appends');
assert.throws(()=>call('quranSaveLesson',teacher({...lesson,clientRequestId:'request00004',expectedVersion:1})),/changed on another device/);
const staffView=call('quranProfile',teacher({studentId:'sA1'}));
assert.equal(staffView.lessons[0].teacherRemarks,'Private observation');
assert.equal(staffView.lessons[0].lessonTitle,'Teacher-reviewed updated lesson');
const family=call('quranProfile',parent({studentId:'sA1'}));
assert.equal(family.student.id,'sA1');
assert.equal(family.lessons[0].teacherRemarks,undefined);
assert.equal(family.lessons[0].mistakes,undefined);
assert.equal(family.lessons[0].parentFeedback,'Practise the assigned page.');
assert.throws(()=>call('quranProfile',parent({studentId:'sA2'})),/private|unavailable|Invalid student credentials/i);
assert.throws(()=>call('quranSaveLesson',parent({...lesson,clientRequestId:'request00005'})),/read-only|denied|Quran teacher/i);
assert.throws(()=>call('quranSaveLesson',{
 role:'teacher',schoolId:'A',teacherId:'tA2',apiKey:'teach-tA2',
 ...lesson,clientRequestId:'request00006'}),/assignment required/);
assert.equal(call('quranStatus',{role:'teacher',schoolId:'B',teacherId:'tB1',apiKey:'teach-tB1'}).enabled,false,'Disabled school can see only its disabled status');
const attended=call('quranSaveAttendance',teacher({
 enrollmentId:enrolled.id,date:'2026-11-10',status:'Present',clientRequestId:'requestatt01',expectedVersion:0}));
assert.equal(attended.version,1);
assert.equal(call('quranSaveAttendance',teacher({
 enrollmentId:enrolled.id,date:'2026-11-10',status:'Present',clientRequestId:'requestatt01',expectedVersion:0})).id,attended.id);
const assessment=call('quranSaveAssessment',teacher({enrollmentId:enrolled.id,date:'2026-11-10',
 criterion:'Makharij',level:'Developing',remarks:'Qualified teacher review',published:false,
 clientRequestId:'requestasm01',expectedVersion:0}));
assert.equal(assessment.level,'Developing');
assert.equal(call('quranProfile',parent({studentId:'sA1'})).assessments.length,0,'Unpublished assessment private');
const slot=call('quranSaveSchedule',school({teacherId:'tA1',className:'Playgroup',section:'',
 dayOfWeek:2,startTime:'09:00',endTime:'09:30',programCode:'qaida'}));
assert.equal(slot.dayOfWeek,2);
assert.throws(()=>call('quranSaveSchedule',school({teacherId:'tA1',className:'Class 3',
 dayOfWeek:2,startTime:'09:20',endTime:'10:00',programCode:'qaida'})),/timetable conflict/);
assert.equal(call('quranSchedules',teacher({})).length,1);
const previousCount=A.getSheetByName('QuranLessons').rows.length;
call('quranAdminSetSchool',{adminApiKey:'SUPER',targetSchoolId:'A',enabled:false,hifzEnabled:false});
assert.throws(()=>call('quranOverview',school({})),/not activated/);
assert.equal(A.getSheetByName('QuranLessons').rows.length,previousCount,'Deactivation preserves historical lessons');
assert.ok(flushed>=7);
console.log('PASS: module defaults off; Super Admin grants; school isolation; teacher scope; parent privacy; enrolment; idempotent+CAS lessons/attendance; assessments; timetable conflicts; deactivation preserves data.');
