/* Run: node coding-academy/tests/python.test.cjs
 * Validates the very same Python evaluation harness with system Python.
 * Browser Pyodide/WebAssembly loading still requires separate manual QA.
 */
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const cp=require("node:child_process");
const assert=require("node:assert/strict");
const base=path.join(__dirname,"..");
const lessonsSource=fs.readFileSync(path.join(base,"python-lessons.js"),"utf8");
const worker=fs.readFileSync(path.join(base,"python-runner.mjs"),"utf8");
const app=fs.readFileSync(path.join(base,"python-app.js"),"utf8");
const html=fs.readFileSync(path.join(base,"python.html"),"utf8");
const harness=fs.readFileSync(path.join(base,"python-harness.py"),"utf8");
new Function(lessonsSource);new Function(app);
const context={window:{}};
vm.runInNewContext(lessonsSource,context);
const missions=context.window.LAMA_PYTHON_MISSIONS;
assert.equal(missions.length,10);
assert.equal(missions.reduce((n,l)=>n+l.tests.length,0),30);
assert.equal(new Set(missions.map(l=>l.id)).size,10);
assert.match(worker,/import\s*\{\s*loadPyodide\s*\}/);
assert.match(worker,/v314\.0\.7\/full\/pyodide\.mjs/);
assert.match(app,/new Worker\("\.\/python-runner\.mjs",\{type:"module"\}\)/);
assert.match(app,/120000/);
assert.match(app,/8000/);
assert.match(html,/src="\.\/python-app\.js"/);
const solutions={
"pyx-greetings":"def greet(name):\n    return 'Hello, ' + name + '!'",
"pyx-fees":"def total_fee(monthly, months):\n    return monthly * months",
"pyx-grades":"def has_passed(score):\n    return score >= 50",
"pyx-attendance":"def attendance_rate(present, total):\n    if total == 0:\n        return 0\n    return round(present / total * 100)",
"pyx-stock":"def low_stock(items):\n    return [item['name'] for item in items if item['quantity'] < 10]",
"pyx-average":"def average_marks(scores):\n    if not scores:\n        return 0\n    return sum(scores) / len(scores)",
"pyx-clean":"def clean_reference(raw):\n    return raw.replace(' ', '').replace('-', '')",
"pyx-absent":"def count_absent(records):\n    return sum(1 for student in records if student['present'] is False)",
"pyx-grade-label":"def grade_band(score):\n    if score >= 80:\n        return 'A'\n    if score >= 60:\n        return 'B'\n    if score >= 50:\n        return 'C'\n    return 'F'",
"pyx-report":"def passing_names(students):\n    return sorted(student['name'] for student in students if student['score'] >= 50)"
};
function executePython(code,tests){
  const payload=JSON.stringify({code,tests});
  const script="_lama_payload = "+JSON.stringify(payload)+"\n"+harness;
  const result=cp.spawnSync("python3",["-c",script],{encoding:"utf8",timeout:15000,maxBuffer:1024*1024});
  if(result.error)throw result.error;
  if(result.status!==0)throw new Error("Harness could not run: "+result.stderr);
  return JSON.parse(result.stdout);
}
for(const m of missions){
  assert.ok(m.title&&m.concept&&m.purpose&&m.quiz);
  assert.equal(m.quiz.options.length,3);
  assert.ok(Number.isInteger(m.quiz.answer)&&m.quiz.answer>=0&&m.quiz.answer<=2);
  assert.equal(m.tests.length,3);
  assert.ok(m.starter.includes("pass"),m.id+" starter should need implementation");
  const starter=executePython(m.starter,m.tests);
  assert.equal(starter.passed,false,m.id+" starter must not pass all tests");
  const expected=executePython(solutions[m.id],m.tests);
  assert.equal(expected.error,"",m.id+" should run cleanly: "+expected.error);
  assert.equal(expected.passed,true,m.id+" reference solution must pass");
  assert.equal(expected.results.length,3,m.id+" returns three tests");
  assert.ok(expected.results.every(t=>t.pass===true),m.id+" every behavior check passes");
}
const traceback=executePython("def greet(name):\n    raise ValueError('test')",[{"label":"greeting","expression":"greet('A') == 'Hello, A!'"}]);
assert.equal(traceback.passed,false);
assert.ok(traceback.results[0].details.includes("ValueError"));
const printing=executePython("print('Hello from Python')\ndef f():\n    return 3",[{"label":"number","expression":"f()==3"}]);
assert.equal(printing.passed,true);
assert.match(printing.stdout,/Hello from Python/);
console.log("PASS: 10 Python missions, 30 behavioral tests, starter gating, runtime traceback and stdout capture.");
