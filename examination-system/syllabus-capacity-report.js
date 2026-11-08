'use strict';
/** Capacity report: separate approved period requirements from calendar availability. */
const {scheduleApprovedDivision}=require('./syllabus-calendar-engine');
function analyzeCapacity({lessons,calendar,completed={},previousSchedule={}}){
 const result=scheduleApprovedDivision({lessons,calendar,completed,previousSchedule});
 const byMonth={};
 for(const a of result.assignments)for(const s of a.slots||[]){
  const month=s.date.slice(0,7);
  if(!byMonth[month])byMonth[month]={periods:0,lessonIds:[]};
  byMonth[month].periods++;
  if(!byMonth[month].lessonIds.includes(a.lessonId))byMonth[month].lessonIds.push(a.lessonId);
 }
 const unscheduled=result.assignments.filter(a=>a.status==='insufficient-capacity')
   .map(a=>({lessonId:a.lessonId,missingPeriods:a.missingPeriods}));
 const missingPeriods=unscheduled.reduce((n,a)=>n+a.missingPeriods,0);
 return {feasible:result.feasible,requiredUnfinishedPeriods:result.requiredUnfinishedPeriods,
  availablePeriods:result.availablePeriods,missingPeriods,unscheduled,byMonth,
  message:result.feasible?'Fits available periods in the supplied calendar':'Insufficient English periods; revise timetable or completion target, not lesson content'};
}
module.exports={analyzeCapacity};
