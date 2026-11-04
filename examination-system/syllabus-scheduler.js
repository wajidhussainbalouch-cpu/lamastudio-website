/* LAMA Smart Syllabus Scheduler — offline, pure logic; no school data mutations.
 * Dates are ISO YYYY-MM-DD strings, interpreted as school-local calendar dates.
 * Public holidays are explicit per school/region/year, never guessed.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.LamaSyllabusScheduler=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const pad=n=>String(n).padStart(2,"0");
const date=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error("Use YYYY-MM-DD");const d=new Date(s+"T12:00:00Z");if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==s)throw Error("Invalid date: "+s);return d;};
const iso=d=>d.toISOString().slice(0,10);
const addDays=(s,n)=>{const d=date(s);d.setUTCDate(d.getUTCDate()+n);return iso(d);};
const addMonths=(s,n)=>{const d=date(s),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+n);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return iso(d);};
const dayOfWeek=s=>date(s).getUTCDay(); // Sunday=0, Saturday=6
function validateCalendar(calendar){
 if(!calendar||!calendar.startDate)throw Error("School calendar startDate required");
 date(calendar.startDate);
 if(!Number.isInteger(calendar.durationMonths)||calendar.durationMonths<1||calendar.durationMonths>24)throw Error("durationMonths must be 1–24");
 if(!Array.isArray(calendar.weeklyOffDays)||calendar.weeklyOffDays.some(x=>!Number.isInteger(x)||x<0||x>6))throw Error("weeklyOffDays must use 0–6");
 if(!Array.isArray(calendar.holidays||[])||!Array.isArray(calendar.closures||[]))throw Error("holidays/closures must be arrays");
 for(const x of [...(calendar.holidays||[]),...(calendar.closures||[])]){if(!x.date)throw Error("Holiday date required");date(x.date);}
 return true;
}
function workingDates(calendar){
 validateCalendar(calendar);
 const end=calendar.endDate||addDays(addMonths(calendar.startDate,calendar.durationMonths),-1);
 date(end);if(end<calendar.startDate)throw Error("End before start");
 const off=new Set(calendar.weeklyOffDays),excluded=new Map();
 for(const h of [...(calendar.holidays||[]),...(calendar.closures||[])])excluded.set(h.date,h.name||"School closure");
 const days=[],skipped=[];
 for(let d=calendar.startDate;d<=end;d=addDays(d,1)){
   if(off.has(dayOfWeek(d)))skipped.push({date:d,reason:"Weekly off"});
   else if(excluded.has(d))skipped.push({date:d,reason:excluded.get(d)});
   else days.push(d);
   if(days.length+skipped.length>750)throw Error("Calendar range too long");
 }
 return {startDate:calendar.startDate,endDate:end,days,skipped};
}
function periods({startDate,endDate,mode="monthly",terms=null}){
 date(startDate);date(endDate);if(endDate<startDate)throw Error("Invalid period");
 const out=[];
 if(mode==="custom"){
   if(!Array.isArray(terms)||!terms.length)throw Error("Custom terms required");
   for(const t of terms){date(t.startDate);date(t.endDate);if(t.startDate<startDate||t.endDate>endDate||t.endDate<t.startDate)throw Error("Term outside session");out.push({id:String(t.id),name:t.name,startDate:t.startDate,endDate:t.endDate});}
 }else if(mode==="monthly"){
   let cursor=startDate,n=0;
   while(cursor<=endDate){const d=date(cursor),last=iso(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)));const finish=last<endDate?last:endDate;out.push({id:"M"+(++n),name:d.toLocaleString("en-US",{month:"long",year:"numeric",timeZone:"UTC"}),startDate:cursor,endDate:finish});cursor=addDays(finish,1);}
 }else{
   const count=mode==="quarterly"?4:mode==="three-terms"?3:mode==="two-terms"?2:0;
   if(!count)throw Error("Unknown division mode");
   const all=[];for(let d=startDate;d<=endDate;d=addDays(d,1))all.push(d);
   for(let i=0;i<count;i++){const from=Math.floor(i*all.length/count),to=Math.floor((i+1)*all.length/count)-1;out.push({id:"P"+(i+1),name:mode==="quarterly"?"Quarter "+(i+1):mode==="three-terms"?["First Term","Middle Term","Final Term"][i]:["First Term","Final Term"][i],startDate:all[from],endDate:all[to]});}
 }
 const sorted=[...out].sort((a,b)=>a.startDate.localeCompare(b.startDate));
 for(let i=1;i<sorted.length;i++)if(sorted[i].startDate<=sorted[i-1].endDate)throw Error("Overlapping periods");
 return sorted;
}
function expandLessons(chapters){
 if(!Array.isArray(chapters)||!chapters.length)throw Error("Chapters required");
 const lessons=[],ids=new Set();
 for(const ch of chapters){
  if(!ch.id||ids.has(ch.id))throw Error("Missing/duplicate chapter ID");ids.add(ch.id);
  if(!Array.isArray(ch.lessons)||!ch.lessons.length)throw Error("Chapter requires lessons: "+ch.id);
  for(const l of ch.lessons){
   if(!l.id||!l.title||!Number.isInteger(l.periods)||l.periods<1||l.periods>100)throw Error("Lesson needs id, title and positive periods");
   for(let p=1;p<=l.periods;p++)lessons.push({chapterId:ch.id,chapterTitle:ch.title||ch.id,lessonId:l.id,lessonTitle:l.title,period:p,periods:l.periods,difficulty:l.difficulty||"normal",learningOutcome:l.learningOutcome||null});
  }
 }
 return lessons;
}
function buildPlan({calendar,chapters,division="monthly",customTerms=null,periodsPerDay=1,revisionDays=0,assessmentDays=0}){
 if(!Number.isInteger(periodsPerDay)||periodsPerDay<1||periodsPerDay>12)throw Error("periodsPerDay must be 1–12");
 if(!Number.isInteger(revisionDays)||revisionDays<0||!Number.isInteger(assessmentDays)||assessmentDays<0)throw Error("Invalid reserved days");
 const cal=workingDates(calendar),segments=periods({startDate:cal.startDate,endDate:cal.endDate,mode:division,terms:customTerms});
 const lessons=expandLessons(chapters),reserved=revisionDays+assessmentDays;
 if(reserved>cal.days.length)throw Error("Reserved days exceed teaching days");
 const teaching=cal.days.slice(0,cal.days.length-reserved),capacity=teaching.length*periodsPerDay;
 if(lessons.length>capacity)throw Error("Insufficient teaching days: "+lessons.length+" lesson periods for "+capacity+" slots");
 const slots=[];for(const d of teaching)for(let p=1;p<=periodsPerDay;p++)slots.push({date:d,slot:p});
 const schedule=lessons.map((l,i)=>({...l,...slots[i],periodId:segments.find(x=>slots[i].date>=x.startDate&&slots[i].date<=x.endDate)?.id||null,status:"planned"}));
 for(let i=0;i<reserved;i++){const d=cal.days[teaching.length+i];schedule.push({date:d,slot:1,kind:i<revisionDays?"revision":"assessment",status:"planned",periodId:segments.find(x=>d>=x.startDate&&d<=x.endDate)?.id||null});}
 const byPeriod=segments.map(s=>({...s,lessonPeriods:schedule.filter(x=>x.periodId===s.id&&x.lessonId).length,teachingDays:teaching.filter(d=>d>=s.startDate&&d<=s.endDate).length}));
 return {calendar:{startDate:cal.startDate,endDate:cal.endDate,weeklyOffDays:[...calendar.weeklyOffDays]},division,periods:byPeriod,scheduled:schedule,skipped:cal.skipped,unscheduledSlots:capacity-lessons.length,metadata:{lessonPeriods:lessons.length,teachingDays:teaching.length,capacity,generatedAt:null,requiresApproval:true}};
}
function teacherDiary(plan,day){date(day);return plan.scheduled.filter(x=>x.date===day).map(x=>({date:x.date,slot:x.slot,chapterId:x.chapterId||null,lessonId:x.lessonId||null,title:x.lessonTitle||x.kind,learningOutcome:x.learningOutcome||null,status:x.status,source:"syllabus-plan",editableByTeacher:true}));}
return {addDays,addMonths,validateCalendar,workingDates,periods,expandLessons,buildPlan,teacherDiary};
});
