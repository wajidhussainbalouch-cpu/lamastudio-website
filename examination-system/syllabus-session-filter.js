/* Pure academic-session filter; rejects overlapping published plans. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LamaSyllabusSessionFilter=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function select(plans,sessionId){
 if(!Array.isArray(plans))throw Error('Plan list required');
 if(typeof sessionId!=='string'||!/^[a-zA-Z0-9 _./-]{1,100}$/.test(sessionId.trim()))throw Error('Academic session required');
 const selected=plans.filter(p=>p.status==='published'&&p.sessionId===sessionId.trim());
 const seen=new Set();
 for(const p of selected){
  const key=[p.classId,p.subjectId,p.sectionId||''].map(x=>String(x||'').trim().toLowerCase()).join('|');
  if(seen.has(key))throw Error('Overlapping published plans');
  seen.add(key);
 }
 return selected;
}
return {select};
});
