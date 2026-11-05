/**
 * Isolated Google Apps Script storage adapter for LAMA syllabus plans.
 * NOT wired to doPost, NOT deployed. Backend MUST resolve spreadsheetId,
 * verified session, entitlements and transition preparation server-side.
 * Record and audit events share one JSON cell to avoid split writes.
 * Apps Script cell limit is 50,000 characters; reject oversized records.
 */
var LamaSyllabusSheetStore = (function () {
  'use strict';
  var TAB = '_LAMA_SYLLABUS_PLANS';
  var HEADERS = ['schoolId', 'planId', 'recordJson'];
  function requireId(value, label) {
    if (typeof value !== 'string' || !value.trim()) throw Error(label + ' required');
    return value;
  }
  function tabFor(spreadsheetId, create) {
    var book = SpreadsheetApp.openById(requireId(spreadsheetId, 'Spreadsheet ID'));
    var tab = book.getSheetByName(TAB);
    if (!tab && create === true) {
      tab = book.insertSheet(TAB);
      tab.getRange(1, 1, 1, 3).setValues([HEADERS]);
      tab.setFrozenRows(1);
    }
    if (!tab) throw Error('Syllabus storage not initialized');
    var headers = tab.getRange(1, 1, 1, 3).getValues()[0];
    if (HEADERS.some(function (name, i) { return headers[i] !== name; })) throw Error('Unexpected syllabus storage schema');
    return tab;
  }
  function findRow(tab, schoolId, planId) {
    var last = tab.getLastRow();
    if (last < 2) return 0;
    var ids = tab.getRange(2, 1, last - 1, 2).getValues();
    var found = 0;
    ids.forEach(function (row, index) {
      if (row[0] === schoolId && row[1] === planId) {
        if (found) throw Error('Duplicate syllabus plan rows');
        found = index + 2;
      }
    });
    return found;
  }
  function decode(tab, row, schoolId, planId) {
    var raw = tab.getRange(row, 3).getValue();
    var value = JSON.parse(raw);
    if (!value || !value.plan || value.plan.schoolId !== schoolId ||
        value.plan.planId !== planId || !Array.isArray(value.audit)) throw Error('Corrupt syllabus plan record');
    return value;
  }
  function encode(record) {
    var json = JSON.stringify(record);
    if (json.length > 45000) throw Error('Syllabus record too large for single-cell storage');
    return json;
  }
  function withLock(fn) {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) throw Error('Syllabus storage busy');
    try { return fn(); } finally { lock.releaseLock(); }
  }
  function initialize(spreadsheetId) {
    return withLock(function () { tabFor(spreadsheetId, true); return true; });
  }
  function read(spreadsheetId, schoolId, planId) {
    requireId(schoolId, 'School ID'); requireId(planId, 'Plan ID');
    var tab = tabFor(spreadsheetId, false);
    var row = findRow(tab, schoolId, planId);
    return row ? decode(tab, row, schoolId, planId) : null;
  }
  function create(spreadsheetId, plan, trustedAuthorized) {
    if (trustedAuthorized !== true) throw Error('Backend authorization required');
    requireId(plan && plan.schoolId, 'School ID'); requireId(plan.planId, 'Plan ID');
    if (plan.status !== 'draft' || plan.version !== 1) throw Error('New plan must be version 1 draft');
    var json = encode({plan:plan, audit:[]});
    return withLock(function () {
      var tab = tabFor(spreadsheetId, false);
      if (findRow(tab, plan.schoolId, plan.planId)) throw Error('Plan already exists');
      var row = tab.getLastRow() + 1;
      tab.getRange(row, 1, 1, 3).setValues([[plan.schoolId, plan.planId, json]]);
      SpreadsheetApp.flush();
      var stored = decode(tab, row, plan.schoolId, plan.planId);
      if (stored.plan.version !== 1) throw Error('Syllabus create verification failed');
      return {schoolId:plan.schoolId, planId:plan.planId, version:1};
    });
  }
  function transition(spreadsheetId, schoolId, planId, expectedVersion, trustedPrepare) {
    if (typeof trustedPrepare !== 'function') throw Error('Trusted transition callback required');
    requireId(schoolId, 'School ID'); requireId(planId, 'Plan ID');
    return withLock(function () {
      var tab = tabFor(spreadsheetId, false);
      var row = findRow(tab, schoolId, planId);
      if (!row) throw Error('Plan not found in school');
      var record = decode(tab, row, schoolId, planId);
      if (record.plan.version !== expectedVersion) throw Error('Version conflict');
      // trustedPrepare must authenticate and authorize with server-resolved credentials.
      var prepared = trustedPrepare(JSON.parse(JSON.stringify(record.plan)));
      if (!prepared || !prepared.plan || !prepared.audit ||
          prepared.schoolId !== schoolId || prepared.planId !== planId ||
          prepared.expectedVersion !== expectedVersion ||
          prepared.plan.schoolId !== schoolId || prepared.plan.planId !== planId ||
          prepared.plan.version !== expectedVersion + 1 ||
          prepared.audit.schoolId !== schoolId || prepared.audit.planId !== planId ||
          prepared.audit.fromVersion !== expectedVersion ||
          prepared.audit.toVersion !== expectedVersion + 1) throw Error('Invalid authorized transition');
      var updated = {plan:prepared.plan, audit:record.audit.concat([prepared.audit])};
      var json = encode(updated);
      tab.getRange(row, 3).setValue(json);
      SpreadsheetApp.flush();
      var stored = decode(tab, row, schoolId, planId);
      if (stored.plan.version !== prepared.plan.version || stored.audit.length !== updated.audit.length)
        throw Error('Syllabus commit verification failed');
      return {schoolId:schoolId, planId:planId, version:stored.plan.version, status:stored.plan.status};
    });
  }
  return {initialize:initialize, read:read, create:create, transition:transition};
})();
