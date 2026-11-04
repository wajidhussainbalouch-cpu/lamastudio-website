# LAMA Smart Syllabus Planner — Architecture and Integration
Status: Scheduling engine committed; not connected to production portals or Google Apps Script.

## Product placement and licensing
- **Management entitlement:** Basic manual syllabus division, calendar configuration, chapter checklist, printable plan and teacher progress entry. Schools can use these without Examination subscription.
- **Examination entitlement:** Automated scheduling and recalculation, suggested teacher diary lessons by date, chapter/term test scope, automated progress forecasts, exam-linked revision and assessment days.
- **Smart Marker entitlement:** Optional separate OMR and handwritten paper marking; no dependency for basic syllabus planning.
- Super Admin controls entitlements per school; backend must verify school/tenant and entitlement on every action. Do not rely on client-only checks.

## School calendar
- School selects session start date and duration (1–24 months), optionally an end date.
- Select weekly off days (Sunday=0, Monday=1, … Saturday=6): e.g. government Sat+Sun [0,6], private Sun [0].
- Add public holidays by region and year, school-specific holidays, exams, closures and make-up days. **No hard-coded holiday dates:** religious holidays and government notifications may change. Admin reviews imported calendar before approval.
- Separate calendar from curriculum: changing academic start month reflows dates, not lesson/chapter IDs or learning outcomes.
- Classes may use different subject timetables and periods per day; the initial engine models a single subject's available teaching slots, not a full cross-subject timetable.

## Syllabus metadata and allocation
- School/class/subject/curriculum version -> ordered chapters -> ordered lessons -> required teaching periods, difficulty, learning outcomes, optional source pages.
- One period is one teaching slot. School can change pace, reserve revision and assessment days and customize teacher assignments.
- Generated schedules start in **draft** status; admin approves and publishes versioned plan. Teacher diary shows proposed daily lessons with date and topic, not auto-completed entries.
- If calendar has too few teaching days, stop with capacity error; never silently drop lessons.
- Holidays and closures are excluded. Teachers may mark taught, delayed, skipped or rescheduled; keep original plan, change history and reasons. A replan must not overwrite past attendance or diary entries.
- A student-level accommodation can be teacher-managed; never automatically infer learning ability from marks or sensitive personal data.

## Exam integration
- Monthly/term/chapter test selection references **verified** chapter IDs and published syllabus-plan version.
- Teacher/admin chooses covered chapters and approves the paper. The exam engine selects only quality-approved, online-ready questions, not all 1,500 unverified drafts.
- Future diary should show 'Today's suggested lesson', 'Next lesson', progress and upcoming chapter test. Student portal may show assigned syllabus and exam scope according to school policy.

## API / persistence contract (future work)
- `school_calendars`: schoolId, sessionId, startDate, endDate, timezone, weeklyOffDays, holidayOverrides, revision.
- `syllabus_catalog`: curriculumId, classId, subjectId, chapterId, lessonId, order, periods, sourceVersion.
- `syllabus_plans`: schoolId, classId, subjectId, calendarVersion, catalogVersion, mode, planVersion, status, approvedBy.
- `syllabus_plan_entries`: date, lessonId, chapterId, teacherId, slot, status, completionDate, changeReason.
- `syllabus_events`: append-only change audit with actorId, timestamp, before/after and correlationId.
- `exam_assignments`: approved plan version, selected chapter IDs, teacher/admin publish approval and student scope.
- APIs: draftPlan, previewPlan, approvePlan, publishPlan, teacherDiarySuggestions, markLessonProgress, requestReplan, approveReplan, examScopeFromPlan.
- Enforce authenticated tenant isolation and atomic versioned writes; do not let client edit published records directly.

## Current code
- `examination-system/syllabus-scheduler.js`: pure JavaScript functions `workingDates`, `periods`, `buildPlan`, `teacherDiary` for planning. No backend writes.
- `examination-system/test-syllabus-scheduler.js`: Node test script; execute with `node examination-system/test-syllabus-scheduler.js`.
- Existing `examination-system/exam-blueprint.js`: question selection by chapter, approval/entitlement blueprint.

## Release blockers
1. Confirm real syllabus chapter/lesson catalog per class and subject, source pages and lesson duration.
2. Integrate school settings and admin/teacher UI; persist and audit versioned plans with tenant permissions.
3. Add school holiday administration, exceptions, make-up days and timetable-specific subject slots.
4. Handle date-aware replan without rewriting taught lessons; add cross-year tests, timezone/term edge tests.
5. Run automated tests and browser/print/PDF validation; confirm online exam and Smart Marker integration.
6. No deployment without user approval.


## Syllabus planner development continuation — 2026-11-04
- Added `syllabus-progress.js` as a standalone read-only companion to the existing scheduler. Tracks completed, pending and delayed lesson periods using stable composite schedule-entry keys; provides diary suggestions and chapter coverage for exam scoping.
- Added `test-syllabus-progress.js` covering completion/delay classification, diary suggestions, chapter coverage, invalid keys and invalid dates.
- Coverage is advisory only: chapter tests still require teacher approval and separately verified question-bank questions. This helper does not publish papers or modify grades.
- Existing scheduling engine, textbook metadata, school records, portals and Apps Script were not modified. New files committed directly to `main`.
- **Still outstanding:** execute tests in CI, connect real verified chapter/lesson catalogs, manual Management UI, automated Examination UI, backend tenant/entitlement checks, versioned persistence, teacher diary writeback, calendar exceptions/make-up days, and approved exam scope. No Vercel deployment.


## Continuation — verified catalog and manual checklist (2026-11-04)
- Added `examination-system/syllabus-catalog.js`: standalone verified textbook lesson catalog normalization, globally unique lesson IDs, positive teaching-period validation and basic manual lesson checklist output.
- Added `examination-system/test-syllabus-catalog.js`: Node assertions for verified catalog normalization, completed manual checklist, rejection of unverified catalogs, unknown lesson IDs and duplicate chapter IDs.
- **Important:** textbook intake registration is not equivalent to a verified chapter/lesson catalog. Automatic scheduling must not invent chapter names or lesson content; verified lesson metadata remains a prerequisite.
- The catalog/checklist functions are pure and read-only; no school data or production portal changes. Tests are committed but execution not confirmed.
- Pending: integration with real school settings and teacher diary, authenticated backend persistence and entitlement enforcement, approved chapter-wise exam scope, live catalog verification and end-to-end testing. No Vercel deployment.


## Calendar continuation — 2026-11-04
- Added `syllabus-calendar.js` with strict ISO date validation, weekly holidays, dated public holidays, custom closures, make-up day overrides, and subject weekday/period slots. This is an additive pure module and does not replace the existing scheduler or write school records.
- Added `test-syllabus-calendar.js`; local Node test run **passed** for make-up day, holiday/closure exclusion, subject slots, invalid dates, conflicting and out-of-range overrides.
- Integration still required: existing `syllabus-scheduler.js` does not yet consume the new calendar adapter, and no teacher/admin UI or Apps Script endpoint has been connected. Public holiday dates must be approved by school administrators, not guessed.
- No Vercel deployment.


## Integrated preview continuation — 2026-11-04
- Added `syllabus-planner.js`: additive pure preview adapter joining `syllabus-catalog.js`, `syllabus-calendar.js`, and `syllabus-scheduler.js`. It validates verified chapter/lesson catalogs, uses subject-specific teaching slots, respects closures and make-up days, supports monthly/quarterly/two-term/three-term/custom divisions, and reserves subject teaching days for revision and assessment.
- Added `test-syllabus-planner.js` with cases for holiday exclusion, make-up scheduling, draft approval flags, unverified catalog rejection and insufficient subject capacity.
- Existing scheduler remains unchanged for backward compatibility. This is preview-only; no Apps Script writes, tenant access, entitlement enforcement or teacher diary synchronization. Test file committed but integrated test execution has not been verified.
- Next: run the complete Node suite and CI; implement school-specific authenticated plan persistence, approval/replan audit, subscription enforcement, and management/teacher portal wiring. No Vercel deployment.


## Versioned approval workflow continuation — 2026-11-04
- Added `syllabus-workflow.js`, a pure state machine for draft -> submitted -> approved -> published -> archived; submitted/approved plans can return to draft with a reason. Includes expected-version conflict checks, actor IDs, tenant identity matching helper and audit-event payloads.
- Added `test-syllabus-workflow.js` with success transitions, diary publication gate, stale version rejection, reason validation, tenant mismatch and invalid preview checks. Tests are committed; execution is not confirmed.
- **Security boundary:** these client-callable helpers do not authorize operations. Backend must derive actor/school from authenticated sessions, check subscription and role, write plans and events atomically, and use trusted server timestamps. Do not rely on supplied actor IDs or client tenant IDs for authorization.
- Published-plan diary integration and UI/backend persistence remain outstanding. No production school data modified and no Vercel deployment.


## CI test automation — 2026-11-04
- Added `.github/workflows/syllabus-planner-tests.yml` on `main` (commit `51f0ccab9c30a10adf7cf89c5313a62970679b9b`). On relevant JS changes and PRs, GitHub Actions is configured to run all six Node suites: scheduler, progress, catalog, calendar, integrated preview, workflow.
- This commit creates the CI configuration; a completed successful Actions run is **not yet verified**. Check Actions logs and fix failures before claiming release readiness.
- Next: backend tenant/entitlement authorization, atomic plan and event persistence, teacher/admin UI integration, and diary sync. No Vercel deployment.


## Browser preview development — 2026-11-04
- Added `examination-system/syllabus-planner-preview.html`: mobile-responsive standalone browser page loading the four pure JS planner dependencies. School can enter academic dates, weekly off days, subject weekdays, dated closures/holidays/make-up dates, revision/assessment days, and paste a verified catalog JSON to calculate a draft timetable.
- The included catalog is explicitly synthetic demonstration data, not official textbook chapters. User-supplied JSON is rendered with HTML escaping; no student data or backend calls are made.
- **Not live-ready:** page is not wired into School Suite navigation or authenticated portal, cannot save/approve/synchronize plans, and has not undergone browser/end-to-end testing. A GitHub commit does not prove a Vercel production deployment. Do not invite user to test live until the full feature is integrated and deployed with approval.
- Next: inspect existing school portal/auth and Apps Script contracts, add authenticated tenant-isolated plan CRUD, subscription gates, teacher/admin screens, verify browser and CI tests. No Vercel deployment requested or performed.


## Safe replan continuation — 2026-11-04
- Added `syllabus-replan.js` as a read-only replan preview. It matches lesson periods by chapter/lesson/period identity, retains completed lesson dates and slots, and moves unfinished lessons only to future slots from a replacement preview.
- Rejects changed lesson-period catalogs, duplicate lesson identities, conflicting slots and insufficient future teaching capacity. Returns draft flags requiring approval and a reason on eventual save; original plan is not mutated.
- Added `test-syllabus-replan.js` and included it in `.github/workflows/syllabus-planner-tests.yml` (seven test scripts total). Test execution and CI result are not yet verified.
- Next: authorized backend persistence, audit-safe replan approval, teacher diary integration, browser testing and eventual live deployment only after release readiness. No Vercel deployment or school record changes.


## Backend access policy continuation — 2026-11-04
- Located actual School Suite frontend in `lamastudio-school-suite/` and Apps Script backend in `lamastudio-school-suite/backend-api/code.gs`; previous guesses at root admin/teacher paths were not correct.
- Added `syllabus-policy.js` as a pure backend authorization **contract** with verified session requirement, same-school checks, role rules, Management entitlement for basic features, and Examination entitlement for automated scheduling/exam scope. It does not authenticate requests or modify Apps Script.
- Added `test-syllabus-policy.js` and wired it into the GitHub Actions syllabus test workflow (eight suites total). Execution and CI success remain unverified.
- **Critical next integration:** inspect actual Apps Script auth/session/entitlement code and implement checks server-side; do not expose this helper as client-only security. Add authenticated plan CRUD, atomic version checks, audit events, admin/teacher UI and browser tests. No Vercel deployment.


## Entitlement policy audit — 2026-11-04
- Reviewed existing `syllabus-policy.js` and found `submit`, `approve`, and `publish` were permitted with Management alone, despite automated planning requiring Examination entitlement.
- Corrected the premium action set to include automatic preview, submit, approve, publish, replan, automatic diary suggestions and exam scope. Manual editing and calendar editing remain Management actions.
- Added optional `entitlements.schoolId` mismatch rejection and regression assertions in `test-syllabus-policy.js`. Existing GitHub Actions workflow already includes this policy test.
- **Security caution:** this is a pure policy helper, not an authenticated backend. Production endpoints must use trusted session and server-loaded entitlement records, and must check every read/write. Test execution and live browser deployment remain unverified. No Vercel deployment.


## Planner slot reservation fixes — 2026-11-04
- `syllabus-planner.js`: optional `schoolCalendar.weeklyOffDays` now defaults to `[]` when returning calendar metadata, matching `syllabus-calendar.js` default behavior.
- Revision and assessment days now reserve **every subject period** on each reserved date, not just slot 1. This avoids treating extra subject periods as available on assessment days.
- Added multi-period reservation and missing-weekly-off-day regression assertions in `test-syllabus-planner.js`. CI outcome still requires verification.
- This is code-only development. Authenticated persistence, school portal integration, live browser QA and production deployment remain outstanding. No Vercel deployment initiated.


## Replan reserved-slot correction — 2026-11-04
- Updated `syllabus-replan.js` to retain non-lesson revision/assessment slots from replacement previews and exclude those reserved slots from reassignment; sorts future candidate slots by date/slot.
- Added regression assertions to `test-syllabus-replan.js` that revision slots remain present and cannot be assigned a lesson.
- Test execution remains unverified. GitHub repository access works through connector, but direct container Git access is unavailable due to DNS resolution failure. Do not claim a passing local suite or live website readiness.
- Still required before live testing: authenticated tenant-scoped persistence and approval audit trail, school admin/teacher portal UI, browser end-to-end QA and deployment authorization. No Vercel deployment initiated.


## Published teacher diary adapter — 2026-11-04
- Added `syllabus-diary.js` exposing read-only `suggestions({plan,schoolId,classId,subjectId,date,updates})` from published plans only, with school/class/subject scope checks, plan ID/version and teacher-confirmation metadata.
- Added `test-syllabus-diary.js` covering published suggestions, wrong tenant, wrong class, unpublished plans and empty days. Included in syllabus GitHub Actions workflow.
- **Not yet wired into the actual teacher diary page or backend.** The backend must authorize school/teacher and Examination entitlement, fetch the trusted published plan and progress updates, and never auto-mark suggested lessons complete.
- Test run verification, portal integration, audit-safe persistence and live website testing remain pending. No Vercel deployment initiated.


## Actual School Suite integration audit — 2026-11-04
- Located actual teacher diary at `lamastudio-school-suite/portals/teacher/teacher-diary.html`; it currently uses `LamaAPI.list('homework')` and generic `add/update/remove('homework')`, authenticated via `LamaAPI.requireLogin('teacher')`. It does not yet consume published syllabus suggestions. Do not repurpose homework as a syllabus-plan store.
- Located backend repository source `lamastudio-school-suite/backend-api/code.gs` and the current handoff `lamastudio-school-suite/README.md`. The live Apps Script deployment may differ from this file and include other modules. **Do not overwrite or redeploy backend until live source, authorization and sheet schemas are verified and backed up.**
- Located warning in School Suite README that old teacher diary may be disconnected demo; confirm canonical active teacher diary route before editing or linking it.
- Fixed `syllabus-policy.js`: Examination-only schools can use automated planning without a Management subscription; manual Management features still require Management entitlement. Added tests in `test-syllabus-policy.js`.
- Remaining: identify active portal route, verify live backend version, implement dedicated school-scoped syllabus storage/approval API with trusted entitlements and append-only audit, then wire teacher/admin UI and verify browser E2E. No Vercel deployment.


## Authenticated approval transaction contract — 2026-11-04
- Audited actual `lamastudio-school-suite/js/api-client.js` and `backend-api/code.gs`; current frontend sends Google Apps Script actions and role credentials. Do not assume a new syllabus action is implemented on the deployed Apps Script.
- Added `syllabus-transaction.js`: prepares a version-checked approval transition with verified session, tenant and Examination entitlement checks, backend-supplied timestamp and audit payload. **It does not persist data or acquire a lock.** Backend must use `LockService`, re-read current row, compare expected version, and persist both plan and audit safely, with recovery strategy if multiple sheet writes fail.
- Added `test-syllabus-transaction.js` and CI step covering success, version conflict, wrong school, unauthorized teacher, missing Examination entitlement, invalid timestamp and invalid transition.
- Next: verify live Apps Script source/modules and backend schema, implement isolated syllabus collections and endpoint without replacing current deployed modules, then integrate active admin/teacher pages. CI and live browser verification pending; no Vercel deployment.
