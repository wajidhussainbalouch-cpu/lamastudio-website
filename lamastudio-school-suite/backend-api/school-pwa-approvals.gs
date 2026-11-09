/**
 * Super Admin-controlled per-school branded PWA permission.
 * Install in the SAME Apps Script project as code.gs; publish a new VERSION.
 * A school can edit its normal logo/name, but cannot grant itself PWA access.
 * No private registry fields or school credentials are exposed publicly.
 */
var LAMA_PWA_HEADERS_=['schoolId','enabled','updatedAt','updatedBy'];
var LAMA_PWA_AUDIT_HEADERS_=['eventId','schoolId','previous','current','updatedAt','updatedBy'];
function lamaPwaSheet_(create,name,headers){
  var ss=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('MASTER_SHEET_ID'));
  var sheet=ss.getSheetByName(name);
  if(!sheet&&create){sheet=ss.insertSheet(name);sheet.appendRow(headers);}
  if(!sheet)return null;
  var actual=sheet.getRange(1,1,1,headers.length).getValues()[0].map(String);
  if(headers.some(function(h,i){return actual[i]!==h;}))throw Error('PWA approval storage schema mismatch');
  return sheet;
}
function lamaPwaGrant_(schoolId){
  var sheet=lamaPwaSheet_(false,'SchoolPwaApprovals',LAMA_PWA_HEADERS_);
  if(!sheet||sheet.getLastRow()<2)return {enabled:false,updatedAt:''};
  var rows=sheet.getRange(2,1,sheet.getLastRow()-1,LAMA_PWA_HEADERS_.length).getValues();
  var found=rows.filter(function(row){return String(row[0])===String(schoolId);});
  if(found.length>1)throw Error('Duplicate school PWA grants: contact Super Admin');
  return found.length?{enabled:found[0][1]===true||found[0][1]==='TRUE',updatedAt:String(found[0][2]||'')}:{enabled:false,updatedAt:''};
}
function lamaAdminSetSchoolPwaAccess_(adminApiKey,schoolId,enabled){
  authorizeAdmin(adminApiKey);
  schoolId=String(schoolId||'').trim();
  if(!schoolId||typeof enabled!=='boolean')throw Error('Valid school and explicit permission required');
  var school=findSchoolRow(getRegistrySheet(),function(r){return String(r.schoolId)===schoolId;});
  if(!school)throw Error('School not found');
  var lock=LockService.getScriptLock();
  if(!lock.tryLock(20000))throw Error('PWA permission busy. Retry after refreshing.');
  try{
    var sheet=lamaPwaSheet_(true,'SchoolPwaApprovals',LAMA_PWA_HEADERS_);
    var rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,4).getValues():[];
    var matches=[];
    rows.forEach(function(r,i){if(String(r[0])===schoolId)matches.push(i+2);});
    if(matches.length>1)throw Error('Duplicate school PWA grants');
    var previous=matches.length?(rows[matches[0]-2][1]===true||rows[matches[0]-2][1]==='TRUE'):false;
    var now=new Date().toISOString(),actor='super-admin';
    if(matches.length)sheet.getRange(matches[0],1,1,4).setValues([[schoolId,enabled,now,actor]]);
    else sheet.appendRow([schoolId,enabled,now,actor]);
    lamaPwaSheet_(true,'SchoolPwaApprovalAudit',LAMA_PWA_AUDIT_HEADERS_)
      .appendRow([Utilities.getUuid(),schoolId,previous,enabled,now,actor]);
    SpreadsheetApp.flush();
    return {schoolId:schoolId,enabled:enabled,updatedAt:now};
  }finally{lock.releaseLock();}
}
function lamaAdminGetSchoolPwaAccess_(adminApiKey,schoolId){
  authorizeAdmin(adminApiKey);
  var match=findSchoolRow(getRegistrySheet(),function(r){return String(r.schoolId)===String(schoolId);});
  if(!match)throw Error('School not found');
  return {schoolId:String(schoolId),enabled:lamaPwaGrant_(schoolId).enabled,updatedAt:lamaPwaGrant_(schoolId).updatedAt};
}
function lamaSchoolPwaStatus_(schoolId,apiKey){
  var match=authorizeSchool(schoolId,apiKey);
  var grant=lamaPwaGrant_(schoolId);
  return {enabled:grant.enabled&&match.obj.status==='Active',updatedAt:grant.updatedAt,
    hasLogo:/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(String(match.obj.logo||''))};
}
/** Public read-only branding only AFTER server-side Super Admin approval. */
function lamaPublicSchoolPwa_(schoolId){
  schoolId=String(schoolId||'').trim();
  if(!/^[A-Za-z0-9_-]{4,100}$/.test(schoolId))throw Error('Invalid school identifier');
  var match=findSchoolRow(getRegistrySheet(),function(r){return String(r.schoolId)===schoolId;});
  if(!match||match.obj.status!=='Active'||!lamaPwaGrant_(schoolId).enabled)
    throw Error('School-branded app is not authorized');
  var name=String(match.obj.name||'').trim();
  var logo=String(match.obj.logo||'');
  if(!name||name.length>120)throw Error('Valid school name required');
  if(!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(logo)||logo.length>60000)
    throw Error('Upload a school logo in School Settings to enable the custom app icon');
  return {schoolId:schoolId,name:name,logo:logo};
}
