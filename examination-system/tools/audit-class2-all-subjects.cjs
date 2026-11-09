"use strict";
const fs=require("node:fs"),path=require("node:path");
const subjects=["urdu","english","mathematics","general-knowledge","islamiat"];
function audit(root=path.join(__dirname,"../data")){
 const result=[];const globalIds=new Set();
 for(const subject of subjects){
  const ids=new Set(),prompts=new Map(),issues=[];let count=0,unmapped=0;
  for(let batch=1;batch<=3;batch++){
   const doc=JSON.parse(fs.readFileSync(path.join(root,`class2-${subject}-batch${batch}-500-draft.json`),"utf8"));
   if(!Array.isArray(doc.questions)||doc.questions.length!==500)throw Error(subject+" batch "+batch+" is not 500 records");
   for(const q of doc.questions){
    count++;
    const id=q.questionId;
    if(typeof id!=="string"||!id.trim()||ids.has(id)||globalIds.has(id))issues.push("Missing or repeated ID: "+id);
    ids.add(id);globalIds.add(id);
    if(q.approved!==false||q.onlineReady!==false||q.reviewStatus!=="draft")issues.push("Unsafe publication flags: "+id);
    if(typeof q.questionText!=="string"||!q.questionText.trim())issues.push("Missing prompt: "+id);
    if(q.correctAnswer===undefined||q.correctAnswer===null||!String(q.correctAnswer).trim())issues.push("Missing answer: "+id);
    if(!Number.isInteger(q.sourcePdfPage)||q.sourcePdfPage<1)unmapped++;
    const key=String(q.questionText||"").trim().toLocaleLowerCase().replace(/\s+/g," ");
    if(key)prompts.set(key,(prompts.get(key)||0)+1);
   }
  }
  result.push({subject,count,unmappedSourcePages:unmapped,exactRepeatPromptGroups:[...prompts.values()].filter(n=>n>1).length,issues});
 }
 return {total:result.reduce((n,x)=>n+x.count,0),subjects:result};
}
if(require.main===module){const result=audit();console.log(JSON.stringify(result,null,2));if(result.subjects.some(s=>s.issues.length))process.exitCode=1;}
module.exports={audit};
