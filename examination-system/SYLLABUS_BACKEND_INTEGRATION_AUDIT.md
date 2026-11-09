# Smart Syllabus Planner — Backend Integration Audit
Date: 2026-11-09
Status: Review only; **not deployed**.

## Existing server modules (inspected from main)
- `lamastudio-school-suite/backend-api/syllabus-draft.gs`: `LamaSyllabusDraft.create(schoolId,input)` validates a date/slot-based `scheduled` array and returns a `draft` plan with `version:1`. It sorts by date/slot and does **not** create an undated, permanent exercise-level division.
- `lamastudio-school-suite/backend-api/syllabus-approval.gs`: `LamaSyllabusApproval.prepare(plan,target,expectedVersion,actorId,reason,now)` prepares transitions `draft→submitted→approved→published→archived` (including returns to draft). It requires server-supplied actor/time but does **not** itself authenticate, persist or lock records.

## New planner modules (inspected from main)
- `syllabus-division-snapshot.js`: hashes a submitted, **undated** lesson division.
- `syllabus-calendar-engine.js`: schedules approved lesson IDs into school-specific dates and subject periods, retaining completed history.
- `syllabus-approval-ledger.js`: builds and verifies hash-linked submission/approval/publication events. This is an in-memory utility, **not** trusted persistence.
- `syllabus-published-diary-gate.js`: read-only gate requiring a published snapshot, ledger, versioned schedule, scope and server-derived actor.
- `syllabus-teacher-diary-projection.js`: read-only rows from approved lesson order and schedule.

## Incompatibilities and release blockers
1. **Data shape**: legacy `scheduled:[{date,slot,lessonId,lessonTitle,chapterId}]` is not the new permanent undated `lessons` plus separately versioned `assignments`. Never treat the old dated plan as an approved immutable division.
2. **State machine**: legacy plan permits returning approved plans to draft and archiving published plans; new ledger's publication is terminal. Decide and implement explicit revision/supersession rules, with separate immutable audit chains for each snapshot.
3. **Security**: server must derive actor, school, class/section assignment and Examination entitlement from authenticated session. Browser-supplied actor/school values cannot authorize reads or writes.
4. **Storage**: server needs atomic version checks, append-only audit persistence, scope isolation, and immutable snapshot storage. Pure JS hashes do not provide tamper-proof persistence.
5. **Runtime**: Node `require` and `node:crypto` cannot be copied unchanged into Google Apps Script. Choose a reviewed server adapter and matching hash canonicalization (Apps Script Utilities or trusted service).
6. **Timetable**: collect actual school subject-period numbers and closures. Never invent English periods or compress lessons to meet a deadline.
7. **Academic content**: Class 5 English 74-block/176-period draft is provisional, not exercise-verified or teacher-approved.
8. **Diary**: verify publication and scope on the server before returning read-only rows; do not write teacher diary or student data during preview.

## Recommended staged integration
A. Freeze existing live routes; introduce **read-only, isolated** snapshot/schedule preview endpoint only after server auth and scope checks are reviewed.
B. Add a versioned storage adapter and separate migration for legacy dated plans; require explicit approval before migration.
C. Validate the actual school timetable and exercise-level division; collect teacher approval.
D. Run all GitHub CI tests plus Apps Script integration tests on a nonproduction school; verify cross-school access denial and rollback.
E. Obtain explicit release approval before production routing, Apps Script deployment, data migration or Vercel build.

## Verification
This audit is grounded in inspected repository modules. No complete CI pass was observed; GitHub workflow-run lookup did not return a run for the last documentation commit. No production deployment, school-record modification or migration was performed.
