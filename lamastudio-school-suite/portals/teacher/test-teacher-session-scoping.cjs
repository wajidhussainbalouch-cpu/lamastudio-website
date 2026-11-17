'use strict';
// Synthetic browser sessions. Verifies teacher API calls cannot borrow the owner's school token.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../../js/api-client.js'),'utf8');
const local=new Map([
 ['lamastudio_session_school',JSON.stringify({role:'school',schoolId:'SCHOOL-A',apiKey:'SCHOOL_PRIVATE'})],
 ['lamastudio_session_teacher',JSON.stringify({role:'teacher',schoolId:'SCHOOL-A',teacherId:'T-007',apiKey:'TEACHER_KEY'})]
]);
const session=new Map([
 ['lamastudio_active_role','teacher'],
 ['lama_school_admin_auth',JSON.stringify({schoolId:'SCHOOL-A',token:'OWNER_SESSION_TOKEN'})]
]);
const localStorage={getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v),removeItem:k=>local.delete(k)};
const sessionStorage={getItem:k=>session.get(k)||null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)};
const sent=[];
const ctx={localStorage,sessionStorage,URLSearchParams,fetch:async (url,opts)=>{
 const request=opts.method==='GET'?Object.fromEntries(new URL(url).searchParams):JSON.parse(opts.body||'{}');sent.push(request);
 return {ok:true,status:200,text:async()=>{
  if(request.action==='list')return JSON.stringify({status:'success',records:[]});
  if(request.action==='bulkAttendance')return JSON.stringify({status:'success',result:{saved:1,updated:0,inserted:1}});
  return JSON.stringify({status:'error',message:'Unexpected action'});
 }};
}};
vm.createContext(ctx);
vm.runInContext(source+';globalThis.testApi=LamaAPI',ctx);
(async()=>{
 const api=ctx.testApi;
 assert.equal(api.requireLogin('teacher'),true);
 await api.list('students');
 await api.list('attendance');
 await api.list('homework');
 const batch=await api.bulkAttendance('2026-11-17',[{studentId:'fake-id',status:'Present'}]);
 assert.equal(batch.saved,1);
 assert.equal(sent.length,4);
 for(const item of sent){
  assert.equal(item.role,'teacher','Role must remain teacher for '+item.action+'/'+item.collection);
  assert.equal(item.schoolId,'SCHOOL-A');
  assert.equal(item.teacherId,'T-007');
  assert.equal(item.apiKey,'TEACHER_KEY');
  assert.equal('token' in item,false,'School administrator token must not leak into teacher request');
  assert.notEqual(item.apiKey,'SCHOOL_PRIVATE');
 }
 console.log('PASS: roster, attendance, homework and 1-batch writes use only class teacher credentials, even with a school admin session stored.');
})().catch(error=>{console.error(error);process.exitCode=1});
