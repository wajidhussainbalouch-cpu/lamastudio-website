'use strict';
// Pure synthetic fixtures; no real student, school data, API calls or writing.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../../js/teacher-register-helpers.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(source,sandbox);
const helper=sandbox.window.LamaTeacherRegister;
const students=[
 {id:'s1',enrlNo:'2',name:'Rukhsana',fatherGuardian:'Father 1',class:'Playgroup',gender:'Female',photo:'https://school.example/photo1.jpg'},
 {id:'s2',enrlNo:'3',name:'Jabir',fatherGuardian:'Father 2',class:'Playgroup',gender:'Male',photo:'data:image/jpeg;base64,/9j/4AAQ'}
];
const saved=[
 {studentId:'s1',date:'2026-11-17',status:'Present'},
 {studentId:'s2',date:'2026-11-17',status:'Absent'}
];
const calendar=[
 {category:'planning-event',description:JSON.stringify({start:'2026-11-18',end:'2026-11-18',title:'School closure',type:'Holiday',published:true})},
 {category:'planning-event',description:JSON.stringify({start:'2026-11-20',end:'2026-11-20',title:'Draft holiday',type:'Holiday',published:false})},
 {category:'planning-event',description:JSON.stringify({start:'2026-11-21',end:'2026-11-21',title:'Sports day',type:'Sports Week',published:true})},
 {category:'planning-event',description:'malformed { data'}
];
const holidays=helper.calendarHolidays(calendar);
assert.equal(holidays.length,1);
assert.equal(holidays[0].title,'School closure');
const state=(date,records=[],overrides={})=>helper.calendarDayState(date,{
 students,records,today:'2026-11-25',verified:true,calendarReady:true,holidays,weeklyOff:[0],...overrides
});
assert.equal(state('2026-11-17',saved).state,'marked','Two saved class entries must be green');
assert.equal(state('2026-11-17',saved.slice(0,1)).state,'partial','A partially saved register is amber');
assert.equal(state('2026-11-17',[]).state,'unmarked','School day with no saved records is red');
assert.equal(state('2026-11-08',[]).state,'holiday','Sunday defaults to school holiday');
assert.equal(state('2026-11-07',[]).state,'unmarked','Saturday must not be assumed closed');
assert.equal(state('2026-11-07',[],{weeklyOff:[0,6]}).state,'holiday','Configured Saturday closure is gray');
assert.equal(state('2026-11-09',[]).state,'holiday','Iqbal Day 9 Nov appears gray when unmarked');
assert.match(state('2026-11-09',[]).holiday,/Iqbal/);
assert.equal(state('2026-11-09',saved.map(record=>({...record,date:'2026-11-09'}))).state,'marked','Saved school marks take priority over holiday highlighting');
assert.equal(state('2026-11-18',[]).state,'holiday','Published holiday from school calendar is gray');
assert.equal(state('2026-11-20',[]).state,'unmarked','Unpublished holiday must not close school');
assert.equal(state('2026-11-21',[]).state,'unmarked','Sports Week alone does not close school');
assert.equal(state('2026-11-26',[]).state,'future','Future days are neutral');
assert.equal(state('2026-11-17',saved,{verified:false}).state,'unavailable','Failed saved-register read cannot render false green or red');
assert.equal(state('2026-11-17',[],{calendarReady:false}).state,'unavailable','Failed holiday read cannot falsely label a day unmarked');
const duplicate=[...saved,{studentId:'s1',date:'2026-11-17',status:'Absent'}];
assert.equal(state('2026-11-17',duplicate).state,'partial','Duplicate conflict must be reviewed, not green');
const days=helper.monthDays('2026-11');
assert.equal(days.length,30);
assert.equal(days[8].date,'2026-11-09');
assert.equal(days[7].weekday,0);
assert.equal(days[6].weekday,6);
const start=html.indexOf('function safeStudentPhoto(student){'),end=html.indexOf('function calendarWeeklyOffDays(){',start);
assert.ok(start>=0&&end>start,'Teacher student photo helper missing');
const safePhoto=new Function(html.slice(start,end)+'return safeStudentPhoto;')();
assert.equal(safePhoto(students[0]),students[0].photo);
assert.equal(safePhoto(students[1]),students[1].photo);
assert.equal(safePhoto({photo:'javascript:alert(1)'}),'','Reject JavaScript URLs');
assert.equal(safePhoto({photo:'data:image/svg+xml,<svg onload=alert(1)>'}),'','Reject active SVG payload');
assert.equal(safePhoto({photo:'http://not-secure.example/a.jpg'}),'','Reject insecure sources');
for(const id of ['teacherAttendanceCalendar','teacherCalendarMonth','teacherCalendarPrev','teacherCalendarNext','teacherCalendarNote','statStudentsBoys','statStudentsGirls','statPresentBoys','statPresentGirls','statAbsentBoys','statAbsentGirls'])
 assert.match(html,new RegExp('id="'+id+'"'),'Missing teacher UI '+id);
assert.match(html,/class="att-photo"/);
assert.match(html,/TeacherRegister\.guardian\(student\)/);
assert.match(html,/class="att-save-badge/);
assert.match(html,/function selectTeacherAttendanceDate\(next\)/);
assert.match(html,/data-calendar-day/);
assert.match(html,/id="teacherAttendanceStats" class="attendance-day-stats"/);
assert.match(html,/Saturday remains a school day unless configured/);
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
for(const inline of scripts)new vm.Script(inline,{filename:'teacher/index.html inline'});
console.log('PASS: teacher photo validation, guardian, class boy/girl cards, calendar date actions and all saved/partial/unmarked/holiday/unverified states.');
