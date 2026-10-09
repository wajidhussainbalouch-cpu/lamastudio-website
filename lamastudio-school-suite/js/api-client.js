/** Lama School Suite — role-isolated Google Apps Script API client */
const API_URL = 'https://script.google.com/macros/s/AKfycbzKX6oxKJH98jfdMOJt9597AKG4T6yBNttfTuO3eUtgLizdVmHKGZL6fEXyn3xYJ_ydBQ/exec';
const LamaAPI = (() => {
  const ROLES = ['school','teacher','student','admin'];
  const legacyKey = 'lamastudio_session';
  const key = role => 'lamastudio_session_' + role;
  const activeKey = 'lamastudio_active_role';
  const parse = value => { try { return value ? JSON.parse(value) : null; } catch (_) { return null; } };
  function migrate() {
    const old = parse(localStorage.getItem(legacyKey));
    if (old && ROLES.includes(old.role) && !localStorage.getItem(key(old.role))) localStorage.setItem(key(old.role), JSON.stringify(old));
    if (old) localStorage.removeItem(legacyKey);
  }
  migrate();
  function activeRole() { return sessionStorage.getItem(activeKey) || 'school'; }
  function getSession(role) { return parse(localStorage.getItem(key(role || activeRole()))); }
  function setSession(session) {
    if (!session || !ROLES.includes(session.role)) throw Error('Invalid login role.');
    localStorage.setItem(key(session.role), JSON.stringify(session));
    sessionStorage.setItem(activeKey, session.role);
  }
  function clearSession(role) {
    const target = role || activeRole();
    localStorage.removeItem(key(target));
    if (activeRole() === target) sessionStorage.removeItem(activeKey);
  }
  function isLoggedIn(role) { return !!getSession(role); }
  function authFieldsFor(session) {
    if (!session) return {};
    if (session.role === 'teacher') return { role:'teacher', schoolId:session.schoolId, teacherId:session.teacherId || session.id, apiKey:session.apiKey };
    if (session.role === 'student') return { role:'student', schoolId:session.schoolId, studentId:session.studentId || session.id, apiKey:session.apiKey };
    if (session.role === 'admin') return { role:'admin', adminApiKey:session.adminApiKey };
    return { role:'school', schoolId:session.schoolId, apiKey:session.apiKey };
  }
  async function callApi(action, payload = {}, method = 'POST', role) {
    const body = Object.assign({action}, authFieldsFor(getSession(role)), payload);
    let response;
    try {
      if (method === 'GET') {
        const params = new URLSearchParams();
        Object.entries(body).forEach(([k,v]) => { if (v !== undefined && v !== null) params.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v)); });
        response = await fetch(API_URL + '?' + params.toString(), {method:'GET',redirect:'follow'});
      } else {
        response = await fetch(API_URL, {method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body),redirect:'follow'});
      }
    } catch (e) { throw Error('Network request failed. Check connection, deployed Apps Script URL, and browser console. ' + e.message); }
    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); } catch (_) { throw Error('Server returned non-JSON (HTTP ' + response.status + '). Verify Apps Script deployment access and URL.'); }
    if (!response.ok || data.status !== 'success') throw Error(data.message || 'Server rejected ' + action + ' (HTTP ' + response.status + ')');
    return data;
  }
  const loginResult = async (action, payload, property, role) => {
    // Login is deliberately unauthenticated: never attach credentials from another role.
    const data = await callApi(action,payload,'POST',null);
    if (!data[property]) throw Error('Login response is missing ' + property);
    const session = Object.assign({},data[property],{role});
    setSession(session);
    return session;
  };
  function requireLogin(role, page) {
    if (!getSession(role)) { location.href = page || 'login.html'; return false; }
    sessionStorage.setItem(activeKey,role);
    return true;
  }
  function requireAnyLogin(roles,page) {
    const role = roles.find(r => getSession(r));
    if (!role) { location.href = page || 'login.html'; return false; }
    sessionStorage.setItem(activeKey,role);
    return true;
  }
  async function getActiveSchool() {
    const session = getSession(); if (!session) return null;
    try { const d=await callApi('getSchoolConfig',{},'GET'); const merged=Object.assign({},session,d.school); setSession(merged); return merged; }
    catch(e) { console.warn('School profile unavailable:',e.message); return session; }
  }
  async function updateSchoolConfig(patch) { const d=await callApi('updateSchoolConfig',{patch},'POST','school'); setSession(Object.assign({},getSession('school'),d.school)); return d.school; }
  function deriveShortCode(name) { return String(name||'SCH').split(/\s+/).map(w=>w[0]).join('').toUpperCase().slice(0,3)||'SCH'; }
  return {
    getSession,setSession,clearSession,logout:clearSession,isLoggedIn,requireLogin,requireAnyLogin,
    register:data=>loginResult('register',data,'school','school'),
    login:(email,password)=>loginResult('login',{email,password},'school','school'),
    teacherLogin:(schoolId,email,password)=>loginResult('teacherLogin',{schoolId,email,password},'teacher','teacher'),
    studentLogin:(schoolId,enrlNo,password)=>loginResult('studentLogin',{schoolId,enrlNo,password},'student','student'),
    adminLogin:password=>loginResult('adminLogin',{password},'admin','admin'),
    setFacultyVisibility: async (visible) => {
  const data = await callApi('setFacultyVisibility', {
    visible: Boolean(visible)
  });
  return data.result ?? data;
},
    // Backend must implement this action and enforce school-admin authorization.
    setFacultyVisibility:async visible=>(await callApi('setFacultyVisibility',{visible:Boolean(visible)},'POST','school')).result,
    saveTeacherPhoto:async(teacherId,photo)=>(await callApi('saveTeacherPhoto',{teacherId,photo})).result,
    getTeacherPhoto:async teacherId=>(await callApi('getTeacherPhoto',{teacherId},'GET')).result,
    getDashboardStats:async()=> (await callApi('getDashboardStats',{},'GET')).stats,
    getStudentFeeSummary:async studentId=>(await callApi('getStudentFeeSummary',{studentId},'GET')).summary,
    getMainDashboardData:async()=> (await callApi('getMainDashboardData',{},'GET')).data,
    pingTeacher:async(teacherId,message)=>(await callApi('pingTeacher',{teacherId,message})).ping,
    acknowledgePing:async pingId=>(await callApi('acknowledgePing',{pingId})).ping,
    addTeacher:async teacher=>(await callApi('addTeacher',{teacher})).teacher,
    adminListSchools:async()=>(await callApi('adminListSchools',{},'GET')).schools,
    adminSetStatus:async(schoolId,newStatus)=>(await callApi('adminSetStatus',{schoolId,newStatus})).result,
    adminResetPassword:async schoolId=>(await callApi('adminResetPassword',{schoolId})).result,
    list:async collection=>(await callApi('list',{collection},'GET')).records,
    get:async(collection,id)=>(await callApi('get',{collection,id},'GET')).record,
    add:async(collection,record)=>(await callApi('add',{collection,record})).record,
    update:async(collection,id,patch)=>(await callApi('update',{collection,id,patch})).record,
    remove:async(collection,id)=>{await callApi('remove',{collection,id});}
  };
})();
