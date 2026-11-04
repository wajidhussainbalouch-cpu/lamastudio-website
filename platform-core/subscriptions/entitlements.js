/* LAMA module grants: pure evaluator, server must authenticate callers. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaEntitlements=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const MODULES=Object.freeze(['schoolManagement','examination','smartMarker']);
function validateGrant(g){
 if(!g||typeof g.schoolId!=='string'||!g.schoolId.trim()||!MODULES.includes(g.module)||!['active','suspended','revoked'].includes(g.status)||!Number.isSafeInteger(g.revision)||g.revision<1)throw Error('Invalid grant');
 const parse=(s)=>{if(!s)return null;if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(Date.parse(s)).toISOString().slice(0,19)!==s.slice(0,19))throw Error('Invalid date');return Date.parse(s)};
 const start=parse(g.startsAt),end=parse(g.expiresAt);if(start!==null&&end!==null&&end<=start)throw Error('Invalid interval');
 return Object.freeze({schoolId:g.schoolId,module:g.module,status:g.status,revision:g.revision,startsAt:g.startsAt||null,expiresAt:g.expiresAt||null});
}
function evaluate(grants,schoolId,module,now=Date.now()){
 const deny=reason=>({allowed:false,reason});
 if(!MODULES.includes(module))return deny('INVALID_MODULE');
 if(typeof schoolId!=='string'||!schoolId)return deny('INVALID_SCHOOL');
 if(!Number.isFinite(now))return deny('INVALID_TIME');
 const rows=(Array.isArray(grants)?grants:[]).filter(g=>g&&g.schoolId===schoolId&&g.module===module);
 if(!rows.length)return deny('ENTITLEMENT_REQUIRED');
 let list;try{list=rows.map(validateGrant)}catch(_){return deny('INVALID_GRANT')}
 list.sort((a,b)=>b.revision-a.revision);
 if(list.length>1&&list[0].revision===list[1].revision)return deny('CONFLICTING_GRANTS');
 const g=list[0];if(g.status!=='active')return deny('ENTITLEMENT_'+g.status.toUpperCase());
 if(g.startsAt&&now<Date.parse(g.startsAt))return deny('NOT_STARTED');
 if(g.expiresAt&&now>=Date.parse(g.expiresAt))return deny('EXPIRED');
 return {allowed:true,reason:'OK',revision:g.revision};
}
return Object.freeze({MODULES,validateGrant,evaluate});
});