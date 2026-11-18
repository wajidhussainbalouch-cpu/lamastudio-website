/* Teacher daily snapshot. Read-only counts; saved records, never button drafts. */
(function(root){
 'use strict';
 const val=x=>String(x??'').trim();
 const norm=x=>val(x).toLocaleLowerCase();
 const lower=x=>norm(x).replace(/\s+/g,' ');
 const dateKey=(value,zone='Asia/Karachi')=>{
  const v=val(value);
  if(!v)return '';
  if(/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(v)){
   const d=new Date(v);if(Number.isNaN(d.getTime()))return '';
   try{const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
    const get=k=>parts.find(p=>p.type===k)?.value||'';
    if(get('year'))return get('year')+'-'+get('month')+'-'+get('day');
   }catch(e){return ''}
  }
  if(/^\d{4}-\d{2}-\d{2}/.test(v))return v.slice(0,10);
  const match=v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return match?match[3]+'-'+match[2].padStart(2,'0')+'-'+match[1].padStart(2,'0'):'';
 };
 function gender(s){
  const g=lower(s.gender??s.sex);
  return ['m','male','boy','boys'].includes(g)?'boys':['f','female','girl','girls'].includes(g)?'girls':'unknown';
 }
 function attendance(students,model,day,ready){
  const groups={total:{total:0,present:0,absent:0,leave:0,unmarked:0},boys:{total:0,present:0,absent:0,leave:0,unmarked:0},girls:{total:0,present:0,absent:0,leave:0,unmarked:0},unknown:{total:0,present:0,absent:0,leave:0,unmarked:0}};
  if(!ready||!model)return {ready:false,day,groups,complete:false,marked:0};
  for(const s of students||[]){
   const g=gender(s),st=model.get(s,day);
   const key=st==='Present'?'present':st==='Absent'?'absent':st==='Leave'?'leave':'unmarked';
   for(const group of [groups.total,groups[g]]){group.total++;group[key]++}
  }
  const t=groups.total;
  return {ready:true,day,groups,marked:t.present+t.absent+t.leave,complete:t.total>0&&t.unmarked===0};
 }
 function subjectKey(x){
  const n=lower(x);
  if(['math','maths','mathematics'].includes(n))return 'mathematics';
  if(['islamiyat','islamiat','islamic studies'].includes(n))return 'islamiat';
  if(['social studies','social studies (sst)','sst'].includes(n))return 'social studies';
  if(['nazra quran','nazra-e-quran','nazra','quran reading'].includes(n))return 'nazra quran';
  if(['general knowledge','gk'].includes(n))return 'general knowledge';
  if(n==='english language')return 'english';
  if(n==='urdu language')return 'urdu';
  return n;
 }
 function namesFromSubjectsJson(students){
  const collected=[];
  for(const s of students||[]){
   let data=s.subjects??s.subjectsJson;
   if(typeof data==='string'){try{data=JSON.parse(data)}catch(_){data=null}}
   if(Array.isArray(data)){for(const x of data){const subject=typeof x==='string'?x:x?.subject??x?.name??'';if(subject)collected.push(subject)}}
   else if(data&&typeof data==='object'){
    for(const [key,value] of Object.entries(data)){
     if(/^(?:total|percentage|position|result|remarks|average|marks|grade|class|section|status|attendance|\d+)$/i.test(key))continue;
     if(typeof value==='object'&&value&&value.subject)collected.push(value.subject);
     else if(value!==null&&value!=='')collected.push(key);
    }
   }
  }
  return collected;
 }
 function subjects(students,homework,assignedSubject,custom){
  const seen=new Set(),out=[];
  function add(x){
   const text=val(x);
   if(!text||text.length>50||/^\d+$/.test(text))return;
   const key=subjectKey(text);if(!seen.has(key)){seen.add(key);out.push(text)}
  }
  for(const s of custom||[])add(s);
  if(out.length)return out;
  for(const x of namesFromSubjectsJson(students))add(x);
  for(const h of homework||[])add(h.subject);
  if(assignedSubject)add(assignedSubject);
  return out;
 }
 function homeworkStatus(records,subjects,day,loaded,zone='Asia/Karachi'){
  const values=(subjects||[]).map(subject=>{
   const selected=(records||[]).filter(h=>
    subjectKey(h.subject)===subjectKey(subject)&&dateKey(h.createdAt??h.date,zone)===day);
   const posted=selected.some(h=>{
    const stage=norm(h.status),explicitNo=h.isPublished===false||h.published===false||['draft','pending','archived','rejected'].includes(stage);
    const confirmed=h.isPublished===true||h.published===true||['published','sent'].includes(stage);
    return confirmed||(!explicitNo&&!stage&&!!h.id); // Legacy saved Homework rows have no publication columns.
   });
   // Legacy Homework rows contain no publication status. A dated, saved row is proof of entry.
   return {subject,done:posted,record:posted?selected.find(h=>h.id):null};
  });
  return {ready:!!loaded,items:values,done:loaded?values.filter(v=>v.done).length:0,total:values.length};
 }
 root.LamaTeacherDaily={gender,attendance,dateKey,subjects,subjectKey,homeworkStatus};
})(window);
