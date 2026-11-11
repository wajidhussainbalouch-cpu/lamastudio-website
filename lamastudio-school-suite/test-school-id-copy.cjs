/**
 * Browser-agnostic School ID Copy and portal hand-off checks.
 * Two distinct school fixtures; no real school credentials or API calls.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'main-dashboard.html'),'utf8');
const teacher=fs.readFileSync(path.join(__dirname,'teacher-login.html'),'utf8');
const sw=fs.readFileSync(path.join(__dirname,'sw.js'),'utf8');
assert.match(html,/\.banner:after\s*\{[^}]*pointer-events:none/s,'Decorative overlay may not block taps');
assert.match(html,/\.banner-content\{position:relative;z-index:1\}/);
assert.match(html,/\.banner\{height:auto;min-height:315px;background-position:58% center\}/);
assert.match(html,/<input[^>]*id="schoolIdDisplay"[^>]*readonly/);
assert.match(html,/<button id="copySchoolIdButton" type="button"/);
assert.match(html,/getElementById\('copySchoolIdButton'\)\?\.addEventListener\('click', copySchoolId\)/);
assert.match(sw,/const CACHE='lama-school-static-v4'/);
const start=html.indexOf('async function copySchoolId() {');
const end=html.indexOf("document.getElementById('copySchoolIdButton')?.addEventListener",start);
assert.ok(start>0&&end>start,'Copy handler must be available');
const handler=html.slice(start,end)+"return copySchoolId;";

async function scenario(id, mode){
 const field={value:id,selected:false,focus(){},select(){this.selected=true},
  setSelectionRange(a,b){assert.equal(a,0);assert.equal(b,this.value.length)}};
 const button={textContent:'',disabled:false,setAttribute(){}},feedback={textContent:''};
 const doc={getElementById:k=>k==='schoolIdDisplay'?field:k==='copySchoolIdButton'?button:feedback,
  execCommand:()=>mode==='legacy'&&field.selected};
 let written='';
 const clipboard=mode==='modern'?{writeText:async str=>{written=str}}:undefined;
 const fn=new Function('document','window','navigator','console',handler)(
  doc,{currentSchoolId:id},{clipboard},{warn(){}});
 const result=await fn();
 if(!id){assert.equal(result,false);assert.match(feedback.textContent,/loading/i);return}
 assert.equal(field.selected,true,'Input must be selected for Android manual copy');
 if(mode==='manual'){
  assert.equal(result,false);assert.match(feedback.textContent,/Long-press/);
 }else{
  assert.equal(result,true);
  if(mode==='modern')assert.equal(written,id);
  assert.match(feedback.textContent,/copied/i);
 }
}

const begin=html.indexOf('const schoolId = school.id;');
const finish=html.indexOf('const rawTests =',begin);
assert.ok(begin>0&&finish>begin,'Dynamic school login links not found');
const linkCode=html.slice(begin,finish);
function checkSchoolLinks(id){
 const nodes={};
 const doc={getElementById:k=>nodes[k]??(nodes[k]=k==='schoolIdPortalLinks'?{hidden:true}:
  k==='copySchoolIdButton'?{disabled:true}:
  k==='schoolIdDisplay'?{value:''}:
  {textContent:'',href:''})};
 const win={};
 new Function('school','document','window',linkCode)({id},doc,win);
 assert.equal(win.currentSchoolId,id);
 assert.equal(nodes.schoolIdDisplay.value,id);
 assert.equal(nodes.schoolIdPortalLinks.hidden,false);
 assert.equal(nodes.schoolTeacherLoginLink.href,'teacher-login.html?schoolId='+encodeURIComponent(id));
 assert.equal(nodes.schoolStudentLoginLink.href,'students/student-login.html?schoolId='+encodeURIComponent(id));
}
assert.match(teacher,/new URLSearchParams\(location.search\)\.get\('schoolId'\)/);
assert.match(teacher,/schoolInput.value = requestedSchoolId/);
(async()=>{
 for(const id of ['sch_school_A123','sch_school_B456']){
  for(const mode of ['legacy','modern','manual'])await scenario(id,mode);
  checkSchoolLinks(id);
 }
 await scenario('', 'legacy');
 console.log('PASS: overlay permits taps; each school has its own selectable ID, Android/modern clipboard fallbacks, school-specific student and teacher links, and updated PWA cache.');
})().catch(err=>{console.error(err);process.exitCode=1});
