# LAMA Quran Academy v10 — supervised pilot gate

**Development branch only. Not deployed. Do not merge to main or enable real school access yet.**

## Actual repair
The canonical v8 Apps Script addon defines `quranV8Sheet_` while v9 guardian approval/revocation called the undefined `quranV8Table_`. Two invocations in `quran-academy/backend/quran-academy-v9.gs` were corrected to `quranV8Sheet_` (commit `c7faaaefb329b71e9349b326fc54b621c065967a`).

## Evidence collected
- The **actual GitHub v8 + v9 addons** were loaded into an in-memory simulated Apps Script environment. All **22** preflight scenarios passed *after* the correction: pilot gates, admin verification, relationship evidence, masked email listing, neutral response for unknown email, email OTP, cooldown, one-time use, guardian-only child scope, cross-child denial, private note omission, revocation, re-approval not resurrecting tokens, cross-school rejection, blocked school denial, and lock release.
- Confirmed all eight guardian actions exist in the School Suite action router and are blocked by the GET handler.
- The independent Version 10 frontend download adds an 18-gate local checklist (CSV export) and 12 fictional role simulations. Chromium at 390px and 1280px: 12/12 synthetic demonstrations rendered, checklist navigated, Urdu switch worked, Qaida/Qur'an sections still opened; no JS errors or horizontal overflow.
- **Limits:** Browser simulations are not backend tests. Tests used mocks, not a live Apps Script deployment or real MailApp. Browser localStorage persistence still needs an origin-bearing device test.

## Required before enabling pilot
1. Create a **separate disposable test environment** of the existing Apps Script application and spreadsheet. Never write test rows into the production registry or existing school files.
2. Enable only exact **fictional** school IDs via `QURAN_V8_PILOT_SCHOOLS`, `QURAN_V9_PILOT_SCHOOLS`, and `QURAN_V9_GUARDIAN_ENABLED`. Keep strong `QURAN_V9_GUARDIAN_SECRET` server-side; never commit or expose it.
3. Verify real email delivery and failure responses, wrong-code attempts, expiry, resend quotas, and one-time use.
4. Test authorized admin/teacher/student/guardian roles across two schools, unassigned classes, blocked accounts, session expiry, revocation and reapproval.
5. Test concurrent/duplicate practice and review writes, network failure recovery and audit logging.
6. Resolve legacy plaintext student passwords and review long-lived student API keys **before** children use live credentials.
7. Obtain an approved guardian consent, privacy, retention/deletion and incident-handling policy.
8. Complete scholarly review of Arabic learning, Wudu, Salah, Duas and Seerah; secure appropriate audio licensing.
9. Validate Android/PWA install, offline, accessibility, Urdu/English, logout and rollback.
10. Obtain explicit pilot approval. Keep production disabled until independently checked.

## Deployment rules
- **No** production `main`, Vercel, or live Apps Script changes were made here.
- No real children's records, names, guardian emails, phone numbers, credentials, or codes belong in demo screenshots or test reports.
- Teacher review is distinct from learner practice; the app cannot certify Tajweed automatically.
