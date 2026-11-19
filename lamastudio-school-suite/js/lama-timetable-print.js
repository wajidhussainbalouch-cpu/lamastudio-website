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
const classKey=label=>{
 const v=String(label??'').trim(),m=v.match(/^(.*?)\s*·\s*Section\s+(.+)$/i);
 const g=String(m?m[1]:v).toLowerCase().replace(/^(?:class|grade|standard|std)[\s._-]*/,'').replace(/^0+(?=\d)/,'').replace(/\s+/g,'');
 return g+(m?'|'+String(m[2]).toLowerCase().replace(/\s+/g,''):'');
};
const sameClass=(a,b)=>classKey(a)===classKey(b);
const timeLabel=p=>[String(p.start||'').trim(),String(p.end||'').trim()].filter(Boolean).join(' – ');
function sorted(records,mode){
 return [...records].sort((a,b)=>{
  if(mode==='all')return dayRank(a.day)-dayRank(b.day)||Number(a.period||0)-Number(b.period||0)||root.LamaClassOrder.compare(classLabel(a),classLabel(b))||natural(a.start,b.start);
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

/* Compact school-wide landscape matrix: classes as rows, periods as columns.
 * Identical lessons across weekdays are grouped, with day labels and exact
 * times retained when the timetable varies. No arbitrary six-class page split.
 */
function masterGrid(records,selectedClasses=null,{printDay=''}={}){
 const published=(Array.isArray(records)?records:[]).filter(p=>p&&p.published!==false);
 const all=[...new Map(published.map(p=>[classKey(classLabel(p)),classLabel(p)])).values()].sort(root.LamaClassOrder.compare);
 const labels=Array.isArray(selectedClasses)?[...new Map(selectedClasses.map(v=>[classKey(v),String(v).trim()])).values()].filter(Boolean):all;
 if(!labels.length)return '<p class="empty-print">No classes selected for this timetable.</p>';
 const included=published.filter(p=>labels.some(x=>sameClass(x,classLabel(p)))&&(!printDay||dayRank(p.day)===dayRank(printDay)));
 const nums=[...new Set(included.map(p=>Number(p.period)).filter(n=>Number.isInteger(n)&&n>=1))].sort((a,b)=>a-b);
 if(!nums.length)return '<p class="empty-print">No published lessons for this selection.</p>';
 const heads=nums.map(n=>{
  const times=[...new Set(included.filter(p=>Number(p.period)===n).map(timeLabel).filter(Boolean))];
  return '<th scope="col">P'+n+(times.length===1?'<small>'+esc(times[0])+'</small>':'')+'</th>';
 }).join('');
 const body=labels.map(label=>{
  return '<tr><th scope="row">'+esc(label)+'</th>'+nums.map(n=>{
   const matches=sorted(included.filter(p=>sameClass(classLabel(p),label)&&Number(p.period)===n),'class');
   if(!matches.length)return '<td class="master-empty">—</td>';
   const times=[...new Set(included.filter(p=>Number(p.period)===n).map(timeLabel).filter(Boolean))];
   const groups=new Map();
   for(const p of matches){const key=JSON.stringify([p.subject,p.teacherName,p.room,timeLabel(p)]);if(!groups.has(key))groups.set(key,{p,days:new Set()});groups.get(key).days.add(p.day);}
   return '<td>'+[...groups.values()].map(({p,days:ds})=>'<div class="master-lesson">'+(!printDay?'<small class="lesson-days">'+[...ds].sort((a,b)=>dayRank(a)-dayRank(b)).map(d=>esc(String(d).slice(0,3))).join(', ')+'</small>':'')+'<strong>'+esc(p.subject||'—')+'</strong>'+(p.teacherName?'<small>'+esc(p.teacherName)+'</small>':'')+(times.length!==1&&timeLabel(p)?'<small>'+esc(timeLabel(p))+'</small>':'')+(p.room?'<small>'+esc(p.room)+'</small>':'')+'</div>').join('')+'</td>';
  }).join('')+'</tr>';
 }).join('');
 return '<table class="school-timetable compact-master"><caption class="sr-print">Master timetable for all selected classes</caption><thead><tr><th scope="col">Class / Section</th>'+heads+'</tr></thead><tbody>'+body+'</tbody></table>';
}
function printMarkup({school={},schoolFallback={},sessionName='',records=[],scope='all',selectedClass='',selectedClasses=null,printDay='',calendar=false,calendarMonth='',calendarContent='',calendarEvents='',calendarItems=null,timing=null}={}){
 const profile={...schoolFallback,...school};
 const name=schoolName(profile);
 const logo=safeLogo(profile);
 const logoView=logo?'<img class="print-school-logo" src="'+esc(logo)+'" alt="School logo">':
  '<div class="print-school-logo print-logo-missing" aria-label="No school logo uploaded">Logo</div>';
 const head='<header class="print-letterhead"><div class="print-school-name">'+
  '<h1>'+esc(name)+'</h1><p>School Timetable & Academic Calendar</p></div>'+logoView+'</header>';
 const shownDate=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
 const baseRecords=records.filter(p=>p&&p.published!==false);
 const availableLabels=[...new Set(baseRecords.map(classLabel).filter(Boolean))].sort(root.LamaClassOrder.compare);
 const requestedClasses=Array.isArray(selectedClasses)?[...new Set(selectedClasses.map(x=>String(x).trim()).filter(Boolean))]:availableLabels;
 if(scope!=='selected'&&Array.isArray(selectedClasses)&&requestedClasses.length===0)throw Error('Select at least one class to print.');
 const filteredBase=baseRecords.filter(p=>requestedClasses.some(c=>sameClass(c,classLabel(p))));
 let content='',title='',description='';
 if(scope==='selected'){
  if(!selectedClass)throw Error('Choose a class from the Class dropdown before printing a class timetable.');
  const requested=String(selectedClass).trim().toLowerCase();
  const subset=baseRecords.filter(p=>sameClass(classLabel(p),requested)||(!requested.includes('· section ')&&gradeOf(p).toLowerCase()===requested));
  title='Class '+selectedClass+' — Weekly Timetable';
  description='One selected class';
  content='<section class="print-class-block"><h3>'+esc(title)+'</h3>'+weeklyMatrix(subset)+'</section>';
 }else if(scope==='by-class'){
  const labels=[...new Set(filteredBase.map(classLabel).filter(Boolean))].sort(root.LamaClassOrder.compare);
  title='Class-wise Weekly Timetables';
  description=labels.length+' classes / sections';
 }else if(scope==='all'){
  title='All Classes — Weekly Timetable';
  description=(printDay?'Day: '+printDay:'Full week')+' · '+requestedClasses.length+' selected class(es)';
  content='<section class="print-class-block"><h3>'+title+'</h3>'+masterGrid(filteredBase,requestedClasses,{printDay})+'</section>';
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
 const timingBlock=timing&&Array.isArray(timing.lines)?'<section class="print-school-timing" style="font-size:8pt;line-height:1.35;border:1px solid #bcd0d5;padding:2mm;margin:2mm 0;break-inside:avoid;color:#153b45"><strong>'+esc(timing.title||'School timings')+' · '+esc(timing.dates||'')+'</strong><div>'+timing.lines.map(esc).join(' &nbsp; | &nbsp; ')+'</div><div><strong>'+esc(timing.breakTime||'')+'</strong></div></section>':'';
 const footer='<footer class="print-timetable-footer">Generated by LAMA School Suite · LamaStudio.pk</footer>';
 if(scope==='all'){
  return '<article class="master-print-page">'+head+meta+timingBlock+'<section class="print-class-block"><h3>Master Timetable — '+esc(printDay||'Full week')+'</h3>'+masterGrid(filteredBase,requestedClasses,{printDay})+'</section>'+footer+'</article>'+calendarSection;
 }
 if(scope==='by-class'){
  const labels=requestedClasses;
  if(!labels.length)return head+meta+timingBlock+'<p class="empty-print">No saved timetable periods for this session.</p>'+calendarSection+footer;
  // Each class gets a complete school letterhead; a page break never
  // leaves the school name or logo behind on the preceding class sheet.
  const pages=labels.map(label=>{
   const subset=filteredBase.filter(p=>sameClass(classLabel(p),label));
   const classMeta='<div class="print-meta"><span>Academic session: <b>'+esc(sessionName||'Not selected')+
    '</b></span><span>Class '+esc(label)+'</span><span>Printed '+esc(shownDate)+'</span></div>';
   const table='<section class="print-class-block"><h3>Class '+esc(label)+' — Weekly Timetable</h3>'+weeklyMatrix(subset)+'</section>';
   return '<article class="print-class-page">'+head+classMeta+timingBlock+table+footer+'</article>';
  }).join('');
  return pages+calendarSection;
 }
 return head+meta+timingBlock+content+calendarSection+footer;
}
root.LamaTimetablePrint={safeLogo,schoolName,gradeOf,classLabel,timeLabel,sorted,rowsTable,weeklyMatrix,masterGrid,printMarkup};
})(typeof window!=='undefined'?window:globalThis);
