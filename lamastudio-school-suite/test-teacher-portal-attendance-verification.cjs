'use strict';
/**
 * Compatibility regression entrypoint after moving the teacher portal to
 * class-scoped bulk writes, independent attendance readback and shared
 * school-local date helpers.
 *
 * Synthetic tests only. They never contact a school API or modify records.
 */
const assert=require('node:assert/strict');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const base=path.join(__dirname,'portals/teacher');
const cases=[
 'test-teacher-verified-dashboard.cjs',
 'test-teacher-bulk-save-readback.cjs',
 'test-teacher-refresh-preserves-marks.cjs',
 'test-teacher-session-scoping.cjs',
 'test-teacher-attendance-calendar.cjs',
 'test-teacher-tap-feedback.cjs'
];
for(const file of cases){
 const result=spawnSync(process.execPath,[path.join(base,file)],{encoding:'utf8',timeout:30000});
 assert.equal(result.error,undefined,file+' did not start: '+(result.error?.message||''));
 assert.equal(result.status,0,file+' failed:\n'+result.stdout+'\n'+result.stderr);
 process.stdout.write(result.stdout);
}
console.log('PASS: new teacher portal bulk-save, readback, calendar, identity and cross-role regression entrypoint.');
