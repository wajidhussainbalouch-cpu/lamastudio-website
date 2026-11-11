/* Mock the real listRecords function with Sheets-style Date cells. No live data. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'code.gs'),'utf8');
const start=src.indexOf('function listRecords(ctx, collection) {');
const end=src.indexOf('function getRecord(ctx, collection, id) {',start);
assert.ok(start>=0&&end>start);
const implementation=src.slice(start,end);
const testCases=[
 {instant:new Date('2026-11-09T19:00:00.000Z'),expected:'2026-11-10',utcDay:'2026-11-09'},
 {instant:new Date('2026-11-10T19:00:00.000Z'),expected:'2026-11-11',utcDay:'2026-11-10'}
];
const localDay=(date,tz)=>{
 const fields=new Intl.DateTimeFormat('en-US',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
 const read=type=>fields.find(p=>p.type===type).value;
 return read('year')+'-'+read('month')+'-'+read('day');
};
for(const {instant,expected,utcDay} of testCases){
for(const collection of ['attendance','teacherAttendance']){
 const headers=collection==='attendance'?['id','studentId','date','status']:['id','teacherId','date','status'];
 const sheet={getDataRange:()=>({getValues:()=>[headers,['r1','person1',instant,'Present']]})};
 const ctx={ss:{getSpreadsheetTimeZone:()=> 'Asia/Karachi'},role:'school'};
 let called=false;
 const deps={
  checkPermission:(_ctx,action,col)=>{assert.equal(action,'list');assert.equal(col,collection);},
  getCollectionSheet:()=>({sheet,headers}),
  rowToRecord:(head,row)=>Object.fromEntries(head.map((k,i)=>[k,row[i]])),
  Session:{getScriptTimeZone:()=> 'UTC'},
  Utilities:{formatDate:(d,tz,format)=>{called=true;assert.equal(format,'yyyy-MM-dd');return localDay(d,tz);}}
 };
 const fn=new Function(...Object.keys(deps),implementation+'return listRecords;')(...Object.values(deps));
 const rows=fn(ctx,collection);
 assert.equal(rows.length,1);
 assert.ok(called,'Sheet date converter did not run');
 assert.equal(rows[0].date,expected);
 assert.equal(instant.toISOString().slice(0,10),utcDay);
}}
console.log('PASS: student and staff attendance preserve school-local Nov 10 and Nov 11 (Asia/Karachi), despite previous UTC dates.');
