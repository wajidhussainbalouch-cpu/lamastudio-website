# LAMA Quran & Islamic Learning Academy — Version 12 supervised recovery handoff

**Development branch only · 2026-11-17 · NOT DEPLOYED · DO NOT MERGE TO MAIN**

## What Version 12 now implements
- `quran-academy/backend/school-suite-student-recovery-v12.gs`: a two-phase school-admin recovery add-on that uses the **existing** School Suite student record and v11 shared student-auth implementation. No new student registry or login service.
- `quranV12RecoveryPreview`: verifies the existing school admin, the exact fictional test school allowlist, offline learner identity attestation and existing student ID; provides a **five-minute** server-held, single-use challenge. The response includes student ID, class, initial/reset indicator and token, **not passwords or API keys**.
- `quranV12RecoveryCommit`: requires the same school administrator, verified identity, exact `RECOVER studentId` confirmation, strong new password, matching learner and an unconsumed challenge. It atomically consumes the challenge, then calls `q11Provision_` with an expected credential version. The v11 module checks that version **inside its locked spreadsheet update**, so a reset after a stale preview is denied.
- `lamastudio-school-suite/backend-api/code.gs`: both new actions are POST-only. When v12 recovery is enabled for its exact school, the older direct v11 provisioning action cannot bypass this two-step flow.
- `lamastudio-school-suite/js/api-client.js`: adds `quranV12PreviewStudentRecovery` and `quranV12CommitStudentRecovery` and retires the old direct reset method. Both use POST JSON, with no password/token in the URL.
- `lamastudio-school-suite/portals/admin/quran-student-recovery-pilot.html`: updated test-only two-step preview and commit UI. **Disabled by default.** It must be copied with a client pointing to a completely separate disposable Apps Script test deployment.
- Standalone Version 12 PWA prototype (downloaded separately): fictional recovery lab in Pilot QA with two fake schools, student/admin/teacher/guardian views, explicit simulated expiry/replay/version checks, 12 local scenarios and CSV export; all previous educational sections retained. This app demo does **not** call the backend.

## Required server-side properties — all test-only
The existing v11 pilot properties remain required, including `QURAN_V11_STUDENT_AUTH_ENABLED=true`, exact `QURAN_V11_STUDENT_AUTH_SCHOOLS`, and a random server-only `QURAN_V11_STUDENT_AUTH_PEPPER` at least 40 characters long. Additionally the new independent v12 gate requires:

- `QURAN_V12_RECOVERY_ENABLED=true`
- `QURAN_V12_RECOVERY_ENVIRONMENT=ISOLATED_TEST`
- `QURAN_V12_RECOVERY_SCHOOLS` with only the exact fictional test school ID
- `QURAN_V12_EXPECTED_TEST_SCHOOL_ID` equal to that exact school ID

**These flags do not establish actual isolation**: the Apps Script project, deployment URL, Master Registry and each school spreadsheet must separately be verified as disposable test resources. A feature flag must never be interpreted as a privacy/security control by itself.

## Test evidence from this development run
- **21 / 21** backend recovery workflow checks passed when executing the actual current GitHub v11 and v12 source with synthetic in-memory Sheets, CacheService, LockService and a fake fast password derivation. Tests included flags, admin/identity checks, scoped preview, no credential exposure, original row unchanged on preview, wrong confirmation/learner denial, valid reset, replay rejection, credential-version race check, unchanged sibling, audit redaction and released locks.
- **10 / 10** API-client and router tests passed against current source with mocked fetch/storage. Both preview and commit were POST JSON, admin school-scoped, GET-blocked; direct v11 route bypass denied for the configured v12 school.
- **12 / 12** fictional local UI checks passed at both 390px and 1280px in headless Chromium. Manually clicked preview, commit, replay, expiry, role denial, language switch, Qaida and Qur'an tabs. No page JavaScript errors or horizontal overflow at those widths.
- Prior v11 **8** locally runnable independent PBKDF2 sanity assertions passed in the bundled standalone source. They do not measure real Apps Script hashing performance.
- The complete standalone Version 12 ZIP has 64 files and passed ZIP integrity validation.

## Security and rollout blockers — do not enable for real children
1. **Irreversible legacy credential clearing**: v11 provisioning clears both plaintext legacy password and persistent student API key. Disabling flags cannot restore these. Use disposable records only; implement backed-up migration, recovery, consent, rollback and support escalation first.
2. **Actual Google Apps Script execution** not tested: HMAC/PBKDF2 performance, concurrency, transient CacheService evictions, real admin tokens, data write audit, multi-school isolation and password-reset response after partial failures require a separate deployment.
3. Preview challenge one-use is maintained in best-effort CacheService. Test concurrent commits and retries; independent identity-security review required before public deployment.
4. Current School Suite student sessions remain in browser storage; review XSS, cookie/session architecture, device compromise, missing/failed logout, retention, rate limiting and incident response.
5. Guardian-to-child consent, guardian verified recovery, external audio licensing, Islamic scholar review (Arabic/Tajweed/Salah/Wudu), Urdu content, accessibility and Android PWA testing remain outstanding.
6. No permission to merge, update production Apps Script, or deploy Vercel was granted.

**No real school records, children's information, production branches, live Apps Script deployment or Vercel production site were modified.**
