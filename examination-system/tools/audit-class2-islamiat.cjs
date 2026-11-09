"use strict";
/** Run: node examination-system/tools/audit-class2-islamiat.cjs [repo-root] */
const fs=require("node:fs"),path=require("node:path");
const root=process.argv[2]||process.cwd();
const files=[1,2,3].map(n=>path.join(root,"examination-system","data",`class2-islamiat-batch${n}-500-draft.json`));
const batches=files.map(p=>JSON.parse(fs.readFileSync(p,"utf8")));
const all=batches.flatMap(b=>b.questions);
const ids=new Set(),prompts=new Set();
const summary={records:all.length,batchCounts:batches.map(b=>b.questions.length),uniqueIds:0,uniqueLiteralPrompts:0,missingAnswers:0,missingTextbookPages:0,approved:0,onlineReady:0,formatCounts:{},issues:[]};
for(const q of all){
 if(!q.questionId||ids.has(q.questionId))summary.issues.push("Missing/duplicate ID: "+q.questionId);
 ids.add(q.questionId);
 if(!q.questionText||prompts.has(q.questionText))summary.issues.push("Missing/duplicate literal prompt: "+q.questionId);
 prompts.add(q.questionText);
 if(!String(q.expectedAnswer||q.correctAnswer||"").trim())summary.missingAnswers++;
 if(!Number.isInteger(q.sourcePdfPage))summary.missingTextbookPages++;
 if(q.approved===true)summary.approved++;
 if(q.onlineReady===true)summary.onlineReady++;
 summary.formatCounts[q.questionType]=(summary.formatCounts[q.questionType]||0)+1;
}
summary.uniqueIds=ids.size;summary.uniqueLiteralPrompts=prompts.size;
const expectedIds=all.map(q=>q.questionId);
if(summary.records!==1500)summary.issues.push("Expected 1500 draft records");
for(let n=1;n<=3;n++)if(batches[n-1].questions.length!==500)summary.issues.push("Batch "+n+" does not have 500 records");
if(summary.approved||summary.onlineReady)summary.issues.push("Unexpected student-ready/approved draft");
if(summary.missingAnswers)summary.issues.push("Missing answer values");
console.log(JSON.stringify(summary,null,2));
if(summary.issues.length)process.exitCode=1;
