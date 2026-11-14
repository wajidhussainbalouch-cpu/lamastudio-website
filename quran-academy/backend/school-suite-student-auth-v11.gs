/**
 * Shared LAMA School Suite student authentication — v11 pilot only.
 * Same Students rows + same student IDs. No independent identities, login UI or database.
 * Install in the SAME Apps Script project as School Suite Code.gs, never deploy alone.
 * DISABLED UNLESS both Script Properties are set:
 *   QURAN_V11_STUDENT_AUTH_ENABLED=true
 *   QURAN_V11_STUDENT_AUTH_SCHOOLS=comma-separated disposable test school IDs
 * and QURAN_V11_STUDENT_AUTH_PEPPER is a private random string of 40+ characters.
 *
 * Requires an isolated test deployment and test spreadsheet. DO NOT enable for
 * a school with real children. Password provisioning clears legacy plaintext
 * password and persistent API key for that ONE learner; it is not reversible
 * by switching the feature flag off.
 */
var Q11_AUTH_FIELDS_=['q11Salt','q11Hash','q11Rounds','q11Version'];
var Q11_SESSION_SECONDS_=900;
var Q11_LOGIN_WINDOW_SECONDS_=900;
var Q11_LOGIN_MAX_FAILURES_=5;

function q11Enabled_(schoolId){
  var p=PropertiesService.getScriptProperties();
  return p.getProperty('QURAN_V11_STUDENT_AUTH_ENABLED')==='true' &&
    String(p.getProperty('QURAN_V11_STUDENT_AUTH_SCHOOLS')||'')
      .split(',').map(function(s){return s.trim();}).indexOf(String(schoolId))!==-1;
}
function q11Settings_(schoolId){
  if(!q11Enabled_(schoolId))throw Error('Student authentication pilot not enabled.');
  var p=PropertiesService.getScriptProperties(),pepper=String(p.getProperty('QURAN_V11_STUDENT_AUTH_PEPPER')||'');
  if(pepper.length<40)throw Error('Student authentication secret is not configured.');
  var rounds=Number(p.getProperty('QURAN_V11_PBKDF2_ROUNDS')||60000);
  if(!Number.isInteger(rounds)||rounds<20000||rounds>150000)throw Error('PBKDF2 rounds must be 20000–150000.');
  return {pepper:pepper,rounds:rounds};
}
function q11Hex_(bytes){
  return bytes.map(function(b){return ((Number(b)+256)&255).toString(16).padStart(2,'0');}).join('');
}
function q11ConstantEqual_(x,y){
  x=String(x||'');y=String(y||'');var diff=x.length^y.length;
  for(var i=0;i<Math.max(x.length,y.length);i++)diff|=(x.charCodeAt(i)||0)^(y.charCodeAt(i)||0);
  return diff===0;
}
/** PBKDF2-HMAC-SHA256; peppered input key, random salt, domain-separated per learner.
 * Benchmarks and independent cryptographic review required before real-user release. */
function q11Derive_(password,settings,schoolId,studentId,salt,rounds){
  var key=Utilities.computeHmacSha256Signature(String(password),settings.pepper);
  var saltBytes=Utilities.newBlob('q11|'+schoolId+'|'+studentId+'|'+salt).getBytes();
  var prev=Utilities.computeHmacSha256Signature(saltBytes.concat([0,0,0,1]),key);
  var derived=prev.map(function(b){return (b+256)&255;});
  for(var i=1;i<rounds;i++){
    prev=Utilities.computeHmacSha256Signature(prev,key);
    for(var j=0;j<32;j++)derived[j]^=(prev[j]+256)&255;
  }
  return q11Hex_(derived);
}
function q11CacheKey_(settings,kind,value){
  return 'q11_'+kind+'_'+q11Hex_(Utilities.computeHmacSha256Signature(kind+'|'+value,settings.pepper)).slice(0,44);
}
function q11Sheet_(schoolMatch,extend){
  var ss=SpreadsheetApp.openById(schoolMatch.obj.sheetId);
  var sh=ss.getSheetByName(COLLECTIONS.students.tab);
  if(!sh)throw Error('School Students sheet is not available.');
  if(extend)ensureSheetHeaders(sh,Q11_AUTH_FIELDS_);
  var headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  return {ss:ss,sheet:sh,headers:headers};
}
function q11Find_(sheetInfo,field,value){
  var data=sheetInfo.sheet.getDataRange().getValues();
  var pos=sheetInfo.headers.indexOf(field);
  if(pos<0)throw Error('Student sheet missing '+field+'.');
  var found=null;
  for(var i=1;i<data.length;i++){
    if(String(data[i][pos])===String(value)){
      // Ambiguous enrollment or IDs must never select an arbitrary learner.
      if(found)throw Error('Student record conflict. Contact school administrator.');
      found={row:i+1,record:rowToRecord(sheetInfo.headers,data[i])};
    }
  }
  return found;
}
function q11School_(schoolId){
  var match=findSchoolRow(getRegistrySheet(),function(s){return String(s.schoolId)===String(schoolId);});
  if(!match||match.obj.status!=='Active')throw Error('School is unavailable.');
  return match;
}
function q11StudentId_(value){
  var id=String(value||'').trim();
  if(!/^[a-zA-Z0-9_-]{1,90}$/.test(id))throw Error('Invalid student ID.');
  return id;
}
function q11StrongPassword_(password,student){
  if(typeof password!=='string'||password.length<12||password.length>128)throw Error('Password must be 12–128 characters.');
  var norm=password.toLowerCase().replace(/\s+/g,'');
  if(String(password)===String(student.enrlNo)||norm===String(student.name||'').toLowerCase().replace(/\s+/g,''))
    throw Error('Choose a stronger password.');
  // Block obviously guessable examples while allowing memorable long passphrases.
  if(/^(.)\1{11,}$/.test(password) ||
     /^(?:1234567890|0987654321|0123456789)+$/.test(password) ||
     ['password123456','password12345678','admin12345678','qwerty123456','welcome123456'].indexOf(norm)!==-1)
    throw Error('That password is too predictable. Use a longer, unique passphrase.');
}
/** School admin provisions an EXISTING fictional student; no account creation. */
function q11Provision_(p){
  if(p.role!=='school')throw Error('School administrator required.');
  var settings=q11Settings_(p.schoolId),match=q11School_(p.schoolId);
  var actor=verifySchoolAdminToken(p);
  if(!actor||!actor.id)throw Error('School administrator session invalid.');
  if(p.studentIdentityVerified!==true||['in-person','verified-school-record'].indexOf(String(p.verificationMethod))===-1)
    throw Error('Administrator must verify learner identity before credential change.');
  assertSchoolWritable(p.schoolId);
  var id=q11StudentId_(p.targetStudentId),lock=LockService.getScriptLock();
  lock.waitLock(20000);
  try{
    var info=q11Sheet_(match,true),found=q11Find_(info,'id',id);
    if(!found)throw Error('Student is not enrolled in this school.');
    q11StrongPassword_(p.newPassword,found.record);
    var salt=(Utilities.getUuid()+Utilities.getUuid()).replace(/-/g,'');
    var hash=q11Derive_(p.newPassword,settings,p.schoolId,id,salt,settings.rounds);
    var next=Object.assign({},found.record,{q11Salt:salt,q11Hash:hash,q11Rounds:settings.rounds,
      q11Version:Number(found.record.q11Version||0)+1,password:'',apiKey:''});
    info.sheet.getRange(found.row,1,1,info.headers.length).setValues([recordToRow(info.headers,next)]);
    writeAudit(info.ss,p.schoolId,actor,'q11StudentCredentialProvision','students',id,null,{studentId:id,version:next.q11Version});
    return {studentId:id,provisioned:true,sessionInvalidated:true};
  }finally{lock.releaseLock();}
}
function q11Login_(schoolMatch,schoolId,enrlNo,password){
  var settings=q11Settings_(schoolId);
  if(!enrlNo||!password||typeof password!=='string'||password.length>128)throw Error('Invalid school or student credentials.');
  var info=q11Sheet_(schoolMatch,false),found=q11Find_(info,'enrlNo',enrlNo);
  var cache=CacheService.getScriptCache(),rate=q11CacheKey_(settings,'fail',schoolId+'|'+String(enrlNo).trim());
  // Reserve an attempt under a script lock BEFORE doing expensive password work.
  // CacheService is best-effort: an independent rate limiter is still needed
  // for public production use (including distributed abusive traffic).
  var lock=LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var failures=Number(cache.get(rate)||0);
    if(failures>=Q11_LOGIN_MAX_FAILURES_)throw Error('Too many attempts. Try again later.');
    cache.put(rate,String(failures+1),Q11_LOGIN_WINDOW_SECONDS_);
  } finally { lock.releaseLock(); }
  var candidate=found&&found.record;
  var good=false;
  if(candidate&&candidate.q11Hash&&candidate.q11Salt&&Number(candidate.q11Rounds)>=20000){
    var attempted=q11Derive_(password,settings,schoolId,String(candidate.id),String(candidate.q11Salt),Number(candidate.q11Rounds));
    good=q11ConstantEqual_(attempted,candidate.q11Hash);
  }
  if(!good){
    throw Error('Invalid school or student credentials.');
  }
  cache.remove(rate);
  var token='q11_'+(Utilities.getUuid()+Utilities.getUuid()).replace(/-/g,'').toLowerCase();
  var key=q11CacheKey_(settings,'session',schoolId+'|'+token);
  var details={schoolId:schoolId,studentId:String(candidate.id),version:Number(candidate.q11Version||0),expires:Date.now()+Q11_SESSION_SECONDS_*1000};
  cache.put(key,JSON.stringify(details),Q11_SESSION_SECONDS_);
  return {schoolId:schoolId,studentId:String(candidate.id),apiKey:token,name:String(candidate.name||''),
    class:candidate.class,section:candidate.section||'',schoolName:schoolMatch.obj.name,schoolLogo:schoolMatch.obj.logo};
}
function q11Authorize_(schoolMatch,schoolId,studentId,token){
  var settings=q11Settings_(schoolId);
  if(!/^q11_[a-f0-9]{64}$/.test(String(token||'')))throw Error('Student session expired. Please sign in again.');
  var key=q11CacheKey_(settings,'session',schoolId+'|'+token);
  var cached=CacheService.getScriptCache().get(key);
  if(!cached)throw Error('Student session expired. Please sign in again.');
  var details=JSON.parse(cached);
  if(details.schoolId!==schoolId||details.studentId!==String(studentId)||Number(details.expires)<=Date.now())
    throw Error('Student session expired. Please sign in again.');
  var info=q11Sheet_(schoolMatch,false),found=q11Find_(info,'id',studentId);
  if(!found||!found.record.q11Hash||Number(found.record.q11Version)!==Number(details.version))
    throw Error('Student credentials changed. Please sign in again.');
  return {schoolMatch:schoolMatch,student:found.record,ss:info.ss};
}
function q11Logout_(p){
  var schoolId=String(p.schoolId||''),match=q11School_(schoolId);
  q11Authorize_(match,schoolId,p.studentId,p.apiKey);
  var settings=q11Settings_(schoolId);
  CacheService.getScriptCache().remove(q11CacheKey_(settings,'session',schoolId+'|'+p.apiKey));
  return {signedOut:true};
}
