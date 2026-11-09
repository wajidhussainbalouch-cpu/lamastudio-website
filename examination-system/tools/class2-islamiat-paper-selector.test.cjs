"use strict";
const assert=require("node:assert/strict");
const {selectPaper}=require("./class2-islamiat-paper-selector.cjs");
const familyIndex=[
 {familyId:"f1",questionIds:["a","a2"]},
 {familyId:"f2",questionIds:["b","b2"]},
 {familyId:"f3",questionIds:["c"]}
];
const q=(id,topic="A")=>({id,topic,type:"short_answer",prompt:id,marks:1,expectedAnswer:"SECRET",approved:true,onlineReady:true,reviewStatus:"approved",requiresTeacherReview:false,textbookPage:3});
const questions=[q("a"),q("a2"),q("b","B"),q("b2","B"),q("c","C")];
const result=selectPaper({questions,familyIndex,count:3,seed:123});
assert.equal(result.length,3);
assert.equal(new Set(result.map(x=>x.familyId)).size,3);
assert.ok(result.every(x=>!("expectedAnswer" in x)));
assert.deepEqual(result,selectPaper({questions,familyIndex,count:3,seed:123}));
assert.throws(()=>selectPaper({questions:questions.map(x=>({...x,approved:false})),familyIndex,count:1}),/Insufficient/);
assert.throws(()=>selectPaper({questions:questions.map(x=>({...x,textbookPage:null})),familyIndex,count:1}),/Insufficient/);
assert.throws(()=>selectPaper({questions,familyIndex,count:4}),/Insufficient/);
assert.throws(()=>selectPaper({questions,familyIndex,count:2,topicLimits:{A:0,B:0,C:0}}),/Insufficient/);
assert.throws(()=>selectPaper({questions:[q("a"),q("a")],familyIndex,count:1}),/duplicate/);
assert.throws(()=>selectPaper({questions,familyIndex:[...familyIndex,{familyId:"other",questionIds:["a"]}],count:1}),/multiple families/);
console.log("Paper selector tests passed");
