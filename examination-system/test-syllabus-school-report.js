'use strict';
const assert=require('node:assert/strict');
const {aggregate}=require('./syllabus-school-report');
const reports=[
 {classId:'1',subjectId:'Math',totals:{completed:3,pending:1,delayed:1}},
 {classId:'1',subjectId:'English',totals:{completed:2,pending:2,delayed:1}},
 {classId:'2',subjectId:'Math',totals:{completed:4,pending:0,delayed:1}}
];
const result=aggregate(reports);
assert.equal(result.plans,3);
assert.equal(result.classes.length,2);
assert.equal(result.totalLessons,15);
assert.equal(result.totals.completed,9);
assert.equal(result.classes[0].completionPercent,50);
assert.equal(result.completionPercent,60);
assert.deepEqual(aggregate([]).totals,{completed:0,pending:0,delayed:0});
assert.throws(()=>aggregate([{classId:'1',subjectId:'Math',totals:{completed:-1,pending:0,delayed:0}}]),/Invalid lesson count/);
console.log('School syllabus report tests passed');
