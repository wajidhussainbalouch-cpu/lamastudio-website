'use strict';
const assert=require('node:assert/strict');const {planLegacyMigration}=require('./migration');
const rows=[{schoolId:'a',subscriptionType:'Paid',subscriptionStart:'2026-01-01',subscriptionEnd:'2027-01-01'},{schoolId:'b',subscriptionType:'Unclassified'},{schoolId:'c',subscriptionType:'Trial',subscriptionStart:'bad',subscriptionEnd:'bad'}];
const p=planLegacyMigration(rows);assert.equal(p.dryRun,true);assert.equal(p.proposedGrants.length,1);assert.equal(p.proposedGrants[0].module,'schoolManagement');assert.equal(p.manualReview.length,3);
assert.equal(planLegacyMigration(rows,[{schoolId:'a',module:'smartMarker'}]).proposedGrants.length,0);
assert.equal(planLegacyMigration([{schoolId:'x',subscriptionType:'Free'}]).proposedGrants.length,0);
assert.throws(()=>planLegacyMigration(null));console.log('Migration planner tests passed');
