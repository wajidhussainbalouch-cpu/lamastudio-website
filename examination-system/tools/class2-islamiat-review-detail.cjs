"use strict";
/**
 * Teacher-only detail boundary. Answer key is deliberately available here for
 * editorial verification, but NEVER through the student-facing question API.
 * Requires trusted server-side identity and school-scoped data adapters.
 */
function createReviewDetail({resolveActor,loadSchoolDraft,readSchoolHistory}={}){
 for(const [name,fn] of Object.entries({resolveActor,loadSchoolDraft,readSchoolHistory})){
  if(typeof fn!=="function")throw new TypeError(name+" must be a trusted backend function");
 }
 async function get({session,schoolId,questionId}={}){
  if(typeof schoolId!=="string"||!schoolId.trim()||typeof questionId!=="string"||!questionId.trim())throw new Error("School and question IDs required");
  const actor=await resolveActor(session);
  if(!actor||actor.authenticated!==true||!["teacher","school_admin"].includes(actor.role)||actor.schoolId!==schoolId||typeof actor.id!=="string"||!actor.id.trim())throw new Error("Not authorized for this school");
  const q=await loadSchoolDraft({schoolId,questionId});
  if(!q||q.schoolId!==schoolId||q.id!==questionId||q.approved!==false||q.onlineReady!==false||q.reviewStatus!=="draft")throw new Error("Draft not found in school");
  const snapshot=await readSchoolHistory({schoolId,questionId});
  if(!snapshot||!Number.isSafeInteger(snapshot.version)||snapshot.version<0||
    !(snapshot.headHash===null||(typeof snapshot.headHash==="string"&&/^[a-f0-9]{64}$/.test(snapshot.headHash))))throw new Error("Invalid history snapshot");
  return Object.freeze({
   id:q.id,schoolId,topic:q.topic||"Unmapped",type:q.type||"unknown",
   prompt:q.prompt||"",expectedAnswer:q.expectedAnswer||"",
   textbookPage:Number.isInteger(q.textbookPage)?q.textbookPage:null,
   sourceBasis:q.sourceBasis||"unverified",
   reviewStatus:"draft",approved:false,onlineReady:false,
   historyVersion:snapshot.version,historyHeadHash:snapshot.headHash
  });
 }
 return Object.freeze({get});
}
module.exports={createReviewDetail};
