# LAMA Quran Academy v9 — Guardian pilot verification
Date: 2026-11-12
Scope: DEVELOPMENT ONLY, no production deployment.

## Verified locally
- v8 backend mock tests: 15 / 15 passed.
- v9 guardian backend mock tests: 26 / 26 passed.
- ZIP integrity: no corrupt entries; 54 entries present.
- Included: app, guardian pilot and administrator pilot pages, guarded configuration, v8/v9 Apps Script add-ons, both test suites.
- JavaScript syntax: v9 add-on and guardian client scripts parsed without errors.
- Front-end pilot config defaults to enabled:false and apiUrl:''.
- The complete guardian backend is now committed to the development branch at quran-academy/backend/quran-academy-v9.gs.
- API routes and methods are on the development branch; no live Apps Script is connected here.

## Security expectations
- An existing school administrator verifies and approves every guardian-child link.
- Guardian proves control of that approved email via short-lived code.
- Guardian may read only authorized child practice and review statuses, without private teacher notes.
- Server rechecks grant versions, so revocation blocks existing sessions.
- Whitelisted pilot schools and server-only secret are required; missing properties fail closed.
- Guardians cannot modify teacher feedback, enroll students, or list the class roster.

## Still unverified
- Live Apps Script deployment and MailApp quotas/production sending.
- Operational security, persistence/retention policies, guardian consent and identity checks in a real school.
- Legacy plaintext student passwords and broader authorization audit.
- Android PWA/offline behavior on actual devices.
- Scholarly review of educational explanations and licensed human recitation audio.

## Release instruction
Do not merge the development branch into main or enable live guardian records without supervised pilot approval and independent security review.
