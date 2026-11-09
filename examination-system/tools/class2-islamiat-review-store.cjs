"use strict";
/**
 * In-memory simulation of a compare-and-swap review-history store.
 * For tests/prototyping ONLY. NOT durable storage, not a production endpoint.
 * The trusted server must authenticate actor and replace this with an atomic
 * transaction enforcing school tenancy, unique event sequence and protected head.
 */
const {appendReviewEvent,verifyReviewHistory}=require("./class2-islamiat-review-audit.cjs");
function createReviewStore(){
 const records=new Map();
 const key=(schoolId,questionId)=>JSON.stringify([schoolId,questionId]);
 function read({schoolId,questionId}){
  if(typeof schoolId!=="string"||!schoolId||typeof questionId!=="string"||!questionId)throw new Error("School and question IDs required");
  const history=records.get(key(schoolId,questionId))||[];
  return {version:history.length,headHash:history.length?history[history.length-1].hash:null,history:structuredClone(history)};
 }
 function append({expectedVersion,expectedHeadHash,question,schoolId,review,actor,decision}){
  if(!question||typeof question.id!=="string")throw new Error("Question ID required");
  const current=read({schoolId,questionId:question.id});
  if(!Number.isSafeInteger(expectedVersion)||expectedVersion<0||expectedVersion!==current.version||
     expectedHeadHash!==current.headHash)throw new Error("Review history conflict: reload and retry");
  const next=appendReviewEvent({history:current.history,question,schoolId,review,actor,decision});
  if(!verifyReviewHistory(next))throw new Error("Review history integrity failure");
  records.set(key(schoolId,question.id),structuredClone(next));
  return read({schoolId,questionId:question.id});
 }
 return Object.freeze({read,append});
}
module.exports={createReviewStore};
