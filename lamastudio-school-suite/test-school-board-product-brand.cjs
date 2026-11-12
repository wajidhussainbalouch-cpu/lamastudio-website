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
assert.match(page,/\.school-action-full\{display:inline!important\}/,
 'Full Subscription / Log out labels must always be shown on mobile');
assert.match(page,/\.school-action-small\{display:none!important\}/,
 'Plan / Exit shortened labels must be hidden on mobile');
assert.match(page,/@media\(max-width:350px\)/,
 'Small phones must have reduced spacing instead of shortened labels');
for(const [id,visible] of [['dashboardSubscriptionLink','Subscription'],['dashboardAuthLink','School Login'],['dashboardLogoutButton','Log out']]){
 const tag=page.match(new RegExp('<(?:button|a) id="'+id+'"[^>]*>[\\s\\S]*?<\\/(?:button|a)>'))?.[0];
 assert.ok(tag,'Missing account control '+id);
 assert.match(tag,new RegExp('class="school-action-full">'+visible+'<'),'Missing full visible label '+visible);
 assert.match(tag,/aria-label=/,'Control must keep accessible full label');
}
assert.doesNotMatch(page,/class="school-action-small" aria-hidden="true">(Plan|Exit)</,
 'Shortened labels must not remain in page markup');
assert.doesNotMatch(page,/id="navSchoolName"|id="navSchoolId"|getElementById\('navSchoolName'\)|getElementById\('navSchoolId'\)/,
  'School-specific identity must not override global product header');
for(const id of ['headerSchoolName','headerSchoolMeta','schoolLogoBox','schoolIdDisplay','copySchoolIdButton','schoolTeacherLoginLink','schoolStudentLoginLink']){
 assert.match(page,new RegExp('id="'+id+'"'),'Preserve school-specific board and copy/login action '+id);
}
assert.match(page,/const schoolName = school\.name \|\| data\.schoolName/);
assert.match(page,/if\(headerNameEl\) headerNameEl\.innerText = schoolName/);
assert.match(page,/window\.currentSchoolId = schoolId/);

const studioLogo=fs.readFileSync(path.join(__dirname,'../assets/lama-studio-icon.svg'),'utf8');
assert.match(studioLogo,/M40 60H91Q100 60 100 69V91Q100 100 91 100H0L40 60Z/,
 'The white L shape must join the blue diagonal exactly at the bottom-left corner');
assert.doesNotMatch(studioLogo,/100H7L40 60Z/,
 'The old seven-unit navy wedge in the LAMA Studio icon must not return');
const home=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert.equal((home.match(/assets\/lama-studio-icon.svg\?v=seamless-20261112/g)||[]).length,2,
 'Both homepage icon and favicon must use the new cache-busted seamless SVG');
const code=[...page.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(Boolean);
for(const s of code)new Function(s);
console.log('PASS: LAMA School Suite product header, compact single-row mobile header with full labels, genuine school identity, copy-ID and portal links retained.');
