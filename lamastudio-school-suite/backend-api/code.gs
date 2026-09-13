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
 * 1. Go to https://script.google.com -> New project.
 * 2. Delete the placeholder code, paste this ENTIRE file in.
 * 3. In the toolbar function dropdown, select "setup", then click Run.
 *    Approve the permissions Google asks for. This creates your
 *    "LamaStudio Master Registry" spreadsheet.
 * 4. Open this file, find SUPER_ADMIN_PASSWORD_PLAINTEXT near the top,
 *    change 'change-this-password' to whatever you want your own super
 *    admin password to be. Select "setupSuperAdmin" in the function
 *    dropdown, click Run. This hashes and stores it — the plaintext in
 *    the code is never used again after this, so you can leave it (or
 *    blank it out) once it's run.
 * 5. Click Deploy -> New deployment.
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
const SUPER_ADMIN_PASSWORD_PLAINTEXT = 'change-this-password'; // edit, then run setupSuperAdmin() once

// Every collection listed here automatically gets full CRUD via the generic
// list/get/add/update/remove functions further down. Field names ending in
// "Json" are stored as JSON text in one cell and parsed back transparently.
const COLLECTIONS = {
    students: {
        tab: 'Students',
        headers: ['id', 'enrlNo', 'name', 'gender', 'dob', 'fatherGuardian', 'contact', 'class',
                  'subjectsJson', 'position', 'photo', 'behavioralJson', 'attendance',
                  'teacherRemarks', 'principalRemarks', 'remarks', 'password', 'apiKey', 'createdAt']
    },
    teachers: {
        tab: 'Teachers',
        headers: ['id', 'name', 'email', 'passwordHash', 'apiKey', 'subject', 'assignedClass',
                  'contact', 'status', 'createdAt']
    },
    attendance: {
        tab: 'Attendance',
        headers: ['id', 'studentId', 'studentName', 'class', 'date', 'status', 'markedBy', 'createdAt']
    },
    homework: {
        tab: 'Homework',
        headers: ['id', 'class', 'subject', 'title', 'description', 'dueDate', 'assignedBy', 'createdAt']
    },
    fees: {
        tab: 'Fees',
        headers: ['id', 'studentId', 'studentName', 'class', 'amount', 'date', 'status', 'method', 'createdAt']
    },
    datesheet: {
        tab: 'DateSheet',
        headers: ['id', 'examTitle', 'class', 'subject', 'date', 'time', 'invigilator', 'createdAt']
    },
    tests: {
        tab: 'Tests',
        headers: ['id', 'class', 'subject', 'type', 'date', 'totalMarks', 'topics', 'createdAt']
    },
    notifications: {
        tab: 'Notifications',
        headers: ['id', 'title', 'audience', 'channel', 'message', 'status', 'createdAt']
    }
};

// ============================================================================
// ONE-TIME SETUP
// ============================================================================

function setup() {
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty('MASTER_SHEET_ID')) {
        Logger.log('Already set up. Master Registry ID: ' + props.getProperty('MASTER_SHEET_ID'));
        return;
    }
    const ss = SpreadsheetApp.create('LamaStudio Master Registry');
    const sheet = ss.getActiveSheet();
    sheet.setName(REGISTRY_SHEET_NAME);
    sheet.appendRow([
        'schoolId', 'name', 'address', 'phone', 'principal', 'type', 'level', 'adminEmail',
        'passwordHash', 'apiKey', 'sheetId', 'logo', 'shortCode', 'plan', 'status', 'createdAt'
    ]);
    props.setProperty('MASTER_SHEET_ID', ss.getId());
    Logger.log('Setup complete. Master Registry: ' + ss.getUrl());
}

/** Run once (after editing SUPER_ADMIN_PASSWORD_PLAINTEXT above) to set your super admin password. */
function setupSuperAdmin() {
    const props = PropertiesService.getScriptProperties();
    const hash = hashPassword(SUPER_ADMIN_PASSWORD_PLAINTEXT, 'SUPERADMIN');
    props.setProperty('SUPERADMIN_PASSWORD_HASH', hash);
    Logger.log('Super admin password set. You can now log in from super-admin-login.html.');
}

function getRegistrySheet() {
    const props = PropertiesService.getScriptProperties();
    let id = props.getProperty('MASTER_SHEET_ID');
    if (!id) {
        setup();
        id = props.getProperty('MASTER_SHEET_ID');
    }
    return SpreadsheetApp.openById(id).getSheetByName(REGISTRY_SHEET_NAME);
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
 * Passwords are never stored in plain text for school admins or teachers.
 * This is a lightweight hash (SHA-256, salted) suitable for a small free
 * tool — it is NOT the same bar as a bank or hospital system. Student
 * portal passwords are stored as plain text by design (low-sensitivity
 * data — homework/attendance, not financial or health records — and it
 * keeps the "add a student" flow simple for school staff). If this suite
 * ever handles more sensitive data, swap in a real auth provider.
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
function createSchoolSheet(schoolName) {
    const ss = SpreadsheetApp.create(schoolName + ' - LamaStudio Data');
    const defaultSheet = ss.getSheets()[0];
    Object.keys(COLLECTIONS).forEach(key => {
        const cfg = COLLECTIONS[key];
        const sh = ss.insertSheet(cfg.tab);
        sh.appendRow(cfg.headers);
        sh.setFrozenRows(1);
    });
    ss.deleteSheet(defaultSheet);
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
        p.logo || '', shortCode, 'Free', 'Active', new Date().toISOString()
    ]);

    return {
        schoolId, apiKey, name: p.name.trim(), address: p.address || '', phone: p.phone || '',
        principal: p.principal || '', type: p.type || 'Private', level: p.level || 'High',
        logo: p.logo || '', shortCode
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
        type: match.obj.type, level: match.obj.level, logo: match.obj.logo, shortCode: match.obj.shortCode
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
        type: o.type, level: o.level, logo: o.logo, shortCode: o.shortCode
    };
}

function updateSchoolConfig(schoolId, apiKey, patch) {
    const match = authorizeSchool(schoolId, apiKey);
    const registry = getRegistrySheet();
    const updated = Object.assign({}, match.obj, patch, { schoolId: match.obj.schoolId, apiKey: match.obj.apiKey });
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
            createdAt: row.createdAt, studentCount, teacherCount
        });
    }
    return out;
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
    if (!p.name || !p.email || !p.password || p.password.length < 6) {
        throw new Error('Name, email, and a password of at least 6 characters are required.');
    }
    const match = authorizeSchool(schoolId, apiKey);
    const ss = SpreadsheetApp.openById(match.obj.sheetId);
    const sheet = ss.getSheetByName(COLLECTIONS.teachers.tab);
    const existing = sheet.getDataRange().getValues();
    for (let i = 1; i < existing.length; i++) {
        if (String(existing[i][2]).toLowerCase() === p.email.toLowerCase()) {
            throw new Error('A teacher with this email already exists at this school.');
        }
    }
    const id = genId('tch');
    const teacherApiKey = Utilities.getUuid();
    const record = {
        id, name: p.name.trim(), email: p.email.trim().toLowerCase(),
        passwordHash: hashPassword(p.password, id), apiKey: teacherApiKey,
        subject: p.subject || '', assignedClass: p.assignedClass || '',
        contact: p.contact || '', status: 'Active', createdAt: new Date().toISOString()
    };
    sheet.appendRow(recordToRow(COLLECTIONS.teachers.headers, record));
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
        if (String(row.email).toLowerCase() === email.toLowerCase()) {
            if (row.status !== 'Active') throw new Error('This teacher account has been disabled by the school.');
            if (hashPassword(password, row.id) !== row.passwordHash) throw new Error('Incorrect password.');
            return {
                schoolId, teacherId: row.id, apiKey: row.apiKey, name: row.name,
                subject: row.subject, assignedClass: row.assignedClass,
                schoolName: schoolMatch.obj.name, schoolLogo: schoolMatch.obj.logo
            };
        }
    }
    throw new Error('No teacher account found with this email at this school.');
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
                schoolId, studentId: row.id, apiKey: row.apiKey, name: row.name, class: row.class,
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
        return { role, ss: SpreadsheetApp.openById(match.obj.sheetId) };
    }
    if (role === 'teacher') {
        const ctx = authorizeTeacher(p.schoolId, p.teacherId, p.apiKey);
        return { role, ss: ctx.ss, teacher: ctx.teacher };
    }
    if (role === 'student') {
        const ctx = authorizeStudent(p.schoolId, p.studentId, p.apiKey);
        return { role, ss: ctx.ss, student: ctx.student };
    }
    throw new Error('Unknown role: ' + role);
}

const TEACHER_WRITE_COLLECTIONS = ['attendance', 'homework', 'notifications'];
const TEACHER_READ_COLLECTIONS = ['students', 'datesheet', 'tests'];
const STUDENT_READ_COLLECTIONS = ['homework', 'datesheet', 'tests', 'notifications'];

function checkPermission(ctx, action, collection) {
    if (ctx.role === 'school') return; // full access, unchanged
    if (ctx.role === 'teacher') {
        if (TEACHER_WRITE_COLLECTIONS.indexOf(collection) !== -1) return; // add/update/remove ok
        if (collection === 'students' && (action === 'list' || action === 'get' || action === 'update')) return;
        if (TEACHER_READ_COLLECTIONS.indexOf(collection) !== -1 && (action === 'list' || action === 'get')) return;
        throw new Error('Teachers do not have permission for this action.');
    }
    if (ctx.role === 'student') {
        if (collection === 'students' && action === 'get') return;
        if (STUDENT_READ_COLLECTIONS.indexOf(collection) !== -1 && action === 'list') return;
        throw new Error('Students only have read access to their own record and class information.');
    }
    throw new Error('This role cannot access collections directly.');
}

function getCollectionSheet(ctx, collection) {
    const cfg = COLLECTIONS[collection];
    if (!cfg) throw new Error('Unknown collection: ' + collection);
    return { sheet: ctx.ss.getSheetByName(cfg.tab), headers: cfg.headers };
}

function listRecords(ctx, collection) {
    checkPermission(ctx, 'list', collection);
    const { sheet, headers } = getCollectionSheet(ctx, collection);
    const data = sheet.getDataRange().getValues();
    let records = [];
    for (let i = 1; i < data.length; i++) {
        if (!data[i][0]) continue;
        records.push(rowToRecord(headers, data[i]));
    }
    if (ctx.role === 'teacher' && (collection === 'attendance' || collection === 'homework' || collection === 'students')) {
        records = records.filter(r => String(r.class) === String(ctx.teacher.assignedClass));
    }
    if (ctx.role === 'student' && (collection === 'homework' || collection === 'datesheet' || collection === 'tests')) {
        records = records.filter(r => String(r.class) === String(ctx.student.class));
    }
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
        if (data[i][0] === id) return rowToRecord(headers, data[i]);
    }
    return null;
}

function addRecord(ctx, collection, record) {
    checkPermission(ctx, 'add', collection);
    if (ctx.role === 'teacher' && TEACHER_WRITE_COLLECTIONS.indexOf(collection) !== -1) {
        record = Object.assign({}, record, { class: ctx.teacher.assignedClass, markedBy: ctx.teacher.name, assignedBy: ctx.teacher.name });
    }
    const { sheet, headers } = getCollectionSheet(ctx, collection);
    const id = genId(collection.slice(0, 3));
    const full = Object.assign({}, record, { id, createdAt: new Date().toISOString() });
    if (collection === 'students' && !full.apiKey) full.apiKey = Utilities.getUuid();
    if (collection === 'students' && !full.password) full.password = full.enrlNo || id;
    sheet.appendRow(recordToRow(headers, full));
    return full;
}

function updateRecord(ctx, collection, id, patch) {
    checkPermission(ctx, 'update', collection);
    const { sheet, headers } = getCollectionSheet(ctx, collection);
    const data = sheet.getDataRange().getValues();
    const idCol = headers.indexOf('id');
    for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === id) {
            const existing = rowToRecord(headers, data[i]);
            if (ctx.role === 'teacher' && collection === 'students' && String(existing.class) !== String(ctx.teacher.assignedClass)) {
                throw new Error('Teachers can only update students in their own assigned class.');
            }
            const updated = Object.assign({}, existing, patch, { id });
            sheet.getRange(i + 1, 1, 1, headers.length).setValues([recordToRow(headers, updated)]);
            return updated;
        }
    }
    throw new Error('Record not found: ' + id);
}

function removeRecord(ctx, collection, id) {
    checkPermission(ctx, 'remove', collection);
    const { sheet, headers } = getCollectionSheet(ctx, collection);
    const data = sheet.getDataRange().getValues();
    const idCol = headers.indexOf('id');
    for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === id) {
            sheet.deleteRow(i + 1);
            return true;
        }
    }
    return false;
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
    let totalStudents = 0;
    for (let i = 1; i < studentRows.length; i++) { if (studentRows[i][0]) totalStudents++; }

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

    const feesSheet = ss.getSheetByName(COLLECTIONS.fees.tab);
    const feeRows = feesSheet.getDataRange().getValues();
    const feeHeaders = feeRows[0];
    let todayCollection = 0;
    const monthTotals = {};
    for (let i = 1; i < feeRows.length; i++) {
        const r = rowToRecord(feeHeaders, feeRows[i]);
        if (!r.id || r.status !== 'Paid') continue;
        const amt = Number(r.amount) || 0;
        if (String(r.date) === todayStr) todayCollection += amt;
        const month = String(r.date || '').slice(0, 7);
        if (month) monthTotals[month] = (monthTotals[month] || 0) + amt;
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

    return {
        totalStudents, presentToday, absentToday, attendanceRatio,
        todayCollection, incomeSeries, recentNotifications: notifications.slice(0, 5)
    };
}

// ============================================================================
// HTTP ENTRY POINTS
// ============================================================================

function jsonOut(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function handleRequest(params) {
    const action = params.action;
    try {
        switch (action) {
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

            case 'addTeacher':
                return { status: 'success', teacher: addTeacher(params.schoolId, params.apiKey, params.teacher || {}) };
            case 'teacherLogin':
                return { status: 'success', teacher: teacherLogin(params.schoolId, params.email, params.password) };

            case 'studentLogin':
                return { status: 'success', student: studentLogin(params.schoolId, params.enrlNo, params.password) };

            case 'adminLogin':
                return { status: 'success', admin: adminLogin(params.password) };
            case 'adminListSchools':
                return { status: 'success', schools: adminListSchools(params.adminApiKey) };
            case 'adminSetStatus':
                return { status: 'success', result: adminSetStatus(params.adminApiKey, params.schoolId, params.newStatus) };
            case 'adminResetPassword':
                return { status: 'success', result: adminResetPassword(params.adminApiKey, params.schoolId) };

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
    return jsonOut(handleRequest(e.parameter));
}
