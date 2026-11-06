'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const rows=[];let writes=0;
const sheet={
 getRange(r,c,n,m){return {getValues(){if(r===1)return [['schoolId','planId','lessonKey','status','completedAt','teacherId','updatedAt']];return rows.slice(r-2,r-2+n).map(x=>x.slice(c-1,c-1+m))},setValues(values){writes++;if(r>1)values.forEach((v,i)=>rows[r-2+i]=v)},setValue(v){throw Error('Unexpected write')}}},
 getLastRow(){return rows.length+1},setFrozenRows(){}
};
let exists=false,created=0;
const context={
 SpreadsheetApp:{openById(){return {getSheetByName(){return exists?sheet:null},insertSheet(){created++;exists=true;return sheet}}},flush(){}},
 LockService:{getScriptLock(){return {tryLock(){return true},releaseLock(){}}}},
 Date
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../lamastudio-school-suite/backend-api/syllabus-progress-store.gs'),'utf8'),context);
const store=context.LamaSyllabusProgressStore;
const plan={planId:'p1',status:'published',scheduled:[{date:'2026-11-01',slot:1,chapterId:'c1',lessonId:'l1'}]};
const key='2026-11-01|1|c1|l1|';
assert.equal(store.list('book','school','p1').length,0);
assert.equal(created,0,'Read must not create sheet');
assert.throws(()=>store.save('book','school',plan,'t1',key,'completed','2026-13-99'),/Invalid completion date/);
assert.equal(created,0);
store.save('book','school',plan,'t1',key,'completed','2026-11-01');
assert.equal(created,1);
assert.equal(store.list('book','other','p1').length,0);
assert.equal(store.list('book','school','p1').length,1);
assert.throws(()=>store.save('book','school',plan,'t2',key,'pending',''),/another teacher/);
assert.equal(writes,2,'Only initial header and authorized progress write');
console.log('Progress store isolation and ownership tests passed');
