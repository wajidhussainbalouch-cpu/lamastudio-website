'use strict';
// Synthetic failed API responses; never calls any actual school backend.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'dashboard.html'),'utf8');
const take=(first,last)=>{
 const a=html.indexOf(first),b=html.indexOf(last,a+first.length);
 assert.ok(a>=0&&b>a,'Missing function '+first);
 return html.slice(a,b);
};
const nodes=new Map(),get=id=>{
 if(!nodes.has(id))nodes.set(id,{textContent:'stale',innerText:'stale',innerHTML:'stale',style:{width:'100%'},classList:{toggle(){}}});
 return nodes.get(id);
};
let destroyed=false;
const ctx={
 document:{getElementById:get},
 console:{warn(){},error(){}},
 LamaAPI:{list:async key=>{
   if(key==='attendance')throw Error('Cloud API unavailable');
   if(key==='teacherAttendance')return {unexpected:'response'};
   return [{id:'dummy'}];
 }},
 destroyChart(name){assert.equal(name,'teacherAttendance');destroyed=true;},
 normalizeAttendanceDate:val=>String(val).slice(0,10),
 localISODate:()=> '2026-11-14',
 esc:String
};
vm.createContext(ctx);
vm.runInContext(
 take('async function safeList(key,failures){','function handleLogout()')+
 take('function renderStudentAttendanceUnavailable(){','function verifiedStudentDayRows(attendance,students,day){')+
 take('function verifiedStudentDayRows(attendance,students,day){',"\n        document.getElementById('studentAttClasses')")+
 take('function renderEngineRows(d,failures=new Set()){','function normalizeDashboardClass(value){'),
 ctx
);
(async()=>{
 const errors=new Set();
 const attendance=await ctx.safeList('attendance',errors);
 const teacherAttendance=await ctx.safeList('teacherAttendance',errors);
 const students=await ctx.safeList('students',errors);
 assert.equal(attendance.length,0);
 assert.equal(teacherAttendance.length,0);
 assert.equal(students.length,1);
 assert.equal(errors.has('attendance'),true,'Failed read must be tracked');
 assert.equal(errors.has('teacherAttendance'),true,'Malformed read must be tracked');
 assert.equal(errors.has('students'),false);
 ctx.renderStudentAttendanceUnavailable();
 ctx.renderTeacherAttendanceUnavailable();
 for(const key of ['studentAttEnrolled','studentAttPresent','studentAttAbsent','studentAttRate','studentAttCompletion','teacherAttDisplay','taTotal','taPresent'])
   assert.equal(get(key).textContent,'—','Never show stale/false zero count for '+key);
 assert.equal(get('taProgress').style.width,'0%');
 assert.match(get('studentAttHint').textContent,/could not be loaded/);
 assert.match(get('taPending').textContent,/could not be loaded/);
 assert.match(get('dashboardAbsentFollowup').textContent,/unavailable/);
 assert.match(get('dashboardStaffFollowup').textContent,/unavailable/);
 assert.equal(destroyed,true,'An old staff chart must be removed');
 ctx.renderEngineRows({students:[{id:'s1'}],teachers:[{id:'t1'}],attendance:[],fees:[],tests:[],notifications:[]},errors);
 const engine=get('engineRows').innerHTML;
 assert.match(engine,/Attendance today/);
 assert.match(engine,/—/);
 assert.doesNotMatch(html,/await renderDashboard\(\);b\.innerText='online'/,'Refresh cannot override partial sync as online');
 console.log('PASS: API errors do not fabricate zero attendance or retain stale verified cards.');
})().catch(error=>{console.error(error);process.exitCode=1});
