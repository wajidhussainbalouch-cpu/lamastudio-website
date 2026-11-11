# LAMA Quran Academy v8 — Security Pilot Handoff
2026-11-11 · DEVELOPMENT BRANCH ONLY · NOT DEPLOYED

## Source changes
- quran-academy/backend/quran-academy-v8.gs: isolated Apps Script addon that uses existing school/student IDs and per-school sheets, with no new user accounts.
- lamastudio-school-suite/backend-api/code.gs: five quranV8 actions routed through the addon; all five blocked on GET and require POST.
- lamastudio-school-suite/js/api-client.js: named Quran v8 API client methods; preserves current School Suite auth handling.

## Exact pilot gate
Apps Script Script Property QURAN_V8_PILOT_SCHOOLS must contain the exact school ID(s) to enable, comma-separated. Missing/empty property denies every request. Never place service credentials or admin tokens in HTML. There is no public guardian access or independent database.

## Supported actions
- quranV8ListLearners: assigned teacher roster or verified school admin class-scoped roster; student denied.
- quranV8GetProgress: teacher assigned class, school admin, or student self.
- quranV8LogPractice: assigned teacher or student self, idempotent requestId.
- quranV8TeacherReview: authenticated assigned teacher only, auditable, idempotent requestId.
- quranV8ParentChildren: explicitly denied until existing School Suite has verified guardian-to-student identity.

## Do not deploy until
1. The addon is copied into the SAME Apps Script project as Code.gs, with no new doGet/doPost.
2. Mock tests (15 cases, included in the downloadable v8 source package) pass. Repeat against a SEPARATE test deployment.
3. Test revoked/suspended teacher sessions, token expiration, school status, cross-class and cross-tenant requests, duplicate POSTs, and sheet write locks.
4. Confirm no learner alias or local browser review is silently imported to production records.
5. Upgrade legacy student credential handling (existing code currently uses plaintext student passwords) before deploying broadly to children.
6. Implement and independently audit a real parent/guardian account relationship in the existing School Suite. A browser role toggle is NOT authentication.
7. Complete scholar review, data privacy/retention decisions, recitation licensing, and Android PWA testing.

## No production changes
This branch is not the main production branch. The live Google Apps Script deployment and school spreadsheets have not been changed by these commits. No Vercel deployment was initiated.