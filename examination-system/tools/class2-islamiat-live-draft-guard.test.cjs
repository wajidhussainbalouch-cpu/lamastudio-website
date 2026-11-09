"use strict";
/**
 * Integration safety test against real repository drafts.
 * Confirms no Class 2 Islamiat draft can enter the approved-only paper selector.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {normalizeDraftBatch}=require("./class2-islamiat-draft-adapter.cjs");
const {selectPaper}=require("./class2-islamiat-paper-selector.cjs");
const {families}=require("./class2-islamiat-concept-families.cjs");
const dataDir=path.join(__dirname,"../data");
const questions=[];
for(let batch=1;batch<=3;batch++){
 const raw=JSON.parse(fs.readFileSync(path.join(dataDir,`class2-islamiat-batch${batch}-500-draft.json`),"utf8"));
 questions.push(...normalizeDraftBatch(raw));
}
assert.equal(questions.length,1500);
assert.equal(families.length,300);
assert.equal(new Set(questions.map(q=>q.id)).size,1500);
assert.ok(questions.every(q=>q.approved===false&&q.onlineReady===false&&q.requiresTeacherReview===true));
assert.throws(()=>selectPaper({questions,familyIndex:families,count:1}),/Insufficient eligible distinct concept families/);
console.log("PASS: all 1500 real drafts are excluded from student paper selection");
