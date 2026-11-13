# LAMA Quran & Islamic Learning Academy — Version 11 identity hardening

**Status:** development branch only. **No production deployment or public pilot approval.**
**App name:** retained unchanged at the user's direction.

## Purpose
The existing LAMA School Suite backend stores legacy student passwords as plaintext and returns long-lived student API keys during login. In addition, generic student record responses previously returned password and API key fields even in class-scoped teacher views. These are separate issues; the first is **not solved** by redacting the second.

## Changes committed on this branch
1. `lamastudio-school-suite/backend-api/code.gs`: `quranV11PublicRecord_(collection, record)` creates a filtered copy of student and teacher rows and removes `password`, `apiKey`, hashes, salts and common recovery/session tokens from generic `list`, `get`, `add`, and `update` API outputs, including newer access/refresh/auth token fields. This is a response-boundary filter: internal authorizers still use the original record so earlier teacher and school functions do not lose necessary data. Storage format remains unchanged.
2. `quran-academy/backend/quran-academy-v8.gs`: the Quran school pilot rejects legacy `student` role sessions unconditionally until credential migration and validation. Teacher/class and school-admin pilot guards remain; v9 guardian access has an independent server gate.
3. `quran-academy/tests/test-v11-identity.cjs`: source-level regression checks for student redaction and paused legacy student access.\n4. `quran-academy/tests/test-v11-redaction.cjs`: expanded source-based regression test of all four generic CRUD paths for **student and teacher** credential redaction; run `node quran-academy/tests/test-v11-redaction.cjs` after checkout.

## Test evidence
- Extracted the canonical newly committed helper and pilot guard from the GitHub source in an isolated JS runtime: **11/11 checks passed** (student secret filtering, non-mutation, non-student semantics, null input, all four generic response paths, student deny, teacher allowed, cross-school deny).
- Additional **14/14 focused checks** passed against the actual GitHub Version 11 sanitizer and generic CRUD route expressions, using fictional records. The full GitHub repository Node test runner is not executed in this connector environment.
- Earlier v10 Apps Script mocks passed 22/22 after the guardian helper fix; the v10 Node mock test bundled with the app also passed **20 checks** in the container.
- Version 11 app: locally generated single-file HTML loaded directly into Chromium at 390px and 1280px. Both sizes displayed the 20-item checklist and 12/12 fictional role results; Qaida and Qur'an tabs opened; no page JS errors or horizontal overflow. **Direct local HTTP/file navigation was blocked by this environment**, so install/offline/PWA network behavior was not tested.

## Remaining security defects and non-goals
- `studentLogin()` still compares plaintext passwords and returns a persistent per-student API key; this patch does not replace the authenticator, migrate existing credentials, or invalidate existing sessions. Other School Suite pages may still use that legacy login. Do not use real student accounts for the Quran school pilot.
- Generic student/teacher record filtering is a partial defense only. Review all other data-returning endpoints, exports, logs, backup/sheet permissions, admin privilege levels, and teacher-visible contact/guardian fields.
- Guard every endpoint with server-resolved school, class/section and student identity. Continue verifying the v9 guardian flow against revocation and throttling.
- Do not run a live school pilot until migration/forced resets, hashed password storage with proven password KDF, token rotation, rate limiting, CSRF/session expiration review, tests in an isolated Apps Script deployment, child consent/privacy policy, and qualified Islamic scholarly review are complete.

## Frontend artifact
Version 11 app and independent single-file demo are provided as downloadable conversation artifacts. The GitHub branch contains the **server code and regression tests**; it does not claim the packaged app was deployed or added to `main`.

## Mandatory deployment rule
Never merge directly or enable production Script Properties based only on this test report. Explicit approval and independent sign-off are required. Leave existing school spreadsheets and registry unchanged during testing.
