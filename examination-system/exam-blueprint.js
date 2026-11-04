/* LAMA Examination: pure, side-effect-free draft assembly helpers.
 * Never expose correctAnswer to student clients in production.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.LamaExamBlueprint=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const normalize=s=>String(s??"").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
 const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0;};
 const shuffle=(items,seed)=>[...items].map((v,i)=>({v,key:hash(seed+":"+v.questionId+":"+i)})).sort((a,b)=>a.key-b.key).map(x=>x.v);
 function resolveScope(scope,chapters){
   if(!Array.isArray(chapters)||!chapters.length)throw Error("Chapter metadata required");
   const ordered=[...chapters].sort((a,b)=>a.order-b.order);
   if(ordered.some(c=>!c.id||!Number.isInteger(c.order)))throw Error("Each chapter requires an id and integer order");
   const ids=new Set(ordered.map(c=>String(c.id)));
   if(ids.size!==ordered.length)throw Error("Duplicate chapter IDs");
   let chosen=[];
   if(scope.type==="chapters")chosen=scope.chapterIds||[];
   else if(scope.type==="full")chosen=ordered.map(c=>c.id);
   else if(scope.type==="half"){const cut=Math.ceil(ordered.length/2);chosen=(scope.part===2?ordered.slice(cut):ordered.slice(0,cut)).map(c=>c.id);}
   else if(scope.type==="quarter"){if(![1,2,3,4].includes(scope.part))throw Error("Invalid quarter");const from=Math.floor((scope.part-1)*ordered.length/4),to=Math.floor(scope.part*ordered.length/4);chosen=ordered.slice(from,to).map(c=>c.id);}
   else throw Error("Unsupported scope");
   if(!chosen.length||chosen.some(x=>!ids.has(String(x))))throw Error("Scope references missing chapters");
   return [...new Set(chosen.map(String))];
 }
 function validateQuestion(q){
   const errors=[];
   if(!q.questionId)errors.push("missing ID");
   if(!q.chapterId)errors.push("missing chapterId");
   if(!q.questionText)errors.push("missing text");
   if(!q.questionType)errors.push("missing type");
   if(q.correctAnswer===undefined||q.correctAnswer===null)errors.push("missing answer");
   if(q.questionType==="mcq"&&(!Array.isArray(q.options)||q.options.length<2||!q.options.some(x=>normalize(x)===normalize(q.correctAnswer))))errors.push("invalid MCQ options");
   if(q.approved!==true||q.onlineReady!==true||q.reviewStatus!=="approved")errors.push("not approved for online");
   return errors;
 }
 function assemble({questions,chapters,scope,count=10,seed="default",types=null}){
   if(!Number.isInteger(count)||count<1||count>200)throw Error("Count must be 1–200");
   const allowed=new Set(resolveScope(scope,chapters));
   const valid=[],rejected=[],seenIds=new Set(),seenTexts=new Set();
   for(const q of questions){
     if(!allowed.has(String(q.chapterId)))continue;
     const problems=validateQuestion(q);
     const textKey=normalize(q.questionText);
     if(seenIds.has(q.questionId)||seenTexts.has(textKey))problems.push("duplicate ID or text");
     seenIds.add(q.questionId);seenTexts.add(textKey);
     if(types&&types.length&&!types.includes(q.questionType))continue;
     if(problems.length)rejected.push({id:q.questionId,problems});
     else valid.push(q);
   }
   if(valid.length<count)throw Error("Insufficient approved, unique questions: "+valid.length+" available for "+count+" requested");
   const selected=shuffle(valid,seed).slice(0,count);
   return {chapterIds:[...allowed],questionIds:selected.map(q=>q.questionId),rejected,questions:selected};
 }
 function studentPayload(exam){
   return {chapterIds:exam.chapterIds,questions:exam.questions.map(q=>({
     questionId:q.questionId,questionText:q.questionText,questionType:q.questionType,
     options:q.options||null,marks:q.marks||1
   }))};
 }
 function validatePermission({schoolEntitlements,actor,student,assignment,now=Date.now()}){
   if(!schoolEntitlements?.examination?.enabled)throw Error("Examination module not licensed");
   if(schoolEntitlements.examination.expiresAt&&Date.parse(schoolEntitlements.examination.expiresAt)<now)throw Error("Examination subscription expired");
   if(!actor||!["teacher","admin"].includes(actor.role)||actor.schoolId!==assignment.schoolId)throw Error("Unauthorized exam publisher");
   if(actor.role==="teacher"&&!actor.assignedClassIds?.includes(assignment.classId))throw Error("Teacher not assigned to class");
   if(student&&(student.schoolId!==assignment.schoolId||student.classId!==assignment.classId))throw Error("Student not in assigned class");
   if(assignment.status!=="published"||assignment.allowOnline!==true)throw Error("Online test not enabled");
   if(assignment.opensAt&&Date.parse(assignment.opensAt)>now)throw Error("Test not open");
   if(assignment.closesAt&&Date.parse(assignment.closesAt)<now)throw Error("Test closed");
   return true;
 }
 return {resolveScope,validateQuestion,assemble,studentPayload,validatePermission};
});
