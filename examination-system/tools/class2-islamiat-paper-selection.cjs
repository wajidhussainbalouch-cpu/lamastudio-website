"use strict";
/**
 * Pure, review-only paper selection helper.
 * Does not fetch data, approve questions, expose answers or authorize access.
 * Server must enforce tenant, teacher and exam permissions before calling.
 */
function chooseDistinctFamilies(questions, count, random=Math.random) {
  if(!Array.isArray(questions)) throw new TypeError("questions must be an array");
  if(!Number.isSafeInteger(count)||count<0) throw new RangeError("Invalid count");
  if(typeof random!=="function") throw new TypeError("random must be a function");
  const candidates=new Map();
  for(const q of questions) {
    if(!q||typeof q!=="object") throw new TypeError("Invalid question");
    // Fail closed: all records must have completed human approval.
    if(q.approved!==true||q.onlineReady!==true||q.reviewStatus!=="approved"||
       q.requiresTeacherReview===true||q.textbookVerified!==true) continue;
    if(typeof q.questionId!=="string"||!/^C2-ISL-B[123]-\d{4}$/.test(q.questionId))
      throw new Error("Unrecognized question ID");
    if(typeof q.questionText!=="string"||!q.questionText.trim()) throw new Error("Empty question");
    // Existing batches are ordered in blocks of five variants per concept.
    // This grouping is only valid for the three known legacy batch formats.
    const match=/^C2-ISL-B([123])-(\d{4})$/.exec(q.questionId);
    const family=`B${match[1]}-F${Math.floor((Number(match[2])-1)/5)}`;
    if(!candidates.has(family)) candidates.set(family,[]);
    candidates.get(family).push(q);
  }
  if(count>candidates.size) throw new RangeError("Not enough approved distinct families");
  const keys=[...candidates.keys()];
  for(let i=keys.length-1;i>0;i--){
    const r=random();
    if(!Number.isFinite(r)||r<0||r>=1)throw new RangeError("Random source must return [0,1)");
    const j=Math.floor(r*(i+1));
    [keys[i],keys[j]]=[keys[j],keys[i]];
  }
  return keys.slice(0,count).map(key=>{
    const variants=candidates.get(key);
    const r=random();
    if(!Number.isFinite(r)||r<0||r>=1)throw new RangeError("Random source must return [0,1)");
    const q=variants[Math.floor(r*variants.length)];
    return Object.freeze({
      id:q.questionId, prompt:q.questionText, type:q.questionType,
      topic:q.topic, marks:q.marks, familyKey:key
    });
  });
}
module.exports={chooseDistinctFamilies};
