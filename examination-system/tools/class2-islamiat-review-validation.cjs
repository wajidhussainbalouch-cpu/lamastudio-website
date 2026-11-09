"use strict";
/**
 * Pure validation for a trusted server-side review workflow.
 * No authentication, persistence, or publishing occurs in this module.
 */
const MAX_PDF_PAGE=48;
function validateReviewEvidence(question,review){
 const errors=[];
 if(!question||typeof question!=="object"||!question.id)errors.push("Missing question");
 if(!review||typeof review!=="object"||Array.isArray(review))return {valid:false,errors:[...errors,"Missing review"]};
 if(!Number.isInteger(review.textbookPage)||review.textbookPage<1||review.textbookPage>MAX_PDF_PAGE)errors.push("Textbook page outside 1..48");
 if(review.sourceBasis!=="pctb-page-verified")errors.push("Textbook page must be verified");
 if(typeof review.reviewedBy!=="string"||!review.reviewedBy.trim())errors.push("Reviewer identifier required");
 if(typeof review.reviewedAt!=="string"||!/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$/.test(review.reviewedAt)||!Number.isFinite(Date.parse(review.reviewedAt)))errors.push("Valid UTC review timestamp required");
 if(typeof review.verificationNote!=="string"||review.verificationNote.trim().length<15)errors.push("Meaningful verification note required");
 if(review.answerChecked!==true)errors.push("Answer must be checked");
 if(review.ageAppropriate!==true)errors.push("Age suitability must be checked");
 if(review.duplicateChecked!==true)errors.push("Duplicate review required");
 return {valid:errors.length===0,errors};
}
module.exports={validateReviewEvidence,MAX_PDF_PAGE};
