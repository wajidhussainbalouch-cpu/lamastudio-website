"use strict";
/**
 * Server-side read boundary for a school-scoped teacher review queue.
 * Adapters MUST be trusted server functions. Never accept actor or question
 * records from browser request data. No answers are included in output.
 */
const {buildReviewQueue}=require("./class2-islamiat-review-queue.cjs");
function createReviewReader({resolveActor,listSchoolDrafts,readSchoolHistory}={}){
 for(const [name,fn] of Object.entries({resolveActor,listSchoolDrafts,readSchoolHistory})){
  if(typeof fn!=="function")throw new TypeError(name+" must be a trusted backend function");
 }
 async function list({session,schoolId,page=1,pageSize=25,topic=null}={}){
  if(typeof schoolId!=="string"||!schoolId.trim())throw new Error("School ID required");
  const actor=await resolveActor(session);
  if(!actor||actor.authenticated!==true||!["teacher","school_admin"].includes(actor.role)||typeof actor.id!=="string"||!actor.id.trim()||actor.schoolId!==schoolId)throw new Error("Not authorized for this school");
  const questions=await listSchoolDrafts({schoolId,actorId:actor.id});
  if(!Array.isArray(questions)||questions.some(q=>!q||q.schoolId!==schoolId))throw new Error("Untrusted school question result");
  const queue=buildReviewQueue({questions,page,pageSize,topic});
  const items=[];
  for(const q of queue.items){
   const snapshot=await readSchoolHistory({schoolId,questionId:q.id});
   if(!snapshot||!Number.isSafeInteger(snapshot.version)||snapshot.version<0||
      !(snapshot.headHash===null||(typeof snapshot.headHash==="string"&&/^[a-f0-9]{64}$/.test(snapshot.headHash))))throw new Error("Invalid history snapshot");
   items.push({...q,historyVersion:snapshot.version,historyHeadHash:snapshot.headHash});
  }
  return {...queue,items};
 }
 return Object.freeze({list});
}
module.exports={createReviewReader};
