/* LAMA shared authorization policy. Pure functions; server must supply verified context. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaPlatformPolicy=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const MODULES=Object.freeze(['schoolManagement','examination','smartMarker']);
const ROLE_PERMISSIONS=Object.freeze({
superAdmin:['grants:write','schools:read','audit:read'],
schoolOwner:['school:manage','students:read','exams:manage','exams:read','results:read','marker:review'],
schoolAdmin:['school:manage','students:read','exams:manage','exams:read','results:read','marker:review'],
teacher:['students:read','exams:author','exams:read','results:read','marker:review'],
student:['exams:attempt','results:own'],
parent:['results:linked'],
markerReviewer:['marker:review']
});
const ACTION_MODULE=Object.freeze({
'school:manage':'schoolManagement','students:read':'schoolManagement',
'exams:manage':'examination','exams:author':'examination','exams:read':'examination','exams:attempt':'examination',
'results:read':'examination','results:own':'examination','results:linked':'examination',
'marker:review':'smartMarker'
});
function authorize({principal,resource,action,grants=[],now=Date.now()}={}){
 const deny=reason=>({allowed:false,reason});
 if(!principal||principal.verified!==true||!principal.id||!principal.role)return deny('UNAUTHENTICATED');
 if(!Object.prototype.hasOwnProperty.call(ROLE_PERMISSIONS,principal.role))return deny('UNKNOWN_ROLE');
 if(!ROLE_PERMISSIONS[principal.role].includes(action))return deny('FORBIDDEN');
 if(action==='grants:write')return principal.role==='superAdmin'?{allowed:true,reason:'OK'}:deny('FORBIDDEN');
 if(!resource||!resource.schoolId||!principal.schoolId||resource.schoolId!==principal.schoolId)return deny('TENANT_MISMATCH');
 if(resource.campusId&&principal.campusIds&&!principal.campusIds.includes(resource.campusId))return deny('CAMPUS_MISMATCH');
 if(principal.role==='student'&&action==='exams:attempt'&&(!resource.studentId||resource.studentId!==principal.id))return deny('STUDENT_MISMATCH');
 if(principal.role==='student'&&action==='results:own'&&resource.studentId!==principal.id)return deny('STUDENT_MISMATCH');
 if(principal.role==='parent'&&action==='results:linked'&&(!resource.studentId||!principal.linkedStudentIds?.includes(resource.studentId)))return deny('STUDENT_MISMATCH');
 if(principal.role==='teacher'&&['exams:author','exams:read','students:read','results:read'].includes(action)){
  if(!resource.classId||!principal.classIds?.includes(resource.classId))return deny('CLASS_MISMATCH');
  if(resource.subjectId&&(!principal.subjectIds||!principal.subjectIds.includes(resource.subjectId)))return deny('SUBJECT_MISMATCH');
 }
 const module=ACTION_MODULE[action];
 if(module){
  const grant=grants.find(g=>g.schoolId===resource.schoolId&&g.module===module&&g.status==='active');
  if(!grant)return deny('ENTITLEMENT_REQUIRED');
  const time=typeof now==='number'?now:new Date(now).getTime();
  if(!Number.isFinite(time))return deny('INVALID_TIME');
  if(grant.startsAt&&time<Date.parse(grant.startsAt))return deny('ENTITLEMENT_NOT_STARTED');
  if(grant.expiresAt&&time>=Date.parse(grant.expiresAt))return deny('ENTITLEMENT_EXPIRED');
 }
 return {allowed:true,reason:'OK'};
}
function studentQuestion(q){
 if(!q||q.status!=='approved'||!q.questionId)throw Error('Only approved identified questions may be published');
 const {questionId,type,prompt,options,marks,language,chapterId}=q;
 return {questionId,type,prompt,options:Array.isArray(options)?options.map(o=>typeof o==='object'?{id:o.id,text:o.text}:o):undefined,marks,language,chapterId};
}
function studentPaper(paper){
 if(!paper||!Array.isArray(paper.questions))throw Error('Invalid paper');
 return {paperId:paper.paperId,examId:paper.examId,version:paper.version,questions:paper.questions.map(studentQuestion)};
}
return Object.freeze({MODULES,ROLE_PERMISSIONS,authorize,studentQuestion,studentPaper});
});
