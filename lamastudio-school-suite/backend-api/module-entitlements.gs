/** Additive Apps Script module entitlement backend. Not deployed or routed yet.
 * Install alongside existing code.gs after live backend review. */
var LAMA_MODULE_GRANT_HEADERS_=['schoolId','module','status','startsAt','expiresAt','revision','updatedAt'];
function lamaGrantSheet_(create){
 var ss=getRegistrySheet().getParent(),s=ss.getSheetByName('ModuleEntitlements');
 if(!s&&create){s=ss.insertSheet('ModuleEntitlements');s.appendRow(LAMA_MODULE_GRANT_HEADERS_)}
 if(!s)return null;
 var h=s.getRange(1,1,1,7).getValues()[0];
 if(h.join('|')!==LAMA_MODULE_GRANT_HEADERS_.join('|'))throw Error('Module grant schema mismatch');
 return s;
}
function lamaModuleAccess_(schoolId,module){
 if(['schoolManagement','examination','smartMarker','quranLearning'].indexOf(module)<0)throw Error('Unknown module');
 var s=lamaGrantSheet_(false);if(!s)return {allowed:false,reason:'ENTITLEMENT_REQUIRED'};
 var rows=s.getDataRange().getValues().slice(1).filter(function(r){return String(r[0])===String(schoolId)&&r[1]===module});
 if(!rows.length)return {allowed:false,reason:'ENTITLEMENT_REQUIRED'};
 rows.sort(function(a,b){return Number(b[5])-Number(a[5])});
 if(rows.length>1&&Number(rows[0][5])===Number(rows[1][5]))return {allowed:false,reason:'GRANT_CONFLICT'};
 var g=rows[0],now=Date.now();
 if(!Number.isSafeInteger(Number(g[5]))||Number(g[5])<1)return {allowed:false,reason:'INVALID_REVISION'};
 if(g[2]!=='active')return {allowed:false,reason:'ENTITLEMENT_'+String(g[2]).toUpperCase()};
 if(!g[3]||!g[4]||!Number.isFinite(Date.parse(g[3]))||!Number.isFinite(Date.parse(g[4])))return {allowed:false,reason:'INVALID_GRANT_DATES'};
 if(now<Date.parse(g[3]))return {allowed:false,reason:'NOT_STARTED'};
 if(now>=Date.parse(g[4]))return {allowed:false,reason:'EXPIRED'};
 return {allowed:true,revision:Number(g[5])};
}
function lamaAdminSetModuleGrant_(adminApiKey,schoolId,module,status,start,end){
 authorizeAdmin(adminApiKey);
 if(!findSchoolRow(getRegistrySheet(),function(r){return String(r.schoolId)===String(schoolId)}))throw Error('School not found');
 if(['schoolManagement','examination','smartMarker','quranLearning'].indexOf(module)<0||['active','suspended','revoked'].indexOf(status)<0)throw Error('Invalid grant');
 function iso(s){if(!s)return '';if(typeof s!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(Date.parse(s)).toISOString()!==s.replace('Z','.000Z'))throw Error('Invalid UTC timestamp');return s}
 start=iso(start);end=iso(end);
 if(status==='active'&&(!start||!end))throw Error('Active module grants require start and expiry dates');
 if(start&&end&&Date.parse(end)<=Date.parse(start))throw Error('Invalid interval');
 if(status==='active'&&Date.parse(end)<=Date.now())throw Error('Cannot activate an already expired grant');
 var lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  var s=lamaGrantSheet_(true),rows=s.getDataRange().getValues().slice(1).filter(function(r){return String(r[0])===String(schoolId)&&r[1]===module});
  var rev=rows.reduce(function(n,r){return Math.max(n,Number(r[5])||0)},0)+1;
  s.appendRow([schoolId,module,status,start,end,rev,new Date().toISOString()]);
  return {schoolId:schoolId,module:module,status:status,revision:rev};
 }finally{lock.releaseLock()}
}

function lamaAdminGetModuleGrant_(adminApiKey,schoolId,module){
 authorizeAdmin(adminApiKey);
 if(['schoolManagement','examination','smartMarker','quranLearning'].indexOf(module)<0)throw Error('Unknown module');
 if(!findSchoolRow(getRegistrySheet(),function(r){return String(r.schoolId)===String(schoolId)}))throw Error('School not found');
 var sheet=lamaGrantSheet_(false);
 if(!sheet)return null;
 var rows=sheet.getDataRange().getValues().slice(1).filter(function(r){return String(r[0])===String(schoolId)&&String(r[1])===module});
 rows.sort(function(a,b){return Number(b[5])-Number(a[5])});
 if(!rows.length)return null;
 if(rows.length>1&&Number(rows[0][5])===Number(rows[1][5]))throw Error('Conflicting grant revisions');
 var r=rows[0];return {schoolId:String(r[0]),module:String(r[1]),status:String(r[2]),startsAt:r[3]||'',expiresAt:r[4]||'',revision:Number(r[5])};
}

/**
 * Server-side entitlement guard for trusted examination / marking handlers.
 * Call only AFTER the handler has authenticated its principal and resolved
 * the schoolId from that verified session (never from request body alone).
 * No existing handler is automatically protected merely by adding this file.
 */
function lamaRequireModuleForVerifiedSchool_(verifiedSchoolId,module){
 if(typeof verifiedSchoolId!=='string'||!verifiedSchoolId.trim())throw Error('UNAUTHORIZED: Verified school context required');
 if(['examination','smartMarker','schoolManagement','quranLearning'].indexOf(module)<0)throw Error('INVALID_MODULE');
 var access=lamaModuleAccess_(verifiedSchoolId,module);
 if(!access.allowed)throw Error('ENTITLEMENT_REQUIRED: '+access.reason);
 return access;
}

/**
 * Compatibility for the existing syllabusPublishedPlans handler.
 * IMPORTANT: this helper only checks entitlement; caller MUST first authenticate
 * the teacher and enforce tenant, class and subject scope.
 */
function lamaSchoolHasModuleGrant_(verifiedSchoolId,module){
 return lamaRequireModuleForVerifiedSchool_(verifiedSchoolId,module).allowed===true;
}
