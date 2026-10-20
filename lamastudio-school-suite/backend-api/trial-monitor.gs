/** LamaStudio Trial Monitor — additive module. Keep in SAME Apps Script project as Code.gs.
 * Tracking only: expiration does NOT block logins or writes.
 * Existing school plans are untouched. New registrations get Trial for 14 days.
 */
const LAMA_TRIAL_DAYS = 14;
const LAMA_TRIAL_HEADERS = ['trialStartedAt','trialEndsAt','lastLoginAt','loginCount'];
function lamaTrialHeaders_(sheet) {
  ensureSheetHeaders(sheet, LAMA_TRIAL_HEADERS);
  return sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
}
function lamaTrialWrite_(schoolId, patch) {
  const sh = getRegistrySheet();
  const headers = lamaTrialHeaders_(sh);
  const match = findSchoolRow(sh, r => String(r.schoolId) === String(schoolId));
  if (!match) throw new Error('School not found');
  Object.keys(patch).forEach(k => {
    const col = headers.indexOf(k);
    if (col < 0 || ['schoolId','apiKey','sheetId','passwordHash'].indexOf(k) !== -1) throw new Error('Invalid field');
    sh.getRange(match.rowIndex,col+1).setValue(patch[k]);
  });
}
function registerTrialSchool(params) {
  // Register first using existing backend (preserves existing school creation logic).
  const school = registerSchool(params);
  const start = new Date();
  const end = new Date(start.getTime() + LAMA_TRIAL_DAYS*86400000);
  lamaTrialWrite_(school.schoolId, {
    plan:'Trial', trialStartedAt:start.toISOString(), trialEndsAt:end.toISOString(),
    lastLoginAt:'', loginCount:0
  });
  return school;
}
function loginSchoolTracked(email,password) {
  const school = loginSchool(email,password);
  // Successful login should not fail if optional tracking has a transient error.
  try {
    const sh = getRegistrySheet();
    const headers = lamaTrialHeaders_(sh);
    const match = findSchoolRow(sh,r => String(r.schoolId) === String(school.schoolId));
    if (match) {
      const oldCount = Number(match.obj.loginCount) || 0;
      sh.getRange(match.rowIndex,headers.indexOf('lastLoginAt')+1).setValue(new Date().toISOString());
      sh.getRange(match.rowIndex,headers.indexOf('loginCount')+1).setValue(oldCount+1);
    }
  } catch(err) { console.warn('Trial login tracking:',err.message); }
  return school;
}
function adminTrialReport(adminApiKey) {
  authorizeAdmin(adminApiKey);
  const sh = getRegistrySheet();
  const headers = lamaTrialHeaders_(sh);
  const values = sh.getDataRange().getValues();
  const now = Date.now();
  const schools = [];
  for (let i=1;i<values.length;i++) {
    const r = rowToRecord(headers,values[i]);
    if (!r.schoolId) continue;
    const trial = String(r.plan).toLowerCase() === 'trial';
    const expiry = r.trialEndsAt ? new Date(r.trialEndsAt).getTime() : NaN;
    const expired = trial && Number.isFinite(expiry) && expiry < now;
    schools.push({schoolId:r.schoolId,name:r.name,adminEmail:r.adminEmail,
      plan:r.plan,status:r.status,createdAt:r.createdAt,
      trialStartedAt:r.trialStartedAt||'',trialEndsAt:r.trialEndsAt||'',
      trialExpired:expired,lastLoginAt:r.lastLoginAt||'',loginCount:Number(r.loginCount)||0});
  }
  return {total:schools.length,trial:schools.filter(s=>s.plan==='Trial').length,
    expired:schools.filter(s=>s.trialExpired).length,
    schools:schools};
}
function adminSetPlan(adminApiKey,schoolId,plan) {
  authorizeAdmin(adminApiKey);
  if (['Trial','Free','Active','Paid'].indexOf(plan) < 0) throw new Error('Invalid plan');
  lamaTrialWrite_(schoolId,{plan:plan});
  return {schoolId:schoolId,plan:plan};
}
