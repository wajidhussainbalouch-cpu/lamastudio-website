'use strict';
// Synthetic DOM test: no school records or attendance writes.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const start=src.indexOf('function setAttStatus(btn,status){');
const end=src.indexOf('function toggleTeacherAttendanceEdit(key){',start);
assert.ok(start>=0&&end>start,'Teacher tap handler must be present');
assert.doesNotMatch(src.slice(start,end),/\.attendance-note:last-child/,'Status note must not depend on being last child');
const notes=[{textContent:'Enrollment: 3 · Parent: Guardian'},{textContent:'Saved: Present'}];
const badge={textContent:'✓ Saved and verified',classList:{active:false,toggle(_name,v){this.active=v}}};
const buttons=['Present','Absent','Leave'].map(status=>({dataset:{status},className:'att-btn',attributes:{},setAttribute(name,value){this.attributes[name]=value}}));
const row={
 dataset:{studentId:'s1'},
 querySelectorAll(selector){
  if(selector==='.att-btn')return buttons;
  if(selector==='.attendance-note')return notes;
  throw Error('Unexpected row selector '+selector);
 },
 querySelector(selector){
  if(selector==='.att-save-badge')return badge;
  throw Error('Unexpected badge selector '+selector);
 }
};
const clicked={disabled:false,closest:sel=>{assert.equal(sel,'[data-student-id]');return row}};
const drafts=new Map(),editing=new Set(['s1']);
const saved=new Map([['s1',{status:'Present'}]]);
let summaryUpdates=0,headerUpdates=0,networkCalls=0;
const context={
 attendanceSaving:false,attendanceVerifying:false,attendanceReady:true,attendanceUncertain:false,
 draftAttendance:drafts,editingAttendance:editing,
 attendanceSnapshot:()=>({unique:saved,duplicates:new Map(),unmatched:[]}),
 $:id=>id==='attDate'?{value:'2026-11-17'}:null,
 renderTeacherStats:()=>{summaryUpdates++},
 updateStats:()=>{headerUpdates++},
 LamaAPI:{bulkAttendance(){networkCalls++}},
 Map,console
};
vm.createContext(context);
vm.runInContext(src.slice(start,end)+'globalThis.tap=setAttStatus;',context);
context.tap(clicked,'Absent');
assert.equal(drafts.get('s1'),'Absent');
assert.match(notes[1].textContent,/Unsaved change/,'Saved-status note must change immediately');
assert.equal(notes[0].textContent,'Enrollment: 3 · Parent: Guardian','Parent/enrollment remain unchanged');
assert.equal(badge.textContent,'● Unsaved change');
assert.equal(badge.classList.active,true);
assert.equal(buttons[1].attributes['aria-pressed'],'true');
assert.match(buttons[1].className,/att-active-absent/);
assert.equal(summaryUpdates,1);
assert.equal(headerUpdates,1);
context.tap(clicked,'Present');
assert.equal(drafts.size,0,'Returning to saved value must not create another write');
assert.equal(notes[1].textContent,'Saved: Present');
assert.equal(badge.textContent,'✓ Saved and verified');
assert.equal(badge.classList.active,false);
assert.equal(buttons[0].attributes['aria-pressed'],'true');
assert.equal(networkCalls,0,'Marking buttons must never write directly to Google Sheets');
editing.delete('s1');
context.tap(clicked,'Leave');
assert.equal(drafts.size,0,'Saved marks locked until explicit Edit attendance');
console.log('PASS: Present/Absent taps instantly update the correct row note, badge and counters without API requests.');
