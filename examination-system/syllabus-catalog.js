/* Pure syllabus catalog adapter. Never assumes textbook intake metadata contains verified lessons.
 * No persistence, entitlement decisions or student data access.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.LamaSyllabusCatalog=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
function normalizeCatalog(source){
 if(!source||typeof source!=="object")throw Error("Catalog source required");
 for(const field of ["curriculumId","classId","subjectId","sourceVersion"])if(typeof source[field]!=="string"||!source[field].trim())throw Error(field+" required");
 if(!Array.isArray(source.chapters)||!source.chapters.length)throw Error("Verified chapter catalog required; textbook intake alone is insufficient");
 const chapterIds=new Set(),lessonIds=new Set();
 const chapters=source.chapters.map((ch,index)=>{
  if(!ch||typeof ch.id!=="string"||!ch.id.trim()||chapterIds.has(ch.id))throw Error("Missing/duplicate chapter ID");
  chapterIds.add(ch.id);
  if(typeof ch.title!=="string"||!ch.title.trim()||!Array.isArray(ch.lessons)||!ch.lessons.length)throw Error("Verified chapter title and lessons required");
  return {id:ch.id,title:ch.title,order:index+1,lessons:ch.lessons.map((l,i)=>{
   if(!l||typeof l.id!=="string"||!l.id.trim()||lessonIds.has(l.id))throw Error("Missing/duplicate lesson ID across catalog");
   lessonIds.add(l.id);
   if(typeof l.title!=="string"||!l.title.trim()||!Number.isInteger(l.periods)||l.periods<1||l.periods>100)throw Error("Invalid lesson title/periods");
   return {id:l.id,title:l.title,order:i+1,periods:l.periods,learningOutcome:l.learningOutcome||null,sourcePages:Array.isArray(l.sourcePages)?[...l.sourcePages]:[]};
  })};
 });
 if(source.reviewStatus!=="verified")throw Error("Catalog must be textbook-verified before automatic planning");
 return {curriculumId:source.curriculumId,classId:source.classId,subjectId:source.subjectId,sourceVersion:source.sourceVersion,chapters,reviewStatus:"verified"};
}
function manualChecklist(catalog,completedLessonIds=[]){
 const c=normalizeCatalog(catalog),done=new Set(completedLessonIds);
 const all=new Set(c.chapters.flatMap(ch=>ch.lessons.map(l=>l.id)));
 for(const id of done)if(!all.has(id))throw Error("Unknown lesson in checklist: "+id);
 return {curriculumId:c.curriculumId,classId:c.classId,subjectId:c.subjectId,sourceVersion:c.sourceVersion,chapters:c.chapters.map(ch=>({chapterId:ch.id,title:ch.title,lessons:ch.lessons.map(l=>({lessonId:l.id,title:l.title,completed:done.has(l.id)}))}))};
}
return {normalizeCatalog,manualChecklist};
});
