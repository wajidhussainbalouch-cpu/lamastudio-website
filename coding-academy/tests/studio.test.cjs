/* LAMA Coding Academy project-studio smoke and progression tests.
   Run: node coding-academy/tests/studio.test.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const dataText=fs.readFileSync(path.join(root,'projects-data.js'),'utf8');
const appText=fs.readFileSync(path.join(root,'studio.js'),'utf8');
const html=fs.readFileSync(path.join(root,'studio.html'),'utf8');
new Function(dataText);new Function(appText);
assert.ok(html.includes('sandbox="allow-scripts"'),'Preview must be sandboxed');
assert.ok(!html.includes('allow-same-origin'),'Preview must not share origin');
const windowStub={addEventListener(){}};
vm.runInNewContext(dataText,{window:windowStub});
const projects=windowStub.LAMA_STUDIO_PROJECTS;
assert.equal(projects.length,3,'There should be three taught projects.');
assert.equal(projects.reduce((total,p)=>total+p.steps.length,0),12,'Expect twelve milestones.');
assert.equal(new Set(projects.map(p=>p.id)).size,projects.length);
for(const p of projects){
  assert.ok(p.ur&&p.ur.name);
  assert.equal(p.steps.length,4);
  assert.equal(new Set(p.steps.map(s=>s.id)).size,p.steps.length);
  for(const s of p.steps){
    assert.ok(s.ur&&s.ur.task,'Urdu learner coaching is required');
    assert.ok(s.hint&&s.checks.length);
    for(const [label,pattern] of s.checks){
      assert.ok(label&&typeof label==='string');
      new RegExp(pattern,'i');
    }
  }
}
function fullyBuilt(p){
  let code=p.starter;
  if(p.id==='school'){
    code=code.replace('<!-- Add your navigation, programs and contact section here. -->',
      '<nav aria-label="Main navigation"><a href="#programs">Programs</a><a href="#contact">Contact</a></nav>\n'+
      '<section id="programs"><h2>Programs</h2><p>Our primary education includes coding and science.</p></section>\n'+
      '<section id="contact"><h2>Contact</h2><a href="mailto:hello@example.org">Email the school</a></section>');
    code=code.replace('</style>','@media (max-width:600px){header{padding:14px}}\n</style>');
  }
  if(p.id==='fees'){
    code=code.replace('// Return the total for these values.','return monthly * months;');
    code=code.replace('// Read the fields, handle errors, and show a result.',
      'const monthly=Number(document.getElementById("monthly").value);\n'+
      'const months=Number(document.getElementById("months").value);\n'+
      'if(!Number.isFinite(monthly)||!Number.isFinite(months)||monthly<0||months<0){\n'+
      '  document.getElementById("result").textContent="Invalid values";return;\n}\n'+
      'document.getElementById("result").textContent="Total: "+totalFee(monthly,months);');
  }
  if(p.id==='attendance'){
    code=code.replace('// Count and display attendance below.',
      'const presentCount=attendance.filter(student=>student.present).length;\n'+
      'const absentCount=attendance.length-presentCount;\n'+
      'document.getElementById("summary").textContent="Present: "+presentCount+" Absent: "+absentCount;\n'+
      'attendance.forEach(student=>{const li=document.createElement("li");li.textContent=student.name;document.getElementById("students").appendChild(li);});');
  }
  return code;
}
function stripComments(code){return code.replace(/<!--[\s\S]*?-->/g,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|\n)\s*\/\/[^\n]*/g,'');}
for(const p of projects){
  const solution=fullyBuilt(p),cleanSolution=stripComments(solution),cleanStarter=stripComments(p.starter);
  for(const step of p.steps){
    const passes=step.checks.map(([label,re])=>new RegExp(re,'i').test(cleanSolution));
    assert.ok(passes.every(Boolean),p.id+'/'+step.id+' completed code must pass every check; got '+passes);
    const starterPass=step.checks.every(([,re])=>new RegExp(re,'i').test(cleanStarter));
    assert.equal(starterPass,false,p.id+'/'+step.id+' starter must not already pass');
  }
}
class Element {
  constructor(){this.innerHTML='';this.textContent='';this.value='';this.className='';this.disabled=false;this.checked=false;this.listeners={};this.attributes={};this.dataset={};this.srcdoc='';}
  addEventListener(type,fn){this.listeners[type]=fn;}
  setAttribute(key,val){this.attributes[key]=val;}
  removeAttribute(key){delete this.attributes[key];if(key==='srcdoc')this.srcdoc='';}
  fire(type,payload={}){assert.ok(this.listeners[type],'listener for '+type);return this.listeners[type](payload);}
}
const elements=new Map();
const get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
const local=new Map();
const context={
  window:windowStub,
  document:{getElementById:get,documentElement:{lang:'en'}},
  navigator:{},
  localStorage:{getItem:key=>local.get(key)||null,setItem:(key,value)=>local.set(key,value)},
  console
};
vm.runInNewContext(appText,context);
assert.match(get('projectCards').innerHTML,/School Information Website/);
assert.match(get('source').value,/My School/);
// Untouched starter must not earn a milestone just by running the preview.
get('run').fire('click');
get('reviewed').checked=true;
get('check').fire('click');
assert.match(get('feedback').textContent,/missing/i);
let saved=JSON.parse(local.get('lama-coding-project-studio-v1')||'{}');
assert.ok(!saved.checks?.school?.navigation,'No milestone credit for starter code');
for(const p of projects){
  get('projectCards').fire('click',{target:{closest:()=>({dataset:{project:p.id}})}});
  get('source').value=fullyBuilt(p);
  get('source').fire('input');
  for(let i=0;i<p.steps.length;i++){
    get('run').fire('click');get('reviewed').checked=true;get('check').fire('click');
    assert.match(get('feedback').textContent,/Milestone checked!/,'Milestone '+p.id+' '+i+' must pass');
    if(i<p.steps.length-1)get('next').fire('click');
  }
  get('audit').fire('click');
  assert.match(get('auditResult').textContent,/All milestone code patterns are present/,'All stages ready for '+p.id);
}
saved=JSON.parse(local.get('lama-coding-project-studio-v1'));
assert.equal(projects.reduce((n,p)=>n+Object.keys(saved.checks[p.id]).length,0),12);
get('language').fire('click');
assert.equal(context.document.documentElement.lang,'ur');
assert.match(get('mainTitle').textContent,/پراجیکٹ/);
console.log('PASS: 3 projects, 12 nontrivial milestones, Urdu coaching, sandbox, end-to-end local progression, preview and final audit.');
