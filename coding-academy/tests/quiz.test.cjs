/* Question-bank contract test; run with node coding-academy/tests/quiz.test.cjs */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,".."),read=name=>fs.readFileSync(path.join(root,name),"utf8");
const sandbox={window:{}};vm.runInNewContext(read("quiz-data.js"),sandbox);vm.runInNewContext(read("quiz-core.js"),sandbox);
const data=sandbox.window.LAMA_CODING_QUESTIONS,core=sandbox.window.LAMA_QUESTION_CORE;
const questions=Array.from(data.items);
assert.equal(questions.length,150,"Expect 150 original questions, not templated repeats.");
assert.equal(new Set(questions.map(q=>q.id)).size,questions.length,"IDs must be unique.");
assert.deepEqual(Array.from(data.tracks,x=>x.id),["html","css","javascript","python","sql"]);
const byType={choice:0,predict:0,build:0};
for(const q of questions){
 assert.ok(["html","css","javascript","python","sql"].includes(q.track));
 assert.ok([1,2,3].includes(q.level));
 assert.equal(typeof q.prompt,"string");assert.ok(q.prompt.length>=12,q.id+" prompt is too short");
 assert.ok(q.why.length>=20,q.id+" needs a useful explanation");
 assert.ok(Object.hasOwn(byType,q.mode),q.id+" unknown question type");
 byType[q.mode]++;
 if(q.mode==="build"){
  assert.ok(Array.isArray(q.parts)&&q.parts.length>=3,q.id+" needs at least 3 code pieces");
  assert.ok(Array.isArray(q.answer)&&q.answer.length>=2);
  assert.equal(new Set(q.answer).size,q.answer.length,"No duplicate token index in answer");
  for(const i of q.answer)assert.ok(Number.isInteger(i)&&i>=0&&i<q.parts.length);
  assert.equal(core.check(q,Array.from(q.answer)),true);
  assert.equal(core.check(q,Array.from(q.answer).reverse()),false,q.id+" order matters");
  assert.ok(core.solution(q).length>=8);
  for(let session=0;session<6;session++){
   const shuffled=Array.from(core.tokenOrder(q,session));
   assert.equal(shuffled.length,q.parts.length,"Every code-piece tile must remain available.");
   assert.equal(new Set(shuffled).size,q.parts.length,"No code piece is duplicated after shuffling.");
   assert.ok(shuffled.every((index)=>index>=0&&index<q.parts.length));
   assert.equal(q.answer.every((index,i)=>shuffled[i]===index),false,
     "Code pieces must not appear already solved: "+q.id);
  }
 }else{
  assert.ok(q.options.length>=3&&q.options.length<=4);
  assert.equal(new Set(q.options).size,q.options.length,q.id+" answer options must differ");
  assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length);
  assert.equal(core.check(q,q.answer),true);
  assert.equal(core.check(q,(q.answer+1)%q.options.length),false);
  assert.equal(core.solution(q),q.options[q.answer]);
 }
}
assert.equal(byType.build,30);
assert.equal(byType.predict,35);
assert.equal(byType.choice,85);
for(const track of data.tracks){
 for(let level=1;level<=3;level++){
  const subset=Array.from(core.available(data,track.id,level));
  assert.equal(subset.length,10,track.id+" Level "+level+" must have 10 original questions.");
  const state=core.createState();
  const round=Array.from(core.pick(data,state,track.id,level));
  assert.equal(round.length,10);
  assert.equal(new Set(round.map(q=>q.id)).size,10);
 }
}
let state=core.createState();
const first=Array.from(core.pick(data,state,"mixed",1));
assert.equal(first.length,10);
const distribution=Object.fromEntries(data.tracks.map(t=>[t.id,first.filter(q=>q.track===t.id).length]));
assert.deepEqual(distribution,{html:2,css:2,javascript:2,python:2,sql:2},
  "Mixed rounds must contain two questions from each of five languages.");

for(const q of first)core.record(state,q,q===first[0]);
assert.equal(core.totals(data,state).answered,10);
assert.equal(core.totals(data,state).correct,1);
assert.equal(core.totals(data,state).learned,1);
assert.equal(core.totals(data,state).missed,9);
assert.equal(state.stats[first[1].id].lastCorrect,false);
core.record(state,first[1],true);
assert.equal(core.totals(data,state).missed,8,"A corrected question must leave the mistake list.");
assert.equal(state.stats[first[1].id].lastCorrect,true);
core.record(state,first[1],false);
assert.equal(core.totals(data,state).missed,9,"A later wrong answer should return to review.");

const mixedAgain=Array.from(core.pick(data,state,"mixed",1));
assert.ok(mixedAgain.some(q=>!first.some(x=>x.id===q.id)),"Mixed rounds must rotate into unseen items.");
assert.deepEqual(Object.fromEntries(data.tracks.map(t=>[t.id,mixedAgain.filter(q=>q.track===t.id).length])),
 {html:2,css:2,javascript:2,python:2,sql:2},
 "Repeated mixed rounds must remain balanced after some questions were answered.");
const review=Array.from(core.pick(data,state,"mixed",1,true));
assert.equal(review.length,10);
assert.ok(review.some(q=>q.id===first[1].id),"Missed questions must appear in review.");
const storage=new Map();
const store={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))};
assert.equal(core.save(store,state),true);
const restored=core.load(store,data);
assert.equal(core.totals(data,restored).answered,12);
assert.equal(core.totals(data,restored).missed,9);
storage.set(core.KEY,"{not valid JSON");
assert.equal(core.totals(data,core.load(store,data)).answered,0,"Bad saved JSON must not crash practice.");
storage.set(core.KEY,JSON.stringify({stats:{"__proto__":{attempts:5,correct:5},"sql-1-01":{attempts:999999,correct:5},"unknown":{attempts:3,correct:3}}}));
const sanitized=core.load(store,data);
assert.equal(Object.prototype.hasOwnProperty.call(sanitized.stats,"unknown"),false);
assert.equal(core.totals(data,sanitized).answered,0,"Untrusted huge counters must not populate totals.");
const html=read("quiz.html"),app=read("quiz.js"),sw=read("sw.js");
assert.match(html,/LAMA Coding Academy/);
assert.match(html,/id="check"/);assert.match(html,/id="sequence"/);assert.match(html,/id="review"/);
assert.match(html,/quiz-data\.js/);assert.match(html,/quiz-core\.js/);assert.match(html,/quiz\.js/);
assert.match(html,/No login, timer, or internet/);
assert.match(app,/textContent=q\.prompt/);
assert.match(app,/textContent=q\.why/);
assert.doesNotMatch(app,/\beval\s*\(/,"Never evaluate user-provided quiz content as JavaScript");
assert.match(sw,/quiz\.html/);assert.match(sw,/quiz-data\.js/);
console.log("PASS: 150 original questions, 30 code-building puzzles, 35 output-prediction tasks, level sets, local scores, missed review and non-executing quiz UI.");
