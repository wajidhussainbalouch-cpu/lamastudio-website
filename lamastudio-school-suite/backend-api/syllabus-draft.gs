/** Strict, server-side validation of manually entered syllabus drafts.
 * Rejects arbitrary JSON fields, HTML formulas and cross-school identifiers.
 * School and actor are injected by the authenticated backend.
 */
var LamaSyllabusDraft = (function(){
 'use strict';
 function id(x,label){if(typeof x!=='string'||!/^[a-zA-Z0-9 _./-]{1,100}$/.test(x)||!x.trim())throw Error('Invalid '+label);return x.trim()}
 function date(x){if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x)||new Date(x+'T00:00:00Z').toISOString().slice(0,10)!==x)throw Error('Invalid lesson date');return x}
 function text(x,label){if(typeof x!=='string'||!x.trim()||x.length>180||/^[=+@\t\r]/.test(x.trim()))throw Error('Invalid '+label);return x.trim()}
 function create(schoolId,input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Draft input required');
  var allowed=['planId','sessionId','classId','sectionId','subjectId','scheduled'];
  if(Object.keys(input).some(function(k){return allowed.indexOf(k)<0}))throw Error('Unsupported draft field');
  var planId=id(input.planId,'plan ID'),sessionId=id(input.sessionId,'session'),classId=id(input.classId,'class'),subjectId=id(input.subjectId,'subject'),sectionId=input.sectionId==null||input.sectionId===''?'':id(input.sectionId,'section');
  if(!Array.isArray(input.scheduled)||!input.scheduled.length||input.scheduled.length>300)throw Error('1–300 lessons required');
  var seen={};
  var scheduled=input.scheduled.map(function(item){
   if(!item||typeof item!=='object'||Array.isArray(item)||Object.keys(item).some(function(k){return ['date','slot','lessonId','lessonTitle','chapterId'].indexOf(k)<0}))throw Error('Invalid lesson fields');
   var d=date(item.date),slot=Number(item.slot);
   if(!Number.isSafeInteger(slot)||slot<1||slot>12)throw Error('Invalid lesson slot');
   var lessonId=id(item.lessonId,'lesson ID'),title=text(item.lessonTitle,'lesson title');
   var chapterId=item.chapterId?id(item.chapterId,'chapter ID'):'';
   var key=d+'|'+slot;if(seen[key])throw Error('Duplicate date and slot');seen[key]=true;
   return {date:d,slot:slot,lessonId:lessonId,lessonTitle:title,chapterId:chapterId};
  });
  scheduled.sort(function(a,b){return a.date.localeCompare(b.date)||a.slot-b.slot});
  return {schoolId:id(schoolId,'school ID'),planId:planId,sessionId:sessionId,classId:classId,sectionId:sectionId,subjectId:subjectId,
   status:'draft',version:1,scheduled:scheduled,approvedBy:null,publishedBy:null};
 }
 return {create:create};
})();
