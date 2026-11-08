'use strict';
const assert=require('node:assert/strict');
const {reviseDraftLesson}=require('./syllabus-draft-editor');
const {createDraftDivision}=require('./syllabus-division-draft');
const catalog=require('./catalogs/english-class-5.json');
const draft=createDraftDivision(catalog),snapshot=JSON.stringify(draft);
const changes={topic:'Reading: comprehension practice',estimatedPeriods:4,weight:4,
 learningObjectives:['Identify the main idea'],subtopics:['Guided comprehension']};
const revised=reviseDraftLesson({division:draft,lessonId:'EN5-U01-READING',changes,expectedRevision:0});
assert.equal(revised.revision,1);
assert.equal(revised.lessons[0].estimatedPeriods,4);
assert.equal(revised.lessons[0].lessonId,draft.lessons[0].lessonId);
assert.equal(revised.lessons[1].lessonId,draft.lessons[1].lessonId);
assert.equal(JSON.stringify(draft),snapshot);
assert.throws(()=>reviseDraftLesson({division:revised,lessonId:'EN5-U01-READING',changes,expectedRevision:0}),/Revision conflict/);
assert.throws(()=>reviseDraftLesson({division:draft,lessonId:'EN5-U01-READING',changes:{lessonId:'NEW'},expectedRevision:0}),/Protected field/);
assert.throws(()=>reviseDraftLesson({division:{...draft,status:'approved'},lessonId:'EN5-U01-READING',changes,expectedRevision:0}),/Only draft/);
assert.throws(()=>reviseDraftLesson({division:draft,lessonId:'EN5-U01-READING',changes:{estimatedPeriods:0},expectedRevision:0}),/Invalid periods/);
console.log('syllabus draft editor tests passed');
