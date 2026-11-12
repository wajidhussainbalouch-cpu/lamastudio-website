/**
 * LAMA Quran Academy v9: verified guardian read-only PILOT add-on.
 * Install in SAME Google Apps Script project as School Suite Code.gs and Quran v8.
 * No doPost/doGet; route actions ONLY through the existing handleRequest switch.
 * DO NOT deploy until integration tests, manual pilot and privacy review pass.
 * Requires Script Properties:
 *   QURAN_V8_PILOT_SCHOOLS = comma-separated existing school IDs
 *   QURAN_V9_PILOT_SCHOOLS = comma-separated exact school IDs (independent gate)
 *   QURAN_V9_GUARDIAN_ENABLED = true
 *   QURAN_V9_GUARDIAN_SECRET = >=32 random characters, never client-side
 * Uses existing school student IDs and private spreadsheet, NOT new student accounts.
 */
var QURAN_V9_GUARDIAN_TAB = 'QuranGuardianLinks';
var QURAN_V9_GUARDIAN_HEADERS = ['id','studentId','email','emailHash','relationship','status','approvedBy','createdAt','updatedAt','version'];
var QURAN_V9_ACTIONS = ['quranV9ApproveGuardian','quranV9RevokeGuardian','quranV9ListGuardianLinks','quranV9RequestGuardianCode','quranV9VerifyGuardianCode','quranV9GuardianChildren','quranV9GuardianProgress','quranV9GuardianLogout'];
var QURAN_V9_CODE_SECONDS = 600;
var QURAN_V9_SESSION_SECONDS = 1800;
var QURAN_V9_GENERIC = 'If this email is approved by the school, a code will be sent. Check your inbox.';

function quranV9Gate_(p) {
  var schoolId=quranV8Id_(p.schoolId,'School ID');
  var props=PropertiesService.getScriptProperties();
  if(String(props.getProperty('QURAN_V9_GUARDIAN_ENABLED'))!=='true') throw Error('Guardian pilot is not enabled.');
  ['QURAN_V8_PILOT_SCHOOLS','QURAN_V9_PILOT_SCHOOLS'].forEach(function(v){
    var values=String(props.getProperty(v)||'').split(',').map(function(x){return x.trim();});
    if(values.indexOf(schoolId)<0) throw Error('Guardian pilot is not enabled for this school.');
  });
  var secret=String(props.getProperty('QURAN_V9_GUARDIAN_SECRET')||'');
  if(secret.length<32)throw Error('Guardian pilot is missing server security configuration.');
  var match=findSchoolRow(getRegistrySheet(),function(row){return String(row.schoolId)===schoolId;});
  if(!match||match.obj.status!=='Active')throw Error('School is unavailable.');
  return {schoolId:schoolId,ss:SpreadsheetApp.openById(match.obj.sheetId),secret:secret};
}
function quranV9Hmac_(secret,text){
  return Utilities.computeHmacSha256Signature(text,secret).map(function(b){return (b<0?b+256:b).toString(16).padStart(2,'0');}).join('');
}
function quranV9Same_(a,b){
  var x=String(a||''),y=String(b||''),bad=x.length^y.length;
  for(var i=0;i<Math.max(x.length,y.length);i++)bad|=(x.charCodeAt(i)||0)^(y.charCodeAt(i)||0);
  return bad===0;
}
function quranV9Email_(raw){
  var s=String(raw||'').trim().toLowerCase();
  if(s.length>160||!/^[a-z0-9][a-z0-9.!#$%&'*+/=?^_`{|}~-]*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(s))throw Error('Enter a valid guardian email.');
  return s;
}
function quranV9EmailHash_(gate,email){return quranV9Hmac_(gate.secret,'email|'+gate.schoolId+'|'+email);}
function quranV9Mask_(email){var at=email.indexOf('@');return at<0?'hidden':email.slice(0,1)+'***'+email.slice(at);}
function quranV9Links_(gate){return quranV8Rows_(gate.ss,QURAN_V9_GUARDIAN_TAB,QURAN_V9_GUARDIAN_HEADERS);}
function quranV9Approved_(gate,emailHash){return quranV9Links_(gate).filter(function(r){return String(r.emailHash)===emailHash&&String(r.status)==='approved';});}
function quranV9CacheKey_(gate,kind,value){return 'q9'+kind+'_'+quranV9Hmac_(gate.secret,gate.schoolId+'|'+kind+'|'+value).slice(0,44);}
function quranV9SchoolAdmin_(p,gate){
  if(p.role!=='school')throw Error('A verified school administrator is required.');
  var actor=verifySchoolAdminToken(p);
  if(!actor||!actor.id)throw Error('School admin session missing.');
  return actor;
}
function quranV9Public_(r){return {id:String(r.id),studentId:String(r.studentId),maskedEmail:quranV9Mask_(String(r.email)),relationship:String(r.relationship),status:String(r.status),createdAt:String(r.createdAt),updatedAt:String(r.updatedAt)};}
function quranV9ApprovedAction_(p,gate){
  var actor=quranV9SchoolAdmin_(p,gate);
  assertSchoolWritable(gate.schoolId);
  if(p.guardianRelationshipVerified!==true||['in-person','verified-school-record'].indexOf(String(p.verificationMethod||''))<0)
    throw Error('Administrator must verify the guardian relationship offline before approval.');
  var studentId=quranV8Id_(p.targetStudentId,'student ID'),email=quranV9Email_(p.email),hash=quranV9EmailHash_(gate,email);
  var relationship=String(p.relationship||'');
  if(['mother','father','legal-guardian','other-authorized'].indexOf(relationship)<0)throw Error('Select an approved relationship.');
  var ctx={role:'school',schoolId:gate.schoolId,ss:gate.ss};
  if(!getRecord(ctx,'students',studentId))throw Error('Student is not part of this school.');
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var sh=quranV8Table_(gate.ss,QURAN_V9_GUARDIAN_TAB,QURAN_V9_GUARDIAN_HEADERS,true);
    var rows=quranV9Links_(gate);
    var old=rows.find(function(r){return String(r.studentId)===studentId&&String(r.emailHash)===hash;});
    var now=new Date().toISOString(),id=old?String(old.id):genId('qguardian'),version=old?Number(old.version||0)+1:1;
    var next=[id,studentId,email,hash,relationship,'approved',actor.id,old?old.createdAt:now,now,version];
    if(old){var rowIndex=rows.findIndex(function(r){return String(r.id)===id;});sh.getRange(rowIndex+2,1,1,QURAN_V9_GUARDIAN_HEADERS.length).setValues([next]);}
    else sh.appendRow(next);
    writeAudit(gate.ss,gate.schoolId,actor,'quranGuardianApprove',QURAN_V9_GUARDIAN_TAB,id,null,{studentId:studentId,relationship:relationship});
    return {link:{id:id,studentId:studentId,maskedEmail:quranV9Mask_(email),relationship:relationship,status:'approved'}};
  }finally{lock.releaseLock();}
}
function quranV9Revoke_(p,gate){
  var actor=quranV9SchoolAdmin_(p,gate),linkId=quranV8Id_(p.linkId,'link ID');
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var sh=quranV8Table_(gate.ss,QURAN_V9_GUARDIAN_TAB,QURAN_V9_GUARDIAN_HEADERS,false);
    if(!sh)throw Error('Guardian link not found.');
    var rows=quranV9Links_(gate),i=rows.findIndex(function(r){return String(r.id)===linkId;});
    if(i<0)throw Error('Guardian link not found.');
    var old=rows[i],version=Number(old.version||0);
    if(old.status==='revoked')return {revoked:true,alreadyRevoked:true,linkId:linkId};
    var next=QURAN_V9_GUARDIAN_HEADERS.map(function(k){return old[k];});
    next[QURAN_V9_GUARDIAN_HEADERS.indexOf('status')]='revoked';
    next[QURAN_V9_GUARDIAN_HEADERS.indexOf('updatedAt')]=new Date().toISOString();
    next[QURAN_V9_GUARDIAN_HEADERS.indexOf('version')]=version+1;
    sh.getRange(i+2,1,1,next.length).setValues([next]);
    writeAudit(gate.ss,gate.schoolId,actor,'quranGuardianRevoke',QURAN_V9_GUARDIAN_TAB,linkId,null,{studentId:String(old.studentId),status:'revoked'});
    return {revoked:true,linkId:linkId};
  }finally{lock.releaseLock();}
}
function quranV9Start_(p,gate){
  if(p.role!=='guardian')throw Error('Use guardian verification to sign in.');
  var email=quranV9Email_(p.email),hash=quranV9EmailHash_(gate,email),cache=CacheService.getScriptCache();
  var response={message:QURAN_V9_GENERIC};
  var links=quranV9Approved_(gate,hash);
  if(!links.length)return response;
  var key=quranV9CacheKey_(gate,'c',hash),rate=quranV9CacheKey_(gate,'r',hash),hour=quranV9CacheKey_(gate,'h',hash);
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    if(cache.get(rate))return response;
    var count=Number(cache.get(hour)||0);
    if(count>=3)return response;
    var code=Utilities.getUuid().replace(/-/g,'').slice(0,10).toUpperCase();
    var challenge={digest:quranV9Hmac_(gate.secret,hash+'|'+code),attempts:0,expiresAt:Date.now()+QURAN_V9_CODE_SECONDS*1000};
    cache.put(key,JSON.stringify(challenge),QURAN_V9_CODE_SECONDS);
    cache.put(rate,'1',120);
    cache.put(hour,String(count+1),3600);
    try{
      if(MailApp.getRemainingDailyQuota()<1)throw Error('Email quota exceeded.');
      MailApp.sendEmail({to:email,subject:'LAMA Quran Academy — guardian sign-in code',body:'Your LAMA Quran Academy guardian verification code is: '+code+'\n\nThis code expires in 10 minutes. If you did not request it, ignore this message.\n\nNo student records are included in this email.'});
    }catch(err){cache.remove(key);throw Error('Guardian verification email could not be sent. Please contact the school.');}
  }finally{lock.releaseLock();}
  return response;
}
function quranV9Verify_(p,gate){
  if(p.role!=='guardian')throw Error('Use guardian verification to sign in.');
  var email=quranV9Email_(p.email),hash=quranV9EmailHash_(gate,email),code=String(p.code||'').trim().toUpperCase();
  if(!/^[0-9A-F]{10}$/.test(code))throw Error('Invalid or expired verification code.');
  var cache=CacheService.getScriptCache(),key=quranV9CacheKey_(gate,'c',hash),lock=LockService.getScriptLock();
  lock.waitLock(20000);
  try{
    var raw=cache.get(key);if(!raw)throw Error('Invalid or expired verification code.');
    var challenge=JSON.parse(raw),ttl=Math.ceil((Number(challenge.expiresAt)-Date.now())/1000);
    if(ttl<1||Number(challenge.attempts)>=5)throw Error('Invalid or expired verification code.');
    challenge.attempts=Number(challenge.attempts)+1;
    if(!quranV9Same_(challenge.digest,quranV9Hmac_(gate.secret,hash+'|'+code))){
      if(challenge.attempts>=5)cache.remove(key);else cache.put(key,JSON.stringify(challenge),ttl);
      throw Error('Invalid or expired verification code.');
    }
    cache.remove(key);
    var approved=quranV9Approved_(gate,hash);
    if(!approved.length)throw Error('Guardian authorization has expired. Contact your school.');
    var session={schoolId:gate.schoolId,emailHash:hash,links:approved.slice(0,30).map(function(r){return {id:String(r.id),version:Number(r.version||0)};}),expiresAt:Date.now()+QURAN_V9_SESSION_SECONDS*1000};
    var token=(Utilities.getUuid()+Utilities.getUuid()).replace(/-/g,'').toLowerCase();
    cache.put(quranV9CacheKey_(gate,'s',token),JSON.stringify(session),QURAN_V9_SESSION_SECONDS);
    return {token:token,expiresInSeconds:QURAN_V9_SESSION_SECONDS};
  }finally{lock.releaseLock();}
}
function quranV9Session_(p,gate){
  if(p.role!=='guardian')throw Error('Guardian session required.');
  var token=String(p.guardianToken||'').trim();
  if(!/^[a-f0-9]{64}$/.test(token))throw Error('Guardian session has expired.');
  var key=quranV9CacheKey_(gate,'s',token),raw=CacheService.getScriptCache().get(key);
  if(!raw)throw Error('Guardian session has expired.');
  var session=JSON.parse(raw);
  if(session.schoolId!==gate.schoolId||Number(session.expiresAt)<=Date.now())throw Error('Guardian session has expired.');
  var available=quranV9Approved_(gate,session.emailHash);
  var accessible=available.filter(function(r){return session.links.some(function(x){return x.id===String(r.id)&&x.version===Number(r.version||0);});});
  if(!accessible.length)throw Error('Guardian access is no longer authorized.');
  return {key:key,links:accessible};
}
function quranV9Children_(session,gate){
  var ctx={role:'school',schoolId:gate.schoolId,ss:gate.ss},result=[];
  session.links.forEach(function(link){
    var s=getRecord(ctx,'students',String(link.studentId));
    if(s)result.push({studentId:String(s.id),name:String(s.name||''),className:String(s.class||''),section:String(s.section||''),relationship:String(link.relationship||'')});
  });
  return {children:result};
}
function quranV9Progress_(p,session,gate){
  var id=quranV8Id_(p.targetStudentId,'student ID');
  if(!session.links.some(function(r){return String(r.studentId)===id;}))throw Error('Guardian is not approved for this student.');
  var ctx={role:'school',schoolId:gate.schoolId,ss:gate.ss},record=quranV8Progress_(ctx,id);
  return {student:record.student,practiceCount:record.practiceCount,practices:record.practices.map(function(x){return {lessonId:x.lessonId,kind:x.kind,createdAt:x.createdAt};}),reviews:record.reviews.map(function(r){return {lessonId:r.lessonId,status:r.status,reviewedAt:r.reviewedAt};})};
}
function quranV9Run_(p){
  p=p||{};
  var action=String(p.action||'');
  if(QURAN_V9_ACTIONS.indexOf(action)<0)throw Error('Unknown guardian action.');
  var gate=quranV9Gate_(p);
  if(action==='quranV9ApproveGuardian')return quranV9ApprovedAction_(p,gate);
  if(action==='quranV9RevokeGuardian')return quranV9Revoke_(p,gate);
  if(action==='quranV9ListGuardianLinks'){
    quranV9SchoolAdmin_(p,gate);
    var links=quranV9Links_(gate);
    return {links:links.slice(0,150).map(quranV9Public_),truncated:links.length>150};
  }
  if(action==='quranV9RequestGuardianCode')return quranV9Start_(p,gate);
  if(action==='quranV9VerifyGuardianCode')return quranV9Verify_(p,gate);
  if(action==='quranV9GuardianLogout'){
    if(p.role!=='guardian')throw Error('Guardian session required.');
    var token=String(p.guardianToken||'').trim();
    if(/^[a-f0-9]{64}$/.test(token))CacheService.getScriptCache().remove(quranV9CacheKey_(gate,'s',token));
    return {signedOut:true};
  }
  var session=quranV9Session_(p,gate);
  if(action==='quranV9GuardianChildren')return quranV9Children_(session,gate);
  if(action==='quranV9GuardianProgress')return quranV9Progress_(p,session,gate);
  throw Error('Unsupported guardian action.');
}