/* School-local ISO date calendar overlays; pure functions, no persistence. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaSyllabusCalendar=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const parse=s=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error('Invalid ISO date');const d=new Date(s+'T12:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==s)throw Error('Invalid ISO date');return d;};
const next=s=>{const d=parse(s);d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10);};
function schoolDays({startDate,endDate,weeklyOffDays=[],holidays=[],closures=[],makeupDays=[]}){
 parse(startDate);parse(endDate);if(endDate<startDate)throw Error('End before start');
 if(!Array.isArray(weeklyOffDays)||weeklyOffDays.some(x=>!Number.isInteger(x)||x<0||x>6))throw Error('Invalid weekly off days');
 for(const list of [holidays,closures,makeupDays])if(!Array.isArray(list))throw Error('Calendar exceptions must be arrays');
 const off=new Set(weeklyOffDays),blocked=new Map(),makeups=new Set();
 for(const item of [...holidays,...closures]){if(!item||!item.date)throw Error('Closure date required');parse(item.date);blocked.set(item.date,item.name||'Closure');}
 for(const item of makeupDays){const day=typeof item==='string'?item:item?.date;parse(day);if(makeups.has(day))throw Error('Duplicate makeup date');makeups.add(day);}
 for(const day of makeups)if(blocked.has(day))throw Error('Makeup day conflicts with closure: '+day);
 const days=[],skipped=[];let scanned=0;
 for(let d=startDate;d<=endDate;d=next(d)){if(++scanned>750)throw Error('Calendar range too long');const weekly=off.has(parse(d).getUTCDay());if(blocked.has(d))skipped.push({date:d,reason:blocked.get(d)});else if(weekly&&!makeups.has(d))skipped.push({date:d,reason:'Weekly off'});else days.push(d);}
 for(const day of makeups)if(day<startDate||day>endDate)throw Error('Makeup outside session: '+day);
 return {startDate,endDate,days,skipped};
}
function teachingSlots(calendar,subjectWeekdays,periodsPerDay=1){
 if(!Array.isArray(subjectWeekdays)||subjectWeekdays.some(x=>!Number.isInteger(x)||x<0||x>6))throw Error('Invalid subject weekdays');
 if(!Number.isInteger(periodsPerDay)||periodsPerDay<1||periodsPerDay>12)throw Error('Invalid periods per day');
 const days=schoolDays(calendar).days.filter(d=>subjectWeekdays.includes(parse(d).getUTCDay()));
 return days.flatMap(date=>Array.from({length:periodsPerDay},(_,i)=>({date,slot:i+1})));
}
return {schoolDays,teachingSlots};
});
