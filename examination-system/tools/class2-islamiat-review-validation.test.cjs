"use strict";
const assert=require("node:assert/strict");
const {validateReviewEvidence}=require("./class2-islamiat-review-validation.cjs");
const question={id:"C2-ISL-B1-0001"};
const good={textbookPage:3,sourceBasis:"pctb-page-verified",reviewedBy:"teacher-123",reviewedAt:"2026-11-09T07:00:00Z",verificationNote:"Compared with textbook page three.",answerChecked:true,ageAppropriate:true,duplicateChecked:true};
assert.equal(validateReviewEvidence(question,good).valid,true);
for(const bad of [
 {...good,textbookPage:0},
 {...good,textbookPage:49},
 {...good,sourceBasis:"unverified"},
 {...good,reviewedBy:""},
 {...good,reviewedAt:"not-a-date"},
 {...good,verificationNote:"short"},
 {...good,answerChecked:false},
 {...good,ageAppropriate:false},
 {...good,duplicateChecked:false}
])assert.equal(validateReviewEvidence(question,bad).valid,false);
assert.equal(validateReviewEvidence(question,null).valid,false);
console.log("Review evidence validation tests passed");
