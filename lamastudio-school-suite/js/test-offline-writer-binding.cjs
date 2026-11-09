/*
 * Prevent offline sync under a different school / teacher / admin login.
 * Run: node lamastudio-school-suite/js/test-offline-writer-binding.cjs
 * Identity checks are a client-side defense IN ADDITION to backend authorization.
 * Mocked sessions only; does not touch any school account or real database.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'offline-attendance.js'),'utf8');
const a=source.indexOf('function authorizedWriter(){');
const b=source.indexOf('function online(){',a);
assert.ok(a>=0&&b>a,'Cannot find school/teacher writer authorization');
const authSource=source.slice(a,b);
const make=ctx=>new Function(...Object.keys(ctx),authSource+'return authorizedWriter;')(...Object.values(ctx));
const teacherA={role:'teacher',schoolId:'school-A',teacherId:'t1',apiKey:'key-A'};
const schoolA={role:'school',schoolId:'school-A',apiKey:'school-key'};
let current=teacherA;
const teacher=make({
 teacherMode:true,schoolId:'school-A',accountId:'t1',session:teacherA,
 LamaAPI:{getSession:role=>role==='teacher'?current:null},
 sessionStorage:{getItem:()=>null},initialSchoolAdminToken:''
});
assert.equal(teacher(),true,'Original class teacher should sync');
current={...teacherA,teacherId:'t2'};
assert.equal(teacher(),false,'Another teacher at same school must not use original vault');
current={...teacherA,schoolId:'school-B'};
assert.equal(teacher(),false,'Teacher in different school cannot sync');
current={...teacherA,apiKey:'new-key'};
assert.equal(teacher(),false,'Replaced teacher credentials require reopen and unlock');
current=null;
assert.equal(teacher(),false,'Logged-out teacher cannot synchronize');
let schoolSession=schoolA,adminAuth={schoolId:'school-A',token:'admin-A'};
const admin=make({
 teacherMode:false,schoolId:'school-A',accountId:'admin',session:schoolA,
 initialSchoolAdminToken:'admin-A',
 LamaAPI:{getSession:role=>role==='school'?schoolSession:null},
 sessionStorage:{getItem:()=>JSON.stringify(adminAuth)}
});
assert.equal(admin(),true,'Original administrator should sync');
schoolSession={...schoolA,schoolId:'school-B'};
assert.equal(admin(),false,'School switching must stop original school sync');
schoolSession=schoolA;adminAuth={schoolId:'school-B',token:'admin-A'};
assert.equal(admin(),false,'Administrator token in other school must not sync');
adminAuth={schoolId:'school-A',token:'admin-B'};
assert.equal(admin(),false,'Another administrator or rotated token must not sync stale page');
adminAuth={schoolId:'school-A',token:'admin-A'};
schoolSession=null;
assert.equal(admin(),false,'School logout must stop sync');
console.log('PASS: 10 checks bind offline sync to the original teacher or school administrator login.');
