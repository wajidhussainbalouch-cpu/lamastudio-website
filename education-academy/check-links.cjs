'use strict';
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const unique=new Set(ids);
const targets=[...html.matchAll(/\bhref="#([^"]+)"/g)].map(m=>m[1]);
const errors=[];
for(const id of unique)if(ids.filter(x=>x===id).length>1)errors.push('Duplicate HTML id: '+id);
for(const target of targets)if(!unique.has(target))errors.push('Missing anchor target: #'+target);
for(const name of ['academyMenu','jobCategories','jobDetail','teachingTrack','performance','account','subscription','examWorkspace','startExam','submitExam','restartExam','nextUnanswered','exportResults','clearResults']){
 if(!unique.has(name))errors.push('Missing required interface element: '+name);
}
console.log('Academy navigation check:',unique.size,'unique IDs,',targets.length,'in-page links,',errors.length,'errors');
for(const e of errors)console.error(e);
if(errors.length)process.exitCode=1;
