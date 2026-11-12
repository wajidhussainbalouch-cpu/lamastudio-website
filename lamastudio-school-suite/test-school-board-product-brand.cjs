'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const page=fs.readFileSync(path.join(__dirname,'main-dashboard.html'),'utf8');

assert.match(page,/<header class="topbar">[\s\S]*?class="school-suite-brand[\s\S]*?LAMA School Suite[\s\S]*?A product of LamaStudio\.pk[\s\S]*?<\/header>/,
  'Product title and byline must be visible in top School Board header');
assert.match(page,/assets\/icons\/lama-school-192\.png/,'Use actual School Suite app icon');
assert.match(page,/@media\(max-width:639px\)[\s\S]*?\.topbar-inner\{[\s\S]*?flex-direction:row!important;flex-wrap:nowrap!important/,
  'Phone header must remain a single line, with no wrapped second row');
assert.match(page,/\.topbar-inner>\.school-suite-brand\{[\s\S]*?flex:1 1 auto!important/,
  'Brand takes remaining space on the left');
assert.match(page,/\.topbar-inner>\.school-suite-actions\{[\s\S]*?display:flex!important;flex:0 0 auto!important;align-items:center!important/,
  'The action group stays aligned right on the same row');
assert.match(page,/\.school-action-full\{display:none!important\}/,
  'Long labels should be hidden on phones');
assert.match(page,/\.school-action-small\{display:inline!important/,
  'Compact labels must appear on phones');
assert.match(page,/@media\(max-width:350px\)/,
  'Small phones must have tighter button width rules');
for(const [id,compact] of [['dashboardSubscriptionLink','Plan'],['dashboardAuthLink','Login'],['dashboardLogoutButton','Exit']]){
 const tag=page.match(new RegExp('<(?:button|a) id="'+id+'"[^>]*>[\\s\\S]*?<\\/(?:button|a)>'))?.[0];
 assert.ok(tag,'Missing account control '+id);
 assert.match(tag,new RegExp('class="school-action-small"[^>]*>'+compact+'<'),'Missing compact mobile label '+compact);
 assert.match(tag,/aria-label=/,'Compact control must keep an accessible full label');
}
assert.doesNotMatch(page,/id="navSchoolName"|id="navSchoolId"|getElementById\('navSchoolName'\)|getElementById\('navSchoolId'\)/,
  'School-specific identity must not override global product header');
for(const id of ['headerSchoolName','headerSchoolMeta','schoolLogoBox','schoolIdDisplay','copySchoolIdButton','schoolTeacherLoginLink','schoolStudentLoginLink']){
 assert.match(page,new RegExp('id="'+id+'"'),'Preserve school-specific board and copy/login action '+id);
}
assert.match(page,/const schoolName = school\.name \|\| data\.schoolName/);
assert.match(page,/if\(headerNameEl\) headerNameEl\.innerText = schoolName/);
assert.match(page,/window\.currentSchoolId = schoolId/);
const code=[...page.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(Boolean);
for(const s of code)new Function(s);
console.log('PASS: LAMA School Suite product header, mobile full-width actions, genuine school identity, copy-ID and portal links retained.');
