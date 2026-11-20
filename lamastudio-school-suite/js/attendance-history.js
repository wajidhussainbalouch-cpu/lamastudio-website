/* LAMA School Suite — read-only attendance history helpers.
 * Uses existing school-scoped Attendance data. Never writes or treats missing rows as absences.
 */
(function(root){
 'use strict';
 const str=v=>String(v??'').trim();
 const personId=s=>str(s.id??s._id??s.studentId);
 const enrollment=s=>str(s.enrlNo??s.enrollmentNo??s.enrollment);
 const normalize=v=>{const x=str(v).toLowerCase();return x==='p'||x==='present'?'Present':x==='a'||x==='absent'?'Absent':x==='l'||x==='leave'?'Leave':''};
 function dateKey(value,zone='Asia/Karachi'){
  const v=str(value);
  if(/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(v)){
   const d=new Date(v);
   if(!Number.isNaN(d.getTime())){
    try{
     const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
     const get=k=>parts.find(p=>p.type===k)?.value||'';
     if(get('year')&&get('month')&&get('day'))return get('year')+'-'+get('month')+'-'+get('day');
    }catch(error){console.warn('Attendance history timezone not valid',error)}
   }
   return '';
  }
  if(/^\d{4}-\d{2}-\d{2}/.test(v))return v.slice(0,10);
  const match=v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return match?match[3]+'-'+match[2].padStart(2,'0')+'-'+match[1].padStart(2,'0'):'';
 }
 function previousDays(anchor,amount,isClosed){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(anchor))return [];
  const d=new Date(anchor+'T12:00:00Z'),result=[];
  if(Number.isNaN(d.getTime()))return result;
  for(let i=0;i<370&&result.length<amount;i++){
   d.setUTCDate(d.getUTCDate()-1);
   const date=d.toISOString().slice(0,10);if(isClosed?!isClosed(date):d.getUTCDay()!==0)result.push(date);
  }
  return result;
 }
 function make(students,records,parseDate,isClosed){
  const byId=new Map(),byEnrollment=new Map(),byStudentDate=new Map(),registeredDays=new Map();
  for(const student of students||[]){
   const k=personId(student),e=enrollment(student);
   if(k)byId.set(k,student);
   if(e&&!byEnrollment.has(e))byEnrollment.set(e,student);
  }
  for(const row of records||[]){
   const rid=str(row.studentId??row.student_id??row.studentID),re=str(row.enrlNo??row.enrollmentNo??row.enrollment);
   const student=(rid&&byId.get(rid))||(re&&byEnrollment.get(re));
   if(!student)continue;
   const date=(parseDate||dateKey)(row.date),value=normalize(row.status);
   if(!date||!value)continue;
   const key=personId(student)||enrollment(student);
   if(!key)continue;
   byStudentDate.set(key+'|'+date,value);
   const klass=str(student.class??student.grade??student.className);
   if(!registeredDays.has(klass))registeredDays.set(klass,new Set());
   registeredDays.get(klass).add(date);
  }
  function get(student,date){return byStudentDate.get((personId(student)||enrollment(student))+'|'+date)||''}
  function recent(student,anchor,amount=7){
   return previousDays(anchor,amount,isClosed).map(date=>({date,status:get(student,date),label:date.slice(5)}));
  }
  function absenceInfo(student,anchor){
   const days=recent(student,anchor,7);
   // Skip dates with no saved class register; never infer absent from missing marks.
   let streak=0,checked=0;
   for(const date of previousDays(anchor,18,isClosed)){
    if(!classDayRegistered(student,date))continue;
    checked++;
    if(get(student,date)==='Absent')streak++;
    else break;
    if(checked>=7)break;
   }
   const absentDays=days.filter(day=>day.status==='Absent').length;
   return {days,streak,absentDays,weekAlert:streak>=5};
  }
  function classDayRegistered(student,date){
   return !!registeredDays.get(str(student.class??student.grade??student.className))?.has(date);
  }
  return {get,recent,absenceInfo,classDayRegistered};
 }
 root.LamaAttendanceHistory={make,dateKey,previousDays,normalize};
})(window);
