'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const page=fs.readFileSync(path.join(__dirname,'main-dashboard.html'),'utf8');

assert.match(page,/<header class="topbar">[\s\S]*?class="school-suite-brand[\s\S]*?LAMA School Suite[\s\S]*?A product of LamaStudio\.pk[\s\S]*?<\/header>/,
  'Product title and byline must be visible in top School Board header');
assert.match(page,/assets\/icons\/lama-school-192\.png/,'Use actual School Suite app icon');
assert.match(page,/@media\(max-width:639px\)[\s\S]*?\.topbar-inner>\.school-suite-actions\{width:100%;justify-content:flex-end;flex-wrap:wrap/,
  'Small screens must wrap controls instead of truncating product branding');
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
console.log('PASS: LAMA School Suite product header, mobile wrapping, genuine school identity, copy-ID and portal links retained.');
