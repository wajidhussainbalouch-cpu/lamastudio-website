/* LAMA School Suite: bilingual parent absence/leave composer.
   Manually opens WhatsApp or SMS. No delivery, consent or contact is inferred. */
(function(root){
 'use strict';
 const records=new Map();
 const norm=v=>String(v==null?'':v).trim();
 const allowed=new Set(['absent','leave']);
 function normalizeStatus(status){const s=norm(status).toLowerCase();return s==='a'?'absent':s==='l'||s==='on leave'?'leave':s}
 function phone(value){
  let raw=norm(value).replace(/[\s().-]/g,'');
  if(raw.startsWith('00'))raw='+'+raw.slice(2);
  const digits=raw.replace(/\D/g,'');
  if(/^03\d{9}$/.test(digits))return {wa:'92'+digits.slice(1),sms:'+92'+digits.slice(1),display:raw};
  if(/^923\d{9}$/.test(digits))return {wa:digits,sms:'+'+digits,display:raw};
  // Other correctly formed international numbers may be used with explicit country codes.
  if(raw.startsWith('+')&&/^\d{10,15}$/.test(digits))return {wa:digits,sms:'+'+digits,display:raw};
  return null;
 }
 function pickContact(student){
  const keys=['parentWhatsApp','guardianWhatsApp','whatsapp','guardianCell','fatherMobile','parentPhone','contact','phone','mobile','emergencyContact'];
  for(const key of keys){const v=student?.[key];if(norm(v)){const p=phone(v);if(p)return p}}
  return null;
 }
 function dateDisplay(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return norm(value);
  const [y,m,d]=value.split('-');return d+'-'+m+'-'+y;
 }
 function labels(value){
  const s=norm(value).toLowerCase();return s==='both'?'both':s==='english'?'english':'urdu';
 }
 function message(entry,language){
  const name=norm(entry.name)||'your child',klass=norm(entry.className)||'—',
    date=dateDisplay(entry.date),school=norm(entry.schoolName)||'School Administration',isAbsent=entry.status==='absent';
  const urdu=isAbsent?
   'محترم والدین / سرپرست!\nآپ کو مطلع کیا جاتا ہے کہ آپ کا بچہ '+name+'، جماعت '+klass+'، مورخہ '+date+' کو سکول میں غیر حاضر درج ہے۔\nبراہِ کرم غیر حاضری کی وجہ بتائیں اور بچے کی باقاعدہ حاضری یقینی بنائیں۔ اگر بچہ بیمار ہے یا کوئی مشکل درپیش ہے تو سکول کو آگاہ فرمائیں۔\nآپ کے تعاون کا شکریہ۔\nانتظامیہ: '+school:
   'محترم والدین / سرپرست!\nآپ کا بچہ '+name+'، جماعت '+klass+'، مورخہ '+date+' کو رخصت پر درج ہے۔ براہِ کرم ضرورت کی صورت میں سکول کو آگاہ کریں، اور ممکن ہو تو متوقع واپسی کی تاریخ بھی بتائیں۔\nشکریہ۔\nانتظامیہ: '+school;
  const english=isAbsent?
   'Dear Parent/Guardian,\nThis is to inform you that your child, '+name+' (Class '+klass+'), was recorded absent from school on '+date+'.\nKindly inform the school of the reason for the absence and help ensure regular attendance. If your child is unwell or facing any difficulty, please let the school administration know.\nThank you for your cooperation.\nAdministration: '+school:
   'Dear Parent/Guardian,\nYour child, '+name+' (Class '+klass+'), is recorded as on leave on '+date+'. Please let us know if any support is needed and, if possible, the expected return date.\nThank you.\nAdministration: '+school;
  const lang=labels(language);
  return lang==='urdu'?urdu:lang==='english'?english:urdu+'\n\n---\n\n'+english;
 }
 function verifiedAdmin(){
  try{
   const s=root.LamaAPI?.getSession?.('school'),auth=JSON.parse(sessionStorage.getItem('lama_school_admin_auth')||'null');
   return !!(s?.schoolId&&auth?.token&&String(s.schoolId)===String(auth.schoolId));
  }catch(e){return false}
 }
 function register(student,status,date,schoolName){
  const st=normalizeStatus(status),id=norm(student?.id??student?._id??student?.studentId??student?.enrlNo??student?.enrollmentNo);
  if(!allowed.has(st)||!id||!/^\d{4}-\d{2}-\d{2}$/.test(norm(date)))return '';
  const entry={name:norm(student?.name||student?.studentName),className:norm(student?.class||student?.grade||student?.className),date:norm(date),schoolName:norm(schoolName),status:st,contact:pickContact(student)};
  const key=id+'|'+date+'|'+st;records.set(key,entry);return key;
 }
 function open(key){
  if(!verifiedAdmin())return false;
  const entry=records.get(norm(key));if(!entry)return false;
  document.getElementById('lama-parent-composer-backdrop')?.remove();
  const backdrop=document.createElement('div');backdrop.id='lama-parent-composer-backdrop';
  backdrop.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#06151bdb;display:grid;place-items:center;padding:12px;overflow:auto';
  const dialog=document.createElement('section');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Parent absence message');
  dialog.style.cssText='background:#f7fcfa;color:#173b42;width:min(100%,590px);max-height:94dvh;overflow-y:auto;border-radius:16px;padding:18px;box-shadow:0 12px 40px #0005;font:14px system-ui';
  function block(tag,text,css){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(css)n.style.cssText=css;return n}
  dialog.append(block('h2','Parent follow-up / والدین کو اطلاع','margin:0 0 6px;font-size:20px'));
  dialog.append(block('p',entry.name+' · Class '+entry.className+' · '+dateDisplay(entry.date)+' · '+entry.status.toUpperCase(),'margin:0 0 6px;font-weight:700'));
  dialog.append(block('p',entry.contact?'Parent contact: '+entry.contact.display:'Parent mobile number is missing or invalid. Update the student record to enable sending.','margin:0 0 12px;color:#557078;font-size:13px'));
  const label=block('label','Message language / پیغام کی زبان','display:block;font-weight:700;margin-bottom:5px');
  const select=block('select');select.style.cssText='display:block;width:100%;min-height:44px;padding:9px;margin-top:6px;border:1px solid #9db7b5;border-radius:8px;background:white;color:#173b42';
  for(const [v,label] of [['urdu','اردو · Urdu'],['english','English'],['both','اردو + English']])select.add(new Option(label,v));
  select.value='both';label.append(select);dialog.append(label);
  const textarea=block('textarea');textarea.id='lama-parent-message-text';textarea.dir='auto';textarea.setAttribute('aria-label','Editable parent message');textarea.style.cssText='display:block;width:100%;height:235px;min-height:160px;resize:vertical;white-space:pre-wrap;font:14px/1.7 system-ui;border:1px solid #9db7b5;border-radius:10px;background:#fff;color:#16373f;padding:12px;margin:10px 0';textarea.value=message(entry,'both');
  dialog.append(textarea);
  let manuallyEdited=false;textarea.addEventListener('input',()=>{manuallyEdited=true});
  select.addEventListener('change',()=>{
   if(manuallyEdited&&!confirm('Replace your edited text with the selected language template?')){select.value=lastLanguage;return}
   textarea.value=message(entry,select.value);manuallyEdited=false;lastLanguage=select.value
  });
  let lastLanguage='both';
  const info=block('p','Review the message and number before sending. Opening an app does not send or confirm delivery.','font-size:12px;color:#52666c;line-height:1.5;margin:5px 0 12px');dialog.append(info);
  const actions=block('div');actions.style.cssText='display:flex;flex-wrap:wrap;gap:7px';
  function btn(label,background){const b=block('button',label);b.type='button';b.style.cssText='padding:10px 12px;min-height:43px;border:0;border-radius:9px;background:'+background+';color:white;font:700 13px system-ui;cursor:pointer';actions.append(b);return b}
  const sendWa=btn('Open WhatsApp','#087f53'),sendSms=btn('Open SMS','#08748a'),copy=btn('Copy text','#33527b'),cancel=btn('Close','#50636c');
  sendWa.disabled=!entry.contact;sendSms.disabled=!entry.contact;
  if(!entry.contact){sendWa.style.opacity='.45';sendSms.style.opacity='.45'}
  sendWa.onclick=()=>{const v=textarea.value.trim();if(!entry.contact||!v)return;const url='https://wa.me/'+entry.contact.wa+'?text='+encodeURIComponent(v);window.open(url,'_blank','noopener,noreferrer');info.textContent='If WhatsApp opens, review the parent number and press Send there. If nothing opens, check popup permissions. Delivery is not confirmed.'};
  sendSms.onclick=()=>{const v=textarea.value.trim();if(!entry.contact||!v)return;info.textContent='Opening your SMS app. Press Send in the SMS app to send; charges may apply.';location.href='sms:'+entry.contact.sms+'?body='+encodeURIComponent(v)};
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(textarea.value);info.textContent='Message copied. No contact was sent.'}catch(e){textarea.focus();textarea.select();info.textContent='Select and copy the highlighted message manually.'}};
  function close(){backdrop.remove();document.removeEventListener('keydown',escClose)}
  cancel.onclick=close;
  function escClose(event){if(event.key==='Escape')close()}
  document.addEventListener('keydown',escClose);
  backdrop.addEventListener('click',event=>{if(event.target===backdrop)close()});
  dialog.append(actions);backdrop.append(dialog);document.body.append(backdrop);select.focus();
  return true;
 }
 root.LamaParentAbsence={register,open,message,phone,pickContact};
})(typeof window!=='undefined'?window:globalThis);
