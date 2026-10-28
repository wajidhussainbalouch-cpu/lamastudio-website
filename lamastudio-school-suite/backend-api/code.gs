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
 * IMPORTANT FOR FRESH MASTER REGISTRY (do not run setup()): In Apps Script
 * Project Settings > Script Properties set MASTER_SHEET_ID to
 * 1_STA5SaL3RMNQeAp6EuW00kkVE7H9yGi7d-o8uHWQeg ONLY after checking
 * that the old live registry has no school accounts to preserve.
 * The new spreadsheet already has the Schools tab and required headers.
 * DriveApp permissions may need re-authorization after this code change.
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
    'passwordHash', 'apiKey', 'sheetId', 'logo', 'coverPhoto', 'shortCode', 'plan', 'status', 'createdAt', 'subscriptionType', 'subscriptionStart', 'subscriptionEnd', 'subscriptionPrice', 'subscriptionPaidAt', 'subscriptionReference', 'subscriptionNotes'
];
// Super Admin password is initialized securely through Script Properties.
// Never place a plaintext password in this source file.

// Every collection listed here automatically gets full CRUD via the generic
// list/get/add/update/remove functions further down. Field names ending in
// "Json" are stored as JSON text in one cell and parsed back transparently.
const COLLECTIONS = {
    students: {
        tab: 'Students',
        headers: ['id', 'enrlNo', 'name', 'gender', 'dob', 'fatherGuardian', 'contact', 'whatsapp', 'class', 'section',
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
        headers: ['id', 'name', 'email', 'passwordHash', 'apiKey', 'subject', 'assignedClass', 'assignedSection',
                  'contact', 'status', 'createdAt',
                  'cnic', 'dob', 'gender', 'qualification', 'joiningDate', 'address', 'emergencyContact', 'canEnrollStudents', 'enrollmentPermissionUntil', 'canCompleteStudentProfiles']
    },
    activities: {
        tab: 'Activities',
        headers: ['id', 'type', 'title', 'description', 'date', 'photo', 'createdAt']
    },
    teacherAttendance: {
        tab: 'TeacherAttendance',
        headers: ['id', 'teacherId', 'teacherName', 'date', 'status', 'markedBy', 'createdAt', 'remarks']
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
    homework: {
        tab: 'Homework',
        headers: ['id', 'class', 'subject', 'title', 'description', 'dueDate', 'assignedBy', 'createdAt']
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
        headers: ['id', 'title', 'audience', 'channel', 'message', 'status', 'isPublished', 'createdAt']
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
    const ss = SpreadsheetApp.create('LamaStudio Master Registry');
    const sheet = ss.getActiveSheet();
    sheet.setName(REGISTRY_SHEET_NAME);
    sheet.appendRow(REGISTRY_HEADERS);
    props.setProperty('MASTER_SHEET_ID', ss.getId());
    if (!props.getProperty('SUPERADMIN_PASSWORD_HASH')) setupSuperAdmin();
    Logger.log('Setup complete. Master Registry: ' + ss.getUrl());
}

/**
 * First-time initialization or intentional password reset.
 * Run setupSuperAdmin() once from the editor. Remove the embedded password
 * after setup to avoid keeping plaintext credentials in source control.
 * Existing Master Registry and school data are NOT modified.
 */
function setupSuperAdmin() {
    // WARNING: Embedded password is visible to anyone with source access.
    // Run this once, then remove the literal password from this file.
    const password = 'W@jidhussain12345';
    const props = PropertiesService.getScriptProperties();
    props.setProperty('SUPERADMIN_PASSWORD_HASH', hashPassword(password, 'SUPERADMIN'));
    props.deleteProperty('SUPERADMIN_SETUP_PASSWORD');
    Logger.log('SUCCESS: Super Admin password configured.');
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
        setup();
        id = props.getProperty('MASTER_SHEET_ID');
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

/** Destination of school databases in the connected LamaStudio master Drive workspace. */
const SCHOOL_DATABASE_FOLDER_ID = '1H9U1a1fbNewbpQMwr8AGbQ3xLC27Tq02';

/**
 * Creates a brand-new private Google Sheet for a school, with all tabs pre-built.
 * Keep each school's spreadsheet in the central School Databases folder.
 * Validate folder access before creating the spreadsheet to avoid orphaned files.
 */
function createSchoolSheet(schoolName) {
    const folder = DriveApp.getFolderById(SCHOOL_DATABASE_FOLDER_ID);
    if (folder.isTrashed()) throw new Error('School database folder is in Trash.');
    const ss = SpreadsheetApp.create(schoolName + ' - LamaStudio Data');
    const defaultSheet = ss.getSheets()[0];
    Object.keys(COLLECTIONS).forEach(key => {
        const cfg = COLLECTIONS[key];
        const sh = ss.insertSheet(cfg.tab);
        sh.appendRow(cfg.headers);
        sh.setFrozenRows(1);
    });
    ss.deleteSheet(defaultSheet);
    // Move only the newly created school file; never touch existing school data.
    const file = DriveApp.getFileById(ss.getId());
    file.moveTo(folder);
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
    const passwordHash = hashPassword(p.password, schoolId);

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
    if (hashPassword(password, match.obj.schoolId) !== match.obj.passwordHash) throw new Error('Incorrect password.');
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

function getSchoolConfig(schoolId, apiKey) {
    const o = authorizeSchool(schoolId, apiKey).obj;
    return {
        schoolId: o.schoolId, name: o.name, address: o.address, phone: o.phone, principal: o.principal,
        type: o.type, level: o.level, logo: o.logo, coverPhoto: o.coverPhoto || '', shortCode: o.shortCode
    };
}

function updateSchoolConfig(schoolId, apiKey, patch) {
    assertSchoolWritable(schoolId);
    const match = authorizeSchool(schoolId, apiKey);
    const registry = getRegistrySheet();
    // Only school profile fields may be changed; never accept registry/security fields.
    const allowed = ['name', 'address', 'phone', 'principal', 'type', 'level', 'logo', 'coverPhoto', 'shortCode'];
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new Error('Invalid school profile update.');
    const invalid = Object.keys(patch).filter(k => allowed.indexOf(k) === -1);
    if (invalid.length) throw new Error('Protected school settings cannot be changed: ' + invalid.join(', '));
    const updated = Object.assign({}, match.obj, patch);
    const newRow = match.headers.map(h => (updated[h] !== undefined ? updated[h] : ''));
    registry.getRange(match.rowIndex, 1, 1, match.headers.length).setValues([newRow]);
    return getSchoolConfig(schoolId, apiKey);
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
    if (!p.name || !p.email || !p.password || p.password.length < 6) {
        throw new Error('Name, email, and a password of at least 6 characters are required.');
    }
    const match = authorizeSchool(schoolId, apiKey);
    const ss = SpreadsheetApp.openById(match.obj.sheetId);
    const ctx = { role: 'school', ss };
    const { sheet, headers } = getCollectionSheet(ctx, 'teachers');
    const existing = sheet.getDataRange().getValues();
    const emailCol = headers.indexOf('email');
    for (let i = 1; i < existing.length; i++) {
        if (String(existing[i][emailCol]).toLowerCase() === p.email.toLowerCase()) {
            throw new Error('A teacher with this email already exists at this school.');
        }
    }
    const id = genId('tch');
    const teacherApiKey = Utilities.getUuid();
    const record = {
        id, name: p.name.trim(), email: p.email.trim().toLowerCase(),
        passwordHash: hashPassword(p.password, id), apiKey: teacherApiKey,
        subject: p.subject || '', assignedClass: p.assignedClass || '', assignedSection: p.assignedSection || '',
        contact: p.contact || '', status: 'Active', createdAt: new Date().toISOString(),
        cnic: p.cnic || '', dob: p.dob || '', gender: p.gender || '', qualification: p.qualification || '',
        joiningDate: p.joiningDate || '', address: p.address || '', emergencyContact: p.emergencyContact || ''
    };
    sheet.appendRow(recordToRow(headers, record));
    const safe = Object.assign({}, record); delete safe.passwordHash;
    return safe;
}

function teacherLogin(schoolId, email, password) {
    if (!schoolId || !email || !password) throw new Error('School ID, email, and password are required.');
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
                subject: row.subject, assignedClass: row.assignedClass, assignedSection: row.assignedSection || '',
                schoolName: schoolMatch.obj.name, schoolLogo: schoolMatch.obj.logo
            };
        }
    }
    throw new Error('No teacher account found with this Teacher ID or email at this school.');
}

/** Every teacher-authenticated call goes through here. Returns the school context + the teacher's own row. */
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
const STUDENT_READ_COLLECTIONS = ['homework', 'datesheet', 'tests', 'notifications', 'activities', 'resources', 'timetable'];
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
function teacherOwns(ctx,r){ return sameClass(r.class,ctx.teacher.assignedClass) && sameSection(r,ctx.teacher.assignedSection); }

function checkPermission(ctx, action, collection) {
    if (ctx.role === 'school') return; // full access, unchanged
    if (ctx.role === 'teacher') {
        if (collection === 'studentRequests' && ['list','get','update'].indexOf(action) !== -1) return;
        if (collection === 'teachers' && action === 'get') return;
        if (TEACHER_WRITE_COLLECTIONS.indexOf(collection) !== -1) return; // class-scoped writes
        if (collection === 'students' && (action === 'list' || action === 'get' || action === 'update')) return;
        if (collection === 'students' && action === 'add' && (ctx.teacher.canEnrollStudents === true || String(ctx.teacher.canEnrollStudents).toLowerCase() === 'true') && (!ctx.teacher.enrollmentPermissionUntil || String(ctx.teacher.enrollmentPermissionUntil).slice(0,10) >= Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'))) return;
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
    return records;
}

function getRecord(ctx, collection, id) {
    checkPermission(ctx, 'get', collection);
    if (ctx.role === 'teacher' && collection === 'teachers' && String(id) !== String(ctx.teacher.id)) throw new Error('Teachers may only view their own permission settings.');
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
            if(ctx.role==='teacher' && collection==='students' && !teacherOwns(ctx,r)) throw new Error('Record outside assigned class.');
            if(ctx.role==='teacher' && collection==='teachers') return {id:r.id,name:r.name,assignedClass:r.assignedClass,assignedSection:r.assignedSection,canEnrollStudents:r.canEnrollStudents,enrollmentPermissionUntil:r.enrollmentPermissionUntil,canCompleteStudentProfiles:r.canCompleteStudentProfiles};
            return r;
        }
    }
    return null;
}

function addRecord(ctx, collection, record) {
    assertSchoolWritable(ctx.schoolId);
    checkPermission(ctx, 'add', collection);
    if (collection === 'studentRequests' && ctx.role === 'student') {
        const type = String(record.requestType || 'help');
        if (['help','sick_leave'].indexOf(type) === -1) throw new Error('Invalid request type.');
        const message = String(record.message || '').trim();
        if (!message || message.length > 3000) throw new Error('Describe your problem (maximum 3000 characters).');
        const from = String(record.leaveFrom || ''), to = String(record.leaveTo || '');
        if (type === 'sick_leave' && (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to)) throw new Error('Enter a valid sick leave date range.');
        record = {studentId:ctx.student.id,studentName:ctx.student.name || '',enrlNo:ctx.student.enrlNo || '',class:ctx.student.class || '',section:ctx.student.section || '',requestType:type,subject:String(record.subject || '').slice(0,120),message:message,leaveFrom:type==='sick_leave'?from:'',leaveTo:type==='sick_leave'?to:'',status:'Pending',teacherReply:'',adminReply:'',assignedTeacherId:'',updatedAt:new Date().toISOString(),reviewedBy:''};
    }
    if (ctx.role === 'teacher' && TEACHER_WRITE_COLLECTIONS.indexOf(collection) !== -1) {
        record = Object.assign({}, record, { class: ctx.teacher.assignedClass, section: ctx.teacher.assignedSection || '', markedBy: ctx.teacher.name, assignedBy: ctx.teacher.name });
    }
    // Enforce uniqueness at the school database, not only in the browser.
    // A class is not a unique identity: students can change classes or sessions.
    var enrollmentLock = collection === 'students' ? LockService.getScriptLock() : null;
    if (enrollmentLock && !enrollmentLock.tryLock(15000)) throw new Error('Enrollment is busy. Please retry.');
    try {
    if (collection === 'students') {
        record = Object.assign({}, record);
        if (ctx.role === 'teacher') {
            // Ignore untrusted teacher-supplied fields, especially credentials and privileged flags.
            var permittedStudentFields = ['enrlNo','name','fatherGuardian','class','section','contact','whatsapp','cnic','admissionDate'];
            var submitted = record;
            record = {};
            permittedStudentFields.forEach(function(k){if(submitted[k] !== undefined)record[k]=submitted[k];});
            if (!ctx.teacher.assignedClass) throw new Error('Teacher has no assigned class.');
            if (!sameClass(record.class, ctx.teacher.assignedClass) || String(record.section || '').trim().toLowerCase() !== String(ctx.teacher.assignedSection || '').trim().toLowerCase()) throw new Error('Enrollment is limited to your assigned class and section.');
            record.class = ctx.teacher.assignedClass;
            record.section = ctx.teacher.assignedSection || '';
            record.enrolledByTeacherId = ctx.teacher.id;
            record.enrolledByTeacherName = ctx.teacher.name;
        }
        record.enrlNo = String(record.enrlNo || '').trim();
        record.name = String(record.name || '').trim();
        if (!record.enrlNo || !record.name || !String(record.class || '').trim()) throw new Error('Enrollment number, name and class are required.');
        var existingSheet = getCollectionSheet(ctx, 'students');
        var existingData = existingSheet.sheet.getDataRange().getValues();
        var eCol = existingSheet.headers.indexOf('enrlNo'), bCol = existingSheet.headers.indexOf('cnic');
        var normalizeId = function(v){return String(v || '').replace(/[\s-]/g,'').toLowerCase();};
        var wantedId = normalizeId(record.enrlNo), wantedB = normalizeId(record.cnic);
        for (var si=1;si<existingData.length;si++){
            if (normalizeId(existingData[si][eCol]) === wantedId) throw new Error('Enrollment number already exists at this school.');
            if (wantedB && bCol >= 0 && normalizeId(existingData[si][bCol]) === wantedB) throw new Error('B-Form number already exists at this school.');
        }
    }
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
    if (collection === 'students') {
        // Notification is non-blocking: never duplicate an enrollment because a message failed.
        try {
            var nSheet = getCollectionSheet(ctx, 'notifications');
            var notification = {id:genId('not'),title:'New student enrolled',message:'Student '+full.name+' (Enrollment '+full.enrlNo+') joined Class '+full.class+(full.section?' / '+full.section:'')+'.',audience:'school',status:'Published',isPublished:true,createdAt:new Date().toISOString()};
            nSheet.sheet.appendRow(recordToRow(nSheet.headers,notification));
        } catch(notifyError){console.error('Enrollment notification failed: '+notifyError.message);}
    }
    return full;
    } finally {if(enrollmentLock)enrollmentLock.releaseLock();}
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
            if (ctx.role === 'teacher' && collection === 'students' && !sameClass(existing.class, ctx.teacher.assignedClass)) {
                throw new Error('Teachers can only update students in their own assigned class.');
            }
            if(ctx.role==='teacher') {
                if(collection==='students') {
                    if(!teacherOwns(ctx,existing)) throw new Error('Student outside assigned class/section.');
                    const allowed=['subjects','teacherRemarks']; if(ctx.teacher.canCompleteStudentProfiles===true || String(ctx.teacher.canCompleteStudentProfiles).toLowerCase()==='true') allowed.push('address','photo','contact','whatsapp','guardianName','guardianCell','guardianRelation','guardianAddress','guardianProfession','fatherGuardian','dob','gender','distanceFromSchool');
                    if(Object.keys(patch).some(k=>allowed.indexOf(k)===-1)) throw new Error('Teachers may only update student marks and teacher remarks.');
                } else if(TEACHER_WRITE_COLLECTIONS.indexOf(collection)!==-1) {
                    if(!teacherOwns(ctx,existing)) throw new Error('Record outside assigned class/section.');
                    patch=Object.assign({},patch,{class:ctx.teacher.assignedClass,section:ctx.teacher.assignedSection||''});
                }
            }
            if (collection === 'teachers' && ctx.role === 'school' && (Object.prototype.hasOwnProperty.call(patch,'canEnrollStudents') || Object.prototype.hasOwnProperty.call(patch,'enrollmentPermissionUntil'))) {
                var granting = patch.canEnrollStudents === true || String(patch.canEnrollStudents).toLowerCase() === 'true' || (!Object.prototype.hasOwnProperty.call(patch,'canEnrollStudents') && (existing.canEnrollStudents === true || String(existing.canEnrollStudents).toLowerCase() === 'true'));
                if (granting) {
                    if (!existing.assignedClass) throw new Error('Assign a class before granting enrollment authority.');
                    var activeGrants=0, teacherIdIndex=headers.indexOf('id'), grantIndex=headers.indexOf('canEnrollStudents'), expiryIndex=headers.indexOf('enrollmentPermissionUntil');
                    var today=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd');
                    for(var g=1;g<data.length;g++){
                        if(String(data[g][teacherIdIndex])===String(id))continue;
                        var hasGrant=String(data[g][grantIndex]).toLowerCase()==='true', expiry=expiryIndex>=0?String(data[g][expiryIndex]||'').slice(0,10):'';
                        if(hasGrant && (!expiry || expiry>=today))activeGrants++;
                    }
                    if(activeGrants>=2)throw new Error('Maximum two enrollment officers per school. Revoke an existing grant first.');
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
            const updated = Object.assign({}, existing, patch, { id });
            sheet.getRange(i + 1, 1, 1, headers.length).setValues([recordToRow(headers, updated)]);
            if(ctx.auditActor)writeAudit(ctx.ss,ctx.schoolId,ctx.auditActor,'update',collection,id,existing,updated);
            return updated;
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
            if(ctx.auditActor)writeAudit(ctx.ss,ctx.schoolId,ctx.auditActor,'remove',collection,id,previous,null);
            sheet.deleteRow(i + 1);
            return true;
        }
    }
    return false;
}

/** Admin sends a one-tap reminder to a teacher who hasn't marked attendance yet. */
function pingTeacher(schoolId, apiKey, teacherId, message) {
    assertSchoolWritable(schoolId);
    const match = authorizeSchool(schoolId, apiKey);
    const ss = SpreadsheetApp.openById(match.obj.sheetId);
    const ctx = { role: 'school', ss };
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
function adminListSchoolUsers(p){
  authorizeAdmin(p.adminApiKey);
  const u=adminUsers(p.schoolId);
  return u.items.map(x=>({id:x.obj.id,username:x.obj.username,displayName:x.obj.displayName,status:x.obj.status,createdAt:x.obj.createdAt,updatedAt:x.obj.updatedAt}));
}
function adminSaveSchoolUser(p){
  authorizeAdmin(p.adminApiKey);
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
    writeAudit(u.ss,p.schoolId,{id:'superadmin',name:'Super Admin',role:'superadmin'},old?'update':'add','schoolAdmins',record.id,old?{username:old.username,displayName:old.displayName,status:old.status}:null,{username,displayName,status});
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

function handleRequest(params) {
    const action = params.action;
    try {
        const protectedActions=['updateSchoolConfig','pingTeacher','addTeacher','bulkAttendance','add','update','remove'];
        if(protectedActions.indexOf(action)!==-1 && (params.role||'school')==='school') {
          params._auditActor=requireSchoolAdminWrite(params);
        }
        switch (action) {
            case 'adminListSchoolUsers': return {status:'success',users:adminListSchoolUsers(params)};
            case 'adminSaveSchoolUser': return {status:'success',user:adminSaveSchoolUser(params)};
            case 'adminGetAudit': return {status:'success',records:adminGetAudit(params)};
            case 'schoolAdminSetup':
                return {status:'success',result:schoolAdminSetup(params)};
            case 'schoolAdminLogin':
                return {status:'success',result:schoolAdminLogin(params)};
            case 'schoolAdminVerify':
                return {status:'success',result:schoolAdminVerify(params)};
            case 'register':
                return { status: 'success', school: registerSchool(params) };
            case 'login':
                return { status: 'success', school: loginSchool(params.email, params.password) };
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
            case 'getSubscriptionStatus':
                return { status: 'success', subscription: getSubscriptionStatus(params.schoolId, params.apiKey) };
            case 'adminListSchools':
                return { status: 'success', schools: adminListSchools(params.adminApiKey) };
            case 'adminSetStatus':
                return { status: 'success', result: adminSetStatus(params.adminApiKey, params.schoolId, params.newStatus) };
            case 'adminResetPassword':
                return { status: 'success', result: adminResetPassword(params.adminApiKey, params.schoolId) };

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
                return { status: 'success', record: addRecord(resolveContext(params), params.collection, params.record || {}) };
            case 'update':
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
    const blocked=['schoolAdminSetup','adminSaveSchoolUser','adminSetSubscription','adminSetStatus','adminResetPassword','register','updateSchoolConfig','pingTeacher','acknowledgePing','addTeacher','bulkAttendance','add','update','remove'];
    if(blocked.indexOf(params.action)!==-1)return jsonOut({status:'error',message:'POST required for this action.'});
    return jsonOut(handleRequest(params));
}



