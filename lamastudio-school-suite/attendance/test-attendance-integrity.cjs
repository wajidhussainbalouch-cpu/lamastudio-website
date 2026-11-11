/* Read-only integrity report tests using production source and fake records. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'attendance-integrity.html'),'utf8');
function extract(start,end){
 const i=html.indexOf(start),j=html.indexOf(end,i);
 assert.ok(i>=0&&j>i,'Missing integrity source '+start);
 return html.slice(i,j);
}
const analyze=new Function('dateValue',extract('function inspectAttendanceRecords(kind,records,date){','function administratorSession(){')+
 'return inspectAttendanceRecords;')(value=>String(value??'').slice(0,10));
const csv=new Function(extract('function csvCell(v){','function renderReport(report){')+
 'return reviewCsv;')();
const day='2026-11-10';
const studentRows=[
 ...Array.from({length:3},(_,n)=>({id:'s1-entry-'+n,studentId:'s1',studentName:'Student One',date:day,status:'Present'})),
 ...Array.from({length:3},(_,n)=>({id:'s2-entry-'+n,studentId:'s2',studentName:'Student Two',date:day,status:'Present'})),
 {id:'old',studentId:'s1',date:'2026-11-09',status:'Absent'}
];
const staffRows=[
 ...Array.from({length:4},(_,n)=>({id:'t1-entry-'+n,teacherId:'t1',teacherName:'Teacher One',date:day,status:'Present'})),
 ...Array.from({length:4},(_,n)=>({id:'t2-entry-'+n,teacherId:'t2',teacherName:'Teacher Two',date:day,status:'Present'}))
];
const students=analyze('attendance',studentRows,day);
assert.equal(students.total,6);
assert.equal(students.uniquePeople,2);
assert.equal(students.duplicateGroups,2);
assert.equal(students.extraRows,4);
assert.equal(students.conflictingGroups,0);
const staff=analyze('teacherAttendance',staffRows,day);
assert.equal(staff.total,8);
assert.equal(staff.duplicateGroups,2);
assert.equal(staff.extraRows,6);
assert.equal(staff.conflictingGroups,0);
const changed=analyze('attendance',[...studentRows,{id:'disagree',studentId:'s1',date:day,status:'Absent'}],day);
assert.equal(changed.conflictingGroups,1,'Contradictory status must require manual resolution');
const remarked=analyze('teacherAttendance',[
 {teacherId:'t1',id:'r1',date:day,status:'Leave',remarks:'Sick'},
 {teacherId:'t1',id:'r2',date:day,status:'Leave',remarks:'Family'}],day);
assert.equal(remarked.conflictingGroups,1,'Staff remarks disagreement must be flagged');
const missing=analyze('attendance',[{id:'no-person',date:day,status:'Present'}],day);
assert.equal(missing.missingIds,1);
assert.equal(missing.duplicateGroups,0,'Missing identity cannot be auto-grouped');
const exported=csv([students,staff],'school-id');
assert.ok(exported.includes('s1-entry-0'));
assert.ok(exported.includes('t2-entry-3'));
assert.ok(exported.includes('"school-id"'));
assert.equal(exported.split('\r\n').length,1+6+8);
assert.throws(()=>analyze('fees',[],day),/Invalid attendance integrity input/);
assert.ok(!html.includes('LamaAPI.remove('),'Read-only report must not contain a delete action');
assert.ok(!html.includes('LamaAPI.bulkAttendance('),'Read-only report must not upload attendance');
console.log('PASS: student 6/2, staff 8/2, mismatched statuses/remarks, missing IDs, CSV and read-only invariants.');
