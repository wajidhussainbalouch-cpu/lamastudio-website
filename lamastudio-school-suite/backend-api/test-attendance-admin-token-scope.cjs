'use strict';
/**
 * School administrator auth regression for new daily staff attendance endpoints.
 * Checks the real handleRequest authorization preamble rather than a mocked
 * parallel implementation. No database or network calls.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'code.gs'),'utf8');
const start=source.indexOf("const teacherScoped = action === 'teacherAttendanceDailySnapshot'");
const end=source.indexOf("        if (action === 'syllabusSchoolProgress')",start);
assert.ok(start>0&&end>start,'School scoped authorization preamble unavailable');
const preamble=source.slice(start,end);
const actions=['teacherAttendanceDailySnapshot','bulkTeacherAttendanceVerified','attendanceDateSnapshot'];
const legacyActions=['list','get','add','update','remove','delete'];
for(const action of actions){
  assert.match(preamble,new RegExp("action === '"+action+"'"),
    'Admin token resolution missing for '+action);
}
assert.match(preamble,/'bulkTeacherAttendanceVerified'/,
  'New verified batch must be a protected write');
assert.match(preamble,/\['teachers','teacherAttendance'\]\.indexOf\(params\.collection\)/,'Legacy teacherAttendance actions must resolve admin tokens');
function authorizeAction(action,params={}){
 let resolved=0,validated=0;
 const verifySchoolAdminToken=(req)=>{
   validated++;
   if(req.schoolId!=='school-1'||req.token!=='test-valid-admin-token')
     throw Error('School Admin session invalid');
 };
 const findSchoolRow=(_registry,cb)=>{
   const row={schoolId:'school-1',status:'Active',apiKey:'school-key'};
   return cb(row)?{obj:row}:null;
 };
 const getRegistrySheet=()=>({});
 const requireSchoolAdminWrite=(req)=>{
   if(req.role!=='school'||req.apiKey!=='school-key')
     throw Error('School write authorization required');
   if(!req.token||req.token!=='test-valid-admin-token')
     throw Error('Verified School Admin token required');
   return {id:'admin-1'};
 };
 const runner=new Function('action','params','verifySchoolAdminToken',
   'findSchoolRow','getRegistrySheet','requireSchoolAdminWrite',
   preamble+'return {apiKey:params.apiKey,actor:params._auditActor,scoped:teacherScoped};');
 const result=runner(action,{role:'school',schoolId:'school-1',
   token:'test-valid-admin-token',...params},
   verifySchoolAdminToken,findSchoolRow,getRegistrySheet,requireSchoolAdminWrite);
 return {result,validated};
}
for(const action of actions){
 const {result,validated}=authorizeAction(action);
 assert.equal(result.scoped,true,action+' not school scoped');
 assert.equal(result.apiKey,'school-key',action+' failed to resolve admin API key server-side');
 assert.equal(validated,1,action+' did not verify school token');
 if(action==='bulkTeacherAttendanceVerified')
   assert.equal(result.actor.id,'admin-1','Write must be audited as School Admin');
 else
   assert.equal(result.actor,undefined,'Read must not be marked as a write');
}

for(const action of legacyActions){
 const {result,validated}=authorizeAction(action,{collection:'teacherAttendance'});
 assert.equal(result.scoped,true,'Legacy teacherAttendance '+action+' is not school scoped');
 assert.equal(result.apiKey,'school-key','Legacy action '+action+' failed admin key resolution');
 assert.equal(validated,1,'Legacy '+action+' did not verify admin token');
 if(['add','update','remove','delete'].includes(action))
  assert.equal(result.actor?.id,'admin-1','Legacy teacherAttendance '+action+' must audit admin write');
}
assert.throws(()=>authorizeAction('bulkTeacherAttendanceVerified',
  {token:'invalid-token'}),/invalid/,'Invalid admin token must fail');
assert.throws(()=>authorizeAction('bulkTeacherAttendanceVerified',
  {schoolId:'other-school'}),/invalid/,'Cross-school token must fail');
console.log('PASS: school administrator token-only sessions can read and batch-save teacher attendance; writes audited, invalid and cross-school tokens rejected.');
