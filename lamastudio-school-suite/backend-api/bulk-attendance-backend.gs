/** Optional addition to the existing Code.gs; DO NOT deploy this file alone. */
function bulkAttendanceRecords(params) {
  const ctx = resolveContext(params); // existing school-scoped authorization
  checkPermission(ctx, 'add', 'attendance');
  if (ctx.role !== 'school' && ctx.role !== 'teacher') throw new Error('Attendance write access denied');
  const date = String(params.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid attendance date');
  const incoming = params.records;
  if (!Array.isArray(incoming) || incoming.length < 1 || incoming.length > 1500) throw new Error('Invalid attendance batch');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Error('Attendance is busy. Retry in a moment.');
  try {
    const data = getCollectionSheet(ctx, 'attendance');
    const sheet = data.sheet, headers = data.headers;
    const oldRows = sheet.getDataRange().getValues();
    const dateCol = headers.indexOf('date'), studentCol = headers.indexOf('studentId'), enrCol = headers.indexOf('enrlNo');
    if (dateCol < 0 || (studentCol < 0 && enrCol < 0)) throw new Error('Attendance columns missing');
    const normalizeDate = value => value instanceof Date ? Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(value || '').slice(0,10);
    const keyOf = rec => String(rec.studentId || rec.enrlNo || '').trim();
    const indexes = {};
    for (let i=1;i<oldRows.length;i++) {
      if (normalizeDate(oldRows[i][dateCol]) !== date) continue;
      const key = String(studentCol >= 0 ? oldRows[i][studentCol] : '').trim() || String(enrCol >= 0 ? oldRows[i][enrCol] : '').trim();
      if (key) indexes[key] = i;
    }
    const updates = [], additions = [], seen = {};
    incoming.forEach(rec => {
      if (!rec || !['Present','Absent','Leave'].includes(rec.status)) throw new Error('Invalid attendance status');
      const key = keyOf(rec);if (!key || seen[key]) throw new Error('Missing or duplicate student ID in batch');
      seen[key] = true;
      if (ctx.role === 'teacher' && !sameClass(rec.class,ctx.teacher.assignedClass)) throw new Error('Teacher class access denied');
      const existingIndex = indexes[key];
      const old = existingIndex === undefined ? {} : rowToRecord(headers,oldRows[existingIndex]);
      const full = Object.assign({},old,rec,{date,id:old.id || genId('att'),createdAt:old.createdAt || new Date().toISOString()});
      const row = recordToRow(headers,full);
      if (existingIndex === undefined) additions.push(row); else updates.push({index:existingIndex+1,row});
    });
    updates.forEach(x => sheet.getRange(x.index,1,1,headers.length).setValues([x.row]));
    if (additions.length) sheet.getRange(sheet.getLastRow()+1,1,additions.length,headers.length).setValues(additions);
    SpreadsheetApp.flush();
    return { saved: incoming.length, inserted:additions.length, updated:updates.length };
  } finally { lock.releaseLock(); }
}
