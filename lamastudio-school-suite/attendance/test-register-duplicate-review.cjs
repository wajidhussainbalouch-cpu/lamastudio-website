'use strict';
// This suite uses fake roster and attendance rows; no live Google Sheet is contacted.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'student-attendance-v2.html'),'utf8');
const a=src.indexOf('function inspectSavedDayAttendance(rows,students,day){');
const b=src.indexOf('function validAdminWriteSession(){',a);
assert.ok(a>=0&&b>a,'Cannot find source-based duplicate inspection and lock');
const state={conflicts:new Map(),unmatched:0,writeHold:false};
const id=s=>String(s.id??s.enrlNo??''),enr=s=>String(s.enrlNo??'');
const cls=s=>String(s.class??'Unassigned'),asDate=d=>String(d||'').slice(0,10);
const status=x=>{const s=String(x||'').toLowerCase();return ['present','p'].includes(s)?'Present':['absent','a'].includes(s)?'Absent':['leave','l'].includes(s)?'Leave':''};
const helper=new Function('state','id','enr','cls','asDate','status',src.slice(a,b)+'return {inspectSavedDayAttendance,registerNeedsReview};')(state,id,enr,cls,asDate,status);
const day='2026-11-15',students=[
 {id:'s1',enrlNo:'1',class:'1',name:'Ali'},
 {id:'s2',enrlNo:'2',class:'1',name:'Rukhsana'},
 {id:'s3',enrlNo:'3',class:'2',name:'Jabir'}
];
const rows=[
 {id:'a1',studentId:'s1',enrlNo:'1',class:'1',date:day,status:'Present'},
 {id:'a2',studentId:'s1',enrlNo:'1',class:'1',date:day,status:'Absent'},
 {id:'a3',studentId:'s2',enrlNo:'2',class:'1',date:day,status:'Present'},
 {id:'a4',studentId:'s3',enrlNo:'3',class:'2',date:day,status:'Present'},
 {id:'yesterday',studentId:'s1',date:'2026-11-14',status:'Present'}
];
const checked=helper.inspectSavedDayAttendance(rows,students,day);
assert.equal(checked.chosen.size,2,'Duplicate student cannot be counted as verified Present');
assert.equal(checked.conflicts.size,1,'Same student/date twice is a conflict');
assert.equal(checked.conflicts.get('s1').length,2,'Both original rows preserved for audit');
assert.equal(checked.chosen.has('s1'),false);
assert.equal(checked.unknown.length,0);
state.conflicts=checked.conflicts;
assert.equal(helper.registerNeedsReview(),true,'Mutations must be blocked');
const equal=helper.inspectSavedDayAttendance([
 {studentId:'s1',date:day,status:'Present'},
 {studentId:'s1',date:day,status:'Present'}
],students,day);
assert.equal(equal.conflicts.size,1,'Identical status duplicates also require review');
const legacy=helper.inspectSavedDayAttendance([{enrlNo:'2',class:'1',date:day,status:'Leave'}],students,day);
assert.equal(legacy.chosen.get('s2').status,'Leave','Unique legacy enrollment/class resolves canonical student');
const unknown=helper.inspectSavedDayAttendance([{studentId:'wrong',enrlNo:'3',class:'2',date:day,status:'Present'}],students,day);
assert.equal(unknown.chosen.size,0,'Unknown explicit ID must not fallback by enrollment');
assert.equal(unknown.unknown.length,1);
const invalid=helper.inspectSavedDayAttendance([{studentId:'s1',date:day,status:'invalid'}],students,day);
assert.equal(invalid.conflicts.size,1,'Unknown status must not be treated as confirmed');
state.conflicts=new Map();state.unmatched=1;
assert.equal(helper.registerNeedsReview(),true,'Unmatched row also prevents writes');
state.unmatched=0;state.writeHold=true;
assert.equal(helper.registerNeedsReview(),true,'Unverified write must continue to block edits');
assert.match(src,/Register loaded — review required/);
assert.match(src,/Needs review/);
for(const action of ["$('save').onclick","$('clearDate').onclick","$('bulk').onclick","function enable()","function choose(k,v)"]){
 const pos=src.indexOf(action);assert.ok(pos>=0,'Action absent '+action);
 assert.ok(src.slice(pos,pos+500).includes('registerNeedsReview()'),'Unsafe action not guarded: '+action);
}
assert.match(src,/attendance-raw-review-/);
assert.match(src,/if\(removalStarted\)\s*\{\s*holdUnverified\(\);\s*message\('Clear-date result uncertain/);
assert.match(src,/sessionStorage\.setItem\(attendanceHoldKey\(\),'review required'\)/,'An uncertain save/clear must survive a page refresh');
const scripts=[...src.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
assert.ok(scripts.length>0);
for(const script of scripts)new vm.Script(script,{filename:'student-attendance-v2 inline'});
const recentStart=src.indexOf('function recentAttendance(student){');
const recentEnd=src.indexOf('\nfunction message(',recentStart);
assert.ok(recentStart>=0&&recentEnd>recentStart);
const recentFn=new Function('state','asDate','matchRecord','status',String.fromCharCode(36),
 src.slice(recentStart,recentEnd)+'return recentAttendance;'
)(
 {loadedDate:'2026-11-15',history:[
  {studentId:'s1',date:'2026-11-14',status:'Present'},
  {studentId:'s1',date:'2026-11-13',status:'Absent'},
  {studentId:'s1',date:'2026-11-13',status:'Present'}]},
 asDate,(record,student)=>record.studentId===student.id,status,()=>({value:'2026-11-15'})
);
assert.match(recentFn({id:'s1'}),/11-14: Present/,'Saturday saved attendance must appear in prior days');
assert.match(recentFn({id:'s1'}),/11-13: Needs review/,'Historical duplicates must not be silently overwritten');
assert.doesNotMatch(src,/Previous 7 weekdays \(saved records\)/,'No blanket Saturday exclusion');
console.log('PASS: duplicate/unknown daily marks are quarantined, unsafe controls locked, raw CSV available, and inline JavaScript parses.');
