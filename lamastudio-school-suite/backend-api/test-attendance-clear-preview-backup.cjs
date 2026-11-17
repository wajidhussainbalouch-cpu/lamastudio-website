'use strict';
// In-memory Apps Script mocks only; never opens or modifies any school sheet.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const src=fs.readFileSync(path.join(__dirname,'code.gs'),'utf8');
const from=src.indexOf('function clearStudentAttendanceDate_(p) {');
const to=src.indexOf('\n\nconst SUPPORT_HEADERS_',from);
assert.ok(from>0&&to>from,'Attendance clear function unavailable');
const snippet=src.slice(from,to);
assert.match(snippet,/lock\.tryLock\(20000\)/);
assert.match(snippet,/previewToken/);
assert.match(snippet,/attendanceSchoolDayKey_/);
assert.match(snippet,/Backup verification failed/);
const columns=['id','studentId','enrlNo','class','date','status'];
const clone=rows=>rows.map(row=>row.slice());
const records=[
 ['r1','s1','1','4','2026-11-15','Present'],
 ['r2','s1','1','4','2026-11-15','Absent'],
 ['r3','s2','2','4','2026-11-15','Present'],
 ['r4','s3','3','2','2026-11-16','Leave']
];
let rows=[columns.slice(),...clone(records)],backups=[],audits=[],held=false,obtained=0,released=0;
let tamperBackup=false,uuid=0,denyLock=false;
const sheet={
 getDataRange(){return {getValues:()=>clone(rows)};},
 deleteRow(n){assert.ok(held,'Deletion must be inside the lock'); rows.splice(n-1,1)}
};
const ss={
 getSpreadsheetTimeZone:()=> 'Asia/Karachi',
 insertSheet(name){
   assert.ok(held,'Backup must be created under lock');
   assert.ok(!backups.some(b=>b.name===name),'Backup name must be unique');
   const backupRows=[];const backup={
     name,rows:backupRows,
     getRange(row,col,height,width){return {setValues(values){
       assert.equal(width,columns.length);
       for(let i=0;i<height;i++)backupRows[row+i-1]=values[i].slice();
     }}},
     getDataRange(){return {getValues(){
       const data=clone(backupRows);
       if(tamperBackup&&data[1])data[1][5]='Corrupted';
       return data;
     }}},
     setFrozenRows(n){assert.equal(n,1)}
   };
   backups.push(backup);
   return backup;
 }
};
const LockService={getScriptLock:()=>({
 tryLock(){if(held||denyLock)return false;held=true;obtained++;return true;},
 releaseLock(){assert.equal(held,true);held=false;released++;}
})};
const Utilities={
 DigestAlgorithm:{SHA_256:'SHA256'},
 Charset:{UTF_8:'UTF-8'},
 computeDigest(algorithm,input){
   assert.equal(algorithm,'SHA256');
   return Array.from(crypto.createHash('sha256').update(input,'utf8').digest());
 },
 base64EncodeWebSafe(bytes){return Buffer.from(bytes).toString('base64url')},
 formatDate(){return '261115_085958'},
 getUuid(){uuid++;return String(uuid).padStart(8,'0')+'-mock-uuid'}
};
const attendanceSchoolDayKey_=raw=>{
 if(raw instanceof Date)return raw.toISOString().slice(0,10);
 const v=String(raw??'').trim();
 if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return '';
 const parsed=new Date(v+'T12:00:00Z');
 return Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==v?'':v;
};
const ctx={schoolId:'school-one',ss};
const clear=new Function(
 'requireSchoolAdminWrite','assertSchoolWritable','resolveContext','LockService','getCollectionSheet',
 'attendanceSchoolDayKey_','sameClass','Utilities','Session','writeAudit',
 snippet+'return clearStudentAttendanceDate_;'
)(
 ()=>({id:'admin',role:'schoolAdmin'}),()=>{},()=>ctx,LockService,
 (_ctx,name)=>{assert.equal(name,'attendance');return {sheet,headers:columns};},
 attendanceSchoolDayKey_,(a,b)=>String(a).trim().toLowerCase().replace(/^class\s*/,'')===String(b).trim().toLowerCase().replace(/^class\s*/,''),
 Utilities,{getScriptTimeZone:()=> 'Asia/Karachi'},
 (...args)=>{assert.ok(held);audits.push(args)}
);
const args={schoolId:'school-one',date:'2026-11-15',className:'4'};
const preview=clear({...args,previewOnly:true});
assert.equal(preview.count,3);
assert.ok(preview.previewToken);
assert.equal(rows.length,5);
assert.throws(()=>clear({...args,confirmText:'REMOVE 2026-11-15'}),/changed since preview/i);
assert.equal(rows.length,5);
rows[2][5]='Leave';
assert.throws(()=>clear({...args,confirmText:'REMOVE 2026-11-15',previewToken:preview.previewToken,expectedCount:3}),/changed since preview/i);
assert.equal(rows.length,5,'Stale preview never deletes a changed row');
rows[2][5]='Absent';
tamperBackup=true;
assert.throws(()=>clear({...args,confirmText:'REMOVE 2026-11-15',previewToken:preview.previewToken,expectedCount:3}),/Backup verification failed/i);
assert.equal(rows.length,5,'Failed archive verification cannot delete');
tamperBackup=false;
assert.throws(()=>clear({...args,confirmText:'REMOVE 2026-11-15',previewToken:preview.previewToken,expectedCount:2}),/count changed/i);
assert.equal(rows.length,5);
denyLock=true;
assert.throws(()=>clear({...args,previewOnly:true}),/busy/i);
denyLock=false;
const result=clear({...args,confirmText:'REMOVE 2026-11-15',previewToken:preview.previewToken,expectedCount:3});
assert.equal(result.count,3);
assert.ok(result.backupSheet);
assert.equal(result.previewToken,preview.previewToken);
assert.equal(rows.length,2,'Only target date/class rows removed');
assert.deepEqual(rows[1],records[3],'Unrelated next-day class record survives');
const archived=backups.at(-1);
assert.deepEqual(archived.rows.slice(1),records.slice(0,3),'Backup contains every original attendance row, including duplicates');
assert.equal(audits.length,2,'Preparation and completion are both recorded in audit');
assert.equal(held,false,'Script lock released');
assert.equal(obtained,released,'No leaked locks after exceptions');
console.log('PASS: preview token blocks stale deletion, verified backup precedes row removal, dates/classes isolated, all original duplicates preserved.');
