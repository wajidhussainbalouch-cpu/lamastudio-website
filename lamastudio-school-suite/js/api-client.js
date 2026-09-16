/**
 * LamaStudio School Suite — Live API Client (multi-role)
 * -------------------------------------------------------------
 * Every read and write here goes over the network to your Google Apps
 * Script backend (code.gs), so data is the same no matter which device
 * or browser someone logs in from.
 *
 * FOUR roles share this one client, distinguished by session.role:
 *   'school'  — School Admin
 *   'teacher' — A teacher account, scoped to one class
 *   'student' — A student portal login, scoped to their own record/class
 *   'admin'   — The Super Admin
 *
 * SETUP: Your deployed Apps Script Web App URL has been populated below.
 */
const API_URL = 'https://script.google.com/macros/library/d/1jk4d1ze1Na6Y15elj5yYXiQwQ4NBTTDRAYJz6DGVrgv6EqcLjZA1oNN7/9';

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
        return { role: 'school', schoolId: session.schoolId, apiKey: session.apiKey };
    }

    /**
     * Core request function. GET requests go as a query string.
     * Everything else POSTs as text/plain to avoid CORS preflight issues.
     */
    async function callApi(action, payload, method) {
        if (!API_URL || API_URL.trim() === '') {
            throw new Error('The API URL is not configured in api-client.js.');
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

    // ---- School Admin: Registration & Login ----
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

    // ---- Teacher: Login ----
    async function teacherLogin(schoolId, email, password) {
        const data = await callApi('teacherLogin', { schoolId, email, password }, 'POST');
        setSession(Object.assign({}, data.teacher, { role: 'teacher' }));
        return data.teacher;
    }

    // ---- Student: Login ----
    async function studentLogin(schoolId, enrlNo, password) {
        const data = await callApi('studentLogin', { schoolId, enrlNo, password }, 'POST');
        setSession(Object.assign({}, data.student, { role: 'student' }));
        return data.student;
    }

    // ---- Super Admin: Login ----
    async function adminLogin(password) {
        const data = await callApi('adminLogin', { password }, 'POST');
        setSession(Object.assign({}, data.admin, { role: 'admin' }));
        return data.admin;
    }

    // ---- Session & Route Guarding ----
    function logout() {
        clearSession();
    }

    function requireLogin(expectedRole, loginPage) {
        const session = getSession();
        if (!session || session.role !== expectedRole) {
            window.location.href = loginPage || 'login.html';
            return false;
        }
        return true;
    }

    // ---- School Profile & Dashboard Data ----
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

    async function getMainDashboardData() {
        const data = await callApi('getMainDashboardData', {}, 'GET');
        return data.data;
    }

    // ---- Teacher Attendance Pings ----
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

    async function addTeacher(teacherData) {
        const data = await callApi('addTeacher', { teacher: teacherData }, 'POST');
        return data.teacher;
    }

    // ---- Super Admin Actions ----
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

    // ---- Generic Collection CRUD ----
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
