/**
 * Inactive read-only handler contract. No HTTP route or storage adapter installed.
 * Dependencies are trusted server functions; never pass browser-controlled context.
 */
var LamaSyllabusReadonlyHandler=(function(){
 'use strict';
 function validKey(v){return typeof v==='string'&&/^[a-zA-Z0-9 _./-]{1,100}$/.test(v)&&!!v.trim()}
 function read(request,services){
  if(!services||typeof services.resolveSession!=='function'||typeof services.loadScopedPlan!=='function')
   throw Error('Trusted syllabus services required');
  // Authentication must precede all storage reads.
  var context=services.resolveSession();
  if(!context||context.authenticated!==true||context.examinationGranted!==true||
     context.canViewSyllabus!==true||!validKey(context.schoolId)||!validKey(context.actorId))
   throw Error('Authenticated syllabus viewer with Examination grant required');
  if(!request||typeof request!=='object'||Array.isArray(request)||
     Object.keys(request).some(function(k){return k!=='planId';})||!validKey(request.planId))
   throw Error('Only a valid planId may be requested');
  // The school ID comes exclusively from the authenticated server session.
  var stored=services.loadScopedPlan(context.schoolId,request.planId);
  if(stored&&stored.planId!==request.planId)throw Error('Syllabus plan ID mismatch');
  if(!stored)throw Error('Syllabus plan not found');
  if(typeof LamaSyllabusReadonlyBridge==='undefined'||!LamaSyllabusReadonlyBridge.prepare)
   throw Error('Syllabus read-only bridge unavailable');
  return LamaSyllabusReadonlyBridge.prepare(stored,context);
 }
 return {read:read};
})();
