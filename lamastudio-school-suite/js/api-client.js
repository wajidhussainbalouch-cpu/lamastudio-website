/**
 * LamaStudio School Suite — Live API Client (multi-role)
 * -------------------------------------------------------------
 * Every read and write here goes over the network to your Google Apps
 * Script backend (code.gs), so data is the same no matter which device
 * or browser someone logs in from.
 *
 * FOUR roles share this one client, distinguished by session.role:
 *   'school'  — School Admin (unchanged from before)
 *   'teacher' — a teacher account, scoped to one class
 *   'student' — a student portal login, scoped to their own record/class
 *   'admin'   — the Super Admin (you)
 *
 * SETUP: paste your deployed Apps Script Web App URL below (it ends in
 * /exec). That is the ONLY thing you need to configure in this file.
 */
const API_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

const LamaAPI = (function () {
    const SESSION_KEY = 'lamastudio_session';

    function getSession() {
        try {
            return JSON.parse(localStorage.getItem(SESSION_KEY));
        } catch (e) {
            return null;
        }
    }

    function setSession(session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    function isLoggedIn() {
        return !!getSession();
    }

    /** The identity fields sent with every request, shaped by the session's role. */
    function authFieldsFor(session) {
        if (!session) return {};
        if (session.role === 'teacher') {
            return { role: 'teacher', schoolId: session.schoolId, teacherId: session.teacherId, apiKey: session.apiKey };
        }
        if (session.role === 'student') {
            return { role: 'student', schoolId: session.schoolId, studentId: session.studentId, apiKey: session.apiKey };
        }
        if (session.role === 'admin') {
            return { role: 'admin', adminApiKey: session.adminApiKey };
        }
        // 'school' (or legacy sessions saved before role existed)
        return { role: 'school', schoolId: session.schoolId, apiKey: session.apiKey };
    }

    /**
     * Core request function. GETs (list/get/getSchoolConfig/...) go as a query
     * string. Everything else POSTs as text/plain — NOT application/json —
     * on purpose: a JSON content-type would trigger a CORS preflight
     * (an OPTIONS request), which Apps Script Web Apps cannot answer, and
     * the whole call would fail. Sending text/plain sidesteps that; the
     * backend still parses the body as JSON either way.
     */
    async function callApi(action, payload, method) {
        if (API_URL.indexOf('PASTE_YOUR') === 0) {
            throw new Error('The API is not configured yet — paste your Apps Script Web App URL into api-client.js.');
        }
        method = method || 'POST';
        const authFields = authFieldsFor(getSession());
        const body = Object.assign({ action: action }, authFields, payload || {});

        let response;
        if (method === 'GET') {
            const qs = new URLSearchParams();
            Object.keys(body).forEach(k => {
                if (body[k] !== undefined && body[k] !== null) qs.set(k, body[k]);
            });
            response = await fetch(`${API_URL}?${qs.toString()}`, { method: 'GET' });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(body)
            });
        }

        const data = await response.json();
        if (data.status !== 'success') {
            throw new Error(data.message || 'Something went wrong. Please try again.');
        }
        return data;
    }

    // ---- School Admin: registration, login ----

    async function register(schoolData) {
        const data = await callApi('register', schoolData, 'POST');
        setSession(Object.assign({}, data.school, { role: 'school' }));
        return data.school;
    }

    async function login(email, password) {
        const data = await callApi('login', { email, password }, 'POST');
        setSession(Object.assign({}, data.school, { role: 'school' }));
        return data.school;
    }

    // ---- Teacher: login (accounts are created by the School Admin, not self-registered) ----

    async function teacherLogin(schoolId, email, password) {
        const data = await callApi('teacherLogin', { schoolId, email, password }, 'POST');
        setSession(Object.assign({}, data.teacher, { role: 'teacher' }));
        return data.teacher;
    }

    // ---- Student: login ----

    async function studentLogin(schoolId, enrlNo, password) {
        const data = await callApi('studentLogin', { schoolId, enrlNo, password }, 'POST');
        setSession(Object.assign({}, data.student, { role: 'student' }));
        return data.student;
    }

    // ---- Super Admin: login ----

    async function adminLogin(password) {
        const data = await callApi('adminLogin', { password }, 'POST');
        setSession(Object.assign({}, data.admin, { role: 'admin' }));
        return data.admin;
    }

    // ---- Session / route guarding ----

    function logout() {
        clearSession();
    }

    /**
     * Redirects to the right login page if no one is logged in, or if the
     * wrong kind of account is logged in for this page (e.g. a student
     * session trying to open the teacher dashboard). Call at the top of
     * every protected page.
     */
    function requireLogin(expectedRole, loginPage) {
        const session = getSession();
        if (!session || session.role !== expectedRole) {
            window.location.href = loginPage || 'login.html';
            return false;
        }
        return true;
    }

    // ---- School profile (role: school) ----

    async function getActiveSchool() {
        const session = getSession();
        if (!session) return null;
        try {
            const data = await callApi('getSchoolConfig', {}, 'GET');
            const merged = Object.assign({}, session, data.school);
            setSession(merged);
            return merged;
        } catch (e) {
            console.warn('LamaAPI.getActiveSchool: serving cached session —', e.message);
            return session;
        }
    }

    async function updateSchoolConfig(patch) {
        const data = await callApi('updateSchoolConfig', { patch }, 'POST');
        setSession(Object.assign({}, getSession(), data.school));
        return data.school;
    }

    async function getDashboardStats() {
        const data = await callApi('getDashboardStats', {}, 'GET');
        return data.stats;
    }

    async function getStudentFeeSummary(studentId) {
        const data = await callApi('getStudentFeeSummary', { studentId }, 'GET');
        return data.summary;
    }

    // ---- Shared Main Dashboard (school / teacher / student — no fees or HR data) ----

    async function getMainDashboardData() {
        const data = await callApi('getMainDashboardData', {}, 'GET');
        return data.data;
    }

    // ---- Teacher attendance pings (role: school sends, role: teacher acknowledges) ----

    async function pingTeacher(teacherId, message) {
        const data = await callApi('pingTeacher', { teacherId, message }, 'POST');
        return data.ping;
    }

    async function acknowledgePing(pingId) {
        const data = await callApi('acknowledgePing', { pingId }, 'POST');
        return data.ping;
    }

    function deriveShortCode(name) {
        return String(name || 'SCH').split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 3) || 'SCH';
    }

    // ---- Staff management (role: school) ----

    async function addTeacher(teacherData) {
        const data = await callApi('addTeacher', { teacher: teacherData }, 'POST');
        return data.teacher;
    }

    // ---- Super Admin actions (role: admin) ----

    async function adminListSchools() {
        const data = await callApi('adminListSchools', {}, 'GET');
        return data.schools;
    }

    async function adminSetStatus(schoolId, newStatus) {
        const data = await callApi('adminSetStatus', { schoolId, newStatus }, 'POST');
        return data.result;
    }

    async function adminResetPassword(schoolId) {
        const data = await callApi('adminResetPassword', { schoolId }, 'POST');
        return data.result;
    }

    // ---- Generic role-aware collection CRUD ----
    // (students / teachers / attendance / homework / fees / datesheet / tests / notifications —
    //  the backend scopes what each role may see or touch automatically.)

    async function list(collection) {
        const data = await callApi('list', { collection }, 'GET');
        return data.records;
    }

    async function get(collection, id) {
        const data = await callApi('get', { collection, id }, 'GET');
        return data.record;
    }

    async function add(collection, record) {
        const data = await callApi('add', { collection, record }, 'POST');
        return data.record;
    }

    async function update(collection, id, patch) {
        const data = await callApi('update', { collection, id, patch }, 'POST');
        return data.record;
    }

    async function remove(collection, id) {
        await callApi('remove', { collection, id }, 'POST');
    }

    return {
        register, login, teacherLogin, studentLogin, adminLogin,
        logout, isLoggedIn, requireLogin, getSession,
        getActiveSchool, updateSchoolConfig, getDashboardStats, getStudentFeeSummary, deriveShortCode, addTeacher,
        getMainDashboardData, pingTeacher, acknowledgePing,
        adminListSchools, adminSetStatus, adminResetPassword,
        list, get, add, update, remove
    };
})();
