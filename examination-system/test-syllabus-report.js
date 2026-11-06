'use strict';
const assert=require('node:assert/strict');
const {summarize}=require('./syllabus-report');
const plan={planId:'p1',classId:'4',subjectId:'Math',scheduled:[
 {date:'2026-11-01',slot:1,lessonId:'l1',chapterId:'c1'},
 {date:'2026-11-09',slot:1,lessonId:'l2',chapterId:'c1'},
 {date:'2026-11-02',slot:1,lessonId:'l3',chapterId:'c2'}
]};
const key='2026-11-01|1|c1|l1|';
const result=summarize(plan,[{key,status:'completed',completedAt:'2026-11-01'}],'2026-11-06');
assert.deepEqual(result.totals,{completed:1,pending:1,delayed:1});
assert.equal(result.completionPercent,33);
assert.equal(result.chapters[0].completed,1);
assert.equal(result.chapters[1].delayed,1);
assert.throws(()=>summarize(plan,[{key,status:'completed'},{key,status:'pending'}],'2026-11-06'),/duplicate/);
assert.equal(summarize({...plan,scheduled:[]},[],'2026-11-06').completionPercent,0);
console.log('Syllabus reporting tests passed');
