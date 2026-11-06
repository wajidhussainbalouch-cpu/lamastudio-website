'use strict';
/* Static privacy and integration checks; live Supabase RLS verified separately. */
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=__dirname,read=x=>fs.readFileSync(path.join(root,x),'utf8');
const html=read('admin.html'),adapter=read('auth-supabase.js'),bank=read('admin-question-bank.js');
const publicHtml=read('index.html'),worker=read('sw.js'),migration=read('backend/supabase/003_question_bank_private.sql');
for(const id of ['questionBankManager','questionForm','qId','qJob','qSave','qList','qImportFile','qExport','registrationManager','registrationRows'])
 assert.ok(html.includes('id="'+id+'"'),'Missing private admin element '+id);
assert.ok(html.includes('admin-question-bank.js'));
assert.ok(html.includes('admin-registrations.js'));
for(const fn of ['adminQuestions','adminSaveQuestion','adminImportQuestions','adminRegistrations'])
 assert.ok(adapter.includes('function '+fn),'Missing authenticated Supabase API '+fn);
assert.ok(bank.includes("review_status:'draft'"),'Bulk imports must always enter editorial draft status');
assert.ok(bank.includes('new Set(raw.options.map('),'Bulk import must reject duplicate options');
assert.ok(bank.includes('!authorized'),'Admin editor should gate interactions on authorized state');
assert.ok(migration.includes('ENABLE ROW LEVEL SECURITY'));
assert.ok(migration.includes('REVOKE ALL ON public.ppsc_question_bank FROM PUBLIC,anon,authenticated'));
assert.ok(migration.includes("m.role='super_admin'"));
assert.ok(!publicHtml.includes('admin-question-bank.js'),'Candidate index must not load private editor');
assert.ok(!worker.includes("'./admin-question-bank.js'"),'Service worker must not cache editor');
assert.ok(!worker.includes("'./admin.html'"),'Service worker must not cache private admin');
console.log('Private Admin contract checks: all passed');
