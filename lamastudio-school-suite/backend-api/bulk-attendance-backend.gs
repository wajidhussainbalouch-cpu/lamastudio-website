/**
 * LamaStudio School Suite — verified, school-scoped bulk attendance.
 * Keep this file in the SAME Apps Script project as Code.gs.
 * Do not add another doGet/doPost and do not deploy separately.
 * Requires Code.gs helpers: resolveContext, checkPermission,
 * getCollectionSheet, rowToRecord, recordToRow, genId, sameClass.
 *
 * Accepts studentId OR enrlNo. Enrollment numbers may be missing;
 * studentId is the canonical key. No students are created here.
 */
function bulkAttendanceRecords(params) {
  params = params || {};
  const ctx = resolveContext(params);
  checkPermission(ctx, 'add', 'attendance');
  if (ctx.role !== 'school' && ctx.role !== 'teacher') {
    throw new Error('Attendance write access denied');
  }

  const date = String(params.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date + 'T12:00:00Z')) ||
      new Date(date + 'T12:00:00Z').toISOString().slice(0, 10) !== date) {
    throw new Error('Invalid attendance date');
  }
  const incoming = params.records;
  if (!Array.isArray(incoming) || incoming.length < 1 || incoming.length > 1500) {
    throw new Error('Invalid attendance batch (1–1500 records required)');
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Error('Attendance is busy. Retry in a moment.');
  try {
    const studentsData = getCollectionSheet(ctx, 'students');
    const studentRows = studentsData.sheet.getDataRange().getValues();
    const byStudentId = new Map();
    const byEnrollment = new Map();
    const ambiguousEnrollment = new Set();
    for (let i = 1; i < studentRows.length; i++) {
      const s = rowToRecord(studentsData.headers, studentRows[i]);
      const id = String(s.id || '').trim();
      const enrl = String(s.enrlNo || '').trim();
      if (!id) continue;
      if (byStudentId.has(id)) throw new Error('Duplicate student IDs in student register: ' + id);
      byStudentId.set(id, s);
      if (enrl) {
        if (byEnrollment.has(enrl)) ambiguousEnrollment.add(enrl);
        else byEnrollment.set(enrl, s);
      }
    }

    const attendanceData = getCollectionSheet(ctx, 'attendance');
    const sheet = attendanceData.sheet;
    const headers = attendanceData.headers;
    if (['id', 'studentId', 'date', 'status'].some(h => headers.indexOf(h) < 0)) {
      throw new Error('Required attendance columns missing');
    }
    const existing = sheet.getDataRange().getValues();
    const timezone = Session.getScriptTimeZone() || 'Asia/Karachi';
    function dayOf(value) {
      return value instanceof Date
        ? Utilities.formatDate(value, timezone, 'yyyy-MM-dd')
        : String(value || '').slice(0, 10);
    }
    const existingById = new Map();
    const existingByEnrl = new Map();
    for (let i = 1; i < existing.length; i++) {
      const a = rowToRecord(headers, existing[i]);
      if (dayOf(a.date) !== date) continue;
      const sid = String(a.studentId || '').trim();
      const enrl = String(a.enrlNo || '').trim();
      if (sid) {
        if (existingById.has(sid)) throw new Error('Existing duplicate attendance for student ID: ' + sid);
        existingById.set(sid, i);
      }
      if (enrl) {
        if (existingByEnrl.has(enrl)) throw new Error('Existing duplicate attendance for enrollment: ' + enrl);
        existingByEnrl.set(enrl, i);
      }
    }

    const updates = [];
    const additions = [];
    const seen = new Set();
    const touchedRows = new Set();
    const now = new Date().toISOString();

    // Validate the ENTIRE batch before writing any attendance.
    incoming.forEach(function(rec, n) {
      if (!rec || typeof rec !== 'object' || Array.isArray(rec)) {
        throw new Error('Invalid record at position ' + (n + 1));
      }
      if (['Present', 'Absent', 'Leave'].indexOf(rec.status) === -1) {
        throw new Error('Invalid attendance status at position ' + (n + 1));
      }
      const requestedId = String(rec.studentId || '').trim();
      const requestedEnrl = String(rec.enrlNo || '').trim();
      if (!requestedId && !requestedEnrl) throw new Error('Student ID or enrollment number required');
      if (requestedEnrl && ambiguousEnrollment.has(requestedEnrl) && !requestedId) {
        throw new Error('Duplicate enrollment number: provide the unique student ID for this attendance record.');
      }
      const byId = requestedId ? byStudentId.get(requestedId) : null;
      const byEnrl = requestedEnrl ? byEnrollment.get(requestedEnrl) : null;
      if (requestedId && !byId) throw new Error('Student not found: ' + requestedId);
      if (requestedEnrl && !byEnrl && !byId) throw new Error('Enrollment not found: ' + requestedEnrl);
      if (byId && requestedEnrl && String(byId.enrlNo || '').trim() !== requestedEnrl) throw new Error('Student ID and enrollment mismatch');
      if (byId && byEnrl && byId.id !== byEnrl.id && !ambiguousEnrollment.has(requestedEnrl)) throw new Error('Student ID and enrollment mismatch');
      const student = byId || byEnrl;
      const sid = String(student.id).trim();
      const enrl = String(student.enrlNo || '').trim();
      if (seen.has(sid)) throw new Error('Duplicate student in batch: ' + sid);
      seen.add(sid);

      if (ctx.role === 'teacher') {
        const assignedClass = String(ctx.teacher.assignedClass || '').trim();
        const assignedSection = String(ctx.teacher.assignedSection || '').trim();
        const studentSection = String(student.section || '').trim();
        if (!assignedClass || !sameClass(student.class, assignedClass) ||
            (assignedSection && (!studentSection || studentSection.toLowerCase() !== assignedSection.toLowerCase()))) {
          throw new Error('Teacher not assigned to student: ' + sid);
        }
      }
      const idxById = existingById.get(sid);
      const idxByEnrl = enrl ? existingByEnrl.get(enrl) : undefined;
      if (idxById !== undefined && idxByEnrl !== undefined && idxById !== idxByEnrl) {
        throw new Error('Conflicting existing attendance rows for student: ' + sid);
      }
      const index = idxById !== undefined ? idxById : idxByEnrl;
      if (index !== undefined && touchedRows.has(index)) throw new Error('Two records target the same attendance row');
      if (index !== undefined) touchedRows.add(index);
      const old = index === undefined ? {} : rowToRecord(headers, existing[index]);
      // Do not allow client-supplied metadata, names, classes, or identifiers to override register values.
      const full = Object.assign({}, old, {
        id: old.id || genId('att'), studentId: sid, enrlNo: enrl,
        studentName: student.name || '', class: student.class || '',
        section: student.section || '', date: date, status: rec.status,
        markedBy: ctx.role === 'teacher' ? (ctx.teacher.name || '') : 'School Admin',
        createdAt: old.createdAt || now
      });
      const row = recordToRow(headers, full);
      if (index === undefined) additions.push(row);
      else updates.push({ rowNumber: index + 1, row: row });
    });

    // Sheets has no multi-range transaction. Test against a backup before production.
    updates.forEach(function(u) {
      sheet.getRange(u.rowNumber, 1, 1, headers.length).setValues([u.row]);
    });
    if (additions.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, additions.length, headers.length)
        .setValues(additions);
    }
    SpreadsheetApp.flush();
    // Notification delivery is separate from attendance persistence. A failure
    // here must not make the client retry an already-saved attendance batch.
    let notificationResult = {created:0,updated:0,error:''};
    try {
      notificationResult = syncAttendanceParentNotifications(ctx, date, incoming, byStudentId);
    } catch (notificationError) {
      notificationResult.error = String(notificationError.message || notificationError);
      console.error('Attendance saved, notification sync failed: '+notificationResult.error);
    }
    return { saved: incoming.length, inserted: additions.length, updated: updates.length, notifications: notificationResult };
  } finally {
    lock.releaseLock();
  }
}

/**
 * One private, idempotent parent-portal notification per student/date.
 * Uses the existing school Notifications tab; never sends WhatsApp.
 * The master Code.gs must include studentId/date/notificationType in
 * the notifications schema and restrict student reads to their own records.
 */
function syncAttendanceParentNotifications(ctx, date, incoming, byStudentId) {
  const result = {created:0,updated:0,error:''};
  const data = getCollectionSheet(ctx, 'notifications');
  const sheet = data.sheet, headers = data.headers;
  const required = ['id','studentId','date','notificationType','title','message','status','isPublished'];
  if (required.some(h => headers.indexOf(h) < 0)) {
    throw new Error('Notification schema not upgraded: '+required.filter(h=>headers.indexOf(h)<0).join(','));
  }
  const rows = sheet.getDataRange().getValues();
  const existing = new Map();
  for (let i=1;i<rows.length;i++) {
    const n=rowToRecord(headers,rows[i]);
    if (String(n.notificationType)==='attendanceAbsence' && String(n.date).slice(0,10)===date && n.studentId) {
      existing.set(String(n.studentId),{row:i+1,record:n});
    }
  }
  const append=[];
  const now=new Date().toISOString();
  incoming.forEach(rec=>{
    const student=byStudentId.get(String(rec.studentId||'').trim());
    if (!student) return;
    const sid=String(student.id), previous=existing.get(sid);
    const absent=rec.status==='Absent';
    if (!absent && !previous) return;
    const next=Object.assign({},previous?previous.record:{},{
      id:previous?previous.record.id:genId('not'),
      studentId:sid,date:date,notificationType:'attendanceAbsence',
      audience:'student',channel:'in-app',status:absent?'Active':'Resolved',
      isPublished:absent,
      title:absent?'Attendance alert — '+date:'Attendance corrected — '+date,
      message:absent?'Your child '+String(student.name||'')+' was marked absent on '+date+'. Contact the school if this is incorrect.':'The absence for '+date+' has been corrected.',
      createdAt:previous?previous.record.createdAt:now
    });
    if(previous) {
      sheet.getRange(previous.row,1,1,headers.length).setValues([recordToRow(headers,next)]);
      result.updated++;
    } else {
      append.push(recordToRow(headers,next));result.created++;
    }
  });
  if(append.length)sheet.getRange(sheet.getLastRow()+1,1,append.length,headers.length).setValues(append);
  return result;
}
