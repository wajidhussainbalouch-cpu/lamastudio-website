'use strict';
// Uses synthetic students and saved attendance only. No network or school data.
process.env.TZ='Asia/Karachi';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.join(__dirname,'../../');
const helpersSource=fs.readFileSync(path.join(base,'js/teacher-register-helpers.js'),'utf8');
const portal=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const api=fs.readFileSync(path.join(base,'js/api-client.js'),'utf8');
const backend=fs.readFileSync(path.join(base,'backend-api/code.gs'),'utf8');
const context={window:{}};vm.createContext(context);vm.runInContext(helpersSource,context);
const h=context.window.LamaTeacherRegister;
const day='2026-11-17';
const students=[
 {id:'a',enrlNo:'1936',class:'1',name:'Shafiq',gender:'Male',fatherGuardian:'Guardian A',subjectsJson:'["English","Urdu","Mathematics"]'},
 {id:'b',enrlNo:'1716',class:'1',name:'Kinza',gender:'Female',fatherGuardian:'Guardian B'},
 {id:'c',enrlNo:'1700',class:'1',name:'Unnamed',gender:''}
];
const saved=[
 {id:'r1',studentId:'a',date:day,status:'Present'},
 {id:'r2',studentId:'b',date:day,status:'Absent'}
];
assert.equal(h.day(day+'T00:00:00.000Z'),day);
assert.equal(h.day('2026-11-16T22:30:00Z'),day,'Homework entered after midnight Pakistan time counts on the correct local day');
assert.equal(h.guardian(students[0]),'Guardian A');
assert.equal(h.countGender(students).boys,1);
assert.equal(h.countGender(students).girls,1);
assert.equal(h.countGender(students).unspecified,1);
const snapshot=h.snapshot(saved,students,day);
assert.equal(snapshot.unique.size,2);
assert.equal(snapshot.duplicates.size,0);
assert.equal(snapshot.unique.get('b').status,'Absent');
const totals=h.totals(students,snapshot,new Map([['a','Absent'],['c','Present']]));
assert.equal(totals.Students.total,3);
assert.equal(totals.Present.total,1);
assert.equal(totals.Present.unspecified,1);
assert.equal(totals.Absent.boys,1);
assert.equal(totals.Absent.girls,1);
assert.equal(totals.Unmarked.total,0);
const bad=h.snapshot([...saved,{id:'r3',studentId:'a',date:day,status:'Absent'}],students,day);
assert.equal(bad.duplicates.size,1,'Do not silently pick either conflicting saved mark');
assert.equal(bad.unique.has('a'),false);
assert.equal(h.snapshot([{id:'r',studentId:'unknown',enrlNo:'1936',date:day,status:'Present'}],students,day).unmatched.length,1,'Do not map foreign IDs by matching enrollment');
const homeworks=[
 {subject:'Mathematics',status:'published',isPublished:true,createdAt:day+'T11:00:00Z'},
 {subject:'English',status:'Draft',isPublished:false,createdAt:day+'T10:00:00Z'},
 {subject:'Urdu',status:'published',createdAt:'2026-11-16T11:00:00Z'},
 {subject:'Science',id:'HW-42',createdAt:day+'T10:00:00Z'}
];
const checklist=h.homeworkChecklist(students,homeworks,{subject:'English'},day);
assert.equal(checklist.find(x=>x.name==='Mathematics').done,true);
assert.equal(checklist.find(x=>x.name==='English').done,false,'Draft homework must not tick');
assert.equal(checklist.find(x=>x.name==='Urdu').done,false,'Yesterday’s homework must not tick today');
assert.equal(checklist.find(x=>x.name==='Science').done,true,'Persisted legacy homework without publication fields is a posted entry');
assert.match(portal,/id="statStudentsGender"/);
assert.match(portal,/id="statPresentGender"/);
assert.match(portal,/id="statAbsentGender"/);
assert.match(portal,/id="homeworkSubjectChecklist"/);
assert.match(portal,/id="verifyTeacherAttendance"/);
assert.match(portal,/Edit attendance/);
assert.match(portal,/TeacherRegister\.guardian\(student\)/);
assert.doesNotMatch(portal,/Attendance saved: '\+ok\+'\.\s*Failed: '\+fail/,'Old per-student optimistic save status removed');
assert.match(api,/action === 'bulkAttendance' && activeRole\(\) !== 'teacher'/,'Bulk action must use teacher role when active');
assert.match(backend,/if\(params\.role==='teacher'\)/,'Teacher bulk route must audit as teacher');
const inline=[...portal.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
assert.ok(inline.length);
for(const source of inline)new vm.Script(source,{filename:'teacher/index.html inline'});
new vm.Script(backend,{filename:'Apps Script code.gs'});
console.log('PASS: teacher helpers count boys/girls, detect duplicates, show guardian, tick only published homework by subject and parse full portal.');
