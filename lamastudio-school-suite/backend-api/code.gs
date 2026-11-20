/**
 * ============================================================================
 * LamaStudio School Suite — Multi-Tenant, Multi-Role Backend (Google Apps Script)
 * ============================================================================
 * ONE deployment of this script serves EVERY school on lamastudio.pk, across
 * FOUR roles:
 *   - Super Admin (you)   — sees every school, blocks/unblocks accounts,
 *                           resets a school's password.
 *   - School Admin        — the school's own login (unchanged from before).
 *   - Teacher             — created by the School Admin, scoped to one class.
 *   - Student             — logs in with enrollment no. + password, read-only,
 *                           sees only their own record and their own class.
 *
 * Each school still owns one private Google Sheet (auto-created at
 * registration) holding Students / Teachers / Attendance / Homework / Fees /
 * DateSheet / Tests / Notifications. A single "Master Registry" spreadsheet
 * maps schoolId -> that school's Sheet + login credentials + active/blocked
 * status. No school can read or write another school's data.
 *
 * ----------------------------------------------------------------------------
 * ONE-TIME SETUP (do this once, in order):
 * ----------------------------------------------------------------------------
 * 1. For EXISTING installations, do NOT create a new project or run setup().
 * 2. In Project Settings > Script Properties, add SUPERADMIN_SETUP_PASSWORD
 *    with a NEW password (12+ characters).
 * 3. Select setupSuperAdmin from the editor function menu and click Run.
 *    This saves the hash and deletes the temporary setup password property.
 * 4. Run checkSuperAdminSetup to verify both settings are configured.
 * 5. For a first deployment only, click Deploy -> New deployment.
 *      Select type: Web app
 *      Execute as: Me
 *      Who has access: Anyone
 *    Click Deploy, authorize again if asked.
 * 6. Copy the "Web app URL" (it ends in /exec). Paste it into api-client.js
 *    as the API_URL constant — that's the only thing that file needs from you.
 *
 * ----------------------------------------------------------------------------
 * WHEN YOU EDIT THIS CODE LATER:
 * ----------------------------------------------------------------------------
 * Deploy -> Manage deployments -> click the pencil (edit) icon on your
 * existing deployment -> Version: "New version" -> Deploy.
 * This keeps the SAME URL working (don't create a brand-new deployment,
 * or every page's api-client.js would need updating with a new URL).
 * ============================================================================
 */

const REGISTRY_SHEET_NAME = 'Schools';
const REGISTRY_HEADERS = [
    'schoolId', 'name', 'address', 'phone', 'principal', 'type', 'level', 'adminEmail',
    'passwordHash', 'apiKey', 'sheetId', 'logo', 'coverPhoto', 'shortCode', 'plan', 'status', 'createdAt', 'subscriptionType', 'subscriptionStart', 'subscriptionEnd', 'subscriptionPrice', 'subscriptionPaidAt', 'subscriptionReference', 'subscriptionNotes', 'privateSub', 'feeOptional', 'offeredClassesJson', 'feeCategoriesJson'
];
// Super Admin password is initialized securely through Script Properties.
// Never place a plaintext password in this source file.

// Every collection listed here automatically gets full CRUD via the generic
// list/get/add/update/remove functions further down. Field names ending in
// "Json" are stored as JSON text in one cell and parsed back transparently.
const COLLECTIONS = {
    students: {
        tab: 'Students',
        headers: ['id', 'studentCode', 'enrlNo', 'name', 'gender', 'dob', 'fatherGuardian', 'contact', 'whatsapp', 'class', 'section',
                  'subjectsJson', 'position', 'photo', 'behavioralJson', 'attendance',
                  'teacherRemarks', 'principalRemarks', 'remarks', 'password', 'apiKey', 'createdAt',
                  'cnic', 'religion', 'category', 'fatherCnic', 'caste', 'profession', 'monthlyIncome',
                  'admissionNo', 'academicSession', 'admissionTestMarks', 'interviewMarks', 'admissionRemarks', 'address',
                  'admissionDate', 'schoolAdmissionNo', 'emergencyCampaign',
                  'guardianName', 'guardianCnic', 'guardianCell', 'guardianRelation', 'guardianProfession',
                  'guardianAddress', 'distanceFromSchool', 'canWrite', 'canRead', 'canCount']
    },
    teachers: {
        tab: 'Teachers',
        headers: ['id', 'name', 'email', 'loginId', 'passwordHash', 'apiKey', 'subject', 'assignedClass', 'assignedSection',
                  'contact', 'status', 'createdAt',
                  'cnic', 'dob', 'gender', 'qualification', 'joiningDate', 'address', 'emergencyContact', 'experience', 'photo', 'medicalNotes', 'designation']
    },
    activities: {
        tab: 'Activities',
        headers: ['id', 'type', 'title', 'description', 'date', 'photo', 'createdAt']
    },
    teacherAttendance: {
        tab: 'TeacherAttendance',
        headers: ['id', 'teacherId', 'teacherName', 'date', 'status', 'markedBy', 'createdAt', 'remarks', 'leaveType']
    },
    nonTeachingStaff: {
        tab: 'NonTeachingStaff',
        headers: ['id','name','loginId','passwordHash','apiKey','designation','contact','joiningDate','status','createdAt']
    },
    staffAttendancePolicy: {
        tab: 'StaffAttendancePolicy',
        headers: ['id','policyJson','createdAt']
    },
    studentRequests: {
        tab: 'StudentRequests',
        headers: ['id','studentId','studentName','enrlNo','class','section','requestType','subject','message','leaveFrom','leaveTo','status','teacherReply','adminReply','assignedTeacherId','createdAt','updatedAt','reviewedBy']
    },
    teacherPings: {
        tab: 'TeacherPings',
        headers: ['id', 'teacherId', 'message', 'acknowledged', 'createdAt']
    },
    attendance: {
        tab: 'Attendance',
        headers: ['id', 'studentId', 'studentName', 'class', 'date', 'status', 'markedBy', 'createdAt', 'enrlNo', 'section']
    },
    homeworkCompletion: {
        tab: 'HomeworkCompletion',
        headers: ['id','studentId','homeworkId','completed','updatedAt']
    },
    homework: {
        tab: 'Homework',
        headers: ['id', 'class', 'subject', 'title', 'description', 'dueDate', 'assignedBy', 'createdAt', 'section', 'teacherId', 'batchId', 'batchHash']
    },
    fees: {
        tab: 'Fees',
        headers: ['id', 'studentId', 'studentName', 'class', 'amount', 'date', 'status', 'method', 'createdAt', 'receivedByAdminId', 'receivedByAdminName']
    },
    datesheet: {
        tab: 'DateSheet',
        headers: ['id', 'examTitle', 'class', 'subject', 'date', 'time', 'invigilator', 'createdAt', 'day', 'subjectsJson', 'isPublished', 'published', 'status', 'schoolId']
    },
    tests: {
        tab: 'Tests',
        headers: ['id', 'class', 'subject', 'type', 'date', 'totalMarks', 'topics', 'createdAt', 'isPublished', 'published', 'status', 'updatedAt', 'link', 'title', 'schoolId']
    },
    notifications: {
        tab: 'Notifications',
        headers: ['id', 'title', 'audience', 'channel', 'message', 'status', 'isPublished', 'createdAt', 'studentId', 'date', 'notificationType']
    },
    resources: {
        tab: 'Resources',
        headers: ['id', 'category', 'title', 'description', 'link', 'createdAt']
    }
};

// ============================================================================
// ONE-TIME SETUP
// ============================================================================

function setup() {
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty('MASTER_SHEET_ID')) {
        Logger.log('Existing Master Registry preserved.');
        // The editor has repeatedly run setup() instead of setupSuperAdmin().
        // Initialize the missing login hash once, without changing school data.
        if (!props.getProperty('SUPERADMIN_PASSWORD_HASH')) {
            setupSuperAdmin();
        }
        Logger.log('Super Admin configured: ' +
            Boolean(props.getProperty('SUPERADMIN_PASSWORD_HASH')));
        return;
    }
    const folder = getSchoolDatabaseFolder_();
    const ss = SpreadsheetApp.create('LamaStudio Master Registry');
    try {
        const sheet = ss.getActiveSheet();
        sheet.setName(REGISTRY_SHEET_NAME);
        sheet.appendRow(REGISTRY_HEADERS);
        DriveApp.getFileById(ss.getId()).moveTo(folder);
    } catch (e) {
        throw new Error('Master Registry could not be moved into School Databases. Check Drive permissions and move the newly created spreadsheet out of My Drive manually. Registry ID was not changed. '+e.message);
    }
    props.setProperty('MASTER_SHEET_ID', ss.getId());
    if (!props.getProperty('SUPERADMIN_PASSWORD_HASH')) setupSuperAdmin();
    Logger.log('Setup complete. Master Registry: ' + ss.getUrl());
}

/**
 * First-time initialization or intentional password reset.
 * Run setupSuperAdmin() once from the editor after setting the temporary
 * SUPERADMIN_SETUP_PASSWORD property. Existing hashes are preserved.
 * Existing Master Registry and school data are NOT modified.
 */
function setupSuperAdmin() {
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty('SUPERADMIN_PASSWORD_HASH')) {
        Logger.log('Super Admin already configured. Existing credentials preserved.');
        return;
    }
    const password = props.getProperty('SUPERADMIN_SETUP_PASSWORD');
    if (!password || password.length < 12) {
        throw new Error('Set SUPERADMIN_SETUP_PASSWORD (12+ characters) in Script Properties first.');
    }
    props.setProperty('SUPERADMIN_PASSWORD_HASH', hashPassword(password, 'SUPERADMIN'));
    props.deleteProperty('SUPERADMIN_SETUP_PASSWORD');
    Logger.log('Super Admin initialized successfully.');
}

/** Safe diagnostic: run from Apps Script editor to verify configuration. */
function checkSuperAdminSetup() {
    const props = PropertiesService.getScriptProperties();
    Logger.log('Master Registry configured: ' + Boolean(props.getProperty('MASTER_SHEET_ID')));
    Logger.log('Super Admin password configured: ' + Boolean(props.getProperty('SUPERADMIN_PASSWORD_HASH')));
    Logger.log('Do not share passwords, hashes, or API keys.');
}

function getRegistrySheet() {
    const props = PropertiesService.getScriptProperties();
    let id = props.getProperty('MASTER_SHEET_ID');
    if (!id) {
        throw new Error('MASTER_SHEET_ID is not configured in this Apps Script deployment. Restore the existing Master Registry spreadsheet ID in Script Properties; do not run setup() or create a replacement registry.');
    }
    const sheet = SpreadsheetApp.openById(id).getSheetByName(REGISTRY_SHEET_NAME);
    ensureSheetHeaders(sheet, REGISTRY_HEADERS);
    return sheet;
}

/** Self-heal: adds any header a sheet is missing, appended at the end. Never reorders
 *  or removes existing columns, so already-registered schools never lose data —
 *  their old rows just show blank cells under the newly added header names. */
function ensureSheetHeaders(sheet, requiredHeaders) {
    const lastCol = sheet.getLastColumn();
    const existing = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    const missing = requiredHeaders.filter(h => existing.indexOf(h) === -1);
    if (missing.length > 0) {
        sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]);
    }
}

// ============================================================================
// SMALL HELPERS
// ============================================================================

function genId(prefix) {
    return prefix + '_' + Utilities.getUuid().split('-')[0] + Date.now().toString(36);
}

function slugify(str) {
    return String(str || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'school';
}

function deriveShortCode(name) {
    return String(name || 'SCH').split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 3) || 'SCH';
}

/**
 * School administrator and teacher passwords are hashed.
 * This is a lightweight hash (SHA-256, salted) suitable for a small free
 * tool — it is NOT the same bar as a bank or hospital system. Student
 * portal passwords are currently stored as plain text (legacy behavior).
 * Migrate them to hashed passwords before treating this as production-grade security.
 */
function hashPassword(password, salt) {
    const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + '::' + salt);
    return raw.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
}

function randomPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let out = '';
    for (let i = 0; i < 10; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return out;
}

/** Scans the registry sheet and returns the first row matching `matcherFn`. */
function findSchoolRow(sheet, matcherFn) {
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
        const rowObj = {};
        headers.forEach((h, idx) => { rowObj[h] = data[i][idx]; });
        if (matcherFn(rowObj)) {
            return { rowIndex: i + 1, headers, obj: rowObj };
        }
    }
    return null;
}

// ============================================================================
// SCHOOL REGISTRATION, LOGIN & PROFILE  (role: 'school' — unchanged behavior)
// ============================================================================

/** Creates a brand-new private Google Sheet for a school, with all tabs pre-built. */
function getSchoolDatabaseFolder_() {
    // Set SCHOOL_DATABASE_FOLDER_ID in Script Properties to the ID of
    // LAMA STUDIO — MASTER / 02 — School Databases.
    // The existing folder ID is retained for backward compatibility.
    const folderId = PropertiesService.getScriptProperties().getProperty('SCHOOL_DATABASE_FOLDER_ID') || '1H9U1a1fbNewbpQMwr8AGbQ3xLC27Tq02';
    let folder;
    try { folder = DriveApp.getFolderById(folderId); }
    catch (e) { throw new Error('Cannot access School Databases folder. Verify SCHOOL_DATABASE_FOLDER_ID and Drive access. '+e.message); }
    if (folder.isTrashed()) throw new Error('School Databases folder is in Trash.');
    return folder;
}

function createSchoolSheet(schoolName) {
    const folder = getSchoolDatabaseFolder_();
    const ss = SpreadsheetApp.create(schoolName + ' - LamaStudio Data');
    const defaultSheet = ss.getSheets()[0];
    Object.keys(COLLECTIONS).forEach(key => {
        const cfg = COLLECTIONS[key];
        const sh = ss.insertSheet(cfg.tab);
        sh.appendRow(cfg.headers);
        sh.setFrozenRows(1);
    });
    ss.deleteSheet(defaultSheet);
    try { DriveApp.getFileById(ss.getId()).moveTo(folder); }
    catch (e) {
        throw new Error('School spreadsheet was created but could not be moved to School Databases. Registration was stopped; find the unregistered spreadsheet in My Drive and move it manually. '+e.message);
    }
    return ss.getId();
}

function registerSchool(p) {
    if (!p.name || !p.name.trim()) throw new Error('School name is required.');
    if (!p.adminEmail || !p.adminEmail.trim()) throw new Error('An admin email is required.');
    if (!p.password || p.password.length < 6) throw new Error('Password must be at least 6 characters.');

    const registry = getRegistrySheet();
    const existing = findSchoolRow(registry, r => String(r.adminEmail).toLowerCase() === String(p.adminEmail).toLowerCase());
    if (existing) throw new Error('An account with this email already exists. Please log in instead.');

    const schoolId = genId('sch');
    const sheetId = createSchoolSheet(p.name);
    const apiKey = Utilities.getUuid();
    const shortCode = deriveShortCode(p.name);
    const passwordHash = p.passwordHashOverride || hashPassword(p.password, schoolId);

    registry.appendRow([
        schoolId, p.name.trim(), p.address || '', p.phone || '', p.principal || '', p.type || 'Private',
        p.level || 'High', p.adminEmail.trim(), passwordHash, apiKey, sheetId,
        p.logo || '', p.coverPhoto || '', shortCode, 'Trial', 'Active', new Date().toISOString(), 'Trial', new Date().toISOString(), new Date(Date.now()+30*86400000).toISOString(), '', '', '', ''
    ]);

    return {
        schoolId, apiKey, name: p.name.trim(), address: p.address || '', phone: p.phone || '',
        principal: p.principal || '', type: p.type || 'Private', level: p.level || 'High',
        logo: p.logo || '', coverPhoto: '', shortCode
    };
}

function loginSchool(email, password) {
    if (!email || !password) throw new Error('Email and password are required.');
    const registry = getRegistrySheet();
    const match = findSchoolRow(registry, r => String(r.adminEmail).toLowerCase() === String(email).toLowerCase());
    if (!match) throw new Error('No account found with this email.');
    if (hashPassword(password, match.obj.schoolId) !== match.obj.passwordHash && hashPassword(password, String(match.obj.adminEmail).toLowerCase()) !== match.obj.passwordHash) throw new Error('Incorrect password.');
    if (match.obj.status !== 'Active') throw new Error('This account is blocked. Please contact LamaStudio support.');

    return {
        schoolId: match.obj.schoolId, apiKey: match.obj.apiKey, name: match.obj.name,
        address: match.obj.address, phone: match.obj.phone, principal: match.obj.principal,
        type: match.obj.type, level: match.obj.level, logo: match.obj.logo,
        coverPhoto: match.obj.coverPhoto || '', shortCode: match.obj.shortCode
    };
}

/** Every school-admin-authenticated call goes through here. */
function authorizeSchool(schoolId, apiKey) {
    if (!schoolId || !apiKey) throw new Error('Missing session — please log in again.');
    const registry = getRegistrySheet();
    const match = findSchoolRow(registry, r => r.schoolId === schoolId);
    if (!match || match.obj.apiKey !== apiKey) throw new Error('Invalid session. Please log in again.');
    if (match.obj.status !== 'Active') throw new Error('This account is blocked.');
    return match;
}

/** Lightweight, school-scoped class/section choices; never returns student personal data. */
function getSchoolClassOptions(schoolId,apiKey){
  const match=authorizeSchool(schoolId,apiKey);
  const cache=CacheService.getScriptCache();
  const key='school_classes_'+String(schoolId).replace(/[^a-zA-Z0-9_-]/g,'_');
  // Administrator-configured offerings take priority over inferred student classes.
  const configured=String(match.obj.offeredClassesJson||'').trim();
  if(configured){
    let offerings;
    try{offerings=JSON.parse(configured)}catch(_){throw Error('Invalid saved class configuration. Open School Settings and save it again.')}
    if(!Array.isArray(offerings))throw Error('Invalid saved class configuration.');
    return offerings.flatMap(item=>{
      const name=String(typeof item==='string'?item:(item&& (item.name||item.class||item.className))||'').trim();
      const sections=item&&typeof item==='object'&&Array.isArray(item.sections)?item.sections:[];
      return name?(sections.length?sections.map(section=>({class:name,section:String(section||'').trim()})):[{class:name,section:''}]):[];
    });
  }
  const saved=cache.get(key);
  if(saved){try{return JSON.parse(saved)}catch(_){}}
  const ss=SpreadsheetApp.openById(match.obj.sheetId);
  const sheet=ss.getSheetByName(COLLECTIONS.students.tab);
  if(!sheet||sheet.getLastRow()<2)return [];
  const heads=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0].map(v=>String(v).trim().toLowerCase().replace(/[\s_-]/g,''));
  const ci=heads.findIndex(v=>['class','classname','grade'].includes(v));
  const si=heads.findIndex(v=>['section','sectionname'].includes(v));
  if(ci<0)throw Error('Students sheet has no class column.');
  const n=sheet.getLastRow()-1;
  const classes=sheet.getRange(2,ci+1,n,1).getDisplayValues();
  const sections=si<0?null:sheet.getRange(2,si+1,n,1).getDisplayValues();
  const result=new Map();
  for(let i=0;i<n;i++){
    const name=String(classes[i][0]||'').trim();
    if(!name)continue;
    const section=sections?String(sections[i][0]||'').trim():'';
    const key=name.toLowerCase()+'|'+section.toLowerCase();
    if(!result.has(key))result.set(key,{class:name,section});
  }
  const rows=Array.from(result.values());
  try{cache.put(key,JSON.stringify(rows),300)}catch(_){}
  return rows;
}
/**
 * One authenticated school-scoped request for teacher management.
 * Returns the school identity, saved class choices and existing teacher records
 * together so the UI cannot mix sessions from independent API requests.
 * Does not create, migrate, update or delete any records.
 */
function getTeacherManagementBootstrap_(params) {
    const schoolId = String(params.schoolId || '').trim();
    const apiKey = String(params.apiKey || '').trim();
    // Authorize once before reading any school-scoped information.
    const match = authorizeSchool(schoolId, apiKey);
    const warnings = [];
    // The registry already contains the school's identity. If the full
    // profile fails, teacher management must still show the correct school.
    let school = {schoolId:schoolId, name:match.obj.name || 'School', shortCode:match.obj.shortCode || '', logo:match.obj.logo || '', offeredClassesJson:match.obj.offeredClassesJson || ''};
    try {
        school = Object.assign({}, school, getSchoolConfig(schoolId, apiKey));
    } catch (err) {
        warnings.push('School profile: ' + err.message);
    }
    let classes = [];
    try {
        classes = getSchoolClassOptions(schoolId, apiKey);
    } catch (err) {
        warnings.push('School classes: ' + err.message);
    }
    let teachers = [];
    try {
        const ctx = {role:'school', schoolId:schoolId, ss:SpreadsheetApp.openById(match.obj.sheetId)};
        teachers = listRecords(ctx, 'teachers').map(function(t){ var safe=Object.assign({},t); delete safe.passwordHash; delete safe.apiKey; delete safe.password; delete safe.salt; return safe; });
    } catch (err) {
        warnings.push('Teacher records: ' + err.message);
    }
    return {status:'success', school:school, classes:classes, records:teachers, teacherCount:teachers.length, warnings:warnings, diagnostics:{schoolResolved:true,classesLoaded:!warnings.some(function(w){return w.indexOf('School classes:')===0;}),teachersLoaded:!warnings.some(function(w){return w.indexOf('Teacher records:')===0;})}};
}

function getSchoolConfig(schoolId, apiKey) {
    const o = authorizeSchool(schoolId, apiKey).obj;
    return {
        schoolId: o.schoolId, name: o.name, address: o.address, phone: o.phone, principal: o.principal,
        type: o.type, level: o.level, logo: o.logo, coverPhoto: o.coverPhoto || '', shortCode: o.shortCode,
        privateSub: o.privateSub || '', offeredClassesJson:o.offeredClassesJson||'', feeCategoriesJson:o.feeCategoriesJson||'', feeOptional: o.feeOptional === true || String(o.feeOptional).toLowerCase() === 'true'
    };
}

function updateSchoolConfig(schoolId, apiKey, patch) {
    const lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw Error('School settings are busy. Retry.');
    try{
    assertSchoolWritable(schoolId);
    const match = authorizeSchool(schoolId, apiKey);
    const registry = getRegistrySheet();
    // Only school profile fields may be changed; never accept registry/security fields.
    const allowed = ['name', 'address', 'phone', 'principal', 'type', 'level', 'logo', 'coverPhoto', 'shortCode', 'privateSub', 'feeOptional', 'offeredClassesJson', 'feeCategoriesJson'];
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new Error('Invalid school profile update.');
    const invalid = Object.keys(patch).filter(k => allowed.indexOf(k) === -1);
    if (invalid.length) throw new Error('Protected school settings cannot be changed: ' + invalid.join(', '));
    if (Object.prototype.hasOwnProperty.call(patch, 'privateSub') &&
        patch.privateSub !== null && typeof patch.privateSub !== 'string') {
        throw new Error('Invalid private school sub-category.');
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'feeOptional') &&
        typeof patch.feeOptional !== 'boolean') {
        throw new Error('Invalid fee optional setting.');
    }
    if(Object.prototype.hasOwnProperty.call(patch,'offeredClassesJson')){
      if(typeof patch.offeredClassesJson!=='string'||patch.offeredClassesJson.length>12000)throw Error('Invalid class settings.');
      let entries;try{entries=JSON.parse(patch.offeredClassesJson)}catch(_){throw Error('Invalid class settings JSON.')}
      if(!Array.isArray(entries)||entries.length>60)throw Error('Select up to 60 classes.');
      const seen=new Set();
      entries.forEach(item=>{
        if(!item||typeof item.name!=='string'||!item.name.trim()||item.name.length>80||!Array.isArray(item.sections)||item.sections.length>30)throw Error('Invalid class or section.');
        const key=item.name.trim().toLowerCase();if(seen.has(key))throw Error('Duplicate class: '+item.name);seen.add(key);
        if(item.sections.some(v=>typeof v!=='string'||v.length>60))throw Error('Invalid section.');
      });
    }
    if(Object.prototype.hasOwnProperty.call(patch,'feeCategoriesJson')){
      if(typeof patch.feeCategoriesJson!=='string'||patch.feeCategoriesJson.length>12000)throw Error('Invalid fee settings.');
      let entries;try{entries=JSON.parse(patch.feeCategoriesJson)}catch(_){throw Error('Invalid fee settings JSON.')}
      if(!Array.isArray(entries)||entries.length>60)throw Error('Select up to 60 fee types.');
      const seen=new Set();
      entries.forEach(item=>{
        if(!item||typeof item.name!=='string'||!item.name.trim()||item.name.length>80||typeof item.enabled!=='boolean')throw Error('Invalid fee type.');
        const key=item.name.trim().toLowerCase();if(seen.has(key))throw Error('Duplicate fee type: '+item.name);seen.add(key);
      });
    }
    const updated = Object.assign({}, match.obj, patch);
    if (updated.privateSub == null) updated.privateSub = '';
    ensureSheetHeaders(registry, REGISTRY_HEADERS);
    const latestHeaders = registry.getRange(1, 1, 1, registry.getLastColumn()).getValues()[0];
    const newRow = latestHeaders.map(h => updated[h] !== undefined ? updated[h] : '');
    registry.getRange(match.rowIndex, 1, 1, latestHeaders.length).setValues([newRow]);
    return getSchoolConfig(schoolId, apiKey);
    }finally{lock.releaseLock();}
}

// ============================================================================
// SUPER ADMIN  (role: 'admin')
// ============================================================================

function adminLogin(password) {
    const props = PropertiesService.getScriptProperties();
    const storedHash = props.getProperty('SUPERADMIN_PASSWORD_HASH');
    if (!storedHash) throw new Error('Super admin password not set up yet. Run setupSuperAdmin() in the Apps Script editor first.');
    if (hashPassword(password, 'SUPERADMIN') !== storedHash) throw new Error('Incorrect password.');
    return { adminApiKey: storedHash };
}

function authorizeAdmin(adminApiKey) {
    const props = PropertiesService.getScriptProperties();
    const storedHash = props.getProperty('SUPERADMIN_PASSWORD_HASH');
    if (!storedHash || !adminApiKey || adminApiKey !== storedHash) throw new Error('Invalid admin session. Please log in again.');
}

/** Counts non-empty data rows in a tab, given an already-open Spreadsheet. */
function countRows(ss, tabName) {
    try {
        const sh = ss.getSheetByName(tabName);
        if (!sh) return 0;
        const data = sh.getDataRange().getValues();
        let count = 0;
        for (let i = 1; i < data.length; i++) { if (data[i][0]) count++; }
        return count;
    } catch (e) {
        return 0;
    }
}

/** Aggregate view across every registered school. Slower on many schools — fine at small/medium scale. */
function adminListSchools(adminApiKey) {
    authorizeAdmin(adminApiKey);
    const registry = getRegistrySheet();
    const data = registry.getDataRange().getValues();
    const headers = data[0];
    const out = [];
    for (let i = 1; i < data.length; i++) {
        if (!data[i][0]) continue;
        const row = {};
        headers.forEach((h, idx) => { row[h] = data[i][idx]; });
        let studentCount = 0, teacherCount = 0;
        try {
            const ss = SpreadsheetApp.openById(row.sheetId);
            studentCount = countRows(ss, COLLECTIONS.students.tab);
            teacherCount = countRows(ss, COLLECTIONS.teachers.tab);
        } catch (e) { /* sheet may have been deleted manually — leave counts at 0 */ }
        out.push({
            schoolId: row.schoolId, name: row.name, adminEmail: row.adminEmail, phone: row.phone,
            type: row.type, level: row.level, status: row.status, plan: row.plan,
            createdAt: row.createdAt, subscription: subscriptionView(row), studentCount, teacherCount
        });
    }
    return out;
}

/** Subscription: legacy rows stay Unclassified with unrestricted access until explicitly assigned. */
function subscriptionView(row) {
    const type = String(row.subscriptionType || '').trim();
    const end = String(row.subscriptionEnd || '').trim();
    const expiry = end ? Date.parse(end) : NaN;
    const expired = (type === 'Trial' || type === 'Paid') && Number.isFinite(expiry) && Date.now() >= expiry;
    return {type: type || 'Unclassified', start: String(row.subscriptionStart || ''), end,
        expired, readOnly: expired, price: row.subscriptionPrice || '',
        paidAt: row.subscriptionPaidAt || '', reference: row.subscriptionReference || '', notes: row.subscriptionNotes || ''};
}
function assertSchoolWritable(schoolId) {
    const match = findSchoolRow(getRegistrySheet(), r => String(r.schoolId) === String(schoolId));
    if (!match) throw new Error('School not found.');
    if (subscriptionView(match.obj).readOnly) throw new Error('Subscription expired. This school is read-only; records are preserved. Contact LamaStudio to renew.');
}
function adminSetSubscription(adminApiKey, schoolId, details) {
    authorizeAdmin(adminApiKey);
    const registry = getRegistrySheet();
    const match = findSchoolRow(registry, r => String(r.schoolId) === String(schoolId));
    if (!match) throw new Error('School not found.');
    const type = String(details.type || '');
    if (!['Trial','Paid','Free','Unclassified'].includes(type)) throw new Error('Invalid subscription type.');
    const start = String(details.start || '');
    const end = String(details.end || '');
    const dateOk = d => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d+'T00:00:00Z'));
    if ((type === 'Trial' || type === 'Paid') && (!dateOk(start) || !dateOk(end) || end < start)) throw new Error('Provide valid start and end dates.');
    if (start && !dateOk(start) || end && !dateOk(end)) throw new Error('Invalid date.');
    const values = {
      subscriptionType:type, subscriptionStart:(type==='Trial'||type==='Paid')?start:'',
      subscriptionEnd:(type==='Trial'||type==='Paid')?end+'T23:59:59.999Z':'',
      subscriptionPrice: String(details.price || ''), subscriptionPaidAt: String(details.paidAt || ''),
      subscriptionReference: String(details.reference || ''), subscriptionNotes: String(details.notes || ''),
      plan: type === 'Unclassified' ? (match.obj.plan || 'Free') : type
    };
    Object.keys(values).forEach(k => {const col=match.headers.indexOf(k)+1;if(col)registry.getRange(match.rowIndex,col).setValue(values[k]);});
    return {schoolId, subscription:subscriptionView(Object.assign({},match.obj,values))};
}
function getSubscriptionStatus(schoolId, apiKey) {
    const match=authorizeSchool(schoolId,apiKey);
    return subscriptionView(match.obj);
}

function adminSetStatus(adminApiKey, schoolId, status) {
    authorizeAdmin(adminApiKey);
    if (status !== 'Active' && status !== 'Blocked') throw new Error('Status must be Active or Blocked.');
    const registry = getRegistrySheet();
    const match = findSchoolRow(registry, r => r.schoolId === schoolId);
    if (!match) throw new Error('School not found.');
    const statusCol = match.headers.indexOf('status') + 1;
    registry.getRange(match.rowIndex, statusCol).setValue(status);
    return { schoolId, status };
}

/** Generates a brand-new password for a school's login and emails it to their registered admin email. */

// School-owner self-service recovery. No account enumeration or plaintext password email.

function requestAdministratorRecovery_(p){
  const email=String(p.email||'').trim().toLowerCase(),generic={message:'If the registered school email matches, recovery instructions will be sent.'};
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return generic;
  const match=findSchoolRow(getRegistrySheet(),r=>String(r.adminEmail||'').trim().toLowerCase()===email&&String(r.status)==='Active');
  if(!match)return generic;
  const cache=CacheService.getScriptCache(),rate='ADMIN_RECOVERY_RATE_'+match.obj.schoolId;
  if(cache.get(rate))return generic;
  cache.put(rate,'1',120);
  const u=adminUsers(match.obj.schoolId),active=u.items.filter(x=>x.obj.status==='Active');
  const props=PropertiesService.getScriptProperties(),links=[];
  for(const entry of active){
    const token=Utilities.getUuid()+Utilities.getUuid(),key='ADMIN_RECOVERY_'+match.obj.schoolId+'_'+entry.obj.id;
    props.setProperty(key,JSON.stringify({digest:hashPassword(token,'administrator-recovery'),expires:Date.now()+15*60*1000}));
    links.push(entry.obj.displayName+' ('+entry.obj.username+'):\nhttps://www.lamastudio.pk/lamastudio-school-suite/school-admin-login.html?adminRecovery='+encodeURIComponent(match.obj.schoolId)+'&account='+encodeURIComponent(entry.obj.id)+'&token='+encodeURIComponent(token));
  }
  try{
    MailApp.sendEmail({to:email,subject:'LAMA School Suite - administrator account recovery',body:'An administrator recovery request was received for '+match.obj.name+'.\n\nActive administrator usernames and individual password-reset links (valid for 15 minutes):\n\n'+(links.join('\n\n')||'No active administrator accounts found.')+'\n\nIf you did not request this, ignore the email. Existing passwords remain unchanged.'});
  }catch(err){for(const entry of active)props.deleteProperty('ADMIN_RECOVERY_'+match.obj.schoolId+'_'+entry.obj.id);throw new Error('Could not send recovery email. Try again later.');}
  return generic;
}
function completeAdministratorRecovery_(p){
  const schoolId=String(p.schoolId||''),accountId=String(p.accountId||''),token=String(p.token||''),password=String(p.newPassword||'');
  if(!schoolId||!accountId||!token||password.length<12||password.length>128)throw new Error('A valid recovery link and a new password of 12–128 characters are required.');
  const props=PropertiesService.getScriptProperties(),key='ADMIN_RECOVERY_'+schoolId+'_'+accountId,lock=LockService.getScriptLock();
  lock.waitLock(20000);
  try{
    const record=JSON.parse(props.getProperty(key)||'null');
    if(!record||Date.now()>record.expires||record.digest!==hashPassword(token,'administrator-recovery'))throw new Error('Recovery link is invalid or expired.');
    const school=findSchoolRow(getRegistrySheet(),r=>String(r.schoolId)===schoolId&&String(r.status)==='Active');
    if(!school)throw new Error('School unavailable.');
    const u=adminUsers(schoolId),entry=u.items.find(x=>String(x.obj.id)===accountId&&x.obj.status==='Active');
    if(!entry)throw new Error('Administrator account unavailable.');
    const salt=Utilities.getUuid(),next=Object.assign({},entry.obj,{salt,passwordHash:hashPassword(password,salt),version:(Number(entry.obj.version)||1)+1,updatedAt:new Date().toISOString()});
    u.sh.getRange(entry.rowIndex,1,1,u.headers.length).setValues([recordToRow(u.headers,next)]);
    props.deleteProperty(key);
    writeAudit(u.ss,schoolId,{id:'email-recovery',name:'Verified school email',role:'schoolOwner'},'passwordReset','schoolAdmins',accountId,null,{username:entry.obj.username});
    return {message:'Administrator password updated. Sign in with your administrator username and new password.'};
  }finally{lock.releaseLock();}
}

function requestSchoolPasswordRecovery_(p) {
  const email=String(p.email||'').trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return {message:'If the email is registered, a recovery link will be sent.'};
  const registry=getRegistrySheet();
  const match=findSchoolRow(registry,r=>String(r.adminEmail||'').trim().toLowerCase()===email && String(r.status)==='Active');
  if(match){
    const props=PropertiesService.getScriptProperties();
    const throttleKey='RECOVERY_RATE_'+match.obj.schoolId;
    const cache=CacheService.getScriptCache();
    if(!cache.get(throttleKey)){
      cache.put(throttleKey,'1',120);
      const token=Utilities.getUuid()+Utilities.getUuid();
      const digest=hashPassword(token,'school-recovery');
      const key='SCHOOL_RECOVERY_'+match.obj.schoolId;
      props.setProperty(key,JSON.stringify({digest,expires:Date.now()+15*60*1000}));
      const url='https://www.lamastudio.pk/lamastudio-school-suite/school-admin-login.html?recovery='+encodeURIComponent(match.obj.schoolId)+'&token='+encodeURIComponent(token);
      try{MailApp.sendEmail({to:email,subject:'LAMA School Suite - reset your school password',body:'A password reset was requested for your school. Open this link within 15 minutes:\n'+url+'\n\nIf you did not request this, ignore the email. Your existing password remains unchanged.'});}
      catch(err){props.deleteProperty(key);throw new Error('Recovery email could not be sent. Please try again later.');}
    }
  }
  return {message:'If the email is registered, a recovery link will be sent.'};
}
function completeSchoolPasswordRecovery_(p){
  const schoolId=String(p.schoolId||''),token=String(p.token||''),password=String(p.newPassword||'');
  if(!schoolId||!token||password.length<12||password.length>128)throw new Error('Valid recovery link and a new password of 12–128 characters are required.');
  const key='SCHOOL_RECOVERY_'+schoolId,props=PropertiesService.getScriptProperties(),lock=LockService.getScriptLock();
  lock.waitLock(20000);
  try{
    const record=JSON.parse(props.getProperty(key)||'null');
    if(!record||Date.now()>record.expires||record.digest!==hashPassword(token,'school-recovery'))throw new Error('Recovery link is invalid or expired. Request a new one.');
    const registry=getRegistrySheet(),match=findSchoolRow(registry,r=>String(r.schoolId)===schoolId&&String(r.status)==='Active');
    if(!match)throw new Error('School is not available.');
    registry.getRange(match.rowIndex,match.headers.indexOf('passwordHash')+1).setValue(hashPassword(password,schoolId));
    props.deleteProperty(key);
    return {message:'School password updated. Sign in using your new password.'};
  }finally{lock.releaseLock();}
}

function adminResetPassword(adminApiKey, schoolId) {
    authorizeAdmin(adminApiKey);
    const registry = getRegistrySheet();
    const match = findSchoolRow(registry, r => r.schoolId === schoolId);
    if (!match) throw new Error('School not found.');
    const newPassword = randomPassword();
    const newHash = hashPassword(newPassword, schoolId);
    const hashCol = match.headers.indexOf('passwordHash') + 1;
    registry.getRange(match.rowIndex, hashCol).setValue(newHash);
    try {
        MailApp.sendEmail(match.obj.adminEmail, 'Your LamaStudio password has been reset',
            'Hello ' + match.obj.name + ',\n\nYour login password has been reset by LamaStudio support.\n\n' +
            'New password: ' + newPassword + '\n\nPlease log in and keep this safe.');
    } catch (e) { /* email sending can fail silently — the password is still returned below */ }
    return { schoolId, newPassword, emailedTo: match.obj.adminEmail };
}

// ============================================================================
// TEACHERS  (role: 'teacher') — created by School Admin, not self-registered
// ============================================================================

/** School Admin action: create a teacher account inside their own school's sheet. */
function addTeacher(schoolId, apiKey, p) {
    assertSchoolWritable(schoolId);
    if (!String(p.name||'').trim() || !p.password || String(p.password).length < 6) {
        throw new Error('Teacher name and a password of at least 6 characters are required. Assign a class now or later.');
    }
    const match = authorizeSchool(schoolId, apiKey);
    const ss = SpreadsheetApp.openById(match.obj.sheetId);
    const ctx = { role: 'school', ss };
    const { sheet, headers } = getCollectionSheet(ctx, 'teachers');
    const existing = sheet.getDataRange().getValues();
    const emailCol = headers.indexOf('email');
    const loginCol = headers.indexOf('loginId');
    const email = String(p.email||'').trim().toLowerCase();
    const loginId = String(p.loginId||'').trim().toLowerCase();
    if(!email&&!loginId)throw new Error('Enter a Teacher Login ID when no email is provided.');
    if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a valid email or leave it blank.');
    if(loginId&&!/^[a-z0-9._-]{3,40}$/.test(loginId))throw new Error('Teacher Login ID must be 3–40 letters, digits, dots, underscores or dashes.');
    const identifierSet=new Set([email,loginId].filter(Boolean));
    for (let i = 1; i < existing.length; i++) {
        const otherEmail=emailCol>=0?String(existing[i][emailCol]||'').trim().toLowerCase():'';
        const otherLogin=loginCol>=0?String(existing[i][loginCol]||'').trim().toLowerCase():'';
        const otherId=String(existing[i][headers.indexOf('id')]||'').trim().toLowerCase();
        if([otherEmail,otherLogin,otherId].some(v=>v&&identifierSet.has(v)))throw new Error('Teacher email or Login ID already exists at this school.');
    }
    validateTeacherAssignment_(sheet,headers,'',p.assignedClass,p.assignedSection,'Active');
    const id = genId('tch');
    const teacherApiKey = Utilities.getUuid();
    const record = {
        id, name: p.name.trim(), email, loginId:loginId||id,
        passwordHash: hashPassword(p.password, id), apiKey: teacherApiKey,
        subject: p.subject || '', assignedClass: p.assignedClass || '', assignedSection: p.assignedSection || '',
        contact: p.contact || '', status: 'Active', createdAt: new Date().toISOString(),
        cnic: p.cnic || '', dob: p.dob || '', gender: p.gender || '', qualification: p.qualification || '',
        joiningDate: p.joiningDate || '', address: p.address || '', emergencyContact: p.emergencyContact || '',
        experience:p.experience||'',designation:p.designation||'',photo:p.photo||''
    };
    sheet.appendRow(recordToRow(headers, record));
    const safe = Object.assign({}, record); delete safe.passwordHash; delete safe.apiKey;
    return safe;
}

function teacherLogin(schoolId, email, password) {
    if (!schoolId || !email || !password) throw new Error('School ID, Teacher Login ID or email, and password are required.');
    const registry = getRegistrySheet();
    const schoolMatch = findSchoolRow(registry, r => r.schoolId === schoolId);
    if (!schoolMatch) throw new Error('School not found. Check your School ID.');
    if (schoolMatch.obj.status !== 'Active') throw new Error('This school\'s account is currently blocked.');

    const ss = SpreadsheetApp.openById(schoolMatch.obj.sheetId);
    const sheet = ss.getSheetByName(COLLECTIONS.teachers.tab);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
        const row = rowToRecord(headers, data[i]);
        if ([row.email, row.loginId, row.id].some(v => String(v || '').trim().toLowerCase() === String(email).trim().toLowerCase())) {
            if (row.status !== 'Active') throw new Error('This teacher account has been disabled by the school.');
            if (hashPassword(password, row.id) !== row.passwordHash) throw new Error('Incorrect password.');
            return {
                schoolId, teacherId: row.id, apiKey: row.apiKey, name: row.name,
                subject: row.subject, loginId:row.loginId||row.id, assignedClass: row.assignedClass, assignedSection: row.assignedSection || '',
                schoolName: schoolMatch.obj.name, schoolLogo: schoolMatch.obj.logo
            };
        }
    }
    throw new Error('No teacher account found with this Teacher ID or email at this school.');
}

/** Every teacher-authenticated call goes through here. Returns the school context + the teacher's own row. */
function lamaSyllabusTeacherScope_(plan,teacher) {
    if (normalizeSchoolClass(plan.classId) !== normalizeSchoolClass(teacher.assignedClass) ||
        String(plan.subjectId).trim().toLowerCase() !== String(teacher.subject).trim().toLowerCase()) return false;
    return String(plan.sectionId||'').trim().toLowerCase() ===
        String(teacher.assignedSection||teacher.section||'').trim().toLowerCase();
}
function authorizeTeacher(schoolId, teacherId, apiKey) {
    if (!schoolId || !teacherId || !apiKey) throw new Error('Missing session — please log in again.');
    const registry = getRegistrySheet();
    const schoolMatch = findSchoolRow(registry, r => r.schoolId === schoolId);
    if (!schoolMatch || schoolMatch.obj.status !== 'Active') throw new Error('Invalid session or blocked account.');
    const ss = SpreadsheetApp.openById(schoolMatch.obj.sheetId);
    const sheet = ss.getSheetByName(COLLECTIONS.teachers.tab);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
        const row = rowToRecord(headers, data[i]);
        if (row.id === teacherId && row.apiKey === apiKey) {
            if (row.status !== 'Active') throw new Error('This teacher account has been disabled.');
            return { schoolMatch, teacher: row, ss };
        }
    }
    throw new Error('Invalid session. Please log in again.');
}

// ============================================================================
// STUDENTS  (role: 'student') — logs in with enrollment number + password
// ============================================================================

function studentLogin(schoolId, enrlNo, password) {
    if (!schoolId || !enrlNo || !password) throw new Error('School ID, enrollment number, and password are required.');
    const registry = getRegistrySheet();
    const schoolMatch = findSchoolRow(registry, r => r.schoolId === schoolId);
    if (!schoolMatch) throw new Error('School not found. Check your School ID.');
    if (schoolMatch.obj.status !== 'Active') throw new Error('This school\'s account is currently blocked.');

    const ss = SpreadsheetApp.openById(schoolMatch.obj.sheetId);
    const sheet = ss.getSheetByName(COLLECTIONS.students.tab);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
        const row = rowToRecord(headers, data[i]);
        if (String(row.enrlNo) === String(enrlNo)) {
            if (String(row.password) !== String(password)) throw new Error('Incorrect password.');
            return {
                schoolId, studentId: row.id, apiKey: row.apiKey, name: row.name, class: row.class, section: row.section || '',
                schoolName: schoolMatch.obj.name, schoolLogo: schoolMatch.obj.logo
            };
        }
    }
    throw new Error('No student found with this enrollment number at this school.');
}

/** Every student-authenticated call goes through here. */
function authorizeStudent(schoolId, studentId, apiKey) {
    if (!schoolId || !studentId || !apiKey) throw new Error('Missing session — please log in again.');
    const registry = getRegistrySheet();
    const schoolMatch = findSchoolRow(registry, r => r.schoolId === schoolId);
    if (!schoolMatch || schoolMatch.obj.status !== 'Active') throw new Error('Invalid session or blocked account.');
    const ss = SpreadsheetApp.openById(schoolMatch.obj.sheetId);
    const sheet = ss.getSheetByName(COLLECTIONS.students.tab);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
        const row = rowToRecord(headers, data[i]);
        if (row.id === studentId && row.apiKey === apiKey) {
            return { schoolMatch, student: row, ss };
        }
    }
    throw new Error('Invalid session. Please log in again.');
}

// ============================================================================
// GENERIC COLLECTION CRUD — now role-aware
// ============================================================================
// role 'school'  -> full access to every collection in their own sheet (unchanged).
// role 'teacher' -> attendance/homework: add+update scoped to their own assignedClass;
//                   students: list/get scoped to their class, update (marks) only;
//                   datesheet/tests/notifications: list/get only (read-only).
// role 'student' -> get on their own student record only; list on
//                   homework/datesheet/tests/notifications scoped to their own class.
// role 'admin'   -> no collection access (registry-level actions only, above).

function rowToRecord(headers, rowValues) {
    const obj = {};
    headers.forEach((h, i) => {
        const val = rowValues[i];
        if (h.endsWith('Json')) {
            const key = h.slice(0, -4);
            try { obj[key] = val ? JSON.parse(val) : null; } catch (e) { obj[key] = null; }
        } else {
            obj[h] = val;
        }
    });
    return obj;
}

function recordToRow(headers, record) {
    return headers.map(h => {
        if (h.endsWith('Json')) {
            const key = h.slice(0, -4);
            return record[key] !== undefined ? JSON.stringify(record[key]) : '';
        }
        return record[h] !== undefined ? record[h] : '';
    });
}

/** Resolves { role, schoolId, apiKey, teacherId?, studentId? } into a working Spreadsheet + role context. */
function resolveContext(p) {
    // Until each campus has independent storage and role grants, never let a
    // request for a new campus silently read or write the legacy main database.
    if (p.campusId && String(p.campusId) !== 'main') throw new Error('Campus-specific records are not enabled yet. No data was changed.');
    const role = p.role || 'school';
    if (role === 'school') {
        const match = authorizeSchool(p.schoolId, p.apiKey);
        return { role, schoolId:p.schoolId, ss: SpreadsheetApp.openById(match.obj.sheetId), auditActor:p._auditActor };
    }
    if (role === 'teacher') {
        const ctx = authorizeTeacher(p.schoolId, p.teacherId, p.apiKey);
        return { role, schoolId:p.schoolId, ss: ctx.ss, teacher: ctx.teacher, auditActor:{id:ctx.teacher.id,name:ctx.teacher.name,role:'teacher'} };
    }
    if (role === 'student') {
        const ctx = authorizeStudent(p.schoolId, p.studentId, p.apiKey);
        return { role, schoolId:p.schoolId, ss: ctx.ss, student: ctx.student };
    }
    throw new Error('Unknown role: ' + role);
}

const TEACHER_WRITE_COLLECTIONS = ['attendance', 'homework'];
const TEACHER_READ_COLLECTIONS = ['students', 'datesheet', 'tests', 'activities', 'teacherPings', 'resources'];
const STUDENT_READ_COLLECTIONS = ['homework', 'datesheet', 'tests', 'notifications', 'activities', 'resources', 'timetable', 'attendance'];
function normalizeSchoolClass(value) {
    return String(value == null ? '' : value).trim().toLowerCase()
      .replace(/^(grade|class|standard|std)[\s._-]*/i, '')
      .replace(/^0+(?=\d)/, '').replace(/\s+/g, '');
}
function sameClass(a,b){ return normalizeSchoolClass(a) === normalizeSchoolClass(b); }
function recordAppliesToClass(record, studentClass) {
    var classes = String(record.class || '').split(/[,;|]/).map(function(v){return v.trim();}).filter(Boolean);
    var map = record.subjects && typeof record.subjects === 'object' ? record.subjects : {};
    if (!Object.keys(map).length && record.subjectsJson) {
        try { map = JSON.parse(record.subjectsJson); } catch (e) { map = {}; }
    }
    var keys = Object.keys(map);
    if (keys.length) return keys.some(function(k){return sameClass(k,studentClass) && !!map[k];});
    return classes.length ? classes.some(function(k){return sameClass(k,studentClass);}) : true;
}
function sameSection(record,section){ return !section || !record.section || sameClass(record.section,section); }
function teacherOwns(ctx,r){ return !!String(ctx.teacher.assignedClass||'').trim() && sameClass(r.class,ctx.teacher.assignedClass) && (!String(ctx.teacher.assignedSection||'').trim() || sameClass(r.section,ctx.teacher.assignedSection)); }
function teacherStudentAccess_(ctx,record){
 if(!String(ctx.teacher.assignedClass||'').trim())throw new Error('No assigned class. Contact school administrator.');
 const studentId=String(record.studentId||'').trim(),enrollment=String(record.enrlNo||'').trim();
 if(!studentId&&!enrollment)throw new Error('Student ID or enrollment number required.');
 const data=getCollectionSheet(ctx,'students'),rows=data.sheet.getDataRange().getValues();
 const student=rows.slice(1).map(r=>rowToRecord(data.headers,r)).find(r=>
   (studentId&&String(r.id||'').trim()===studentId)||(enrollment&&String(r.enrlNo||r.enrollmentNo||'').trim()===enrollment));
 if(!student||!teacherOwns(ctx,student))throw new Error('Attendance denied: student is not in your assigned class and section.');
 if(studentId&&String(student.id)!==studentId)throw new Error('Student ID does not match enrollment.');
 if(enrollment&&String(student.enrlNo||student.enrollmentNo||'').trim()!==enrollment)throw new Error('Enrollment does not match student ID.');
 if(record.class&&!sameClass(record.class,student.class))throw new Error('Attendance class does not match the student.');
 return student;
}

function checkPermission(ctx, action, collection) {
    if(collection==='homeworkCompletion')throw Error('Use dedicated homework completion actions.');
    if (['nonTeachingStaff','staffAttendancePolicy'].indexOf(collection)!==-1) throw Error('Use the dedicated staff management actions.');
    if (ctx.role === 'school') return; // full access, unchanged
    if (ctx.role === 'teacher') {
        if (collection === 'studentRequests' && ['list','get','update'].indexOf(action) !== -1) return;
        if (TEACHER_WRITE_COLLECTIONS.indexOf(collection) !== -1) return; // class-scoped writes
        if (collection === 'students' && (action === 'list' || action === 'get' || action === 'update')) return;
        if (collection === 'notifications' && (action === 'list' || action === 'get' || action === 'add')) return;
        if (TEACHER_READ_COLLECTIONS.indexOf(collection) !== -1 && (action === 'list' || action === 'get')) return;
        throw new Error('Teachers do not have permission for this action.');
    }
    if (ctx.role === 'student') {
        if (collection === 'studentRequests' && ['list','get','add'].indexOf(action) !== -1) return;
        if (collection === 'students' && action === 'get') return;
        if (STUDENT_READ_COLLECTIONS.indexOf(collection) !== -1 && action === 'list') return;
        throw new Error('Students only have read access to their own record and class information.');
    }
    throw new Error('This role cannot access collections directly.');
}

function getCollectionSheet(ctx, collection) {
    const cfg = COLLECTIONS[collection];
    if (!cfg) throw new Error('Unknown collection: ' + collection);
    let sheet = ctx.ss.getSheetByName(cfg.tab);
    if (!sheet) {
        // Self-heal: schools registered before this collection existed won't have this
        // tab yet. Create it on first access instead of throwing.
        sheet = ctx.ss.insertSheet(cfg.tab);
        sheet.appendRow(cfg.headers);
        sheet.setFrozenRows(1);
    } else {
        // Self-heal: schools registered before newer fields existed get those
        // columns added automatically, so nothing new is ever silently dropped.
        ensureSheetHeaders(sheet, cfg.headers);
    }
    // Existing sheets may have gained new columns over time; read their actual order.
    const actualHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    return { sheet, headers: actualHeaders };
}

function listRecords(ctx, collection) {
    checkPermission(ctx, 'list', collection);
    const { sheet, headers } = getCollectionSheet(ctx, collection);
    const data = sheet.getDataRange().getValues();
    let records = [];
    for (let i = 1; i < data.length; i++) {
        if (!data[i][headers.indexOf('id')]) continue;
        records.push(rowToRecord(headers, data[i]));
    }
    // Student attendance is read-only and scoped to the authenticated immutable ID.
    // Return minimal fields, never a class-wide register or staff information.
    if (collection === 'attendance' && ctx.role === 'student') {
        const sid=String(ctx.student.id == null ? '' : ctx.student.id).trim();
        if (!sid) throw Error('Student record has no ID. Contact your school.');
        return records.filter(r=>String(r.studentId == null ? '' : r.studentId).trim()===sid)
            .map(r=>({studentId:sid,date:lamaStaffDate_(r.date),status:String(r.status == null ? '' : r.status).trim()}));
    }
    if (collection === 'notifications' && ctx.role === 'student') {
        records = records.filter(r => {
            const target = String(r.studentId || '').trim();
            if (target) return target === String(ctx.student.id) && String(r.isPublished).toLowerCase() !== 'false' && String(r.status) !== 'Resolved';
            return String(r.audience || '').toLowerCase() !== 'student' && String(r.isPublished).toLowerCase() !== 'false';
        });
    }
    if (collection === 'studentRequests') {
        if (ctx.role === 'student') records = records.filter(r => String(r.studentId) === String(ctx.student.id));
        if (ctx.role === 'teacher') records = records.filter(r => teacherOwns(ctx,r));
    }
    if (ctx.role === 'teacher' && (collection === 'attendance' || collection === 'homework' || collection === 'students')) {
        records = records.filter(r => teacherOwns(ctx,r));
    }
    if (ctx.role === 'teacher' && collection === 'teacherPings') {
        records = records.filter(r => r.teacherId === ctx.teacher.id);
    }
    if (ctx.role === 'student' && (collection === 'homework' || collection === 'datesheet' || collection === 'tests' || collection === 'timetable')) {
        records = records.filter(r => collection === 'datesheet' ? recordAppliesToClass(r, ctx.student.class) : (recordAppliesToClass(r, ctx.student.class) && sameSection(r,ctx.student.section)));
    }
    if(ctx.role==='student'&&collection==='resources')records=records.filter(r=>lamaStudentPlanningVisible_(r,ctx.student));
    if(ctx.role==='teacher'&&collection==='students')records=records.map(lamaTeacherStudentSafe_);
    return records;
}

function getRecord(ctx, collection, id) {
    checkPermission(ctx, 'get', collection);
    if (ctx.role === 'student' && collection === 'students' && id !== ctx.student.id) {
        throw new Error('Students can only view their own record.');
    }
    const { sheet, headers } = getCollectionSheet(ctx, collection);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            const r=rowToRecord(headers,data[i]);
            if (collection === 'studentRequests') {
                if (ctx.role === 'student' && String(r.studentId) !== String(ctx.student.id)) throw new Error('Request not found.');
                if (ctx.role === 'teacher' && !teacherOwns(ctx,r)) throw new Error('Request outside assigned class.');
            }
            if(ctx.role==='teacher' && ['students','attendance','homework'].indexOf(collection)!==-1 && !teacherOwns(ctx,r)) throw new Error('Record outside assigned class/section.');
            return ctx.role==='teacher'&&collection==='students'?lamaTeacherStudentSafe_(r):r;
        }
    }
    return null;
}

function addRecord(ctx, collection, record) {
    assertSchoolWritable(ctx.schoolId);
    checkPermission(ctx, 'add', collection);
    if(collection==='attendance')lamaAssertSchoolAttendanceDay_(ctx,record.date);
    if(collection==='resources')lamaAssertPlanningDay_(ctx,record);
    if (collection === 'studentRequests' && ctx.role === 'student') {
        const type = String(record.requestType || 'help');
        if (['help','sick_leave'].indexOf(type) === -1) throw new Error('Invalid request type.');
        const message = String(record.message || '').trim();
        if (!message || message.length > 3000) throw new Error('Describe your problem (maximum 3000 characters).');
        const from = String(record.leaveFrom || ''), to = String(record.leaveTo || '');
        if (type === 'sick_leave' && (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to)) throw new Error('Enter a valid sick leave date range.');
        record = {studentId:ctx.student.id,studentName:ctx.student.name || '',enrlNo:ctx.student.enrlNo || '',class:ctx.student.class || '',section:ctx.student.section || '',requestType:type,subject:String(record.subject || '').slice(0,120),message:message,leaveFrom:type==='sick_leave'?from:'',leaveTo:type==='sick_leave'?to:'',status:'Pending',teacherReply:'',adminReply:'',assignedTeacherId:'',updatedAt:new Date().toISOString(),reviewedBy:''};
    }
    if (ctx.role === 'teacher' && collection === 'attendance') { const student=teacherStudentAccess_(ctx,record);record=Object.assign({},record,{studentId:student.id,enrlNo:student.enrlNo||'',class:student.class,section:student.section||'',studentName:student.name||''}); }
    if (ctx.role === 'teacher' && TEACHER_WRITE_COLLECTIONS.indexOf(collection) !== -1) {
        record = Object.assign({}, record, { class: ctx.teacher.assignedClass, section: ctx.teacher.assignedSection || record.section || '', markedBy: ctx.teacher.name, assignedBy: ctx.teacher.name });
    }
    if(ctx.role==='teacher'&&collection==='homework')record=Object.assign({},record,{teacherId:ctx.teacher.id,section:ctx.teacher.assignedSection||'',batchId:'',batchHash:''});
    const { sheet, headers } = getCollectionSheet(ctx, collection);
    const id = genId(collection.slice(0, 3));
    const full = Object.assign({}, record, { id, createdAt: new Date().toISOString() });
    if (collection === 'fees' && ctx.role === 'school' && ctx.auditActor) {
        full.receivedByAdminId = ctx.auditActor.id;
        full.receivedByAdminName = ctx.auditActor.name;
    }
    if (collection === 'students' && !full.apiKey) full.apiKey = Utilities.getUuid();
    if (collection === 'students' && !full.password) full.password = full.enrlNo || id;
    sheet.appendRow(recordToRow(headers, full));
    if(ctx.auditActor)writeAudit(ctx.ss,ctx.schoolId,ctx.auditActor,'add',collection,id,null,full);
    return full;
}

function validateTeacherAssignment_(sheet,headers,teacherId,assignedClass,assignedSection,status){
  const cls=String(assignedClass||'').trim().toLowerCase();
  if(!cls||String(status||'Active').toLowerCase()!=='active')return;
  const sec=String(assignedSection||'').trim().toLowerCase();
  const data=sheet.getDataRange().getValues();
  for(let i=1;i<data.length;i++){
    const t=rowToRecord(headers,data[i]);
    if(String(t.id)===String(teacherId)||String(t.status||'Active').toLowerCase()!=='active')continue;
    if(String(t.assignedClass||'').trim().toLowerCase()===cls && String(t.assignedSection||'').trim().toLowerCase()===sec)
      throw Error('This class and section are already assigned to '+(t.name||'another active teacher')+'. Change that assignment first.');
  }
}

function updateRecord(ctx, collection, id, patch) {
    assertSchoolWritable(ctx.schoolId);
    checkPermission(ctx, 'update', collection);
    const { sheet, headers } = getCollectionSheet(ctx, collection);
    const data = sheet.getDataRange().getValues();
    const idCol = headers.indexOf('id');
    for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === id) {
            const existing = rowToRecord(headers, data[i]);
            if(collection==='attendance')lamaAssertSchoolAttendanceDay_(ctx,patch.date||existing.date);
            if(collection==='resources'){const next=Object.assign({},existing,patch);if(existing.category==='planning-period'){const prior=JSON.parse(existing.description||'{}');if(prior.supportId)throw Error('Edit lessons with additional staff using the Easy timetable builder.');}lamaAssertPlanningDay_(ctx,next);}
            if (ctx.role === 'teacher' && collection === 'students' && !sameClass(existing.class, ctx.teacher.assignedClass)) {
                throw new Error('Teachers can only update students in their own assigned class.');
            }
            if(ctx.role==='teacher') {
                if(collection==='students') {
                    if(!teacherOwns(ctx,existing)) throw new Error('Student outside assigned class/section.');
                    const allowed=['subjects','teacherRemarks'];
                    if(Object.keys(patch).some(k=>allowed.indexOf(k)===-1)) throw new Error('Teachers may only update student marks and teacher remarks.');
                } else if(TEACHER_WRITE_COLLECTIONS.indexOf(collection)!==-1) {
                    if(!teacherOwns(ctx,existing)) throw new Error('Record outside assigned class/section.');
                    if(collection==='homework'){if(!lamaTeacherOwnsHomework_(ctx,existing))throw Error('Teachers may only change their own homework.');if(Object.keys(patch).some(k=>['title','description','dueDate','subject'].indexOf(k)===-1))throw Error('Invalid homework update.');}
                    if(collection==='attendance') { if(patch.studentId||patch.enrlNo||patch.class||patch.section)throw new Error('Teacher cannot reassign an attendance record.');teacherStudentAccess_(ctx,existing); }
                    patch=Object.assign({},patch,{class:ctx.teacher.assignedClass,section:ctx.teacher.assignedSection||''});
                }
            }
            if (collection === 'studentRequests') {
                if (ctx.role === 'student') throw new Error('Students cannot change submitted requests.');
                if (ctx.role === 'teacher') {
                    if (!teacherOwns(ctx,existing)) throw new Error('Request outside assigned class.');
                    if (Object.keys(patch).some(k => ['teacherReply','status'].indexOf(k) === -1)) throw new Error('Teacher can only reply and update status.');
                    if (patch.status && ['Pending','In Review','Resolved','Approved','Rejected'].indexOf(String(patch.status)) === -1) throw new Error('Invalid status.');
                    patch = Object.assign({},patch,{reviewedBy:ctx.teacher.name || 'Class Teacher',updatedAt:new Date().toISOString()});
                }
                if (ctx.role === 'school') {
                    if (Object.keys(patch).some(k => ['adminReply','status'].indexOf(k) === -1)) throw new Error('School admin can only reply and update status.');
                    if (patch.status && ['Pending','In Review','Resolved','Approved','Rejected'].indexOf(String(patch.status)) === -1) throw new Error('Invalid status.');
                    patch = Object.assign({},patch,{reviewedBy:'School Admin',updatedAt:new Date().toISOString()});
                }
            }
            if (collection === 'fees' && ctx.role === 'school') {
                // Receipt attribution belongs to the original collector; corrections remain in AuditLog.
                delete patch.receivedByAdminId;
                delete patch.receivedByAdminName;
            }
            if(collection==='teachers'){
                const allowed=['name','email','subject','assignedClass','assignedSection','contact','status','cnic','dob','gender','qualification','joiningDate','address','emergencyContact','experience','photo','medicalNotes','designation'];
                if(Object.keys(patch).some(k=>allowed.indexOf(k)===-1))throw Error('Invalid teacher profile field.');
                if(patch.status&&!['Active','Suspended','Deleted'].includes(String(patch.status)))throw Error('Invalid teacher status.');
                if(patch.name!==undefined&&!String(patch.name).trim())throw Error('Teacher name cannot be empty.');
                if(patch.email!==undefined&&patch.email&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(String(patch.email)))throw Error('Invalid email.');
                const next=Object.assign({},existing,patch);
                validateTeacherAssignment_(sheet,headers,id,next.assignedClass,next.assignedSection,next.status);
            }
            const updated = Object.assign({}, existing, patch, { id });
            sheet.getRange(i + 1, 1, 1, headers.length).setValues([recordToRow(headers, updated)]);
            if(ctx.auditActor)writeAudit(ctx.ss,ctx.schoolId,ctx.auditActor,'update',collection,id,existing,updated);
            if(collection==='teachers'){const safe=Object.assign({},updated);delete safe.passwordHash;delete safe.apiKey;delete safe.password;return safe;}
            return ctx.role==='teacher'&&collection==='students'?lamaTeacherStudentSafe_(updated):updated;
        }
    }
    throw new Error('Record not found: ' + id);
}

function removeRecord(ctx, collection, id) {
    assertSchoolWritable(ctx.schoolId);
    checkPermission(ctx, 'remove', collection);
    if (collection === 'fees') throw new Error('Fee receipts cannot be deleted. Correct the status or amount; the change is audited.');
    const { sheet, headers } = getCollectionSheet(ctx, collection);
    const data = sheet.getDataRange().getValues();
    const idCol = headers.indexOf('id');
    for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === id) {
            if(ctx.role==='teacher' && !teacherOwns(ctx,rowToRecord(headers,data[i]))) throw new Error('Record outside assigned class/section.');
            const previous=rowToRecord(headers,data[i]);
            if(ctx.role==='teacher'&&collection==='homework'&&!lamaTeacherOwnsHomework_(ctx,previous))throw Error('Teachers may only delete their own homework.');
            if(ctx.auditActor)writeAudit(ctx.ss,ctx.schoolId,ctx.auditActor,'remove',collection,id,previous,null);
            sheet.deleteRow(i + 1);
            return true;
        }
    }
    return false;
}

/**
 * School-admin-only batched student deletion. One sheet read per batch and
 * descending contiguous row deletes, avoiding one HTTP request per student.
 * A maximum of 75 IDs keeps Apps Script executions bounded.
 */
function bulkDeleteStudents_(p){
 const ctx=resolveContext(p);
 if(ctx.role!=='school')throw Error('Only a school administrator may bulk delete students.');
 assertSchoolWritable(ctx.schoolId);
 checkPermission(ctx,'remove','students');
 const ids=Array.isArray(p.ids)?p.ids.map(x=>String(x||'').trim()):[];
 if(!ids.length||ids.length>75||ids.some(x=>!x))throw Error('Select 1–75 valid student IDs per batch.');
 const unique=new Set(ids);
 if(unique.size!==ids.length)throw Error('Duplicate student IDs in deletion request.');
 const lock=LockService.getScriptLock();
 if(!lock.tryLock(20000))throw Error('Another school operation is running. Please retry.');
 try{
  const info=getCollectionSheet(ctx,'students'),sheet=info.sheet,headers=info.headers;
  const idCol=headers.indexOf('id'),data=sheet.getDataRange().getValues();
  const matches=[];
  for(let i=1;i<data.length;i++)if(unique.has(String(data[i][idCol])))matches.push({row:i+1,id:String(data[i][idCol]),record:rowToRecord(headers,data[i])});
  // Audit all records before destructive row operations.
  if(ctx.auditActor)for(const item of matches)writeAudit(ctx.ss,ctx.schoolId,ctx.auditActor,'remove','students',item.id,item.record,null);
  const rows=matches.map(x=>x.row).sort((a,b)=>b-a);
  for(let i=0;i<rows.length;){
   let low=rows[i],high=low;i++;
   while(i<rows.length&&rows[i]===low-1){low=rows[i];i++;}
   sheet.deleteRows(low,high-low+1);
  }
  return {requested:ids.length,deleted:matches.length,deletedIds:matches.map(x=>x.id),notFound:ids.filter(id=>!matches.some(m=>m.id===id))};
 }finally{lock.releaseLock();}
}

/** Admin sends a one-tap reminder to a teacher who hasn't marked attendance yet. */
function pingTeacher(schoolId, apiKey, teacherId, message) {
    assertSchoolWritable(schoolId);
    const match = authorizeSchool(schoolId, apiKey);
    const ss = SpreadsheetApp.openById(match.obj.sheetId);
    const ctx = { role: 'school', ss };
    const teacherSheet=getCollectionSheet(ctx,'teachers');
    const teacherRows=teacherSheet.sheet.getDataRange().getValues();
    const target=teacherRows.slice(1).map(row=>rowToRecord(teacherSheet.headers,row)).find(t=>String(t.id)===String(teacherId));
    if(!target || String(target.status||'Active').toLowerCase()!=='active') throw new Error('Assigned teacher is not active or does not exist.');
    return addRecord(ctx, 'teacherPings', {
        teacherId,
        message: message || 'Please mark today\'s student attendance.',
        acknowledged: false
    });
}

/** Teacher dismisses their own ping after seeing it. */
function acknowledgePing(schoolId, teacherId, apiKey, pingId) {
    assertSchoolWritable(schoolId);
    const ctx = authorizeTeacher(schoolId, teacherId, apiKey);
    const teacherCtx = { role: 'teacher', ss: ctx.ss, teacher: ctx.teacher };
    const { sheet, headers } = getCollectionSheet(teacherCtx, 'teacherPings');
    const data = sheet.getDataRange().getValues();
    const idCol = headers.indexOf('id');
    const teacherIdCol = headers.indexOf('teacherId');
    for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === pingId) {
            if (data[i][teacherIdCol] !== ctx.teacher.id) throw new Error('This ping does not belong to you.');
            const updated = Object.assign({}, rowToRecord(headers, data[i]), { acknowledged: true });
            sheet.getRange(i + 1, 1, 1, headers.length).setValues([recordToRow(headers, updated)]);
            return updated;
        }
    }
    throw new Error('Ping not found.');
}

// ============================================================================
// SHARED MAIN DASHBOARD  (school / teacher / student — never fees or HR data)
// ============================================================================

/** The same safe, non-financial overview shown to School Admin, Teacher, and Student/Parent alike. */
function getMainDashboardData(params) {
    const ctx = resolveContext(params);
    const ss = ctx.ss;

    let schoolName = '', logo = '', coverPhoto = '', address = '', level = '', type = '';
    if (ctx.role === 'school') {
        const match = authorizeSchool(params.schoolId, params.apiKey);
        schoolName = match.obj.name; logo = match.obj.logo; coverPhoto = match.obj.coverPhoto || '';
        address = match.obj.address; level = match.obj.level; type = match.obj.type;
    } else {
        const registry = getRegistrySheet();
        const schoolMatch = findSchoolRow(registry, r => r.schoolId === params.schoolId);
        if (schoolMatch) {
            schoolName = schoolMatch.obj.name; logo = schoolMatch.obj.logo; coverPhoto = schoolMatch.obj.coverPhoto || '';
            address = schoolMatch.obj.address; level = schoolMatch.obj.level; type = schoolMatch.obj.type;
        }
    }

    const notifRows = getCollectionSheet(ctx, 'notifications').sheet.getDataRange().getValues();
    const notifHeaders = getCollectionSheet(ctx, 'notifications').headers;
    const notifications = [];
    for (let i = 1; i < notifRows.length; i++) {
        const r = rowToRecord(notifHeaders, notifRows[i]);
        if (r.id) notifications.push(r);
    }
    notifications.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    const actRows = getCollectionSheet(ctx, 'activities').sheet.getDataRange().getValues();
    const actHeaders = getCollectionSheet({role:'school',ss}, 'activities').headers;
    const activities = [];
    for (let i = 1; i < actRows.length; i++) {
        const r = rowToRecord(actHeaders, actRows[i]);
        if (r.id) activities.push(r);
    }
    activities.sort((a, b) => String(b.date || b.createdAt).localeCompare(String(a.date || a.createdAt)));

    const dsRows = getCollectionSheet(ctx, 'datesheet').sheet.getDataRange().getValues();
    const dsHeaders = getCollectionSheet(ctx, 'datesheet').headers;
    const todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const upcomingExams = [];
    for (let i = 1; i < dsRows.length; i++) {
        const r = rowToRecord(dsHeaders, dsRows[i]);
        if (r.id && (String(r.isPublished).toLowerCase() === 'true' || String(r.published).toLowerCase() === 'true' || String(r.status).toLowerCase() === 'published')) upcomingExams.push(r);
    }
    upcomingExams.sort((a, b) => {
        function key(v) { const s=String(v||''); const m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return m ? m[3]+'-'+m[2]+'-'+m[1] : s; }
        return key(a.date).localeCompare(key(b.date));
    });

    const testRows = getCollectionSheet(ctx, 'tests').sheet.getDataRange().getValues();
    const testHeaders = getCollectionSheet(ctx, 'tests').headers;
    const upcomingTests = [];
    for (let i = 1; i < testRows.length; i++) {
        const r = rowToRecord(testHeaders, testRows[i]);
        if (r.id && (String(r.isPublished).toLowerCase() === 'true' || String(r.published).toLowerCase() === 'true' || String(r.status).toLowerCase() === 'published')) upcomingTests.push(r);
    }
    upcomingTests.sort((a, b) => String(a.date).localeCompare(String(b.date)));

    const resRows = getCollectionSheet(ctx, 'resources').sheet.getDataRange().getValues();
    const resHeaders = getCollectionSheet(ctx, 'resources').headers;
    const resources = [];
    for (let i = 1; i < resRows.length; i++) {
        const r = rowToRecord(resHeaders, resRows[i]);
        if (r.id) resources.push(r);
    }
    resources.sort((a, b) => String(a.category).localeCompare(String(b.category)));

    return {
        schoolId: params.schoolId, schoolName, logo, coverPhoto, address, level, type,
        recentNotifications: notifications.filter(x => String(x.status || "").trim().toLowerCase() === "sent" && String(x.audience || "").trim().toLowerCase() === "all classes").slice(0, 5),
        recentActivities: activities.filter(x => String(x.status || "").trim().toLowerCase() === "published" || String(x.isPublished).toLowerCase() === "true" || String(x.published).toLowerCase() === "true").slice(0, 5),
        upcomingExams: ctx.role === 'student' ? upcomingExams.filter(r => recordAppliesToClass(r, ctx.student.class)) : upcomingExams,
        upcomingTests: ctx.role === 'student' ? upcomingTests.filter(r => recordAppliesToClass(r, ctx.student.class)) : upcomingTests,
        resources
    };
}

// ============================================================================
// SCHOOL ADMIN DASHBOARD STATS
// ============================================================================

function getDashboardStats(schoolId, apiKey) {
    const match = authorizeSchool(schoolId, apiKey);
    const ss = SpreadsheetApp.openById(match.obj.sheetId);
    const today = new Date();
    const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');

    const studentsSheet = ss.getSheetByName(COLLECTIONS.students.tab);
    const studentRows = studentsSheet.getDataRange().getValues();
    const studentHeaders = COLLECTIONS.students.headers;
    let totalStudents = 0;
    let maleCount = 0, femaleCount = 0;
    for (let i = 1; i < studentRows.length; i++) {
        if (!studentRows[i][0]) continue;
        totalStudents++;
        const r = rowToRecord(studentHeaders, studentRows[i]);
        if (String(r.gender).toUpperCase() === 'M') maleCount++;
        else if (String(r.gender).toUpperCase() === 'F') femaleCount++;
    }
    const genderBreakdown = { male: maleCount, female: femaleCount, other: totalStudents - maleCount - femaleCount };

    const attSheet = ss.getSheetByName(COLLECTIONS.attendance.tab);
    const attRows = attSheet.getDataRange().getValues();
    const attHeaders = attRows[0];
    let presentToday = 0, absentToday = 0;
    for (let i = 1; i < attRows.length; i++) {
        const r = rowToRecord(attHeaders, attRows[i]);
        if (!r.id) continue;
        if (String(r.date) === todayStr) {
            if (r.status === 'Present') presentToday++;
            else if (r.status === 'Absent') absentToday++;
        }
    }
    const markedToday = presentToday + absentToday;
    const attendanceRatio = markedToday > 0 ? Math.round((presentToday / markedToday) * 100) : null;

    // Which classes have not had their attendance marked today, and by whom.
    const classesMarkedToday = {};
    for (let i = 1; i < attRows.length; i++) {
        const r = rowToRecord(attHeaders, attRows[i]);
        if (r.id && String(r.date) === todayStr) classesMarkedToday[String(r.class)] = true;
    }

    const teachersSheet = ss.getSheetByName(COLLECTIONS.teachers.tab);
    const teacherRows = teachersSheet.getDataRange().getValues();
    const teacherHeaders = COLLECTIONS.teachers.headers;
    const allTeachers = [];
    for (let i = 1; i < teacherRows.length; i++) {
        const r = rowToRecord(teacherHeaders, teacherRows[i]);
        if (r.id) allTeachers.push(r);
    }
    const totalTeachers = allTeachers.length;
    const teachersNotMarked = allTeachers
        .filter(t => t.assignedClass && !classesMarkedToday[String(t.assignedClass)])
        .map(t => ({ id: t.id, name: t.name, assignedClass: t.assignedClass }));

    const tAttSheet = ss.getSheetByName(COLLECTIONS.teacherAttendance.tab) ||
        ss.insertSheet(COLLECTIONS.teacherAttendance.tab);
    if (tAttSheet.getLastRow() === 0) { tAttSheet.appendRow(COLLECTIONS.teacherAttendance.headers); tAttSheet.setFrozenRows(1); }
    const tAttRows = tAttSheet.getDataRange().getValues();
    const tAttHeaders = COLLECTIONS.teacherAttendance.headers;
    let teachersPresentToday = 0, teachersAbsentToday = 0;
    for (let i = 1; i < tAttRows.length; i++) {
        const r = rowToRecord(tAttHeaders, tAttRows[i]);
        if (!r.id || String(r.date) !== todayStr) continue;
        if (r.status === 'Present') teachersPresentToday++;
        else if (r.status === 'Absent') teachersAbsentToday++;
    }

    const feesSheet = ss.getSheetByName(COLLECTIONS.fees.tab);
    const feeRows = feesSheet.getDataRange().getValues();
    const feeHeaders = feeRows[0];
    let todayCollection = 0, overallTotal = 0, monthTotal = 0, yearTotal = 0;
    const monthTotals = {};
    const currentMonthKey = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM');
    const currentYearKey = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy');
    for (let i = 1; i < feeRows.length; i++) {
        const r = rowToRecord(feeHeaders, feeRows[i]);
        if (!r.id || r.status !== 'Paid') continue;
        const amt = Number(r.amount) || 0;
        overallTotal += amt;
        if (String(r.date) === todayStr) todayCollection += amt;
        const month = String(r.date || '').slice(0, 7);
        if (month) monthTotals[month] = (monthTotals[month] || 0) + amt;
        if (month === currentMonthKey) monthTotal += amt;
        if (String(r.date || '').slice(0, 4) === currentYearKey) yearTotal += amt;
    }
    const incomeSeries = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM');
        incomeSeries.push({ month: key, total: monthTotals[key] || 0 });
    }

    const notifSheet = ss.getSheetByName(COLLECTIONS.notifications.tab);
    const notifRows = notifSheet.getDataRange().getValues();
    const notifHeaders = notifRows[0];
    const notifications = [];
    for (let i = 1; i < notifRows.length; i++) {
        const r = rowToRecord(notifHeaders, notifRows[i]);
        if (r.id) notifications.push(r);
    }
    notifications.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    const actSheet = ss.getSheetByName(COLLECTIONS.activities.tab) || ss.insertSheet(COLLECTIONS.activities.tab);
    if (actSheet.getLastRow() === 0) { actSheet.appendRow(COLLECTIONS.activities.headers); actSheet.setFrozenRows(1); }
    const actRows = actSheet.getDataRange().getValues();
    const actHeaders = getCollectionSheet({role:'school',ss}, 'activities').headers;
    const activities = [];
    for (let i = 1; i < actRows.length; i++) {
        const r = rowToRecord(actHeaders, actRows[i]);
        if (r.id) activities.push(r);
    }
    activities.sort((a, b) => String(b.date || b.createdAt).localeCompare(String(a.date || a.createdAt)));

    // Class + section breakdown, each with its own student count.
    const sectionMap = {};
    for (let i = 1; i < studentRows.length; i++) {
        if (!studentRows[i][0]) continue;
        const r = rowToRecord(studentHeaders, studentRows[i]);
        const key = String(r.class) + '|' + String(r.section || '');
        if (!sectionMap[key]) sectionMap[key] = { class: r.class, section: r.section || '', studentCount: 0 };
        sectionMap[key].studentCount++;
    }

    return {
        totalStudents, presentToday, absentToday, attendanceRatio, genderBreakdown,
        totalTeachers, teachersPresentToday, teachersAbsentToday, teachersNotMarked,
        todayCollection, monthTotal, yearTotal, overallTotal, incomeSeries,
        recentNotifications: notifications.slice(0, 5),
        recentActivities: activities.slice(0, 5),
        classSections: Object.keys(sectionMap).map(k => sectionMap[k])
    };
}

/** Per-student fee history and running total — used by the admin fee drill-down view. */
function getStudentFeeSummary(schoolId, apiKey, studentId) {
    const match = authorizeSchool(schoolId, apiKey);
    const ss = SpreadsheetApp.openById(match.obj.sheetId);
    const feesSheet = ss.getSheetByName(COLLECTIONS.fees.tab) || ss.insertSheet(COLLECTIONS.fees.tab);
    if (feesSheet.getLastRow() === 0) { feesSheet.appendRow(COLLECTIONS.fees.headers); feesSheet.setFrozenRows(1); }
    const rows = feesSheet.getDataRange().getValues();
    const headers = feesSheet.getRange(1,1,1,feesSheet.getLastColumn()).getValues()[0];
    const records = [];
    let totalPaid = 0, totalPending = 0, totalOverdue = 0;
    for (let i = 1; i < rows.length; i++) {
        const r = rowToRecord(headers, rows[i]);
        if (!r.id || r.studentId !== studentId) continue;
        records.push(r);
        const amt = Number(r.amount) || 0;
        if (r.status === 'Paid') totalPaid += amt;
        else if (r.status === 'Overdue') totalOverdue += amt;
        else totalPending += amt;
    }
    records.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return { records, totalPaid, totalPending, totalOverdue };
}

// ============================================================================
// HTTP ENTRY POINTS
// ============================================================================

function jsonOut(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Per-school administrator authentication; distinct from the school account and platform Super Admin.
// The owner must prove their original school credentials ONCE to create a separate admin account.
function schoolAdminPropertyKey(schoolId) { return 'SCHOOL_ADMIN_' + String(schoolId || '').replace(/[^A-Za-z0-9_-]/g,'_'); }
function schoolAdminSetup(p){throw new Error('Public admin setup is disabled. Contact the Platform Super Admin.');}
function schoolAdminLogin(p){
  const school=findSchoolRow(getRegistrySheet(),r=>String(r.schoolId)===String(p.schoolId));
  if(!school||school.obj.status!=='Active')throw new Error('School not found or blocked.');
  const u=adminUsers(p.schoolId),username=String(p.adminUsername||'').trim().toLowerCase();
  const entry=u.items.find(x=>x.obj.username===username);
  if(!entry||entry.obj.status!=='Active'||hashPassword(String(p.adminPassword||''),entry.obj.salt)!==entry.obj.passwordHash)throw new Error('Invalid administrator credentials.');
  const token=Utilities.getUuid()+'-'+Utilities.getUuid();
  CacheService.getScriptCache().put('SADMIN_'+String(p.schoolId)+'_'+token,JSON.stringify({id:entry.obj.id,version:entry.obj.version}),21600);
  return {schoolId:String(p.schoolId),token,adminId:entry.obj.id,adminName:entry.obj.displayName,expiresInSeconds:21600};
}
function schoolAdminVerify(p){const a=verifySchoolAdminToken(p);return {valid:true,adminId:a.id,adminName:a.name};}

// ==== SECURITY / ACCOUNTABILITY EXTENSION (2026-10-25) ====
const ADMIN_USERS_TAB = 'SchoolAdmins';
const AUDIT_TAB = 'AuditLog';
const ADMIN_USERS_HEADERS = ['id','username','displayName','passwordHash','salt','status','version','createdAt','updatedAt'];
const AUDIT_HEADERS = ['id','timestamp','schoolId','actorId','actorName','actorRole','operation','collection','recordId','beforeJson','afterJson'];
function secureTab(ss,name,headers) {
  let sh=ss.getSheetByName(name);
  if(!sh){sh=ss.insertSheet(name);sh.appendRow(headers);sh.setFrozenRows(1);}
  else ensureSheetHeaders(sh,headers);
  return sh;
}
function adminUsers(schoolId){
  const r=findSchoolRow(getRegistrySheet(),x=>String(x.schoolId)===String(schoolId));
  if(!r)throw new Error('School not found.');
  const ss=SpreadsheetApp.openById(r.obj.sheetId);
  const sh=secureTab(ss,ADMIN_USERS_TAB,ADMIN_USERS_HEADERS);
  const rows=sh.getDataRange().getValues(), headers=rows[0];
  return {ss,sh,headers,items:rows.slice(1).map((row,i)=>({rowIndex:i+2,obj:rowToRecord(headers,row)})).filter(x=>x.obj.id)};
}
function authorizeSchoolOwner_(p){
  if(!p||!p.schoolId||!p.ownerEmail||!p.ownerPassword)throw new Error('School owner email and password are required.');
  const school=loginSchool(String(p.ownerEmail).trim(),String(p.ownerPassword));
  if(String(school.schoolId)!==String(p.schoolId))throw new Error('This owner account does not belong to the selected school.');
  return {id:'owner:'+school.schoolId,name:school.name,role:'schoolOwner'};
}
// Campus directory is metadata-only. Existing student/teacher/finance records remain
// in the original school spreadsheet until separate campus storage is provisioned.
const OWNER_CAMPUS_HEADERS_=['campusId','campusName','address','status','createdAt','updatedAt'];
function ownerCampusDirectory_(schoolId){
  const u=adminUsers(schoolId);
  const sh=secureTab(u.ss,'Campuses',OWNER_CAMPUS_HEADERS_);
  const rows=sh.getDataRange().getValues();
  const items=rows.slice(1).map((row,i)=>({rowIndex:i+2,obj:rowToRecord(rows[0],row)})).filter(x=>x.obj.campusId);
  return {sh,items};
}
function ownerListCampuses(p){
  authorizeSchoolOwner_(p);
  const directory=ownerCampusDirectory_(p.schoolId);
  const main={campusId:'main',campusName:'Main Campus',address:'',status:'Active',isLegacy:true};
  return [main].concat(directory.items.map(x=>Object.assign({},x.obj,{isLegacy:false})));
}
function ownerSaveCampus(p){
  authorizeSchoolOwner_(p);
  const campusName=String(p.campusName||'').trim();
  if(!campusName||campusName.length>100)throw Error('Campus name is required (maximum 100 characters).');
  const status=String(p.status||'Active');
  if(!['Active','Disabled'].includes(status))throw Error('Invalid campus status.');
  const campusId=String(p.campusId||'').trim();
  if(campusId==='main')throw Error('The existing main campus cannot be changed through this action.');
  // Reject spreadsheet formulas in user-controlled labels rather than evaluating them.
  if(/^[=+@-]/.test(campusName)||/^[=+@-]/.test(String(p.address||'').trim()))throw Error('Campus names and addresses cannot begin with spreadsheet formula characters.');
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    const directory=ownerCampusDirectory_(p.schoolId);
    const found=directory.items.find(x=>String(x.obj.campusId)===campusId);
    if(campusId&&!found)throw Error('Campus not found.');
    if(directory.items.some(x=>x!==found&&String(x.obj.campusName).toLowerCase()===campusName.toLowerCase()))throw Error('Campus name already exists.');
    const now=new Date().toISOString();
    const item={campusId:found?found.obj.campusId:genId('campus'),campusName,address:String(p.address||'').trim().slice(0,300),status,createdAt:found?found.obj.createdAt:now,updatedAt:now};
    if(found)directory.sh.getRange(found.rowIndex,1,1,OWNER_CAMPUS_HEADERS_.length).setValues([OWNER_CAMPUS_HEADERS_.map(h=>item[h])]);
    else directory.sh.appendRow(OWNER_CAMPUS_HEADERS_.map(h=>item[h]));
    writeAudit(adminUsers(p.schoolId).ss,p.schoolId,{id:'owner:'+p.schoolId,name:'School Owner',role:'schoolOwner'},found?'update':'add','campuses',item.campusId,found?found.obj:null,item);
    return item;
  }finally{lock.releaseLock()}
}
// Campus data is deliberately stored in distinct tabs with campus-ID suffixes.
// This owner-only API never exposes legacy main-campus records or credentials.
const CAMPUS_COLLECTIONS_=['students','attendance','fees','homework','tests','datesheet','timetable'];
// Teacher credentials and logins require dedicated campus-aware authentication.
// Never allow generic record writes to create accounts that cannot log in securely.
function ownerCampusRecords_(p,operation){
  authorizeSchoolOwner_(p);
  const campusId=String(p.campusId||'');
  if(!campusId||campusId==='main')throw Error('Select a separate campus. Main-campus data uses existing school operations.');
  const directory=ownerCampusDirectory_(p.schoolId);
  const campus=directory.items.find(x=>String(x.obj.campusId)===campusId);
  if(!campus||campus.obj.status!=='Active')throw Error('Campus is missing or disabled.');
  const collection=String(p.collection||'');
  if(CAMPUS_COLLECTIONS_.indexOf(collection)<0)throw Error('Unsupported campus collection.');
  const cfg=COLLECTIONS[collection];
  const ss=adminUsers(p.schoolId).ss;
  const tab='Campus_'+campusId.replace(/[^a-zA-Z0-9_-]/g,'_')+'_'+collection;
  const sh=secureTab(ss,tab,cfg.headers);
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const idCol=headers.indexOf('id');
  if(idCol<0)throw Error('Campus record ID column is missing.');
  const values=sh.getDataRange().getValues();
  const entries=values.slice(1).map((v,i)=>({row:i+2,obj:rowToRecord(headers,v)})).filter(x=>x.obj.id);
  const scrub=x=>{const o=Object.assign({},x);['apiKey','password','passwordHash','salt','token'].forEach(k=>delete o[k]);return o};
  if(operation==='list')return entries.map(x=>scrub(x.obj));
  if(operation==='save'){
    assertSchoolWritable(p.schoolId);
    // Serialize campus writes so concurrent requests cannot overwrite a row.
    const writeLock=LockService.getScriptLock();writeLock.waitLock(20000);
    try {
    return saveCampusRecordLocked_(p,ss,sh,headers,collection,campusId,scrub);
    } finally {writeLock.releaseLock();}
  }
  throw Error('Unknown campus operation.');
}
function saveCampusRecordLocked_(p,ss,sh,headers,collection,campusId,scrub){
    const values=sh.getDataRange().getValues();
    const entries=values.slice(1).map((v,i)=>({row:i+2,obj:rowToRecord(headers,v)})).filter(x=>x.obj.id);
    if(!p.record||typeof p.record!=='object'||Array.isArray(p.record))throw Error('A valid campus record is required.');
    const requestedId=String(p.record.id||'');
    const existing=requestedId?entries.find(x=>String(x.obj.id)===requestedId):null;
    if(requestedId&&!existing)throw Error('Campus record not found.');
    const allowed=headers.filter(h=>!['id','createdAt','passwordHash','apiKey','salt','token'].includes(h));
    const patch={};allowed.forEach(h=>{if(Object.prototype.hasOwnProperty.call(p.record,h)){
      const value=p.record[h];
      if(value!==null && typeof value==='object' && !h.endsWith('Json'))throw Error('Invalid value for '+h);
      if(typeof value==='string' && value.length>20000)throw Error('Field is too long: '+h);
      if(typeof value==='string' && /^[=+@]/.test(value.trim()))throw Error('Spreadsheet formula input is not allowed: '+h);
      patch[h]=value;
    }});
    const now=new Date().toISOString();
    const result=Object.assign({},existing?existing.obj:{},patch,{id:existing?existing.obj.id:genId(collection.slice(0,3)),createdAt:existing?existing.obj.createdAt:now,updatedAt:now});
    if(existing)sh.getRange(existing.row,1,1,headers.length).setValues([recordToRow(headers,result)]);
    else sh.appendRow(recordToRow(headers,result));
    writeAudit(ss,p.schoolId,{id:'owner:'+p.schoolId,name:'School Owner',role:'schoolOwner'},existing?'update':'add','campus:'+campusId+':'+collection,result.id,existing?existing.obj:null,result);
    return scrub(result);
}
function ownerListSchoolUsers(p){
  authorizeSchoolOwner_(p);
  const u=adminUsers(p.schoolId);
  return u.items.map(x=>({id:x.obj.id,username:x.obj.username,displayName:x.obj.displayName,status:x.obj.status,createdAt:x.obj.createdAt,updatedAt:x.obj.updatedAt}));
}
function ownerSaveSchoolUser(p){
  const actor=authorizeSchoolOwner_(p);
  return saveSchoolUserAuthorized_(p,actor);
}
function adminListSchoolUsers(p){
  authorizeAdmin(p.adminApiKey);
  const u=adminUsers(p.schoolId);
  return u.items.map(x=>({id:x.obj.id,username:x.obj.username,displayName:x.obj.displayName,status:x.obj.status,createdAt:x.obj.createdAt,updatedAt:x.obj.updatedAt}));
}
function adminSaveSchoolUser(p){
  throw new Error('Administrator management belongs to the School Owner.');
}
function saveSchoolUserAuthorized_(p,actor){
  if(!actor||actor.role!=='schoolOwner')throw new Error('School Owner authorization required.');
  const username=String(p.username||'').trim().toLowerCase(),displayName=String(p.displayName||'').trim();
  if(!/^[a-z0-9._-]{3,40}$/.test(username))throw new Error('Username must be 3-40 characters: letters, numbers, dot, underscore or dash.');
  if(!displayName||displayName.length>100)throw new Error('Display name is required (maximum 100 characters).');
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    const u=adminUsers(p.schoolId),found=u.items.find(x=>String(x.obj.id)===String(p.id||''));
    if(u.items.some(x=>x!==found&&x.obj.username===username))throw new Error('Username already used at this school.');
    const status=String(p.status||'Active');
    if(!['Active','Disabled'].includes(status))throw new Error('Invalid status.');
    if(status==='Active'&&u.items.filter(x=>x!==found&&x.obj.status==='Active').length>=5)throw new Error('Maximum five active School Admins per school. Disable one first.');
    const password=String(p.password||'');
    if((!found||password)&&password.length<12)throw new Error('Password must contain at least 12 characters.');
    const now=new Date().toISOString(),old=found?found.obj:null,salt=password?Utilities.getUuid():old.salt;
    const record={id:old?old.id:genId('adm'),username,displayName,passwordHash:password?hashPassword(password,salt):old.passwordHash,salt,status,version:(old?Number(old.version)||1:0)+1,createdAt:old?old.createdAt:now,updatedAt:now};
    if(found)u.sh.getRange(found.rowIndex,1,1,u.headers.length).setValues([recordToRow(u.headers,record)]);
    else u.sh.appendRow(recordToRow(u.headers,record));
    writeAudit(u.ss,p.schoolId,actor,old?'update':'add','schoolAdmins',record.id,old?{username:old.username,displayName:old.displayName,status:old.status}:null,{username,displayName,status});
    return {id:record.id,username,displayName,status};
  }finally{lock.releaseLock();}
}
function verifySchoolAdminToken(p){
  if(!p.schoolId||!p.token)throw new Error('School Admin login required.');
  const key='SADMIN_'+String(p.schoolId)+'_'+String(p.token);
  const raw=CacheService.getScriptCache().get(key);
  if(!raw)throw new Error('School Admin session expired. Log in again.');
  const school=findSchoolRow(getRegistrySheet(),r=>String(r.schoolId)===String(p.schoolId));
  if(!school||school.obj.status!=='Active')throw new Error('School not found or blocked.');
  const info=JSON.parse(raw),u=adminUsers(p.schoolId),entry=u.items.find(x=>x.obj.id===info.id);
  if(!entry||entry.obj.status!=='Active'||Number(entry.obj.version)!==Number(info.version))throw new Error('Administrator account changed or disabled. Log in again.');
  return {id:entry.obj.id,name:entry.obj.displayName,role:'schoolAdmin'};
}
function requireSchoolAdminWrite(p){
  const actor=verifySchoolAdminToken(p);
  authorizeSchool(p.schoolId,p.apiKey);
  assertSchoolWritable(p.schoolId);
  return actor;
}
function writeAudit(ss,schoolId,actor,operation,collection,recordId,before,after){
  const sh=secureTab(ss,AUDIT_TAB,AUDIT_HEADERS);
  const scrub=o=>{if(!o)return '';const redact=(v)=>{if(Array.isArray(v))return v.map(redact);if(v&&typeof v==='object'){const out={};Object.keys(v).forEach(k=>{if(/password|apikey|token|salt|secret|cnic/i.test(k))return;out[k]=redact(v[k]);});return out;}return v;};return JSON.stringify(redact(o)).slice(0,25000);};
  sh.appendRow([genId('audit'),new Date().toISOString(),schoolId,actor.id,actor.name,actor.role,operation,collection,recordId||'',scrub(before),scrub(after)]);
}
function adminGetAudit(p){
  let ss,actor;
  if(p.adminApiKey){authorizeAdmin(p.adminApiKey);const u=adminUsers(p.schoolId);ss=u.ss;}
  else{actor=requireSchoolAdminWrite(p);ss=adminUsers(p.schoolId).ss;}
  const sh=secureTab(ss,AUDIT_TAB,AUDIT_HEADERS);
  const values=sh.getDataRange().getValues(),headers=values[0];
  return values.slice(1).filter(r=>r[0]).slice(-Math.min(Math.max(Number(p.limit)||200,1),1000)).reverse().map(r=>rowToRecord(headers,r));
}
// ==== END SECURITY EXTENSION ====


/** Admin-only, school-scoped attendance cleanup with an independent recoverable snapshot. */
function clearStudentAttendanceDate_(p) {
  const actor=requireSchoolAdminWrite(p);
  assertSchoolWritable(p.schoolId);
  const date=String(p.date||'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Valid YYYY-MM-DD date required.');
  const classFilter=String(p.className||'').trim().toLowerCase();
  const ctx=resolveContext(p);
  const info=getCollectionSheet(ctx,'attendance'),sheet=info.sheet,headers=info.headers;
  const data=sheet.getDataRange().getValues();
  const dateCol=headers.indexOf('date'),classCol=headers.indexOf('class');
  if(dateCol<0)throw Error('Attendance date column is missing.');
  const toDate=v=>{
    if(v instanceof Date)return Utilities.formatDate(v,Session.getScriptTimeZone(),'yyyy-MM-dd');
    const t=String(v||'').trim();
    if(/^\d{4}-\d{2}-\d{2}/.test(t))return t.slice(0,10);
    const m=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    return m?m[3]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2):'';
  };
  const matches=[];
  for(let i=1;i<data.length;i++){
    if(toDate(data[i][dateCol])!==date)continue;
    if(classFilter&&(classCol<0||String(data[i][classCol]||'').trim().toLowerCase()!==classFilter))continue;
    matches.push(i);
  }
  if(p.previewOnly)return {count:matches.length,date:date,className:p.className||'',previewOnly:true};
  if(String(p.confirmText||'')!=='REMOVE '+date)throw Error('Confirmation phrase is required.');
  if(!matches.length)return {count:0,date:date};
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    // The archive is created before any deletion. Rows are retained with original column order.
    const backupName='Attendance_Backup_'+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyMMdd_HHmmss');
    const backup=ctx.ss.insertSheet(backupName);
    backup.getRange(1,1,1,headers.length).setValues([headers]);
    backup.getRange(2,1,matches.length,headers.length).setValues(matches.map(i=>data[i]));
    backup.setFrozenRows(1);
    for(let j=matches.length-1;j>=0;j--)sheet.deleteRow(matches[j]+1);
    writeAudit(ctx.ss,p.schoolId,actor,'clearAttendanceDate','attendance',date,{count:matches.length,className:p.className||'',backupSheet:backupName},null);
    return {count:matches.length,date:date,backupSheet:backupName};
  }finally{lock.releaseLock()}
}


const SUPPORT_HEADERS_=['ticketId','schoolId','schoolName','category','subject','description','status','reply','createdAt','updatedAt','submittedBy'];
function supportDirectory_(){
 const sheet=secureTab(getRegistrySheet().getParent(),'SupportTickets',SUPPORT_HEADERS_);
 const rows=sheet.getDataRange().getValues();
 return {sheet,items:rows.slice(1).map((row,i)=>({row:i+2,obj:rowToRecord(rows[0],row)})).filter(x=>x.obj.ticketId)};
}
function schoolSupport_(p){
 const actor=verifySchoolAdminToken(p);
 const school=findSchoolRow(getRegistrySheet(),r=>String(r.schoolId)===String(p.schoolId));
 if(!school)throw Error('School not found.');
 const directory=supportDirectory_();
 if(p.action==='supportList')return directory.items.filter(x=>String(x.obj.schoolId)===String(p.schoolId)).map(x=>x.obj).reverse();
 const category=String(p.category||'General').trim().slice(0,60);
 const subject=String(p.subject||'').trim().slice(0,120);
 const description=String(p.description||'').trim().slice(0,3000);
 if(subject.length<5||description.length<10)throw Error('Enter a subject (5+ characters) and details (10+ characters).');
 const now=new Date().toISOString(),ticket={ticketId:genId('help'),schoolId:p.schoolId,schoolName:school.obj.name,category,subject,description,status:'Open',reply:'',createdAt:now,updatedAt:now,submittedBy:actor.name};
 directory.sheet.appendRow(SUPPORT_HEADERS_.map(k=>ticket[k]));return ticket;
}
function adminSupport_(p){
 authorizeAdmin(p.adminApiKey);
 const directory=supportDirectory_();
 if(p.action==='adminSupportList')return directory.items.map(x=>x.obj).reverse();
 const entry=directory.items.find(x=>String(x.obj.ticketId)===String(p.ticketId));
 if(!entry)throw Error('Ticket not found.');
 const status=String(p.status||'In Progress');
 if(!['Open','In Progress','Resolved'].includes(status))throw Error('Invalid ticket status.');
 const reply=String(p.reply||'').trim().slice(0,3000);
 const ticket=Object.assign({},entry.obj,{status,reply,updatedAt:new Date().toISOString()});
 directory.sheet.getRange(entry.row,1,1,SUPPORT_HEADERS_.length).setValues([SUPPORT_HEADERS_.map(k=>ticket[k])]);return ticket;
}


const COMMUNITY_POST_HEADERS_=['postId','schoolId','schoolName','author','category','title','body','status','createdAt','updatedAt'];
const COMMUNITY_REPLY_HEADERS_=['replyId','postId','schoolId','schoolName','author','body','status','createdAt'];
const COMMUNITY_REPORT_HEADERS_=['reportId','postId','replyId','schoolId','reason','createdAt'];
function communitySheet_(name,headers){return secureTab(getRegistrySheet().getParent(),name,headers);}
function communityRows_(sheet){const rows=sheet.getDataRange().getValues();return rows.slice(1).map((r,i)=>({row:i+2,obj:rowToRecord(rows[0],r)})).filter(x=>x.obj.postId||x.obj.reportId||x.obj.replyId);}
function communityText_(value,max,label,min){const v=String(value||'').trim();if(v.length<(min||1)||v.length>max||/^[=+@\-]/.test(v))throw Error(label+' must be '+(min||1)+'-'+max+' characters and must not begin with a spreadsheet formula character.');return v;}
function communityActor_(p){
 if(p.ownerEmail||p.ownerPassword){const actor=authorizeSchoolOwner_(p);return {schoolId:String(p.schoolId),author:actor.name+' (Owner)'};}
 const actor=verifySchoolAdminToken(p);return {schoolId:String(p.schoolId),author:actor.name+' (Administrator)'};
}
function communityData_(){
 const posts=communityRows_(communitySheet_('CommunityPosts',COMMUNITY_POST_HEADERS_));
 const replies=communityRows_(communitySheet_('CommunityReplies',COMMUNITY_REPLY_HEADERS_));
 return {posts,replies};
}
function communityPublic_(p){
 const actor=communityActor_(p),data=communityData_();
 const visible=data.posts.filter(x=>x.obj.status==='Published');
 if(p.action==='communityList')return visible.slice(-100).reverse().map(x=>Object.assign({},x.obj,{replies:data.replies.filter(r=>r.obj.postId===x.obj.postId&&r.obj.status==='Published').map(r=>r.obj)}));
 const school=findSchoolRow(getRegistrySheet(),r=>String(r.schoolId)===actor.schoolId);
 if(!school||school.obj.status!=='Active')throw Error('School not active.');
 const name=String(school.obj.name||'School').replace(/^[=+@\-]/,'').slice(0,150);
 if(p.action==='communityCreate'){
   const category=communityText_(p.category,50,'Category');
   if(['General','Teaching','School Management','Examinations','Technology','Collaboration','Feedback'].indexOf(category)<0)throw Error('Invalid category.');
   const title=communityText_(p.title,120,'Title',5),body=communityText_(p.body,3000,'Post',10);
   const now=new Date().toISOString(),post={postId:genId('community'),schoolId:actor.schoolId,schoolName:name,author:actor.author,category,title,body,status:'Published',createdAt:now,updatedAt:now};
   communitySheet_('CommunityPosts',COMMUNITY_POST_HEADERS_).appendRow(COMMUNITY_POST_HEADERS_.map(k=>post[k]));return post;
 }
 const post=data.posts.find(x=>x.obj.postId===String(p.postId)&&x.obj.status==='Published');
 if(!post)throw Error('Discussion unavailable.');
 if(p.action==='communityReply'){
   const body=communityText_(p.body,1500,'Reply',2),reply={replyId:genId('reply'),postId:post.obj.postId,schoolId:actor.schoolId,schoolName:name,author:actor.author,body,status:'Published',createdAt:new Date().toISOString()};
   communitySheet_('CommunityReplies',COMMUNITY_REPLY_HEADERS_).appendRow(COMMUNITY_REPLY_HEADERS_.map(k=>reply[k]));return reply;
 }
 if(p.action==='communityReport'){
   const replyId=String(p.replyId||'');
   if(replyId&&!data.replies.some(x=>x.obj.replyId===replyId&&x.obj.postId===post.obj.postId&&x.obj.status==='Published'))throw Error('Reply unavailable.');
   const reason=communityText_(p.reason,500,'Reason',5),report={reportId:genId('report'),postId:post.obj.postId,replyId,schoolId:actor.schoolId,reason,createdAt:new Date().toISOString()};
   communitySheet_('CommunityReports',COMMUNITY_REPORT_HEADERS_).appendRow(COMMUNITY_REPORT_HEADERS_.map(k=>report[k]));return {reportId:report.reportId};
 }
 throw Error('Unknown community action.');
}
function communityModerate_(p){
 authorizeAdmin(p.adminApiKey);
 const data=communityData_(),reports=communityRows_(communitySheet_('CommunityReports',COMMUNITY_REPORT_HEADERS_));
 if(p.action==='adminCommunityList')return {posts:data.posts.map(x=>Object.assign({},x.obj,{replies:data.replies.filter(r=>r.obj.postId===x.obj.postId).map(r=>r.obj)})).reverse(),reports:reports.map(x=>x.obj).reverse()};
 const kind=String(p.kind||''),id=String(p.id||''),status=String(p.status||'');
 if(!['post','reply'].includes(kind)||!['Published','Hidden'].includes(status))throw Error('Invalid moderation action.');
 const headers=kind==='post'?COMMUNITY_POST_HEADERS_:COMMUNITY_REPLY_HEADERS_,name=kind==='post'?'CommunityPosts':'CommunityReplies';
 const item=(kind==='post'?data.posts:data.replies).find(x=>String(x.obj[kind==='post'?'postId':'replyId'])===id);
 if(!item)throw Error('Community item not found.');
 const updated=Object.assign({},item.obj,{status});if(kind==='post')updated.updatedAt=new Date().toISOString();
 communitySheet_(name,headers).getRange(item.row,1,1,headers.length).setValues([headers.map(k=>updated[k])]);return {id,status};
}

function handleRequest(params) {
    const action = params.action;
    try {
        // Campus-directory actions are owner-only. Other operations must not
        // accidentally fall back to the main campus for a different campus.
        if (params.campusId && String(params.campusId) !== 'main' && ['ownerListCampuses','ownerSaveCampus','ownerListCampusRecords','ownerSaveCampusRecord'].indexOf(action) === -1) {
            throw new Error('Campus-specific operations are not enabled yet. Existing main-campus records were not accessed.');
        }
        // Authenticate school administrators before resolving teacher-management credentials.
        // The API key remains server-side and is never returned to the browser.
        const teacherScoped = /^feeLedger(?:Read|Issue|Pay|Reverse)$/.test(action) || action === 'bulkAttendance' || action === 'clearStudentAttendanceDate' || (['list','add'].indexOf(action)!==-1 && params.collection === 'notifications') || action === 'syllabusSchoolProgress' || action === 'syllabusAdminProgress' || action === 'syllabusCreateDraft' || action === 'syllabusChangeStatus' || action === 'syllabusListPlans' || action === 'syllabusAdminReadPlan' || action === 'pingTeacher' || action === 'getSchoolConfig' || action === 'getTeacherManagementBootstrap' || action === 'getSchoolClassOptions' || action === 'addTeacher' ||
            (['list','get','add','update','remove','delete'].indexOf(action) !== -1 && params.collection === 'teachers') ||
            (action === 'list' && ['students','attendance'].indexOf(params.collection) !== -1 && (params.role || 'school') === 'school') || (['list','get','add','update','remove'].indexOf(action)!==-1 && params.collection==='teacherAttendance' && (params.role||'school')==='school');
        if (teacherScoped && params.token && params.schoolId && (params.role || 'school') === 'school') {
            verifySchoolAdminToken(params);
            const schoolRecord = findSchoolRow(getRegistrySheet(), r => String(r.schoolId) === String(params.schoolId));
            if (!schoolRecord || schoolRecord.obj.status !== 'Active') throw new Error('School is not active.');
            params.apiKey = schoolRecord.obj.apiKey;
        }
        if (['staffAdminDirectory','staffAdminSave','staffSavePolicy','staffLogin','staffOwnAttendance'].indexOf(action)!==-1)
            return {status:'success',result:lamaStaffAction_(params)};
        if (action==='saveSchoolWorkingWeek')return {status:'success',result:lamaSaveSchoolWorkingWeek_(params)};
        if (action==='planningSaveBatch')return {status:'success',result:lamaPlanningSaveBatch_(params)};
        if(action==='lessonPlanner')return {status:'success',result:lamaLessonPlanner_(params)};
        if (['studentHomeworkCompletion','studentHomeworkSetCompletion','homeworkCompletionReport'].includes(action))return {status:'success',result:lamaHomeworkCompletionAction_(params)};
        if (action==='teacherHomeworkBatch')return {status:'success',result:lamaTeacherHomeworkBatch_(params)};
        if (action==='teacherUpdateStudentProfile')return {status:'success',result:lamaTeacherUpdateStudentProfile_(params)};
        if (/^feeLedger(?:Read|Issue|Pay|Reverse)$/.test(action)) return {status:'success',result:lamaFeeAction_(params)};
        const protectedActions=['waConnect','waDisconnect','waSendTemplates','bulkDeleteStudents','clearStudentAttendanceDate','updateSchoolConfig','pingTeacher','addTeacher','bulkAttendance','importStudentsBatch','previewStudentIds','applyStudentIds','add','update','remove'];
        if(protectedActions.indexOf(action)!==-1 && (params.role||'school')==='school') {
          params._auditActor=requireSchoolAdminWrite(params);
        }
        if (action === 'syllabusSchoolProgress') {
            if ((params.role || 'school') !== 'school') throw new Error('Administrator session required.');
            if (typeof LamaSyllabusSheetStore === 'undefined' || typeof LamaSyllabusProgressStore === 'undefined' ||
                typeof lamaRequireModuleForVerifiedSchool_ !== 'function') throw new Error('Syllabus components unavailable.');
            const actor=requireSchoolAdminWrite(params);
            if (!actor || !actor.id) throw new Error('Verified administrator required.');
            lamaRequireModuleForVerifiedSchool_(params.schoolId,'examination');
            const school=authorizeSchool(params.schoolId,params.apiKey);
            if (typeof params.sessionId !== 'string' || !/^[a-zA-Z0-9 _./-]{1,100}$/.test(params.sessionId.trim()))
                throw new Error('Academic session is required.');
            const sessionId=params.sessionId.trim();
            const plans=LamaSyllabusSheetStore.list(school.obj.sheetId,params.schoolId,{})
                .filter(function(p){return p.status==='published' && p.sessionId===sessionId});
            const scopes={};
            plans.forEach(function(p){
                const scope=[String(p.classId).trim().toLowerCase(),String(p.subjectId).trim().toLowerCase(),String(p.sectionId||'').trim().toLowerCase()].join('|');
                if(Object.prototype.hasOwnProperty.call(scopes,scope))
                    throw new Error('Overlapping published plans for class and subject. Resolve duplicate plans before reporting.');
                scopes[scope]=true;
            });
            if(plans.length>100)throw new Error('Too many syllabus plans for single report; pagination required.');
            const asOf=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd');
            const totals={completed:0,pending:0,delayed:0},groups={};
            plans.forEach(function(meta){
                const record=LamaSyllabusSheetStore.read(school.obj.sheetId,params.schoolId,meta.planId);
                if(!record)throw new Error('Syllabus plan missing');
                const updates=LamaSyllabusProgressStore.list(school.obj.sheetId,params.schoolId,meta.planId);
                const index={};
                updates.forEach(function(u){if(Object.prototype.hasOwnProperty.call(index,u.key))throw new Error('Duplicate progress rows');index[u.key]=u});
                const groupKey=String(meta.classId);
                if(!Object.prototype.hasOwnProperty.call(groups,groupKey))groups[groupKey]={classId:meta.classId,plans:0,completed:0,pending:0,delayed:0,totalLessons:0};
                const group=groups[groupKey];group.plans++;
                record.plan.scheduled.forEach(function(e){
                    if(!e.lessonId)return;
                    const u=index[LamaSyllabusProgressStore.key(e)];
                    const state=u&&u.status==='completed'?'completed':(u&&u.status==='delayed'||e.date<asOf?'delayed':'pending');
                    totals[state]++;group[state]++;group.totalLessons++;
                });
            });
            const classes=Object.keys(groups).map(function(k){const g=groups[k];g.completionPercent=g.totalLessons?Math.round(g.completed*100/g.totalLessons):0;return g});
            classes.sort(function(a,b){return String(a.classId).localeCompare(String(b.classId))});
            const totalLessons=totals.completed+totals.pending+totals.delayed;
            return {status:'success',report:{sessionId:sessionId,asOf:asOf,plans:plans.length,classes:classes,totals:totals,totalLessons:totalLessons,
                completionPercent:totalLessons?Math.round(totals.completed*100/totalLessons):0}};
        }
        if (action === 'syllabusAdminProgress') {
            if ((params.role || 'school') !== 'school') throw new Error('School administrator session required.');
            if (typeof LamaSyllabusProgressStore === 'undefined' || typeof LamaSyllabusSheetStore === 'undefined' ||
                typeof lamaRequireModuleForVerifiedSchool_ !== 'function') throw new Error('Syllabus progress components unavailable.');
            const actor = requireSchoolAdminWrite(params);
            if (!actor || !actor.id) throw new Error('Verified administrator required.');
            lamaRequireModuleForVerifiedSchool_(params.schoolId, 'examination');
            const school = authorizeSchool(params.schoolId, params.apiKey);
            if (typeof params.planId !== 'string' || !params.planId.trim()) throw new Error('Plan ID required.');
            const record = LamaSyllabusSheetStore.read(school.obj.sheetId, params.schoolId, params.planId);
            if (!record) throw new Error('Plan not found in school.');
            const plan = record.plan;
            if (plan.status !== 'published' && plan.status !== 'archived') throw new Error('Progress is available after publication.');
            const updates = LamaSyllabusProgressStore.list(school.obj.sheetId, params.schoolId, params.planId);
            const indexed = {};
            updates.forEach(function(update) {
                if (indexed[update.key]) throw new Error('Duplicate lesson progress rows');
                indexed[update.key] = update;
            });
            const asOf = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
            const totals = {completed:0,pending:0,delayed:0};
            const lessons = plan.scheduled.filter(function(entry){return !!entry.lessonId}).map(function(entry){
                const key = LamaSyllabusProgressStore.key(entry);
                const update = indexed[key];
                const status = update && update.status === 'completed' ? 'completed' :
                    update && update.status === 'delayed' || entry.date < asOf ? 'delayed' : 'pending';
                totals[status]++;
                return {date:entry.date,slot:entry.slot,chapterId:entry.chapterId||'',lessonId:entry.lessonId,
                    lessonTitle:entry.lessonTitle||'',status:status,completedAt:update&&update.completedAt||null};
            });
            const count=lessons.length;
            return {status:'success',progress:{planId:plan.planId,classId:plan.classId,subjectId:plan.subjectId,
                asOf:asOf,totals:totals,totalLessons:count,completionPercent:count?Math.round(totals.completed*100/count):100,
                lessons:lessons}};
        }
        if (action === 'syllabusReassignProgress') {
            if ((params.role||'school')!=='school')throw new Error('School administrator required.');
            if(typeof LamaSyllabusSheetStore==='undefined'||typeof LamaSyllabusProgressStore==='undefined'||
                typeof lamaRequireModuleForVerifiedSchool_!=='function')throw new Error('Syllabus components unavailable.');
            const actor=requireSchoolAdminWrite(params);
            if(!actor||!actor.id)throw new Error('Verified administrator required.');
            lamaRequireModuleForVerifiedSchool_(params.schoolId,'examination');
            const school=authorizeSchool(params.schoolId,params.apiKey);
            const planId=String(params.planId||''),from=String(params.fromTeacherId||''),to=String(params.toTeacherId||'');
            if(!planId||!from||!to||from===to)throw new Error('Distinct teachers and plan required.');
            const record=LamaSyllabusSheetStore.read(school.obj.sheetId,params.schoolId,planId);
            if(!record||record.plan.status!=='published')throw new Error('Published plan required.');
            const ss=SpreadsheetApp.openById(school.obj.sheetId),teachers=ss.getSheetByName(COLLECTIONS.teachers.tab);
            if(!teachers)throw new Error('Teacher registry missing.');
            const values=teachers.getDataRange().getValues(),headers=values[0];
            const matches=values.slice(1).map(function(row){return rowToRecord(headers,row)})
                .filter(function(t){return String(t.id)===from||String(t.id)===to});
            if(matches.length!==2||!matches.some(function(t){return String(t.id)===from})||
                !matches.some(function(t){return String(t.id)===to}))throw new Error('Both teachers must belong to this school.');
            const source=matches.filter(function(t){return String(t.id)===from})[0];
            const destination=matches.filter(function(t){return String(t.id)===to})[0];
            if(source.status!=='Active'||destination.status!=='Active')throw new Error('Both teachers must be active.');
            if(!lamaSyllabusTeacherScope_(record.plan,destination))throw new Error('Destination teacher is not assigned to this class, subject and section.');
            const result=LamaSyllabusProgressStore.reassign(school.obj.sheetId,params.schoolId,planId,from,to,String(actor.id),String(params.reason||''));
            return {status:'success',result:result};
        }
        if (action === 'syllabusTeacherProgress') {
            if (params.role !== 'teacher') throw new Error('Teacher session required.');
            if (typeof LamaSyllabusProgressStore === 'undefined' ||
                typeof LamaSyllabusSheetStore === 'undefined' ||
                typeof lamaRequireModuleForVerifiedSchool_ !== 'function') throw new Error('Syllabus progress components unavailable.');
            const ctx = authorizeTeacher(params.schoolId, params.teacherId, params.apiKey);
            lamaRequireModuleForVerifiedSchool_(params.schoolId, 'examination');
            if (typeof params.planId !== 'string' || !params.planId.trim()) throw new Error('Plan ID required.');
            const record = LamaSyllabusSheetStore.read(ctx.ss.getId(), params.schoolId, params.planId);
            if (!record || record.plan.status !== 'published') throw new Error('Published plan not found.');
            if (!lamaSyllabusTeacherScope_(record.plan,ctx.teacher))
                throw new Error('Teacher class or subject scope denied.');
            if (params.operation === 'list') return {status:'success',updates:LamaSyllabusProgressStore.list(ctx.ss.getId(),params.schoolId,params.planId)};
            if (params.operation !== 'save') throw new Error('Unsupported progress operation.');
            const saved = LamaSyllabusProgressStore.save(ctx.ss.getId(),params.schoolId,record.plan,
                String(params.teacherId),params.lessonKey,params.progressStatus,params.completedAt);
            return {status:'success',result:saved};
        }
        if (action === 'syllabusCreateDraft') {
            if ((params.role || 'school') !== 'school') throw new Error('Administrator required.');
            if (typeof LamaSyllabusDraft === 'undefined' || typeof LamaSyllabusSheetStore === 'undefined' ||
                typeof lamaRequireModuleForVerifiedSchool_ !== 'function') throw new Error('Syllabus components unavailable.');
            const actor = requireSchoolAdminWrite(params);
            if (!actor || !actor.id) throw new Error('Verified administrator required.');
            lamaRequireModuleForVerifiedSchool_(params.schoolId, 'examination');
            const school = authorizeSchool(params.schoolId, params.apiKey);
            const plan = LamaSyllabusDraft.create(params.schoolId, params.draft);
            const offered = getSchoolClassOptions(params.schoolId, params.apiKey);
            if (!Array.isArray(offered) || !offered.some(function(entry) {
                return normalizeSchoolClass(entry.class) === normalizeSchoolClass(plan.classId) &&
                    String(entry.section||'').trim().toLowerCase() === String(plan.sectionId||'').trim().toLowerCase();
            })) throw new Error('Class is not configured for this school.');
            LamaSyllabusSheetStore.initialize(school.obj.sheetId);
            return {status:'success', result:LamaSyllabusSheetStore.create(school.obj.sheetId, plan, true)};
        }
        if (action === 'syllabusChangeStatus') {
            if ((params.role || 'school') !== 'school') throw new Error('School administrator session required.');
            if (typeof LamaSyllabusSheetStore === 'undefined' ||
                typeof LamaSyllabusSheetStore.transition !== 'function' ||
                typeof LamaSyllabusApproval === 'undefined' ||
                typeof lamaRequireModuleForVerifiedSchool_ !== 'function') throw new Error('Syllabus approval backend not installed.');
            const actor = requireSchoolAdminWrite(params);
            if (!actor || !actor.id) throw new Error('Verified administrator required.');
            lamaRequireModuleForVerifiedSchool_(params.schoolId, 'examination');
            const school = authorizeSchool(params.schoolId, params.apiKey);
            if (typeof params.planId !== 'string' || !params.planId.trim()) throw new Error('Plan ID required.');
            if (!Number.isSafeInteger(params.expectedVersion)) throw new Error('Expected version required.');
            if (['submitted','approved','published','draft','archived'].indexOf(params.to) < 0) throw new Error('Unsupported syllabus status.');
            const changed = LamaSyllabusSheetStore.transition(school.obj.sheetId, params.schoolId, params.planId,
                params.expectedVersion, function(current) {
                    return LamaSyllabusApproval.prepare(current, params.to, params.expectedVersion,
                        actor.id, params.reason, new Date().toISOString());
                });
            return {status:'success', result:changed};
        }
        if (action === 'syllabusListPlans') {
            if (typeof LamaSyllabusSheetStore === 'undefined' || typeof LamaSyllabusSheetStore.list !== 'function') throw new Error('Syllabus discovery adapter not installed.');
            if (typeof lamaRequireModuleForVerifiedSchool_ !== 'function') throw new Error('Module authorization unavailable.');
            if ((params.role || 'school') === 'teacher') {
                const ctx = authorizeTeacher(params.schoolId, params.teacherId, params.apiKey);
                lamaRequireModuleForVerifiedSchool_(ctx.schoolMatch.obj.schoolId, 'examination');
                const plans = LamaSyllabusSheetStore.list(ctx.ss.getId(), ctx.schoolMatch.obj.schoolId, {status:'published'});
                return {status:'success', plans:plans.filter(function(plan) {
                    return lamaSyllabusTeacherScope_(plan,ctx.teacher);
                })};
            }
            if ((params.role || 'school') !== 'school') throw new Error('School administrator session required.');
            const actor = requireSchoolAdminWrite(params);
            if (!actor || !actor.id) throw new Error('Administrator identity unavailable.');
            lamaRequireModuleForVerifiedSchool_(params.schoolId, 'examination');
            const school = authorizeSchool(params.schoolId, params.apiKey);
            return {status:'success', plans:LamaSyllabusSheetStore.list(school.obj.sheetId, params.schoolId, {})};
        }
        if (action === 'syllabusAdminReadPlan') {
            if (typeof LamaSyllabusSheetStore === 'undefined') throw new Error('Syllabus storage adapter not installed.');
            if (typeof lamaRequireModuleForVerifiedSchool_ !== 'function') throw new Error('Server-side module authorization unavailable.');
            if ((params.role || 'school') !== 'school') throw new Error('School administrator session required.');
            const actor = requireSchoolAdminWrite(params);
            if (!actor || !actor.id) throw new Error('Administrator identity unavailable.');
            lamaRequireModuleForVerifiedSchool_(params.schoolId, 'examination');
            const school = authorizeSchool(params.schoolId, params.apiKey);
            if (typeof params.planId !== 'string' || !params.planId.trim()) throw new Error('Plan ID required.');
            const stored = LamaSyllabusSheetStore.read(school.obj.sheetId, params.schoolId, params.planId);
            if (!stored) throw new Error('Syllabus plan not found in this school.');
            return {status:'success', plan:stored.plan, audit:stored.audit};
        }
        if (action === 'syllabusPublishedPlans') {
            if (typeof LamaSyllabusSheetStore === 'undefined') throw new Error('Syllabus storage adapter not installed.');
            if (typeof lamaSchoolHasModuleGrant_ !== 'function') throw new Error('Server-side Examination grant verification unavailable.');
            if (params.role !== 'teacher') throw new Error('Teacher session required.');
            const ctx = authorizeTeacher(params.schoolId, params.teacherId, params.apiKey);
            const allowed = lamaSchoolHasModuleGrant_(params.schoolId, 'examination');
            if (allowed !== true) throw new Error('Examination module is not active for this school.');
            if (!params.planId || typeof params.planId !== 'string') throw new Error('Plan ID required.');
            const record = LamaSyllabusSheetStore.read(ctx.ss.getId(), params.schoolId, params.planId);
            if (!record || record.plan.status !== 'published') throw new Error('Published syllabus plan not found.');
            if (!lamaSyllabusTeacherScope_(record.plan,ctx.teacher)) throw new Error('Class, subject or section scope denied.');
            return {status:'success',plan:record.plan};
        }
        switch (action) {
            case 'communityList': return {status:'success',posts:communityPublic_(params)};
            case 'communityCreate': return {status:'success',post:communityPublic_(params)};
            case 'communityReply': return {status:'success',reply:communityPublic_(params)};
            case 'communityReport': return {status:'success',report:communityPublic_(params)};
            case 'adminCommunityList': return {status:'success',community:communityModerate_(params)};
            case 'adminCommunityModerate': return {status:'success',result:communityModerate_(params)};
            case 'supportList': return {status:'success',tickets:schoolSupport_(params)};
            case 'supportCreate': return {status:'success',ticket:schoolSupport_(params)};
            case 'adminSupportList': return {status:'success',tickets:adminSupport_(params)};
            case 'adminSupportReply': return {status:'success',ticket:adminSupport_(params)};
            case 'waSettings': return {status:'success',settings:waSettings_(params)};
            case 'waConnect': return {status:'success',settings:waConnect_(params)};
            case 'waDisconnect': return {status:'success',settings:waDisconnect_(params)};
            case 'waSendTemplates': return {status:'success',result:waSendTemplates_(params)};
            case 'previewStudentIds':
                return {status:'success',result:manageStudentCodes(params,false)};
            case 'applyStudentIds':
                return {status:'success',result:manageStudentCodes(params,true)};
            case 'importStudentsBatch':
                return {status:'success',result:importStudentsBatch(params)};
            case 'ownerListCampusRecords': return {status:'success',records:ownerCampusRecords_(params,'list')};
            case 'ownerSaveCampusRecord': return {status:'success',record:ownerCampusRecords_(params,'save')};
            case 'ownerListCampuses': return {status:'success',campuses:ownerListCampuses(params)};
            case 'ownerSaveCampus': return {status:'success',campus:ownerSaveCampus(params)};
            case 'ownerListSchoolUsers': return {status:'success',users:ownerListSchoolUsers(params)};
            case 'ownerSaveSchoolUser': return {status:'success',user:ownerSaveSchoolUser(params)};
            case 'adminListSchoolUsers': throw new Error('Use the School Owner dashboard to manage administrators.');
            case 'adminSaveSchoolUser': return {status:'success',user:adminSaveSchoolUser(params)};
            case 'adminGetAudit': return {status:'success',records:adminGetAudit(params)};
            case 'schoolAdminSetup':
                return {status:'success',result:schoolAdminSetup(params)};
            case 'schoolAdminLogin':
                return {status:'success',result:schoolAdminLogin(params)};
            case 'schoolAdminVerify':
                return {status:'success',result:schoolAdminVerify(params)};
            case 'register':
                throw new Error('Direct registration is disabled. Submit a school application for Super Admin approval.');
            case 'requestSchoolRegistration': return {status:'success',result:requestSchoolRegistration_(params)};
            case 'adminApplications': return {status:'success',requests:adminApplications_(params.adminApiKey)};
            case 'reviewSchoolApplication': return {status:'success',result:reviewApplication_(params.adminApiKey,params.requestId,params.decision)};
            case 'activateSchoolApplication': return {status:'success',result:activateSchoolApplication_(params)};
            case 'requestAdministratorRecovery': return {status:'success',result:requestAdministratorRecovery_(params)};
            case 'completeAdministratorRecovery': return {status:'success',result:completeAdministratorRecovery_(params)};
            case 'requestSchoolPasswordRecovery': return {status:'success',result:requestSchoolPasswordRecovery_(params)};
            case 'completeSchoolPasswordRecovery': return {status:'success',result:completeSchoolPasswordRecovery_(params)};
            case 'login':
                return { status: 'success', school: loginSchool(params.email, params.password) };
            case 'getSchoolClassOptions': return {status:'success',classes:getSchoolClassOptions(params.schoolId,params.apiKey)};
            case 'getTeacherManagementBootstrap': return getTeacherManagementBootstrap_(params);
            case 'getSchoolConfig':
                return { status: 'success', school: getSchoolConfig(params.schoolId, params.apiKey) };
            case 'updateSchoolConfig':
                return { status: 'success', school: updateSchoolConfig(params.schoolId, params.apiKey, params.patch || {}) };
            case 'getDashboardStats':
                return { status: 'success', stats: getDashboardStats(params.schoolId, params.apiKey) };
            case 'getMainDashboardData':
                return { status: 'success', data: getMainDashboardData(params) };
            case 'getStudentFeeSummary':
                return { status: 'success', summary: getStudentFeeSummary(params.schoolId, params.apiKey, params.studentId) };
            case 'pingTeacher':
                assertSchoolWritable(params.schoolId);
                const ping=pingTeacher(params.schoolId, params.apiKey, params.teacherId, params.message);
                writeAudit(adminUsers(params.schoolId).ss,params.schoolId,params._auditActor,'add','teacherPings',ping.id,null,ping);
                return {status:'success',ping};
            case 'acknowledgePing':
                assertSchoolWritable(params.schoolId);
                return { status: 'success', ping: acknowledgePing(params.schoolId, params.teacherId, params.apiKey, params.pingId) };

            case 'addTeacher':
                const t=addTeacher(params.schoolId, params.apiKey, params.teacher || {});
                writeAudit(adminUsers(params.schoolId).ss,params.schoolId,params._auditActor,'add','teachers',t.id,null,t);
                return {status:'success',teacher:t};
            case 'teacherLogin':
                return { status: 'success', teacher: teacherLogin(params.schoolId, params.email, params.password) };

            case 'studentLogin':
                return { status: 'success', student: studentLogin(params.schoolId, params.enrlNo, params.password) };

            case 'adminLogin':
                return { status: 'success', admin: adminLogin(params.password) };
            case 'adminSetSubscription':
                return { status: 'success', result: adminSetSubscription(params.adminApiKey, params.schoolId, params.details || {}) };
            case 'adminGetModuleGrant':
                authorizeAdmin(params.adminApiKey);
                if (typeof lamaAdminGetModuleGrant_ !== 'function') throw new Error('Module grant adapter not installed in Apps Script deployment.');
                return {status:'success',grant:lamaAdminGetModuleGrant_(params.adminApiKey,params.schoolId,params.module)};
            case 'adminSetModuleGrant':
                authorizeAdmin(params.adminApiKey);
                if (typeof lamaAdminSetModuleGrant_ !== 'function') throw new Error('Module grant adapter not installed in Apps Script deployment.');
                return {status:'success',result:lamaAdminSetModuleGrant_(params.adminApiKey,params.schoolId,params.module,params.status,params.startsAt||'',params.expiresAt||'')};
            case 'getSubscriptionStatus':
                return { status: 'success', subscription: getSubscriptionStatus(params.schoolId, params.apiKey) };
            case 'adminListSchools':
                return { status: 'success', schools: adminListSchools(params.adminApiKey) };
            case 'adminSetStatus':
                return { status: 'success', result: adminSetStatus(params.adminApiKey, params.schoolId, params.newStatus) };
            case 'adminResetPassword':
                return { status: 'success', result: adminResetPassword(params.adminApiKey, params.schoolId) };

            case 'clearStudentAttendanceDate': return {status:'success',result:clearStudentAttendanceDate_(params)};
            case 'bulkDeleteStudents': return {status:'success',result:bulkDeleteStudents_(params)};
            case 'bulkAttendance':
                assertSchoolWritable(params.schoolId);
                const result=bulkAttendanceRecords(params);
                writeAudit(adminUsers(params.schoolId).ss,params.schoolId,params._auditActor,'bulkAttendance','attendance','',null,{count:Array.isArray(result)?result.length:undefined});
                return {status:'success',result};
            case 'list':
                return { status: 'success', records: listRecords(resolveContext(params), params.collection) };
            case 'get':
                return { status: 'success', record: getRecord(resolveContext(params), params.collection, params.id) };
            case 'add':
                if(params.collection==='teacherAttendance')return {status:'success',record:lamaStaffAttendanceWrite_(params,'add')};
                return { status: 'success', record: addRecord(resolveContext(params), params.collection, params.record || {}) };
            case 'update':
                if(params.collection==='teacherAttendance')return {status:'success',record:lamaStaffAttendanceWrite_(params,'update')};
                return { status: 'success', record: updateRecord(resolveContext(params), params.collection, params.id, params.patch || {}) };
            case 'remove':
                removeRecord(resolveContext(params), params.collection, params.id);
                return { status: 'success' };

            default:
                return { status: 'error', message: 'Unknown action: ' + action };
        }
    } catch (err) {
        return { status: 'error', message: err.message };
    }
}

function doPost(e) {
    let params;
    try {
        params = JSON.parse(e.postData.contents);
    } catch (err) {
        return jsonOut({ status: 'error', message: 'Invalid request body.' });
    }
    return jsonOut(handleRequest(params));
}

function doGet(e) {
    const params = e && e.parameter ? e.parameter : {};
    if (!params.action || params.action === 'health') {
        return jsonOut({ status: 'success', app: 'LamaStudio School Suite', message: 'Backend is running', build: 'admin-subscription-2026-10-25' });
    }
    const blocked=['lessonPlanner','studentHomeworkCompletion','studentHomeworkSetCompletion','homeworkCompletionReport','saveSchoolWorkingWeek','planningSaveBatch','staffAdminDirectory','staffAdminSave','staffSavePolicy','staffLogin','staffOwnAttendance','teacherHomeworkBatch','teacherUpdateStudentProfile','feeLedgerRead','feeLedgerIssue','feeLedgerPay','feeLedgerReverse','requestAdministratorRecovery','completeAdministratorRecovery','requestSchoolPasswordRecovery','completeSchoolPasswordRecovery','syllabusReassignProgress','syllabusSchoolProgress','syllabusAdminProgress','syllabusTeacherProgress','syllabusCreateDraft','syllabusChangeStatus','syllabusListPlans','syllabusAdminReadPlan','syllabusPublishedPlans','bulkDeleteStudents','waConnect','waDisconnect','waSendTemplates','schoolAdminSetup','adminSaveSchoolUser','adminSetSubscription','adminSetStatus','adminResetPassword','register','requestSchoolRegistration','reviewSchoolApplication','activateSchoolApplication','updateSchoolConfig','pingTeacher','acknowledgePing','addTeacher','bulkAttendance','importStudentsBatch','previewStudentIds','applyStudentIds','add','update','remove'];
    if(blocked.indexOf(params.action)!==-1)return jsonOut({status:'error',message:'POST required for this action.'});
    return jsonOut(handleRequest(params));
}




/**
 * Authenticated, duplicate-aware student import.
 * This function is integrated into the existing Master Backend, not a second
 * Apps Script file. The existing deployment URL and spreadsheets are retained.
 */
function importStudentsBatch(params) {
  if(!params||(params.role||'school')!=='school'||!params._auditActor)
    throw new Error('School administrator authorization required.');
  const incoming=params.records;
  if(!Array.isArray(incoming)||!incoming.length||incoming.length>400)
    throw new Error('Submit between 1 and 400 students.');
  const ctx=resolveContext(params);assertSchoolWritable(ctx.schoolId);
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(30000))throw new Error('Import is busy. Please retry.');
  try{
    const info=getCollectionSheet(ctx,'students'),sheet=info.sheet,headers=info.headers;
    const ei=headers.indexOf('enrlNo'),ni=headers.indexOf('name'),fi=headers.indexOf('fatherGuardian'),ci=headers.indexOf('class');
    if([ei,ni,fi].some(x=>x<0))throw new Error('Students sheet is missing required columns.');
    const key=v=>String(v==null?'':v).trim().toUpperCase().replace(/[\s-]/g,'');
    const person=(n,f,c)=>[n,f,c].map(key).join('|');
    const blank=v=>v==null||String(v).trim()==='';
    const original=sheet.getDataRange().getValues(),working=original.map(row=>row.slice()),baseLength=working.length;
    const enrollmentMap=new Map(),personMap=new Map();
    const put=(map,k,i)=>{if(!k)return;const a=map.get(k)||[];if(a.indexOf(i)<0)a.push(i);map.set(k,a)};
    const addIndexes=(row,i)=>{
      put(enrollmentMap,key(row[ei]),i);
      if(key(row[ni])&&key(row[fi]))put(personMap,person(row[ni],row[fi],ci>=0?row[ci]:''),i);
    };
    for(let i=1;i<working.length;i++)addIndexes(working[i],i);
    const protectedFields=new Set(['id','apiKey','password','createdAt','studentCode','portalLoginId']);
    const allowed=headers.filter(h=>!protectedFields.has(h));
    const changed=new Set(),details=[];
    let added=0,updated=0,unchanged=0,skipped=0,rejected=0;
    const now=new Date().toISOString();
    incoming.forEach((input,i)=>{
      const number=i+1;
      if(!input||typeof input!=='object'||Array.isArray(input)){rejected++;details.push({row:number,status:'rejected',reason:'Invalid record'});return}
      const source={...input},name=String(source.name||'').trim(),father=String(source.fatherGuardian||'').trim(),cls=String(source.class||'').trim(),enrl=key(source.enrlNo);
      if(!name||cls.length>40||enrl.length>40){rejected++;details.push({row:number,status:'rejected',reason:'Missing name or invalid class/enrollment'});return}
      const byId=enrl?(enrollmentMap.get(enrl)||[]):[];
      const byPerson=father?(personMap.get(person(name,father,cls))||[]):[];
      let matches=byId.length?byId:byPerson;
      // Enrollment collisions with different people must never overwrite a record.
      if(byId.length===1){
        const row=working[byId[0]];
        if(key(row[ni])!==key(name)||(father&&key(row[fi])&&key(row[fi])!==key(father))){
          matches=byPerson.filter(j=>j!==byId[0]);
          source.enrlNo='';
        }
      }
      if(matches.length>1){skipped++;details.push({row:number,status:'review',reason:'Multiple possible students; manual review required'});return}
      if(matches.length===1){
        const index=matches[0],row=working[index];
        // An enrollment number already owned by someone else is never copied.
        if(source.enrlNo&&key(row[ei])&&key(row[ei])!==key(source.enrlNo))source.enrlNo='';
        let filled=0;
        allowed.forEach(h=>{
          const col=headers.indexOf(h),value=source[h];
          if(col>=0&&!blank(value)&&blank(row[col])){
            if(h==='enrlNo'&&(enrollmentMap.get(key(value))||[]).some(j=>j!==index))return;
            row[col]=value;filled++;
          }
        });
        if(filled){
          if(index<baseLength)changed.add(index);
          updated++;
          // A formerly blank enrollment is now available for subsequent matches.
          addIndexes(row,index);
          details.push({row:number,status:'updated',filled});
        }else{unchanged++;details.push({row:number,status:'unchanged'})}
        return;
      }
      // A duplicate enrollment is kept blank, not assigned to another person.
      if(source.enrlNo&&(enrollmentMap.get(key(source.enrlNo))||[]).length)source.enrlNo='';
      const record={};
      allowed.forEach(h=>{if(!blank(source[h]))record[h]=source[h]});
      record.enrlNo=source.enrlNo||'';
      record.id=genId('stu');record.apiKey=Utilities.getUuid();record.createdAt=now;
      record.password=record.enrlNo||'';
      const prefix=PropertiesService.getScriptProperties().getProperty('STUDENT_CODE_PREFIX_'+ctx.schoolId)||'';
      record.studentCode=record.enrlNo&&prefix?prefix+record.enrlNo:'';
      const row=recordToRow(headers,record),index=working.length;
      working.push(row);addIndexes(row,index);added++;
      details.push({row:number,status:'added',reviewRequired:!record.enrlNo});
    });
    // Write only rows whose blank fields were completed; never rewrite other records.
    const sorted=[...changed].sort((a,b)=>a-b);
    for(const index of sorted)sheet.getRange(index+1,1,1,headers.length).setValues([working[index]]);
    if(added)sheet.getRange(sheet.getLastRow()+1,1,added,headers.length).setValues(working.slice(baseLength));
    SpreadsheetApp.flush();
    writeAudit(ctx.ss,ctx.schoolId,params._auditActor,'import','students','',null,
      {submitted:incoming.length,added,updated,unchanged,skipped,rejected});
    return {success:true,schoolId:ctx.schoolId,total:incoming.length,added,updated,unchanged,skipped,rejected,details};
  }finally{lock.releaseLock()}
}

/**
 * School-admin-controlled display Student ID: PREFIX + original enrollment.
 * The internal immutable id is never changed because attendance, fees and
 * student sessions reference it. Only studentCode is changed.
 * Preview is read-only; apply is an explicit separate authenticated action.
 */
function manageStudentCodes(params, apply) {
    if (!params || (params.role || 'school') !== 'school' || !params._auditActor) {
        throw new Error('School administrator authorization required.');
    }
    const prefix = String(params.prefix == null ? '' : params.prefix).trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9_-]{0,24}-$/.test(prefix)) {
        throw new Error('Prefix must end with a hyphen, e.g. AIMS-STU-.');
    }
    const ctx = resolveContext(params);
    assertSchoolWritable(ctx.schoolId);
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) throw new Error('Student ID update busy; retry.');
    try {
        const info = getCollectionSheet(ctx, 'students');
        const sh=info.sheet, headers=info.headers;
        const idCol=headers.indexOf('studentCode')+1, enrlCol=headers.indexOf('enrlNo')+1;
        if(!idCol||!enrlCol)throw new Error('Student columns missing.');
        const data=sh.getDataRange().getValues(), proposed=[], used=new Set();
        let pending=0,changed=0;
        for(let i=1;i<data.length;i++){
            const original=String(data[i][enrlCol-1] == null ? '' : data[i][enrlCol-1]).trim();
            const code=original ? prefix+original : '';
            if(code && used.has(code))throw new Error('Duplicate enrollment numbers found. Correct duplicates before applying IDs.');
            if(code)used.add(code);else pending++;
            if(String(data[i][idCol-1]||'')!==code)changed++;
            proposed.push({row:i+1,enrollment:original,studentCode:code||'PENDING ENROLLMENT'});
        }
        if(apply){
            if(proposed.length)sh.getRange(2,idCol,proposed.length,1).setValues(proposed.map(x=>[x.studentCode==='PENDING ENROLLMENT'?'':x.studentCode]));
            PropertiesService.getScriptProperties().setProperty('STUDENT_CODE_PREFIX_'+ctx.schoolId,prefix);
            SpreadsheetApp.flush();
            writeAudit(ctx.ss,ctx.schoolId,params._auditActor,'bulkUpdate','students','',null,
                {field:'studentCode',prefix:prefix,count:proposed.length,changed:changed,pending:pending});
        }
        return {success:true,applied:apply,prefix:prefix,total:proposed.length,changed:changed,
            pendingEnrollment:pending,preview:proposed.slice(0,400)};
    }finally{lock.releaseLock();}
}


/** Invitation-only school onboarding. Existing registered schools are not modified. */
const APPLICATION_HEADERS_=['requestId','name','type','level','address','phone','principal','adminEmail','plan','requirements','status','requestedAt','reviewedAt','activatedAt','tokenHash','expiresAt','schoolId','notification','adminUsername','adminDisplayName','adminPasswordHash','adminPasswordSalt','classes','sections','teacherCount','studentCount','institutionType','campusCount','campusDetails','adminCount','logoData','schoolPasswordHash'];
function applicationSheet_(){
  const ss=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('MASTER_SHEET_ID'));
  let sh=ss.getSheetByName('SchoolApplications');
  if(!sh){sh=ss.insertSheet('SchoolApplications');sh.appendRow(APPLICATION_HEADERS_);sh.setFrozenRows(1);}
  ensureSheetHeaders(sh,APPLICATION_HEADERS_);
  return sh;
}
function applicationRows_(){
  const sh=applicationSheet_(),values=sh.getDataRange().getValues(),headers=values[0];
  return {sh,rows:values.slice(1).map((values,i)=>({index:i+2,obj:Object.fromEntries(headers.map((h,j)=>[h,values[j]]))})).filter(x=>x.obj.requestId),headers};
}
function setApplication_(sh,headers,row,patch){
  Object.entries(patch).forEach(([k,v])=>{const col=headers.indexOf(k)+1;if(col>0)sh.getRange(row,col).setValue(v);});
}
function hashInvitation_(token){
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,token).map(b=>('0'+(b&255).toString(16)).slice(-2)).join('');
}
function requestSchoolRegistration_(p){
  const name=String(p.name||'').trim(),email=String(p.adminEmail||'').trim().toLowerCase();
  if(name.length<3||name.length>140||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Valid school name and principal email are required.');
  const adminUsername=String(p.adminUsername||'').trim().toLowerCase(),adminDisplayName=String(p.adminDisplayName||p.principal||'').trim(),adminPassword=String(p.adminPassword||'');
  if(!/^[a-z0-9._-]{3,40}$/.test(adminUsername))throw Error('Admin ID must be 3–40 letters, numbers, dots, underscores or dashes.');
  if(!adminDisplayName||adminDisplayName.length>100)throw Error('Administrator name is required (maximum 100 characters).');
  if(adminPassword.length<12)throw Error('Administrator password must contain at least 12 characters.');
  const schoolPassword=String(p.schoolPassword||'');
  if(schoolPassword.length<12)throw Error('School login password must contain at least 12 characters.');
  if(schoolPassword===adminPassword)throw Error('School login and administrator passwords must be different.');
  const type=['Private','Government'].includes(p.type)?p.type:'Private';
  const level=['Primary','Middle','High','Higher Secondary'].includes(p.level)?p.level:'Primary';
  const plan=['Trial','Monthly','Annual'].includes(p.plan)?p.plan:'Trial';
  const validClasses=['ECCE','Playgroup','Nursery','Prep','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'];
  const classes=Array.isArray(p.classes)?[...new Set(p.classes.map(String))].filter(c=>validClasses.includes(c)):[];
  if(!classes.length)throw Error('Select at least one class.');
  const teacherCount=Number(p.teacherCount),studentCount=p.studentCount===''||p.studentCount==null?'':Number(p.studentCount);
  if(!Number.isInteger(teacherCount)||teacherCount<0||teacherCount>5000)throw Error('Invalid teacher count.');
  if(studentCount!==''&&(!Number.isInteger(studentCount)||studentCount<0||studentCount>100000))throw Error('Invalid student count.');
  const logoData=String(p.logoData||'');
  if(logoData){
    if(!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(logoData)||logoData.length>43000)throw Error('Invalid logo. Upload a JPEG under 30 KB.');
    const bytes=Utilities.base64Decode(logoData.split(',')[1]);
    if(bytes.length>30*1024||bytes.length<100)throw Error('Logo must be no larger than 30 KB.');
  }
  const sections=String(p.sections||'').trim().slice(0,100);
  const institutionType=String(p.institutionType||'School');
  if(!['School','Academy','College','Training Institute','Other Educational Institute'].includes(institutionType))throw Error('Invalid institution type.');
  const campusCount=Number(p.campusCount),adminCount=Number(p.adminCount),campusDetails=String(p.campusDetails||'').trim().slice(0,2000);
  if(!Number.isInteger(campusCount)||campusCount<1||campusCount>100)throw Error('Campus count must be between 1 and 100.');
  if(!campusDetails)throw Error('Enter campus names and locations.');
  if(!Number.isInteger(adminCount)||adminCount<1||adminCount>5)throw Error('Requested administrator accounts must be between 1 and 5.');
  const clean=v=>String(v||'').trim().slice(0,400);
  const lock=LockService.getScriptLock();if(!lock.tryLock(15000))throw Error('Registration is busy. Retry.');
  let requestId;
  try{
    if(findSchoolRow(getRegistrySheet(),r=>String(r.adminEmail).toLowerCase()===email))throw Error('This email already has a school account. Please log in.');
    const a=applicationRows_();
    if(a.rows.some(x=>String(x.obj.adminEmail).toLowerCase()===email&&['Pending Approval','Pending Activation'].includes(x.obj.status)))throw Error('An application with this email is already pending.');
    requestId=Utilities.getUuid();
    const salt=Utilities.getUuid();
    const pending={requestId,name,type,level,address:clean(p.address),phone:clean(p.phone),principal:clean(p.principal),adminEmail:email,plan,requirements:clean(p.requirements),status:'Pending Approval',requestedAt:new Date().toISOString(),adminUsername,adminDisplayName,adminPasswordHash:hashPassword(adminPassword,salt),schoolPasswordHash:hashPassword(schoolPassword,email),adminPasswordSalt:salt,classes:classes.join(', '),sections,teacherCount,studentCount,institutionType,campusCount,campusDetails,adminCount,logoData};
    a.sh.appendRow(a.headers.map(h=>pending[h]===undefined?'':pending[h]));
  }finally{lock.releaseLock();}
  try{
    MailApp.sendEmail({to:PropertiesService.getScriptProperties().getProperty('SUPERADMIN_NOTIFICATION_EMAIL')||'wajidhussainbalouch@gmail.com',subject:'LamaStudio: New school approval request',body:'A school has requested registration.\nSchool: '+name+'\nEmail: '+email+'\nPlan: '+plan+'\nOpen the Super Admin dashboard to approve or reject.\nRequest ID: '+requestId});
  }catch(e){
    const a=applicationRows_(),row=a.rows.find(x=>x.obj.requestId===requestId);
    if(row)setApplication_(a.sh,a.headers,row.index,{notification:'Admin email failed: '+e.message});
  }
  return {requestId,status:'Pending Approval'};
}
function adminApplications_(key){
  authorizeAdmin(key);
  return applicationRows_().rows.map(({obj})=>({requestId:obj.requestId,name:obj.name,type:obj.type,level:obj.level,address:obj.address,phone:obj.phone,principal:obj.principal,adminEmail:obj.adminEmail,plan:obj.plan,requirements:obj.requirements,classes:obj.classes,sections:obj.sections,teacherCount:obj.teacherCount,studentCount:obj.studentCount,institutionType:obj.institutionType,campusCount:obj.campusCount,campusDetails:obj.campusDetails,adminCount:obj.adminCount,status:obj.status,requestedAt:obj.requestedAt,reviewedAt:obj.reviewedAt,activatedAt:obj.activatedAt,schoolId:obj.schoolId,notification:obj.notification}));
}
function saveApplicationLogo_(data,requestId){
  if(!data)return '';
  const encoded=String(data).split(',')[1];
  const bytes=Utilities.base64Decode(encoded);
  if(bytes.length>30*1024)throw Error('Logo exceeds 30 KB.');
  const blob=Utilities.newBlob(bytes,'image/jpeg','school-logo-'+String(requestId).replace(/[^a-zA-Z0-9-]/g,'')+'.jpg');
  const file=getSchoolDatabaseFolder_().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
  return 'https://drive.google.com/uc?export=view&id='+encodeURIComponent(file.getId());
}
function reviewApplication_(key,id,decision){
  authorizeAdmin(key);
  if(!['Approve','Reject'].includes(decision))throw Error('Invalid decision.');
  const lock=LockService.getScriptLock();if(!lock.tryLock(15000))throw Error('Approval is busy.');
  try{
    const a=applicationRows_(),row=a.rows.find(x=>x.obj.requestId===id);
    if(!row||row.obj.status!=='Pending Approval')throw Error('Request is not pending.');
    if(decision==='Reject'){
      setApplication_(a.sh,a.headers,row.index,{status:'Rejected',reviewedAt:new Date().toISOString()});
      return {status:'Rejected'};
    }
    if(findSchoolRow(getRegistrySheet(),r=>String(r.adminEmail).toLowerCase()===String(row.obj.adminEmail).toLowerCase()))throw Error('This school email is already registered.');
    // New registrations already have securely hashed administrator credentials.
    // Legacy pending applications retain the existing email activation flow.
    if(row.obj.adminPasswordHash&&row.obj.adminPasswordSalt&&row.obj.adminUsername){
      const o=row.obj,randomLegacyPassword=Utilities.getUuid()+Utilities.getUuid();
      const logoUrl=saveApplicationLogo_(o.logoData,o.requestId);
      const school=registerSchool({name:o.name,type:o.type,level:o.level,address:o.address,phone:o.phone,principal:o.principal,adminEmail:o.adminEmail,password:randomLegacyPassword,passwordHashOverride:o.schoolPasswordHash||'',logo:logoUrl});
      const users=adminUsers(school.schoolId),now=new Date().toISOString();
      const admin={id:genId('adm'),username:String(o.adminUsername).toLowerCase(),displayName:String(o.adminDisplayName),passwordHash:String(o.adminPasswordHash),salt:String(o.adminPasswordSalt),status:'Active',version:1,createdAt:now,updatedAt:now};
      users.sh.appendRow(recordToRow(users.headers,admin));
      setApplication_(a.sh,a.headers,row.index,{status:'Active',reviewedAt:now,activatedAt:now,schoolId:school.schoolId,adminPasswordHash:'',adminPasswordSalt:'',schoolPasswordHash:'',logoData:'',notification:'School and administrator activated'});
      try{MailApp.sendEmail({to:o.adminEmail,subject:'LamaStudio School Suite: Account approved',body:'Your school account is active. Sign in using your School ID '+school.schoolId+' and the administrator ID and password you chose during registration. Never share your password.'});}catch(emailError){setApplication_(a.sh,a.headers,row.index,{notification:'Activated; approval email failed: '+emailError.message});}
      return {status:'Active',schoolId:school.schoolId};
    }
    const token=Utilities.getUuid()+Utilities.getUuid();
    const hash=hashInvitation_(token),expires=new Date(Date.now()+48*3600000).toISOString();
    const url='https://www.lamastudio.pk/lamastudio-school-suite/activate-school.html?requestId='+encodeURIComponent(id)+'&token='+encodeURIComponent(token);
    // Email first. A failed email leaves the request pending, without an unusable approval.
    MailApp.sendEmail({to:row.obj.adminEmail,subject:'Activate your LamaStudio School Suite account',body:'Your school registration has been approved. Open this private link within 48 hours to set your own administrator password:\n'+url+'\n\nDo not share this link. If you did not apply, ignore this message.'});
    setApplication_(a.sh,a.headers,row.index,{status:'Pending Activation',reviewedAt:new Date().toISOString(),tokenHash:hash,expiresAt:expires,notification:'Activation email sent'});
    return {status:'Pending Activation'};
  }finally{lock.releaseLock();}
}
function activateSchoolApplication_(p){
  const token=String(p.token||''),id=String(p.requestId||''),password=String(p.password||'');
  if(token.length<50||password.length<12)throw Error('Activation token or password invalid. Use a password of at least 12 characters.');
  const lock=LockService.getScriptLock();if(!lock.tryLock(30000))throw Error('Activation is busy.');
  try{
    const a=applicationRows_(),row=a.rows.find(x=>x.obj.requestId===id);
    if(!row||row.obj.status!=='Pending Activation'||new Date(row.obj.expiresAt).getTime()<Date.now()||row.obj.tokenHash!==hashInvitation_(token))throw Error('Activation link invalid, expired, or already used. Contact LamaStudio.');
    const o=row.obj;
    if(findSchoolRow(getRegistrySheet(),r=>String(r.adminEmail).toLowerCase()===String(o.adminEmail).toLowerCase()))throw Error('School account already exists. Please log in.');
    const school=registerSchool({name:o.name,type:o.type,level:o.level,address:o.address,phone:o.phone,principal:o.principal,adminEmail:o.adminEmail,password});
    setApplication_(a.sh,a.headers,row.index,{status:'Active',activatedAt:new Date().toISOString(),schoolId:school.schoolId,tokenHash:'',expiresAt:''});
    return {schoolId:school.schoolId,status:'Active'};
  }finally{lock.releaseLock();}
}


/* FEE LEDGER V1 — isolated, append-only journal. No generic CRUD access.
 * Every operation is one row containing its complete balanced event.
 * Enable only on a reconciled pilot school via Script Properties:
 * LAMA_FEE_LEDGER_PILOT_<schoolId> = true
 */
const LAMA_FEE_JOURNAL_HEADERS_=['eventId','payload'];
const LAMA_FEE_JOURNAL_TAB_='FeeLedgerJournalV1';
function lamaFeeFail_(msg){throw Error(msg);}
function lamaFeeText_(v,max){if(typeof v!=='string'||!v.trim()||v.trim().length>max)lamaFeeFail_('Invalid text field.');return v.trim();}
function lamaFeeToken_(v){if(typeof v!=='string'||!/^[A-Za-z0-9_-]{12,100}$/.test(v))lamaFeeFail_('A stable request ID is required.');return v;}
function lamaFeePaisa_(v){if(!Number.isSafeInteger(v)||v<=0||v>1000000000)lamaFeeFail_('Amount must be a positive integer in paisa.');return v;}
function lamaFeeDate_(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)lamaFeeFail_('Valid date required.');return v;}
function lamaFeeMonth_(v){if(typeof v!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(v))lamaFeeFail_('Valid billing month required.');return v;}
function lamaFeeKey_(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ');}
function lamaFeeClassKey_(v){return String(v||'').trim().toLowerCase().replace(/^(class|grade|standard|std)[\s._-]+(?=\d)/,'').replace(/^0+(?=\d)/,'').replace(/\s+/g,'');}
function lamaFeeTuition_(v){return ['tuitionfee','monthlyfee','schoolfee','tuition'].indexOf(lamaFeeKey_(v).replace(/\s+/g,''))!==-1;}
function lamaFeePrivate_(s){return lamaFeeKey_(s.type)==='private'&&lamaFeeKey_(s.privateSub)==='standard private';}
function lamaFeeArray_(v){let a=JSON.parse(v||'[]');if(!Array.isArray(a))lamaFeeFail_('Invalid school fee configuration.');return a;}
function lamaFeePolicyStamp_(s){return JSON.stringify([s.type||'',s.privateSub||'',s.offeredClassesJson||'',s.feeCategoriesJson||'']);}
function lamaFeeState_(){return {events:new Map(),demands:new Map(),keys:new Set(),receipts:new Map(),reversed:new Set(),paid:new Map()};}
function lamaFeeApply_(state,e,schoolId){
 if(!e||e.version!==1||e.schoolId!==schoolId||!e.actorId||!e.at||typeof e.fingerprint!=='string'||state.events.has(e.id))lamaFeeFail_('Invalid or duplicate fee journal event. Reconciliation required.');
 lamaFeeToken_(e.id);
 if(e.type==='issue'){
  if(!Array.isArray(e.demands)||e.demands.length>50||(!e.demands.length&&(!Array.isArray(e.skipped)||!e.skipped.length)))lamaFeeFail_('Invalid issue event.');
  const ids=new Set(),keys=new Set();
  for(const d of e.demands){
   lamaFeePaisa_(d.amountPaisa);lamaFeeDate_(d.dueDate);lamaFeeMonth_(d.month);
   if(!d.id||!d.key||!d.studentId||!d.category||ids.has(d.id)||keys.has(d.key)||state.demands.has(d.id)||state.keys.has(d.key))lamaFeeFail_('Duplicate or invalid demand.');
   ids.add(d.id);keys.add(d.key);
  }
  for(const d of e.demands){state.demands.set(d.id,d);state.keys.add(d.key);state.paid.set(d.id,0);}
 }else if(e.type==='payment'){
  lamaFeePaisa_(e.amountPaisa);
  if(!e.studentId||!Array.isArray(e.allocations)||!e.allocations.length||e.allocations.length>50)lamaFeeFail_('Invalid receipt.');
  const seen=new Set();let total=0;
  for(const a of e.allocations){
   const d=state.demands.get(a.demandId);lamaFeePaisa_(a.amountPaisa);
   if(!d||d.studentId!==e.studentId||seen.has(a.demandId)||a.amountPaisa>d.amountPaisa-state.paid.get(d.id))lamaFeeFail_('Payment exceeds outstanding balance or has an invalid allocation.');
   seen.add(a.demandId);total+=a.amountPaisa;
  }
  if(total!==e.amountPaisa)lamaFeeFail_('Receipt and allocations must balance exactly.');
  for(const a of e.allocations)state.paid.set(a.demandId,state.paid.get(a.demandId)+a.amountPaisa);
  state.receipts.set(e.id,e);
 }else if(e.type==='reverse'){
  const receipt=state.receipts.get(e.receiptId);
  if(!receipt||state.reversed.has(e.receiptId)||!e.reason)lamaFeeFail_('Receipt unavailable or already reversed.');
  for(const a of receipt.allocations)if(state.paid.get(a.demandId)<a.amountPaisa)lamaFeeFail_('Inconsistent payment journal.');
  for(const a of receipt.allocations)state.paid.set(a.demandId,state.paid.get(a.demandId)-a.amountPaisa);
  state.reversed.add(e.receiptId);
 }else lamaFeeFail_('Unknown fee event.');
 state.events.set(e.id,e);return e;
}
function lamaFeeReplay_(events,schoolId){const state=lamaFeeState_();for(const e of events)lamaFeeApply_(state,e,schoolId);return state;}
function lamaFeeReport_(state,asOf){
 const demands=Array.from(state.demands.values()).map(d=>{const paidPaisa=state.paid.get(d.id),balancePaisa=d.amountPaisa-paidPaisa;return Object.assign({},d,{paidPaisa,balancePaisa,status:balancePaisa===0?'Paid':paidPaisa?'Partial':'Unpaid',overdue:balancePaisa>0&&d.dueDate<asOf});});
 return {demands,receipts:Array.from(state.receipts.values()).map(r=>({id:r.id,studentId:r.studentId,amountPaisa:r.amountPaisa,method:r.method,at:r.at,actorId:r.actorId,allocations:r.allocations,reversed:state.reversed.has(r.id)})),totals:demands.reduce((o,d)=>({billedPaisa:o.billedPaisa+d.amountPaisa,paidPaisa:o.paidPaisa+d.paidPaisa,balancePaisa:o.balancePaisa+d.balancePaisa}),{billedPaisa:0,paidPaisa:0,balancePaisa:0})};
}
function lamaFeeIssueRows_(school,students,request,state,now){
 if(!lamaFeePrivate_(school))lamaFeeFail_('Issued private-school vouchers are disabled for this school type.');
 if(request.policyStamp!==lamaFeePolicyStamp_(school))lamaFeeFail_('Fee policy changed. Reload and review the current class rates.');
 const month=lamaFeeMonth_(request.month),dueDate=lamaFeeDate_(request.dueDate);
 const studentIds=request.studentIds,categoryNames=request.categoryNames;
 if(!Array.isArray(studentIds)||!studentIds.length||studentIds.length>50||new Set(studentIds).size!==studentIds.length||studentIds.some(id=>typeof id!=='string'||!id))lamaFeeFail_('Select 1–50 unique students.');
 if(!Array.isArray(categoryNames)||!categoryNames.length||categoryNames.length>12||categoryNames.some(n=>typeof n!=='string'||!n.trim()))lamaFeeFail_('Select fee categories.');
 const names=categoryNames.map(lamaFeeKey_);if(new Set(names).size!==names.length)lamaFeeFail_('Duplicate category.');
 const categories=lamaFeeArray_(school.feeCategoriesJson).filter(c=>c.enabled===true&&names.indexOf(lamaFeeKey_(c.name))!==-1);
 if(categories.length!==names.length)lamaFeeFail_('Fee category unavailable.');
 const classes=new Set(lamaFeeArray_(school.offeredClassesJson).map(c=>lamaFeeClassKey_(c.name)));
 const byId=new Map(students.map(s=>[String(s.id),s])),newDemands=[],skipped=[];
 for(const c of categories){if(Array.from(state.demands.values()).some(d=>lamaFeeKey_(d.category)===lamaFeeKey_(c.name)&&d.cadence!==c.cadence))lamaFeeFail_('Billing frequency changed for an issued category. Reconciliation required before issuing again.');}
 const keys=new Set(state.keys);
 for(const id of studentIds){
  const st=byId.get(id);if(!st||!classes.has(lamaFeeClassKey_(st.class)))lamaFeeFail_('Student is not in a configured school class.');
  for(const cat of categories){
   const cadence=cat.cadence;if(['monthly','one-time','as-needed'].indexOf(cadence)===-1)lamaFeeFail_('Set category frequency in School Settings first.');
   const rates=(Array.isArray(cat.rates)?cat.rates:[]).filter(r=>lamaFeeClassKey_(r.className)===lamaFeeClassKey_(st.class));
   if(rates.length!==1||typeof rates[0].amount!=='number'||!Number.isFinite(rates[0].amount)||rates[0].amount<0||Math.abs(rates[0].amount*100-Math.round(rates[0].amount*100))>1e-6)lamaFeeFail_('Missing or invalid class rate for '+cat.name+'.');
   const amount=Math.round(rates[0].amount*100);if(!amount){skipped.push({studentId:id,category:cat.name,reason:'zero-rate'});continue;}lamaFeePaisa_(amount);
   const period=cadence==='monthly'?'month:'+month:cadence==='one-time'?'once':'event:'+lamaFeeKey_(lamaFeeText_(request.eventRef,80));
   const key=JSON.stringify([id,lamaFeeKey_(cat.name),period]);
   if(keys.has(key)){skipped.push({studentId:id,category:cat.name,reason:'existing-demand'});continue;}
   keys.add(key);
   newDemands.push({id:genId('fd'),key,studentId:id,studentName:String(st.name||'').slice(0,150),enrollment:String(st.enrlNo||'').slice(0,80),className:String(st.class||''),section:String(st.section||''),category:cat.name,cadence,period,month,dueDate,amountPaisa:amount,issuedAt:now});
  }
 }
 if(newDemands.length>50)lamaFeeFail_('Limit each issue batch to 50 fee items.');
 return {demands:newDemands,skipped};
}
function lamaFeeAction_(p){
 if((p.role||'school')!=='school')lamaFeeFail_('Verified school administrator required.');
 const actor=verifySchoolAdminToken(p),school=authorizeSchool(p.schoolId,p.apiKey).obj,schoolId=String(school.schoolId);
 const pilot=PropertiesService.getScriptProperties().getProperty('LAMA_FEE_LEDGER_PILOT_'+schoolId)==='true';
 if(!pilot)lamaFeeFail_('Fee ledger pilot is not enabled for this school. Existing finance records are unchanged.');
 const read=p.action==='feeLedgerRead';if(!read)assertSchoolWritable(schoolId);
 const lock=LockService.getScriptLock();if(!lock.tryLock(20000))lamaFeeFail_('Fee journal is busy. Retry using the same request ID.');
 try{
  // Re-authorize after acquiring the lock. Keep original legacy Fees tab isolated.
  const verifiedActor=verifySchoolAdminToken(p),fresh=authorizeSchool(schoolId,p.apiKey).obj;
  if(verifiedActor.id!==actor.id)lamaFeeFail_('Administrator changed.');
  if(!read)assertSchoolWritable(schoolId);
  if(PropertiesService.getScriptProperties().getProperty('LAMA_FEE_LEDGER_PILOT_'+schoolId)!=='true')lamaFeeFail_('Fee ledger pilot is disabled.');
  const ss=SpreadsheetApp.openById(fresh.sheetId);
  let sheet=ss.getSheetByName(LAMA_FEE_JOURNAL_TAB_);
  let events=[];
  if(sheet){
   const rows=sheet.getDataRange().getValues();
   if(JSON.stringify(rows[0])!==JSON.stringify(LAMA_FEE_JOURNAL_HEADERS_))lamaFeeFail_('Unexpected fee journal headers. Reconciliation required.');
   events=rows.slice(1).map(row=>{const e=JSON.parse(row[1]);if(row[0]!==e.id)lamaFeeFail_('Journal ID mismatch.');return e;});
  }
  const state=lamaFeeReplay_(events,schoolId),today=Utilities.formatDate(new Date(),'Asia/Karachi','yyyy-MM-dd');
  if(read)return {version:1,schoolId,policyStamp:lamaFeePolicyStamp_(fresh),privateVouchers:lamaFeePrivate_(fresh),writable:!subscriptionView(fresh).readOnly,report:lamaFeeReport_(state,today)};
  const id=lamaFeeToken_(p.requestId),request=p.request;
  if(!request||typeof request!=='object'||Array.isArray(request))lamaFeeFail_('Request details required.');
  const fingerprint=JSON.stringify([p.action,request]);if(fingerprint.length>12000)lamaFeeFail_('Request is too large.');
  const previous=state.events.get(id);
  if(previous){if(previous.fingerprint!==fingerprint)lamaFeeFail_('Request ID was already used for different details.');return {replayed:true,event:previous,report:lamaFeeReport_(state,today)};}
  const now=new Date().toISOString();
  const e={version:1,id,schoolId,actorId:actor.id,actorName:String(actor.name||''),at:now,fingerprint};
  if(p.action==='feeLedgerIssue'){
   const ctx={role:'school',schoolId,ss},students=listRecords(ctx,'students');
   const batch=lamaFeeIssueRows_(fresh,students,request,state,now);
   Object.assign(e,{type:'issue',demands:batch.demands,skipped:batch.skipped});
  }else if(p.action==='feeLedgerPay'){
   // Existing demands can still be settled after a school type/rate change.
   Object.assign(e,{type:'payment',studentId:lamaFeeText_(request.studentId,150),amountPaisa:lamaFeePaisa_(request.amountPaisa),method:lamaFeeText_(request.method,40),allocations:Array.isArray(request.allocations)?request.allocations.map(a=>({demandId:lamaFeeText_(a.demandId,150),amountPaisa:lamaFeePaisa_(a.amountPaisa)})):null});
   if(['Cash','Bank','Online','Other'].indexOf(e.method)===-1)lamaFeeFail_('Choose a valid payment method.');
  }else if(p.action==='feeLedgerReverse'){
   Object.assign(e,{type:'reverse',receiptId:lamaFeeToken_(request.receiptId),reason:lamaFeeText_(request.reason,300)});
  }else lamaFeeFail_('Unknown fee ledger action.');
  lamaFeeApply_(state,e,schoolId);
  const payload=JSON.stringify(e);if(payload.length>45000)lamaFeeFail_('Journal event is too large. Use a smaller batch.');
  if(!sheet){sheet=ss.insertSheet(LAMA_FEE_JOURNAL_TAB_);sheet.appendRow(LAMA_FEE_JOURNAL_HEADERS_);sheet.setFrozenRows(1);}
  // One append stores allocations and receipt together. Uncertain network outcomes
  // must be retried with the exact request ID; never issue a new payment ID on retry.
  sheet.appendRow([e.id,payload]);SpreadsheetApp.flush();
  return {replayed:false,event:e,report:lamaFeeReport_(state,today)};
 }finally{lock.releaseLock();}
}

/* Teacher diary and student profile: existing school spreadsheet, verified teacher session.
 * Profile fields are explicitly allowed, checked against a fresh snapshot and audited.
 * Homework is one batch of subject rows written under the script lock.
 */
const LAMA_TEACHER_PROFILE_FIELDS_={fatherGuardian:150,contact:40,whatsapp:40,address:500,guardianName:150,guardianRelation:80,guardianCell:40,teacherRemarks:1000,photo:45000,dob:10,gender:12,profession:100,guardianProfession:100,guardianAddress:500,distanceFromSchool:60,canRead:12,canWrite:12,canCount:12};
const LAMA_TEACHER_PROFILE_ALIASES_={photo:['photoUrl','studentPhoto','photoURL'],fatherGuardian:['fatherName','father','father_name'],dob:['dateOfBirth','birthDate'],contact:['phone','mobile','contactNo'],whatsapp:['whatsappNo'],address:['homeAddress']};
function lamaTeacherProfileExisting_(record,key){
 const keys=[key].concat(LAMA_TEACHER_PROFILE_ALIASES_[key]||[]);
 for(const k of keys){const v=record[k];if(v!==null&&v!==undefined&&String(v).trim()!=='')return String(v);}
 return '';
}
function lamaTeacherOwnsHomework_(ctx,record){return record.teacherId?String(record.teacherId)===String(ctx.teacher.id):!!record.assignedBy&&String(record.assignedBy).trim().toLowerCase()===String(ctx.teacher.name||'').trim().toLowerCase();}
function lamaTeacherStudentSafe_(record){
 const safe=Object.assign({},record);
 for(const name of Object.keys(safe))if(/password|api.?key|token|salt|secret|cnic|monthlyIncome/i.test(name))delete safe[name];
 return safe;
}
function lamaTeacherContext_(params){
 if((params.role||'')!=='teacher')throw Error('Teacher login required.');
 const ctx=resolveContext(params);
 if(!String(ctx.teacher.assignedClass||'').trim())throw Error('No assigned class. Ask School Admin.');
 assertSchoolWritable(ctx.schoolId);
 return ctx;
}
function lamaTeacherText_(value,max,required){
 if(typeof value!=='string'||value.length>max||/^\s*=/.test(value))throw Error('Invalid text or formula-like value.');
 const v=value.trim();if(required&&!v)throw Error('Required field is empty.');return v;
}
function lamaTeacherProfilePatch_(patch,expected,existing){
 if(!patch||typeof patch!=='object'||Array.isArray(patch)||!expected||typeof expected!=='object'||Array.isArray(expected))throw Error('Invalid profile update.');
 const fields=Object.keys(patch);
 if(!fields.length||fields.some(k=>!Object.prototype.hasOwnProperty.call(LAMA_TEACHER_PROFILE_FIELDS_,k)||!Object.prototype.hasOwnProperty.call(expected,k)))throw Error('Only permitted missing profile fields and teacher remarks may be edited.');
 const out={};
 for(const k of fields){
  const previous=lamaTeacherProfileExisting_(existing,k);
  if(previous!==String(expected[k]??''))throw Error('Student record changed. Reload before editing.');
  if(k!=='teacherRemarks'&&previous.trim()!=='')throw Error('This field already has a saved value. Ask School Admin to correct it.');
  const val=lamaTeacherText_(patch[k],LAMA_TEACHER_PROFILE_FIELDS_[k],k!=='teacherRemarks');
  if(['contact','whatsapp','guardianCell'].includes(k)&&val&&!/^[0-9+ ()-]{3,40}$/.test(val))throw Error('Invalid contact number.');
  if(k==='photo'&&!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(val))throw Error('Upload a compressed JPEG student photo.');
  if(k==='dob'){const d=new Date(val+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(val)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==val||val>Utilities.formatDate(new Date(),'Asia/Karachi','yyyy-MM-dd'))throw Error('Invalid date of birth.');}
  if(k==='gender'&&!['Male','Female','Other'].includes(val))throw Error('Invalid gender.');
  if(['canRead','canWrite','canCount'].includes(k)&&!['Yes','No'].includes(val))throw Error('Choose Yes or No.');
  out[k]=val;
 }
 return out;
}
function lamaTeacherUpdateStudentProfile_(p){
 if(typeof p.studentId!=='string'||!p.studentId.trim())throw Error('Student ID required.');
 const lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw Error('Student register is busy. Retry.');
 try{
  const ctx=lamaTeacherContext_(p),info=getCollectionSheet(ctx,'students'),rows=info.sheet.getDataRange().getValues();
  const idCol=info.headers.indexOf('id'),matches=[];
  for(let i=1;i<rows.length;i++)if(String(rows[i][idCol])===p.studentId)matches.push(i);
  if(matches.length!==1)throw Error('Student not found or duplicate record. Ask School Admin.');
  const i=matches[0],old=rowToRecord(info.headers,rows[i]);
  if(!teacherOwns(ctx,old))throw Error('Student outside assigned class/section.');
  const patch=lamaTeacherProfilePatch_(p.patch,p.expected,old),updated=Object.assign({},old,patch);
  // Limit changes to the requested cells, not the full official identity row.
  for(const k of Object.keys(patch)){const col=info.headers.indexOf(k);if(col<0)throw Error('Student field unavailable.');}
  // Preserve a before/after audit for permitted fields; no credentials in the audit.
  const before={},after={};for(const k of Object.keys(patch)){before[k]=k==='photo'?(old[k]?'Photo present':'No photo'):(old[k]??'');after[k]=k==='photo'?'Student photo added':patch[k];}
  writeAudit(ctx.ss,ctx.schoolId,ctx.auditActor,'teacherProfileUpdateAttempt','students',p.studentId,before,after);
  for(const k of Object.keys(patch)){const col=info.headers.indexOf(k);const cell=info.sheet.getRange(i+1,col+1,1,1);cell.setNumberFormat('@');cell.setValue(patch[k]);}
  SpreadsheetApp.flush();
  const verified=rowToRecord(info.headers,info.sheet.getRange(i+1,1,1,info.headers.length).getValues()[0]);
  if(Object.keys(patch).some(k=>String(verified[k]??'')!==patch[k]))throw Error('Profile could not be fully verified. Reload record before retry.');
  writeAudit(ctx.ss,ctx.schoolId,ctx.auditActor,'teacherProfileUpdateVerified','students',p.studentId,before,after);
  return lamaTeacherStudentSafe_(verified);
 }finally{lock.releaseLock();}
}
function lamaTeacherSubjectKey_(x){
 const n=String(x??'').trim().toLowerCase().replace(/\s+/g,' ');
 const aliases={'math':'mathematics','maths':'mathematics','islamiyat':'islamiat','islamic studies':'islamiat','social studies (sst)':'social studies','sst':'social studies','nazra-e-quran':'nazra quran','nazra':'nazra quran','quran reading':'nazra quran','gk':'general knowledge','english language':'english','urdu language':'urdu'};
 return Object.prototype.hasOwnProperty.call(aliases,n)?aliases[n]:n;
}
function lamaTeacherCurriculum_(ctx){
 const info=getCollectionSheet(ctx,'resources'),rows=info.sheet.getDataRange().getValues().slice(1).map(r=>rowToRecord(info.headers,r));
 const found=rows.filter(r=>String(r.category||'').toLowerCase()==='school-curriculum'&&String(r.title||'')==='LAMA School Class Subjects');
 if(found.length!==1)throw Error('School curriculum missing or duplicated. Ask School Admin to save class subjects.');
 const doc=JSON.parse(found[0].description||'{}');
 if(doc.version!==1||String(doc.schoolId)!==String(ctx.schoolId)||!Array.isArray(doc.classes))throw Error('Invalid school curriculum.');
 const cls=doc.classes.find(c=>sameClass(c.name,ctx.teacher.assignedClass));
 if(!cls||!Array.isArray(cls.subjects)||!cls.subjects.length)throw Error('No subjects configured for this class.');
 return cls;
}
function lamaTeacherHomeworkEntries_(entries,cls){
 if(!Array.isArray(entries)||!entries.length||entries.length>30)throw Error('Enter homework for 1–30 subjects.');
 const seen=new Set(),out=[];
 for(const item of entries){
  if(!item||typeof item!=='object')throw Error('Invalid homework entry.');
  const subject=cls.subjects.find(v=>String(v).trim()===String(item.subject||'').trim());
  if(!subject)throw Error('Select a subject saved by School Admin.');
  const key=lamaTeacherSubjectKey_(subject);if(seen.has(key))throw Error('Repeated subject.');seen.add(key);
  const description=lamaTeacherText_(item.description||'',3000,false),title=lamaTeacherText_(item.title||'',160,false)||subject+' Homework';
  if(!description&&!String(item.title||'').trim())throw Error('Enter homework instructions or a title.');
  const dueDate=String(item.dueDate||'');
  if(dueDate)lamaFeeDate_(dueDate);
  out.push({subject,title,description,dueDate});
 }
 return out;
}
function lamaTeacherHomeworkBatch_(p){
 const batchId=lamaFeeToken_(p.batchId);
 const lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw Error('Homework register is busy. Retry using the same batch.');
 try{
  const ctx=lamaTeacherContext_(p);
  if(!Array.isArray(p.entries)||p.entries.length>30||JSON.stringify(p.entries).length>105000)throw Error('Invalid homework batch.');
  const hash=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify([p.day,p.entries])).map(b=>(b<0?b+256:b).toString(16).padStart(2,'0')).join('');
  const info=getCollectionSheet(ctx,'homework'),rows=info.sheet.getDataRange().getValues().slice(1).map(r=>rowToRecord(info.headers,r));
  const sameBatch=rows.filter(r=>String(r.batchId||'')===batchId);
  if(sameBatch.length){
   if(sameBatch.some(r=>String(r.teacherId)!==String(ctx.teacher.id)||r.batchHash!==hash||!teacherOwns(ctx,r)))throw Error('Batch identifier was used for different homework.');
   return {records:sameBatch,skipped:p.entries.filter(e=>!sameBatch.some(r=>r.subject===e.subject)).map(e=>e.subject),replayed:true};
  }
  const cls=lamaTeacherCurriculum_(ctx),entries=lamaTeacherHomeworkEntries_(p.entries,cls);
  const day=Utilities.formatDate(new Date(),'Asia/Karachi','yyyy-MM-dd');
  if(p.day!==day)throw Error('The posting date changed. Reload the daily diary before saving.');
  const today=rows.filter(r=>teacherOwns(ctx,r)&&r.id&&r.createdAt&&Number.isFinite(new Date(r.createdAt).getTime())&&Utilities.formatDate(new Date(r.createdAt),'Asia/Karachi','yyyy-MM-dd')===day);
  const selected=[],skipped=[];
  for(const entry of entries){
   const aliasKeys=new Set([entry.subject,...(Array.isArray(cls.aliases?.[entry.subject])?cls.aliases[entry.subject]:[])].map(lamaTeacherSubjectKey_));
   if(today.some(r=>aliasKeys.has(lamaTeacherSubjectKey_(r.subject)))){skipped.push(entry.subject);continue;}
   selected.push(Object.assign({},entry,{id:genId('hom'),class:ctx.teacher.assignedClass,section:ctx.teacher.assignedSection||'',teacherId:ctx.teacher.id,assignedBy:ctx.teacher.name,createdAt:new Date().toISOString(),batchId,batchHash:hash}));
  }
  if(selected.length){
   const start=info.sheet.getLastRow()+1,needed=start+selected.length-1-info.sheet.getMaxRows();
   if(needed>0)info.sheet.insertRowsAfter(info.sheet.getMaxRows(),needed);
   info.sheet.getRange(start,1,selected.length,info.headers.length).setValues(selected.map(r=>recordToRow(info.headers,r)));
   SpreadsheetApp.flush();
   const actual=info.sheet.getDataRange().getValues().slice(1).map(r=>rowToRecord(info.headers,r)).filter(r=>r.batchId===batchId);
   if(actual.length!==selected.length||selected.some(s=>!actual.some(r=>r.id===s.id&&r.subject===s.subject&&r.batchHash===hash)))throw Error('Homework batch not verified. Retry same batch.');
   return {records:actual,skipped,replayed:false};
  }
  return {records:[],skipped,replayed:false};
 }finally{lock.releaseLock();}
}

// ==== Staff attendance and non-teaching employee accounts, November 2026 ====
function lamaStaffRows_(ctx,collection){
 const info=getCollectionSheet(ctx,collection),data=info.sheet.getDataRange().getValues();
 return {info:info,items:data.slice(1).map(function(r,i){return {row:i+2,record:rowToRecord(info.headers,r)}}).filter(function(x){return !!x.record.id})};
}
function lamaStaffSafe_(r){return {id:r.id,name:r.name,loginId:r.loginId,designation:r.designation,contact:r.contact,joiningDate:r.joiningDate,status:r.status,staffType:'nonTeaching'}}
function lamaStaffDate_(v){
 if(v instanceof Date&&!isNaN(v.getTime()))return Utilities.formatDate(v,'Asia/Karachi','yyyy-MM-dd');
 const x=String(v||'').trim();
 if(/^\d{4}-\d{2}-\d{2}$/.test(x)&&!isNaN(Date.parse(x+'T00:00:00Z'))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x)return x;
 if(/^\d{4}-\d{2}-\d{2}T/.test(x)&&!isNaN(Date.parse(x)))return Utilities.formatDate(new Date(x),'Asia/Karachi','yyyy-MM-dd');
 const m=x.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);return m?lamaStaffDate_(m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0')):'';
}
function lamaStaffPolicy_(ctx){
 const list=lamaStaffRows_(ctx,'staffAttendancePolicy').items;
 const entry=list.find(function(x){return x.record.id==='staff-attendance-policy'}),p=entry&&entry.record.policy;
 return p&&typeof p==='object'?p:null;
}
function lamaStaffValidatePolicy_(p){
 if(!p||typeof p!=='object')throw Error('Attendance policy required.');
 const limit=p.casualLimit;
 if(typeof limit!=='number'||!Number.isInteger(limit)||limit<0||limit>31)throw Error('Casual leave limit must be 0 to 31 days per month.');
 if(p.weeklyOff!==null&&(!Array.isArray(p.weeklyOff)||p.weeklyOff.some(function(d){return !Number.isInteger(d)||d<0||d>6})))throw Error('Choose valid weekly off-days or use the academic timetable.');
 const holidays=p.holidays||{};
 if(typeof holidays!=='object'||Array.isArray(holidays)||Object.keys(holidays).length>500)throw Error('Invalid custom holidays.');
 const clean={};
 Object.keys(holidays).forEach(function(d){if(lamaStaffDate_(d)!==d)throw Error('Invalid holiday date.');const label=String(holidays[d]||'').trim();if(!label||label.length>100)throw Error('Holiday name required (100 characters maximum).');clean[d]=label});
 return {casualLimit:limit,weeklyOff:p.weeklyOff===null?null:[...new Set(p.weeklyOff)].sort(),holidays:clean};
}
function lamaStaffClosed_(date,policy,resources){
 if(policy&&policy.holidays&&policy.holidays[date])return true;
 const sessions=resources.filter(function(r){return r.category==='planning-session'}).map(function(r){try{return Object.assign(JSON.parse(r.description),{id:r.id})}catch(e){return {}}}).filter(function(x){return x.start<=date&&date<=x.end});
 const selected=sessions.find(function(x){return x.active===true})||sessions[0],inside=function(x){return x&&x.from<=date&&date<=x.to};
 if(selected&&Object.values(selected.vacations||{}).some(inside))return true;
 if(resources.some(function(r){if(r.category!=='planning-event')return false;try{const e=JSON.parse(r.description);return e.published!==false&&/holiday|vacation/i.test(e.type||'')&&e.start<=date&&date<=e.end&&(!selected||e.sessionId===selected.id)}catch(_){return false}}))return true;
 const weekday=new Date(date+'T12:00:00Z').getUTCDay();
 const configured=lamaSchoolWeekRead_(resources);if(configured)return configured.weeklyOff.includes(weekday);
 if(policy&&Array.isArray(policy.weeklyOff))return policy.weeklyOff.indexOf(weekday)!==-1;
 const season=selected&&[selected.schoolTiming,selected.summerTiming].find(inside);
 if(season&&season.hours){const day=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][weekday];return season.hours[day]&&season.hours[day].open!==true}
 return weekday===0;
}
function lamaStaffCasualCount_(records,employee,date,excludeId,closed){
 const used=new Set();
 records.forEach(function(r){const d=lamaStaffDate_(r.date);if(String(r.teacherId)===String(employee)&&String(r.id)!==String(excludeId||'')&&d.slice(0,7)===date.slice(0,7)&&r.status==='Leave'&&r.leaveType==='Casual'&&!closed(d))used.add(d)});
 return used.size;
}
function lamaStaffAdminContext_(p,write){
 if((p.role||'school')!=='school')throw Error('School administrator required.');
 const actor=verifySchoolAdminToken(p),match=findSchoolRow(getRegistrySheet(),function(r){return String(r.schoolId)===String(p.schoolId)});
 if(!match||match.obj.status!=='Active')throw Error('School inactive.');
 if(write)assertSchoolWritable(p.schoolId);
 return {role:'school',schoolId:p.schoolId,ss:SpreadsheetApp.openById(match.obj.sheetId),auditActor:actor};
}
function lamaStaffAction_(p){
 const action=p.action;
 if(action==='staffLogin'){
  if(!p.schoolId||!p.loginId||!p.password)throw Error('School ID, staff login ID and password required.');
  const match=findSchoolRow(getRegistrySheet(),function(r){return String(r.schoolId)===String(p.schoolId)});
  if(!match||match.obj.status!=='Active')throw Error('Invalid staff login.');
  const ctx={ss:SpreadsheetApp.openById(match.obj.sheetId)},entry=lamaStaffRows_(ctx,'nonTeachingStaff').items.find(function(x){const r=x.record;return String(r.loginId).toLowerCase()===String(p.loginId).trim().toLowerCase()&&r.status==='Active'});
  if(!entry||hashPassword(p.password,entry.record.id)!==entry.record.passwordHash)throw Error('Invalid staff login.');
  const r=entry.record;return {schoolId:p.schoolId,staffId:r.id,apiKey:r.apiKey,name:r.name,designation:r.designation,schoolName:match.obj.name};
 }
 if(action==='staffOwnAttendance'){
  let ctx,employee,profile;
  if(p.role==='teacher'){
   const a=authorizeTeacher(p.schoolId,p.teacherId,p.apiKey);ctx={ss:a.ss};employee=a.teacher.id;profile={name:a.teacher.name,designation:a.teacher.designation||'Teacher'};
  }else if(p.role==='staff'){
   const match=findSchoolRow(getRegistrySheet(),function(r){return String(r.schoolId)===String(p.schoolId)});
   if(!match||match.obj.status!=='Active'||!p.staffId||!p.apiKey)throw Error('Invalid staff session.');
   ctx={ss:SpreadsheetApp.openById(match.obj.sheetId)};
   const entry=lamaStaffRows_(ctx,'nonTeachingStaff').items.find(function(x){const r=x.record;return String(r.id)===String(p.staffId)&&r.apiKey===p.apiKey&&r.status==='Active'});
   if(!entry)throw Error('Invalid or disabled staff session.');
   employee=entry.record.id;profile={name:entry.record.name,designation:entry.record.designation};
  }else throw Error('Employee login required.');
  const month=String(p.month||'');if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw Error('Valid month required.');
  const records=lamaStaffRows_(ctx,'teacherAttendance').items.map(function(x){return x.record}).filter(function(r){return String(r.teacherId)===String(employee)&&lamaStaffDate_(r.date).slice(0,7)===month}).map(function(r){return {date:lamaStaffDate_(r.date),status:r.status,leaveType:r.leaveType||'',remarks:r.remarks||''}});
  const policy=lamaStaffPolicy_(ctx),resources=lamaStaffRows_(ctx,'resources').items.map(function(x){return x.record});
  const n=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5)),0)).getUTCDate(),closed=[];
  for(let i=1;i<=n;i++){const d=month+'-'+String(i).padStart(2,'0');if(lamaStaffClosed_(d,policy,resources))closed.push(d)}
  return {profile:profile,records:records,closedDates:closed,casualLimit:policy?policy.casualLimit:null};
 }
 const ctx=lamaStaffAdminContext_(p,action!=='staffAdminDirectory');
 if(action==='staffAdminDirectory')return {staff:lamaStaffRows_(ctx,'nonTeachingStaff').items.map(function(x){return lamaStaffSafe_(x.record)}),policy:lamaStaffPolicy_(ctx),version:1};
 const lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw Error('Staff register is busy. Retry.');
 try{
  if(action==='staffSavePolicy'){
   const policy=lamaStaffValidatePolicy_(p.policy),rows=lamaStaffRows_(ctx,'staffAttendancePolicy'),old=rows.items.find(function(x){return x.record.id==='staff-attendance-policy'}),next={id:'staff-attendance-policy',policy:policy,createdAt:old?old.record.createdAt:new Date().toISOString()};
   const row=recordToRow(rows.info.headers,next);if(old)rows.info.sheet.getRange(old.row,1,1,row.length).setValues([row]);else rows.info.sheet.appendRow(row);
   writeAudit(ctx.ss,ctx.schoolId,ctx.auditActor,'save','staffAttendancePolicy',next.id,old&&old.record,next);return policy;
  }
  if(action==='staffAdminSave'){
   const raw=p.staff||{},name=String(raw.name||'').trim(),designation=String(raw.designation||'').trim(),loginId=String(raw.loginId||'').trim().toLowerCase(),password=String(raw.password||''),staffId=String(raw.id||'');
   if(!name||name.length>120||!designation||designation.length>80||!/^[a-z0-9._-]{3,40}$/.test(loginId))throw Error('Name, designation and valid login ID required.');
   const roster=lamaStaffRows_(ctx,'nonTeachingStaff'),old=roster.items.find(function(x){return String(x.record.id)===staffId});
   if(staffId&&!old)throw Error('Staff record not found.');
   if((!old||password)&&password.length<8)throw Error('Password must contain at least 8 characters.');
   if(password.length>128)throw Error('Password too long.');
   if(roster.items.some(function(x){return x!==old&&String(x.record.loginId).toLowerCase()===loginId}))throw Error('Staff login ID already exists.');
   const employeeId=old?old.record.id:genId('stf'),state=raw.status||'Active';if(['Active','Suspended'].indexOf(state)===-1)throw Error('Invalid staff status.');
   const joining=String(raw.joiningDate||'');if(joining&&lamaStaffDate_(joining)!==joining)throw Error('Invalid joining date.');
   const next={id:employeeId,name:name,loginId:loginId,passwordHash:password?hashPassword(password,employeeId):old.record.passwordHash,apiKey:!old||password||state!==old.record.status?Utilities.getUuid():old.record.apiKey,designation:designation,contact:String(raw.contact||'').slice(0,80),joiningDate:joining,status:state,createdAt:old?old.record.createdAt:new Date().toISOString()};
   const row=recordToRow(roster.info.headers,next);if(old)roster.info.sheet.getRange(old.row,1,1,row.length).setValues([row]);else roster.info.sheet.appendRow(row);
   writeAudit(ctx.ss,ctx.schoolId,ctx.auditActor,old?'update':'add','nonTeachingStaff',employeeId,old&&lamaStaffSafe_(old.record),lamaStaffSafe_(next));return lamaStaffSafe_(next);
  }
  throw Error('Unknown staff action.');
 }finally{lock.releaseLock()}
}
function lamaStaffAttendanceWrite_(p,action){
 if((p.role||'school')!=='school'||!p._auditActor)throw Error('School administrator required.');
 const ctx=resolveContext(p),lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw Error('Staff attendance is busy. Retry.');
 try{
  const records=lamaStaffRows_(ctx,'teacherAttendance').items.map(function(x){return x.record});
  const old=action==='update'?records.find(function(r){return String(r.id)===String(p.id)}):null;
  if(action==='update'&&!old)throw Error('Attendance record not found.');
  const raw=Object.assign({},old||{},action==='update'?p.patch:p.record),date=lamaStaffDate_(raw.date),employee=String(raw.teacherId||''),state=String(raw.status||''),leave=state==='Leave'?String(raw.leaveType||''):'';
  if(!date||!employee||['Present','Absent','Leave'].indexOf(state)===-1||['','Casual','Medical','Other'].indexOf(leave)===-1)throw Error('Invalid staff attendance entry.');
  if(old&&(String(old.teacherId)!==employee||lamaStaffDate_(old.date)!==date))throw Error('Attendance employee and date cannot be reassigned.');
  if(records.some(function(r){return String(r.id)!==String(old&&old.id||'')&&String(r.teacherId)===employee&&lamaStaffDate_(r.date)===date}))throw Error('Duplicate attendance entry. Refresh and correct the existing record.');
  const roster=lamaStaffRows_(ctx,'teachers').items.concat(lamaStaffRows_(ctx,'nonTeachingStaff').items);
  const person=roster.find(function(x){return String(x.record.id)===employee});
  if(!person||(!old&&String(person.record.status||'Active')!=='Active'))throw Error('Active staff member not found.');
  const policy=lamaStaffPolicy_(ctx),resources=lamaStaffRows_(ctx,'resources').items.map(function(x){return x.record}),closed=function(d){return lamaStaffClosed_(d,policy,resources)};
  // Preserve old clients' behavior until a school publishes a policy.
  if((policy||lamaSchoolWeekRead_(resources))&&closed(date))throw Error('Attendance is closed on this holiday.');
  if(policy&&state==='Leave'&&!leave)throw Error('Select Casual, Medical or Other leave using the updated register.');
  if(policy&&leave==='Casual'&&lamaStaffCasualCount_(records,employee,date,old&&old.id,closed)>=policy.casualLimit)throw Error('Monthly casual leave limit of '+policy.casualLimit+' days reached.');
  const clean={teacherId:employee,teacherName:String(person.record.name||raw.teacherName||''),date:date,status:state,leaveType:leave,remarks:state==='Present'?'':String(raw.remarks||'').slice(0,1000),markedBy:p._auditActor.name};
  return old?updateRecord(ctx,'teacherAttendance',p.id,clean):addRecord(ctx,'teacherAttendance',clean);
 }finally{lock.releaseLock()}
}

// Student access to published planning resources is bound to authenticated student identity.
function lamaStudentPlanningVisible_(row,student){
 if(['planning-period','planning-event','planning-session'].indexOf(row.category)===-1)return true;
 let p;try{p=JSON.parse(row.description||'{}')}catch(e){return false}
 if(!p||typeof p!=='object')return false;
 if(row.category==='planning-session')return true;
 if(p.published!==true&&String(p.published).toLowerCase()!=='true')return false;
 const grade=String(p.grade||'').trim(),section=String(p.section||'').trim();
 if(!String(student.class||'').trim())return false;
 if(!grade)return row.category==='planning-event'&&!section&&!String(p.teacherId||'').trim();
 return sameClass(grade,student.class)&&(!section||(!!String(student.section||'').trim()&&sameClass(section,student.section)));
}

/** Save a prepared group of lessons in one authenticated request. No whole-sheet replacement. */
function lamaPlanningSaveBatch_(p){
 const ctx=lamaStaffAdminContext_(p,true),jobs=p.jobs;
 if(!Array.isArray(jobs)||!jobs.length||jobs.length>500)throw Error('Submit 1–500 changed lessons.');
 const lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw Error('Timetable is busy. Retry.');
 try{
  const data=lamaStaffRows_(ctx,'resources'),all=data.items,parse=r=>{try{return JSON.parse(r.description||'{}')}catch(e){return {}}};
  const dayNames=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const schoolWeek=lamaSchoolWeekRead_(all.map(x=>x.record));
  const time=v=>/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(v||''));
  const cls=r=>normalizeSchoolClass(r.grade)+'|'+String(r.section||'').trim().toLowerCase().replace(/\s+/g,'');
  const sameSlot=(a,b)=>String(a.sessionId)===String(b.sessionId)&&a.day===b.day&&Number(a.period)===Number(b.period)&&cls(a)===cls(b);
  const multiSessions=new Set(all.filter(x=>x.record.category==='planning-session'&&parse(x.record).teacherSchedulingMode==='multi-class').map(x=>String(x.record.id)));
  const overlaps=(a,b)=>String(a.sessionId)===String(b.sessionId)&&a.day===b.day&&a.start<b.end&&a.end>b.start&&(cls(a)===cls(b)||lamaPlanningBlockingStaff_(a,b,multiSessions.has(String(a.sessionId))));
  const periods=all.filter(x=>x.record.category==='planning-period').map(x=>({row:x.row,record:x.record,payload:parse(x.record)}));
  const teachers=lamaStaffRows_(ctx,'teachers').items.map(x=>x.record).filter(t=>String(t.status||'Active').toLowerCase()==='active');
  const curr=all.find(x=>x.record.category==='school-curriculum'&&x.record.title==='LAMA School Class Subjects'),doc=curr?parse(curr.record):{};
  const configured=String(doc.schoolId)===String(ctx.schoolId)&&Array.isArray(doc.classes)?doc.classes:[];
  const updates=[],seenIds=new Set(),now=new Date().toISOString();
  for(const j of jobs){
   const r=j.payload||{},id=String(j.id||''),old=id?periods.find(x=>String(x.record.id)===id):null;
   if(id&&(!old||seenIds.has(id)))throw Error('Lesson changed or repeated. Reload before saving.');
   if(old&&JSON.stringify(old.payload)!==JSON.stringify(j.expected))throw Error('A saved lesson changed. Reload before saving.');
   if(id)seenIds.add(id);
   if(!all.some(x=>x.record.category==='planning-session'&&String(x.record.id)===String(r.sessionId)))throw Error('Academic session unavailable.');
   if(schoolWeek&&schoolWeek.weeklyOff.includes(['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(r.day)))throw Error(r.day+' is a school-wide weekly holiday.');
   if(!dayNames.includes(r.day)||!Number.isInteger(r.period)||r.period<1||r.period>30||!time(r.start)||!time(r.end)||r.start>=r.end||!String(r.grade||'').trim()||!String(r.subject||'').trim()||typeof r.published!=='boolean')throw Error('Invalid lesson details.');
   lamaPlanningAssertHours_(all.map(x=>x.record),r);
   if(old&&!sameSlot(old.payload,r))throw Error('Batch editing cannot move a saved lesson to a different slot.');
   const c=configured.find(x=>sameClass(x.name,r.grade)),sub=String(r.subject);
   if(!(Array.isArray(c?.subjects)&&c.subjects.includes(sub))&&!(old&&old.payload.subject===sub))throw Error('Subject is not configured for '+r.grade+'.');
   const t=teachers.find(x=>String(x.id)===String(r.teacherId));if(!t)throw Error('Choose an active teacher.');
   const payload={sessionId:String(r.sessionId),day:r.day,period:r.period,start:r.start,end:r.end,grade:String(r.grade),section:String(r.section||''),subject:sub,teacherId:String(t.id),teacherName:String(t.name||t.fullName||t.teacherName||''),room:String(r.room||'').slice(0,80),published:r.published};
   if(r.supportId){const kind=String(r.supportKind||'');if(!['teacher','staff'].includes(kind))throw Error('Invalid additional staff type.');const list=kind==='teacher'?teachers:lamaStaffRows_(ctx,'nonTeachingStaff').items.map(x=>x.record).filter(x=>x.status==='Active');const extra=list.find(x=>String(x.id)===String(r.supportId));if(!extra||kind==='teacher'&&String(extra.id)===String(t.id))throw Error('Choose a different active additional staff member.');payload.supportId=String(extra.id);payload.supportKind=kind;payload.supportName=String(extra.name||extra.fullName||extra.teacherName||'');payload.supportRole=kind==='teacher'?'Teacher':String(extra.designation||'Support staff');}
   const record=Object.assign({},old?.record||{id:genId('res'),createdAt:now},{category:'planning-period',title:[payload.day,payload.grade,payload.period].join(' · '),description:JSON.stringify(payload),link:''});
   updates.push({old,payload,record});
  }
  const remaining=periods.filter(x=>!seenIds.has(String(x.record.id))).map(x=>x.payload);
  for(const u of updates){if(remaining.some(x=>sameSlot(x,u.payload)||overlaps(x,u.payload)))throw Error(u.payload.day+' P'+u.payload.period+': class or teacher conflict. No changes saved.');remaining.push(u.payload)}
  // Validate the entire batch before writing, then write contiguous changed rows and new rows.
  const edits=updates.filter(u=>u.old).sort((a,b)=>a.old.row-b.old.row),adds=updates.filter(u=>!u.old),sheet=data.info.sheet,headers=data.info.headers;
  for(let i=0;i<edits.length;){let k=i+1;while(k<edits.length&&edits[k].old.row===edits[k-1].old.row+1)k++;sheet.getRange(edits[i].old.row,1,k-i,headers.length).setValues(edits.slice(i,k).map(u=>recordToRow(headers,u.record)));i=k}
  if(adds.length){const first=sheet.getLastRow()+1;const extra=first+adds.length-1-sheet.getMaxRows();if(extra>0)sheet.insertRowsAfter(sheet.getMaxRows(),extra);sheet.getRange(first,1,adds.length,headers.length).setValues(adds.map(u=>recordToRow(headers,u.record)))}
  SpreadsheetApp.flush();
  return {records:updates.map(u=>u.record)};
 }finally{lock.releaseLock()}
}

function lamaSchoolWeekRead_(resources){
 const hits=resources.filter(r=>r.category==='school-working-week');
 if(!hits.length)return null;if(hits.length!==1)throw Error('Duplicate school working-week settings. Contact administrator.');
 let p;try{p=JSON.parse(hits[0].description)}catch(e){throw Error('Invalid school working-week settings.')}
 if(!p||p.version!==1||!Array.isArray(p.weeklyOff)||p.weeklyOff.length>=7||p.weeklyOff.some(n=>!Number.isInteger(n)||n<0||n>6)||new Set(p.weeklyOff).size!==p.weeklyOff.length)throw Error('Invalid school working-week settings.');
 return p;
}
function lamaSaveSchoolWorkingWeek_(p){
 const ctx=lamaStaffAdminContext_(p,true),off=p.weeklyOff;
 if(!Array.isArray(off)||off.length>=7||off.some(n=>!Number.isInteger(n)||n<0||n>6)||new Set(off).size!==off.length)throw Error('Select at least one working day.');
 const lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw Error('School settings busy. Retry.');
 try{
  const data=lamaStaffRows_(ctx,'resources'),items=data.items.filter(x=>x.record.category==='school-working-week');
  if(items.length>1)throw Error('Duplicate school working-week records. Contact administrator.');
  const old=items[0];if(String(old?.record.description||'')!==String(p.expected||''))throw Error('Working week changed elsewhere. Refresh before saving.');
  const next={...old?.record,id:old?.record.id||genId('res'),category:'school-working-week',title:'School Working Days and Holidays',description:JSON.stringify({version:1,weeklyOff:off.slice().sort()}),link:'',createdAt:old?.record.createdAt||new Date().toISOString()};
  const row=recordToRow(data.info.headers,next);if(old)data.info.sheet.getRange(old.row,1,1,row.length).setValues([row]);else data.info.sheet.appendRow(row);
  return next;
 }finally{lock.releaseLock()}
}
function lamaAssertSchoolAttendanceDay_(ctx,date){
 const day=lamaStaffDate_(date);if(!day)throw Error('Valid attendance date required.');
 const resources=lamaStaffRows_(ctx,'resources').items.map(x=>x.record);
 if(lamaSchoolWeekRead_(resources)&&lamaStaffClosed_(day,null,resources))throw Error('Attendance is closed on this school holiday.');
}
function lamaAssertPlanningDay_(ctx,record){
 if(record.category!=='planning-period')return;
 const resources=lamaStaffRows_(ctx,'resources').items.map(x=>x.record),p=lamaSchoolWeekRead_(resources);
 const lesson=JSON.parse(record.description||'{}'),n=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(lesson.day);
 if(p&&p.weeklyOff.includes(n))throw Error(lesson.day+' is a school-wide weekly holiday.');
 lamaPlanningAssertHours_(resources,lesson);
 if(lesson.supportId)throw Error('Use Easy timetable builder to save additional staff.');
 for(const r of resources){if(r.category!=='planning-period'||String(r.id)===String(record.id||''))continue;let old;try{old=JSON.parse(r.description)}catch(e){continue}
  if(String(old.sessionId)!==String(lesson.sessionId)||old.day!==lesson.day)continue;
  const sameCls=normalizeSchoolClass(old.grade)===normalizeSchoolClass(lesson.grade)&&String(old.section||'').trim().toLowerCase().replace(/\s+/g,'')===String(lesson.section||'').trim().toLowerCase().replace(/\s+/g,'');
  const multi=resources.some(x=>x.category==='planning-session'&&String(x.id)===String(lesson.sessionId)&&JSON.parse(x.description||'{}').teacherSchedulingMode==='multi-class');
  if(sameCls&&Number(old.period)===Number(lesson.period)||old.start<lesson.end&&lesson.start<old.end&&(sameCls||lamaPlanningBlockingStaff_(old,lesson,multi)))throw Error('Conflict: '+lesson.day+' '+lesson.grade+' P'+lesson.period+' '+lesson.start+'–'+lesson.end+' / '+old.grade+' P'+old.period+' '+old.start+'–'+old.end);
 }
}

function lamaPlanningStaffKeys_(p,multi=false){const keys=[];const covered=multi&&p.supportKind==='teacher'&&p.supportId&&String(p.supportId)!==String(p.teacherId);if(p.teacherId&&!covered)keys.push('teacher:'+String(p.teacherId));if(p.supportId&&['teacher','staff'].includes(p.supportKind))keys.push(p.supportKind+':'+String(p.supportId));return keys;}

// Only shared registered teachers may overlap across different class/section slots in multi-class mode. Non-teaching staff remain strict.
function lamaPlanningBlockingStaff_(a,b,multi){
 return lamaPlanningStaffKeys_(a,multi).some(k=>lamaPlanningStaffKeys_(b,multi).includes(k)&&(!multi||!k.startsWith('teacher:')));
}

function lamaPlanningAssertHours_(resources,p,date){
 const day=date||Utilities.formatDate(new Date(),'Asia/Karachi','yyyy-MM-dd');
 const row=resources.find(r=>r.category==='planning-session'&&String(r.id)===String(p.sessionId));if(!row)return;
 const ss=JSON.parse(row.description||'{}'),t=[ss.schoolTiming,ss.summerTiming].find(x=>x&&x.from<=day&&day<=x.to&&x.hours);if(!t)return;
 const h=t.hours[p.day],clock=v=>typeof v==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v),err=msg=>{throw Error(p.day+' '+p.grade+' P'+p.period+': '+msg)};
 if(!h||h.open!==true||!clock(h.start)||!clock(h.end)||h.start>=h.end)err('School hours not open / configured');
 if(!clock(p.start)||!clock(p.end)||p.start>=p.end)err('Invalid lesson times');
 if(p.start<h.start||p.end>h.end)err('Outside school hours '+h.start+'–'+h.end);
 for(const [a,b,label] of [[t.assemblyStart,t.assemblyEnd,'Morning assembly'],[t.breakStart,t.breakEnd,'Lunch break']])if(clock(a)&&clock(b)&&a<b&&a>=h.start&&b<=h.end&&p.start<b&&p.end>a)err('Overlaps '+label+' '+a+'–'+b);
}

/** Homework completion is a student's self-report, not teacher verification. */
function lamaHomeworkVisible_(r,student){
 const s=v=>String(v==null?'':v).trim().toLowerCase(),status=s(r.status);
 if(!r.id||s(r.published)==='false'||s(r.isPublished)==='false'||['draft','archived','rejected','deleted','cancelled','pending approval'].includes(status))return false;
 if(status&&!['published','posted','saved','sent','completed','pending'].includes(status)&&s(r.isPublished)!=='true'&&s(r.published)!=='true'&&s(r.visibility)!=='public')return false;
 return !!normalizeSchoolClass(student.class)&&sameClass(r.class,student.class)&&(!s(r.section)||sameClass(r.section,student.section));
}
function lamaHomeworkCompletionAction_(p){
 const action=p.action,isReport=action==='homeworkCompletionReport';
 if(isReport?!['school','teacher'].includes(p.role):p.role!=='student')throw Error('Access denied.');
 const ctx=isReport&&p.role==='school'?lamaStaffAdminContext_(p,false):resolveContext(p);
 if(isReport? !['school','teacher'].includes(ctx.role):ctx.role!=='student')throw Error('Access denied.');
 if(ctx.role==='teacher'&&!String(ctx.teacher.assignedClass||'').trim())throw Error('No assigned class.');
 const lock=action==='studentHomeworkSetCompletion'?LockService.getScriptLock():null;
 if(lock&&!lock.tryLock(15000))throw Error('Homework checklist busy. Refresh before retrying.');
 try{
 const homework=lamaStaffRows_(ctx,'homework').items.map(x=>x.record);
 const data=lamaStaffRows_(ctx,'homeworkCompletion');
 const str=v=>String(v==null?'':v).trim();
 const marked=r=>r.completed===true||str(r.completed).toLowerCase()==='true';
 if(!isReport){
  const sid=str(ctx.student.id),own=homework.filter(h=>lamaHomeworkVisible_(h,ctx.student)),ids=new Set(own.map(h=>str(h.id)));
  if(!sid)throw Error('Student ID missing.');
  if(action==='studentHomeworkCompletion')return {completedIds:[...new Set(data.items.filter(x=>str(x.record.studentId)===sid&&ids.has(str(x.record.homeworkId))&&marked(x.record)).map(x=>str(x.record.homeworkId)))]};
  assertSchoolWritable(ctx.schoolId);
  const hid=str(p.homeworkId);if(!hid||!ids.has(hid)||typeof p.completed!=='boolean')throw Error('Invalid homework checklist item.');
  const hits=data.items.filter(x=>str(x.record.studentId)===sid&&str(x.record.homeworkId)===hid);
  if(hits.length>1)throw Error('Duplicate completion records. Contact school.');
  const record={id:hits[0]?.record.id||genId('hc'),studentId:sid,homeworkId:hid,completed:p.completed,updatedAt:new Date().toISOString()};
  if(hits.length)data.info.sheet.getRange(hits[0].row,1,1,data.info.headers.length).setValues([recordToRow(data.info.headers,record)]);
  else data.info.sheet.appendRow(recordToRow(data.info.headers,record));
  SpreadsheetApp.flush();
  const verified=lamaStaffRows_(ctx,'homeworkCompletion').items.filter(x=>str(x.record.studentId)===sid&&str(x.record.homeworkId)===hid);
  if(verified.length!==1||marked(verified[0].record)!==p.completed)throw Error('Completion save not confirmed. Refresh before retrying.');
  return {homeworkId:hid,completed:p.completed};
 }
 const day=lamaStaffDate_(p.date);if(!day||day!==p.date)throw Error('Valid posting date required.');
 const students=lamaStaffRows_(ctx,'students').items.map(x=>x.record).filter(s=>normalizeSchoolClass(s.class)&&(ctx.role==='school'||teacherOwns(ctx,s)));
 const assignments=homework.filter(h=>lamaStaffDate_(h.createdAt)===day);
 const set=new Set(data.items.filter(x=>marked(x.record)).map(x=>JSON.stringify([str(x.record.studentId),str(x.record.homeworkId)])));
 return {date:day,students:students.map(s=>{
 const applicable=assignments.filter(h=>lamaHomeworkVisible_(h,s));
 const items=applicable.map(h=>({id:str(h.id),subject:str(h.subject),completed:set.has(JSON.stringify([str(s.id),str(h.id)]))}));
 return {id:str(s.id),name:str(s.name),enrlNo:str(s.enrlNo),class:str(s.class),section:str(s.section),items};
 })};
 }finally{if(lock)lock.releaseLock();}
}

/* Lesson plans: dedicated protected tab, never exposed through generic collections. */
function lamaLessonPlanner_(p){
 const op=String(p.operation||''),role=p.role;
 if(!['teacher','school'].includes(role))throw Error('Teacher or verified school administrator required.');
 const write=op!=='load',ctx=role==='school'?lamaStaffAdminContext_(p,write):resolveContext(p);
 if(role==='teacher'&&!String(ctx.teacher.assignedClass||'').trim())throw Error('No assigned class.');
 if(write)assertSchoolWritable(ctx.schoolId);
 const str=v=>String(v??'').trim(),text=(v,max=3000)=>{if(typeof v!=='string'||v.length>max)throw Error('Invalid lesson plan text.');return v.trim()};
 const date=v=>typeof v==='string'&&lamaStaffDate_(v)===v;
 const headings=['knowledge','comprehension','application','previous','resources','av','humour','reference','assessment','activities','support','challenge','worksheet','answerKey','source','reflectionGood','reflectionImprove','assessmentResult'];
 const methods=['Lecture','Discussion','Tech Integration','Student Centered','PBL','Flipped','Blended','Kinesthetic','Activity Based','Montessori','Inquiry Based','Other'];
 const steps=['Hook','Explore','Explain','Practice','Wrap-up'];
 const lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw Error('Lesson planner busy. Refresh before retry.');
 try{
 const headers=['id','teacherId','teacherName','designation','class','section','subject','from','to','status','version','payloadJson','reviewJson','deliveryJson','createdAt','updatedAt'];
 const tab=secureTab(ctx.ss,'_LAMA_LESSON_PLANS',headers),raw=tab.getDataRange().getValues(),actual=raw[0];
 const items=raw.slice(1).map((row,i)=>({row:i+2,record:rowToRecord(actual,row)})).filter(x=>x.record.id);
 const own=r=>role==='school'||str(r.teacherId)===str(ctx.teacher.id)&&teacherOwns(ctx,r);
 const safe=r=>Object.assign({},r,{from:lamaStaffDate_(r.from),to:lamaStaffDate_(r.to)});
 const resources=lamaStaffRows_(ctx,'resources').items.map(x=>x.record);
 if(op==='load'){
  const from=p.from,to=p.to;if(!date(from)||!date(to)||from>to||(+new Date(to)-+new Date(from))/86400000>62)throw Error('Choose a report range of up to 63 days.');
  const plans=items.map(x=>safe(x.record)).filter(r=>own(r)&&r.from<=to&&r.to>=from);
  const curriculum=role==='teacher'?lamaTeacherCurriculum_(ctx):null;
  const profile=role==='teacher'?{id:str(ctx.teacher.id),name:str(ctx.teacher.name),designation:str(ctx.teacher.designation),class:str(ctx.teacher.assignedClass),section:str(ctx.teacher.assignedSection),subjects:curriculum.subjects}:null;
  const planning=role==='teacher'?resources.filter(r=>['planning-session','planning-period','planning-event','school-working-week'].includes(r.category)).filter(r=>{
   if(r.category==='planning-session'||r.category==='school-working-week')return true;
   try{const x=JSON.parse(r.description||'{}');return x.published===true&&(!x.grade||sameClass(x.grade,profile.class))&&(!x.section||sameClass(x.section,profile.section));}catch(e){return false}
  }).map(r=>({id:r.id,category:r.category,description:r.description})):[];
  return {plans,profile,planning};
 }
 const id=str(p.id),old=items.find(x=>str(x.record.id)===id),prev=old&&safe(old.record);
 if(id&&!prev)throw Error('Lesson plan not found.');
 if(prev&&(!own(prev)||Number(prev.version)!==Number(p.version)))throw Error('Plan access denied or changed. Refresh first.');
 const now=new Date().toISOString();let next;
 if(op==='save'){
  if(role!=='teacher'||prev&&!['draft','returned'].includes(prev.status))throw Error('Only teachers may edit their own drafts or returned plans.');
  const q=p.plan;if(!q||typeof q!=='object'||JSON.stringify(q).length>28000)throw Error('Invalid or oversized lesson plan.');
  const curriculum=lamaTeacherCurriculum_(ctx),subject=curriculum.subjects.find(s=>str(s)===str(q.subject));
  if(!subject||!date(q.from)||!date(q.to)||q.from>q.to||(+new Date(q.to)-+new Date(q.from))/86400000>6)throw Error('Choose a configured subject and a period of 1–7 days.');
  const payload={mode:q.from===q.to?'daily':'weekly',language:['Urdu','English','Bilingual'].includes(q.language)?q.language:'Urdu',chapter:text(q.chapter||'',300),topic:text(q.topic||'',300),session:text(q.session||'',100),syllabusPlanId:text(q.syllabusPlanId||'',100),days:[],methods:[],flow:[]};
  if(!payload.topic)throw Error('Topic required.');
  for(const k of headings)payload[k]=text(q[k]||'');
  if(!Array.isArray(q.days)||q.days.length>35||!Array.isArray(q.methods)||q.methods.some(v=>!methods.includes(v))||!Array.isArray(q.flow)||q.flow.length!==5)throw Error('Invalid planning fields.');
  payload.methods=[...new Set(q.methods)];
  const dayKeys=new Set();
  for(const d of q.days){
   if(!date(d.date)||d.date<q.from||d.date>q.to)throw Error('Lesson date outside plan range.');
   const period=Number(d.period||0),slo=Number(d.sloCount||0),minutes=Number(d.minutes||0);if(!Number.isInteger(period)||period<0||period>30||!Number.isInteger(slo)||slo<0||slo>100||!Number.isInteger(minutes)||minutes<0||minutes>360)throw Error('Invalid period, duration or SLO count.');
   const key=d.date+'|'+period;if(dayKeys.has(key))throw Error('Duplicate day and period.');dayKeys.add(key);
   payload.days.push({date:d.date,period,minutes,topic:text(d.topic||'',500),sloCount:slo,homework:text(d.homework||'',1500)});
  }
  for(let i=0;i<steps.length;i++){const f=q.flow[i],minutes=Number(f.minutes||0);if(!Number.isInteger(minutes)||minutes<0||minutes>360)throw Error('Invalid lesson flow minutes.');payload.flow.push({step:steps[i],minutes,activity:text(f.activity||'',1500)});}
  const keyClass=str(ctx.teacher.assignedClass),section=str(ctx.teacher.assignedSection),tid=str(ctx.teacher.id);
  if(items.some(x=>str(x.record.id)!==id&&str(x.record.teacherId)===tid&&sameClass(x.record.class,keyClass)&&sameClass(x.record.section,section)&&str(x.record.subject)===str(subject)&&lamaStaffDate_(x.record.from)===q.from&&lamaStaffDate_(x.record.to)===q.to))throw Error('A plan for this subject and date range already exists. Open it to edit.');
  next={id:prev?.id||genId('lp'),teacherId:tid,teacherName:str(ctx.teacher.name),designation:str(ctx.teacher.designation),class:keyClass,section,subject,from:q.from,to:q.to,status:prev?.status||'draft',version:Number(prev?.version||0)+1,payload,review:prev?.review||null,delivery:prev?.delivery||null,createdAt:prev?.createdAt||now,updatedAt:now};
 }else{
  if(!prev)throw Error('Select a saved plan.');
  next={...prev,version:Number(prev.version)+1,updatedAt:now};
  if(op==='submit'&&role==='teacher'&&['draft','returned'].includes(prev.status)){
   const q=prev.payload;if(!q?.days?.some(d=>d.topic)||!q.knowledge&&!q.comprehension&&!q.application)throw Error('Enter a daily topic and at least one learning outcome before submission.');
   next.status='submitted';
  }else if(['approve','return'].includes(op)&&role==='school'&&prev.status==='submitted'){
   const comment=text(p.comment||'',1000);if(op==='return'&&!comment)throw Error('Give a revision reason.');
   next.status=op==='approve'?'approved':'returned';next.review={by:str(ctx.auditActor.name||ctx.auditActor.displayName||ctx.auditActor.id),at:now,comment};
  }else if(op==='reflect'&&role==='teacher'&&prev.status==='approved'){
   const v=p.delivery||{},state=v.state;if(!['not taught','partly taught','taught'].includes(state))throw Error('Select actual delivery status.');
   next.delivery={state,good:text(v.good||''),improve:text(v.improve||''),assessment:text(v.assessment||''),at:now};
  }else throw Error('Action not allowed for this plan status or role.');
 }
 const row=recordToRow(actual,next);if(old)tab.getRange(old.row,1,1,row.length).setValues([row]);else tab.appendRow(row);
 SpreadsheetApp.flush();
 const check=tab.getDataRange().getValues().slice(1).map(r=>rowToRecord(actual,r)).find(r=>str(r.id)===str(next.id));
 if(!check||Number(check.version)!==next.version)throw Error('Save not confirmed. Refresh.');
 return safe(check);
 }finally{lock.releaseLock();}
}
