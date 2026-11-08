'use strict';
/** Read-only teaching-capacity audit; does not modify a division or a schedule. */
function auditCapacity({lessons,calendar}){
 if(!Array.isArray(lessons)||!calendar||typeof calendar.start!=='string'||typeof calendar.end!=='string')throw Error('Missing lessons/calendar');
 const parse=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error('Invalid date');const d=new Date(s+'T00:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==s)throw Error('Invalid date');return d;};
 const start=parse(calendar.start),end=parse(calendar.end);if(start>end)throw Error('Invalid date range');
 const closures=calendar.closedRanges||[],holidays=new Set(calendar.holidays||[]);
 for(const r of closures){parse(r.start);parse(r.end);if(r.start>r.end)throw Error('Invalid closure');}
 for(const h of holidays)parse(h);
 let availablePeriods=0,teachingDays=0,closedDays=0,halfDayTeachingDays=0;
 const months={};
 for(let d=new Date(start);d<=end;d.setUTCDate(d.getUTCDate()+1)){
  const date=d.toISOString().slice(0,10),dow=d.getUTCDay(),capacity=calendar.periodsByWeekday?.[dow]??0;
  if(!Number.isSafeInteger(capacity)||capacity<0)throw Error('Invalid period capacity');
  const closed=holidays.has(date)||closures.some(r=>date>=r.start&&date<=r.end);
  const count=closed?0:capacity;
  const month=date.slice(0,7);if(!months[month])months[month]={availablePeriods:0,teachingDays:0,closedDays:0};
  if(closed){closedDays++;months[month].closedDays++;}
  if(count){teachingDays++;months[month].teachingDays++;if(dow===5)halfDayTeachingDays++;}
  availablePeriods+=count;months[month].availablePeriods+=count;
 }
 const seen=new Set();let requiredPeriods=0;
 for(const l of lessons){if(!l||!l.lessonId||seen.has(l.lessonId)||!Number.isSafeInteger(l.estimatedPeriods)||l.estimatedPeriods<1)throw Error('Invalid or duplicate lesson');seen.add(l.lessonId);requiredPeriods+=l.estimatedPeriods;}
 const shortfall=Math.max(0,requiredPeriods-availablePeriods);
 return {requiredPeriods,availablePeriods,shortfall,sparePeriods:Math.max(0,availablePeriods-requiredPeriods),
  feasible:shortfall===0,teachingDays,closedDays,halfDayTeachingDays,months,
  warning:shortfall?'Insufficient subject periods: do not compress approved lessons.':'Period capacity sufficient on paper; learning quality and exercise review still require approval.'};
}
if(typeof module!=='undefined')module.exports={auditCapacity};
