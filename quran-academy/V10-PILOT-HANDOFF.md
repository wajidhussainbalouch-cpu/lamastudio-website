# LAMA Quran Academy — Version 10 Pilot Readiness Handoff

**Date:** 2026-11-12  
**Status:** DEVELOPMENT BRANCH ONLY — NOT DEPLOYED / NOT APPROVED FOR LIVE CHILD RECORDS

## Scope

This branch extends the Version 9 guardian pilot and preserves School Suite's existing school, teacher and student records. It does **not** create a second student database or a second Apps Script deployment.

New paths and changes:
- `quran-academy/backend/quran-academy-v10.gs` — two **read-only** backend actions.
- `lamastudio-school-suite/backend-api/code.gs` — wires both actions through existing POST-only handler and explicitly blocks GET.
- `lamastudio-school-suite/js/api-client.js` — named calls through existing school/teacher session transport.
- `quran-academy/backend/quran-academy-v9.gs` — replaces two undefined `quranV8Table_` calls with the actual canonical helper `quranV8Sheet_`.

## API actions and authorization

### quranV10PilotReadiness
- POST only; existing **verified school administrator token** required.
- Existing v8 school allowlist and active-school state verified by `quranV8Guard_`.
- Responds with non-identifying school-local counts of Quran practice, teacher reviews and approved guardian links.
- Returns release blockers as **false**, and `canLaunch:false` always.
- Does not return emails, student names/IDs, teacher notes, credentials, or server-side secret contents.

### quranV10TeacherSummary
- POST only; existing **verified teacher credentials** and active class assignment required.
- Filters learner roster to teacher's assigned class/section using current School Suite authorization helpers.
- Returns only aggregate learners, practicing learners, events, latest reviewed lesson records and needs-practice lesson records.
- Does not return student names/IDs or review notes. School-admin, student and guardian roles are not allowed to call this action.

Neither route creates or alters a spreadsheet tab. Both use the existing Quran v8 read-only table helpers.

## Test evidence and limits

The downloadable Version 10 source package includes `integration/test-quran-v10.cjs`, whose **20 deterministic mock checks** passed on Node.js v22.16.0. Tests cover role denial, school scope, aggregate-only responses, absent assignments, and missing guardian configuration. The standalone browser interface was tested in headless Chromium at 390px and 1280px widths with no page errors or overflow, using synthetic records.

These are **mock and browser UI tests only**. They do not validate the actual deployed Apps Script project, real email delivery, session expiry, race conditions, or authorization against live school tenants.

## Launch blockers

1. Upgrade legacy plaintext student passwords, with explicit user-session migration and rollback. Do not silently convert production student credentials.
2. Deploy only to an **isolated test** Apps Script project connected to disposable school data after approval, and verify action routing and identity in real sessions.
3. Test MailApp delivery/quota, guardian OTP expiry/attempts, revoked links, concurrent writes, cross-class and cross-school denial.
4. Define child privacy/guardian consent, retention, export and deletion policy.
5. Obtain qualified scholar review, Qur'an text integrity validation and recitation audio permissions.
6. Test Android PWA installation, local offline learning and authenticated workflows separately.
7. Obtain explicit approval before production changes or subscription/feature activation.

## Configuration and safety

Retain the v8 and v9 script-property gates. The new v10 add-on introduces **no new secret** and must not expose existing secrets to frontend code. A standalone demo or a local checklist is not evidence of real authorization.

**No Vercel build, Apps Script deployment, main-branch mutation, production database change, or real school data access was performed.**
