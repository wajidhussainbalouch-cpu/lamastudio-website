'use strict';
/**
 * LAMA School Suite — regression checks for the existing Apps Script notification
 * reader and teacher sender. Runs locally: node lamastudio-school-suite/tests/notification-visibility.test.cjs
 * Pure fixtures: never connects to a live school or modifies records.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const paths=[
 'backend-api/code.gs',
 'backend-api/Lama_School_Suite_Master_Updated_30_Oct_2026.gs'
];
const sameClass=(a,b)=>String(a||'').toLowerCase().replace(/^(?:class|grade)\s*/, '').replace(/\s+/g,'').trim()===String(b||'').toLowerCase().replace(/^(?:class|grade)\s*/, '').replace(/\s+/g,'').trim();
const alice={role:'student',student:{id:'s1',class:'Playgroup',section:'A'}};
const bob={role:'student',student:{id:'s2',class:'2',section:'A'}};
const teacher={role:'teacher',teacher:{id:'t1',assignedClass:'Playgroup',assignedSection:'A'}};
const otherTeacher={role:'teacher',teacher:{id:'t2',assignedClass:'2',assignedSection:'A'}};
const live={status:'Published',isPublished:true};
const cases=[
 ['own absence',alice,{...live,audience:'student',studentId:'s1'},true],
 ['other student absence',alice,{...live,audience:'student',studentId:'s2'},false],
 ['teacher/admin notice hidden from student',alice,{...live,audience:'teachers,admins'},false],
 ['admin notice with matching studentId hidden',alice,{...live,audience:'admin',studentId:'s1'},false],
 ['class notice',alice,{...live,audience:'Class Playgroup',class:'Playgroup',section:'A'},true],
 ['class 2 not class playgroup',alice,{...live,audience:'Class 2',class:'2'},false],
 ['different section',alice,{...live,audience:'Class Playgroup',class:'Playgroup',section:'B'},false],
 ['all-school public',alice,{...live,audience:'all'},true],
 ['unknown audience denied',alice,{...live,audience:''},false],
 ['unpublished draft denied',alice,{status:'Draft',isPublished:false,audience:'all'},false],
 ['student target section and class fail',bob,{...live,audience:'Class Playgroup',studentId:'s2',class:'Playgroup'},false],
 ['teacher own-class notice',teacher,{...live,audience:'Class Playgroup',class:'Playgroup'},true],
 ['teacher other-class notice',otherTeacher,{...live,audience:'Class Playgroup',class:'Playgroup'},false],
 ['teacher cannot read student private notices',teacher,{...live,audience:'student',studentId:'s1'},false],
 ['teacher can read general staff notice',teacher,{...live,audience:'teachers,admins'},true],
 ['teacher cannot read admin-only',teacher,{...live,audience:'admin'},false],
 ['teacher cannot read other teacher direct notice',teacher,{...live,audience:'teachers',teacherId:'t2'},false]
];
for(const filename of paths){
 const source=fs.readFileSync(path.join(root,filename),'utf8');
 const start=source.indexOf('function lamaNotificationVisible_(');
 const end=source.indexOf('function listRecords(ctx, collection)',start);
 assert(start>=0&&end>start,filename+': visibility gate missing');
 const helper=source.slice(start,end);
 const visible=vm.runInNewContext(helper+'\nlamaNotificationVisible_;',{sameClass});
 for(const [label,who,record,expected] of cases){
  assert.equal(visible(who,record),expected,filename+': '+label);
 }
 assert(source.includes("records = records.filter(r => lamaNotificationVisible_(ctx,r));"),filename+': list reader not guarded');
 assert(source.includes("collection==='notifications' && !lamaNotificationVisible_(ctx,r)"),filename+': get reader not guarded');
 assert(source.includes("ctx.role==='teacher'&&collection==='notifications'"),filename+': teacher notice sender not scoped');
 console.log('PASS',filename,cases.length,'role visibility scenarios');
}
console.log('Notification scope regression gate passed. No network calls or live writes.');
