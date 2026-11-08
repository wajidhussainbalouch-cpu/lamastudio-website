'use strict';
/** Preview only: does not publish a division or modify teacher progress. */
const {scheduleApprovedDivision}=require('./syllabus-calendar-engine');
function buildCapacityPreview({division,calendar,completed={},previousSchedule={}}){
 if(!division||!Array.isArray(division.lessons))throw Error('Missing division lessons');
 const schedule=scheduleApprovedDivision({lessons:division.lessons,calendar,completed,previousSchedule});
 const shortage=schedule.assignments.reduce((sum,a)=>sum+(a.missingPeriods||0),0);
 const completedCount=schedule.assignments.filter(a=>a.status==='completed').length;
 const unfinished=schedule.assignments.filter(a=>a.status!=='completed');
 const lastScheduledSlot=unfinished.flatMap(a=>a.slots||[]).at(-1)||null;
 return {divisionStatus:division.status||'draft',lessonCount:division.lessons.length,
  completedCount,unfinishedCount:unfinished.length,
  requiredPeriods:schedule.requiredUnfinishedPeriods,
  availablePeriods:schedule.availablePeriods,
  missingPeriods:shortage,
  feasible:schedule.feasible,
  lastScheduledDate:lastScheduledSlot?lastScheduledSlot.date:null,
  warnings:[
   ...(!schedule.feasible?['Insufficient subject periods before the course deadline; obtain additional timetable capacity or approve a revised target. Do not shorten or drop lessons automatically.']:[]),
   ...(division.status!=='approved'&&division.status!=='published'?['Division is not approved: preview only, no teacher publication.']:[])
  ],
  assignments:schedule.assignments};
}
if(typeof module!=='undefined')module.exports={buildCapacityPreview};
