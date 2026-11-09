"use strict";
const assert=require("node:assert/strict");
const {families,report}=require("./class2-islamiat-concept-families.cjs");
assert.equal(report.records,1500);
assert.equal(report.families,300);
assert.equal(report.issues.length,0);
assert.equal(new Set(families.flatMap(f=>f.questionIds)).size,1500);
assert.ok(families.every(f=>f.questionIds.length===5&&f.teacherReviewRequired));
console.log("Concept-family checks passed");
