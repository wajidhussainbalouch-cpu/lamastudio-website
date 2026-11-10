/**
 * Verifies the production duplicate load guards on student and staff pages.
 * Fake school records only. Does not access or modify Google Sheets.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const st=fs.readFileSync(path.join(__dirname,'student-attendance-v2.html'),'utf8');
const teacher=fs.readFileSync(path.join(__dirname,'teacher-attendance.html'),'utf8');
function between(src,from,to){
 const a=src.indexOf(from),b=src.indexOf(to,a);
 assert.ok(a>=0&&b>a,'Missing production function '+from);
 return src.slice(a,b);
}
const students=new Function('asDate',between(st,'function duplicateAttendanceGroups(rows,date){','const matchRecord=(r,s)=>')+
 'return duplicateAttendanceGroups;')(value=>String(value??'').slice(0,10));
const teachers=new Function(between(teacher,'function duplicateTeacherGroups(rows,date){','const recDate=r=>')+
 'return duplicateTeacherGroups;')();
const date='2026-11-10';
const stRows=[
 ...Array.from({length:3},(_,i)=>({studentId:'s1',date,status:'Present',id:'r'+i})),
 ...Array.from({length:3},(_,i)=>({studentId:'s2',date,status:'Present',id:'r'+(i+3)})),
 {studentId:'s1',date:'2026-11-09',status:'Absent'}
];
const tRows=[
 ...Array.from({length:4},(_,i)=>({teacherId:'t1',date,status:'Present',id:'t'+i})),
 ...Array.from({length:4},(_,i)=>({teacherId:'t2',date,status:'Present',id:'t'+(i+4)}))
];
assert.equal(students(stRows,date),2,'3 same-date copies per student must block register');
assert.equal(teachers(tRows,date),2,'4 same-date copies per teacher must block register');
assert.equal(students([{studentId:'s1',date,status:'Absent'}],date),0);
assert.equal(teachers([{teacherId:'t1',date,status:'Leave'}],date),0);
assert.equal(students(stRows,'2026-11-09'),0,'Historical dates must be independent');
assert.equal(teachers(tRows,'2026-11-09'),0);
assert.ok(st.includes('state.integrityBlocked=duplicateAttendanceGroups(state.history'));
assert.ok(st.includes('&&state.integrityBlocked||!state.dirty.size'));
assert.ok(st.includes('Review duplicate records (read-only)'));
assert.ok(teacher.includes('staffIntegrityBlocked=historyAvailable?duplicateTeacherGroups'));
assert.ok(teacher.includes('||staffIntegrityBlocked'));
assert.ok(teacher.includes('Review duplicates (read-only)'));
console.log('PASS: duplicate student/teacher-day preflight blocks unsafe edits; valid dates remain available and review links exist.');
