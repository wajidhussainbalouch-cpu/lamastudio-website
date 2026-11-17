(function(root){
'use strict';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const first=(object,keys)=>{for(const k of keys){const v=object?.[k];if(typeof v==='string'&&v.trim())return v.trim()}return ''};
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const dayRank=value=>{const i=days.findIndex(x=>x.toLowerCase()===String(value||'').toLowerCase());return i<0?8:i};
const natural=(x,y)=>String(x||'').localeCompare(String(y||''),undefined,{numeric:true,sensitivity:'base'});
function safeLogo(profile){
 const url=first(profile,['logo','logoUrl','schoolLogo','schoolLogoUrl','image']);
 if(/^https:\/\/[^\s"'<>]+$/i.test(url))return url;
 if(/^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(url)&&url.length<=1200000)return url;
 return '';
}
function schoolName(profile){
 return first(profile,['name','schoolName','instituteName','institute','title'])||'School name not configured';
}
const gradeOf=p=>String(p?.grade??p?.class??'').trim();
const sectionOf=p=>String(p?.section??'').trim();
const classLabel=p=>gradeOf(p)+(sectionOf(p)?' · Section '+sectionOf(p):'');
const timeLabel=p=>[String(p.start||'').trim(),String(p.end||'').trim()].filter(Boolean).join(' – ');
function sorted(records,mode){
 return [...records].sort((a,b)=>{
  if(mode==='all')return dayRank(a.day)-dayRank(b.day)||Number(a.period||0)-Number(b.period||0)||natural(classLabel(a),classLabel(b))||natural(a.start,b.start);
  return dayRank(a.day)-dayRank(b.day)||Number(a.period||0)-Number(b.period||0)||natural(a.start,b.start);
 });
}
function rowsTable(records,{combined=false}={}){
 const heads=['Day','Period','Time',...(combined?['Class']:[]),'Subject','Teacher','Room'];
 const header='<thead><tr>'+heads.map(k=>'<th scope="col">'+k+'</th>').join('')+'</tr></thead>';
 const body=records.length?sorted(records,combined?'all':'class').map(p=>'<tr>'+
  '<td>'+esc(p.day||'—')+'</td><td>'+esc(p.period??'—')+'</td><td>'+esc(timeLabel(p)||'—')+'</td>'+
  (combined?'<td>'+esc(classLabel(p)||'Unassigned')+'</td>':'')+
  '<td>'+esc(p.subject||'—')+'</td><td>'+esc(p.teacherName||'Unassigned')+'</td><td>'+esc(p.room||'—')+'</td></tr>').join(''):
  '<tr><td colspan="'+heads.length+'" class="empty-print">No timetable periods saved for this selection.</td></tr>';
 return '<table class="school-timetable"><caption class="sr-print">School weekly subject timetable</caption>'+header+'<tbody>'+body+'</tbody></table>';
}
function weeklyMatrix(records){
 const showDays=days.filter(d=>d!=='Sunday'||records.some(p=>String(p.day||'').toLowerCase()==='sunday'));
 const periods=[...new Set(records.map(r=>Number(r.period)).filter(n=>Number.isInteger(n)&&n>=1))].sort((a,b)=>a-b);
 if(!periods.length)return '<p class="empty-print">No timetable periods saved for this class.</p>';
 const thead='<thead><tr><th scope="col">Period</th>'+showDays.map(d=>'<th scope="col">'+esc(d.slice(0,3))+'</th>').join('')+'</tr></thead>';
 const tbody=periods.map(n=>{
  const cells=showDays.map(day=>{
   const current=sorted(records.filter(p=>Number(p.period)===n&&String(p.day||'').toLowerCase()===day.toLowerCase()),'class');
   if(!current.length)return '<td class="timetable-free">—</td>';
   return '<td>'+current.map(entry=>'<div class="timetable-slot"><strong>'+esc(entry.subject||'—')+'</strong>'+
    (sectionOf(entry)?'<small>Section '+esc(sectionOf(entry))+'</small>':'')+
    '<small>'+esc(timeLabel(entry)||'Time not set')+'</small>'+
    '<small>'+esc(entry.teacherName||'Unassigned')+'</small>'+
    (entry.room?'<small>'+esc(entry.room)+'</small>':'')+'</div>').join('')+'</td>';
  }).join('');
  return '<tr><th scope="row">P'+n+'</th>'+cells+'</tr>';
 }).join('');
 return '<table class="school-timetable weekly-matrix"><caption class="sr-print">Weekly subject grid by day and period</caption>'+
  thead+'<tbody>'+tbody+'</tbody></table>';
}
function printMarkup({school={},schoolFallback={},sessionName='',records=[],scope='all',selectedClass='',calendar=false,calendarMonth='',calendarContent='',calendarEvents='',calendarItems=null}={}){
 const profile={...schoolFallback,...school};
 const name=schoolName(profile);
 const logo=safeLogo(profile);
 const logoView=logo?'<img class="print-school-logo" src="'+esc(logo)+'" alt="School logo">':
  '<div class="print-school-logo print-logo-missing" aria-label="No school logo uploaded">Logo</div>';
 const head='<header class="print-letterhead"><div class="print-school-name">'+
  '<h1>'+esc(name)+'</h1><p>School Timetable & Academic Calendar</p></div>'+logoView+'</header>';
 const shownDate=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
 const baseRecords=records.filter(p=>p&&p.published!==false);
 let content='',title='',description='';
 if(scope==='selected'){
  if(!selectedClass)throw Error('Choose a class from the Class dropdown before printing a class timetable.');
  const subset=baseRecords.filter(p=>gradeOf(p).toLowerCase()===String(selectedClass).trim().toLowerCase());
  title='Class '+selectedClass+' — Weekly Timetable';
  description='One selected class';
  content='<section class="print-class-block"><h3>'+esc(title)+'</h3>'+weeklyMatrix(subset)+'</section>';
 }else if(scope==='by-class'){
  const labels=[...new Set(baseRecords.map(classLabel).filter(Boolean))].sort(natural);
  title='Class-wise Weekly Timetables';
  description=labels.length+' classes / sections';
 }else if(scope==='all'){
  title='All Classes — Weekly Timetable';
  description=baseRecords.length+' saved period'+(baseRecords.length===1?'':'s');
  content='<section class="print-class-block"><h3>'+title+'</h3>'+rowsTable(baseRecords,{combined:true})+'</section>';
 }else throw Error('Unrecognized timetable print option.');
 let calendarSection='';
 if(calendar){
  // Print from event data, not on-screen editable admin row markup.
  // This prevents Edit/Delete controls leaking into the PDF.
  const printableEvents=Array.isArray(calendarItems)?
   (calendarItems.length?calendarItems.map(event=>
    '<div><strong>'+esc(event.type||'Event')+'</strong> · '+esc(event.title||'Untitled')+
    ' · '+esc(event.start||'')+' – '+esc(event.end||'')+
    (event.description?' · '+esc(event.description):'')+'</div>').join(''):
    '<p>No events for this session.</p>'):
   calendarEvents;
  calendarSection='<section class="print-calendar-block"><h3>Academic Calendar'+(calendarMonth?' — '+esc(calendarMonth):'')+'</h3>'+
   '<div class="print-calendar-grid">'+calendarContent+'</div>'+
   '<h4>Events and holidays</h4><div class="print-events">'+printableEvents+'</div></section>';
 }
 const meta='<div class="print-meta"><span>Academic session: <b>'+esc(sessionName||'Not selected')+
  '</b></span><span>'+esc(description)+'</span><span>Printed '+esc(shownDate)+'</span></div>';
 const footer='<footer class="print-timetable-footer">Generated by LAMA School Suite · LamaStudio.pk</footer>';
 if(scope==='by-class'){
  const labels=[...new Set(baseRecords.map(classLabel).filter(Boolean))].sort(natural);
  if(!labels.length)return head+meta+'<p class="empty-print">No saved timetable periods for this session.</p>'+calendarSection+footer;
  // Each class gets a complete school letterhead; a page break never
  // leaves the school name or logo behind on the preceding class sheet.
  const pages=labels.map(label=>{
   const subset=baseRecords.filter(p=>classLabel(p)===label);
   const classMeta='<div class="print-meta"><span>Academic session: <b>'+esc(sessionName||'Not selected')+
    '</b></span><span>Class '+esc(label)+'</span><span>Printed '+esc(shownDate)+'</span></div>';
   const table='<section class="print-class-block"><h3>Class '+esc(label)+' — Weekly Timetable</h3>'+weeklyMatrix(subset)+'</section>';
   return '<article class="print-class-page">'+head+classMeta+table+footer+'</article>';
  }).join('');
  return pages+calendarSection;
 }
 return head+meta+content+calendarSection+footer;
}
root.LamaTimetablePrint={safeLogo,schoolName,gradeOf,classLabel,timeLabel,sorted,rowsTable,weeklyMatrix,printMarkup};
})(typeof window!=='undefined'?window:globalThis);
