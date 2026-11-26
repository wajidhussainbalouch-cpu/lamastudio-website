'use strict';
/* Read-only LAMA launch checks. Run: node lamastudio-school-suite/tests/core-attendance-regression.test.cjs */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
function load(relative){
 const source=fs.readFileSync(path.join(base,'js',relative),'utf8');
 const root={};
 const context={window:root,globalThis:root,Date,Intl,console};
 vm.runInNewContext(source,context,{filename:relative});
 return root;
}
const H=load('attendance-history.js').LamaAttendanceHistory;
const W=load('school-week.js').LamaSchoolWeek;
assert(H&&W,'Shared school helpers must be available');
const students=[{id:'s1',name:'Rukhsana',class:'Playgroup',enrlNo:'2'},{id:'s2',name:'Jabir',class:'Playgroup',enrlNo:'3'}];
const date='2026-11-21';
const original=[
 {studentId:'s1',enrlNo:'2',date,status:'Absent'},
 {studentId:'s2',enrlNo:'3',date,status:'Present'}
];
let m=H.make(students,original);
assert.equal(m.get(students[0],date),'Absent');
assert.equal(m.get(students[1],date),'Present');
assert.equal(m.get(students[1],'2026-11-20'),'','No mark must never mean Absent');
m=H.make(students,[...original,{studentId:'s1',date,status:'Present'}]);
assert.equal(m.get(students[0],date),'Present','Latest correction must replace prior absent status');
m=H.make(students,[{studentId:'missing',enrlNo:'3',date,status:'Absent'}]);
assert.equal(m.get(students[1],date),'','Unknown ID must not be matched using someone else\'s enrollment');
assert.equal(m.dataQuality(date).unmatchedAttendanceRows,1);
const dup=[...students,{id:'s3',name:'Another',class:'Playgroup',enrlNo:'2'}];
m=H.make(dup,[{enrlNo:'2',date,status:'Absent'}]);
assert.equal(m.get(students[0],date),'');
assert.equal(m.get(dup[2],date),'');
assert.equal(m.dataQuality(date).duplicateEnrollmentNumbers,1);
const prev=H.previousDays(date,3);
assert.deepEqual(Array.from(prev),['2026-11-20','2026-11-19','2026-11-18']);
const rows=['20','19','18','17','16'].map((d)=>({studentId:'s1',date:'2026-11-'+d,status:'Absent'}));
const streak=H.make(students,rows,undefined,day=>new Date(day+'T12:00:00Z').getUTCDay()===0);
assert.equal(streak.absenceInfo(students[0],date).weekAlert,true,'Five saved consecutive school-day absences alert');
let review=H.pendingPortalNotices(students,date,H.make(students,original),[
 {studentId:'s1',date,notificationType:'attendanceAbsence',status:'Active',isPublished:true}
]);
assert.equal(review.selected.length,1);
assert.equal(review.already.length,1);
assert.equal(review.pending.length,0,'Existing automatic absence notice is reused');
review=H.pendingPortalNotices(students,date,H.make(students,original),[]);
assert.equal(review.pending.length,1,'Missing portal notice is eligible');
assert.equal(review.pending[0].id,'s1');
review=H.pendingPortalNotices(students,date,H.make(students,[...original,{studentId:'s1',date,status:'Present'}]),[]);
assert.equal(review.selected.length,0,'Corrected absence cannot trigger follow-up');
const t={hours:{Friday:{open:false,start:'09:00',end:'12:30'},Thursday:{open:true,start:'09:00',end:'13:30'}},breakStart:'12:15',breakEnd:'12:30'};
assert.equal(W.lessonIssue(t,{day:'Friday',start:'11:45',end:'12:15'},'12:30',[0,6]),'');
assert.equal(W.lessonIssue(t,{day:'Friday',start:'12:15',end:'12:30'},'12:30',[0,6]),'','No Friday lunch-break collision');
assert.match(W.lessonIssue(t,{day:'Friday',start:'12:30',end:'13:00'},'12:30',[0,6]),/Friday school closes/);
assert.match(W.lessonIssue(t,{day:'Friday',start:'11:45',end:'12:15'},'12:30',[0,5,6]),/holiday/);
assert.equal(W.lessonIssue(t,{day:'Thursday',start:'12:30',end:'13:00'},'12:30',[0,6]),'');
assert.equal(W.fridayActivity({fridayClose:'12:30',fridayActivity:{start:'12:15',end:'12:30',title:'Bazm-e-Adab'}},[0,6]).subject,'Bazm-e-Adab');
assert.equal(W.fridayActivity({fridayClose:'12:30',fridayActivity:{start:'12:15',end:'12:30',title:'Bazm-e-Adab'}},[0,5,6]),null,'Friday holiday suppresses activity');
console.log('PASS: saved attendance, corrections, IDs, duplicate enrollments, absence history, parent notices, Friday hours.');
