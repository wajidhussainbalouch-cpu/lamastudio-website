'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const page=fs.readFileSync(path.join(__dirname,'main-dashboard.html'),'utf8');

assert.match(page,/<header class="topbar">[\s\S]*?class="school-suite-brand[\s\S]*?LAMA School Suite[\s\S]*?A product of LamaStudio\.pk[\s\S]*?<\/header>/,
  'Product title and byline must be visible in top School Board header');
assert.match(page,/assets\/icons\/lama-school-192\.png/,'Use actual School Suite app icon');
assert.match(page,/@media\(max-width:639px\)[\s\S]*?\.topbar-inner>\.school-suite-actions\{[\s\S]*?display:grid!important;grid-template-columns:minmax\(0,1fr\) minmax\(0,1\.35fr\) minmax\(0,1fr\)/,
  'Mobile actions must fill the full available row in three grid columns');
assert.match(page,/\.school-suite-actions>\.theme-toggle,\.school-suite-actions>\.nav-btn\{[\s\S]*?width:100%!important;max-width:none!important;min-width:0!important;/,
  'All mobile controls must stretch to full grid-cell width without overflow');
assert.match(page,/@media\(max-width:350px\)/,'Small phones need narrower button spacing');
assert.match(page,/if\(login\)login\.style\.display=authenticated\?'none':'inline-flex'/,
  'School login remains hidden when authenticated');
assert.match(page,/if\(logout\)logout\.style\.display=authenticated\?'inline-flex':'none'/,
  'Logout remains hidden when not authenticated');
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
