'use strict';
/** School-provided 2026-27 calendar boundaries. English periods must be supplied by school timetable. */
const SCHOOL_CALENDAR_2026={
 academicSessionStart:'2026-04-01',
 academicSessionEnd:'2027-03-31',
 syllabusDeadline:'2026-12-23',
 revisionStart:'2027-01-01',
 summer:{start:'2026-05-22',end:'2026-08-23'},
 winter:{start:'2026-12-24',end:'2026-12-31'},
 weekendDays:[0,6],halfDayWeekdays:[5],
 publicHolidaysStatus:'pending-school-confirmation'
};
function makeEnglishCalendar(periodsByWeekday,holidays=[]){
 if(!periodsByWeekday||typeof periodsByWeekday!=='object')throw Error('English periods by weekday required');
 const periods={};
 for(let day=0;day<=6;day++){
  const n=periodsByWeekday[day]??0;
  if(!Number.isSafeInteger(n)||n<0)throw Error('Invalid English periods');
  if((day===0||day===6)&&n!==0)throw Error('Weekend must have zero periods');
  periods[day]=n;
 }
 if(periods[5]>Math.max(periods[1],periods[2],periods[3],periods[4]))throw Error('Friday capacity exceeds full teaching day');
 return {start:SCHOOL_CALENDAR_2026.academicSessionStart,end:SCHOOL_CALENDAR_2026.syllabusDeadline,
  periodsByWeekday:periods,
  closedRanges:[SCHOOL_CALENDAR_2026.summer,SCHOOL_CALENDAR_2026.winter],
  holidays};
}
/**
 * Build a subject-specific school calendar using actual timetable period indices.
 * Omitted weekdays mean no English lesson; never infer a timetable from capacity.
 */
function makeEnglishCalendarFromTimetable(periodSlotsByWeekday,holidays=[]){
 if(!periodSlotsByWeekday||typeof periodSlotsByWeekday!=='object'||Array.isArray(periodSlotsByWeekday))throw Error('English timetable required');
 const slots={};
 for(const [weekday,periods] of Object.entries(periodSlotsByWeekday)){
  if(!/^[0-6]$/.test(weekday))throw Error('Invalid English timetable weekday');
  if(!Array.isArray(periods)||periods.some(p=>!Number.isSafeInteger(p)||p<1||p>12)||new Set(periods).size!==periods.length||periods.some((p,i)=>i>0&&p<=periods[i-1]))throw Error('Invalid English timetable periods');
  if((weekday==='0'||weekday==='6')&&periods.length)throw Error('Weekend must have zero periods');
  slots[weekday]=[...periods];
 }
 return {start:SCHOOL_CALENDAR_2026.academicSessionStart,end:SCHOOL_CALENDAR_2026.syllabusDeadline,
  periodSlotsByWeekday:slots,
  closedRanges:[{...SCHOOL_CALENDAR_2026.summer},{...SCHOOL_CALENDAR_2026.winter}],
  holidays:[...holidays]};
}
if(typeof module!=='undefined')module.exports={SCHOOL_CALENDAR_2026,makeEnglishCalendar,makeEnglishCalendarFromTimetable};
