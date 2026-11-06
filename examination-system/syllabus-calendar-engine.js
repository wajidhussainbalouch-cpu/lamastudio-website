/* Pure, side-effect-free syllabus calendar scheduler. Not wired to production. */
'use strict';
function dateUTC(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error('Invalid ISO date');const d=new Date(s+'T00:00:00Z');if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==s)throw Error('Invalid date');return d;}
function iso(d){return d.toISOString().slice(0,10);}
function inRanges(day,ranges){return ranges.some(r=>day>=r.start&&day<=r.end);}
function scheduleApprovedDivision({lessons,calendar,completed={},previousSchedule={}}){
 if(!Array.isArray(lessons)||!calendar||!calendar.start||!calendar.end)throw Error('Missing division/calendar');
 const seen=new Set(), slots=[];let d=dateUTC(calendar.start),end=dateUTC(calendar.end);
 if(d>end)throw Error('Invalid calendar range');
 const closed=calendar.closedRanges||[];
 for(const r of closed){dateUTC(r.start);dateUTC(r.end);if(r.start>r.end)throw Error('Invalid closure range');}
 const holidays=new Set(calendar.holidays||[]);
 for(const h of holidays)dateUTC(h);
 while(d<=end){const day=iso(d),dow=d.getUTCDay(),capacity=Number((calendar.periodsByWeekday||{})[dow]||0);
  if(!Number.isSafeInteger(capacity)||capacity<0)throw Error('Invalid period capacity');
  if(!holidays.has(day)&&!inRanges(day,closed))for(let p=1;p<=capacity;p++)slots.push({date:day,period:p});
  d.setUTCDate(d.getUTCDate()+1);
 }
 const assignments=[];let slotIndex=0;
 for(const lesson of lessons){
  if(!lesson||typeof lesson.lessonId!=='string'||!lesson.lessonId||seen.has(lesson.lessonId))throw Error('Missing/duplicate lessonId');
  seen.add(lesson.lessonId);
  const required=lesson.estimatedPeriods;
  if(!Number.isSafeInteger(required)||required<1)throw Error('Invalid estimatedPeriods');
  if(completed[lesson.lessonId]){
   assignments.push({lessonId:lesson.lessonId,status:'completed',actualDate:completed[lesson.lessonId].actualDate||null,slots:(previousSchedule[lesson.lessonId]||[])});
   continue;
  }
  const allocated=slots.slice(slotIndex,slotIndex+required);
  slotIndex+=allocated.length;
  assignments.push({lessonId:lesson.lessonId,status:allocated.length===required?'scheduled':'insufficient-capacity',slots:allocated,missingPeriods:required-allocated.length});
 }
 return {assignments,requiredUnfinishedPeriods:lessons.filter(l=>!completed[l.lessonId]).reduce((s,l)=>s+l.estimatedPeriods,0),availablePeriods:slots.length,remainingPeriods:Math.max(0,slots.length-slotIndex),feasible:assignments.every(a=>a.status!=='insufficient-capacity')};
}
if(typeof module!=='undefined')module.exports={scheduleApprovedDivision};
