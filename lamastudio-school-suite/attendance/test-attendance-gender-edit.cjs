'use strict';
// Synthetic data only; no live school sheets, accounts or network requests.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'student-attendance-v2.html'),'utf8');
function segment(start,end){
 const a=src.indexOf(start),b=src.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing student register function: '+start);
 return src.slice(a,b);
}
const state={
 students:[
  {id:'s1',enrlNo:'1',name:'Ali',class:'5',gender:'Male'},
  {id:'s2',enrlNo:'2',name:'Sara',class:'5',gender:'Female'},
  {id:'s3',enrlNo:'3',name:'Ahmed',class:'5',gender:'M'},
  {id:'s4',enrlNo:'4',name:'Ayesha',class:'5',gender:'F'},
  {id:'s5',enrlNo:'5',name:'New student',class:'5',gender:''},
  {id:'s6',enrlNo:'6',name:'Other class',class:'4',gender:'Male'}
 ],
 chosen:new Map([
  ['s1',{status:'Present',savedStatus:'Present',recordId:'row-1'}],
  ['s2',{status:'Absent',savedStatus:'Absent',recordId:'row-2'}],
  ['s3',{status:'Leave',savedStatus:'Leave',recordId:'row-3'}]
 ]),
 editing:new Set(),dirty:new Set(),conflicts:new Map(),unmatched:0,
 reviewUnknown:[],writeHold:false,rosterReady:true,historyReady:true,
 loadedDate:'2026-11-17',loading:false,saving:false
};
const nodes=new Map();
const $=key=>{
 if(!nodes.has(key))nodes.set(key,{value:'',innerHTML:'',textContent:'',disabled:false,addEventListener(){},className:''});
 return nodes.get(key);
};
$('date').value='2026-11-17';
$('class').value='5';
const id=s=>String(s.id),enr=s=>String(s.enrlNo),cls=s=>String(s.class);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const messages=[];
const code=segment('function classStudents(){',"$('followup').addEventListener")+
 segment('function choose(k,v){',"['class','filter','search']")+
 'return {classStudents,render,choose,toggleAttendanceEdit,genderTotals,studentGender};';
const ui=new Function('$','state','cls','id','enr','escapeHtml','recentAttendance','qrSaving','portalPublishing','registerNeedsReview','message',code)(
 $,state,cls,id,enr,esc,()=> 'No saved history',false,false,
 ()=>state.conflicts.size>0||state.unmatched>0||state.writeHold,
 (text,error)=>messages.push({text,error})
);
const card=label=>{
 const match=$('summary').innerHTML.match(new RegExp('<div class="panel attendance-summary-card"><div class="muted">'+label+'</div><h2>([^<]+)</h2><p class="gender-breakdown">([^<]+)</p>'));
 assert.ok(match,'Missing '+label+' summary card');
 return {total:match[1],details:match[2]};
};
ui.render();
assert.deepEqual(card('Students'),{total:'5',details:'Boys: 2 · Girls: 2 · Gender not specified: 1'});
assert.deepEqual(card('Present'),{total:'1',details:'Boys: 1 · Girls: 0'});
assert.deepEqual(card('Absent'),{total:'1',details:'Boys: 0 · Girls: 1'});
assert.deepEqual(card('Leave'),{total:'1',details:'Boys: 1 · Girls: 0'});
assert.deepEqual(card('Unmarked'),{total:'2',details:'Boys: 0 · Girls: 1 · Gender not specified: 1'});
assert.deepEqual(card('Needs review'),{total:'0',details:'Boys: 0 · Girls: 0'});
assert.match($('list').innerHTML,/data-edit="s1"/,'Saved rows show an Edit attendance button');
assert.match($('list').innerHTML,/data-edit="s2"/);
assert.doesNotMatch($('list').innerHTML,/data-edit="s4"/,'Unmarked rows should allow direct marking');
state.chosen.set('s5',{status:'Absent',savedStatus:'Absent',saved:true,recordId:''});
ui.render();
assert.match($('list').innerHTML,/data-edit="s5"/,'Legacy saved rows without IDs must still allow deliberate edit');
ui.choose('s5','Present');
assert.equal(state.chosen.get('s5').status,'Absent','Legacy saved row remains locked until Edit');
ui.toggleAttendanceEdit('s5');
ui.choose('s5','Present');
assert.equal(state.dirty.has('s5'),true);
ui.toggleAttendanceEdit('s5');
assert.equal(state.chosen.get('s5').status,'Absent','Cancel restores legacy saved attendance');
state.chosen.delete('s5');
ui.render();

ui.choose('s1','Absent');
assert.equal(state.chosen.get('s1').status,'Present','Saved marks cannot change without Edit');
assert.equal(state.dirty.size,0);
ui.toggleAttendanceEdit('s1');
assert.equal(state.editing.has('s1'),true);
assert.match($('list').innerHTML,/Cancel edit/);
assert.match($('list').innerHTML,/Saved: Present/);
ui.choose('s1','Absent');
assert.equal(state.chosen.get('s1').status,'Absent');
assert.equal(state.dirty.has('s1'),true);
assert.deepEqual(card('Present'),{total:'0',details:'Boys: 0 · Girls: 0'});
assert.deepEqual(card('Absent'),{total:'2',details:'Boys: 1 · Girls: 1'});
assert.match($('count').textContent,/unsaved change/,'Pending correction must not be presented as saved');
assert.match($('followup').innerHTML,/Save and verify attendance edits/);
ui.toggleAttendanceEdit('s1');
assert.equal(state.editing.has('s1'),false);
assert.equal(state.dirty.has('s1'),false);
assert.equal(state.chosen.get('s1').status,'Present','Cancel restores original saved mark');
assert.equal(card('Present').total,'1');
ui.toggleAttendanceEdit('s1');
ui.choose('s1','Absent');
ui.choose('s1','Present');
assert.equal(state.dirty.has('s1'),false,'Reverting to saved status must not submit a change');
ui.toggleAttendanceEdit('s1');
ui.choose('s4','Present');
assert.equal(state.dirty.has('s4'),true,'Unmarked student can be marked without Edit');
assert.deepEqual(card('Present'),{total:'2',details:'Boys: 1 · Girls: 1'});
state.conflicts.set('s1',[{status:'Present'},{status:'Absent'}]);
ui.render();
assert.equal($('save').disabled,true,'Do not save when there are unresolved duplicate records');
ui.toggleAttendanceEdit('s2');
assert.equal(state.editing.has('s2'),false,'Edit must not bypass duplicate hold');
assert.equal(ui.genderTotals([{gender:'Boy'},{gender:'girl'},{gender:'Undisclosed'}]).unspecified,1);
const scripts=[...src.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
for(const script of scripts)new vm.Script(script,{filename:'student-attendance-v2 inline'});
assert.equal((src.match(/<style>/g)||[]).length,(src.match(/<\/style>/g)||[]).length,'Stylesheets should be balanced');
console.log('PASS: explicit saved-mark Edit/Cancel and verified gender subtotals by class/status, with fail-closed safety.');
