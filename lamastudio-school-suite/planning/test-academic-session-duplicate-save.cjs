'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const script=fs.readFileSync(path.join(__dirname,'../js/lama-school-planning.js'),'utf8');
const slice=(begin,end)=>{
 const a=script.indexOf(begin),b=script.indexOf(end,a+begin.length);
 assert.ok(a>=0&&b>a,begin+' missing');return script.slice(a,b);
};
const helper=slice('function sessionKey(name){','async function remove(kind,id){');
const submit=slice("$('sessionForm').onsubmit=async e=>{","$('eventForm').onsubmit=async e=>{");
const make=(id,name='2026-27',active=false)=>({id,category:'planning-session',description:JSON.stringify({name,start:'2026-04-01',end:'2026-12-15',active})});
function build(initial=[],id=''){
 const rows=initial.slice(),messages=[],form={},submitBtn={disabled:false};
 const fields={sessionName:'2026-27',sessionStart:'2026-04-01',sessionEnd:'2026-12-15',sessionId:id};
 const context={rows,messages,form,submitBtn,fields,console};
 let writes=0,releaseWrite=()=>{};
 const env=[
 "let sessionBusy=false;",
 "const type={session:'planning-session',period:'planning-period',event:'planning-event'};",
 "const parsed=r=>JSON.parse(r.description||'{}');",
 "const data=t=>rows.filter(r=>r.category===type[t]).map(r=>({...parsed(r),id:r.id}));",
 "const authorized=()=>{};",
 "const status=s=>messages.push(s);",
 "const field=id=>fields[id]||'';",
 "const $=id=>id==='sessionForm'?form:id==='saveSession'?submitBtn:id==='sessionActive'?{checked:false}:id==='sessionId'?{get value(){return fields.sessionId},set value(v){fields.sessionId=v}}:null;",
 "const LamaAPI={list:async()=>rows.map(r=>({...r}))};",
 "let writes=0,releaseWrite=null;",
 "const save=async(kind,id,p)=>{writes++;return new Promise(resolve=>{releaseWrite=()=>{if(id){const row=rows.find(r=>r.id===id);row.description=JSON.stringify(p)}else{rows.push({id:'NEW1',category:'planning-session',description:JSON.stringify(p)})}resolve(true)}})};",
 helper,submit,
 "globalThis.test={form,fields,rows,messages,submitBtn,readWrites:()=>writes,complete:()=>releaseWrite?.()};"
 ].join('\n');
 const ctx=vm.createContext(context);
 vm.runInContext(env,ctx);
 return ctx.test;
}
(async()=>{
 const x=build();
 const evt={preventDefault(){}};
 const first=x.form.onsubmit(evt);
 const second=x.form.onsubmit(evt);
 await second;
 assert.equal(x.submitBtn.disabled,true,'Save remains disabled while network write is pending');
 assert.match(x.messages.join(' '),/do not submit twice/i);
 await Promise.resolve();await Promise.resolve();
 assert.equal(x.readWrites(),1,'Rapid double click sends exactly one session creation');
 x.complete();await first;
 assert.equal(x.readWrites(),1);
 assert.equal(x.rows.filter(r=>r.category==='planning-session').length,1);
 assert.equal(x.submitBtn.disabled,false);
 await x.form.onsubmit(evt);
 assert.equal(x.readWrites(),1,'Duplicate name rejected after refreshed list');
 assert.match(x.messages.join(' '),/already exists/i);
 const edit=build([make('existing1'),make('existing2')],'existing1');
 const editReq=edit.form.onsubmit(evt);
 await Promise.resolve();await Promise.resolve();
 assert.equal(edit.readWrites(),1,'Existing duplicate record can be edited without creating an additional session');
 edit.complete();await editReq;
 assert.equal(edit.rows.length,2,'Legacy duplicate update does not add a row');
 assert.ok(!edit.messages.some(m=>/already exists/i.test(m)),'Do not trap administrator while editing a pre-existing duplicate');
 const conflict=build([make('prior','2026-27')]);
 conflict.fields.sessionName=' 2026 – 27 ';
 await conflict.form.onsubmit(evt);
 assert.equal(conflict.readWrites(),0,'Unicode dash and spacing variants are blocked as duplicate');
 assert.match(conflict.messages.join(' '),/already exists/);
 console.log('PASS: double-submit lock, unique name preflight and safe editing of legacy duplicate records.');
})().catch(error=>{console.error(error);process.exitCode=1});
