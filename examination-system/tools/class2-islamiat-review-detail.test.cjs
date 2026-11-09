"use strict";
const assert=require("node:assert/strict");
const {createReviewDetail}=require("./class2-islamiat-review-detail.cjs");
(async()=>{
 const actor={id:"teacher-1",schoolId:"school-a",role:"teacher",authenticated:true};
 let current=actor,loads=0;
 const question={id:"Q1",schoolId:"school-a",topic:"Faith",type:"short_answer",prompt:"Question?",expectedAnswer:"Correct answer",approved:false,onlineReady:false,reviewStatus:"draft"};
 const service=createReviewDetail({
  resolveActor:async()=>current,
  loadSchoolDraft:async()=>{loads++;return question;},
  readSchoolHistory:async()=>({version:0,headHash:null})
 });
 const args={session:"trusted-session",schoolId:"school-a",questionId:"Q1",actor:{id:"spoofed"}};
 const result=await service.get(args);
 assert.equal(result.expectedAnswer,"Correct answer");
 assert.equal(result.approved,false);
 assert.equal(result.historyVersion,0);
 current={...actor,authenticated:false};
 await assert.rejects(()=>service.get(args),/Not authorized/);
 assert.equal(loads,1);
 current={...actor,role:"student"};
 await assert.rejects(()=>service.get(args),/Not authorized/);
 current=actor;
 await assert.rejects(()=>service.get({...args,schoolId:"school-b"}),/Not authorized/);
 const crossSchool=createReviewDetail({resolveActor:async()=>actor,loadSchoolDraft:async()=>({...question,schoolId:"school-b"}),readSchoolHistory:async()=>({version:0,headHash:null})});
 await assert.rejects(()=>crossSchool.get(args),/Draft not found/);
 const approved=createReviewDetail({resolveActor:async()=>actor,loadSchoolDraft:async()=>({...question,approved:true}),readSchoolHistory:async()=>({version:0,headHash:null})});
 await assert.rejects(()=>approved.get(args),/Draft not found/);
 assert.throws(()=>createReviewDetail({}),/trusted backend/);
 console.log("Teacher-only review detail boundary tests passed (mock adapters)");
})().catch(e=>{console.error(e);process.exitCode=1;});
