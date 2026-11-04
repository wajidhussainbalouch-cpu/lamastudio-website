/* Server-side authorization policy helper for syllabus endpoints.
 * Pass a session VERIFIED by the backend, never a client-supplied role/school ID.
 * This module is a reference policy, not an authenticated endpoint.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaSyllabusPolicy=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const permissions={
 view:['school','teacher','admin'],
 manualEdit:['school','teacher','admin'],
 previewAutomatic:['school','teacher','admin'],
 submit:['school','teacher','admin'],
 approve:['school','admin'],
 publish:['school','admin'],
 markProgress:['school','teacher','admin'],
 examScope:['school','teacher','admin']
};
const premium=new Set(['previewAutomatic','examScope']);
function authorize({session,resource,action,entitlements}){
 if(!session||session.verified!==true||!session.actorId||!session.schoolId)throw Error('Authenticated server session required');
 if(!resource||!resource.schoolId||session.schoolId!==resource.schoolId)throw Error('School scope denied');
 if(!Object.prototype.hasOwnProperty.call(permissions,action))throw Error('Unknown syllabus action');
 if(!permissions[action].includes(session.role))throw Error('Role not permitted');
 if(!entitlements||entitlements.management!==true)throw Error('Management entitlement required');
 if(premium.has(action)&&entitlements.examination!==true)throw Error('Examination entitlement required');
 return {allowed:true,actorId:session.actorId,schoolId:session.schoolId,action};
}
return {authorize};
});
