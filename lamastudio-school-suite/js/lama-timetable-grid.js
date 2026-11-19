(function(root){
'use strict';
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const value=x=>String(x??'').trim(),norm=x=>value(x).toLowerCase();
const classLabel=p=>value(p.grade??p.class)+(value(p.section)?' · Section '+value(p.section):'');
const classKey=text=>{
 const raw=value(text),match=raw.match(/^(.*?)\s*·\s*Section\s+(.+)$/i);
 const grade=value(match?match[1]:raw).toLowerCase().replace(/^(?:class|grade|standard|std)[\s._-]*/,'').replace(/^0+(?=\d)/,'').replace(/\s+/g,'');
 return grade+(match?'|'+value(match[2]).toLowerCase().replace(/\s+/g,''):'');
};
const natural=(a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:'base'});
function labels(rows=[],offered=[]){
 const set=new Map();
 function add(label){if(!value(label))return;const k=classKey(label);if(k&&!set.has(k))set.set(k,value(label))}
 // Prefer the official class names from School Settings over legacy numeric grades.
 for(const r of offered||[]){
  if(typeof r==='string'){add(r);continue}
  if(!r)continue;
  const grade=value(r.grade??r.name??r.class),section=value(r.section);
  if(!grade)continue;
  if(section)add(grade+' · Section '+section);
  else if(Array.isArray(r.sections)&&r.sections.length){for(const sec of r.sections)if(value(sec))add(grade+' · Section '+value(sec))}
  else add(grade);
 }
 for(const r of rows||[]){
  if(typeof r==='string'){add(r);continue}
  if(r)add(classLabel(r));
 }
 return [...set.values()].sort(natural);
}
function splitLabel(text){
 const m=value(text).match(/^(.*?)\s*·\s*Section\s+(.+)$/i);
 return m?{grade:m[1].trim(),section:m[2].trim()}:{grade:value(text),section:''};
}
function timesFor(periods,day,num){
 const p=periods.find(p=>norm(p.day)===norm(day)&&Number(p.period)===Number(num)&&value(p.start)&&value(p.end));
 return {start:value(p?.start),end:value(p?.end)};
}
function gridMarkup(periods=[],classes=[],day='Monday',count=8,hiddenPeriods=[]){
 const today=periods.filter(p=>norm(p.day)===norm(day)),max=Math.min(14,Math.max(1,Number(count)||8));
 if(!classes.length)return '<p class="quick-empty">No classes configured. Add an offered class in School Settings or save the first period with the Period editor.</p>';
 const header='<thead><tr><th class="quick-fixed" scope="col">Period / time</th>'+classes.map(x=>'<th scope="col">'+esc(x)+' <button type="button" class="quick-remove" data-clear-class="'+esc(x)+'" aria-label="Remove '+esc(x)+' from this day">×</button></th>').join('')+'</tr></thead>';
 const body=Array.from({length:max},(_,i)=>{
  const period=i+1;if(hiddenPeriods.includes(period))return '';const {start,end}=timesFor(today,day,period);
  const cells=classes.map(c=>{
   const found=today.filter(p=>Number(p.period)===period&&classKey(classLabel(p))===classKey(c));
   const subject=found.length?found.map(p=>value(p.subject)||'Untitled').join(' / '):'＋ Add';
   const teacher=found.length?found.map(p=>value(p.teacherName)).filter(Boolean).join(' / '):'';
   return '<td><button type="button" class="quick-cell '+(found.length?'filled':'empty')+'" data-quick-class="'+esc(c)+'" data-quick-period="'+period+'" data-quick-day="'+esc(day)+'" title="'+esc((found.length?'Edit lesson':'Add lesson')+' · '+c+' · '+day+' · Period '+period)+'"><strong>'+esc(subject)+'</strong>'+(teacher?'<small>'+esc(teacher)+'</small>':'')+'</button></td>';
  }).join('');
  return '<tr><th scope="row" class="quick-fixed">P'+period+'<small>'+esc(start&&end?start+'–'+end:'Set time')+'</small><button type="button" class="quick-remove" data-clear-period="'+period+'" aria-label="Remove period '+period+' from this day">×</button></th>'+cells+'</tr>';
 }).join('');
 return '<table class="quick-matrix">'+header+'<tbody>'+body+'</tbody></table>';
}
root.LamaTimetableGrid={days,labels,classLabel,classKey,splitLabel,timesFor,gridMarkup};
})(window);