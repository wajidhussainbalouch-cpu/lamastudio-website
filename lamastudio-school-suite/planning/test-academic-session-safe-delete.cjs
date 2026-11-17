'use strict';
// Synthetic academic-session data only. No school Sheet or network connection.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../js/lama-school-planning.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
new vm.Script(code,{filename:'planning.js'});
const between=(start,end)=>{
 const a=code.indexOf(start),b=code.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Source boundaries missing: '+start);
 return code.slice(a,b);
};
const helpers=between('function sessionKey(name){','async function remove(kind,id){');
const deletion=between('async function remove(kind,id){','function sessions(){');
const makeRow=(id,category,value)=>({id,category,description:JSON.stringify(value)});
const type={session:'planning-session',period:'planning-period',event:'planning-event'};
const records=[
 makeRow('session-OLD1',type.session,{name:'20262',start:'2026-04-01',end:'2026-12-15',active:true}),
 makeRow('session-1111',type.session,{name:'2026-27',start:'2026-04-01',end:'2026-12-15',active:false}),
 makeRow('session-2222',type.session,{name:'2026-27',start:'2026-04-01',end:'2026-12-15',active:false}),
 makeRow('period-1',type.period,{sessionId:'session-OLD1',day:'Monday',grade:'4',subject:'Urdu'}),
 makeRow('event-1',type.event,{sessionId:'session-OLD1',type:'Holiday',title:'Iqbal Day'})
];
const parse=r=>JSON.parse(r.description||'{}');
const pure=new Function('rows','type','parsed',helpers+'return {sessionKey,sessionReferences,sessionRecords,sessionDuplicate};')(records,type,parse);
assert.equal(pure.sessionKey(' 2026 – 27 '),'2026-27','Unicode dash and whitespace normalized');
assert.equal(pure.sessionKey('2026-27'),'2026-27');
assert.equal(pure.sessionReferences('session-OLD1').periods,1);
assert.equal(pure.sessionReferences('session-OLD1').events,1);
assert.equal(pure.sessionReferences('session-1111').periods,0);
assert.equal(pure.sessionDuplicate({name:'2026–27',start:'2026-01-01',end:'2026-12-31'}).id,'session-1111','Existing name rejected regardless of date');
assert.equal(pure.sessionDuplicate({name:'2026-27'},'session-1111').id,'session-2222','Editing one duplicate must still detect other duplicate');
assert.equal(pure.sessionDuplicate({name:'2026-28'}),undefined);

function harness({authorized=true,confirmValue=true,noOpRemove=false,staleDependency=false}={}){
 const server=records.map(r=>({...r})),messages=[],deletions=[],confirms=[];
 // This mock exposes methods to insert a concurrent linked event on the
 // server without adding it to the stale UI list.
 const src=[
  'let rows=initialRows.map(r=>({...r})),sessionBusy=false;',
  'const type=types;',
  'const parsed=r=>JSON.parse(r.description||"{}");',
  'const data=k=>rows.filter(r=>r.category===type[k]).map(r=>({...parsed(r),id:r.id}));',
  "const authorized=()=>{if(!authorization)throw Error('Verified school administrator required')};",
  'const status=s=>messages.push(s);',
  "const $=id=>id==='sessionId'?{get value(){return editId},set value(v){editId=v}}:null;",
  "const LamaAPI={list:async()=>server.map(r=>({...r})),remove:async(collection,id)=>{assert.equal(collection,'resources');deletions.push(id);if(!noOpRemove){const pos=server.findIndex(r=>r.id===id);if(pos>=0)server.splice(pos,1)}}};",
  'const confirm=text=>{confirms.push(text);return confirmValue};',
  'const load=async()=>{rows=server.map(r=>({...r}));return true};',
  helpers,deletion,
  'globalThis.api={remove,sessionReferences,sessionRecords,getRows:()=>rows};'
 ].join('\n');
 let editId='session-1111';
 const context={initialRows:records,types:type,authorization:authorized,noOpRemove,confirmValue,server,messages,deletions,confirms,assert,console,
  get editId(){return editId},set editId(v){editId=v}};
 vm.createContext(context);vm.runInContext(src,context);
 return {api:context.api,server,messages,deletions,confirms,addDependency:()=>server.push(makeRow('event-late',type.event,{sessionId:'session-1111',title:'Important school event'}))};
}
(async()=>{
 const h=harness();
 await assert.rejects(()=>h.api.remove('session','session-OLD1'),/Deactivate/,'Active session protected');
 assert.equal(h.deletions.length,0);
 const linked=harness();
 const ctx=linked.server.find(r=>r.id==='session-OLD1');
 ctx.description=JSON.stringify({...parse(ctx),active:false});
 // The stale screenshot still has active=true; rejection remains fail-closed.
 await assert.rejects(()=>linked.api.remove('session','session-OLD1'),/Deactivate/);
 const changed=harness();
 changed.addDependency();
 await assert.rejects(()=>changed.api.remove('session','session-1111'),/now refer to/,'Server-side refreshed dependency prevents deletion');
 assert.equal(changed.deletions.length,0);
 const cancelled=harness({confirmValue:false});
 await cancelled.api.remove('session','session-1111');
 assert.equal(cancelled.deletions.length,0);
 const denied=harness({authorized:false});
 await assert.rejects(()=>denied.api.remove('session','session-1111'),/Verified school administrator required/);
 assert.equal(denied.deletions.length,0);
 const success=harness();
 await success.api.remove('session','session-1111');
 assert.deepEqual(success.deletions,['session-1111'],'Delete exactly the chosen duplicate ID');
 assert.ok(success.server.some(r=>r.id==='session-2222'),'Keep the other duplicate untouched');
 assert.ok(success.server.some(r=>r.id==='session-OLD1'),'Keep the active session untouched');
 assert.equal(success.confirms.length,1);
 assert.match(success.confirms[0],/session-1111/,'Confirmation names the exact record');
 assert.match(success.confirms[0],/2026-27/);
 assert.ok(success.messages.some(m=>/deleted and the list verified/.test(m)));
 const backendNoop=harness({noOpRemove:true});
 await assert.rejects(()=>backendNoop.api.remove('session','session-1111'),/Deletion was not verified/,'Backend false-success must not show deleted');
 assert.ok(!backendNoop.messages.some(m=>/deleted and the list verified/.test(m)));
 assert.match(code,/data-remove-session/);
 assert.match(code,/disabled:cursor-not-allowed/);
 assert.match(code,/sessionBusy=true/);
 assert.match(code,/sessionDuplicate\(p,editingId,latest\)/,'Fresh duplicate check before create/update');
 assert.match(html,/id="saveSession"/);
 assert.match(html,/id="clearSession"/);
 assert.match(html,/sessions used by timetable periods or calendar events cannot be deleted/i);
 console.log('PASS: duplicate detection, active/linked blockers, fresh read, exact-ID confirmation, authenticated deletion and verified single-record removal.');
})().catch(error=>{console.error(error);process.exitCode=1});
