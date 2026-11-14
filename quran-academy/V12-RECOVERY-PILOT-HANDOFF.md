# LAMA Quran & Islamic Learning Academy — v12 supervised account recovery
Date: 2026-11-14. **DEVELOPMENT ONLY. DO NOT DEPLOY OR MERGE TO MAIN.**

## Scope
The product name remains LAMA Quran & Islamic Learning Academy. Continue using the **existing School Suite school and student IDs**, student login UI, and the v11 gated student-auth addon. No new student registry, independent login system, guardian self-service reset or public signup.

## Changes on this branch
1. `lamastudio-school-suite/js/api-client.js`: new `quranV12RecoverStudent(targetStudentId,newPassword,verificationMethod,verified)` method; it requires a currently held school-admin test token and explicit verification acknowledgment and calls the pre-existing `quranV11ProvisionStudentAuth` action by POST (never URL query string). The server independently verifies the school, admin, pilot gate, learner identity, and password rules.
2. `lamastudio-school-suite/portals/admin/quran-student-recovery-pilot.html`: a **disabled-by-default** administrator recovery screen. It requires a developer to configure an exact fictional school ID and explicitly enable the page **only after cloning the API client with a separate Apps Script TEST deployment URL**. No real school/student information should be entered.
3. No production router, Apps Script deployment, GitHub `main`, Vercel, real student credentials or school records were modified.
4. Separate downloadable v12 PWA demo: fictional recovery lab inside **Pilot QA** with 2 simulated schools, 3 fictional learners, 4 role choices, reset/expiry/deny checks, local event CSV export, and English/Urdu labels. The teaching modules from v11 are preserved. The PWA frontend has **no live recovery API calls**.

## Test results
- **7/7** simulated client/route checks passed using the **current GitHub v12 API client**, mocked fetch and storage: missing attestation, missing admin token, invalid verification type, correct scoped POST, request body, and existing backend route.
- **Chromium 390px and 1280px**: teacher denied, cross-school admin denied, correct-school admin with offline confirmation allowed, previous fictional session revoked, new fictional session accepted, simulated expiry, reset, Urdu labels; no page JavaScript errors or horizontal overflow.
- All **18 frontend JavaScript** files syntax-checked successfully. The earlier v11 cryptographic-transcription test passed **8/8** against Node crypto. None of this proves real Apps Script cryptographic performance, live identity correctness, or penetration-test security.
- The v12 downloadable ZIP contains 64 files; its archive integrity test passed.

## Test-only recovery flow
1. Clone School Suite and v8/v9/v11 add-ons into the SAME Apps Script TEST project and a **disposable** master registry with **two** fake school sheets. The shared API client used by the test admin page must point to the **TEST** script URL, not the current production URL.
2. Set the v11 student-auth feature flag and allowlist **only** to the exact fictional school ID, plus an unpredictable server-only pepper and benchmarked PBKDF2 cost.
3. Enable `Q12_ISOLATED_TEST_BUILD` and `Q12_EXPECTED_TEST_SCHOOL_ID` in a copied **test** admin page. **Never enable while using the production API URL.**
4. Sign in with the correct test school-admin token, confirm the fictional learner by ID in the school's existing Students table, verify offline identity, select a long new passphrase, and type the exact confirmation.
5. Server must audit the reset, invalidate prior sessions, clear the test learner's old persistent key/legacy password, and increment credential version. Check all opposite-role, cross-school, missing/duplicate student-ID, wrong-password and expiry denials.

## Blockers for real users
- PBKDF2 implementation/Google Apps Script execution cost, concurrent login rate-limit resilience, password-reset replay/idempotency, student/guardian consent, privacy policy and retention, secure browser token handling, reviewed rollback from irreversible legacy credential clearing, and two-school end-to-end integration tests.
- Independent review of Islamic content, licensed human recitation, Urdu Arabic script accuracy, Android installation and accessibility.

**Do not deploy to production. The static frontend recovery simulator is not an authentication test.**