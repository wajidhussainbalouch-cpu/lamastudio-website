/** Duplicate-student and duplicate-teacher preflight: read-only mock data. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const st=fs.readFileSync(path.join(__dirname,'student-attendance-v2.html'),'utf8');
const teacher=fs.readFileSync(path.join(__dirname,'teacher-attendance.html'),'utf8');
function between(src,from,to){
 const a=src.indexOf(from),b=src.indexOf(to,a+from.length);
 assert.ok(a>=0&&b>a,'Missing current production function: '+from);
 return src.slice(a,b);
}
const students=new Function('asDate',between(st,'function duplicateAttendanceGroups(rows,date){','const matchRecord=(r,s)=>')+
 'return duplicateAttendanceGroups;')(r=>String(r??'').slice(0,10));
const date='2026-11-12';
const stRows=[
 {studentId:'s1',date,status:'Present',id:'r1'},
 {studentId:'s1',date,status:'Present',id:'r2'},
 {studentId:'s2',date,status:'Absent',id:'r3'},
 {studentId:'s2',date,status:'Absent',id:'r4'},
 {studentId:'s1',date:'2026-11-11',status:'Leave',id:'older'}
];
assert.equal(students(stRows,date),2);
assert.equal(students([{studentId:'s1',date,status:'Present'}],date),0);
assert.equal(students(stRows,'2026-11-11'),0);
assert.match(st,/state\.integrityBlocked=duplicateAttendanceGroups\(state\.history/);

const fn=between(teacher,'function applyTeacherDay(day,snapshot){','function pendingSaveMatches(){');
const nodes=new Map([
 ['date',{value:date}],['classFilter',{value:'',innerHTML:''}],
 ['historyTeacher',{value:'',innerHTML:''}]
]);
const $=key=>nodes.get(key)||nodes.set(key,{value:'',innerHTML:''}).get(key);
const status=r=>['Present','Absent','Leave'].includes(r.status)?r.status:'';
const reason=r=>String(r.remarks||'');
const ctx={
 $,
 id:t=>t.id,name:t=>t.name,
 status,reason,
 recDate:r=>String(r.date||'').slice(0,10),
 teacherClass:t=>t.assignedClass||'Not assigned',
 esc:s=>String(s)
};
const boot=[
 "let teachers=[],records=[],duplicateTeacherIds=[],attendanceHistoryLoaded=false,",
 "loadedDate='',verifiedAt=0;",
 "const selected=new Map();",
 "const {$,id,name,status,reason,recDate,teacherClass,esc}=ctx;"
].join('\n');
const app=new Function('ctx',boot+fn+
 'return {applyTeacherDay,get duplicates(){return duplicateTeacherIds},get selected(){return selected},get loaded(){return attendanceHistoryLoaded}};')(ctx);
const staff=[
 {id:'t1',name:'Teacher 1',assignedClass:'5'},
 {id:'t2',name:'Teacher 2',assignedClass:'4'}
];
app.applyTeacherDay(date,{teachers:staff,records:[
 {teacherId:'t1',date,status:'Present',id:'staff1'},
 {teacherId:'t1',date,status:'Present',id:'staff2'},
 {teacherId:'t2',date,status:'Absent',id:'staff3'},
 {teacherId:'t1',date:'2026-11-11',status:'Leave',id:'older'}
],duplicates:[]});
assert.equal(app.loaded,true);
assert.deepEqual([...app.duplicates],['t1'],'Duplicate date/teacher must block updates');
assert.equal(app.selected.has('t1'),false,'Unsafe teacher cannot be treated as uniquely saved');
assert.equal(app.selected.get('t2').status,'Absent');
assert.match(teacher,/if\(pendingVerification\)return toast\('Previous Save is unverified/);
assert.match(teacher,/duplicateTeacherIds\.length/);
assert.match(teacher,/if\(matches\.length>1\)throw Error\('Duplicate teacher\/date rows/);
console.log('PASS: student and teacher same-day duplicates prevent false verification; unique teachers remain visible.');
