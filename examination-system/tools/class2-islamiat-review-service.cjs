"use strict";
/**
 * Backend integration boundary, NOT an HTTP endpoint.
 * Caller must supply trusted, server-side identity resolution and durable,
 * atomic review-history repository. Never accept actor from request body.
 * No publishing or approval is performed.
 */
const {prepareReviewDecision}=require("./class2-islamiat-review-decision.cjs");
function createReviewService({resolveActor,loadQuestion,loadHistory,appendAtomically}={}){
 for(const [name,fn] of Object.entries({resolveActor,loadQuestion,loadHistory,appendAtomically})){
  if(typeof fn!=="function")throw new TypeError(name+" must be a trusted backend function");
 }
 async function submit({session,schoolId,questionId,review,decision,expectedVersion,expectedHeadHash}={}){
  if(typeof schoolId!=="string"||!schoolId.trim()||typeof questionId!=="string"||!questionId.trim())throw new Error("School and question IDs required");
  if(!Number.isSafeInteger(expectedVersion)||expectedVersion<0)throw new Error("Expected version required");
  if(expectedHeadHash!==null&&!(typeof expectedHeadHash==="string"&&/^[a-f0-9]{64}$/.test(expectedHeadHash)))throw new Error("Expected head hash invalid");
  const actor=await resolveActor(session);
  if(!actor||actor.authenticated!==true||!["teacher","school_admin"].includes(actor.role)||actor.schoolId!==schoolId||!actor.id)throw new Error("Not authorized for this school");
  const question=await loadQuestion({schoolId,questionId});
  if(!question||question.id!==questionId||question.schoolId!==schoolId)throw new Error("Question not found in school");
  const event=prepareReviewDecision({question,review,actor,schoolId,decision});
  // loadHistory is advisory; appendAtomically MUST check version and head in a transaction.
  const snapshot=await loadHistory({schoolId,questionId});
  if(!snapshot||snapshot.version!==expectedVersion||snapshot.headHash!==expectedHeadHash)throw new Error("Review history conflict");
  return appendAtomically({schoolId,questionId,event,expectedVersion,expectedHeadHash});
 }
 return Object.freeze({submit});
}
module.exports={createReviewService};
