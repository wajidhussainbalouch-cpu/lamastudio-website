'use strict';
/* Lightweight source contract checks for the public practice preview.
 * These tests do not replace browser, security, or academic-content testing.
 */
const fs=require('node:fs'),path=require('node:path');
const root=__dirname;
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=read('index.html'),engine=read('engine.js'),worker=read('sw.js');
const errors=[];
function requireMatch(ok,message){if(!ok)errors.push(message)}
for(const id of ['startExam','submitExam','restartExam','examStatusBar','examProgress','nextUnanswered','nextFlagged','candidateHistory']){
 requireMatch(html.includes('id="'+id+'"'),'Missing exam UI control: '+id);
}
requireMatch(engine.includes("if(!attempt.startedAt||attempt.submitted)return"),'Submit must reject unstarted and completed attempts');
requireMatch(engine.includes("if(attempt.submitted||!attempt.startedAt)return"),'Finish must reject unstarted attempts');
requireMatch(engine.includes("if(remaining()===0){finish();return}"),'Answer/submit must check expired timer');
requireMatch(engine.includes('schemaVersion:2'),'Saved answer option migration version missing');
requireMatch(engine.includes('attempt.flags[q.id]'),'Review flags must persist');
requireMatch(engine.includes('recordAttempt()'),'Completed attempts must be recorded');
requireMatch(html.includes('disabled>Create Account'),'Preview registration must remain disabled until backend exists');
requireMatch(worker.includes('const allowed=new Set('),'Service worker must use public asset allowlist');
requireMatch(worker.includes("request.headers.has('authorization')"),'Service worker must reject authenticated requests');
requireMatch(!/caches\.open\(CACHE\).*put\(request/i.test(worker.replace(/allowed\.has\(url\.pathname\)/g,''))||worker.includes('!allowed.has(url.pathname)'),'Cache write must be restricted to allowed paths');
console.log('Academy contract checks:',errors.length,'error(s)');
for(const error of errors)console.error('ERROR',error);
if(errors.length)process.exitCode=1;
