"use strict";
/**
 * Read-only, review-only queue. Not a student API.
 * Accepts a trusted server-filtered pool and does not change approvals.
 */
function buildReviewQueue({questions,page=1,pageSize=25,topic=null}){
 if(!Array.isArray(questions))throw new TypeError("questions must be an array");
 if(!Number.isSafeInteger(page)||page<1)throw new RangeError("Invalid page");
 if(!Number.isSafeInteger(pageSize)||pageSize<1||pageSize>100)throw new RangeError("Invalid page size");
 if(topic!==null&&(typeof topic!=="string"||!topic.trim()))throw new TypeError("Invalid topic");
 const seen=new Set();
 const filtered=[];
 for(const q of questions){
  if(!q||typeof q.id!=="string"||!q.id.trim()||seen.has(q.id))throw new Error("Missing/duplicate question ID");
  seen.add(q.id);
  if(q.reviewStatus!=="draft"||q.approved!==false||q.onlineReady!==false)continue;
  if(topic!==null&&q.topic!==topic)continue;
  filtered.push({id:q.id,topic:q.topic||"Unmapped",type:q.type||"unknown",prompt:q.prompt||"",textbookPage:Number.isInteger(q.textbookPage)?q.textbookPage:null,reviewStatus:"draft",requiresTeacherReview:true});
 }
 filtered.sort((a,b)=>a.id.localeCompare(b.id));
 const total=filtered.length;
 const pages=Math.ceil(total/pageSize);
 const offset=(page-1)*pageSize;
 return {page,pageSize,total,pages,items:filtered.slice(offset,offset+pageSize)};
}
module.exports={buildReviewQueue};
