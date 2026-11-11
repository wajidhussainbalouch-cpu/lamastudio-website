/* School-admin teacher attendance requests must not inherit a teacher role. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'api-client.js'),'utf8');
const local=new Map();
local.set('lamastudio_session_teacher',JSON.stringify({role:'teacher',schoolId:'other-school',teacherId:'unrelated-teacher',apiKey:'other-secret'}));
const session=new Map();
session.set('lamastudio_active_role','teacher');
session.set('lama_school_admin_auth',JSON.stringify({schoolId:'correct-school',token:'admin-token'}));
const storage=m=>({getItem:key=>m.get(key)||null,setItem:(key,value)=>m.set(key,value),removeItem:key=>m.delete(key)});
const calls=[];
const fetch=async(_url,opts)=>{
 calls.push(opts);
 return {ok:true,status:200,text:async()=>JSON.stringify({status:'success',records:[],record:{id:'test-record'}})};
};
const api=new Function('localStorage','sessionStorage','fetch','URLSearchParams',
 source+';return LamaAPI;')(storage(local),storage(session),fetch,URLSearchParams);
(async()=>{
 await api.list('teacherAttendance');
 await api.add('teacherAttendance',{teacherId:'t1',date:'2026-11-10',status:'Present'});
 await api.update('teacherAttendance','test-record',{status:'Absent'});
 assert.equal(calls.length,3);
 for(const request of calls){
  assert.equal(request.method,'POST','Keep admin token out of GET URLs');
  const body=JSON.parse(request.body);
  assert.equal(body.role,'school');
  assert.equal(body.schoolId,'correct-school');
  assert.equal(body.token,'admin-token');
  assert.ok(!body.apiKey && !body.adminApiKey && !body.studentId,'No unrelated login secrets');
 }
 console.log('PASS: teacher attendance list/add/update use correct school admin token even when another teacher session is active.');
})().catch(error=>{console.error(error);process.exitCode=1;});
