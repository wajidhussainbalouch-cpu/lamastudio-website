"use strict";
/**
 * Offline review decision preparation only.
 * The caller MUST authenticate and authorize the actor on a trusted server,
 * persist an append-only audit event, and enforce school tenant isolation.
 * This function never publishes or changes question approval flags.
 */
const {validateReviewEvidence}=require("./class2-islamiat-review-validation.cjs");
function prepareReviewDecision({question,review,actor,schoolId,decision}){
 if(!question||typeof question!=="object"||typeof question.id!=="string"||!question.id.trim())throw new Error("Question ID required");
 if(question.approved!==false||question.onlineReady!==false||question.reviewStatus!=="draft")throw new Error("Only draft questions may be reviewed");
 if(typeof schoolId!=="string"||!schoolId.trim())throw new Error("School ID required");
 if(!actor||actor.authenticated!==true||!["teacher","school_admin"].includes(actor.role)||typeof actor.id!=="string"||!actor.id.trim()||actor.schoolId!==schoolId)throw new Error("Authorized same-school reviewer required");
 if(question.schoolId!==schoolId)throw new Error("Question school mismatch");
 if(!["request_changes","recommend_approval"].includes(decision))throw new Error("Unsupported review decision");
 if(!review||review.reviewedBy!==actor.id)throw new Error("Review identity mismatch");
 const evidence=validateReviewEvidence(question,review);
 if(decision==="recommend_approval"&&!evidence.valid)throw new Error("Review evidence incomplete: "+evidence.errors.join("; "));
 if(decision==="request_changes"&&(!review||typeof review.verificationNote!=="string"||review.verificationNote.trim().length<15))throw new Error("Change request requires a meaningful note");
 return Object.freeze({
  eventType:"islamiat_review_recommendation",
  questionId:question.id,
  schoolId,
  actorId:actor.id,
  decision,
  reviewedAt:review.reviewedAt,
  textbookPage:decision==="recommend_approval"?review.textbookPage:null,
  verificationNote:review.verificationNote.trim(),
  evidenceValid:evidence.valid,
  // A recommendation is not approval: a separate trusted publishing service is required.
  approved:false,
  onlineReady:false
 });
}
module.exports={prepareReviewDecision};
