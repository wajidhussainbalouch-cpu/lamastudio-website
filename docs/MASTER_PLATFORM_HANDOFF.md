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
