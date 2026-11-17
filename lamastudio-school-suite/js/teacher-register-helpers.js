(function(root){
'use strict';
const str=value=>String(value??'').trim();
const norm=value=>str(value).toLowerCase();
function day(value){
 const localDate=x=>[x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-');
 if(value instanceof Date&&!Number.isNaN(value.valueOf()))return localDate(value);
 const raw=str(value);
 if(/^\d{4}-\d{2}-\d{2}$/.test(raw))return raw;
 if(/^\d{4}-\d{2}-\d{2}[T\s]/.test(raw)){
  const parsed=new Date(raw);
  if(!Number.isNaN(parsed.valueOf()))return localDate(parsed);
  return raw.slice(0,10);
 }
 return '';
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
   // Legacy Homework rows persist without status/isPublished columns. A saved
   // record with no publication flags represents a posted homework entry.
   const explicitlyDraft=state==='draft'||state==='unpublished'||entry.isPublished===false||entry.published===false;
   const published=!explicitlyDraft&&(entry.isPublished===true||entry.published===true||state==='published'||state==='sent'||(!state&&entry.isPublished===undefined&&entry.published===undefined));
   return norm(entry.subject)===key&&published&&day(entry.createdAt||entry.postedAt)===selectedDay;
  });
  return {name,done};
 });
 return list;
}
/**
 * School calendar: only published "Holiday" events close dates.
 * Saturday stays a working day unless explicitly configured otherwise.
 * The user-requested Iqbal Day (9 November) is a dated observance,
 * never an attendance record; existing saved marks always take precedence.
 */
function calendarHolidays(resources){
 const events=[];
 for(const row of resources||[]){
  if(row?.category!=='planning-event')continue;
  let event;
  try{event=typeof row.description==='string'?JSON.parse(row.description):row.description}catch(_){continue}
  if(!event||typeof event!=='object'||event.published===false||norm(event.type)!=='holiday')continue;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(str(event.start))||!/^\d{4}-\d{2}-\d{2}$/.test(str(event.end)))continue;
  if(event.end<event.start)continue;
  events.push({start:event.start,end:event.end,title:str(event.title)||'School holiday'});
 }
 return events;
}
function calendarHoliday(date,events=[],weeklyOff=[0]){
 const iso=str(date);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))return '';
 const match=events.find(event=>event.start<=iso&&event.end>=iso);
 if(match)return match.title||'School holiday';
 // This national observance does not erase or replace saved school records.
 if(iso.slice(5)==='11-09')return 'Iqbal Day · 9 November';
 const d=new Date(iso+'T12:00:00');
 if(Number.isNaN(d.getTime()))return '';
 const day=d.getDay();
 if(weeklyOff.includes(day))return day===0?'Sunday · Weekly holiday':day===6?'Saturday · School closed':'Weekly holiday';
 return '';
}
function calendarDayState(date,{students=[],records=[],today,verified=false,calendarReady=false,holidays=[],weeklyOff=[0]}={}){
 const holiday=calendarHoliday(date,holidays,weeklyOff);
 if(date>today)return {state:'future',marked:0,total:students.length,holiday};
 if(!verified)return {state:'unavailable',marked:0,total:students.length,holiday};
 const snap=snapshot(records,students,date),marked=snap.unique.size,review=snap.duplicates.size+snap.unmatched.length;
 const total=students.length;
 if(marked===total&&total>0&&review===0)return {state:'marked',marked,total,holiday};
 if(marked>0||review>0)return {state:'partial',marked,total,holiday,review};
 if(holiday)return {state:'holiday',marked:0,total,holiday};
 if(!calendarReady)return {state:'unavailable',marked:0,total,holiday};
 return {state:total?'unmarked':'unavailable',marked:0,total,holiday};
}
function monthDays(yyyyMm){
 if(!/^\d{4}-\d{2}$/.test(str(yyyyMm)))return [];
 const [year,month]=yyyyMm.split('-').map(Number);
 if(month<1||month>12||year<2000||year>2100)return [];
 const count=new Date(year,month,0).getDate(),days=[];
 for(let n=1;n<=count;n++){
  const iso=yyyyMm+'-'+String(n).padStart(2,'0');
  days.push({date:iso,day:n,weekday:new Date(iso+'T12:00:00').getDay()});
 }
 return days;
}

root.LamaTeacherRegister={day,gender,guardian,rosterId,enrollment,countGender,snapshot,totals,subjectNames,homeworkChecklist,calendarHolidays,calendarHoliday,calendarDayState,monthDays};
})(typeof window!=='undefined'?window:globalThis);
