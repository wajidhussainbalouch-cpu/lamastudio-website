"use strict";
/**
 * Review-only concept family index for the three Class 2 Islamiat draft batches.
 * Run: node examination-system/tools/class2-islamiat-concept-families.cjs [repo-root]
 * This DOES NOT verify semantic uniqueness between families.
 */
const fs=require("node:fs"),path=require("node:path");
const root=process.argv[2]||process.cwd();
const families=[],seen=new Set(),issues=[];
for(let batch=1;batch<=3;batch++){
 const file=path.join(root,"examination-system/data",`class2-islamiat-batch${batch}-500-draft.json`);
 const data=JSON.parse(fs.readFileSync(file,"utf8"));
 if(!Array.isArray(data.questions)||data.questions.length!==500)throw Error("Unexpected count in batch "+batch);
 for(let i=0;i<data.questions.length;i+=5){
  const group=data.questions.slice(i,i+5);
  const answers=new Set(group.map(q=>String(q.expectedAnswer||q.correctAnswer||"").trim()));
  const topics=new Set(group.map(q=>q.topic));
  const ids=group.map(q=>q.questionId);
  for(const id of ids){if(seen.has(id))issues.push("duplicate ID "+id);seen.add(id);}
  if(group.length!==5||answers.size!==1||topics.size!==1)issues.push("Inconsistent family starting "+ids[0]);
  families.push({familyId:`C2-ISL-F-${String(families.length+1).padStart(3,"0")}`,batch,topic:group[0].topic,questionIds:ids,variants:group.map(q=>q.questionType),expectedAnswer:group[0].expectedAnswer||group[0].correctAnswer,sourcePage:group[0].sourcePdfPage,teacherReviewRequired:true});
 }
}
const report={records:seen.size,families:families.length,variantsPerFamily:5,reviewOnly:true,issues,byBatch:[1,2,3].map(batch=>({batch,families:families.filter(f=>f.batch===batch).length}))};
console.log(JSON.stringify(report,null,2));
if(issues.length||seen.size!==1500||families.length!==300)process.exitCode=1;
module.exports={families,report};
