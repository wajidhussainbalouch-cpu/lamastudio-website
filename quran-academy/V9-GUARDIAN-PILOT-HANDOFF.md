# LAMA Quran Academy Version 9 — Guardian pilot handoff (development only)
Date: 2026-11-12. **NOT DEPLOYED. DO NOT MERGE TO MAIN YET.**

## Development status
The existing School Suite backend router and API client on this branch reference the implemented v9 add-on action names:
quranV9ApproveGuardian, quranV9RevokeGuardian, quranV9ListGuardianLinks, quranV9RequestGuardianCode, quranV9VerifyGuardianCode, quranV9GuardianChildren, quranV9GuardianProgress, quranV9GuardianLogout.

**Implementation now committed on this branch:** `quran-academy/backend/quran-academy-v9.gs` contains the guardian verification add-on. The same v9 integration is included in the downloadable app package at `lama-quran-academy/integration/quran-academy-v9.gs`. It is **not installed in any Apps Script deployment**. Merely merging this branch will not activate the add-on: it must be copied into the existing Apps Script project, separately tested, and explicitly enabled by Script Properties.

## Implemented in the packaged source
- Existing School Suite student IDs only; school-admin-attested guardian approval; email/relationship stored in a private per-school sheet
- Two independent pilot school allowlists, feature toggle, 32+ character server-side secret
- 10-minute email code, max five attempts, simple rate controls, 30-minute server-cache session
- Read-only guardian access only to previously approved children, with approval/version rechecks on every read
- Read-only guardian progress excludes teacher notes, teacher IDs, and other school rosters
- Revocation even when subscriptions are read-only, plus audit events without plain email/code/token
- Separate disabled-by-default parent and admin pilot HTML pages, and a synthetic School Link walkthrough

## Validated locally
26 Apps Script mock authorization tests passed. Browser simulation passed at 390px and 1280px with no console errors or overflow. **Not live tested** with Apps Script, MailApp, teacher accounts, real student data, or Android PWA installation.

## Before pilot
1. Add the ZIP source `integration/quran-academy-v9.gs` to the SAME existing Apps Script project (not a new backend).
2. Confirm all POST-only routes, no direct GET, no extra doPost/doGet, and agreement between source action names.
3. Set test-only Script Properties: `QURAN_V8_PILOT_SCHOOLS`, `QURAN_V9_PILOT_SCHOOLS`, `QURAN_V9_GUARDIAN_ENABLED`, and `QURAN_V9_GUARDIAN_SECRET`. Never commit actual values.
4. Run real test-school scenarios for an unverified parent, cross-school and cross-class access, revoked guardian, expired code, disabled school, email quotas and audit PII.
5. A school administrator must verify guardian relationship OFFLINE before approval.
6. Follow a child-data privacy plan, student credential upgrade, and qualified Quran content review.

No Vercel deployment, production Apps Script deployment, or real school data migration has been performed by this v9 work.

## 2026-11-12 update
- Committed `quran-academy/backend/quran-academy-v9.gs` on the v9 development branch (commit `78c5c99b121d0c4625a60cebfd0195a698dc2ef2`).
- Local packaged v8/v9 mock suites passed 15 + 26 checks. **Live Apps Script has not been exercised**; re-run test suites and conduct independent pilot security review before deployment.
- No production website or spreadsheet changes were made in this change.

## 2026-11-12 — Follow-up release packaging and validation
- Strengthened guardian email validation in the branch's canonical `quran-academy/backend/quran-academy-v9.gs` to reject spreadsheet formula-like/invalid email values (commit `893772524e8ed27cb4150b6550ee621783702c2e`).
- Prepared a Version 9 learning-app ZIP and standalone demonstration retaining earlier modules; added a fictional School Link verification/revocation walkthrough and separate restricted `guardian-pilot.html` and `guardian-admin-pilot.html` frontend pages. These frontend files are supplied as a downloadable chat artifact, **not committed on this branch**.
- The new ZIP points to this GitHub branch's canonical backend source via `integration/GUARDIAN-BACKEND-SOURCE-v9.md`; it deliberately does **not** embed a competing v9 server add-on. The prior note above about the add-on being contained in the ZIP referred to an earlier local package.
- Browser-simulated frontend tests passed using fictional API responses. Local exploratory guardian logic (separate from the canonical server add-on) passed 26 mocks, but canonical backend must still be independently exercised on a test Apps Script deployment.
- No live deployment, no main-branch modification, and no real student data accessed.
