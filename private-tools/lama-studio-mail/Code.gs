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
function sentHistory(){const p=owner_();return JSON.parse(p.getProperty('SENT_LOG')||'[]');}
function sendMessage(input){const p=owner_();if(!input||typeof input!=='object')throw new Error('Invalid request.');
 const key=p.getProperty('BREVO_API_KEY');if(!key)throw new Error('Set the Brevo API key in Script Properties first.');
 const request=String(input.request||'');if(!/^[a-z0-9-]{12,80}$/i.test(request))throw new Error('Invalid request ID.');
 const project=String(input.project||''), senderName=projectName_(project);
 const to=address_(input.to), subject=String(input.subject||'').trim(), body=String(input.body||'').trim();
 if(!to||to===ADDRESS||!subject||subject.length>180||/[\r\n]/.test(subject)||!body||body.length>15000)throw new Error('Enter one valid recipient, subject and message.');
 if(input.replyId){const m=message_(input.replyId);if(to!==address_(m.getReplyTo()||m.getFrom()))throw new Error('Reply recipient changed. Use Compose for a new message.');}
 const lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw new Error('Another send is in progress.');
 try{const rows=JSON.parse(p.getProperty('SENT_LOG')||'[]');if(rows.some(x=>x.request===request))return {ok:true,duplicate:true};
 const pending=p.getProperty('PENDING_SEND');if(pending)throw new Error('An earlier send outcome is uncertain. Check Brevo logs and clear PENDING_SEND manually before sending again.');
 const day=Utilities.formatDate(new Date(),'Asia/Karachi','yyyy-MM-dd'),countKey='COUNT_'+day,n=Number(p.getProperty(countKey)||0);if(n>=100)throw new Error('Mail dashboard daily safety limit reached. Other projects share Brevo credits.');
 p.setProperty('PENDING_SEND',request);
 let res;try{res=UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email',{method:'post',contentType:'application/json',headers:{'api-key':key,accept:'application/json'},payload:JSON.stringify({sender:{name:senderName,email:ADDRESS},to:[{email:to}],replyTo:{name:senderName,email:ADDRESS},subject,textContent:body+'\n\nKind regards,\n'+senderName+'\nA product of LAMA Studio\nwww.lamastudio.pk'}),muteHttpExceptions:true,followRedirects:false});}catch(e){throw new Error('Send outcome uncertain. Check Brevo transactional logs before retrying.');}
 const code=res.getResponseCode();if(code<200||code>=300){if(code>=400&&code<500&&code!==408)p.deleteProperty('PENDING_SEND');throw new Error('Brevo returned HTTP '+code+'. Check account credits/settings and logs before retrying.');}
 let id='';try{id=JSON.parse(res.getContentText()).messageId||'';}catch(e){}
 rows.unshift({request,to,project,senderName,subject:subject.slice(0,100),date:new Date().toISOString(),messageId:String(id).slice(0,160)});
 let saved=rows.slice(0,25);while(Utilities.newBlob(JSON.stringify(saved)).getBytes().length>8000)saved.pop();
 p.setProperties({SENT_LOG:JSON.stringify(saved),[countKey]:String(n+1)});p.deleteProperty('PENDING_SEND');return {ok:true,messageId:id};
 }finally{lock.releaseLock();}
}
