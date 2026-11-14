'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf8');

function take(start, end) {
  const a = html.indexOf(start);
  const b = html.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, 'Could not locate dashboard function: ' + start);
  return html.slice(a, b);
}
function fakeDate(day) {
  const parts = day.split('-').map(Number);
  return class extends Date {
    constructor(...args) {
      if (args.length) super(...args);
      else super(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    }
    static now() { return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getTime(); }
  };
}
function environment(day) {
  const elements = new Map();
  const chartCalls = [];
  const document = {
    getElementById(id) {
      if (id === 'dashboardAbsentFollowup') return null;
      if (!elements.has(id)) elements.set(id, { textContent: '', innerHTML: '', style: {} });
      return elements.get(id);
    }
  };
  const context = {
    Date: fakeDate(day),
    document,
    charts: {},
    destroyChart() {},
    chartDefaults() { return {}; },
    localISODate() { return day; },
    normalizeAttendanceDate(value) { return String(value || '').slice(0, 10); },
    classAttendanceUrl(cls, date) { return 'attendance.html?class=' + encodeURIComponent(cls) + '&date=' + date; },
    esc(value) { return String(value); },
    Chart: class {
      constructor(canvas, config) { chartCalls.push(config); }
    }
  };
  vm.createContext(context);
  return { context, elements, chartCalls, value: id => elements.get(id)?.textContent };
}

const teacherFunction = take('function renderTeacherAttendanceAnalytics(teachers,records){', '\nasync function renderAssessmentExtraOverview()');
for (const date of ['2026-11-14', '2026-11-15']) {
  const e = environment(date);
  vm.runInContext(teacherFunction, e.context);
  const records = [{ teacherId: 'T1', date: '2026-11-14', status: 'Present' }];
  if (date === '2026-11-15') records.push({ teacherId: 'T1', date, status: 'Present' });
  e.context.renderTeacherAttendanceAnalytics([{ id: 'T1', name: 'Test Teacher' }], records);
  assert.equal(e.chartCalls.length, 1);
  const chart = e.chartCalls[0];
  const saturdayIndex = chart.data.labels.findIndex(x => x.startsWith('Sat'));
  assert.ok(saturdayIndex >= 0, 'Saturday is in the seven-day chart');
  assert.equal(chart.data.datasets[0].data[saturdayIndex], 1, 'Saturday saved Present is counted');
  assert.ok(chart.data.labels.every(x => !/Holiday/i.test(x)), 'No automatic weekend holiday');
  assert.ok(!/holiday/i.test(e.value('taPending')), 'Saturday/Sunday not automatically declared holiday');
  assert.match(e.value('teacherTrendNote'), /saved records/i);
}
console.log('PASS: Saturday saved teacher records appear in seven-day chart; no weekend holiday assumption');

const e = environment('2026-11-14');
const verifiedHelper=take('function verifiedStudentDayRows(attendance,students,day){', "\n        document.getElementById('studentAttClasses')");
vm.runInContext(verifiedHelper,e.context);
const studentFunction = take('function renderStudentAttendanceCard(attendance,students){', '\nfunction normalizeAttendanceDate(value)');
vm.runInContext(studentFunction, e.context);
const students = Array.from({ length: 4 }, (_, i) => ({ id: 'S' + i, name: 'Student ' + i, class: '1' }));
const saved = [0, 1].map(i => ({ studentId: 'S' + i, date: '2026-11-14', status: 'Present' }));
e.context.renderStudentAttendanceCard(saved, students);
assert.equal(e.value('studentAttRate'), '100%', 'Present / marked');
assert.equal(e.value('studentAttCompletion'), '50%', 'Marked / enrolled');
assert.equal(e.value('studentAttUnmarked'), 2, 'Remaining students are unmarked');
assert.match(e.value('studentAttHint'), /2 of 4 students marked/);
assert.ok(html.includes('Present among marked') && html.includes('Register completion'));
console.log('PASS: attendance rate and register completion are separate, grounded percentages');
