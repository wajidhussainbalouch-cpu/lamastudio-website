/* Shared student view of the school-scoped saved homework register. */
(function(root){
'use strict';
const str=v=>String(v??'').trim(),norm=v=>str(v).toLowerCase(),cls=v=>norm(v).replace(/^(grade|class|standard|std)[\s._-]*/i,'').replace(/^0+(?=\d)/,'').replace(/\s+/g,'');
function day(v){
 const s=str(v);if(/^\d{4}-\d{2}-\d{2}$/.test(s)){const d=new Date(s+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s?s:''}
 const m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(m)return day(m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0'));
 if(!/^\d{4}-\d{2}-\d{2}T/.test(s))return '';const d=new Date(s);if(!Number.isFinite(+d))return '';
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).map(p=>[p.type,p.value]));return parts.year+'-'+parts.month+'-'+parts.day;
}
function saved(r){
 const status=norm(r.status);
 if(!str(r.id)||norm(r.isPublished)==='false'||norm(r.published)==='false'||['draft','archived','rejected','deleted','cancelled','pending approval'].includes(status))return false;
 // Homework sheet and teacherHomeworkBatch use persisted records without publication flags.
 return !status||['published','posted','saved','sent','completed','pending'].includes(status)||norm(r.isPublished)==='true'||norm(r.published)==='true'||norm(r.visibility)==='public';
}
function select(rows,student,schoolId){
 if(!Array.isArray(rows))throw Error('Unexpected homework response.');
 const grade=cls(student?.class),section=cls(student?.section);if(!grade)throw Error('Student class is not configured.');
 const ids=new Set(),out=[];
 for(const r of rows){
  if(!r||!saved(r)||(str(r.schoolId)&&str(r.schoolId)!==str(schoolId)))continue;
  if(cls(r.class)!==grade||(str(r.section)&&cls(r.section)!==section))continue;
  const id=str(r.id);if(ids.has(id))continue;ids.add(id);
  out.push({...r,id,postingDay:day(r.createdAt),dueDay:day(r.dueDate),completed:norm(r.status)==='completed'});
 }
 return out.sort((a,b)=>b.postingDay.localeCompare(a.postingDay)||str(a.subject).localeCompare(str(b.subject))||a.id.localeCompare(b.id));
}
function title(r){const t=str(r.title),s=str(r.subject);return t&&norm(t)!==norm(s+' Homework')?t:''}
function today(){return day(new Date().toISOString())}
root.LamaStudentHomework={select,title,today,day};
})(typeof window!=='undefined'?window:globalThis);
