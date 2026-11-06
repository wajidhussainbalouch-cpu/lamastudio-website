'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const header=['schoolId','planId','lessonKey','status','completedAt','teacherId','updatedAt'];
const progress=[header.slice(),['school','p','2026-11-01|1||l1|','completed','2026-11-01','old','time']];
const audit=[];
function mockSheet(rows){return {
 getLastRow(){return rows.length},setFrozenRows(){},
 getRange(r,c,n,m){return {
  getValues(){return rows.slice(r-1,r-1+n).map(x=>x.slice(c-1,c-1+m))},
  setValues(v){v.forEach((x,i)=>{if(c===1)rows[r-1+i]=x.slice();else rows[r-1+i][c-1]=x[0]})}
 }}
}}
const sheets={'_LAMA_SYLLABUS_PROGRESS':mockSheet(progress)};
const context={SpreadsheetApp:{openById(){return {
 getSheetByName(n){return sheets[n]||null},
 insertSheet(n){const data=n==='_LAMA_SYLLABUS_TRANSFERS'?audit:[];sheets[n]=mockSheet(data);return sheets[n]}
 }},flush(){}},LockService:{getScriptLock(){return {tryLock(){return true},releaseLock(){}}}},Date};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../lamastudio-school-suite/backend-api/syllabus-progress-store.gs'),'utf8'),context);
const store=context.LamaSyllabusProgressStore;
assert.throws(()=>store.reassign('book','school','p','old','new','admin','short'),/reason/);
assert.equal(progress[1][5],'old');
const result=store.reassign('book','school','p','old','new','admin','Teacher reassigned');
assert.equal(result.transferred,1);
assert.equal(progress[1][5],'new');
assert.equal(progress[1][3],'completed');
assert.equal(audit.length,2);
assert.equal(audit[1][4],'admin');
assert.throws(()=>store.reassign('book','school','p','old','new','admin','Teacher reassigned'),/No progress/);
console.log('Teacher progress reassignment tests passed');
