/* Integration adapter: verified catalog + calendar + existing scheduler.
 * Pure preview only. No subscription, tenant or persistence enforcement.
 */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./syllabus-scheduler.js'):root.LamaSyllabusScheduler,typeof module==='object'&&module.exports?require('./syllabus-catalog.js'):root.LamaSyllabusCatalog,typeof module==='object'&&module.exports?require('./syllabus-calendar.js'):root.LamaSyllabusCalendar);if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaSyllabusPlanner=api;})(typeof globalThis!=='undefined'?globalThis:this,function(scheduler,catalog,calendar){
'use strict';
function preview({schoolCalendar,verifiedCatalog,subjectWeekdays,periodsPerDay=1,division='monthly',customTerms=null,revisionDays=0,assessmentDays=0}){
 if(!scheduler||!catalog||!calendar)throw Error('Planner dependencies not loaded');
 const c=catalog.normalizeCatalog(verifiedCatalog);
 const cal=calendar.schoolDays(schoolCalendar);
 const allowed=subjectWeekdays==null?[0,1,2,3,4,5,6]:subjectWeekdays;
 const slots=calendar.teachingSlots(schoolCalendar,allowed,periodsPerDay);
 if(!Number.isInteger(revisionDays)||revisionDays<0||!Number.isInteger(assessmentDays)||assessmentDays<0)throw Error('Invalid reserved days');
 const reserved=revisionDays+assessmentDays;
 const dates=[...new Set(slots.map(x=>x.date))];
 if(reserved>dates.length)throw Error('Reserved days exceed subject teaching days');
 const teachingDates=dates.slice(0,dates.length-reserved);
 const available=slots.filter(x=>teachingDates.includes(x.date));
 const lessons=scheduler.expandLessons(c.chapters);
 if(lessons.length>available.length)throw Error('Insufficient subject teaching slots: '+lessons.length+' lessons for '+available.length+' slots');
 const segments=scheduler.periods({startDate:cal.startDate,endDate:cal.endDate,mode:division,terms:customTerms});
 const periodId=date=>segments.find(p=>p.startDate<=date&&p.endDate>=date)?.id||null;
 const scheduled=lessons.map((l,i)=>({...l,...available[i],periodId:periodId(available[i].date),status:'planned'}));
 for(let i=0;i<reserved;i++){const date=dates[teachingDates.length+i];scheduled.push({date,slot:1,kind:i<revisionDays?'revision':'assessment',periodId:periodId(date),status:'planned'});}
 const periods=segments.map(p=>({...p,lessonPeriods:scheduled.filter(x=>x.lessonId&&x.periodId===p.id).length,teachingDays:teachingDates.filter(d=>d>=p.startDate&&d<=p.endDate).length}));
 return {calendar:{startDate:cal.startDate,endDate:cal.endDate,weeklyOffDays:[...schoolCalendar.weeklyOffDays]},catalog:{curriculumId:c.curriculumId,classId:c.classId,subjectId:c.subjectId,sourceVersion:c.sourceVersion},division,periods,scheduled,skipped:cal.skipped,unscheduledSlots:available.length-lessons.length,metadata:{lessonPeriods:lessons.length,teachingDays:teachingDates.length,capacity:available.length,generatedAt:null,requiresApproval:true,previewOnly:true}};
}
return {preview};
});
