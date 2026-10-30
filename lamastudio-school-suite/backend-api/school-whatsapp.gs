/**
 * School-owned WhatsApp Cloud API integration.
 * Install alongside code.gs in the SAME Apps Script project.
 * Credentials live in Script Properties, NEVER Sheets or browser storage.
 * Each school supplies its own Meta Cloud API token and phone number ID.
 * Meta templates, parent consent and messaging charges are the school's responsibility.
 */
function waSchoolKey_(schoolId){return 'LAMA_WA_'+Utilities.base64EncodeWebSafe(String(schoolId)).replace(/=+$/,'');}
function waConfig_(schoolId){const raw=PropertiesService.getScriptProperties().getProperty(waSchoolKey_(schoolId));return raw?JSON.parse(raw):null;}
function waAdmin_(p){requireSchoolAdminWrite(p);return String(p.schoolId);}
function waSettings_(p){
 const schoolId=waAdmin_(p),cfg=waConfig_(schoolId);
 return {connected:!!(cfg&&cfg.token&&cfg.phoneNumberId),phoneNumberId:cfg?cfg.phoneNumberId:'',businessName:cfg?cfg.businessName:'',updatedAt:cfg?cfg.updatedAt:'',tokenStored:!!(cfg&&cfg.token)};
}
function waConnect_(p){
 const schoolId=waAdmin_(p),v=p.configuration||{};
 const token=String(v.accessToken||'').trim(),phoneId=String(v.phoneNumberId||'').trim();
 if(!/^[0-9]{5,30}$/.test(phoneId))throw Error('Enter a valid Meta phone number ID.');
 if(!token||token.length<20||token.length>4096)throw Error('A valid school-owned Meta access token is required.');
 const url='https://graph.facebook.com/v22.0/'+phoneId+'?fields=display_phone_number,verified_name';
 const response=UrlFetchApp.fetch(url,{method:'get',headers:{Authorization:'Bearer '+token},muteHttpExceptions:true});
 if(response.getResponseCode()!==200)throw Error('Meta verification failed. Check your school token, phone number ID and permissions.');
 const detail=JSON.parse(response.getContentText());
 const cfg={token:token,phoneNumberId:phoneId,businessName:String(detail.verified_name||v.businessName||'').slice(0,100),updatedAt:new Date().toISOString()};
 PropertiesService.getScriptProperties().setProperty(waSchoolKey_(schoolId),JSON.stringify(cfg));
 return {connected:true,phoneNumberId:phoneId,businessName:cfg.businessName,updatedAt:cfg.updatedAt};
}
function waDisconnect_(p){const schoolId=waAdmin_(p);PropertiesService.getScriptProperties().deleteProperty(waSchoolKey_(schoolId));return {connected:false};}
function waSendTemplates_(p){
 const schoolId=waAdmin_(p),cfg=waConfig_(schoolId);
 if(!cfg||!cfg.token)throw Error('Connect this school’s WhatsApp Business account first.');
 const recipients=p.recipients;
 if(!Array.isArray(recipients)||!recipients.length||recipients.length>20)throw Error('Send between 1 and 20 recipients per request.');
 const template=String(p.templateName||'').trim(),language=String(p.language||'en').trim();
 if(!/^[a-z][a-z0-9_]{0,100}$/.test(template))throw Error('Enter an approved Meta template name.');
 if(!/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(language))throw Error('Invalid template language.');
 const ctx=resolveContext(p),records=listRecords(ctx,'students');
 const byId=new Map(records.map(s=>[String(s.id),s]));
 const sent=[],seen=new Set();
 recipients.forEach(item=>{
  const s=byId.get(String(item.studentId||''));
  if(!s){sent.push({studentId:String(item.studentId||''),status:'skipped',reason:'Student not found'});return;}
  const consent=[true,'true','yes','1','opted-in'];
  if(!consent.includes(s.whatsappConsent)&&!consent.includes(s.parentWhatsAppConsent)){sent.push({studentId:s.id,status:'skipped',reason:'Parent WhatsApp consent not recorded'});return;}
  let phone=String(s.whatsapp||s.contact||'').replace(/\D/g,'');
  if(phone.startsWith('0')&&phone.length===11)phone='92'+phone.slice(1);
  if(!/^[1-9][0-9]{9,14}$/.test(phone)){sent.push({studentId:s.id,status:'skipped',reason:'Invalid parent number'});return;}
  if(seen.has(phone)){sent.push({studentId:s.id,status:'skipped',reason:'Duplicate parent number in batch'});return;}
  seen.add(phone);
  const body={messaging_product:'whatsapp',to:phone,type:'template',template:{name:template,language:{code:language}}};
  try{
   const response=UrlFetchApp.fetch('https://graph.facebook.com/v22.0/'+cfg.phoneNumberId+'/messages',{method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+cfg.token},payload:JSON.stringify(body),muteHttpExceptions:true});
   const ok=response.getResponseCode()>=200&&response.getResponseCode()<300;
   let data={};try{data=JSON.parse(response.getContentText())}catch(_){}
   sent.push({studentId:s.id,status:ok?'accepted':'failed',messageId:ok&&data.messages&&data.messages[0]?data.messages[0].id:'',reason:ok?'Accepted by Meta; delivery unconfirmed':'Meta rejected message (HTTP '+response.getResponseCode()+')'});
  }catch(e){sent.push({studentId:s.id,status:'failed',reason:'Request failed'});}
 });
 return {results:sent,accepted:sent.filter(x=>x.status==='accepted').length,failed:sent.filter(x=>x.status==='failed').length,skipped:sent.filter(x=>x.status==='skipped').length};
}
