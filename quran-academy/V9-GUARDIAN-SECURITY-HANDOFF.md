# LAMA Quran Academy — Version 9 guardian pilot handoff

**11 November 2026 — DEVELOPMENT ONLY; NOT DEPLOYED.** This branch derives from the Version 8 secure-pilot branch. The School Suite backend dispatch and API client wrappers are prepared on this branch, but the guardian addon itself must be reviewed and installed alongside the existing backend before the routes can work.

## Addon and tests
The complete standalone V9 project ZIP delivered in the conversation contains:
- `integration/quran-academy-v9-guardian.gs` — per-school guardian links, email-code challenges and session hashes, verified school-admin grants and revocations, read-only approved-child progress
- `integration/test-quran-v9.cjs` — 22 mock security checks, run against fictional data only
- `integration/V9-SCHOOL-PILOT-SECURITY-HANDOFF.md` and `RELEASE-NOTES-v9.md`
- `guardian-demo.js`, `guardian-demo.css`, and updated app/PWA files (fictional-only browser demo)

**Do not merge/deploy this branch until the addon is independently audited and added to the same Apps Script project** with the preexisting `quran-academy-v8.gs` and `Code.gs`. No second `doGet` or `doPost` is permitted.

## Security boundaries
Existing school IDs/student IDs remain authoritative. School admin must first verify guardian authority offline and grant a relationship; email control alone is not guardianship. Code requests never reveal membership. One-time emailed 8-digit codes expire in 10 minutes, allow at most five attempts, and are rate-limited. A guardian session is 6 hours and hashed server-side. Every read checks the live approved-child relationship. Revocation immediately prevents access. Guardian is **read-only** and cannot approve recitation, see unrelated children, or read private teacher notes.

The new backend uses separate tabs in each existing school spreadsheet, **not a duplicate student database**. New functions are disabled unless `QURAN_V8_PILOT_SCHOOLS`, `QURAN_V9_GUARDIAN_ENABLED=true` and a 32+ character server-only `QURAN_V9_OTP_PEPPER` are configured. Never commit real school data or the pepper.

## Safe rollout gates
1. Run both existing V8 and new V9 tests, then independent security review.
2. Verify POST-only routes, active-school authorization, school-admin token, MailApp deliverability and quota, replay, cross-tenant access, expiry, revocation and restoration.
3. Use only fictional test accounts until student login password security is hardened and the parent consent and data-retention policies are reviewed.
4. Obtain teacher and Islamic scholar review of religious explanations; test Android PWA installation and reading/text integrity.
5. Do not deploy Apps Script, publish to lamastudio.pk or build on Vercel without explicit approval.

## Status
Local mock tests: V8 15/15, V9 22/22. Chromium interface tests at 390 and 1280 pixels passed with fictional examples. Live Apps Script, MailApp and school-account tests were **not** performed. No production or student records changed.
