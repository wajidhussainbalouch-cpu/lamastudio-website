'use strict';
/**
 * Pure readiness check: textbook intake metadata is NOT a verified syllabus.
 * No IO, approvals, scheduling, or mutation.
 */
function assessIntake(intake, expectedClass, expectedSubject) {
 const issues=[];
 if(!intake||typeof intake!=='object'||Array.isArray(intake))
  return {readyForExerciseReview:false,readyForScheduling:false,issues:['Intake metadata missing'],source:null};
 const classId=String(intake.class||intake.classId||'').trim();
 const subjectId=String(intake.subject||intake.subjectId||'').trim();
 if(!classId||!subjectId)issues.push('Class and subject required');
 if(expectedClass&&classId.toLowerCase()!==String(expectedClass).toLowerCase())issues.push('Class mismatch');
 if(expectedSubject&&subjectId.toLowerCase()!==String(expectedSubject).toLowerCase())issues.push('Subject mismatch');
 const source=intake.source&&typeof intake.source==='object'?intake.source:{};
 const fileId=source.driveFileId||source.googleDriveFileId||null;
 const filename=source.fileName||null;
 const pages=source.pdfPages||source.pageCount||null;
 if(typeof fileId!=='string'||!fileId.trim())issues.push('Source Drive file ID missing');
 if(typeof filename!=='string'||!filename.trim())issues.push('Textbook filename missing');
 if(!Number.isSafeInteger(pages)||pages<1)issues.push('Valid PDF page count missing');
 return {readyForExerciseReview:issues.length===0,readyForScheduling:false,issues,
  source:{fileId:typeof fileId==='string'?fileId:null,fileName:typeof filename==='string'?filename:null,
   pdfPages:Number.isSafeInteger(pages)?pages:null},
  nextAction:issues.length?'Resolve source metadata and edition':'Visually verify each chapter, exercise and page; obtain school approval'};
}
module.exports={assessIntake};
