'use strict';
/**
 * Emergency attendance timezone display regression; synthetic attendance only.
 * Google Sheets native 12-Nov-2026 cell serial 46338 represents the
 * 2026-11-11T19:00:00Z timestamp when served from Asia/Karachi.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname;
const student=fs.readFileSync(path.join(root,'attendance/student-attendance-v2.html'),'utf8');
const teacher=fs.readFileSync(path.join(root,'attendance/teacher-attendance.html'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
function extract(s,start,end){
 const a=s.indexOf(start),b=s.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Failed to extract '+start);
 return s.slice(a,b);
}
const asDate=new Function('LamaAPI',extract(student,'const asDate=v=>{','const array=v=>')+'return asDate;')({
 getSession:()=>({timezone:'Asia/Karachi'})
});
const recDate=new Function('school','iso',extract(teacher,'const recDate=r=>','const status=r=>')+'return recDate;')(
 {timezone:'Asia/Karachi'},d=>d.toISOString().slice(0,10)
);
const shift='2026-11-11T19:00:00.000Z',day='2026-11-12';
assert.equal(asDate(shift),day);
assert.equal(recDate({date:shift}),day);
assert.equal(asDate(day),day);
assert.equal(recDate({date:day}),day);
assert.equal(asDate('12/11/2026'),day);
assert.equal(recDate({date:'12/11/2026'}),day);
assert.equal(asDate('2026-11-11T23:00:00+05:00'),'2026-11-11','Explicit offset must not shift an already local day');
assert.equal(recDate({date:'2026-11-11T23:00:00+05:00'}),'2026-11-11');
// Earlier native Sheet dates must be assigned consistently, not grouped on previous UTC days.
assert.equal(asDate('2026-11-10T19:00:00.000Z'),'2026-11-11');
assert.equal(recDate({date:'2026-11-10T19:00:00.000Z'}),'2026-11-11');
// A school in another timezone is handled based on its configured timezone.
const different=new Function('LamaAPI',extract(student,'const asDate=v=>{','const array=v=>')+'return asDate;')({
 getSession:()=>({timezone:'America/Los_Angeles'})
});
assert.equal(different(shift),'2026-11-11');
// Old version took the UTC prefix and incorrectly called 12 Nov "11 Nov".
assert.notEqual(shift.slice(0,10),day);
assert.match(dashboard,/UTC timestamps must be converted to local calendar dates/);
console.log('PASS: Student and teacher registers show 12-Nov native Sheets attendance on 12-Nov in Asia/Karachi, preserving date-only and alternate-school formats.');
