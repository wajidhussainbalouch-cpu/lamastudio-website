/**
 * LAMA Quran & Islamic Learning Academy — v12 supervised recovery.
 * Development TEST environments only. Install alongside existing School Suite
 * Code.gs + v11 student auth addon in the SAME Apps Script test project.
 * Uses existing school registry and Students tab. No new identity registry.
 *
 * All required script properties (missing = deny):
 * QURAN_V12_RECOVERY_ENABLED=true
 * QURAN_V12_RECOVERY_ENVIRONMENT=ISOLATED_TEST
 * QURAN_V12_RECOVERY_SCHOOLS=an exact comma-separated TEST school allowlist
 * QURAN_V12_EXPECTED_TEST_SCHOOL_ID=one exact test school ID
 * Plus v11 student-auth allowlist, pepper and hashing configuration.
 *
 * Preview does not write student records. Commit consumes a one-time challenge.
 * Repeated requests and stale credential versions fail closed.
 * This is NOT production-ready credential or guardian recovery.
 */
var Q12_RECOVERY_TTL_=300;
var Q12_CONFIRM_PREFIX_='RECOVER ';

function q12RecoveryEnabled_(schoolId) {
  var prop=PropertiesService.getScriptProperties();
  return prop.getProperty('QURAN_V12_RECOVERY_ENABLED')==='true' &&
    prop.getProperty('QURAN_V12_RECOVERY_ENVIRONMENT')==='ISOLATED_TEST' &&
    String(prop.getProperty('QURAN_V12_EXPECTED_TEST_SCHOOL_ID')||'')===String(schoolId) &&
    String(prop.getProperty('QURAN_V12_RECOVERY_SCHOOLS')||'')
      .split(',').map(function(s){return s.trim();}).indexOf(String(schoolId))!==-1;
}
function q12Gate_(p) {
  if(!p || p.role!=='school')throw Error('Verified school administrator required.');
  var schoolId=q11StudentId_(p.schoolId);
  if(!q12RecoveryEnabled_(schoolId))throw Error('Recovery pilot not enabled for this school.');
  var settings=q11Settings_(schoolId);  // independent existing v11 gate
  var match=q11School_(schoolId);        // existing active-school registry
  var actor=verifySchoolAdminToken(p);
  if(!actor||!actor.id)throw Error('Verified school administrator required.');
  if(p.studentIdentityVerified!==true ||
     ['in-person','verified-school-record'].indexOf(String(p.verificationMethod))<0)
    throw Error('Administrator must verify learner identity before account recovery.');
  assertSchoolWritable(schoolId);
  return {schoolId:schoolId,settings:settings,match:match,actor:actor};
}
function q12Token_(p) {
  var token=String(p.recoveryToken||'');
  if(!/^[a-f0-9]{64}$/.test(token))throw Error('Recovery approval expired. Request a new preview.');
  return token;
}
function q12Code_(gate,token) {
  return q11CacheKey_(gate.settings,'recover',gate.schoolId+'|'+token);
}
function q12Preview_(p) {
  var gate=q12Gate_(p),studentId=q11StudentId_(p.targetStudentId);
  var info=q11Sheet_(gate.match,false),found=q11Find_(info,'id',studentId);
  if(!found)throw Error('Learner not found in this test school.');
  var record=found.record;
  var token=(Utilities.getUuid()+Utilities.getUuid()).replace(/-/g,'').toLowerCase();
  var code=q12Code_(gate,token);
  var challenge={schoolId:gate.schoolId,studentId:studentId,adminId:String(gate.actor.id),
     credentialVersion:Number(record.q11Version||0),expiresAt:Date.now()+Q12_RECOVERY_TTL_*1000};
  CacheService.getScriptCache().put(code,JSON.stringify(challenge),Q12_RECOVERY_TTL_);
  return {studentId:studentId,className:String(record.class||''),
    needsInitialProvision:!Boolean(record.q11Hash),
    expiresInSeconds:Q12_RECOVERY_TTL_,recoveryToken:token,
    warning:'Test school only. Proceeding clears old login credentials and revokes existing sessions.'};
}
function q12Commit_(p) {
  var gate=q12Gate_(p),studentId=q11StudentId_(p.targetStudentId),token=q12Token_(p);
  if(String(p.confirmText||'')!==Q12_CONFIRM_PREFIX_+studentId)
    throw Error('Type RECOVER followed by the exact student ID.');
  if(typeof p.newPassword!=='string'||p.newPassword.length<12||p.newPassword.length>128)
    throw Error('New password must be 12–128 characters.');
  var key=q12Code_(gate,token),lock=LockService.getScriptLock(),challenge;
  lock.waitLock(20000);
  try {
    var raw=CacheService.getScriptCache().get(key);
    if(!raw)throw Error('Recovery approval expired or already used.');
    challenge=JSON.parse(raw);
    if(challenge.schoolId!==gate.schoolId || challenge.studentId!==studentId ||
       challenge.adminId!==String(gate.actor.id) || Number(challenge.expiresAt)<=Date.now())
      throw Error('Recovery approval is invalid or expired.');
    // Only one request can consume this approval. A network retry must preview again.
    CacheService.getScriptCache().remove(key);
  } finally { lock.releaseLock(); }
  // q11Provision_ acquires its own lock and validates credential version inside
  // the locked row update; no nested ScriptLock to deadlock.
  var result=q11Provision_(Object.assign({},p,{
    targetStudentId:studentId,expectedCredentialVersion:Number(challenge.credentialVersion)
  }));
  return {studentId:result.studentId,recovered:true,sessionInvalidated:result.sessionInvalidated};
}
function q12RecoveryRun_(p) {
  if(!p || !['quranV12RecoveryPreview','quranV12RecoveryCommit'].includes(String(p.action)))
    throw Error('Unknown student recovery operation.');
  return p.action==='quranV12RecoveryPreview'?q12Preview_(p):q12Commit_(p);
}
