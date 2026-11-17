(function(root){
'use strict';
const str=value=>String(value??'').trim();
const norm=value=>str(value).toLowerCase();
function day(value){
 if(value instanceof Date&&!Number.isNaN(value.valueOf()))
  return [value.getFullYear(),String(value.getMonth()+1).padStart(2,'0'),String(value.getDate()).padStart(2,'0')].join('-');
 const valueString=str(value);
 const m=valueString.match(/^(\d{4}-\d{2}-\d{2})(?:$|[T\s])/);
 return m?m[1]:'';
}
function gender(student){
 const text=norm(student?.gender??student?.sex);
 return ['male','m','boy','boys'].includes(text)?'boy':['female','f','girl','girls'].includes(text)?'girl':'unspecified';
}
function guardian(student){
 return str(student?.fatherGuardian||student?.fatherName||student?.father||student?.guardianName||student?.guardian||student?.parentName)||'Not recorded';
}
function rosterId(student){return str(student?.id??student?._id??student?.studentId)}
function enrollment(student){return str(student?.enrlNo??student?.enrollmentNo??student?.enrollment)}
function countGender(students){
 const result={boys:0,girls:0,unspecified:0};
 for(const student of students){
  const kind=gender(student);
  if(kind==='boy')result.boys++;else if(kind==='girl')result.girls++;else result.unspecified++;
 }
 return result;
}
function snapshot(records,students,selectedDay){
 const index=new Map(),byEnrollment=new Map(),grouped=new Map(),unmatched=[];
 for(const student of students){
  const id=rosterId(student),en=enrollment(student);
  if(id)index.set(id,index.has(id)?null:student);
  if(en)byEnrollment.set(en,byEnrollment.has(en)?null:student);
 }
 for(const row of records){
  if(day(row.date)!==selectedDay)continue;
  const id=str(row.studentId??row.studentID??row.student_id);
  const en=str(row.enrlNo??row.enrollmentNo);
  // Unknown explicit IDs are never silently reattached using an enrollment.
  const student=id?index.get(id):en?byEnrollment.get(en):null;
  if(!student){unmatched.push(row);continue}
  const key=rosterId(student);
  if(!key){unmatched.push(row);continue}
  if(!grouped.has(key))grouped.set(key,[]);
  grouped.get(key).push(row);
 }
 const unique=new Map(),duplicates=new Map();
 for(const [key,rows] of grouped){
  if(rows.length!==1){duplicates.set(key,rows);continue}
  const status=norm(rows[0].status);
  const canonical=status==='present'||status==='p'?'Present':status==='absent'||status==='a'?'Absent':status==='leave'||status==='l'?'Leave':'';
  if(!canonical){duplicates.set(key,rows);continue}
  unique.set(key,{status:canonical,record:rows[0]});
 }
 return {unique,duplicates,unmatched};
}
function totals(students,saved,drafts){
 const items={Students:students,Present:[],Absent:[],Leave:[],Unmarked:[],Review:[]};
 for(const student of students){
  const id=rosterId(student);
  if(saved.duplicates.has(id)){items.Review.push(student);continue}
  const status=drafts?.get(id)||saved.unique.get(id)?.status||'';
  if(items[status])items[status].push(student);else items.Unmarked.push(student);
 }
 return Object.fromEntries(Object.entries(items).map(([key,group])=>[key,{total:group.length,...countGender(group)}]));
}
function subjectNames(value){
 const found=[];
 const consume=value=>{
  if(!value)return;
  if(Array.isArray(value)){value.forEach(consume);return}
  if(typeof value==='object'){
   if(value.name||value.subject||value.subjectName){consume(value.name||value.subject||value.subjectName);return}
   for(const [key,item] of Object.entries(value))if(item===true||item==='true')consume(key);
   return;
  }
  if(typeof value==='string'){
   const trimmed=value.trim();
   if((trimmed.startsWith('[')||trimmed.startsWith('{'))){
    try{consume(JSON.parse(trimmed));return}catch(_){}
   }
   trimmed.split(/[,;\n]/).forEach(x=>{const n=x.trim();if(n&&n.length<=70)found.push(n)});
  }
 };
 consume(value);
 return found;
}
function homeworkChecklist(students,homeworks,teacher,selectedDay){
 const subjects=new Map();
 const add=name=>{
  const v=str(name),key=norm(v);
  if(v&&v.length<=70&&!subjects.has(key))subjects.set(key,v);
 };
 subjectNames(teacher?.subject).forEach(add);
 for(const student of students){
  for(const value of [student.subjects,student.subjectsJson,student.subjectNames,student.subjectList])subjectNames(value).forEach(add);
 }
 for(const entry of homeworks)subjectNames(entry.subject).forEach(add);
 const list=[...subjects.entries()].slice(0,40).map(([key,name])=>{
  const done=homeworks.some(entry=>{
   const state=norm(entry.status);
   const published=entry.isPublished===true||entry.published===true||state==='published'||state==='sent';
   return norm(entry.subject)===key&&published&&day(entry.createdAt||entry.postedAt)===selectedDay;
  });
  return {name,done};
 });
 return list;
}
root.LamaTeacherRegister={day,gender,guardian,rosterId,enrollment,countGender,snapshot,totals,subjectNames,homeworkChecklist};
})(typeof window!=='undefined'?window:globalThis);
