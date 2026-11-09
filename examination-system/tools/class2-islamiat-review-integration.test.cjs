"use strict";
/** End-to-end contract test using mock trusted adapters; no real auth or database. */
const assert=require("node:assert/strict");
const {createReviewReader}=require("./class2-islamiat-review-reader.cjs");
const {createReviewDetail}=require("./class2-islamiat-review-detail.cjs");
const {createReviewService}=require("./class2-islamiat-review-service.cjs");
const {createReviewStore}=require("./class2-islamiat-review-store.cjs");
(async()=>{
 const store=createReviewStore();
 const question={id:"Q1",schoolId:"school-a",topic:"Faith",type:"short_answer",prompt:"Question?",expectedAnswer:"Answer",approved:false,onlineReady:false,reviewStatus:"draft"};
 const sessions=new Map([["teacher-session",{id:"teacher-1",schoolId:"school-a",role:"teacher",authenticated:true}],["student-session",{id:"student-1",schoolId:"school-a",role:"student",authenticated:true}]]);
 const resolveActor=async session=>sessions.get(session)||null;
 const readSchoolHistory=async({schoolId,questionId})=>store.read({schoolId,questionId});
 const reader=createReviewReader({resolveActor,listSchoolDrafts:async({schoolId})=>schoolId==="school-a"?[question]:[],readSchoolHistory});
 const detail=createReviewDetail({resolveActor,loadSchoolDraft:async({schoolId,questionId})=>schoolId==="school-a"&&questionId==="Q1"?question:null,readSchoolHistory});
 const service=createReviewService({
  resolveActor,serverNow:()=>new Date("2026-11-09T10:00:00Z"),
  loadQuestion:async({schoolId,questionId})=>schoolId==="school-a"&&questionId==="Q1"?question:null,
  loadHistory:readSchoolHistory,
  appendAtomically:async({schoolId,questionId,event,expectedVersion,expectedHeadHash})=>{
   // Mock adapter checks CAS and reconstructs a review event using server-derived identity.
   const actor=sessions.get("teacher-session");
   const review={reviewedBy:actor.id,reviewedAt:event.reviewedAt,textbookPage:event.textbookPage,sourceBasis:"pctb-page-verified",verificationNote:event.verificationNote,answerChecked:true,ageAppropriate:true,duplicateChecked:true};
   return store.append({schoolId,question,actor,review,decision:event.decision,expectedVersion,expectedHeadHash});
  }
 });
 const queue=await reader.list({session:"teacher-session",schoolId:"school-a"});
 assert.equal(queue.total,1);
 assert.equal("expectedAnswer" in queue.items[0],false);
 const selected=await detail.get({session:"teacher-session",schoolId:"school-a",questionId:"Q1"});
 assert.equal(selected.expectedAnswer,"Answer");
 await assert.rejects(()=>detail.get({session:"student-session",schoolId:"school-a",questionId:"Q1"}),/Not authorized/);
 const review={textbookPage:2,sourceBasis:"pctb-page-verified",verificationNote:"Teacher checked the supplied textbook page.",answerChecked:true,ageAppropriate:true,duplicateChecked:true};
 const submitted=await service.submit({session:"teacher-session",schoolId:"school-a",questionId:"Q1",review,decision:"recommend_approval",expectedVersion:selected.historyVersion,expectedHeadHash:selected.historyHeadHash});
 assert.equal(submitted.version,1);
 assert.equal(submitted.history[0].approved,false);
 assert.equal(submitted.history[0].reviewedAt,"2026-11-09T10:00:00.000Z");
 await assert.rejects(()=>service.submit({session:"teacher-session",schoolId:"school-a",questionId:"Q1",review,decision:"recommend_approval",expectedVersion:0,expectedHeadHash:null}),/conflict/);
 assert.equal((await reader.list({session:"teacher-session",schoolId:"school-a"})).items[0].historyVersion,1);
 assert.equal(store.read({schoolId:"school-b",questionId:"Q1"}).version,0);
 console.log("Mock review read/detail/submit/history integration passed");
})().catch(err=>{console.error(err);process.exitCode=1;});
