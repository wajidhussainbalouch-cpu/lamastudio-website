"use strict";
/**
 * Review-only paper selection logic. No database access, no publishing.
 * Caller must supply a server-authorized, teacher-approved pool.
 * One question per concept family, never multiple wording variants.
 */
function selectPaper({questions, familyIndex, count, seed=1, topicLimits={}}) {
  if(!Array.isArray(questions)||!Array.isArray(familyIndex))throw new TypeError("Questions and familyIndex must be arrays");
  if(!Number.isSafeInteger(count)||count<1||count>100)throw new RangeError("count must be 1..100");
  if(!Number.isSafeInteger(seed))throw new TypeError("seed must be a safe integer");
  const familyFor=new Map();
  for(const family of familyIndex){
    if(!family||typeof family.familyId!=="string"||!Array.isArray(family.questionIds)||!family.questionIds.length)throw new Error("Invalid family");
    for(const id of family.questionIds){
      if(familyFor.has(id))throw new Error("Question belongs to multiple families: "+id);
      familyFor.set(id,family.familyId);
    }
  }
  const seenIds=new Set(),byFamily=new Map();
  for(const q of questions){
    if(!q||typeof q.id!=="string"||seenIds.has(q.id))throw new Error("Missing/duplicate question ID");
    seenIds.add(q.id);
    // Fail closed: every question must be independently approved, source verified, and review complete.
    if(q.approved!==true||q.onlineReady!==true||q.reviewStatus!=="approved"||
       q.requiresTeacherReview!==false||!Number.isInteger(q.textbookPage)||q.textbookPage<1||
       q.sourceBasis!=="pctb-page-verified"||typeof q.reviewedBy!=="string"||!q.reviewedBy.trim()||
       typeof q.reviewedAt!=="string"||!Number.isFinite(Date.parse(q.reviewedAt)))continue;
    const familyId=familyFor.get(q.id);
    if(!familyId)continue; // unknown family never enters a paper
    if(!byFamily.has(familyId))byFamily.set(familyId,[]);
    byFamily.get(familyId).push(q);
  }
  let state=(seed>>>0)||1;
  const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const candidates=shuffle([...byFamily].map(([familyId,variants])=>({familyId,q:shuffle([...variants])[0]})));
  const selected=[],topics={};
  for(const {familyId,q} of candidates){
    const max=topicLimits[q.topic];
    if(max!==undefined&&(!Number.isSafeInteger(max)||max<0))throw new RangeError("Invalid topic limit");
    if(max!==undefined&&(topics[q.topic]||0)>=max)continue;
    selected.push({familyId,questionId:q.id,topic:q.topic,type:q.type,prompt:q.prompt,marks:q.marks});
    topics[q.topic]=(topics[q.topic]||0)+1;
    if(selected.length===count)break;
  }
  if(selected.length!==count)throw new Error(`Insufficient eligible distinct concept families: requested ${count}, available ${selected.length}`);
  return selected; // intentionally excludes answer keys
}
module.exports={selectPaper};
