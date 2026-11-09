/**
 * Opt-in, read-only legacy syllabus bridge for Google Apps Script.
 * This file defines a helper only: it does not register HTTP routes, read
 * Sheets/Drive, authorize requests, write plans or migrate approvals.
 * The caller MUST obtain context from authenticated server session and load
 * the plan using the server-side school scope, not request-supplied IDs.
 */
var LamaSyllabusReadonlyBridge=(function(){
 'use strict';
 function validId(v){return typeof v==='string'&&v.length>0&&v.length<=100&&!!v.trim()}
 function prepare(storedPlan,context){
  if(!context||typeof context!=='object'||!validId(context.schoolId)||!validId(context.actorId)||
    context.authenticated!==true||context.examinationGranted!==true||
    context.canViewSyllabus!==true)throw Error('Authenticated syllabus viewer with Examination grant required');
  if(!storedPlan||typeof storedPlan!=='object'||Array.isArray(storedPlan))throw Error('Invalid stored syllabus plan');
  if(storedPlan.schoolId!==context.schoolId)throw Error('Cross-school syllabus access denied');
  if(!validId(storedPlan.planId)||!validId(storedPlan.sessionId)||!validId(storedPlan.classId)||
    !validId(storedPlan.subjectId)||!Array.isArray(storedPlan.scheduled))throw Error('Invalid stored syllabus plan');
  if(!Number.isSafeInteger(storedPlan.version)||storedPlan.version<1)throw Error('Invalid stored syllabus version');
  if(['draft','submitted','approved','published','archived'].indexOf(storedPlan.status)<0)throw Error('Invalid stored syllabus status');
  if(storedPlan.scheduled.length>300)throw Error('Stored syllabus exceeds legacy limit');
  var lessons=storedPlan.scheduled.map(function(item){
   if(!item||typeof item!=='object'||!/^\d{4}-\d{2}-\d{2}$/.test(item.date)||
     !Number.isSafeInteger(item.slot)||item.slot<1||item.slot>12||
     !validId(item.lessonId)||typeof item.lessonTitle!=='string'||!item.lessonTitle.trim())
     throw Error('Invalid stored syllabus lesson');
   return {date:item.date,slot:item.slot,lessonId:item.lessonId,lessonTitle:item.lessonTitle,
     chapterId:typeof item.chapterId==='string'?item.chapterId:''};
  });
  return {schoolId:storedPlan.schoolId,planId:storedPlan.planId,sessionId:storedPlan.sessionId,
    classId:storedPlan.classId,sectionId:storedPlan.sectionId||'',subjectId:storedPlan.subjectId,
    status:storedPlan.status,version:storedPlan.version,scheduled:lessons,
    immutableDivisionApproved:false,requiresExerciseReview:true,readOnly:true};
 }
 return {prepare:prepare};
})();
