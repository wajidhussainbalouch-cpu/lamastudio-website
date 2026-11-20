/* Run from the repository: node coding-academy/tests/practice.test.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(base,'practice.js'),'utf8');
const html=fs.readFileSync(path.join(base,'practice.html'),'utf8');
const academy=fs.readFileSync(path.join(base,'index.html'),'utf8');
const worker=fs.readFileSync(path.join(base,'sw.js'),'utf8');
new Function(source); // Syntax check.
const point=source.indexOf("for(const b of document.querySelectorAll('[data-track]'))");
assert.ok(point>0,'Fixture should locate the UI event wiring.');
const harness=source.slice(0,point).replace('(function(){','return (function(){')+'\nreturn {tracks,executeSql,datasets};\n})();';
const {tracks,executeSql,datasets}=new Function('localStorage','window',harness)(
  {getItem:()=>null,setItem:()=>{}},{addEventListener:()=>{}}
);
assert.deepEqual(Object.keys(tracks),['js','sql','python']);
assert.equal(Object.values(tracks).reduce((n,t)=>n+t.lessons.length,0),18);
const all=Object.values(tracks).flatMap(t=>t.lessons);
assert.equal(new Set(all.map(l=>l.id)).size,all.length,'Every challenge ID must be unique.');
assert.ok(html.includes('src="./practice.js"'));
assert.ok(academy.includes('href="./practice.html"'));
assert.ok(worker.includes("'./practice.html'")&&worker.includes("'./practice.js'"));
for(const l of tracks.sql.lessons){
  const target=executeSql(l.target),start=executeSql(l.starter);
  assert.ok(target.length,'Reference query should return a result.');
  assert.notDeepEqual(start,target,l.id+': starter must not solve its own challenge.');
}
for(const query of ['DROP TABLE students;','SELECT * FROM students; DELETE FROM students;', 'SELECT missing FROM students;']){
  assert.throws(()=>executeSql(query));
}
assert.equal(executeSql('SELECT COUNT(*) AS total FROM students WHERE class = 3;')[0].total,3);
assert.equal(executeSql("SELECT SUM(amount) AS total FROM fees WHERE status = 'paid';")[0].total,1850);
assert.equal(executeSql('SELECT item FROM inventory WHERE quantity < 10;').length,3);
const solutions={
  'js-fee':'function totalFee(monthly,months){return monthly*months;}',
  'js-attendance':'function attendanceRate(present,total){return total===0?0:Math.round(present/total*100);}',
  'js-passing':'function hasPassed(score){return score>=50;}',
  'js-stock':'function lowStock(items){return items.filter(x=>x.quantity<10).map(x=>x.name);}',
  'js-search':'function searchStudents(names,keyword){return names.filter(x=>x.toLowerCase().includes(keyword.toLowerCase()));}',
  'js-label':'function studentLabel(student){return student.name+" — Class "+student.className;}'
};
function testJs(code,expr){try{return new Function(code+'\nreturn Boolean(('+expr+'));')()===true;}catch(e){return false;}}
for(const l of tracks.js.lessons){
  assert.ok(l.tests.every(t=>testJs(solutions[l.id],t[1])),l.id+': reference solution must pass every test.');
  assert.ok(l.tests.some(t=>!testJs(l.starter,t[1])),l.id+': starter must not already pass.');
}
for(const l of tracks.python.lessons){
  const completed=l.starter+'\n'+l.hint;
  assert.ok(l.checks.every(([regex])=>regex.test(completed)),l.id+': starter plus hint should match learning patterns.');
  assert.ok(l.checks.some(([regex])=>!regex.test(l.starter)),l.id+': starter must not be marked complete.');
}
console.log('LAMA Coding Academy: 18 practice challenges, JavaScript reference solutions, SQL dataset queries, Python patterns, offline assets and starter gating: PASS');
