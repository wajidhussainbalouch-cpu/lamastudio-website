'use strict';
// All inputs are synthetic. Never connects to the live Apps Script or Sheets.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'dashboard.html'),'utf8');
const section=(start,end)=>{
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing dashboard source section '+start);
 return html.slice(a,b);
};
const day='2026-11-14';
const roster=[
 {id:'s1',enrlNo:'1',class:'4',name:'Ali'},
 {id:'s2',enrlNo:'2',class:'4',name:'Rukhsana',contact:'03001234567'},
 {id:'s3',enrlNo:'3',class:'Playgroup',name:'Jabir'}
];
const records=[
 {id:'a1',studentId:'s1',date:day,status:'Present'},
 {id:'a2',studentId:'s1',date:day,status:'Absent'}, // conflicting duplicate
 {id:'a3',studentId:'s2',date:day,status:'Absent'},
 {id:'a4',studentId:'not-in-this-school',enrlNo:'3',date:day,status:'Present'} // never fall back by enrollment
];
const elements=new Map();
const get=id=>{
 if(id==='dashboardAbsentFollowup')return null;
 if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',style:{},classList:{toggle(){}}});
 return elements.get(id);
};
const document={getElementById:get};
const context={
 document,Date:class extends Date { constructor(...args){super(...(args.length?args:[2026,10,14,12,0,0]));}},
 localISODate:()=>day,
 normalizeAttendanceDate:value=>String(value??'').slice(0,10),
 classAttendanceUrl:(c,d)=>'attendance/student-attendance.html?class='+encodeURIComponent(c)+'&date='+d,
 esc:value=>String(value??''),
 waLink:()=> '#wa',smsLink:()=> '#sms'
};
vm.createContext(context);
vm.runInContext(
 section('function verifiedStudentDayRows(attendance,students,day){',"\n        document.getElementById('studentAttClasses')")+
 section('function renderStudentAttendanceCard(attendance,students){','\nfunction normalizeAttendanceDate(value)')+
 section('function renderAttendanceChart(attendance,students){','function renderFeeChart(series,fees){')+
 section('function renderAbsentees(attendance,students){','function renderNotices(notices){'),
 context
);
const summary=context.verifiedStudentDayRows(records,roster,day);
assert.equal(summary.unique.size,1);
assert.equal(summary.duplicates.size,1);
assert.equal(summary.duplicates.get('s1').name,'Ali');
assert.equal(summary.unique.get('s2').status,'absent');
assert.equal(summary.unique.has('s3'),false,'unknown ID must not match another student by enrollment');
const identical=[{studentId:'s1',date:day,status:'Present'},{studentId:'s1',date:day,status:'Present'}];
assert.equal(context.verifiedStudentDayRows(identical,roster,day).duplicates.size,1,'identical duplicate statuses are still unverified');
const collided=[{id:'c1',enrlNo:'7',class:'4'},{id:'c2',enrlNo:'7',class:'4'}];
assert.equal(context.verifiedStudentDayRows([{enrlNo:'7',date:day,status:'Absent'}],collided,day).unique.size,0,'colliding enrollments must not assign attendance to a random student');
context.renderStudentAttendanceCard(records,roster);
assert.equal(get('studentAttPresent').textContent,0);
assert.equal(get('studentAttAbsent').textContent,1);
assert.equal(get('studentAttUnmarked').textContent,1);
assert.equal(get('studentAttCompletion').textContent,'33%');
assert.match(get('studentAttHint').textContent,/1 student\(s\) need attendance review/);
assert.match(get('studentAttClasses').innerHTML,/Needs review \(1\)/);
context.renderAttendanceChart(records,roster);
assert.match(get('attendanceSummary').innerHTML,/Needs review/);
assert.match(get('classBarsDate').textContent,/1 need review/);
assert.match(get('attendanceClassBars').innerHTML,/1 need review/);
context.renderAbsentees(records,roster);
const outreach=get('absenteesList').innerHTML;
assert.match(outreach,/Rukhsana/,'verified absent pupil should appear in parent follow-up');
assert.doesNotMatch(outreach,/Ali/,'duplicate pupil should not appear in absence follow-up');
assert.match(outreach,/Contact parents only for confirmed absences/);
console.log('PASS: duplicate student/date rows are not reported as verified or sent to parent follow-up.');
