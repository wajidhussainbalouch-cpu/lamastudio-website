'use strict';
/** Verify that selecting a class scopes every visible attendance operation.
 * Uses synthetic students. Never reads or writes a live register. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'attendance/student-attendance-v2.html'),'utf8');
const start=src.indexOf('function classStudents(){');
const end=src.indexOf("$('followup').addEventListener",start);
assert.ok(start>=0&&end>start,'Cannot find class-scoped student register functions');
const dom=new Map();
const $=key=>{
 if(!dom.has(key))dom.set(key,{value:'',textContent:'',innerHTML:'',disabled:false});
 return dom.get(key);
};
$('date').value='2026-11-12';
const students=[
 {id:'s1',name:'Ali',enrlNo:'1',class:'4',fatherName:'Rehman'},
 {id:'s2',name:'Rukhsana',enrlNo:'2',class:'Playgroup'},
 {id:'s3',name:'Jabir',enrlNo:'3',class:'Playgroup'}
];
const state={students,chosen:new Map([
 ['s1',{status:'Absent'}],['s2',{status:'Present'}],['s3',{status:'Leave'}]
]),dirty:new Set(),rosterReady:true,historyReady:true,
 loadedDate:'2026-11-12',loading:false,saving:false};
const cls=s=>String(s.class);
const id=s=>String(s.id);
const enr=s=>String(s.enrlNo);
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=new Function('$','state','cls','id','enr','escapeHtml','recentAttendance','qrSaving','portalPublishing',
 src.slice(start,end)+'return {classStudents,visible,render};'
)($,state,cls,id,enr,escapeHtml,()=>'No previous records',false,false);
function checks(c,expected){
 $('class').value=c;$('search').value='';$('filter').value='';
 f.render();
 const html=$('summary').innerHTML;
 const extract=label=>Number(html.match(new RegExp('>'+label+'<\\/div><h2>(\\d+)<\\/h2>'))?.[1]);
 assert.equal(extract('Students'),expected.total);
 assert.equal(extract('Present'),expected.present);
 assert.equal(extract('Absent'),expected.absent);
 assert.equal(extract('Leave'),expected.leave);
 assert.equal(extract('Unmarked'),expected.unmarked);
 assert.equal(f.classStudents().length,expected.total);
 assert.equal(f.visible().length,expected.total);
 assert.equal(( $('list').innerHTML.match(/<div class="student">/g)||[]).length,expected.total);
 assert.equal(( $('coverage').innerHTML.match(/<p><strong>/g)||[]).length,expected.classes);
 for(const name of expected.names)assert.match($('list').innerHTML,new RegExp(name));
 for(const name of expected.excluded)assert.doesNotMatch($('list').innerHTML,new RegExp(name));
 for(const name of expected.followup)assert.match($('followup').innerHTML,new RegExp(name));
 for(const name of expected.noFollowup)assert.doesNotMatch($('followup').innerHTML,new RegExp(name));
 if(c)assert.match($('classContext').textContent,/only/);
 assert.equal(state.students.length,3,'Class filter must not delete/mutate school roster');
}
checks('4',{total:1,present:0,absent:1,leave:0,unmarked:0,classes:1,
 names:['Ali'],excluded:['Rukhsana','Jabir'],followup:['Ali'],noFollowup:['Jabir']});
checks('Playgroup',{total:2,present:1,absent:0,leave:1,unmarked:0,classes:1,
 names:['Rukhsana','Jabir'],excluded:['Ali'],followup:['Jabir'],noFollowup:['Ali']});
checks('',{total:3,present:1,absent:1,leave:1,unmarked:0,classes:2,
 names:['Ali','Rukhsana','Jabir'],excluded:[],followup:['Ali','Jabir'],noFollowup:[]});
assert.match(src,/const recipients=classStudents\(\)\.filter\(student=>\[/,
 'Bulk parent notices must not include other classes');
assert.match(src,/if\(\$\('class'\)\.value&&cls\(student\)!==\$\('class'\)\.value\)/,
 'QR scan should reject a student from another selected class');
console.log('PASS: Class 4 lists only Ali and class-only totals; Playgroup lists only Rukhsana/Jabir; follow-ups, bulk notices, coverage and QR are scoped. All classes restores school view.');
