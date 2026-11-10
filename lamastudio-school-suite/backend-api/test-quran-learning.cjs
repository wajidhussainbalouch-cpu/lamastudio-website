/* Offline mock tests of the actual Quran Apps Script module. No live school data. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'quran-learning.gs'),'utf8');
function makeSheet(headers,initialRows=[]){
 const rows=[headers.slice(),...initialRows.map(x=>x.slice())];
 return {
  rows,
  getLastColumn:()=>headers.length,
  getDataRange:()=>({getValues:()=>rows.map(x=>x.slice())}),
  appendRow:r=>{rows.push(r.slice())},
  setFrozenRows:()=>{},
  getRange:(row,col,length,width)=>({
   getValues:()=>rows.slice(row-1,row-1+(length||1)).map(r=>r.slice((col||1)-1,(col||1)-1+(width||headers.length))),
   setValues:v=>{for(let i=0;i<v.length;i++)rows[row-1+i]=v[i].slice()}
  })
 };
}
const shA=new Map(),shB=new Map();
const schoolA={
 getSheetByName:name=>shA.get(name)||null,
 insertSheet:name=>{
  if(shA.has(name))throw Error('Duplicate test sheet');
  const s=makeSheet([]); // initialized by appendRow of first header row
  s.rows.splice(0,1);s.getLastColumn=()=>s.rows[0]?.length||0;
  shA.set(name,s);return s
 }
};
const schoolB={
 getSheetByName:name=>shB.get(name)||null,
 insertSheet:name=>{
  const s=makeSheet([]);s.rows.splice(0,1);s.getLastColumn=()=>s.rows[0]?.length||0;
  shB.set(name,s);return s
 }
};
const rosterHeaders=['id','name','class','section','photo','enrlNo'];
const teacherHeaders=['id','name','assignedClass','assignedSection','status'];
const roster=makeSheet(rosterHeaders,[
 ['s1','Student One','Playgroup','A','','2'],
 ['s2','Student Two','Playgroup','A','','3'],
 ['s3','Student Three','Class 5','','','4']
]);
const staff=makeSheet(teacherHeaders,[
 ['teacher1','Ustad One','Playgroup','A','Active'],
 ['teacher2','Ustad Two','Class 5','','Active']
]);
let schoolGrants={schoolA:true,schoolB:false},lockHeld=false,generated=0,flushed=0;
const record=(h,row)=>Object.fromEntries(h.map((k,i)=>[k,row[i]]));
const toRow=(h,obj)=>h.map(k=>obj[k]??'');
const mock={
 resolveContext:p=>{
  if(p.schoolId==='schoolB')return {role:p.role,schoolId:'schoolB',ss:schoolB,
   student:{id:p.studentId||'s1'},teacher:{id:p.teacherId||'teacher1',assignedClass:'Playgroup',assignedSection:'A'}};
  if(p.schoolId!=='schoolA')throw Error('Invalid school');
  if(p.role==='school')return {role:'school',schoolId:'schoolA',ss:schoolA};
  if(p.role==='teacher'){
   if(p.apiKey!=='teacher-secret')throw Error('Teacher login invalid');
   const r=staff.rows.find(x=>x[0]===p.teacherId);
   if(!r)throw Error('Teacher not found');
   return {role:'teacher',schoolId:'schoolA',ss:schoolA,
     teacher:record(teacherHeaders,r)};
  }
  if(p.role==='student'){
   if(p.apiKey!=='student-secret')throw Error('Student login invalid');
   const r=roster.rows.find(x=>x[0]===p.studentId);
   if(!r)throw Error('Student not found');
   return {role:'student',schoolId:'schoolA',ss:schoolA,
    student:record(rosterHeaders,r)};
  }
  throw Error('Invalid login role');
 },
 lamaRequireModuleForVerifiedSchool_:(id,module)=>{
  assert.equal(module,'quranLearning');
  if(!schoolGrants[id])throw Error('ENTITLEMENT_REQUIRED');
  return {allowed:true};
 },
 verifySchoolAdminToken:p=>{
  if(p.token!=='valid-admin-token')throw Error('School Administrator login required');
  return{id:'admin1',role:'schoolAdmin'};
 },
 assertSchoolWritable:id=>{if(id!=='schoolA')throw Error('Read-only school');},
 getCollectionSheet:(_ctx,kind)=>{
  if(kind==='students')return {sheet:roster,headers:rosterHeaders};
  if(kind==='teachers')return {sheet:staff,headers:teacherHeaders};
  throw Error('Unexpected generic collection '+kind);
 },
 teacherOwns:(ctx,student)=>String(ctx.teacher.assignedClass)===String(student.class)&&
  (!ctx.teacher.assignedSection||ctx.teacher.assignedSection===student.section),
 sameClass:(a,b)=>String(a||'').trim().toLowerCase()===String(b||'').trim().toLowerCase(),
 rowToRecord:record,recordToRow:toRow,
 genId:prefix=>prefix+'_'+String(++generated),
 LockService:{getScriptLock:()=>({tryLock:()=>{assert.equal(lockHeld,false,'Lock must not nest');lockHeld=true;return true},
  releaseLock:()=>{assert.equal(lockHeld,true);lockHeld=false}})},
 SpreadsheetApp:{flush:()=>{flushed++}}
};
const lib=new Function(...Object.keys(mock),source+'return {quranDispatch_,quranRows_,quranSettings_};')(...Object.values(mock));
const admin={role:'school',schoolId:'schoolA',token:'valid-admin-token'};
const teacher={role:'teacher',schoolId:'schoolA',teacherId:'teacher1',apiKey:'teacher-secret'};
const otherTeacher={role:'teacher',schoolId:'schoolA',teacherId:'teacher2',apiKey:'teacher-secret'};
const child={role:'student',schoolId:'schoolA',studentId:'s1',apiKey:'student-secret'};
const sibling={role:'student',schoolId:'schoolA',studentId:'s2',apiKey:'student-secret'};
const dispatch=(actor,action,details={})=>lib.quranDispatch_({...actor,action,...details});
function save(actor,kind,record,opts={}){
 return dispatch(actor,'quranSave',{kind,record,id:opts.id||'',expectedVersion:opts.expectedVersion||0}).record;
}
function rows(kind){return lib.quranRows_({ss:schoolA},kind)}
assert.throws(()=>dispatch(admin,'quranBootstrap'),/ENTITLEMENT_REQUIRED/,
 'No Quran records should be accessible without a Super Admin grant');
assert.equal(shA.size,0,'Unauthorized reads must create zero school tabs');
schoolGrants.schoolA=true;
assert.throws(()=>dispatch({...admin,token:'invalid'},'quranBootstrap'),/Administrator/);
const initial=dispatch(admin,'quranBootstrap',{date:'2026-11-10'}).data;
assert.equal(initial.learners,0);
assert.deepEqual(initial.settings.programmes,['Qaida','Nazra','IslamicStudies']);
assert.equal(shA.size,0,'Even authorized empty read should not create tables');
let settings=save(admin,'settings',{programmes:['Qaida','Nazra','IslamicStudies','Hifz'],
 hifzEnabled:true,akhlaqEnabled:false});
assert.equal(settings.version,1);
assert.equal(lib.quranSettings_({ss:schoolA}).hifzEnabled,true);
assert.throws(()=>save(admin,'settings',{programmes:['Qaida'],hifzEnabled:false},{
 id:settings.id,expectedVersion:0}),/edit conflict/,'Stale settings version must be denied');
const assignment=save(admin,'assignments',{teacherId:'teacher1',
 programme:'Qaida',class:'Playgroup',section:'A',groupName:'Qaida A',status:'Active'});
assert.equal(assignment.version,1);
assert.throws(()=>save(admin,'assignments',{teacherId:'teacher1',
 programme:'Qaida',class:'Playgroup',section:'A',status:'Active'}),/already exists/);
assert.throws(()=>save(admin,'enrollments',{studentId:'s3',
 programme:'Qaida',teacherId:'teacher1',status:'Active'}),/class do not match/);
const enrolled=save(admin,'enrollments',{studentId:'s1',programme:'Qaida',
 teacherId:'teacher1',level:'Lesson 1',status:'Active'});
assert.equal(enrolled.studentId,'s1');
assert.throws(()=>save(admin,'enrollments',{studentId:'s1',programme:'Qaida',
 teacherId:'teacher1',status:'Active'}),/already enrolled/);
const lesson={
 studentId:'s1',programme:'Qaida',date:'2026-11-10',
 lesson:'Arabic letters lesson 1',attendance:'Present',
 parentNote:'Review the teacher-approved page',teacherRemarks:'Needs attention',
 mistakes:'One letter needs more practice',requestId:'quran_request_00001'
};
const first=save(teacher,'lessons',lesson);
assert.equal(first.version,1);
assert.equal(first.teacherId,'teacher1');
const createdBefore=rows('lessons').length;
const retried=save(teacher,'lessons',lesson);
assert.equal(retried.id,first.id,'Repeated HTTP request must get same verified record');
assert.equal(rows('lessons').length,createdBefore,'Retry must never append a second lesson');
assert.throws(()=>save(teacher,'lessons',{...lesson,lesson:'Different words'}),/already used/);
assert.throws(()=>save(otherTeacher,'lessons',{...lesson,requestId:'quran_request_00002'}),/outside your assigned Quran/);
assert.throws(()=>save(teacher,'lessons',{...lesson,date:'2026-02-30',requestId:'quran_request_00003'}),/Invalid lesson date/);
assert.throws(()=>save(teacher,'lessons',{...lesson,studentId:'s2',requestId:'quran_request_00004'}),/not enrolled/);
const newVersion=save(teacher,'lessons',{...lesson,lesson:'Corrected teacher-checked lesson',requestId:'quran_request_00005'},
 {id:first.id,expectedVersion:1});
assert.equal(newVersion.version,2);
assert.equal(rows('lessons').length,1);
assert.throws(()=>save(teacher,'lessons',{...lesson,lesson:'Stale edit',requestId:'quran_request_00006'},
 {id:first.id,expectedVersion:1}),/edit conflict/);
assert.throws(()=>save(teacher,'lessons',{...lesson,studentId:'s2',requestId:'quran_request_00007'},
 {id:first.id,expectedVersion:2}),/not enrolled/);
const assessment=save(teacher,'assessments',{studentId:'s1',programme:'Qaida',
 date:'2026-11-10',skill:'Pronunciation',level:'Developing',
 parentNote:'Practice with support',requestId:'quran_request_00008'});
assert.equal(assessment.level,'Developing');
assert.throws(()=>save(teacher,'assessments',{studentId:'s1',programme:'Qaida',
 date:'2026-11-10',skill:'Pronunciation',level:'99',
 requestId:'quran_request_00009'}),/descriptive assessment level/);
const revision=save(teacher,'revisions',{studentId:'s1',programme:'Qaida',
 date:'2026-11-10',target:'Repeat the teacher-approved lesson',
 dueDate:'2026-11-11',status:'Assigned',requestId:'quran_request_00010'});
assert.equal(revision.status,'Assigned');
const studentView=dispatch(child,'quranBootstrap',{date:'2026-11-10'}).data;
assert.equal(studentView.learners,1);
assert.equal(studentView.records.lessons.length,1);
assert.equal(studentView.records.lessons[0].teacherRemarks,undefined,
 'Teacher-only remarks may never reach student or parent views');
assert.equal(studentView.records.lessons[0].mistakes,undefined);
assert.throws(()=>dispatch(child,'quranSave',{kind:'lessons',record:lesson}),/Students cannot change/);
const otherChild=dispatch(sibling,'quranBootstrap').data;
assert.equal(otherChild.records.enrollments.length,0);
assert.equal(otherChild.records.lessons.length,0);
assert.equal(dispatch(otherTeacher,'quranBootstrap').data.records.enrollments.length,0);
assert.throws(()=>dispatch({...admin,schoolId:'schoolB'},'quranBootstrap'),/ENTITLEMENT_REQUIRED/);
const schedule=save(admin,'timetable',{programme:'Qaida',teacherId:'teacher1',
 class:'Playgroup',section:'A',day:'Monday',start:'09:00',end:'09:30'});
assert.equal(schedule.day,'Monday');
assert.throws(()=>save(admin,'timetable',{programme:'Nazra',teacherId:'teacher1',
 class:'Playgroup',section:'A',day:'Monday',start:'09:15',end:'09:45'}),/conflict/);
const audit=dispatch(admin,'quranAudit').records;
assert.ok(audit.length>=6,'All successful new and corrected writes must be audited');
assert.throws(()=>dispatch(teacher,'quranAudit'),/Only School Administrator/);
assert.equal(lockHeld,false,'All Apps Script locks must be released');
assert.equal(roster.rows.length,4,'Student identities must never be duplicated or modified');
assert.equal(staff.rows.length,3,'Teacher logins must never be duplicated or modified');
schoolGrants.schoolA=false;
assert.throws(()=>dispatch(child,'quranBootstrap'),/ENTITLEMENT_REQUIRED/,
 'Super Admin revocation must block even an existing logged-in student');
console.log('PASS: grants, admin role, teacher class, student privacy, enrolment uniqueness, request replay, version CAS, timetable conflict, audit and revocation.');
