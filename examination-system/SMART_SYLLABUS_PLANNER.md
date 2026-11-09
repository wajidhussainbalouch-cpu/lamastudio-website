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


## Automatic plan discovery — 2026-11-06
- Added `LamaSyllabusSheetStore.list(spreadsheetId, schoolId, filter)` to the isolated Apps Script adapter. It reads only rows for the authenticated school, detects duplicate plan IDs and corrupt records, and returns metadata (plan ID, class, subject, session, status, version, lesson count), not scheduled lesson content or audit history.
- Added POST-only `syllabusListPlans` backend route. School administrators must pass `requireSchoolAdminWrite` and server-side Examination entitlement verification; teachers must pass `authorizeTeacher` and receive only published plans for their assigned class and subject. Students cannot use this route.
- Added `LamaAPI.listSyllabusPlans()` and dropdown discovery in both the school administrator syllabus page and teacher diary. No manual plan ID is needed when the backend is installed and records exist.
- **Security caveats:** Apps Script deployment must include `module-entitlements.gs`, `syllabus-sheets-adapter.gs` and the updated `code.gs`. The adapter currently scans up to 5,000 plan rows and rejects larger indexes pending server-side pagination. Plan class/subject mapping should be verified against canonical school identifiers; section-level assignment is not yet represented in syllabus plans.
- **Not completed:** Create/submit/approve/publish endpoints, trusted server-side plan generation/validation, plan edit history, automatic diary posting, production deployment and end-to-end security tests. Do not claim production readiness. No school data was modified.


## Administrator approval transitions — 2026-11-06
- Added `lamastudio-school-suite/backend-api/syllabus-approval.gs` with a server-side state machine for draft → submitted → approved → published → archived, plus submitted/approved → draft with mandatory reason. It rejects stale versions and preserves actor ID, timestamps, approval/publishing metadata and audit events.
- Added POST-only `syllabusChangeStatus` to `backend-api/code.gs`. Requires `requireSchoolAdminWrite`, verified Examination entitlement, school-scoped spreadsheet lookup, `LamaSyllabusSheetStore.transition` under a script lock and the server-side approval helper. It does not trust client-supplied actor IDs or school spreadsheet IDs.
- Added `LamaAPI.changeSyllabusStatus` and status-action buttons to `portals/school/syllabus-planner.html`. Actions confirm before submission, require a reason when returning to draft, and reload plan/audit data after saving.
- Added `test-syllabus-approval.js` and CI job for the Apps Script state machine. Test execution/CI status is not verified in this turn.
- **Security and release caveats:** This is an administrator-only first phase, not teacher submission. Existing teacher routes remain read-only. The adapter still requires installation into the verified live Apps Script project, plus module-entitlements and approval helper files. There is no plan-creation endpoint, no validated schedule editor, no canonical class/section mapping, and no live integration testing yet. Do not deploy or declare production-ready without backup, testing and review.

## Draft creation work — 2026-11-06
- Added POST-only syllabusCreateDraft route in backend-api/code.gs with administrator session verification, Examination grant verification, configured-class check, strict LamaSyllabusDraft validation and locked syllabus storage initialization/create.
- Added LamaAPI.createSyllabusDraft(draft) to api-client.js.
- Added draft input fields to school administrator page, but the submit button is deliberately DISABLED because its client-side handler could not be committed successfully. Do not claim the form works.
- Draft validation module exists in backend-api/syllabus-draft.gs. No verified automated tests or live deployment. Teacher progress remains pending.

## Draft form and validation tests — 2026-11-06
- Connected the school administrator draft form submit handler to LamaAPI.createSyllabusDraft, including lesson-line parsing, saving feedback, and refreshed plan discovery. Removed the deliberately disabled Save Draft state.
- Added backend-api/test-syllabus-draft.js to cover draft defaults, tenant-injection rejection, duplicate slots, invalid dates and invalid slots. Added the test to the syllabus CI workflow. GitHub Actions execution has not been verified.
- The browser form is repository-only, not live; school class configuration mapping, Apps Script deployment and end-to-end tests must be checked before production use. Teacher progress recording and safe editing of drafts remain pending.

## Teacher lesson progress — 2026-11-06
- Added separate Apps Script worksheet adapter syllabus-progress-store.gs using `_LAMA_SYLLABUS_PROGRESS`, a script lock, exact published-plan lesson-key validation, and tenant-scoped reads. Progress is independent of the approved plan and existing homework/attendance.
- Added POST-only syllabusTeacherProgress route in code.gs; authenticates teacher, checks Examination entitlement and matches class/subject against published plan. Supports list/save operations.
- Added LamaAPI.listSyllabusProgress and LamaAPI.saveSyllabusProgress. Teacher diary now displays per-lesson progress controls and feedback when loading a published plan.
- Caveats: teacher completion dates currently use the browser's UTC date; server-side trusted date policy and progress ownership/section policy need review. No live Apps Script deployment, runtime verification or test execution was performed. School admin progress reporting is not yet integrated.

## Administrator reporting and progress-store safety (6 Nov 2026)
- Added authenticated school administrator per-plan progress API and browser table for completed, pending and delayed lessons; chapter-level counts are displayed in the administrator page.
- Changed progress-store reads so a missing progress worksheet returns an empty result without creating a new sheet. Writes still initialize the isolated progress worksheet under a script lock.
- Added pure reporting helper syllabus-report.js and Node test-syllabus-report.js, configured in the syllabus CI workflow. CI execution has not been verified.
- Remaining: consolidated school-wide reporting, section/teacher ownership policy, test runs, Apps Script deployment and live integration. No live records or deployments were changed.

## School-wide class progress dashboard (6 Nov 2026)
- Added syllabusSchoolProgress POST-only backend action: verified school administrator, Examination entitlement, tenant-scoped plan and progress reads, published/archived plan filtering, and maximum 100 plans per report.
- Added LamaAPI.getSchoolSyllabusProgress and school admin dashboard table showing class, plan count, completed, pending, delayed and completion percentage.
- Added pure syllabus-school-report.js aggregation helper and Node tests in test-syllabus-school-report.js; configured CI workflow. GitHub Actions execution has not been confirmed.
- Reporting uses all published and archived plans, so overlapping plans may double-count lessons; reporting must add session and active-plan filters before production. Teacher-section ownership enforcement and live Apps Script verification are still pending. No deployment or live data change.

## Academic-session reporting safeguards (6 Nov 2026)
- School-wide progress now requires an academic session, passed through the school admin selector and API client. Only published plans in that session are included; archived plans are excluded.
- Duplicate published plans for the same class and subject in the same session cause an explicit error rather than double-counting. This is intentionally conservative until multi-section planning is modeled.
- Added syllabus-session-filter.js and test-syllabus-session-filter.js, and included tests in the CI workflow. Tests and deployment remain unverified.
- Important remaining work: section-aware plan schema and teacher permissions, end-to-end verification, and a production Apps Script release after approval. No live school data was changed.

## Section-aware assignments and teacher permissions — 6 Nov 2026

Implementation committed on `main`:
- Draft validation accepts an optional `sectionId` (blank for unsectioned classes). School-admin draft form sends it; backend verifies both class and section against configured school offerings.
- Syllabus list metadata exposes sectionId, defaulting to blank for legacy plans. Teacher discovery, published-plan read and progress updates require exact school/class/subject/section match to the authenticated teacher assignment. Blank-section plans are accessible only to teachers with blank section assignment; there is no cross-section fallback.
- School-wide report duplicate checks distinguish class + subject + section within the selected academic session. Pure session-filter tests include distinct sections.
- Progress writes refuse to overwrite a lesson entry last recorded by a different teacher. Administrators need a controlled reassignment procedure before handovers.
- Updated draft tests for section validation and legacy blank sections.

Validation and release gate:
1. GitHub file-content checks confirm all new section fields and permission hooks exist. This is not runtime verification.
2. Node test execution, GitHub Actions success, Apps Script deployment dependencies and live end-to-end tests are NOT verified. Do not claim production readiness.
3. Test school admin draft -> submit -> approve -> publish -> teacher assigned section sees plan -> other section cannot see or save -> progress -> school admin report; test archived plans and legacy blank sections.
4. Ensure all required `.gs` modules are deployed together in the existing Apps Script project without replacing production school records. Do not deploy or change Vercel before the release gate passes.
5. Remaining: secure teacher reassignment, teacher section configuration audit, performance of multi-plan reporting, integration test coverage and confirmation of live authentication.

## Progress-store validation and release gate — 6 Nov 2026
- Added mocked Apps Script regression tests for tenant isolation, missing-sheet read behavior, malformed completion dates and cross-teacher overwrite rejection. Registered in syllabus CI.
- Malformed completion dates now return a controlled validation error.
- Section-aware reverse teacher reassignment with administrator audit remains NOT implemented. Full workflow tests, GitHub Actions success and production Apps Script deployment are NOT verified. No live release has been performed.

## Audited teacher progress reassignment — 6 Nov 2026
- Added POST-only `syllabusReassignProgress` for verified school administrators with Examination entitlement. The backend verifies both teachers are active members of the school and checks the destination teacher's class, subject and section against the published plan.
- Added `LamaSyllabusProgressStore.reassign` with script lock, duplicate lesson detection, source ownership checks and transfer-intent audit in `_LAMA_SYLLABUS_TRANSFERS`. Existing completion status and dates are preserved; only teacher ownership and update timestamp change.
- Added admin transfer form and `LamaAPI.reassignSyllabusProgress`, with a confirmation prompt and mandatory reason. Added `test-syllabus-reassign.js` and CI step.
- **Important limitation:** Google Sheets cannot atomically commit audit and multiple progress rows. The transfer logs intent before updates, so an interruption can leave a partially transferred set. A recovery/reconciliation workflow and failure-injection tests are mandatory before production release.
- Live Apps Script deployment, GitHub Actions results, real teacher registry verification and complete end-to-end tests remain unverified. Do not release to live School Suite yet.

## Teacher reassignment failure handling — 6 Nov 2026
- Strengthened `LamaSyllabusProgressStore.reassign`: after recording transfer intent, updates rows under script lock, reads each changed row back, checks teacher ownership and preservation of status/completion date, and attempts to restore previously updated rows if an update or verification fails.
- Added a failure-injection regression scenario to `test-syllabus-reassign.js` that forces a later row write to fail and checks earlier rows are restored.
- **This is not an atomic transaction.** An Apps Script timeout, process termination or failed rollback may still leave an audit intent and partially reassigned rows. Such cases must be manually reconciled before another transfer; a durable resumable journal is still required for production readiness.
- Current code is committed to GitHub; CI execution and live end-to-end verification are not confirmed. Do not deploy to live school records yet.

## Release hardening update — 6 Nov 2026
- Corrected a pre-existing storage orchestration regression test: its missing-commit-confirmation scenario now supplies a matching plan version, allowing the intended assertion to execute rather than failing earlier with a version conflict.
- Verified in repository source that `doGet` blocks syllabus mutation and private syllabus read endpoints, including `syllabusReassignProgress`; teacher plan discovery uses the exact section-aware scope helper.
- Added transfer rollback and failure-injection tests in previous changes. Test execution and a production Apps Script deployment have **not** been confirmed; commits alone do not establish correctness.
- Outstanding before release: execute and fix CI failures; verify teacher registry schema/status fields and the actual configured-section representation; implement durable transfer recovery for interruptions; test school administrator and teacher journeys against a disposable test school; obtain verified production Apps Script deployment and smoke-test. Do not use production school data for unverified transfer tests.

## Verified Class 5 English textbook source — 6 Nov 2026

- User-supplied Google Drive PDF: https://drive.google.com/file/d/1jsODAQskQsmY_SUp_4xJS7_4VB2lEfat/view?usp=drivesdk
- Filename: `english 5.pdf`; 154 PDF pages. PDF is scanned/image-based: text extraction yields no usable text. Contents table visually inspected on PDF pages 5–6; **book page numbers below are printed textbook pages, not PDF indices**.
- Unit inventory, printed page starts:
  1. Patience — 1
  2. Be Grateful — 12
  3. Women as Role Models — 25
  Review 1 — 33
  4. Unforgettable Moments of My Life — 35
  5. Amazing Planet — 45
  6. A Fit and Healthy Life — 54
  Review 2 — 64
  7. What Goes Around, Comes Around — 66
  8. Do What's Right — 75
  9. Patriotism — 83
  10. Eid-ul-Azha — 94
  Review 3 — 105
  11. Let's Be Helpful — 107
  12. Our National Animal — 116
  13. When Something Went Wrong — 125
  14. Together We Live — 135
  Review 4 — 146
- Contents table confirms strands for each unit: oral communication, reading/critical thinking, language focus, grammar and writing. Reviews occur after units 3, 6, 10 and 14.
- **Planner implementation requirement:** treat the 14 units and 4 reviews as a *source catalog*; do not invent school teaching dates, periods or term boundaries from page numbers. Scheduling must use school-specific session, holidays, weekly teaching days, periods and exam calendar. Teacher should be able to assign and edit periods for reading, oral communication, grammar, writing and review/assessment.
- Keep original Drive PDF as a reference URL; do not copy scanned copyrighted textbook pages into GitHub. Source catalog may include original unit headings and page references for navigation.
- Next integration: create a read-only Class 5 English catalog JSON with these source-verified headings and reviews; offer opt-in import into a school's draft planner without automatically publishing or overwriting school plans.

## Class 5 English date-wise teacher diary review draft — 6 Nov 2026
- User approved **2027-04-01 as the academic-session start date**, but has **not** approved the proposed daily lesson plan or its publication.
- A 208-teaching-day draft spans 2027-04-01 through 2028-01-17, excluding Saturdays and Sundays only. Other school holidays, summer vacation, local/religious closures, examinations and school timetable are **not yet confirmed**; dates must shift when those are supplied.
- The textbook contents (scanned PDF pages 5–6) identify named oral communication, reading and critical thinking, language focus, grammar and writing topics for all 14 units. These headings have been assigned to proposed daily lesson slots; this is **not** a page-by-page verification of each exercise and is **not** a school-approved calendar.
- A review CSV was generated in the conversation as `Class_5_English_Daily_Diary_2027_Topic_Wise_Review.csv`, with date, weekday, class, unit, source page, daily topic, source-confidence label, approval status and holiday-confirmation status. **The CSV is not yet imported into the application or GitHub.**
- Implementation gate: provide administrator preview of daily lessons, explicit approval, calendar-aware rescheduling and teacher-diary read-only future suggestions. No automatic publishing or changing real school records before approval.


## Approved planning architecture: immutable lesson division, flexible calendar — 6 November 2026

**This section supersedes the earlier 2027–28 dates, September 2026 completion target and any equal-topics-per-day allocation in the draft examples above.** Those drafts are historical review artifacts, not the active school calendar.

### School calendar and course milestones (2026–27)
- Academic session: **1 April 2026 – 31 March 2027**.
- Summer vacation: **22 May – 23 August 2026** (inclusive).
- Winter vacation: **24 – 31 December 2026** (inclusive).
- Saturday and Sunday: full closure. Friday: **half-day**, so do not assume a full weekday's teaching capacity.
- Apply the user-supplied Government of Pakistan Cabinet Division **2026** public-holiday circular as the initial holiday source. Respect observed days, holiday applicability and subsequent school/provincial notices; religious holidays and local closures may require confirmation. Do not reuse the 2026 circular for 2027.
- Target **complete the Class 5 English syllabus by 23 December 2026**. January–March 2027 is for revision, practice papers, assessments and examinations, subject to the school exam calendar.
- A target is not permission to truncate difficult lessons or invent periods. Report a completion-capacity shortfall explicitly.

### Source-backed, weight-aware division (before assigning dates)
1. Load the Class 5 English source catalog from `examination-system/catalogs/english-class-5.json` (14 units, four reviews, original order). Verify detailed exercise-level content against the scanned textbook before claiming page-exact homework.
2. Build a **canonical ordered lesson division** independently of dates. Assign stable `lessonId` values; include `unitId`, `topic`, `subtopics`, `sourcePageReference`, `learningObjectives`, `prerequisiteLessonIds`, `difficulty`, `weight`, `estimatedPeriods`, `assessment`, `teacherNotes` and `sourceConfidence`.
3. Judge difficulty, conceptual load, reading length, writing workload, students' grade level and required practice. An easy introduction may need one period; reading comprehension, complex grammar and guided writing may need two or more. These are estimates for review, not an automatic guarantee of learning.
4. Do not combine topics simply to fill a date or satisfy the December target. Split heavy topics into coherent sequential lessons where necessary; preserve prerequisite order and leave room for checks for understanding.
5. Workflow: `draft -> submitted -> approved -> published`. Freeze an approved division as a **versioned immutable snapshot**. Changes to topic, order, weight, difficulty, objectives or period estimates require a new draft revision and approval. Preserve old versions and progress history.

### Date-only rescheduling engine
- Maintain **separate entities**: `lessonDivisionVersion` (approved immutable content), `schoolCalendarVersion` (session, weekly hours, vacations, holidays, exam blocks, Friday half-day, subject periods), and `scheduleVersion` (lessonId to proposed date/period slots).
- Schedule ordered lessons by **available subject periods**, not raw weekdays. Obtain actual English periods for each weekday, including Friday, from the school timetable. Do not assume one English period every full day.
- Calendar updates generate a new **schedule version** from the same approved division: only dates and assigned period slots may change. `lessonId`, topics, sequence, difficulty, weight, estimated periods and objectives must remain unchanged. Use a diff preview showing old/new dates and displaced lessons.
- Preserve actual teaching dates and completion evidence for already-taught lessons. Reflow **unfinished** lessons only, respecting prerequisites, available periods, closures and fixed exams. Flag collisions, impossible deadlines and required extra periods; never silently skip, merge or shorten content.
- Any manual lesson content edit is a **division revision**, not a calendar adjustment. Keep separate permissions and audit trails for both operations.
- Teacher diary displays today's assigned lesson, next lesson, progress, delay reason and schedule-version provenance. School admin approves publication of schedule changes; teacher progress does not rewrite canonical lesson content.
- Ensure school, campus, class, section, subject, academic session and teacher permissions are enforced for every read/write. Do not let a reschedule overwrite other schools' plans.

### Required tests and rollout gate
1. Same approved division + changed holiday -> **identical ordered lesson IDs/content/period requirements**, changed dates only.
2. Added summer/winter closure or Friday half-day -> correct capacity and date reflow; no scheduling on closed days.
3. Completed lessons remain anchored to actual dates; unfinished lessons shift, with no duplicate/missing IDs.
4. Insufficient periods before 23 December -> explicit at-risk/infeasible status, never silent compression.
5. Topic edit after approval rejected unless a new division revision is approved.
6. Cross-tenant/section permissions, concurrent calendar edits, schedule version conflicts and audit logs tested.
7. Verify unit and exercise details, school timetable, 2026 holiday applicability, and full school admin/teacher workflow against a disposable test school before any Apps Script or live website deployment.

**Status on 6 Nov 2026:** Specification approved in conversation; code integration, period-level scheduling, calendar reflow, tests and production verification remain pending. No production data mutation or Vercel deployment is authorized by this documentation update alone.


## Undated Class 5 English draft division — 8 Nov 2026
- Added `examination-system/syllabus-division-draft.js` and `test-syllabus-division-draft.js`, registered in syllabus CI. The generator derives 70 strand-level blocks (five per each of 14 textbook units) plus four reviews, **74 draft blocks** in source order. These are **not** 74 verified exercise-level lessons.
- Every block has a stable ID, textbook unit title, printed start-page reference, provisional difficulty, weight and estimated English periods. The current total is **176 provisional periods** (14 × 12 plus four reviews × 2); the school timetable must establish actual available English periods, including Friday half-days.
- Dates are intentionally absent from division records. The calendar engine handles scheduling separately. Topic-level details, objectives, actual exercise references, difficulty, weights and periods still require textbook-page review and school administrator approval. No draft is auto-published.
- Calendar engine now avoids placing unfinished lessons before the most recent completed lesson date, in addition to reserving historical completed slots. This is a safety improvement, not a complete production reflow solution; same-day period ordering and actual school timetable integration still need verification.
- CI workflow has new tests but a successful GitHub Actions run has **not** been confirmed. No Apps Script deployment, school data changes or Vercel deployment were performed.


## English-period capacity reporting — 8 November 2026
- Added `examination-system/syllabus-capacity-report.js` and its Node regression test, included in syllabus CI. The report uses the undated division's estimated periods and the separate calendar engine's actual available subject-period slots. It returns feasibility, total required unfinished periods, available periods, unallocated period shortfall, affected lesson IDs and monthly allocations.
- Test scenario: Class 5 English provisional **176 periods**; school session 1 April–23 December 2026; summer vacation 22 May–23 August; Saturday/Sunday no periods; one English period Monday–Friday. Expected outcome: **not feasible** without more periods. A two-period Monday–Thursday and one-period Friday scenario is tested as a higher-capacity illustration, **not an assertion about the school's actual timetable**.
- Public holidays, school examination days, timetable period counts, Friday half-day subject allocation and detailed textbook topic-level verification remain to be confirmed. Capacity results are therefore **scenario estimates**, not a final approved teaching schedule.
- The system must show insufficient capacity and offer admin-reviewed timetable/deadline changes, never silently compress, merge, reorder or drop the canonical lessons.
- No live teacher-diary integration or production deployment. GitHub Actions results not yet verified.


## Calendar fixture and capacity gate — 8 Nov 2026
- Added `examination-system/syllabus-school-calendar-2026.js` with user-confirmed session (1 Apr 2026–31 Mar 2027), course deadline (23 Dec 2026), summer closure (22 May–23 Aug), winter closure (24–31 Dec), Saturday/Sunday closures, Friday half-day policy and January–March revision.
- **English periods are not known**: the fixture requires a caller-supplied per-weekday English timetable. A half-day Friday does not establish whether the class has an English period that day. Public holidays remain pending school-specific confirmation.
- Added `test-syllabus-school-calendar-2026.js` to syllabus CI. It verifies weekends, summer closure, date boundaries and that an illustrative one-English-period-per-weekday timetable cannot fit the provisional 176-period draft before the deadline. The illustrative timetable is **not** asserted as the school's actual timetable.
- Capacity warning must be visible to the school administrator before approval. Never automatically compress or delete lessons to meet 23 December.
- No actual textbook exercise-level difficulty assessment or production integration is claimed. CI execution is not yet confirmed; no live data or deployment was changed.


## Read-only syllabus completion-risk preview — 8 Nov 2026
- Added `examination-system/syllabus-capacity-preview.js` and `test-syllabus-capacity-preview.js`, and registered the test in syllabus CI.
- Preview accepts a division, school calendar, completed lessons and historical schedule, then reports total lessons, completed/unfinished lessons, required unfinished subject periods, available subject periods, shortage, last assigned date and explicit feasibility warnings.
- It is a **pure preview**, not a live admin panel, not a publication action, and not a change to teacher progress or the canonical division.
- In the provisional Class 5 English division there are 74 blocks requiring an estimated 176 English periods. This estimate must be refined from textbook exercises. A sample one-period-per-weekday timetable is used only for test assertions; actual school periods and holiday applicability are still unknown.
- Admin should review shortage before approving any date mapping; no silent compression of learning activities. Next: verify the actual timetable, review textbook-level topic difficulty, display the preview in the school admin UI, and test workflow end-to-end.
- GitHub Actions success and live Apps Script integration remain unverified; no deployment or live data mutation.


## Read-only teaching-capacity scenarios — 8 Nov 2026
- Added `examination-system/syllabus-capacity-scenarios.js` with `test-syllabus-capacity-scenarios.js` and registered it in syllabus CI.
- Compares three illustrative English timetables against the **same immutable 74-block/176-period draft**: (a) one period Mon–Thu and no Friday English, (b) one period Mon–Fri, (c) two periods Mon–Thu and one Friday.
- Returns available periods, required unfinished periods, shortfall/spare periods, feasibility and last scheduled date. An added school holiday decreases capacity without altering lesson IDs or topics.
- These are **scenarios, not the actual school's timetable**. Do not automatically assign two English periods per day; obtain verified timetable, holiday applicability and school approval before scheduling or publishing.
- Current division is still provisional strand-level scaffolding, not verified topic-by-topic textbook exercises. No school data mutation or live deployment. CI success remains unconfirmed.


## Read-only English period-capacity audit — 8 Nov 2026
- Added `examination-system/syllabus-capacity-audit.js` and `test-syllabus-capacity-audit.js` with a CI workflow step.
- Audit accepts an undated lesson division and school-supplied timetable/calendar; returns total required periods, available periods, shortfall/spare periods, teaching days, closure days, Friday teaching days and month-by-month capacity. It never modifies approved lesson topics or dates.
- Holiday changes reduce available teaching periods when they affect a scheduled English day; overlapping summer closures are not double-counted in capacity.
- The Class 5 English division remains a **provisional 176-period draft**, not an exercise-verified or administrator-approved division. The illustrative weekday timetable is not a school-confirmed timetable.
- Next release gates: execute and verify CI, obtain the actual school English timetable and provincial/school holiday confirmations, review detailed textbook exercises and lesson weights, connect capacity preview to admin approval and integrate published schedule with teacher diary. No production deployment or data mutation in this update.


## Read-only teaching-period capacity audit — 8 Nov 2026
- Added `examination-system/syllabus-capacity-audit.js` and `test-syllabus-capacity-audit.js`; the latter is now registered in syllabus CI.
- Audit accepts an **undated lesson division** and a **school-supplied subject timetable**. It calculates required English periods, available periods, shortfall, spare capacity, teaching days, Friday teaching days and month-by-month capacity after closures.
- The report is informational and **never edits the canonical lesson topics, order, weights or periods**. A shortfall must trigger an administrator review rather than automatically compressing difficult topics.
- A school timetable has **not** yet been supplied. The earlier one-period-per-weekday scenario is illustrative only; do not present its capacity as the real school's capacity.
- School-specific 2026 public-holiday confirmation, exact exercise-level lesson objectives, progress-aware rescheduling, admin preview and teacher diary integration are pending. CI run outcome remains unverified; no production deployment or school data change.


## Read-only administrator schedule preview — 8 Nov 2026
- Added `examination-system/syllabus-admin-preview.js` and `test-syllabus-admin-preview.js` and registered the tests in the syllabus CI workflow.
- Pure preview composes the undated division, capacity audit and scheduling engine; returns ordered lesson rows with stable ID, topic, difficulty, weight, estimated periods, proposed dates, status, actual completed date, and missing periods. It includes month-level available capacity, shortfall and verification warnings.
- **Not a production admin page:** this is a Node/CommonJS preview helper. The school admin UI, Apps Script integration, verified timetable and school-specific holiday confirmation remain pending. Preview always reports `approvalReady:false`; it does not publish, save or modify the division.
- Test source includes a hypothetical timetable and three calendar holidays as a fixture; these are not proof of the school's actual subject periods or holiday applicability.
- Remaining release gates: run CI, inspect real textbook exercise pages, confirm timetable, implement admin preview UI with server-side permissions and schedule versioning, then validate with a disposable school. No production data or deployment changed.


## Approval-readiness safety gate — 8 Nov 2026
- Added `examination-system/syllabus-approval-readiness.js` with tests in syllabus CI.
- The read-only gate requires submitted status, school/class/subject/session scope, school-admin actor matching school, verified textbook exercises and objectives, teacher review of difficulty and periods, confirmed subject timetable and holidays, complete preview and no capacity shortfall.
- It intentionally **rejects** the current Class 5 English provisional draft, which lacks verified exercise-level objectives and has not been submitted. This is the desired behavior; do not bypass it by changing flags.
- This module is not server authorization. The eventual Apps Script/backend endpoint must derive actor and school identity from authenticated server context, not trust browser-supplied role/school IDs. Approval and publication must be separate audited transitions, with versioned immutable division snapshots.
- Production admin UI and teacher diary integration remain pending; successful CI execution is not yet confirmed. No live deployment or school data changes.


## Draft lesson editing with revision protection — 8 Nov 2026
- Added `examination-system/syllabus-draft-editor.js` and its tests in CI. This pure helper allows edits only when the division is `draft`, and requires the caller's expected revision to match the current division revision.
- Allowed draft fields: topic, subtopics, learning objectives, difficulty, weight, estimated periods, assessment and printed source-page reference. Lesson ID, unit identity, order, source metadata and approval state cannot be edited through this helper.
- Editing returns a new division object and increments the revision without mutating the input. Approved, submitted and published divisions are rejected.
- This is **not** an authenticated API or production editor. Before integrating, the backend must authorize school/class/section roles, store the revision atomically, record actor and audit history, and validate textbook source evidence. The school admin UI remains pending.
- CI has been configured, but execution has not been confirmed. No live deployment or school data changes.

## Content-addressed syllabus snapshot — 8 Nov 2026
- Added `examination-system/syllabus-division-snapshot.js` and CI regression tests. Submitted divisions at a matching revision can be copied into school/class/subject/session-scoped snapshots with a SHA-256 integrity hash.
- Snapshot preparation rejects embedded schedule/progress dates, invalid lesson IDs and scope mismatches. Calendar dates remain separate from immutable lesson content.
- This is a pure helper, **not** server authorization, atomic persistence, a digital signature, approval or publication. Backend authenticated role checks, append-only audit history, version locking and teacher diary integration are still required.
- Class 5 English remains an unapproved draft pending textbook exercise review and a real timetable. CI success and live integration are unverified. No production deployment or school data changed.

## Approval audit chain — 9 Nov 2026
- Added `examination-system/syllabus-approval-ledger.js` and `test-syllabus-approval-ledger.js` in CI. Pure append-only event builder records submitted/approved/rejected/published transitions with scope, snapshot hash, actor ID, UTC time, sequence and previous-event hash. It rejects sequence conflicts, broken hash chains, scope/snapshot changes and invalid transitions.
- Hash chains detect edits only if the chain's trusted head is independently anchored. They do not prevent deletion or wholesale replacement of the ledger. Production requires authenticated server-derived actor identity, atomic compare-and-swap writes, immutable/off-site audit anchors, role permissions and server-generated timestamps. Browser-provided identities and timestamps are not trustworthy.
- No live storage, approval API, dashboard integration or teacher diary sync has been performed. CI outcome remains unverified.

## Teacher diary read-only projection — 9 Nov 2026
- Added `examination-system/syllabus-teacher-diary-projection.js` and its tests to syllabus CI. Given a division snapshot and schedule, it produces ordered date/period diary rows with stable lesson IDs, topic, learning objectives, difficulty, source page and actual completion date.
- It validates school/class/subject/session scope and rejects overlapping periods or unknown lesson IDs. The source inputs are not modified.
- This is **not live diary sync**. A production endpoint must verify the snapshot hash, approved/published ledger state, school and section permissions, teacher assignment, and schedule version before showing or writing diary entries. The helper currently does not enforce those backend requirements.
- The Class 5 English division remains provisional pending textbook exercise verification and actual subject timetable. No deployment or school data changes; CI execution is unverified.

## Published teacher diary access gate — 9 Nov 2026
- Added `examination-system/syllabus-published-diary-gate.js` with regression tests in CI. The read-only gate verifies snapshot integrity and ID, approval ledger chain ending in publication, matching school/class/subject/session, a versioned schedule referencing the same snapshot, and a supplied teacher class assignment or school admin/owner role before calling the diary projection.
- This helper is **not a production security boundary**: actor, roles and assigned classes must come from server-verified sessions and the current school registry, never browser input. The ledger head and approved snapshot must be fetched from trusted storage; the ledger chain alone cannot establish authenticity.
- Pending: authenticated Apps Script/backend endpoint, school/section permissions, audit persistence, real teacher diary UI, verified Class 5 English exercises and subject timetable. CI execution is unverified; no deployment or school data change.
