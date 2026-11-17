# LAMA Quran & Islamic Learning Academy — Version 12 supervised recovery handoff
Verified development update: 2026-11-17

**DEVELOPMENT BRANCH ONLY. NOT DEPLOYED. DO NOT MERGE OR ENABLE FOR REAL STUDENTS.**

## Current implementation
- Canonical Apps Script addon: `quran-academy/backend/school-suite-student-recovery-v12.gs`.
- Existing v11 student authentication: `quran-academy/backend/school-suite-student-auth-v11.gs`.
- Existing school backend/router: `lamastudio-school-suite/backend-api/code.gs`.
- Existing API client: `lamastudio-school-suite/js/api-client.js`.
- Opt-in test admin UI: `lamastudio-school-suite/portals/admin/quran-student-recovery-pilot.html`.

The academy retains its current name and all earlier learning features. These are **shared School Suite school/student IDs and the same Students sheet**; no new student registry, new school login system, or public self-reset.

## Two-phase authenticated server flow
1. Test-school admin signs in through the existing School Suite admin login and verifies the fictional student's identity **offline**.
2. `POST quranV12RecoveryPreview`: verifies exact test-only school gates, school status, admin token, relationship evidence, and unique existing student ID. Reads the learner's current credential version and generates a **five-minute one-time server-stored recovery approval**. Does not mutate student credentials.
3. `POST quranV12RecoveryCommit`: requires the same admin + school, exact learner, valid unused approval, strong passphrase, and `confirmText="RECOVER <studentId>"`. Consumes the approval and calls the existing v11 locked provisioning function with the **expected credential version checked inside its row mutation lock**.
4. On successful reset the v11 addon clears the fictional learner's legacy password and persistent key, stores a salted password verifier, increments credential version (invalidates prior student sessions), and logs a redacted audit event.
5. Expired, replayed, cross-school, cross-student, different-admin, or stale-version approvals fail. Direct `quranV11ProvisionStudentAuth` is denied by the router for the exact school configured under the v12 recovery pilot.

## All required pilot gates
Google Apps Script **Script Properties**, server only:
- `QURAN_V11_STUDENT_AUTH_ENABLED=true`
- `QURAN_V11_STUDENT_AUTH_SCHOOLS=<fictional test-school ID>`
- `QURAN_V11_STUDENT_AUTH_PEPPER=<new random server-only secret of 40+ characters>`
- `QURAN_V11_PBKDF2_ROUNDS` selected after benchmarking, not automatically assumed production-safe
- `QURAN_V12_RECOVERY_ENABLED=true`
- `QURAN_V12_RECOVERY_ENVIRONMENT=ISOLATED_TEST`
- `QURAN_V12_RECOVERY_SCHOOLS=<fictional test-school ID>`
- `QURAN_V12_EXPECTED_TEST_SCHOOL_ID=<the same exact test-school ID>`

Missing or mismatched settings cause denial.

## Test UI gates
The admin recovery HTML page has `Q12_ISOLATED_TEST_BUILD=false` by default and requires an exact fictional `Q12_EXPECTED_TEST_SCHOOL_ID` and **`Q12_EXPECTED_TEST_API_URL`** matching the separate test API client `API_URL`. It refuses to enable on `lamastudio.pk` / `www.lamastudio.pk` or when the API URL is the production School Suite URL as known at this revision. The app's downloadable browser demo does **not** send real reset requests: it simulates fictional role-permission behavior locally.

Do not enable the test page while its API client points to production. Do not enter real student IDs, passwords, or guardian emails into any testing environment.

## Verified tests as of 2026-11-17
- **33/33** source-level v11/v12 recovery authorization/workflow checks passed using the current GitHub code in a synthetic Apps Script runtime, with fake SpreadsheetApp, CacheService, LockService and **fake password hashing**. This validates control flow and scoped/one-time challenges, **not** real encryption, storage consistency, App Script performance or real permissions.
- School Suite router contains both new v12 actions, blocks them on GET, and blocks direct v11 provisioning for the configured v12 test school.
- Test client uses POST for both operations; former one-step client helper rejects use.
- Admin page JavaScript parsed; initial settings fail closed; explicit test URL and non-production origin are required.
- Standalone Version 12 educational demo, tested at phone width 390px and desktop width 1280px: 12/12 fictional UI self-tests at each viewport, one-time preview/reset/replay/expired/teacher-denial workflow, Urdu toggle, Qaida and Quran tabs, no page JavaScript errors or horizontal overflow.
- Bundled separate Node check for transcribed v11 password-derivation logic: 8 assertions passed. It does not replace tests against the canonical Apps Script runtime.

## Mandatory before any real-user pilot
- Isolated Apps Script deployment with **two disposable fake school spreadsheets**, full integration and email tests, independent review of password hashing/round-count performance, token storage and concurrency.
- Safe password migration/rollback and student/guardian recovery policy; turning off the v11 flag will NOT restore removed legacy credentials.
- Security review of persistent API keys, browser localStorage, logging, audit retention, rate-limiting and multi-tenant isolation.
- Guardian consent/child privacy controls, deletion/retention rules and supervised school acceptance.
- Scholar review of Arabic, Tajweed, Duas, Wudu, Salah and Hifz content; audio copyright/license checks.
- Android/PWA device tests, accessibility and offline/online retry behavior.

**No GitHub main, Vercel production, live Apps Script or actual school student record was changed or deployed.**
