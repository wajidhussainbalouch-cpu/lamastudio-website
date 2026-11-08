'use strict';
/** Pure preparation of an immutable approval snapshot. Server must persist atomically. */
const crypto=require('node:crypto');
function canonical(value){
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
 return JSON.stringify(value);
}
function makeDivisionSnapshot({division,scope,expectedRevision}){
 if(!division||division.status!=='submitted'||!Array.isArray(division.lessons))throw Error('Submitted division required');
 if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0||division.revision!==expectedRevision)throw Error('Revision conflict');
 for(const k of ['schoolId','classId','subjectId','sessionId'])if(!scope||typeof scope[k]!=='string'||!scope[k].trim())throw Error('Missing scope: '+k);
 if(String(division.classId)!==scope.classId||division.subjectId!==scope.subjectId)throw Error('Scope mismatch');
 const seen=new Set();
 const lessons=division.lessons.map(l=>{
  if(!l||typeof l.lessonId!=='string'||!l.lessonId||seen.has(l.lessonId))throw Error('Invalid lesson ID');
  seen.add(l.lessonId);
  if(!Number.isSafeInteger(l.estimatedPeriods)||l.estimatedPeriods<1)throw Error('Invalid period estimate');
  const copy=JSON.parse(JSON.stringify(l));
  for(const key of ['date','scheduledDate','slots','actualDate'])if(key in copy)throw Error('Calendar/progress fields cannot be snapshotted');
  return copy;
 });
 const content={schemaVersion:1,scope:{...scope},source:division.source||null,revision:expectedRevision,lessons};
 const digest=crypto.createHash('sha256').update(canonical(content)).digest('hex');
 return {snapshotId:'sha256:'+digest,hash:digest,content,requiresServerAuthorization:true};
}
function verifyDivisionSnapshot(snapshot){
 if(!snapshot||!snapshot.content||typeof snapshot.hash!=='string')return false;
 return crypto.createHash('sha256').update(canonical(snapshot.content)).digest('hex')===snapshot.hash;
}
module.exports={makeDivisionSnapshot,verifyDivisionSnapshot};
