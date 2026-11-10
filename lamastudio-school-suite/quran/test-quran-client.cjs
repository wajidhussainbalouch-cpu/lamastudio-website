/* Verify role-scoped Quran API calls and independent save readback logic. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const app=fs.readFileSync(path.join(__dirname,'quran-app.js'),'utf8');
const apiSrc=fs.readFileSync(path.join(__dirname,'../js/api-client.js'),'utf8');
const first=app.indexOf('function quranFindVerified(pending,profile){');
const last=app.indexOf('async function verifyPending(){',first);
assert.ok(first>=0&&last>first);
const verify=new Function(app.slice(first,last)+'return quranFindVerified;')();
const pending={action:'quranSaveLesson',enrollmentId:'en1',clientRequestId:'rid123456',studentId:'stu1',date:'2026-11-10'};
assert.equal(verify(pending,{lessons:[]}),null,'Empty server response is unverified');
assert.equal(verify(pending,{lessons:[{enrollmentId:'en1',clientRequestId:'different'}]}),null);
assert.equal(verify(pending,{lessons:[{enrollmentId:'en2',clientRequestId:'rid123456'}]}),null,'Other learner must never match');
const official={id:'l1',version:1,enrollmentId:'en1',clientRequestId:'rid123456'};
assert.equal(verify(pending,{lessons:[official]}).id,'l1');
assert.equal(verify(pending,{lessons:[official,official]}),null,'Duplicate cloud responses cannot be confirmed');
assert.equal(verify({...pending,action:'quranSaveAttendance'},
 {attendance:[{...official,status:'Present'}]}).status,'Present');
assert.equal(verify({...pending,action:'quranSaveAssessment'},
 {assessments:[{...official,criterion:'Makharij'}]}).criterion,'Makharij');
const local=new Map(),session=new Map(),requests=[];
const storage=m=>({getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)});
const fetch=async(url,opts)=>{
 requests.push({url,opts});
 return{ok:true,status:200,text:async()=>JSON.stringify({status:'success',result:{verified:true}})};
};
const Params=class {constructor(){this.values=[]}set(a,b){this.values.push([a,b])}toString(){return this.values.join('&')}};
const API=new Function('localStorage','sessionStorage','fetch','URLSearchParams',
 apiSrc+';return LamaAPI;')(storage(local),storage(session),fetch,Params);
(async()=>{
 local.set('lamastudio_session_teacher',JSON.stringify({
  role:'teacher',schoolId:'schoolA',teacherId:'tA',apiKey:'teacher-key'
 }));
 session.set('lamastudio_active_role','teacher');
 await API.quran('quranSaveLesson',{enrollmentId:'e1',clientRequestId:'rid123456'},'teacher');
 let body=JSON.parse(requests.at(-1).opts.body);
 assert.equal(requests.at(-1).opts.method,'POST','Lesson write must use POST');
 assert.equal(body.role,'teacher');assert.equal(body.teacherId,'tA');
 assert.equal(body.schoolId,'schoolA');assert.equal(body.apiKey,'teacher-key');
 local.set('lamastudio_session_school',JSON.stringify({role:'school',schoolId:'schoolA',apiKey:null}));
 session.set('lama_school_admin_auth',JSON.stringify({schoolId:'schoolA',token:'verified-admin-token'}));
 await API.quran('quranOverview',{},'school');
 body=JSON.parse(requests.at(-1).opts.body);
 assert.equal(body.schoolId,'schoolA');assert.equal(body.role,'school');
 assert.equal(body.token,'verified-admin-token');
 assert.ok(!body.apiKey,'School token should not require exposing the private API key');
 session.set('lama_school_admin_auth',JSON.stringify({schoolId:'other-school',token:'bad'}));
 await assert.rejects(API.quran('quranEnroll',{},'school'),/Verified School Administrator/);
 local.set('lamastudio_session_student',JSON.stringify({
  role:'student',schoolId:'schoolA',studentId:'s1',apiKey:'student-key'
 }));
 await API.quran('quranProfile',{studentId:'s1'},'student');
 body=JSON.parse(requests.at(-1).opts.body);
 assert.equal(body.role,'student');assert.equal(body.studentId,'s1');
 assert.equal(body.apiKey,'student-key');
 local.set('lamastudio_session_admin',JSON.stringify({role:'admin',adminApiKey:'super-key'}));
 await API.quran('quranAdminSetSchool',{targetSchoolId:'schoolA',enabled:true,hifzEnabled:false},'admin');
 body=JSON.parse(requests.at(-1).opts.body);
 assert.equal(body.role,'admin');assert.equal(body.adminApiKey,'super-key');
 assert.equal(requests.length,4);
 await assert.rejects(API.quran('list',{},'teacher'),/Invalid Quran operation/);
 console.log('PASS: role-separated POST auth, school admin token, parent isolation by credential, pending verification and duplicate readback checks.');
})().catch(e=>{console.error(e);process.exitCode=1;});
