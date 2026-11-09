"use strict";
const assert=require("node:assert/strict");
const {createReviewService}=require("./class2-islamiat-review-service.cjs");
(async()=>{
 const question={id:"Q1",schoolId:"school-a",approved:false,onlineReady:false,reviewStatus:"draft"};
 const actor={id:"teacher-1",schoolId:"school-a",role:"teacher",authenticated:true};
 const review={textbookPage:2,sourceBasis:"pctb-page-verified",reviewedBy:"teacher-1",reviewedAt:"2026-11-09T07:00:00Z",verificationNote:"Verified against the referenced page.",answerChecked:true,ageAppropriate:true,duplicateChecked:true};
 let writes=0,identity=actor;
 const service=createReviewService({
  resolveActor:async()=>identity,
  loadQuestion:async()=>question,
  loadHistory:async()=>({version:0,headHash:null}),
  appendAtomically:async({event,expectedVersion,expectedHeadHash})=>{writes++;assert.equal(expectedVersion,0);assert.equal(expectedHeadHash,null);assert.equal(event.approved,false);return {stored:true};}
 });
 const args={session:"server-session",schoolId:"school-a",questionId:"Q1",review,decision:"recommend_approval",expectedVersion:0,expectedHeadHash:null,actor:{id:"attacker",role:"school_admin",authenticated:true}};
 assert.deepEqual(await service.submit(args),{stored:true});
 assert.equal(writes,1);
 identity={...actor,authenticated:false};
 await assert.rejects(()=>service.submit(args),/Not authorized/);
 identity=actor;
 await assert.rejects(()=>service.submit({...args,schoolId:"school-b"}),/Not authorized/);
 await assert.rejects(()=>service.submit({...args,expectedVersion:1}),/conflict/);
 await assert.rejects(()=>service.submit({...args,review:{...review,reviewedBy:"attacker"}}),/identity mismatch/);
 assert.equal(writes,1);
 assert.throws(()=>createReviewService({}),/trusted backend function/);
 console.log("Trusted review boundary tests passed (mock adapters only)");
})().catch(e=>{console.error(e);process.exitCode=1;});
