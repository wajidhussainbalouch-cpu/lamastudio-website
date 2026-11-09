/* Run: node lamastudio-school-suite/backend-api/test-school-pwa-approvals.cjs
 * Mocked Apps Script only. Never touches production registry or Drive.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function sheet(){
 return {rows:[],appendRow(row){this.rows.push(row.slice());},getLastRow(){return this.rows.length;},
  getRange(a,b,n,m){return{
   getValues:()=>Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>this.rows[a+i-1]?.[b+j-1]??'')),
   setValues:values=>values.forEach((row,i)=>row.forEach((v,j)=>{
    if(!this.rows[a+i-1])this.rows[a+i-1]=[];
    this.rows[a+i-1][b+j-1]=v;
   }))};}};
}
const worksheets={},schools=[
 {schoolId:'sch_alpha',status:'Active',name:'Alpha School',logo:'data:image/jpeg;base64,AA==',adminEmail:'private@example.invalid',apiKey:'hidden'},
 {schoolId:'sch_beta',status:'Active',name:'Beta School',logo:'data:image/jpeg;base64,AA=='}
];
const ss={getSheetByName:name=>worksheets[name]||null,insertSheet:name=>(worksheets[name]=sheet())};
const sandbox={
 SpreadsheetApp:{openById:()=>ss,flush(){}},
 PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'master'})},
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},
 Utilities:{getUuid:()=> 'mock-id'},
 getRegistrySheet:()=>({}),
 findSchoolRow:(_,predicate)=>{const obj=schools.find(predicate);return obj?{obj}:null;},
 authorizeAdmin:key=>{if(key!=='valid-admin')throw Error('Unauthorized super admin');},
 authorizeSchool:(schoolId,key)=>{
  const obj=schools.find(s=>s.schoolId===schoolId);
  if(!obj||key!=='valid-school')throw Error('Unauthorized school');
  return {obj};
 }
};
const script=fs.readFileSync(path.join(__dirname,'school-pwa-approvals.gs'),'utf8');
vm.runInNewContext(script,sandbox,{filename:'school-pwa-approvals.gs'});
const denied=fn=>assert.throws(fn);
assert.equal(sandbox.lamaPwaGrant_('sch_alpha').enabled,false);
denied(()=>sandbox.lamaPublicSchoolPwa_('sch_alpha'));
denied(()=>sandbox.lamaAdminSetSchoolPwaAccess_('wrong','sch_alpha',true));
denied(()=>sandbox.lamaAdminSetSchoolPwaAccess_('valid-admin','sch_alpha','true'));
sandbox.lamaAdminSetSchoolPwaAccess_('valid-admin','sch_alpha',true);
assert.equal(sandbox.lamaPwaGrant_('sch_alpha').enabled,true);
const identity=sandbox.lamaPublicSchoolPwa_('sch_alpha');
assert.equal(identity.name,'Alpha School');
assert.equal(identity.adminEmail,undefined);
assert.equal(identity.apiKey,undefined);
denied(()=>sandbox.lamaPublicSchoolPwa_('sch_beta'));
assert.equal(sandbox.lamaSchoolPwaStatus_('sch_alpha','valid-school').enabled,true);
denied(()=>sandbox.lamaSchoolPwaStatus_('sch_alpha','wrong'));
sandbox.lamaAdminSetSchoolPwaAccess_('valid-admin','sch_alpha',false);
denied(()=>sandbox.lamaPublicSchoolPwa_('sch_alpha'));
assert.equal(worksheets.SchoolPwaApprovalAudit.rows.length,3);
console.log('School PWA approval mock checks passed. No live writes performed.');
