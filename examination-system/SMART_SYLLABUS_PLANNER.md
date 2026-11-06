# LAMA Smart Syllabus Planner — Architecture and Integration
Status (2026-11-04): Scheduling, policy, workflow, diary suggestion and transaction-preparation modules committed. Not yet integrated with production portals or live Google Apps Script. CI results and end-to-end tests unverified.

## Product placement and licensing
- **Management entitlement:** Basic manual syllabus division, calendar configuration, chapter checklist and printable plan. Premium lesson-progress tracking requires Examination entitlement. Schools can use these without Examination subscription.
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


## Module authorization correction — 2026-11-04
- `syllabus-policy.js`: plan `view` now accepts either Management or Examination entitlement, while `markProgress` requires Examination. This supports Examination-only schools and prevents Management-only users from writing premium syllabus progress.
- `test-syllabus-policy.js`: added cases for Examination-only view and progress, Management-only progress denial and unlicensed view denial.
- Tests committed but CI results not verified; backend must still enforce this policy using trusted server-side entitlements. No backend deployment, production website deployment or school data writes performed.


## Release verification — 2026-11-04
- Added explicit reason validation to `syllabus-transaction.js` when returning a submitted/approved plan to draft (workflow also checks this).
- Checked GitHub combined commit status for `39968ad5eb29c2fe060f39fd71a03eda2292d801`: Vercel context reports `failure` with build-rate-limit URL. This does **not** verify GitHub Actions unit test outcome. No deliberate Vercel deployment initiated.
- Production readiness remains blocked by unverified deployed Apps Script modules, absent persistent syllabus storage and live admin/teacher integration. Preserve existing school Sheets and production backend until verified and backed up.


## Approval regression coverage update — 2026-11-04
- Expanded `test-syllabus-transaction.js` with return-to-draft tests: administrator supplies a meaningful reason, plan version increments, prior approval is cleared, and audit reason is retained.
- Added negative cases for whitespace-only reason, teacher attempting approval reset, and mismatched entitlement school.
- Reconciled this handoff's licensing summary with the current policy: automated lesson progress (`markProgress`) requires Examination; Management-only permits manual planning/checklist but not premium progress updates.
- **Verification status:** GitHub commit created, but the tests have not been executed/verified in this session. A successful commit does not imply a successful Actions run or deployed feature.
- **Release blockers:** Confirm live Apps Script source and authorization; implement dedicated tenant-scoped syllabus plan storage with locked version checks and durable audit; connect actual school-admin and teacher portals; validate role isolation, school data safety and mobile flows. No production deployment or school data writes.


## Tenant-scoped storage orchestration — 2026-11-05
- Added `syllabus-store.js`, a fail-closed backend-only orchestrator for plan state changes. It requires a verified server session and trusted callbacks: `loadEntitlements`, `withLock`, `readPlan`, `commitPlanAndAudit`, and `now`.
- The exclusive lock spans the current plan read, expected-version validation and the persistence callback. Plan ID and school ID must match the stored record; entitlement data must be server-loaded and scoped to the same school. Commit acknowledgement must match school, plan and new version.
- Added `test-syllabus-store.js` for successful approval, stale versions, tenant mismatch, untrusted entitlements, wrong-school plan and missing commit confirmation; wired into GitHub Actions.
- **Not yet a production endpoint:** Apps Script adapters for `LockService`, durable plan/audit storage, trusted session verification and atomic recovery are not implemented or deployed. The callback named `commitPlanAndAudit` must guarantee all-or-nothing behavior or use a recoverable journal, since separate Sheets writes are not atomic.
- Next: reconcile the live Apps Script deployment with repository source, back up school registries, implement a dedicated server-side adapter and test failure recovery, then connect admin/teacher UI. No Vercel deployment or school-data modification.


## Isolated Apps Script sheet adapter — 2026-11-05
- Added `examination-system/syllabus-sheets-adapter.gs` as a **non-deployed** Google Apps Script implementation of syllabus plan storage. It uses a dedicated `_LAMA_SYLLABUS_PLANS` worksheet with `schoolId`, `planId` and `recordJson` columns.
- Each plan and its entire audit trail are serialized in the same cell, avoiding the split-write problem of separate plan and audit worksheets. Writes use `LockService.getScriptLock()`, version comparison, `SpreadsheetApp.flush()` and read-back verification. Duplicate keys, unexpected schema, wrong tenant and records exceeding a conservative 45,000-character limit are rejected.
- The adapter exports `initialize`, `read`, `create` and `transition`. It is **not** an authenticated HTTP endpoint; its `trustedAuthorized` flag and `trustedPrepare` callback MUST only be supplied by a verified backend service after server-side identity, role, school, entitlement and plan validation. Never expose these parameters directly from client requests.
- **Operational limitation:** The single-cell plan+audit approach is bounded by Google Sheets cell size and unsuitable for unbounded history or very large schedules. Long-term production storage should partition records and keep a durable journal with tested recovery. Read-back verification detects some failures but is not proof of cross-service atomicity.
- **Still pending:** Verify which Apps Script project is live, back up source and registry, integrate with the existing authenticated router, implement teacher progress and admin pages, and execute automated/integration tests. No deployed backend or school records were changed.


## Teacher portal and backend route wiring — 2026-11-05
- Added a `syllabusPublishedPlans` POST-only action to repository copy of `lamastudio-school-suite/backend-api/code.gs`. It uses `authorizeTeacher`, checks the teacher's assigned class and subject against the published plan, and reads only the teacher's own school spreadsheet.
- The route **fails closed** unless both `LamaSyllabusSheetStore` and a trusted `lamaSchoolHasModuleGrant_(schoolId,'examination')` helper are installed in the *same* Apps Script project. This entitlement helper is **not implemented yet**; never replace it with a browser-provided flag or an admin-key bypass. Existing module-grant helper `lamaAdminGetModuleGrant_` is admin-authenticated and cannot safely be called with a null admin key.
- Added `LamaAPI.getPublishedSyllabusPlan(planId)` in `lamastudio-school-suite/js/api-client.js`, using POST with the active teacher session.
- Added a read-only published-syllabus panel to `lamastudio-school-suite/portals/teacher/teacher-diary.html`; teacher supplies a plan ID and date and sees the scheduled lessons. It never silently creates homework or marks progress.
- **Admin integration remains pending:** create/approve/publish endpoints, server-side module grants, plan discovery and admin UI. Existing `syllabus-sheets-adapter.gs` must be installed alongside the live Apps Script and the live deployment must be backed up/verified first. No backend deployment, database writes, or live end-to-end verification occurred.


## Administrator read-only integration — 2026-11-06
- Confirmed existing `lamastudio-school-suite/backend-api/module-entitlements.gs` already implements `lamaSchoolHasModuleGrant_` and `lamaRequireModuleForVerifiedSchool_`; avoid duplicate entitlement implementations. This file must be included in the actual live Apps Script deployment before the route can work.
- Added POST-only `syllabusAdminReadPlan` route in repository `backend-api/code.gs`, requiring school administrator token verification, an active Examination grant, tenant-scoped school spreadsheet resolution and plan ID. The response includes the stored plan and audit trail, not write capabilities.
- Added `LamaAPI.getAdminSyllabusPlan(planId)` and a read-only administrator page at `lamastudio-school-suite/portals/school/syllabus-planner.html`. It renders scheduled lessons, plan status and approval audit using textContent (not untrusted HTML).
- The existing teacher route uses the already-present `lamaSchoolHasModuleGrant_` helper. Both routes remain fail-closed if the backend files have not been installed.
- **Important:** Administrator page is not yet linked from the verified active school dashboard; create/submit/approve/publish and plan discovery endpoints remain pending. No live Apps Script deployment, production deployment or database modification has occurred. Unit/integration tests have not been verified.
