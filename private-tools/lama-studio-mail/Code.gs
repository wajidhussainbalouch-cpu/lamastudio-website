const ADDRESS='info@lamastudio.pk', BRAND='LAMA Studio';
const PROJECTS=Object.freeze({
 studio:'LAMA Studio Support',
 school:'LAMA School Suite Support',
 ppsc:'LAMA PPSC Preparation Academy',
 bazaar:'LAMA Bazaar Support',
 coding:'LAMA Coding Support',
 quran:'LAMA Studio – Quran Learning Support'
});
function projectName_(id){
 if(!Object.prototype.hasOwnProperty.call(PROJECTS,id)) throw new Error('Select a valid project.');
 return PROJECTS[id];
}
function owner_(){
 const p=PropertiesService.getScriptProperties(), owner=(p.getProperty('OWNER_EMAIL')||'').trim().toLowerCase();
 const active=String(Session.getActiveUser().getEmail()).toLowerCase(), effective=String(Session.getEffectiveUser().getEmail()).toLowerCase();
 if(!owner||active!==owner||effective!==owner) throw new Error('Access denied. Sign in with the authorized owner account.');
 return p;
}
function doGet(){owner_();return HtmlService.createHtmlOutputFromFile('Index').setTitle('LAMA Studio Mail');}
function address_(s){s=String(s||'').trim();const m=s.match(/<([^<>]+)>\s*$/);s=(m?m[1]:s).trim().toLowerCase();return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,63}$/i.test(s)&&s.length<=254?s:'';}
function isBusiness_(m){return String(m.getTo()).split(/[,;]/).some(x=>address_(x)===ADDRESS);}
function message_(id){if(!/^[a-zA-Z0-9_-]{1,100}$/.test(String(id)))throw new Error('Invalid message.');const m=GmailApp.getMessageById(id);if(!m||!isBusiness_(m))throw new Error('Not a business email.');return m;}
function listInbox(offset){owner_();offset=Math.max(0,Math.min(1000,Number(offset)||0));const threads=GmailApp.search('to:'+ADDRESS+' -in:trash -in:spam',offset,25),rows=[];
 threads.forEach(t=>{t.getMessages().filter(isBusiness_).forEach(m=>rows.push({id:m.getId(),from:m.getFrom(),subject:m.getSubject()||'(No subject)',date:m.getDate().toISOString(),unread:m.isUnread()}));});
 rows.sort((a,b)=>b.date.localeCompare(a.date));return {rows,next:threads.length===25?offset+25:null};}
function readMessage(id){owner_();const m=message_(id);return {id,from:m.getFrom(),replyTo:address_(m.getReplyTo()||m.getFrom()),subject:m.getSubject()||'(No subject)',date:m.getDate().toISOString(),body:m.getPlainBody().slice(0,50000)};}
function status(){const p=owner_();return {configured:!!p.getProperty('BREVO_API_KEY'),sender:ADDRESS,projects:PROJECTS};}
function recentRows_(p,key){return JSON.parse(p.getProperty(key)||'[]');}
function boundedRows_(rows){let saved=rows.slice(0,25);while(Utilities.newBlob(JSON.stringify(saved)).getBytes().length>8000)saved.pop();return JSON.stringify(saved);}
function sentHistory(project){
 const p=owner_();project=String(project||'');
 if(project&&project!=='legacy')projectName_(project);
 const old=recentRows_(p,'SENT_LOG'),all=old.concat(...Object.keys(PROJECTS).map(id=>recentRows_(p,'SENT_'+id)));
 const seen=new Set();
 return all.filter(m=>{if(seen.has(m.request))return false;seen.add(m.request);return !project||(project==='legacy'?!PROJECTS[m.project]:m.project===project);}).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,project?25:175);
}
function sendMessage(input){const p=owner_();if(!input||typeof input!=='object')throw new Error('Invalid request.');
 const key=p.getProperty('BREVO_API_KEY');if(!key)throw new Error('Set the Brevo API key in Script Properties first.');
 const request=String(input.request||'');if(!/^[a-z0-9-]{12,80}$/i.test(request))throw new Error('Invalid request ID.');
 const project=String(input.project||''), senderName=projectName_(project);
 const to=address_(input.to), subject=String(input.subject||'').trim(), body=String(input.body||'').trim();
 if(!to||to===ADDRESS||!subject||subject.length>180||/[\r\n]/.test(subject)||!body||body.length>15000)throw new Error('Enter one valid recipient, subject and message.');
 if(input.replyId){const m=message_(input.replyId);if(to!==address_(m.getReplyTo()||m.getFrom()))throw new Error('Reply recipient changed. Use Compose for a new message.');}
 const lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw new Error('Another send is in progress.');
 try{const rows=JSON.parse(p.getProperty('SENT_LOG')||'[]');if(rows.concat(recentRows_(p,'SENT_'+project)).some(x=>x.request===request))return {ok:true,duplicate:true};
 const pending=p.getProperty('PENDING_SEND');if(pending)throw new Error('An earlier send outcome is uncertain. Check Brevo logs and clear PENDING_SEND manually before sending again.');
 const day=Utilities.formatDate(new Date(),'Asia/Karachi','yyyy-MM-dd'),countKey='COUNT_'+day,n=Number(p.getProperty(countKey)||0);if(n>=100)throw new Error('Mail dashboard daily safety limit reached. Other projects share Brevo credits.');
 p.setProperty('PENDING_SEND',request);
 let res;try{res=UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email',{method:'post',contentType:'application/json',headers:{'api-key':key,accept:'application/json'},payload:JSON.stringify({sender:{name:senderName,email:ADDRESS},to:[{email:to}],replyTo:{name:senderName,email:ADDRESS},subject,htmlContent:mailHtml_(project,subject,body,false),textContent:body+'\n\nKind regards,\n'+senderName+'\nA product of LAMA Studio\nwww.lamastudio.pk'}),muteHttpExceptions:true,followRedirects:false});}catch(e){throw new Error('Send outcome uncertain. Check Brevo transactional logs before retrying.');}
 const code=res.getResponseCode();if(code<200||code>=300){if(code>=400&&code<500&&code!==408)p.deleteProperty('PENDING_SEND');throw new Error('Brevo returned HTTP '+code+'. Check account credits/settings and logs before retrying.');}
 let id='';try{id=JSON.parse(res.getContentText()).messageId||'';}catch(e){}
 rows.unshift({request,to,project,senderName,subject:subject.slice(0,100),date:new Date().toISOString(),messageId:String(id).slice(0,160)});
 let saved=rows.slice(0,25);while(Utilities.newBlob(JSON.stringify(saved)).getBytes().length>8000)saved.pop();
 p.setProperties({SENT_LOG:JSON.stringify(saved),['SENT_'+project]:boundedRows_([rows[0]].concat(recentRows_(p,'SENT_'+project))),[countKey]:String(n+1)});p.deleteProperty('PENDING_SEND');return {ok:true,messageId:id};
 }finally{lock.releaseLock();}
}

/* Project mail v2: no secrets, no automatic sending of campaigns. */
const MAIL_BRANDS=Object.freeze({
 studio:{color:'#164e63',accent:'#0e7490',light:'#ecfeff',label:'Digital solutions',headline:'Build something better',support:'Tell us which LAMA Studio product you are using and how we can help.',promo:'Discover digital tools designed to simplify everyday work.',cta:'Explore LAMA Studio'},
 school:{color:'#134e4a',accent:'#0f766e',light:'#ecfdf5',label:'School management',headline:'Simplify your school day',support:'Please share your school name and the feature you need help with. Do not send student records or passwords by email.',promo:'Explore school administration, attendance, examinations and classroom tools in one place.',cta:'Explore School Suite'},
 ppsc:{color:'#312e81',accent:'#6d28d9',light:'#f5f3ff',label:'Competitive exam preparation',headline:'Prepare with purpose',support:'Tell us the post or preparation topic you need assistance with.',promo:'Make your next study session count with practice questions, mock tests and preparation resources.',cta:'Explore exam preparation'},
 bazaar:{color:'#9a3412',accent:'#c2410c',light:'#fff7ed',label:'Local marketplace',headline:'Discover local possibilities',support:'Tell us whether you are a buyer, seller or service provider and what you need help with.',promo:'Discover the LAMA Bazaar concept for local products, shops and services. Visit our website for availability.',cta:'Explore LAMA Bazaar'},
 coding:{color:'#1e3a8a',accent:'#2563eb',light:'#eff6ff',label:'Learn to code',headline:'Learn one line at a time',support:'Tell us the lesson or coding exercise you are working on.',promo:'Build coding confidence through beginner-friendly lessons and practical exercises.',cta:'Explore coding'},
 quran:{color:'#365314',accent:'#4d7c0f',light:'#f7fee7',label:'Quran learning',headline:'A meaningful learning journey',support:'Please tell us which Quran learning topic you need assistance with.',promo:'Discover resources intended to support learning the Quran and its basics.',cta:'Explore learning resources'}
});
function escapeMail_(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function mailHtml_(id,subject,body,promo){
 const name=projectName_(id),b=MAIL_BRANDS[id],e=escapeMail_;
 return '<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#182235"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9"><tr><td align="center" style="padding:20px 8px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:white;border:1px solid #dce4e8"><tr><td style="background:'+b.color+';padding:24px;color:white"><div style="font-size:12px;letter-spacing:2px">LAMA STUDIO &nbsp; / &nbsp; '+e(b.label)+'</div><h1 style="font-size:24px;margin:14px 0 0;color:white">'+e(promo?b.headline:name)+'</h1></td></tr><tr><td style="padding:24px"><div style="background:'+b.light+';border-left:4px solid '+b.accent+';padding:14px;font-weight:bold;font-size:19px">'+e(subject)+'</div><div style="font-size:16px;line-height:1.65;margin:20px 0;overflow-wrap:anywhere">'+e(body).replace(/\r?\n/g,'<br>')+'</div>'+(promo?'<p><a style="display:inline-block;background:'+b.accent+';color:white;padding:14px 22px;text-decoration:none;border-radius:6px" href="https://www.lamastudio.pk/">'+e(b.cta)+'</a></p>':'<p>Kind regards,<br><strong>'+e(name)+'</strong></p>')+'</td></tr><tr><td style="padding:18px;background:#f8fafc;font-size:13px;line-height:1.6;color:#475569">A product of LAMA Studio<br><a href="https://www.lamastudio.pk/">www.lamastudio.pk</a> &nbsp; | &nbsp; info@lamastudio.pk'+(promo?'<br><a href="{{ unsubscribe }}">Unsubscribe from promotional emails</a>':'')+'</td></tr></table></td></tr></table></body></html>';
}
function mailTemplates(){
 owner_();return Object.keys(PROJECTS).map(id=>{const b=MAIL_BRANDS[id];return {id,name:PROJECTS[id],color:b.color,support:'Hello,\n\nThank you for contacting '+PROJECTS[id]+'.\n\n'+b.support,welcome:'Hello,\n\nWelcome to '+PROJECTS[id]+'. We are here to help you get started. Please reply if you have any questions.',promoSubject:b.headline,promoBody:b.promo};});
}
function previewMail(input){
 owner_();const a=validateDesign_(input);return mailHtml_(a.project,a.subject,a.body,!!input.promo);
}
function validateDesign_(input){
 if(!input||typeof input!=='object')throw new Error('Invalid input.');
 const project=String(input.project||''),subject=String(input.subject||'').trim(),body=String(input.body||'').trim();
 projectName_(project);if(!subject||subject.length>180||/[\r\n]/.test(subject)||!body||body.length>15000)throw new Error('Enter a subject and message.');
 return {project,subject,body};
}
function createPromotionDraft(input){
 const p=owner_(),a=validateDesign_(input),key=p.getProperty('BREVO_API_KEY');
 if(!key)throw new Error('Brevo key not configured.');
 const lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw new Error('Another operation is running.');
 try{
 const name='LAMA Mail | '+a.project+' | '+a.subject.slice(0,45)+' | '+Utilities.formatDate(new Date(),'Asia/Karachi','yyyyMMdd-HHmmss');
 const res=UrlFetchApp.fetch('https://api.brevo.com/v3/emailCampaigns',{method:'post',contentType:'application/json',headers:{'api-key':key,accept:'application/json'},payload:JSON.stringify({name,subject:a.subject,sender:{name:projectName_(a.project),email:ADDRESS},replyTo:ADDRESS,htmlContent:mailHtml_(a.project,a.subject,a.body,true),tag:'lama-'+a.project}),muteHttpExceptions:true,followRedirects:false});
 if(res.getResponseCode()!==201)throw new Error('Brevo draft request returned HTTP '+res.getResponseCode()+'. Check campaign dashboard before retrying.');
 const id=JSON.parse(res.getContentText()).id;
 const row={id,project:a.project,subject:a.subject.slice(0,100),date:new Date().toISOString(),status:'draft created'};
 p.setProperty('CAMPAIGN_'+a.project,boundedRows_([row].concat(recentRows_(p,'CAMPAIGN_'+a.project))));
 return row;
 }finally{lock.releaseLock();}
}
function promotionHistory(project){
 const p=owner_();project=String(project||'');if(project)projectName_(project);
 return (project?recentRows_(p,'CAMPAIGN_'+project):[].concat(...Object.keys(PROJECTS).map(id=>recentRows_(p,'CAMPAIGN_'+id)))).sort((a,b)=>b.date.localeCompare(a.date));
}
