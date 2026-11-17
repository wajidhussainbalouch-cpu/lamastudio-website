'use strict';
/* Public dashboard class-card -> authenticated student register navigation.
 * All data are synthetic. No backend, credentials or attendance writes. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const dash=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
const register=fs.readFileSync(path.join(root,'attendance/student-attendance-v2.html'),'utf8');
const redirect=fs.readFileSync(path.join(root,'attendance/student-attendance.html'),'utf8');
function section(source,start,end){
 const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing code section: '+start);
 return source.slice(a,b);
}
const nodes=new Map(),document={getElementById:id=>{
 if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});
 return nodes.get(id);
}};
const day='2026-11-12';
const dateOf=value=>String(value).slice(0,10);
const verifiedStudentDayRows=new Function('normalizeAttendanceDate',
 section(dash,'function verifiedStudentDayRows(attendance,students,day){',"\n        document.getElementById('studentAttClasses')")+'return verifiedStudentDayRows;')(dateOf);
const functions=new Function('document','localISODate','normalizeAttendanceDate','verifiedStudentDayRows',
  section(dash,'function classAttendanceUrl(','function renderFeeChart(')
  +'return {classAttendanceUrl,renderAttendanceChart};'
)(document,()=>day,dateOf,verifiedStudentDayRows);
assert.equal(functions.classAttendanceUrl('4',day),'attendance/student-attendance.html?class=4&date=2026-11-12');
const special='Nursery & A/B';
assert.equal(new URL(functions.classAttendanceUrl(special,day),'https://www.lamastudio.pk/lamastudio-school-suite/dashboard.html')
  .searchParams.get('class'),special);
const roster=[
 {id:'s1',class:'4',name:'Ali'},
 {id:'s2',class:'Playgroup',name:'Rukhsana'},
 {id:'s3',class:'Playgroup',name:'Jabir'}
];
functions.renderAttendanceChart([{studentId:'s1',date:day,status:'Absent'}],roster);
const cards=nodes.get('attendanceClassBars').innerHTML;
const urls=[...cards.matchAll(/<a class="attendance-kpi attendance-kpi-link" href="([^"]+)"/g)]
 .map(match=>new URL(match[1].replaceAll('&amp;','&'),'https://www.lamastudio.pk/lamastudio-school-suite/dashboard.html'));
assert.equal(urls.length,2,'Every class bar must be clickable');
assert.deepEqual(urls.map(url=>url.searchParams.get('class')),['4','Playgroup']);
assert.ok(urls.every(url=>url.searchParams.get('date')===day));
assert.match(cards,/Open this class attendance →/);
assert.match(cards,/aria-label="Open Class 4 attendance register for 2026-11-12"/);
assert.match(redirect,/window\.location\.search\+window\.location\.hash/,'Legacy redirect must retain parameters');

const requestHelper=new Function(section(register,'function readAttendanceRequest(search){','const attendanceRequest=')
 +'return readAttendanceRequest;')();
assert.deepEqual(requestHelper(urls[0].search),{className:'4',date:day});
assert.deepEqual(requestHelper('?class=Playgroup&date=2026-02-31'),{className:'Playgroup',date:''});
assert.deepEqual(requestHelper('?class=Nursery%20%26%20A%2FB&date=2026-11-12'),{className:special,date:day});
assert.match(register,/\$\('date'\)\.value=attendanceRequest\.date\|\|/,'Attendance day must be restored from URL');
assert.match(register,/function render\(\)\{enable\(\);[\s\S]*?\$\('classContext'\)\.textContent/,'Selected class must be shown on register');
const apply=section(register,"const previous=$('class').value;","$('progress').value=45;");
const options={
 _html:'',value:'',
 set innerHTML(value){this._html=value},
 get innerHTML(){return this._html},
 get options(){return [...this._html.matchAll(/<option value="([^"]*)"/g)].map(m=>({value:m[1]}))}
};
const fill=new Function('$','state','cls','escapeHtml','attendanceRequest','requestedClassPending',
 apply+'return requestedClassPending;'
);
const $=id=>{assert.equal(id,'class');return options};
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('"','&quot;');
const st={students:roster};
const requested=requestHelper(urls[0].search);
assert.equal(fill($,st,s=>s.class,esc,requested,true),false);
assert.equal(options.value,'4','Initial class selection must take effect after roster loads');
options.value='Playgroup';
fill($,st,s=>s.class,esc,requested,false);
assert.equal(options.value,'Playgroup','Refresh must preserve manually changed class');
options.value='';
fill($,st,s=>s.class,esc,{className:'Not enrolled',date:day},true);
assert.equal(options.value,'','Unknown class must not be selected');
assert.doesNotMatch(register,/window\.location\.search\s*=\s*/,'Register must not mutate browser URL');
console.log('PASS: class cards open the correct class/date; register restores class after roster load, preserves changes on refresh, validates dates and rejects nonexistent classes.');
