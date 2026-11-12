# LAMA Quran Academy Version 9 — Guardian pilot handoff (development only)
Date: 2026-11-12. **NOT DEPLOYED. DO NOT MERGE TO MAIN YET.**

## Development status
The existing School Suite backend router and API client on this branch now reference the v9 action names:
quranV9ApproveGuardian, quranV9RevokeGuardian, quranV9ListGuardianLinks, quranV9RequestGuardianCode, quranV9VerifyGuardianCode, quranV9GuardianChildren, quranV9GuardianProgress, quranV9GuardianLogout.

**Important:** The full v9 Apps Script add-on is in the downloadable LAMA Quran Academy v9 ZIP from the project conversation, at `lama-quran-academy/integration/quran-academy-v9.gs`. It has NOT been committed to this branch yet. Therefore, the router fails closed with "Guardian pilot addon is not installed." Deploying just this branch does not enable guardian access.

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
