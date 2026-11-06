/**
 * Isolated teacher progress store. Must be called only after server verifies
 * teacher identity, school entitlement and published plan/class/subject scope.
 * Never updates a published plan or overwrites school attendance/homework.
 */
var LamaSyllabusProgressStore=(function(){
 'use strict';
 var TAB='_LAMA_SYLLABUS_PROGRESS';
 var HEAD=['schoolId','planId','lessonKey','status','completedAt','teacherId','updatedAt'];
 function sheet(bookId,create){
  var ss=SpreadsheetApp.openById(bookId),sh=ss.getSheetByName(TAB);
  if(!sh&&create===true){sh=ss.insertSheet(TAB);sh.getRange(1,1,1,HEAD.length).setValues([HEAD]);sh.setFrozenRows(1)}
  if(!sh)return null;
  var header=sh.getRange(1,1,1,HEAD.length).getValues()[0];
  if(HEAD.some(function(h,i){return header[i]!==h}))throw Error('Unexpected syllabus progress schema');
  return sh;
 }
 function key(entry){return [entry.date,entry.slot,entry.chapterId||'',entry.lessonId,entry.period||''].join('|')}
 function allowed(plan,lessonKey){
  if(!plan||plan.status!=='published'||!Array.isArray(plan.scheduled))throw Error('Published plan required');
  return plan.scheduled.some(function(x){return x.lessonId&&key(x)===lessonKey});
 }
 function save(bookId,schoolId,plan,teacherId,lessonKey,status,completedAt){
  if(!allowed(plan,lessonKey))throw Error('Lesson does not belong to published plan');
  if(['completed','pending','delayed'].indexOf(status)<0)throw Error('Invalid progress status');
  if(typeof teacherId!=='string'||!teacherId.trim())throw Error('Verified teacher required');
  if(status==='completed'){
   if(typeof completedAt!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(completedAt)||
      !Number.isFinite(Date.parse(completedAt+'T00:00:00Z'))||
      new Date(completedAt+'T00:00:00Z').toISOString().slice(0,10)!==completedAt)throw Error('Invalid completion date');
  }else completedAt='';
  var lock=LockService.getScriptLock();
  if(!lock.tryLock(30000))throw Error('Progress store busy');
  try{
   var sh=sheet(bookId,true),last=sh.getLastRow(),rows=last>1?sh.getRange(2,1,last-1,7).getValues():[],matches=[];
   rows.forEach(function(r,i){if(r[0]===schoolId&&r[1]===plan.planId&&r[2]===lessonKey)matches.push(i+2)});
   if(matches.length>1)throw Error('Duplicate lesson progress rows');
   if(matches.length && String(rows[matches[0]-2][5])!==teacherId)throw Error('Lesson progress belongs to another teacher; administrator reassignment required');
   var now=new Date().toISOString(),row=[schoolId,plan.planId,lessonKey,status,completedAt,teacherId,now];
   if(matches.length)sh.getRange(matches[0],1,1,7).setValues([row]);
   else sh.getRange(last+1,1,1,7).setValues([row]);
   SpreadsheetApp.flush();
   return {planId:plan.planId,lessonKey:lessonKey,status:status,updatedAt:now};
  }finally{lock.releaseLock()}
 }
 function list(bookId,schoolId,planId){
  var sh=sheet(bookId,false);
  if(!sh)return [];
  var last=sh.getLastRow();
  if(last<2)return [];
  if(last>10002)throw Error('Progress index too large; pagination required');
  return sh.getRange(2,1,last-1,7).getValues().filter(function(r){return r[0]===schoolId&&r[1]===planId}).map(function(r){
   return {key:r[2],status:r[3],completedAt:r[4]||null,teacherId:r[5],updatedAt:r[6]};
  });
 }
 function reassign(bookId,schoolId,planId,fromTeacherId,toTeacherId,actorId,reason){
  if(![schoolId,planId,fromTeacherId,toTeacherId,actorId,reason].every(function(x){return typeof x==='string'&&!!x.trim()}))
   throw Error('Verified reassignment details and reason required');
  if(fromTeacherId===toTeacherId)throw Error('Teachers must differ');
  if(reason.trim().length<8||reason.length>500)throw Error('Reassignment reason must be 8–500 characters');
  var lock=LockService.getScriptLock();
  if(!lock.tryLock(30000))throw Error('Progress store busy');
  try{
   var sh=sheet(bookId,false);
   if(!sh)return {transferred:0,planId:planId};
   var last=sh.getLastRow(),rows=last>1?sh.getRange(2,1,last-1,7).getValues():[];
   var targets=[],seen={};
   rows.forEach(function(r,i){
    if(r[0]!==schoolId||r[1]!==planId)return;
    if(seen[r[2]])throw Error('Duplicate lesson progress rows');
    seen[r[2]]=true;
    if(String(r[5])===fromTeacherId)targets.push({row:i+2,data:r});
   });
   if(!targets.length)throw Error('No progress owned by source teacher');
   var ss=SpreadsheetApp.openById(bookId),audit=ss.getSheetByName('_LAMA_SYLLABUS_TRANSFERS');
   var headers=['schoolId','planId','fromTeacherId','toTeacherId','actorId','reason','lessonCount','transferredAt'];
   if(!audit){audit=ss.insertSheet('_LAMA_SYLLABUS_TRANSFERS');audit.getRange(1,1,1,headers.length).setValues([headers]);audit.setFrozenRows(1)}
   var actual=audit.getRange(1,1,1,headers.length).getValues()[0];
   if(headers.some(function(h,i){return h!==actual[i]}))throw Error('Unexpected syllabus transfer audit schema');
   var now=new Date().toISOString();
   // Audit intent before updates; transfer is idempotently recoverable from per-row teacherId.
   audit.getRange(audit.getLastRow()+1,1,1,headers.length).setValues([[schoolId,planId,fromTeacherId,toTeacherId,actorId,reason.trim(),targets.length,now]]);
   SpreadsheetApp.flush();
   var applied=[];
   try{
    targets.forEach(function(t){
     var updated=t.data.slice();updated[5]=toTeacherId;updated[6]=now;
     sh.getRange(t.row,1,1,7).setValues([updated]);
     applied.push(t);
    });
    SpreadsheetApp.flush();
    // Verify every row before reporting success.
    targets.forEach(function(t){
     var stored=sh.getRange(t.row,1,1,7).getValues()[0];
     if(String(stored[5])!==toTeacherId||stored[3]!==t.data[3]||
        String(stored[4]||'')!==String(t.data[4]||''))throw Error('Transfer verification failed');
    });
   }catch(error){
    var rollbackErrors=[];
    applied.reverse().forEach(function(t){
     try{sh.getRange(t.row,1,1,7).setValues([t.data])}
     catch(e){rollbackErrors.push(String(e.message||e))}
    });
    try{SpreadsheetApp.flush()}catch(e){rollbackErrors.push(String(e.message||e))}
    if(rollbackErrors.length)throw Error('Transfer incomplete; rollback failed. Administrator must reconcile audit and progress before retrying: '+rollbackErrors.join('; '));
    throw Error('Transfer failed and rollback attempted: '+String(error.message||error));
   }
   return {planId:planId,transferred:targets.length,fromTeacherId:fromTeacherId,toTeacherId:toTeacherId,transferredAt:now};
  }finally{lock.releaseLock()}
 }
 return {save:save,list:list,key:key,reassign:reassign};
})();
