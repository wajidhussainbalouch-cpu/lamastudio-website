'use strict';
/** Read-only capacity scenarios. Never changes the approved division. */
const {scheduleApprovedDivision}=require('./syllabus-calendar-engine');
const {makeEnglishCalendar}=require('./syllabus-school-calendar-2026');
function evaluateTeachingCapacity(lessons, options={}){
 if(!Array.isArray(lessons)||!lessons.length)throw Error('Lesson division required');
 const holidays=options.holidays||[];
 const completed=options.completed||{};
 const previousSchedule=options.previousSchedule||{};
 const scenarios=[
  {id:'weekday-one-friday-none',label:'One English period Monday–Thursday, none Friday',periods:{1:1,2:1,3:1,4:1,5:0}},
  {id:'weekday-one-friday-one',label:'One English period Monday–Friday',periods:{1:1,2:1,3:1,4:1,5:1}},
  {id:'weekday-two-friday-one',label:'Two English periods Monday–Thursday, one Friday',periods:{1:2,2:2,3:2,4:2,5:1}}
 ];
 return scenarios.map(s=>{
  const result=scheduleApprovedDivision({lessons,calendar:makeEnglishCalendar(s.periods,holidays),completed,previousSchedule});
  return {scenarioId:s.id,label:s.label,availablePeriods:result.availablePeriods,
   requiredPeriods:result.requiredUnfinishedPeriods,shortfallPeriods:Math.max(0,result.requiredUnfinishedPeriods-result.availablePeriods),
   sparePeriods:Math.max(0,result.availablePeriods-result.requiredUnfinishedPeriods),feasible:result.feasible,
   lastScheduledDate:result.assignments.flatMap(a=>a.slots||[]).at(-1)?.date||null};
 });
}
if(typeof module!=='undefined')module.exports={evaluateTeachingCapacity};
