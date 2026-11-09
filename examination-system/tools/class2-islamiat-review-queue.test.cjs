"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {normalizeDraftBatch}=require("./class2-islamiat-draft-adapter.cjs");
const {buildReviewQueue}=require("./class2-islamiat-review-queue.cjs");
const all=[];
for(let i=1;i<=3;i++){
 const batch=JSON.parse(fs.readFileSync(path.join(__dirname,`../data/class2-islamiat-batch${i}-500-draft.json`),"utf8"));
 all.push(...normalizeDraftBatch(batch));
}
const first=buildReviewQueue({questions:all,page:1,pageSize:25});
assert.equal(first.total,1500);
assert.equal(first.pages,60);
assert.equal(first.items.length,25);
assert.ok(first.items.every(q=>q.reviewStatus==="draft"&&!("expectedAnswer" in q)));
const last=buildReviewQueue({questions:all,page:60,pageSize:25});
assert.equal(last.items.length,25);
assert.equal(new Set([...first.items,...last.items].map(q=>q.id)).size,50);
assert.deepEqual(buildReviewQueue({questions:all,page:61,pageSize:25}).items,[]);
assert.throws(()=>buildReviewQueue({questions:all,pageSize:101}),/Invalid page size/);
assert.throws(()=>buildReviewQueue({questions:[all[0],all[0]]}),/duplicate/);
console.log("Review queue tests passed for all 1500 drafts");
