"use strict";
const assert=require("node:assert/strict");
const {createReviewReader}=require("./class2-islamiat-review-reader.cjs");
(async()=>{
 const actor={id:"teacher-1",schoolId:"school-a",role:"teacher",authenticated:true};
 let current=actor,reads=0;
 const question={id:"Q1",schoolId:"school-a",topic:"Faith",type:"short_answer",prompt:"Draft prompt",expectedAnswer:"secret",approved:false,onlineReady:false,reviewStatus:"draft"};
 const reader=createReviewReader({
  resolveActor:async()=>current,
  listSchoolDrafts:async()=>[question],
  readSchoolHistory:async()=>{reads++;return {version:0,headHash:null};}
 });
 const result=await reader.list({session:"session",schoolId:"school-a",page:1});
 assert.equal(result.total,1);
 assert.equal(result.items[0].historyVersion,0);
 assert.equal(result.items[0].historyHeadHash,null);
 assert.equal("expectedAnswer" in result.items[0],false);
 assert.equal(reads,1);
 current={...actor,authenticated:false};
 await assert.rejects(()=>reader.list({schoolId:"school-a"}),/Not authorized/);
 current=actor;
 await assert.rejects(()=>reader.list({schoolId:"school-b"}),/Not authorized/);
 const leaking=createReviewReader({resolveActor:async()=>actor,listSchoolDrafts:async()=>[{...question,schoolId:"school-b"}],readSchoolHistory:async()=>({version:0,headHash:null})});
 await assert.rejects(()=>leaking.list({schoolId:"school-a"}),/Untrusted school/);
 assert.throws(()=>createReviewReader({}),/trusted backend/);
 console.log("School review read boundary tests passed (mock adapters)");
})().catch(e=>{console.error(e);process.exitCode=1;});
