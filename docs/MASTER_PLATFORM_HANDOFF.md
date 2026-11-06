# LAMA Studio — Master Platform Handoff
Updated: 2026-11-04. Owner: master architecture/integration conversation.
Repository: wajidhussainbalouch-cpu/lamastudio-website; production branch main. No Vercel deployment without explicit approval.

## Baseline and audit
Latest user-provided ZIP: lamastudio-website-main (4).zip; 349 ZIP entries, 300 files. Existing paths must remain stable. GitHub main is a concurrently edited source of truth: never overwrite it wholesale from ZIP. Complete all-file GitHub comparison is pending; selected paths were checked.
Existing: lamastudio-school-suite/ (portals, exams, super-admin-app, js/api-client.js); examination-system/ (exam-blueprint.js, index.html, print-preview.html, syllabus-scheduler.js, syllabus-progress.js, data, handoffs). Separate integration handoff: examination-system/SYSTEM_INTEGRATION_HANDOFF.md.
Tests executed against uploaded ZIP on Node v22: test-syllabus-scheduler.js PASS; test-syllabus-progress.js PASS. These do NOT validate live backend or exam security.

## Dependency map
Platform identity/tenant registry -> backend authorization/entitlements -> School Management and Examination independently.
School Management manual syllabus + teacher diary -> optional automated Planner (Examination license).
Approved Question Bank -> Exam paper snapshot -> scheduled assignment -> student attempt -> server scoring/review -> finalized result -> parent portal.
Smart Marker (independent license) -> signed scan job -> verification -> idempotent result-sync -> exam result ledger.
Examination-only customers need a minimal shared roster, tenant and class registry, not the full School Management license. Marker-only customers need an authorized external exam/roster import or minimal marking workspace; never silently require School Management.

## Current blockers
Apps Script source/database schema and deployed version need verification before implementing server writes. Frontend Super Admin actions alone cannot enforce licensing. No evidence yet of complete secure server-side online attempts, answer-key isolation, or atomic marker sync. Do not claim production readiness.

## Milestone sequence
M0 audit and nonbreaking documentation (in progress); M1 shared IDs + backend entitlement checks; M2 exam paper/assignment/version APIs; M3 attempt scoring/review/result ledger; M4 printer/PDF/answer key authorization; M5 planner and marker adapters; M6 E2E tenancy, security, migration, release tests.
For each milestone update this handoff with changed paths, tests, commit SHA and remaining risks.

## Coordination
Question content: examination-system/QUESTION_BANK_HANDOFF.md. Planner: examination-system/SMART_SYLLABUS_PLANNER.md. Marker: examination-system/EXAM_SMART_MARKER_INTEGRATION.md. Integration: examination-system/SYSTEM_INTEGRATION_HANDOFF.md. Do not duplicate question content or unreviewed datasets.

## 2026-11-04 incremental implementation
Added platform-core/permissions/policy.js and test-policy.js on main. This is a pure reference policy; no live Apps Script API or existing UI is wired to it. Tests were authored but have NOT yet been executed against GitHub content. Its student-safe projection is defense-in-depth only; the server must not transmit the underlying key. The ZIP predates concurrent main commits; full ZIP/main comparison is still pending. No production data or Vercel deployment changed. Next: validate tests, inspect Apps Script implementation, connect backend checks and create immutable exam result ledger.

## 2026-11-04 subscription milestone
Inspected uploaded ZIP Apps Script backend (lamastudio-school-suite/backend-api/code.gs, 2148 lines): existing adminSetSubscription, getSubscriptionStatus and assertSchoolWritable implement legacy school-wide Trial/Paid/Free/Unclassified controls. This is not independently licensed per module. Added platform-core/subscriptions/entitlements.js and test-entitlements.js to main; locally exercised eight grant evaluation cases on Node 22 (pass). Pure module is NOT wired to Apps Script, and GitHub Actions validation is not yet confirmed. Keep existing subscriptions unchanged until authenticated backend grant storage, audit, legacy compatibility and migration tests are in place. No production data or Vercel changes.

## Subscription migration audit — 2026-11-04
Existing Apps Script backend contains `subscriptionView`, `assertSchoolWritable`, `adminSetSubscription`, and `getSubscriptionStatus`. Legacy statuses are Trial/Paid/Free/Unclassified; these are school-wide, not independent module grants. Added `platform-core/subscriptions/entitlements.js` and `test-entitlements.js` on main; local Node test passed. A non-writing migration dry-run prototype passed local tests but has NOT been committed or run against production data. Never infer optional examination or marker licenses from a legacy school-wide plan. Next: identify and verify the deployed Apps Script version, create a backup, review tenant-specific migration and introduce server-side enforcement before connecting UI. No Vercel deployment.

## 2026-11-04 subscription migration milestone
Added platform-core/subscriptions/entitlements.js and test-entitlements.js; local entitlement tests passed. Added migration.js and test-migration.js; local migration tests passed (Node). Migration is pure dry-run, proposes only legacy schoolManagement grants for explicit review, never enables examination/smartMarker automatically, and does not write to Apps Script/Sheets. Existing Apps Script subscription API remains school-wide; new policy is NOT yet connected to deployed backend. Next: confirm backend sheet schema, add authenticated server-side grant APIs and audit events, then test tenant boundaries and integrations. No Vercel deployment.

## 2026-11-04 backend route milestone
Added guarded `adminGetModuleGrant` and `adminSetModuleGrant` routes to `lamastudio-school-suite/backend-api/code.gs`, plus authenticated `lamaAdminGetModuleGrant_` to `module-entitlements.gs`. The UI already calls these actions. All writes remain disabled until the matching adapter is included in the actual deployed Apps Script project; no deployment performed. GitHub code changes alone do not change the live Apps Script version. Pending: confirm script bundling/deployment, test read/write against a disposable test school, validate header compatibility, concurrency and auditing, then connect tenant-side enforcement. The present adapter is NOT production security complete. Vercel preview previously failed due to deployment quota.

## 2026-11-04 — Module grant hardening and operational next steps
**Changed:** `lamastudio-school-suite/backend-api/module-entitlements.gs` now denies module access when persisted grant start or expiry dates are missing or malformed. Previously, old or manually edited active rows with empty dates could have been treated as perpetual grants. Existing grant records were not modified.

**Important:** The new grant adapter and Super Admin UI remain source-only until the matching Apps Script project is updated and its deployment version changed. This is a fail-closed check for future integration, NOT proof that live exam/marker endpoints enforce it. GitHub source inspection performed; automated tests for this exact change and end-to-end backend tests still pending. No Vercel deployment.

**Safe implementation order:**
1. Identify the live Apps Script project/deployment and inspect installed files, script properties, and registry header names without revealing secrets. Confirm `module-entitlements.gs` is installed alongside `code.gs`.
2. Write mocked Apps Script tests for schema creation, missing/expired grants, revision conflicts, date validation, admin authorization, and concurrent writes. Do not run test writes against production registry.
3. Add explicit module checks to each examination and marker server action after verifying the authenticated tenant context. Never accept a browser-supplied schoolId as sole proof of tenant ownership.
4. Add audit fields and immutable grant history, then test the Super Admin UI on a disposable test school.
5. Implement exam snapshots, attempt lifecycle, answer-key isolation, marker verification, and idempotent result sync before a production release.
6. Reconcile the ZIP against GitHub main and update this document with tested commits and remaining risks.

**Known integration gap:** Module grant storage currently lacks an independently verified audit trail, tenant-side server authorization, and production deployment. Keep all release checklist security gates unchecked.

## 2026-11-05 — Grant validation and mock test harness
- Hardened `lamastudio-school-suite/backend-api/module-entitlements.gs` to deny invalid stored revision numbers and reject impossible normalized UTC dates on new grants. Commit `2ca2d57d`.
- Added `lamastudio-school-suite/backend-api/test-module-entitlements.js` with isolated Node/VM mocks for authorization, module isolation, expiry, suspension, revision and invalid dates. Commit `8c8327cf`.
- **Validation status:** tests committed but execution in this milestone is not confirmed; do not mark test pass until run in CI or Node. No Apps Script production deployment or live grant write.
- Next: run the mock test, inspect and fix failures, then connect server-side entitlement enforcement to examination and marker endpoints with verified principal identity. Keep read-only historical data after expiry.

## 2026-11-05 — Executed mock tests and verified-school guard
Executed the existing `lamastudio-school-suite/backend-api/test-module-entitlements.js` locally on Node v22.16.0 against a matching copy of the committed module adapter: PASS. This test uses mock Apps Script services and **does not access live Sheets**. Added `lamaRequireModuleForVerifiedSchool_(verifiedSchoolId,module)` to the backend adapter; it denies missing verified context and disallowed grants, intended for Examination and Smart Marker server handlers. Added guard-denial assertions to the repository test file, but **those new assertions have not been executed in this milestone**.

**Integration status:** guard function is committed but is NOT yet invoked from existing examination/marker handlers. It must be called only after deriving school identity from an authenticated server session; passing a client-supplied schoolId is insecure. Live Apps Script not deployed; no Vercel deployment; no production data modified.

## 2026-11-05 — Published syllabus API entitlement compatibility
Inspected `lamastudio-school-suite/backend-api/code.gs`: the existing `syllabusPublishedPlans` action authenticates a teacher, checks assigned class/subject and requires `lamaSchoolHasModuleGrant_`. The grant adapter previously did not define that function, so the handler was blocked even when an entitlement existed. Added `lamaSchoolHasModuleGrant_` as a fail-closed compatibility wrapper around `lamaRequireModuleForVerifiedSchool_` (commit `c06c8e72`). The wrapper MUST be called only after server-side authentication; it does not authenticate callers itself. Added allow/deny mock assertions (commit `02c2a5ea`). These new tests are not yet confirmed executed, and this code is not deployed to live Apps Script.

**Scope:** This resolves a missing-function dependency in one existing syllabus read route. It does NOT connect the full examination lifecycle or Smart Marker, and it does NOT prove live subscription enforcement. Next: inspect the remaining exam/marker route entry points and implement verified-session guards with integration tests before enabling them.

## 2026-11-05 — Personal ID card preview consistency
Student portal `portals/student/index.html` now opens `identity-cards.html?role=student` instead of cloning a generic profile panel. Teacher portal no longer exposes a misleading "Design & Print" action. The canonical `identity-cards.html` applies a personal-card-only view for authenticated student/teacher sessions, hiding admin selection/filter/design controls; school admin retains existing batch layout and printing controls. Commits `b422205e`, `cadd1102`, `0548bc10`.

**Security note:** UI hiding is not authorization. Existing `identity-cards.html` uses `LamaAPI.get('students', session.studentId)` or the teacher's session identity, but the Apps Script API must independently enforce tenant and self-record access. Audit backend authorization before production release. QR payload format and student/teacher scan compatibility still require end-to-end device testing. No deployment or production data changes.

## 2026-11-05 — Dashboard student QR scanner startup
Root cause: the dashboard already linked to `attendance/student-attendance.html#qrAttendancePanel`, but the page attempted `qrStart()` on window load before its asynchronous student and attendance register requests finished. `qrStart` rejected because `registerLoaded` was false. Changed the student attendance page to retain a one-shot direct-link intent and launch the scanner after register loading settles, only if editing is enabled and there is no pending verification. Commit `a9180a25`. Failure displays a reason and preserves the manual scanner button. No automatic attendance submission: QR marks remain pending until Save and server verification.

**Pending live test:** Mobile Chrome HTTPS camera permission; successful scan of valid student ID; wrong-school QR rejection; Save and reload verification; completed-register behavior. Browser policy may require a second user tap to grant camera access. Not deployed to Vercel.

## 2026-11-05 — Student QR scanner Android compatibility
User reports dashboard QR shortcut and manual Start QR Scanner both fail on phone. Existing scanner required native `BarcodeDetector`, unavailable on some Android browsers. Added `jsQR@1.4.0` browser fallback via CDN to `attendance/student-attendance.html` while retaining the native decoder where supported. Commit `6a83433a`. This requires HTTPS, camera permission, successful external decoder load (for browsers without BarcodeDetector), and an editable loaded attendance register. QR scan still queues Present locally and requires explicit Save plus server verification; no automatic write.
**Deployment/test gate:** GitHub commit alone does not change production site. No live deployment performed; Android camera, QR payload and server save remain unverified. Verify student scanner on real device after preview/production deployment, check browser console and network if failure, then audit teacher scanner compatibility. The admin may need to approve a deployment when quota is available.

## 2026-11-05 — Student attendance slow loading and QR dashboard escalation
Teacher register reportedly loads, while student register fails or stalls on the live site. Inspected `attendance/student-attendance.html`: startup waits for `LamaAPI.list('students')` and `LamaAPI.list('attendance')` concurrently, then renders the register plus parent follow-up and arrival panels. Added a 20-second request timeout with a visible error and deferred supplementary rendering so the core student register paints first (commit `0c06db1a`). This does not reduce the server's response time or guarantee student records load; backend API latency, data shape, or authentication still need measurement.

Prior commits `a9180a25` (QR autostart after register load) and `6a83433a` (jsQR fallback) are also source-only until deployment. Test both direct dashboard QR and manual Start scanner, Chrome camera permission, class status, valid and wrong-school card scan, and saved register confirmation. If the user still sees the old page after refreshing, verify the deployed commit rather than repeating refreshes. No Vercel deployment or production data changes.

## 2026-11-05 — Student attendance loading progress UI
Added a separate loading-stage progress bar to `attendance/student-attendance.html` above the existing attendance-completion bar. Displays 0/10/45/85/90/96/100 percent according to known client-side phases, plus elapsed seconds and the current waiting stage. The stage percentages are **not bytes transferred or guaranteed time estimates**. Remaining time stays unknown during external Apps Script calls, rather than inventing an ETA. Success shows 100%; failures show an explicit error and retry guidance. Commits `9fcac1ee` and `ab8c2452`. Requires deployment and phone validation. The underlying slow API response is still under investigation.

## 2026-11-05 — Teacher QR automatic save and loading feedback
User-provided Android screenshot confirms teacher camera recognizes a card but previously only selected Present pending manual Save. Teacher QR handler now submits a single Present record immediately for a valid school-issued teacher card and reloads `teacherAttendance` to verify exactly one matching saved Present record before displaying a green success tick. It refuses to overwrite existing attendance, holidays, unresolved manual changes, or unknown teachers. Uncertain server outcomes show pending rather than claiming success; retry only after checking the register. Commit `3d1b787c`.

Teacher attendance load now displays staged percentages and elapsed time; remaining time is explicitly unknown while Apps Script is responding. The percentages indicate UI stages, not measured network transfer. Commit `d3a0fe6b`.

**Critical QA / production gates:** Changes are committed but not deployed or device-tested. Existing `LamaAPI.add('teacherAttendance')` must enforce verified school context and atomic uniqueness of school+teacher+date on the server; client duplicate checks alone cannot prevent concurrent scans. Verify a single scan, two simultaneous scans, retry after network timeout, saved status reload, and green tick only after verification. Review the student QR handler separately for the same auto-save requirement, preserving attendance integrity.

## 2026-11-06 — Priority: student attendance and assigned teacher roster
Inspected both teacher portal variants `portals/teacher/teacher.html` and `teacher-dashboard.html`. They awaited five API lists before rendering the assigned-class roster, and `schoolMatch` rejected valid school-scoped Students rows without a redundant `schoolId` column (the Students sheet schema does not include that column). Updated both pages to load and render the student roster first, then independently load attendance, homework, notices and results. Accept a missing per-row schoolId **only after** the backend's authenticated tenant-scoped `LamaAPI.list` response; explicit mismatched schoolIds are still rejected. Added className/grade aliases and assignedSection handling. Commits `18aca20c`, `6f765f15`, `6f155038`, `b0224101`.

**Critical:** This is a source fix, not live deployment. Teacher session's schoolId and assignedClass must be present, and Apps Script must enforce tenant and class filtering. The admin attendance page still requires backend timing diagnostics; no claim of fixed student register loading or live camera behavior. Test a teacher's actual assigned class roster and verify no other school's records display. Keep student data intact.

## 2026-11-06 — Active teacher portal zero-student screenshot
Two tablet photos show Government Primary School Shah Sadar Din teacher portal with assigned Class 5, zero students, and an empty My Class directory. The actual page is `lamastudio-school-suite/portals/teacher/index.html`, not the two previously modified alternate teacher pages. Root causes in active page: strict string comparison between `Class 5` and `5`; startup waited for five unrelated API calls before rendering students. Updated active page to normalize grade/class prefixes for comparison, render the authenticated teacher's assigned-class roster immediately when the student API resolves, load other modules independently, avoid overlapping refresh requests, and prevent duplicate `Class Class 5` display. Commit `986420db`.

**Status:** Source committed only. Live teacher portal may still be old until deployment. If still zero after deployment, inspect actual teacher session assignedClass/assignedSection and server-scoped students response; do not disable teacher class authorization or display unassigned students. Admin attendance slow-loading remains a separate unresolved backend/API issue.

## 2026-11-06 — Student attendance stuck loading: school-admin token resolution
Tablet screenshot confirms student attendance register stays in Loading state, while teacher attendance works. Inspected `backend-api/code.gs` `handleRequest`: token-based school-admin credential resolution previously covered teacher-management collections but excluded `list('students')` and `list('attendance')`. Those actions then reached `resolveContext` requiring a school API key, which a token-only admin session might not have. Added these two read actions to the existing verified school-admin token resolution path, without permitting unauthenticated reads. Commit `540fe5a6`. Frontend `js/api-client.js` already sends the school-admin token when matching the requested schoolId. This is a probable cause for token-only sessions, not yet confirmed from production logs.

**Deployment:** Apps Script source commit does not update deployed Apps Script automatically. The actual Apps Script project must be synced and a new deployment version published before this can affect the live attendance page. Do not share admin tokens or API keys in screenshots. Confirm backend response for both collections, then test class list, student count, and QR scan. Do not assume Vercel deployment alone updates Apps Script.

## 2026-11-06 — Chrome student attendance still loading: matching frontend auth fix
New Chrome screenshot confirms student attendance page loads its UI but register remains at 0% on initial view. Root cause found in `js/api-client.js`: `schoolScoped` only recognized teacher collections and school-management actions, excluding `list('students')` and `list('attendance')`. Even after backend commit `540fe5a6` allowed verified admin-token resolution for these reads, frontend might choose the wrong active role and omit the school-admin token override. Updated `schoolScoped` for these two read collections when active school session or school-admin auth is present; existing verified token override and backend checks remain. Commit `c8dc27d5`.

**Release gate:** Frontend commit needs Vercel deployment; backend `code.gs` commit needs independent Apps Script sync/version deployment. No live end-to-end verification yet. Verify Chrome request/response for both list calls, inspect the 20-second timeout error, validate student count and teacher class directory, then QR save and school isolation. Do not expose credentials in logs/screenshots. A 0% screenshot at elapsed 0s is not itself proof of a hang; timed test is needed.
