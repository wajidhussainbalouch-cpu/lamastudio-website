const assert=require('node:assert/strict');const store=require('./syllabus-store.js');
const plan={schoolId:'s1',sessionId:'2027',classId:'1',subjectId:'math',planId:'p1',status:'submitted',version:2,scheduled:[{date:'2027-03-01',slot:1,lessonId:'l1'}]};
const session={verified:true,actorId:'a1',schoolId:'s1',role:'school'};
const calls=[];let saved={...plan};
const deps={schoolId:'s1',planId:'p1',to:'approved',expectedVersion:2,session,
 loadEntitlements:async id=>{calls.push('entitlement');return {schoolId:id,examination:true};},
 withLock:async (school,id,fn)=>{calls.push('lock');const v=await fn();calls.push('unlock');return v;},
 readPlan:async()=>{calls.push('read');return saved;},
 commitPlanAndAudit:async p=>{calls.push('commit');saved=p.plan;return {schoolId:saved.schoolId,planId:saved.planId,version:saved.version};},
 now:()=> '2027-03-01T10:00:00Z'};
(async()=>{
 const r=await store.changeStatus(deps);
 assert.equal(r.status,'approved');assert.equal(r.version,3);
 assert.deepEqual(calls,['lock','read','entitlement','commit','unlock']);
 await assert.rejects(store.changeStatus(deps),/Version conflict/);
 await assert.rejects(store.changeStatus({...deps,schoolId:'s2'}),/Verified school session/);
 await assert.rejects(store.changeStatus({...deps,readPlan:async()=>({...plan,schoolId:'s2'})}),/Plan not found in school/);
 await assert.rejects(store.changeStatus({...deps,loadEntitlements:async()=>({schoolId:'s2',examination:true})}),/Trusted school entitlement/);
 await assert.rejects(store.changeStatus({...deps,readPlan:async()=>plan,commitPlanAndAudit:async()=>null}),/commit confirmation/);
 console.log('Syllabus storage orchestration tests passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
