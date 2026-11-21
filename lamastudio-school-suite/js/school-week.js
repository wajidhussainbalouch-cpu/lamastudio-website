/* Shared school-wide weekly closure policy; uses existing school-scoped resources. */
(function(root){
'use strict';
const names=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],category='school-working-week',title='School Working Days and Holidays';
const parse=r=>{try{return JSON.parse(r.description||'{}')}catch{return null}};
function valid(off){return Array.isArray(off)&&off.length<7&&off.every(n=>Number.isInteger(n)&&n>=0&&n<=6)&&new Set(off).size===off.length}
function read(rows){
 if(!Array.isArray(rows))throw Error('School calendar unavailable.');
 const hits=rows.filter(r=>r.category===category);
 if(!hits.length)return null;
 if(hits.length!==1)throw Error('Duplicate school working-week records. Contact administrator.');
 const p=parse(hits[0]);if(!p||p.version!==1||!valid(p.weeklyOff))throw Error('Invalid school working-week settings.');
 return {id:hits[0].id,weeklyOff:p.weeklyOff.slice().sort(),snapshot:hits[0].description}
}
function session(rows,date){const ss=(rows||[]).filter(r=>r.category==='planning-session').map(r=>({...parse(r),id:r.id})).filter(s=>s.start<=date&&date<=s.end);return ss.find(s=>s.active===true)||ss[0]}
function inside(d,x){return !!x&&x.from<=d&&d<=x.to}
function weekday(d){return new Date(d+'T12:00:00Z').getUTCDay()}
function reason(rows,date,legacyOff=null){
 const p=read(rows),ss=session(rows,date),n=weekday(date);
 if(!Number.isInteger(n))throw Error('Invalid date.');
 if(ss&&Object.values(ss.vacations||{}).some(x=>inside(date,x)))return 'School vacation';
 if(rows.some(r=>{if(r.category!=='planning-event')return false;const e=parse(r);return e&&e.published===true&&!e.grade&&!e.section&&!e.teacherId&&/holiday|vacation/i.test(e.type||'')&&e.start<=date&&date<=e.end&&(!ss||String(e.sessionId)===String(ss.id))}))return 'Published school holiday';
 if(p)return p.weeklyOff.includes(n)?names[n]+' — weekly holiday':'';
 if(Array.isArray(legacyOff))return legacyOff.includes(n)?names[n]+' — weekly holiday':'';
 const season=ss&&[ss.schoolTiming,ss.summerTiming].find(x=>inside(date,x));
 if(season?.hours?.[names[n]])return season.hours[names[n]].open===true?'':names[n]+' — weekly holiday';
 return n===0?'Sunday — weekly holiday':'';
}
function working(rows,fallback=names.slice(1)){const p=read(rows);return p?names.slice(1).concat('Sunday').filter(d=>!p.weeklyOff.includes(names.indexOf(d))):fallback}
const clock=v=>typeof v==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v);
function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).reduce((o,p)=>(o[p.type]=p.value,o),{});}
function schoolDate(){const d=today();return d.year+'-'+d.month+'-'+d.day}
function seasonTiming(ss,date=schoolDate(),season=''){if(!ss)return null;const list=[['winter',ss.schoolTiming],['summer',ss.summerTiming]].filter(([k,t])=>t&&t.from&&t.to&&t.from<=t.to&&t.hours);const hit=season?list.find(([k])=>k===season):list.find(([k,t])=>inside(date,t));return hit?{name:hit[0],timing:hit[1]}:null}
function lessonIssue(t,p,fridayClose=''){if(p?.day==='Friday'&&clock(fridayClose)&&clock(p.end)&&p.end>fridayClose)return 'Friday school closes at '+fridayClose;if(!t)return '';const h=t.hours?.[p.day];if(!h||h.open!==true)return 'School hours not open / configured for '+p.day;if(!clock(h.start)||!clock(h.end)||h.start>=h.end)return 'School hours not configured for '+p.day;if(!clock(p.start)||!clock(p.end)||p.start>=p.end)return 'Invalid lesson times';if(p.start<h.start||p.end>h.end)return 'Outside school hours '+h.start+'–'+h.end;for(const [a,b,label] of [[t.assemblyStart,t.assemblyEnd,'Morning assembly'],[t.breakStart,t.breakEnd,'Lunch break']])if(clock(a)&&clock(b)&&a<b&&p.start<b&&p.end>a&&a>=h.start&&b<=h.end)return 'Overlaps '+label+' '+a+'–'+b;return ''}
function formatClock(v){if(!clock(v))return 'Not configured';const [h,m]=v.split(':').map(Number);return (h%12||12)+':'+String(m).padStart(2,'0')+' '+(h<12?'AM':'PM')}
function activities(t,day){const h=t?.hours?.[day];if(h?.open!==true)return [];return [[t.assemblyStart,t.assemblyEnd,'Morning assembly'],[t.breakStart,t.breakEnd,'Lunch break']].filter(([a,b])=>clock(a)&&clock(b)&&a<b&&a>=h.start&&b<=h.end).map(([start,end,label])=>({start,end,label}))}
function renderHours(box,rows,date=schoolDate()){if(!box)return;box.replaceChildren();const add=(tag,val)=>{const e=document.createElement(tag);e.textContent=val;box.append(e);return e};add('h3','School timings').className='font-bold';if(!Array.isArray(rows)){add('p','School timings unavailable. Refresh to retry.');return}const ss=session(rows,date),season=seasonTiming(ss,date);if(!season){add('p','No seasonal hours published for today.');return}const {name,timing:t}=season;add('p',(name==='winter'?'Winter':'Summer')+' · '+t.from+' – '+t.to);const off=read(rows)?.weeklyOff;const groups=new Map();for(const d of names.slice(1).concat('Sunday')){const h=t.hours[d],closed=Array.isArray(off)?off.includes(names.indexOf(d)):h?.open!==true;const val=closed?'Holiday':h?.open===true?formatClock(h.start)+' – '+formatClock(h.end):'Hours not configured';if(!groups.has(val))groups.set(val,[]);groups.get(val).push(d.slice(0,3))}for(const [v,ds] of groups)add('p',ds.join(', ')+': '+v);add('p','Morning assembly: '+(clock(t.assemblyStart)&&clock(t.assemblyEnd)?formatClock(t.assemblyStart)+' – '+formatClock(t.assemblyEnd):'Not configured'));add('p','Lunch break: '+(clock(t.breakStart)&&clock(t.breakEnd)?formatClock(t.breakStart)+' – '+formatClock(t.breakEnd):'Not configured'))}
root.LamaSchoolWeek={names,category,title,valid,read,reason,working,schoolDate,seasonTiming,lessonIssue,formatClock,activities,renderHours};
})(typeof window!=='undefined'?window:globalThis);