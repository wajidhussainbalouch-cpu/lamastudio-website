/* Mock verified administrator routing for teacher attendance. No real account data. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'code.gs'),'utf8');
const from=source.indexOf('function handleRequest(params) {'),to=source.indexOf('function doPost(e) {',from);
assert.ok(from>=0&&to>from);
const seen=[];
const mock={
 verifySchoolAdminToken:p=>{if(p.token!=='valid-admin-token')throw Error('School Admin session expired');},
 getRegistrySheet:()=>({}),
 findSchoolRow:()=>({obj:{status:'Active',apiKey:'server-only-secret'}}),
 requireSchoolAdminWrite:p=>{assert.equal(p.apiKey,'server-only-secret');return{id:'admin-1',role:'schoolAdmin'};},
 resolveContext:p=>{assert.equal(p.role,'school');assert.equal(p.apiKey,'server-only-secret');return{role:'school',schoolId:p.schoolId};},
 listRecords:(_ctx,c)=>{seen.push('list '+c);return[];},
 addRecord:(_ctx,c,record)=>{seen.push('add '+c);return{id:'r1',...record};},
 updateRecord:(_ctx,c,id,patch)=>{seen.push('update '+c);return{id,...patch};}
};
const handle=new Function(...Object.keys(mock),source.slice(from,to)+'return handleRequest;')(...Object.values(mock));
const base={role:'school',schoolId:'sch-demo',token:'valid-admin-token',collection:'teacherAttendance'};
for(const action of ['list','add','update']){
 const input={...base,action,record:{teacherId:'teacher-1',date:'2026-11-10',status:'Present'},id:'r1',patch:{status:'Absent'}};
 const result=handle(input);
 assert.equal(result.status,'success');
 assert.ok(!JSON.stringify(result).includes('server-only-secret'),'Never expose the school API key');
}
assert.deepEqual(seen,['list teacherAttendance','add teacherAttendance','update teacherAttendance']);
const invalid=handle({...base,token:'invalid',action:'add',record:{teacherId:'t1'}});
assert.equal(invalid.status,'error','Invalid admin token must not save');
assert.deepEqual(seen,['list teacherAttendance','add teacherAttendance','update teacherAttendance']);
console.log('PASS: token-only school administrator can list/add/update teacher attendance; invalid token rejected.');
