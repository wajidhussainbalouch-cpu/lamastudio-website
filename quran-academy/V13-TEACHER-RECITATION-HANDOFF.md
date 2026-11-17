# LAMA Quran & Islamic Learning Academy — Version 13 teacher-led recitation pilot
**17 November 2026 — DEVELOPMENT BRANCH ONLY — NO PRODUCTION DEPLOYMENT**

## Product
The existing public-facing name **LAMA Quran & Islamic Learning Academy** is unchanged. Continue using the **same School Suite school IDs, student IDs, assigned teachers, administrator tokens and guardian approval relationships**. No new student database or login provider is introduced.

## Code committed on this branch
- `quran-academy/backend/quran-academy-v13.gs`: new teacher-only structured listening assessments with per-student Hifz/recitation observation and teacher-set next revision date. Uses the existing v8 school/class/section auth and existing v9 verified guardian session. Appends to a `QuranTeacherAssessments` sheet **inside the existing school's own spreadsheet**.
- `lamastudio-school-suite/backend-api/code.gs`: POST-only actions `quranV13SaveAssessment`, `quranV13GetAssessment`, and `quranV13GuardianSummary`; all blocked on GET.
- `lamastudio-school-suite/js/api-client.js`: teacher assessment and read, server-verifed school admin read, and guardian session-based read-only summary.

## Three server actions
1. **quranV13SaveAssessment:** teacher-only write after existing verified School Suite teacher session and class+section authorization. Request fields: `targetStudentId`, `lessonId`, `requestId`, `fluency`, `letterSounds`, `tajweedObservation`, `memorization`, `reviewStatus`, `revisionDueOn`, `teacherNote`. Idempotent retry with matching same ID; conflicting retries fail.
2. **quranV13GetAssessment:** teacher's assigned learner or verified school administrator only; latest teacher assessments by lesson. Private notes and teacher identifiers stay in this role-controlled view.
3. **quranV13GuardianSummary:** only existing **v9 verified guardian session** associated server-side with that child; read-only simplified lesson status and revision date. No teacher identity, teacher note, full learner name, contact, audio, or authentication key.

Allowed teacher rubric observations are `not-assessed`, `developing`, `improving`, `confident`; review status `needs-support`, `progressing`, `ready-to-review`. Hifz memorization is marked only for `hifz-*` or `surah-*` lessons. **This is not automatic Tajweed evaluation or certification.**

## Server-only feature gate
- `QURAN_V13_TEACHER_REVIEWS_ENABLED=true`
- `QURAN_V13_PILOT_SCHOOLS=<exact fictional school IDs>`
- Existing independent `QURAN_V8_PILOT_SCHOOLS` and, for guardians, v9 login and authorization gates must also pass.

If missing/unset, deny access. DO NOT put real schools on these pilot lists.

## Actual development tests
- **28 / 28** source-level v8/v13 tests passed in a simulated Apps Script environment after fixing a mock blank-row mistake. Covers role boundaries, teacher class and section, cross-school and cross-child denial, invalid rubric fields/dates, formula-note escaping, idempotent retries, latest-by-lesson progress and private guardian note redaction. **The v9 guardian verification service was mocked**; no real guardian login was validated.
- Separate downloadable local Version 13 app (not automatically published to website): retained 11 prior tabs and added **Teacher Studio** as a twelfth tab. Contains fake School A/B students, teacher role, admin role and guardian role preview; 14 / 14 browser-contained fictional permission cases passed on mobile and desktop.
- Headless Chromium at **390px** and **1280px**: saving a fake teacher review, duplicate retry, guardian note redaction, other-class scoping, switching Urdu/English, returning to Qaida, and page overflow all passed; **no JS errors**.
- Standalone demo HTML built by inlining 10 CSS and 17 JS assets; ZIP includes 69 files and passed archive-integrity verification. The ZIP is an **app frontend and integration handoff**; the authoritative real v13 server addon lives in GitHub, not the simulated browser app.

## Real-school blockers
- Separate fully disposable Apps Script deployment with **two fake schools**, real teacher/server auth, suspended and changed class teachers, correct school status and subscription checks.
- Real v9 guardian email verification, session expiry, revocation and consent; no exposure of notes, photos, audio or children other than those linked to the guardian.
- `QuranTeacherAssessments` is attributed to a teacher ID and timestamp; a separate full School Suite `AuditLog` entry has **not yet been implemented and independently tested**.
- Test sheet sizes, latency, unexpected concurrent writes, revision date/timezones, rollback and data retention. Read/list scales by scanning rows, not indexed retrieval.
- Complete v11/v12 credential migration, secure browser sessions, independent security review, qualified religious content/recitation review and audio rights.
- Real Android PWA, accessibility, offline/online recovery and explicit written release approval.

**No merge to main, no Vercel deployment, no production Apps Script deployment, and no live school data mutation.**