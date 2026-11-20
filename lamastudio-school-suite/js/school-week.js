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
root.LamaSchoolWeek={names,category,title,valid,read,reason,working};
})(typeof window!=='undefined'?window:globalThis);