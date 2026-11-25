// Non-destructive Node.js regression checks for EXISTING LAMA School Suite modules.
// Run: node lamastudio-school-suite/tests/core-regressions.cjs
// This script never calls the real backend, writes school records, or sends messages.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.resolve(__dirname, '..', 'js');

function script(name, extra = {}) {
  const context = { window: {}, console, Date, Intl, ...extra };
  vm.runInNewContext(fs.readFileSync(path.join(base, name), 'utf8'), context, {filename: name});
  return context;
}
const H = script('attendance-history.js').window.LamaAttendanceHistory;
const people = [
  {id:'s1',enrlNo:'100',name:'Rukhsana',class:'Playgroup'},
  {id:'s2',enrlNo:'101',name:'Jabir',class:'Playgroup'},
  {id:'s3',enrlNo:'200',name:'Student C',class:'1'}
];
const day = '2026-11-21';
const records = [
  {studentId:'s1',date:day,status:'Absent'},
  {studentId:'s2',date:day,status:'Present'},
  {studentId:'s3',date:day,status:'Absent'},
  {studentId:'s3',date:day,status:'Present'}
];
let model = H.make(people, records);
assert.equal(model.get(people[0],day),'Absent');
assert.equal(model.get(people[1],day),'Present');
assert.equal(model.get(people[2],day),'Present','last saved correction wins');
assert.equal(model.get(people[1],'2026-11-20'),'','missing marks are not absences');
assert.equal(H.dateKey('2026-11-20T20:30:00Z'),day,'Pakistan date normalization');
assert.equal(H.dateKey('21/11/2026'),day);

const duplicate = [
 {id:'a',enrlNo:'7',class:'1'},
 {id:'b',enrlNo:'7',class:'1'},
 {id:'c',enrlNo:'8',class:'1'}
];
model = H.make(duplicate,[
 {enrlNo:'7',date:day,status:'Absent'},
 {studentId:'nonexistent-id',enrlNo:'8',date:day,status:'Absent'},
 {enrlNo:'8',date:day,status:'Leave'},
 {studentId:'a',date:day,status:'Present'}
]);
assert.equal(model.get(duplicate[0],day),'Present');
assert.equal(model.get(duplicate[1],day),'','duplicate enrollment is ambiguous');
assert.equal(model.get(duplicate[2],day),'Leave','unique ID-less historical record may match');
const history = H.make(people,records);
let review = H.pendingPortalNotices(people,day,history,[
 {studentId:'s1',date:day,notificationType:'attendanceAbsence',isPublished:true,status:'Published'}
]);
assert.equal(review.selected.map(s=>s.id).join(','),'s1');
assert.equal(review.already.map(s=>s.id).join(','),'s1','reuse automatic absence notice');
assert.equal(review.pending.length,0);
review = H.pendingPortalNotices(people,day,history,[
 {studentId:'s1',date:day,notificationType:'attendanceAbsence',isPublished:true,status:'Resolved'}
]);
assert.equal(review.pending.map(s=>s.id).join(','),'s1','resolved notice does not block a new one');
assert.throws(()=>H.pendingPortalNotices(people,'invalid',history,[]));

const M = script('parent-absence-message.js').window.LamaParentAbsence;
assert.equal(M.phone('0345 7363813').wa,'923457363813');
assert.equal(M.phone('+923457363813').sms,'+923457363813');
assert.equal(M.phone('0000'),null,'invalid parent contact is rejected');
assert.equal(M.register(people[0],'Present',day,'School'),'','present students do not get absence drafts');
const bilingual = M.message({
 name:'Rukhsana',className:'Playgroup',date:day,schoolName:'Allama Iqbal Model School',status:'absent'
},'both');
assert.match(bilingual,/Rukhsana/);
assert.match(bilingual,/محترم/);
assert.match(bilingual,/Dear Parent/);
assert.match(M.message({name:'Rukhsana',date:day,status:'leave'},'urdu'),/رخصت/);

// A student request must never inherit a stored school-admin token merely
// because an administrator previously used the same browser.
function store() {
 const m = new Map();
 return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};
}
const localStorage = store(),sessionStorage = store(),sent = [];
const fetch = async (url,args) => {
 const data = args?.method === 'POST' ? JSON.parse(args.body) : Object.fromEntries(new URL(url).searchParams);
 sent.push(data);
 return {ok:true,status:200,text:async()=>JSON.stringify({status:'success',records:[]})};
};
const env = {localStorage,sessionStorage,fetch,console,URLSearchParams,URL,location:{href:''}};
vm.runInNewContext(fs.readFileSync(path.join(base,'api-client.js'),'utf8')+
 '\nthis.__api=LamaAPI;',env,{filename:'api-client.js'});
const api = env.__api;
api.setSession({role:'school',schoolId:'school1',apiKey:'schoolkey'});
api.setSession({role:'student',schoolId:'school1',studentId:'s1',apiKey:'studentkey'});
sessionStorage.setItem('lama_school_admin_auth',JSON.stringify({schoolId:'school1',token:'secretAdminToken'}));
(async()=>{
 await api.list('attendance');
 await api.list('notifications');
 assert.equal(sent.length,2);
 assert.equal(sent.every(x=>x.role==='student'&&x.studentId==='s1'&&!x.token),true,'student-only credentials');
 sessionStorage.setItem('lamastudio_active_role','school');
 await api.list('notifications');
 assert.equal(sent[2].role,'school');
 assert.equal(sent[2].token,'secretAdminToken');
 console.log('PASS LAMA core regressions: attendance identity, corrected marks, portal notice deduplication, bilingual messages, number validation, role isolation');
})().catch(err=>{console.error(err);process.exitCode=1;});
