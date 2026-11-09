'use strict';
const assert=require('node:assert/strict');
const {assessIntake}=require('./syllabus-intake-readiness');
const sample={class:'Class 5',subject:'General Science',source:{
 fileName:'general science 5.pdf',driveFileId:'file123',pdfPages:134}};
const original=JSON.stringify(sample);
const ok=assessIntake(sample,'Class 5','General Science');
assert.equal(ok.readyForExerciseReview,true);
assert.equal(ok.readyForScheduling,false);
assert.equal(ok.source.pdfPages,134);
assert.equal(JSON.stringify(sample),original);
assert.equal(assessIntake(sample,'Class 4','General Science').readyForExerciseReview,false);
assert.equal(assessIntake(sample,'Class 5','Mathematics').readyForExerciseReview,false);
assert.equal(assessIntake(null).readyForExerciseReview,false);
assert.equal(assessIntake({...sample,source:{}}).readyForExerciseReview,false);
const urdu=assessIntake({class:'Class 1',subject:'Urdu',source:{
 fileName:'urdu 1.pdf',googleDriveFileId:'drive-id',pageCount:168}},'Class 1','Urdu');
assert.equal(urdu.readyForExerciseReview,true);
assert.equal(urdu.readyForScheduling,false);
console.log('Syllabus textbook intake readiness tests passed');
