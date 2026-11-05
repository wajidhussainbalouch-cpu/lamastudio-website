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
