/* LAMA Coding Academy Project Studio — device-local, formative project practice. */
(function(){
'use strict';
const projects=Array.isArray(window.LAMA_STUDIO_PROJECTS)?window.LAMA_STUDIO_PROJECTS:[];
const KEY='lama-coding-project-studio-v1';
const byId=id=>document.getElementById(id);
const messages={
en:{
eyebrow:'Step 3 · Turn code into a portfolio',mainTitle:'Build something real.',
mainIntro:'Choose a practical project, edit starter code, run the preview, test each milestone and export the finished website. These are formative checks, not professional certification.',
hint:'Show a hint',editor:'Your project code',preview:'Live preview',run:'▶ Run Preview',check:'✓ Check Milestone',download:'↓ Download HTML',restore:'Restore Starter',
review:'I ran the project and checked this milestone myself. Automatic pattern checks cannot verify everything.',
previous:'← Previous',next:'Next milestone →',portfolio:'Portfolio evidence',
reflectionHelp:'Describe the problem, your approach, and how you tested the result (at least 80 characters). This note stays on this device until exported.',
reflection:'My project reflection',audit:'Verify all milestones',export:'Export portfolio report',
safety:'Your code runs inside an isolated browser frame, but unknown code may still slow your device. Never paste passwords or private student information. Export your work regularly.',
choose:'Open project',milestones:'milestones previously checked',runFirst:'Run your current code after your latest edit, then check the milestone.',
reviewFirst:'Check the self-review box after testing the preview.',
prior:'Complete earlier milestones before marking this one.',
pass:'Milestone checked! Your code matched the learning criteria and you confirmed your manual review.',
errors:'The following learning checks are still missing:',restoreConfirm:'Restore original starter code? This also clears saved milestone checks for this project.',
restoreDone:'Starter restored and project milestone progress cleared.',
loaded:'Preview loaded. Check what actually works, not just how it looks.',
notLoaded:'Press Run',tooLong:'Please reduce this example below 90,000 characters before running.',
ready:'All milestone code patterns are present and each step was previously checked. Now test on a real device and explain your work before sharing.',
notReady:'Project is not yet ready for portfolio review. Missing requirements:',
downloaded:'Code saved as a standalone HTML file. Open it locally to check it works.',
exported:'Portfolio report exported. Evidence is self-reported and not externally verified.',
draft:'Project draft. Continue completing the milestones.',
step:'Milestone',criteria:'Automatic learning checks',
noData:'The project content could not be loaded. Please reload this page.',
storage:'Local browser storage is unavailable; your changes might be lost after refresh.',
reflectionPlaceholder:'I used HTML, CSS and JavaScript to...',reflectionRequired:'Explain the problem, your solution, and one test result in at least 80 characters.',
saved:'Draft saved on this device.'
},
ur:{
eyebrow:'مرحلہ 3 · اپنے کوڈ سے پورٹ فولیو بنائیں',mainTitle:'ایک حقیقی پراجیکٹ بنائیں۔',
mainIntro:'پراجیکٹ منتخب کریں، کوڈ میں تبدیلی کریں، نتیجہ دیکھیں، ہر مرحلے کی جانچ کریں اور اپنا تیار کردہ کام محفوظ کریں۔ یہ تربیتی جانچ ہے، باقاعدہ سرٹیفکیٹ نہیں۔',
hint:'اشارہ دیکھیں',editor:'آپ کا پراجیکٹ کوڈ',preview:'لائیو نتیجہ',run:'▶ کوڈ چلائیں',check:'✓ مرحلہ چیک کریں',download:'↓ HTML محفوظ کریں',restore:'ابتدائی کوڈ بحال کریں',
review:'میں نے کوڈ کا نتیجہ دیکھا اور خود جانچ کی۔ خودکار جانچ تمام غلطیاں نہیں پکڑ سکتی۔',
previous:'← پچھلا مرحلہ',next:'اگلا مرحلہ →',portfolio:'پورٹ فولیو کا ثبوت',
reflectionHelp:'کم از کم 80 حروف میں بتائیں کہ مسئلہ کیا تھا، آپ نے کیسے حل کیا، اور نتیجہ کیسے چیک کیا۔ یہ نوٹ اسی ڈیوائس پر رہتا ہے۔',
reflection:'میرے پراجیکٹ کی وضاحت',audit:'تمام مراحل جانچیں',export:'پورٹ فولیو رپورٹ محفوظ کریں',
safety:'کوڈ محدود براؤزر فریم میں چلتا ہے، لیکن غیر محفوظ یا بہت زیادہ کوڈ فون سست کر سکتا ہے۔ پاس ورڈ یا طلبہ کی ذاتی معلومات یہاں نہ ڈالیں۔',
choose:'پراجیکٹ کھولیں',milestones:'مراحل پہلے چیک ہو چکے ہیں',runFirst:'آخری تبدیلی کے بعد کوڈ چلا کر نتیجہ دیکھیں، پھر مرحلہ چیک کریں۔',
reviewFirst:'نتیجہ خود دیکھنے کے بعد تصدیقی خانہ منتخب کریں۔',
prior:'پہلے پچھلے مراحل مکمل کریں۔',
pass:'مرحلہ مکمل! مطلوبہ کوڈ ملا اور آپ نے خود نتیجہ جانچنے کی تصدیق کی۔',
errors:'درج ذیل تربیتی شرائط ابھی پوری نہیں ہوئیں:',restoreConfirm:'اصل ابتدائی کوڈ واپس لائیں؟ اس پراجیکٹ کی مراحل کی تکمیل بھی صاف ہو جائے گی۔',
restoreDone:'ابتدائی کوڈ بحال کر دیا گیا اور پراجیکٹ کی تکمیل ختم کر دی گئی۔',
loaded:'نتیجہ دکھا دیا گیا۔ صرف شکل نہیں، کام کرنا بھی چیک کریں۔',
notLoaded:'چلائیں کا بٹن دبائیں',tooLong:'چلانے سے پہلے کوڈ 90,000 حروف سے کم کریں۔',
ready:'تمام مراحل کی کوڈ شرائط پوری ہیں اور پہلے جانچ ہو چکی ہے۔ اب فون پر آزمائیں اور اپنی وضاحت لکھیں۔',
notReady:'پراجیکٹ ابھی پورٹ فولیو کے لیے مکمل نہیں۔ باقی شرائط:',
downloaded:'HTML فائل محفوظ ہو گئی۔ اسے کھول کر دوبارہ جانچیں۔',
exported:'پورٹ فولیو رپورٹ محفوظ ہو گئی۔ یہ خود رپورٹ کردہ ثبوت ہے، بیرونی تصدیق نہیں۔',
draft:'پراجیکٹ زیر تکمیل ہے۔ اگلے مرحلے مکمل کریں۔',
step:'مرحلہ',criteria:'خودکار تربیتی جانچ',
noData:'پراجیکٹ کا مواد دستیاب نہیں۔ صفحہ دوبارہ کھولیں۔',
storage:'براؤزر میں مقامی محفوظ کرنے کی سہولت دستیاب نہیں؛ دوبارہ کھولنے پر تبدیلیاں ختم ہو سکتی ہیں۔',
reflectionPlaceholder:'میں نے HTML، CSS اور JavaScript استعمال کر کے...',reflectionRequired:'کم از کم 80 حروف میں مسئلہ، حل اور ایک آزمائشی نتیجہ لکھیں۔',
saved:'کام اس ڈیوائس پر محفوظ ہو گیا۔'
}
};
function fresh(){return {project:projects[0]?projects[0].id:'',lang:'en',steps:{},code:{},checks:{},reflection:{}};}
function load(){try{
  const raw=JSON.parse(localStorage.getItem(KEY)||'null');
  if(!raw||typeof raw!=='object')return fresh();
  return {project:projects.some(p=>p.id===raw.project)?raw.project:fresh().project,lang:raw.lang==='ur'?'ur':'en',
    steps:raw.steps&&typeof raw.steps==='object'?raw.steps:{},code:raw.code&&typeof raw.code==='object'?raw.code:{},
    checks:raw.checks&&typeof raw.checks==='object'?raw.checks:{},reflection:raw.reflection&&typeof raw.reflection==='object'?raw.reflection:{}};
}catch(e){return fresh();}}
let state=load(),ran=false;
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch(e){status(msg('storage'),false);return false;}}
function project(){return projects.find(p=>p.id===state.project)||projects[0];}
function stepIndex(){const p=project();return Math.max(0,Math.min(p.steps.length-1,Number(state.steps[p.id])||0));}
function activeStep(){return project().steps[stepIndex()];}
function langValue(obj,field){return state.lang==='ur'&&obj.ur&&obj.ur[field]?obj.ur[field]:obj[field];}
function msg(key){return messages[state.lang][key]||messages.en[key]||key;}
function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function localCode(){const p=project();return typeof state.code[p.id]==='string'?state.code[p.id]:p.starter;}
function stripped(code){return code.replace(/<!--[\s\S]*?-->/g,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|\n)\s*\/\/[^\n]*/g,'');}
function criteria(step,code){const visible=stripped(code);return step.checks.map(([label,pattern])=>({label,pass:new RegExp(pattern,'i').test(visible)}));}
function completedCount(p){const completed=state.checks[p.id]||{};return p.steps.filter(s=>completed[s.id]&&completed[s.id].reviewed===true).length;}
function setCopy(){
  const fields={eyebrow:'eyebrow',mainTitle:'mainTitle',mainIntro:'mainIntro',hintLabel:'hint',editorLabel:'editor',
    previewLabel:'preview',run:'run',check:'check',download:'download',restore:'restore',reviewLabel:'review',
    previous:'previous',next:'next',portfolioTitle:'portfolio',reflectionHelp:'reflectionHelp',reflectionLabel:'reflection',
    audit:'audit',export:'export',safetyNote:'safety'};
  Object.keys(fields).forEach(id=>{const el=byId(id);if(el)el.textContent=msg(fields[id]);});
  byId('reflection').placeholder=msg('reflectionPlaceholder');
  byId('language').textContent=state.lang==='en'?'اردو':'English';
  document.documentElement.lang=state.lang;
}
function cards(){
  byId('projectCards').innerHTML=projects.map(p=>{
    const count=completedCount(p);
    return '<section class="card '+(state.project===p.id?'selected':'')+'"><span class="project-icon" aria-hidden="true">'+esc(p.icon)+'</span>'+
      '<div class="meta">'+esc(p.sector)+'</div><h3>'+esc(langValue(p,'name'))+'</h3><p>'+esc(langValue(p,'description'))+'</p>'+
      '<p class="meta">'+count+' / '+p.steps.length+' '+esc(msg('milestones'))+'</p><div class="meter"><div style="width:'+Math.round(count/p.steps.length*100)+'%"></div></div>'+
      '<button type="button" class="pick '+(state.project===p.id?'primary':'')+'" data-project="'+esc(p.id)+'" '+(state.project===p.id?'aria-current="true"':'')+'>'+esc(msg('choose'))+'</button></section>';
  }).join('');
}
function menu(){
  const p=project(),i=stepIndex();
  byId('milestoneMenu').innerHTML=p.steps.map((step,k)=>{
    const done=Boolean((state.checks[p.id]||{})[step.id]?.reviewed);
    return '<button type="button" data-step="'+k+'" class="'+(i===k?'active ':'')+(done?'done':'')+'" '+(i===k?'aria-current="step"':'')+'><small>'+esc(msg('step'))+' '+(k+1)+' / '+p.steps.length+'</small><b>'+esc(langValue(step,'title'))+'</b></button>';
  }).join('');
}
function status(message,success){
  const el=byId('feedback');if(!el)return;
  el.className='status '+(success?'ok':'bad');el.textContent=message;
}
function auditMessage(message,success){
  const el=byId('auditResult');if(!el)return;
  el.className='status '+(success?'ok':'bad');el.textContent=message;
}
function view(){
  if(!projects.length){byId('workspace').textContent=msg('noData');return;}
  setCopy();cards();menu();
  const step=activeStep(),p=project();
  byId('stageLabel').textContent=msg('step')+' '+(stepIndex()+1)+' / '+p.steps.length+' · '+langValue(p,'name');
  byId('stageTitle').textContent=langValue(step,'title');
  byId('stageWhy').textContent=langValue(step,'why');
  byId('stageTask').textContent=langValue(step,'task');
  byId('stageHint').textContent=step.hint;
  byId('criteria').innerHTML=step.checks.map(x=>'<li>'+esc(x[0])+'</li>').join('');
  byId('source').value=localCode();
  byId('reflection').value=typeof state.reflection[p.id]==='string'?state.reflection[p.id]:'';
  byId('reviewed').checked=false;
  byId('previewStatus').textContent=msg('notLoaded');
  byId('preview').removeAttribute('srcdoc');ran=false;
  byId('previous').disabled=stepIndex()===0;
  byId('next').disabled=stepIndex()===p.steps.length-1;
  byId('feedback').className='status';
  byId('feedback').textContent=msg('draft');
  const currentCount=completedCount(p);
  byId('auditResult').className='status';
  byId('auditResult').textContent=currentCount+' / '+p.steps.length+' '+msg('milestones');
}
function runPreview(){
  const code=byId('source').value;
  if(code.length>90000){status(msg('tooLong'),false);return;}
  // Inserting CSP immediately after the opening head helps prevent learner code from
  // obtaining network access or sending forms. Sandbox omits allow-same-origin.
  const csp='<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:; font-src data:; connect-src \'none\'; form-action \'none\'; base-uri \'none\';">';
  const guarded=/<head\b[^>]*>/i.test(code)?code.replace(/<head\b[^>]*>/i,m=>m+csp):csp+code;
  byId('preview').srcdoc=guarded;
  ran=true;byId('previewStatus').textContent=msg('loaded');
  status(msg('loaded'),true);
}
function checkStep(){
  const p=project(),step=activeStep(),idx=stepIndex();
  if(idx>0&&p.steps.slice(0,idx).some(s=>!((state.checks[p.id]||{})[s.id]?.reviewed))){
    status(msg('prior'),false);return;
  }
  if(!ran){status(msg('runFirst'),false);return;}
  if(!byId('reviewed').checked){status(msg('reviewFirst'),false);return;}
  const failures=criteria(step,byId('source').value).filter(x=>!x.pass).map(x=>x.label);
  if(failures.length){status(msg('errors')+'\n• '+failures.join('\n• '),false);return;}
  if(!state.checks[p.id]||typeof state.checks[p.id]!=='object')state.checks[p.id]={};
  state.checks[p.id][step.id]={checkedAt:new Date().toISOString(),reviewed:true};
  save();cards();menu();
  status(msg('pass'),true);
  auditMessage(completedCount(p)+' / '+p.steps.length+' '+msg('milestones'),true);
}
function allAudit(){
  const p=project(),code=byId('source').value,missing=[],completed=state.checks[p.id]||{};
  for(const step of p.steps){
    const failed=criteria(step,code).filter(c=>!c.pass);
    if(failed.length)missing.push(langValue(step,'title')+': '+failed.map(c=>c.label).join(', '));
    if(!completed[step.id]||!completed[step.id].reviewed)missing.push(langValue(step,'title')+': '+msg('reviewFirst'));
  }
  if(String(state.reflection[p.id]||'').trim().length<80)missing.push(msg('reflectionRequired'));
  return {ready:missing.length===0,missing};
}
function verifyAll(){
  const result=allAudit();
  auditMessage(result.ready?msg('ready'):msg('notReady')+'\n'+result.missing.map(s=>'• '+s).join('\n'),result.ready);
  return result;
}
function chooseProject(id){
  if(!projects.some(p=>p.id===id))return;
  state.project=id;
  const p=project();const first=p.steps.findIndex(s=>!((state.checks[p.id]||{})[s.id]?.reviewed));
  state.steps[p.id]=first<0?0:first;save();view();
}
function moveStep(index){
  const p=project();
  if(index<0||index>=p.steps.length)return;
  state.steps[p.id]=index;save();view();
}
function downloadFile(name,content,type){
  const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),anchor=document.createElement('a');
  anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function exportReport(){
  const p=project(),assessment=allAudit(),checks=state.checks[p.id]||{};
  const report={
    format:'LAMA Coding Academy - Self-Reported Project Evidence v1',
    title:p.name,projectId:p.id,sector:p.sector,generatedAt:new Date().toISOString(),
    readiness:{learningPatternsPassed:assessment.ready,missing:assessment.missing,reviewStatus:'Self-assessment, not verified by teacher or employer'},
    steps:p.steps.map(s=>({id:s.id,name:s.title,checkedAt:checks[s.id]?.checkedAt||null,selfReviewed:Boolean(checks[s.id]?.reviewed)})),
    reflection:String(state.reflection[p.id]||'').slice(0,1200),
    note:'Download the HTML source separately. This report is not a job qualification or external certification.'
  };
  downloadFile('lama-'+p.id+'-portfolio-report.json',JSON.stringify(report,null,2),'application/json');
  auditMessage(msg('exported'),true);
}
byId('language').addEventListener('click',()=>{state.lang=state.lang==='en'?'ur':'en';save();view();});
byId('projectCards').addEventListener('click',e=>{const el=e.target.closest('[data-project]');if(el)chooseProject(el.dataset.project);});
byId('milestoneMenu').addEventListener('click',e=>{const el=e.target.closest('[data-step]');if(el)moveStep(Number(el.dataset.step));});
byId('source').addEventListener('input',()=>{state.code[project().id]=byId('source').value;save();ran=false;byId('reviewed').checked=false;byId('previewStatus').textContent=msg('notLoaded');});
byId('reflection').addEventListener('input',()=>{state.reflection[project().id]=byId('reflection').value.slice(0,1200);save();});
byId('run').addEventListener('click',runPreview);
byId('check').addEventListener('click',checkStep);
byId('audit').addEventListener('click',verifyAll);
byId('download').addEventListener('click',()=>{const p=project();downloadFile('lama-'+p.id+'-project.html',byId('source').value,'text/html;charset=utf-8');status(msg('downloaded'),true);});
byId('export').addEventListener('click',exportReport);
byId('restore').addEventListener('click',()=>{
  if(!confirm(msg('restoreConfirm')))return;
  const p=project();state.code[p.id]=p.starter;state.checks[p.id]={};state.steps[p.id]=0;save();view();status(msg('restoreDone'),true);
});
byId('previous').addEventListener('click',()=>moveStep(stepIndex()-1));
byId('next').addEventListener('click',()=>moveStep(stepIndex()+1));
view();
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
})();