'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const sandbox={};vm.createContext(sandbox);
for(const name of ['syllabus-readonly-bridge.gs','syllabus-readonly-handler.gs'])
 vm.runInContext(fs.readFileSync(__dirname+'/'+name,'utf8'),sandbox);
const read=sandbox.LamaSyllabusReadonlyHandler.read;
const context={schoolId:'s1',actorId:'admin1',authenticated:true,examinationGranted:true,canViewSyllabus:true};
const plan={schoolId:'s1',planId:'p1',sessionId:'2026-27',classId:'5',subjectId:'English',status:'draft',version:1,scheduled:[{date:'2026-04-01',slot:2,lessonId:'L1',lessonTitle:'Reading'}]};
let calls=0;
const services={resolveSession:()=>context,loadScopedPlan:(school,id)=>{calls++;assert.equal(school,'s1');assert.equal(id,'p1');return plan}};
const view=read({planId:'p1'},services);
assert.equal(view.readOnly,true);assert.equal(view.schoolId,'s1');assert.equal(calls,1);
for(const field of ['authenticated','examinationGranted','canViewSyllabus']){
 calls=0;
 assert.throws(()=>read({planId:'p1'},{...services,resolveSession:()=>({...context,[field]:false})}),/Authenticated/);
 assert.equal(calls,0,'storage must not be read before authorization');
}
assert.throws(()=>read({planId:'p1',schoolId:'s2'},services),/Only a valid planId/);
assert.throws(()=>read({planId:'p1',actorId:'fake'},services),/Only a valid planId/);
assert.throws(()=>read({planId:'p1'},{...services,loadScopedPlan:()=>({...plan,schoolId:'s2'})}),/Cross-school/);
assert.throws(()=>read({planId:'p1'},{...services,loadScopedPlan:()=>null}),/not found/);
console.log('Apps Script read-only syllabus handler tests passed');
