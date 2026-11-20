/* Run: node coding-academy/tests/beginner.test.cjs
 * Real content and local beginner error coach regression. No network needed.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,".."),read=name=>fs.readFileSync(path.join(root,name),"utf8");
const html=read("index.html"),coaching=read("beginner-coach.js"),ui=read("beginner-ui.js"),css=read("beginner-ui.css");
new Function(coaching);new Function(ui);
const env={window:{},setTimeout(){},clearTimeout(){}};
vm.runInNewContext(coaching,env);vm.runInNewContext(ui,env);
const coach=env.window.LAMA_CODE_COACH,beginner=env.window.LAMA_BEGINNER_UI;
assert.ok(coach&&beginner);
assert.ok(coach.glossary.length>=8);
for(const name of ["HTML","CSS","JavaScript","Python","SQL","Kotlin / Dart","Bug / debugging"]){
 assert.ok(coach.glossary.some(item=>item.word===name&&item.simple.length>20&&item.urdu.length>12),name+" needs clear English/Urdu definitions");
}
const match=html.match(/var lessons=\[([\s\S]*?)\];\s*var defaults/);
assert.ok(match,"The academy's foundation curriculum must be discoverable.");
const sandbox={};vm.runInNewContext("var LAMA_LESSONS=["+match[1]+"]; ",sandbox);
const missions=sandbox.LAMA_LESSONS;
assert.equal(missions.length,22,"There should be 22 real interactive foundation lessons.");
assert.equal(new Set(missions.map(m=>m.id)).size,22,"Lesson IDs must be distinct.");
assert.deepEqual(Array.from(missions.slice(0,6),m=>m.id),[
 "intro-browser","intro-html","intro-tags","intro-css","intro-js","intro-debug"
]);
assert.deepEqual(Array.from(missions.slice(16,20),m=>m.id),["form-fields","condition","objects","capstone"]);
for(const mission of missions){
 assert.ok(mission.concept&&mission.why&&mission.task&&mission.hint,mission.id+" missing clear instructions");
 assert.ok(mission.starter.length>25,mission.id+" starter is too short");
 assert.ok(Array.isArray(mission.checks)&&mission.checks.length>0);
 assert.ok(Array.isArray(mission.quiz)&&mission.quiz[1].length>=3);
 assert.ok(mission.quiz[2]>=0&&mission.quiz[2]<mission.quiz[1].length);
}
assert.equal(beginner.level(0),"Level 1 · Beginner");
assert.equal(beginner.level(9),"Level 1 · Beginner");
assert.equal(beginner.level(10),"Level 2 · Intermediate");
assert.equal(beginner.level(15),"Level 2 · Intermediate");
assert.equal(beginner.level(16),"Level 3 · Advanced");
assert.equal(beginner.level(21),"Level 3 · Advanced");
assert.match(beginner.levels(missions,{}),/0 \/ 10 completed/);
assert.match(beginner.levels(missions,{}),/0 \/ 6 completed/);
assert.match(beginner.glossary(),/JavaScript/);
assert.match(beginner.glossary(),/lang="ur" dir="rtl"/);
assert.match(html,/beginner-coach\.js/);
assert.match(html,/beginner-ui\.js/);
assert.match(html,/beginner-ui\.css/);
assert.match(css,/#lineGutter span\.problem/);
assert.match(html,/canOpen\(id\)/);
assert.match(html,/syntaxIssues/);
assert.match(html,/jumpToLine/);
assert.match(html,/autocomplete="off"/);

const typo="<!doctype html>\n<html>\n<body>\n  <h1>About me</h1>\n  <My name is Wajid>\n</body>\n</html>";
const issue=coach.analyze(typo).find(i=>i.message.includes("not a common HTML tag"));
assert.ok(issue,"An invented <My ...> tag must be recognized as a common beginner mistake");
assert.equal(issue.line,5);
assert.match(issue.message,/<p>My name is Wajid<\/p>/);
const corrected=typo.replace("<My name is Wajid>","<p>My name is Wajid</p>");
assert.equal(coach.analyze(corrected).length,0,"Correct paragraphs should not show false warnings.");
assert.equal(coach.analyze("<strong>Hello</strng>").some(i=>i.message.includes("strng")),true);
const cssError=coach.analyze("<html><head><style>h1 { color: blue; </style></head><body></body></html>");
assert.ok(cssError.some(i=>i.message.includes("CSS:")&&i.message.includes("}")));
const jsError=coach.analyze('<html><body><script>function test(){ console.log(1); <\/script></body></html>');
assert.ok(jsError.some(i=>i.message.includes("JavaScript:")&&i.message.includes("}")));
assert.equal(coach.analyze("<!-- <Wrong tag> -->\n<p>Welcome</p>").length,0);
const advancedStarter=missions.find(x=>x.id==="capstone");
assert.ok(!advancedStarter.checks.every(([rule])=>rule.test(advancedStarter.starter)),
 "Advanced final lesson must require a meaningful student code change.");
console.log("PASS: 22 staged lessons, glossary, line-5 text-as-tag hint, closing tag/CSS/JS diagnostics and safe examples.");
