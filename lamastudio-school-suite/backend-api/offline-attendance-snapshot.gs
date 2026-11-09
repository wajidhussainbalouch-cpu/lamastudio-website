/**
 * Read-only, minimal, role-scoped initial offline attendance snapshot.
 * Add alongside the EXISTING master code.gs. No new deployment or registry.
 * Teacher authorization/class scoping uses existing resolveContext/listRecords.
 */
function lamaOfflineAttendanceSnapshot_(params){
  params=params||{};
  var role=String(params.role||'school');
  if(role==='school')requireSchoolAdminWrite(params);
  else if(role!=='teacher')throw new Error('Only a verified school admin or teacher may prepare offline attendance');
  var ctx=resolveContext(params);
  if(ctx.role!==role)throw new Error('Role mismatch');
  var requested=params.dates==null?[]:params.dates;
  if(!Array.isArray(requested)||requested.length>90)throw new Error('Invalid offline date selection');
  function validDay(s){
    if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
    var d=new Date(s+'T12:00:00Z');
    return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;
  }
  if(requested.some(function(s){return !validDay(s);}))throw new Error('Invalid requested offline date');
  var extra=new Set(requested);
  var tz=Session.getScriptTimeZone()||'Asia/Karachi';
  var since=Utilities.formatDate(new Date(Date.now()-31*86400000),tz,'yyyy-MM-dd');
  function dayOf(value){
    if(value instanceof Date)return Utilities.formatDate(value,tz,'yyyy-MM-dd');
    var s=String(value==null?'':value);
    return /^\d{4}-\d{2}-\d{2}/.test(s)?s.slice(0,10):'';
  }
  var students=listRecords(ctx,'students').map(function(r){
    return {id:String(r.id||'').trim(),name:String(r.name||'').slice(0,120),
      enrlNo:String(r.enrlNo||'').trim(),class:String(r.class||'').trim(),section:String(r.section||'').trim()};
  });
  if(!students.length||students.length>5000)throw new Error('Offline roster must contain between 1 and 5000 students');
  var ids=new Set();
  students.forEach(function(s){
    if(!s.id||ids.has(s.id))throw new Error('Student ID missing or duplicated; repair before offline preparation');
    ids.add(s.id);
  });
  var rows=listRecords(ctx,'attendance');
  var attendance=[];
  rows.forEach(function(r){
    var date=dayOf(r.date);
    if(!date||(date<since&&!extra.has(date)))return;
    var status=String(r.status||'').trim().toLowerCase();
    var normalized=status==='present'||status==='p'?'Present':
      status==='absent'||status==='a'?'Absent':
      status==='leave'||status==='l'?'Leave':'';
    if(!normalized)return;
    attendance.push({studentId:String(r.studentId||'').trim(),enrlNo:String(r.enrlNo||'').trim(),date:date,status:normalized});
    if(attendance.length>75000)throw new Error('Offline history too large; reduce school roster or date range');
  });
  return {schoolId:ctx.schoolId,role:ctx.role,students:students,attendance:attendance,
    historySince:since,preparedAt:new Date().toISOString()};
}
