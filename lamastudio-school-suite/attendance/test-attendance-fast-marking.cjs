'use strict';
// Synthetic only: tests touch responsiveness without a backend or real school data.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'student-attendance-v2.html'),'utf8');
const section=(start,end)=>{
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing source range: '+start);
 return html.slice(a,b);
};
const date='2026-11-17';
const students=Array.from({length:350},(_,i)=>({
 id:'s'+(i+1),name:'Student '+(i+1),enrlNo:String(i+1),class:'5',
 gender:i%2===0?'Male':'Female',fatherName:'Parent '+(i+1)
}));
const state={
 students,history:[],chosen:new Map(),dirty:new Set(),editing:new Set(),
 conflicts:new Map(),unmatched:0,reviewUnknown:[],writeHold:false,
 rosterReady:true,historyReady:true,loading:false,saving:false,
 loadedDate:date
};
let listRebuilds=0,followupRebuilds=0,followupNotices=0,summaryRebuilds=0;
const dom=new Map();
function get(key){
 if(!dom.has(key)){
  const n={value:'',disabled:false,className:'',_html:'',_text:''};
  Object.defineProperty(n,'innerHTML',{get(){return this._html},set(v){
   this._html=String(v);
   if(key==='list')listRebuilds++;
   if(key==='followup')followupRebuilds++;
   if(key==='summary')summaryRebuilds++;
  }});
  Object.defineProperty(n,'textContent',{get(){return this._text},set(v){
   this._text=String(v);
   if(key==='followup')followupNotices++;
  }});
  dom.set(key,n);
 }
 return dom.get(key);
}
const $=get;
$('date').value=date;
$('class').value='5';
$('filter').value='';
$('search').value='';
const cls=s=>String(s.class),id=s=>String(s.id),enr=s=>String(s.enrlNo);
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let networkCalls=0;
const code=section('function classStudents(){',"$('followup').addEventListener")+
 section('function updateMarkFeedback(k,value,button,previousDirtyCount){',"['class','filter','search']")+
 'return {render,choose,updateMarkFeedback,visible,studentGender};';
const api=new Function('$','state','cls','id','enr','escapeHtml','recentAttendance',
 'qrSaving','portalPublishing','registerNeedsReview','message',code)(
 $,state,cls,id,enr,escapeHtml,()=>'No prior marks',false,false,
 ()=>state.conflicts.size>0||state.unmatched>0||state.writeHold,
 ()=>{networkCalls++}
);
api.render();
const initialListRebuilds=listRebuilds,initialFollowupRebuilds=followupRebuilds;
const clicked=(index)=>{
 const statuses=['Present','Absent','Leave'].map(status=>({dataset:{status},className:''}));
 const row={querySelectorAll(selector){assert.equal(selector,'button[data-status]');return statuses}};
 const button={closest(selector){assert.equal(selector,'.student');return row}};
 api.choose('s'+index,index%2?'Absent':'Present',button);
 const wanted=index%2?'absent selected':'present selected';
 assert.ok(statuses.some(x=>x.className.includes('selected')),'Clicked row must visibly select a status');
 return statuses;
};
for(let i=1;i<=349;i++)clicked(i);
assert.equal(state.dirty.size,349);
assert.equal(state.chosen.size,349);
assert.equal(listRebuilds,initialListRebuilds,
 '349 mobile taps must not rebuild 350 student DOM rows');
assert.equal(followupRebuilds,initialFollowupRebuilds,
 'Do not regenerate parent seven-day history on each tap');
assert.equal(followupNotices,1,'One small follow-up notice, not 349 repeated updates');
assert.equal(networkCalls,0,'Marking is local: Save changes is the only network write');
assert.equal($('save').disabled,false,'Save button must become immediately available');
assert.equal(api.visible().length,350,'Unfiltered register keeps every student in place');
const summary=$('summary').innerHTML;
assert.match(summary,/Present<\/div><h2>174<\/h2>/);
assert.match(summary,/Absent<\/div><h2>175<\/h2>/);
assert.match(summary,/Unmarked<\/div><h2>1<\/h2>/);
assert.match(summary,/Boys: 175 · Girls: 175/,'Gender totals stay class-scoped');
assert.match($('count').textContent,/349 unsaved change/);
const prior=listRebuilds;
$('filter').value='Unmarked';
api.choose('s350','Present',clickedButton());
function clickedButton(){
 const cells=['Present','Absent','Leave'].map(v=>({dataset:{status:v},className:''}));
 return {closest:()=>({querySelectorAll:()=>cells})};
}
assert.equal(listRebuilds,prior+1,
 'Status-filtered marking must still rerender once so a student leaves the Unmarked list');
assert.equal(api.visible().length,0);
assert.equal(state.dirty.size,350);
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match=>match[1]).filter(Boolean);
for(const script of scripts)new vm.Script(script,{filename:'student-attendance-v2 inline'});
console.log('PASS: 349 individual attendance taps update the chosen row and totals with zero roster or parent-history rebuilds; status filter correctly falls back to one full refresh.');
