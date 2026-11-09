"use strict";
/**
 * Pure append-only review event builder / chain verifier.
 * Trusted server must supply authenticated actor, persist atomically,
 * and protect the audit head and events from modification.
 */
const crypto=require("node:crypto");
const {prepareReviewDecision}=require("./class2-islamiat-review-decision.cjs");
function digest(value){return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");}
function appendReviewEvent({history,question,review,actor,schoolId,decision}){
 if(!Array.isArray(history))throw new TypeError("History must be an array");
 if(!verifyReviewHistory(history))throw new Error("Invalid existing review history");
 const prepared=prepareReviewDecision({question,review,actor,schoolId,decision});
 if(history.some(e=>e.schoolId!==schoolId||e.questionId!==question.id))throw new Error("History belongs to another school or question");
 const previousHash=history.length?history[history.length-1].hash:null;
 const record={sequence:history.length+1,previousHash,...prepared};
 const event=Object.freeze({...record,hash:digest(record)});
 return Object.freeze([...history,event]);
}
function verifyReviewHistory(history){
 if(!Array.isArray(history))return false;
 let previousHash=null,schoolId=null,questionId=null;
 for(let i=0;i<history.length;i++){
  const event=history[i];
  if(!event||typeof event!=="object"||Array.isArray(event))return false;
  const {hash,...record}=event;
  if(typeof hash!=="string"||!/^[a-f0-9]{64}$/.test(hash)||hash!==digest(record))return false;
  if(event.sequence!==i+1||event.previousHash!==previousHash||event.eventType!=="islamiat_review_decision")return false;
  if(i===0){schoolId=event.schoolId;questionId=event.questionId;}
  if(!schoolId||!questionId||event.schoolId!==schoolId||event.questionId!==questionId)return false;
  previousHash=hash;
 }
 return true;
}
module.exports={appendReviewEvent,verifyReviewHistory};
