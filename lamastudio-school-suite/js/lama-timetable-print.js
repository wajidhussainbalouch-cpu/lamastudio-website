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

/* Printable master matrix: weekdays/periods down the page, classes across.
 * Split large selections into six-class panels to avoid microscopic A4 text.
 * Only published periods are printable, and all text is escaped.
 */
function masterGrid(records,selectedClasses=null,{maxClasses=6}={}){
 const published=(Array.isArray(records)?records:[]).filter(p=>p&&p.published!==false);
 const all=[...new Set(published.map(classLabel).filter(Boolean))].sort(natural);
 const selection=Array.isArray(selectedClasses)?[...new Set(selectedClasses.map(v=>String(v).trim()).filter(Boolean))]:all;
 if(!selection.length)return '<p class="empty-print">No classes selected for this timetable.</p>';
 const labels=selection;
 if(!labels.length)return '<p class="empty-print">No classes selected.</p>';
 const included=published.filter(p=>labels.some(x=>x.toLowerCase()===classLabel(p).toLowerCase()));
 const showDays=days.filter(d=>d!=='Sunday'||included.some(p=>String(p.day).toLowerCase()==='sunday'));
 const max=Math.max(1,Math.min(10,Number(maxClasses)||6));
 const panels=[];
 for(let start=0;start<labels.length;start+=max){
  const group=labels.slice(start,start+max);
  const dayBlocks=showDays.map(day=>{
   const today=included.filter(p=>String(p.day||'').toLowerCase()===day.toLowerCase()&&group.some(v=>v.toLowerCase()===classLabel(p).toLowerCase()));
   const nums=[...new Set(today.map(p=>Number(p.period)).filter(n=>Number.isInteger(n)&&n>=1))].sort((a,b)=>a-b);
   if(!nums.length)return '<section class="master-day-block"><h4>'+esc(day)+'</h4><p class="master-empty">No saved lessons on '+esc(day)+'.</p></section>';
   const headers='<thead><tr><th scope="col" class="master-number">Period</th><th scope="col" class="master-time">Time</th>'+group.map(c=>'<th scope="col">'+esc(c)+'</th>').join('')+'</tr></thead>';
   const rows=nums.map(n=>{
    const matching=today.filter(p=>Number(p.period)===n);
    const times=[...new Set(matching.map(timeLabel).filter(Boolean))];
    const time=times.length?times.map(x=>'<div class="master-time-item">'+esc(x)+'</div>').join(''):'—';
    const cells=group.map(c=>{
     const entries=sorted(matching.filter(p=>classLabel(p).toLowerCase()===c.toLowerCase()),'class');
     if(!entries.length)return '<td class="master-empty">—</td>';
     return '<td>'+entries.map(p=>'<div class="master-lesson"><strong>'+esc(p.subject||'—')+'</strong>'+(p.teacherName?'<small>'+esc(p.teacherName)+'</small>':'')+(p.room?'<small>Room '+esc(p.room)+'</small>':'')+'</div>').join('')+'</td>';
    }).join('');
    return '<tr><th scope="row">P'+n+'</th><td class="master-time-cell">'+time+'</td>'+cells+'</tr>';
   }).join('');
   return '<section class="master-day-block"><h4>'+esc(day)+'</h4><table class="school-timetable master-matrix"><caption class="sr-print">'+esc(day)+' timetable: '+group.map(esc).join(', ')+'</caption>'+headers+'<tbody>'+rows+'</tbody></table></section>';
  }).join('');
  panels.push('<article class="master-class-panel"><div class="master-panel-title">Classes: '+group.map(esc).join(' · ')+'</div>'+dayBlocks+'</article>');
 }
 return '<div class="master-timetable">'+panels.join('')+'</div>';
}
function printMarkup({school={},schoolFallback={},sessionName='',records=[],scope='all',selectedClass='',selectedClasses=null,calendar=false,calendarMonth='',calendarContent='',calendarEvents='',calendarItems=null}={}){
 const profile={...schoolFallback,...school};
 const name=schoolName(profile);
 const logo=safeLogo(profile);
 const logoView=logo?'<img class="print-school-logo" src="'+esc(logo)+'" alt="School logo">':
  '<div class="print-school-logo print-logo-missing" aria-label="No school logo uploaded">Logo</div>';
 const head='<header class="print-letterhead"><div class="print-school-name">'+
  '<h1>'+esc(name)+'</h1><p>School Timetable & Academic Calendar</p></div>'+logoView+'</header>';
 const shownDate=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
 const baseRecords=records.filter(p=>p&&p.published!==false);
 const availableLabels=[...new Set(baseRecords.map(classLabel).filter(Boolean))].sort(natural);
 const requestedClasses=Array.isArray(selectedClasses)?[...new Set(selectedClasses.map(x=>String(x).trim()).filter(Boolean))]:availableLabels;
 if(scope!=='selected'&&Array.isArray(selectedClasses)&&requestedClasses.length===0)throw Error('Select at least one class to print.');
 const filteredBase=baseRecords.filter(p=>requestedClasses.some(c=>c.toLowerCase()===classLabel(p).toLowerCase()));
 let content='',title='',description='';
 if(scope==='selected'){
  if(!selectedClass)throw Error('Choose a class from the Class dropdown before printing a class timetable.');
  const requested=String(selectedClass).trim().toLowerCase();
  const subset=baseRecords.filter(p=>classLabel(p).toLowerCase()===requested||(!requested.includes('· section ')&&gradeOf(p).toLowerCase()===requested));
  title='Class '+selectedClass+' — Weekly Timetable';
  description='One selected class';
  content='<section class="print-class-block"><h3>'+esc(title)+'</h3>'+weeklyMatrix(subset)+'</section>';
 }else if(scope==='by-class'){
  const labels=[...new Set(filteredBase.map(classLabel).filter(Boolean))].sort(natural);
  title='Class-wise Weekly Timetables';
  description=labels.length+' classes / sections';
 }else if(scope==='all'){
  title='All Classes — Weekly Timetable';
  description=filteredBase.length+' saved period'+(filteredBase.length===1?'':'s')+' · '+requestedClasses.length+' selected class(es)';
  content='<section class="print-class-block"><h3>'+title+'</h3>'+masterGrid(filteredBase,requestedClasses)+'</section>';
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
   const subset=filteredBase.filter(p=>classLabel(p)===label);
   const classMeta='<div class="print-meta"><span>Academic session: <b>'+esc(sessionName||'Not selected')+
    '</b></span><span>Class '+esc(label)+'</span><span>Printed '+esc(shownDate)+'</span></div>';
   const table='<section class="print-class-block"><h3>Class '+esc(label)+' — Weekly Timetable</h3>'+weeklyMatrix(subset)+'</section>';
   return '<article class="print-class-page">'+head+classMeta+table+footer+'</article>';
  }).join('');
  return pages+calendarSection;
 }
 return head+meta+content+calendarSection+footer;
}
root.LamaTimetablePrint={safeLogo,schoolName,gradeOf,classLabel,timeLabel,sorted,rowsTable,weeklyMatrix,masterGrid,printMarkup};
})(typeof window!=='undefined'?window:globalThis);
