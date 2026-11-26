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
 // Exercise the real generic notification WRITE handler with a forged audience.
 // The teacher may only publish to their assigned class; no arbitrary studentId.
 const addStart=source.indexOf('function addRecord(ctx, collection, record) {');
 const addEnd=source.indexOf('\nfunction ',addStart+10);
 assert(addStart>=0&&addEnd>addStart,filename+': sender implementation missing');
 const appended=[];
 const senderContext={
  assertSchoolWritable:()=>{},checkPermission:()=>{},
  getCollectionSheet:()=>({sheet:{appendRow:r=>appended.push(r)},headers:['id','title','message','audience','studentId','class','section','teacherId','status','isPublished']}),
  genId:()=> 'notice-1',recordToRow:(_,record)=>record,writeAudit:()=>{},
  Date
 };
 const sender=vm.runInNewContext(source.slice(addStart,addEnd)+'\naddRecord;',senderContext);
 const spoofed=sender({...teacher,schoolId:'school1'},'notifications',{
  title:'Parents meeting',message:'Class meeting on Monday',
  audience:'all',studentId:'s2',class:'2',section:'Z',teacherId:'not-me',isPublished:false
 });
 assert.equal(spoofed.audience,'Class Playgroup',filename+': teacher can forge audience');
 assert.equal(spoofed.studentId,undefined,filename+': teacher can forge direct student target');
 assert.equal(spoofed.class,'Playgroup',filename+': teacher can forge class');
 assert.equal(spoofed.section,'A',filename+': teacher can forge section');
 assert.equal(spoofed.teacherId,'t1',filename+': teacher actor must come from session');
 assert.equal(spoofed.isPublished,true,filename+': class notice should be publishable');
 assert.equal(appended.length,1,filename+': append should occur exactly once');
 assert.throws(()=>sender({...teacher,schoolId:'school1'},'notifications',{title:'=IMPORTXML(1)',message:'Unsafe'}),/valid title/,filename+': formula-like title accepted');
 assert.throws(()=>sender({role:'teacher',schoolId:'school1',teacher:{id:'t1',assignedClass:''}},'notifications',{title:'Hello',message:'Hello'}),/No assigned class/,filename+': unassigned teacher can post class notice');
 console.log('PASS',filename,cases.length,'read scenarios + scoped teacher notice writes');
}
console.log('Notification scope regression gate passed. No network calls or live writes.');
