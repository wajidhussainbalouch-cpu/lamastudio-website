/* Read-only diary adapter for published, tenant-scoped syllabus plans.
 * Server must authorize session and entitlements before calling this helper.
 */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./syllabus-workflow.js'):root.LamaSyllabusWorkflow,typeof module==='object'&&module.exports?require('./syllabus-progress.js'):root.LamaSyllabusProgress);if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaSyllabusDiary=api;})(typeof globalThis!=='undefined'?globalThis:this,function(workflow,progress){
'use strict';
function suggestions({plan,schoolId,classId,subjectId,date,updates=[]}){
 if(!workflow||!progress)throw Error('Diary dependencies not loaded');
 workflow.assertSameTenant(plan,schoolId);
 if(plan.classId!==classId||plan.subjectId!==subjectId)throw Error('Class or subject mismatch');
 if(!workflow.canSuggestDiary(plan))throw Error('Only published plans can suggest diary lessons');
 const lessons=progress.diarySuggestions(plan,date,updates);
 return {schoolId:plan.schoolId,planId:plan.planId,planVersion:plan.version,classId,subjectId,date,suggestions:lessons.map(x=>({...x,planId:plan.planId,planVersion:plan.version,readOnly:true})),suggestionOnly:true,requiresTeacherConfirmation:true};
}
return {suggestions};
});
