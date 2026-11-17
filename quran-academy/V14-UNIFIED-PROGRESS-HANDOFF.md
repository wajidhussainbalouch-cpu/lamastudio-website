# LAMA Quran & Islamic Learning Academy — Version 14 unified learner progress

**17 November 2026. Development branch only; NOT DEPLOYED. Keep the existing product name.**

## Purpose

One *read-only* picture of Qaida, Nazra and Hifz learning, using the existing School Suite school/student IDs, practice logs, and teacher-review logs in the same school spreadsheet. No duplicate student table, guardian accounts, or new database.

Important distinction: **practice events are not exam results, Qur'an memorization certification, Tajweed accuracy or automatic mastery percentages.** Only assigned teachers can make human observations.

## Implemented on this branch

- `quran-academy/backend/quran-academy-v8.gs`: accept canonical Nazra lesson IDs `nazra-juz-01` through `nazra-juz-30` in existing lesson whitelist.
- `quran-academy/backend/quran-academy-v14.gs`: aggregate `QuranPracticeLog` and `QuranTeacherAssessments` per original learner and last teacher assessment per lesson. Counters for practice events, unique practiced lessons, reviewed lessons, revisions due, and upcoming revision dates. Invalid historical lesson IDs are counted as unclassified instead of treated as a completion.
- `lamastudio-school-suite/backend-api/code.gs`: new POST-only routes `quranV14GetLearnerReport`, `quranV14ClassDashboard`, `quranV14GuardianReport`. All three are explicitly rejected on GET.
- `lamastudio-school-suite/js/api-client.js`: new corresponding role-specific methods, using the existing authentication state and a separate POST-only guardian transport.

## Authorization

- All reads additionally require `QURAN_V14_PROGRESS_ENABLED=true` and the school's exact ID in `QURAN_V14_PILOT_SCHOOLS`; also passes independent v8 and v13 feature gates for staff.
- The school must remain `Active`.
- Teachers may read only their assigned class and section; class dashboard **ignores** caller-supplied teacher class/section and uses server assignments.
- Verified school administrators may request a named learner or a **selected class**, with optional section, pagination offset and size (max 50); no default whole-school dump.
- Guardian report requires the existing v9 server-verified school gate, session and specific child link. The returned report excludes student names, teacher names, private teacher notes, photos, credentials and contact information. If the student has been deleted, access is denied even if a guardian link remains.
- Student role remains explicitly blocked by the existing v8 pilot while real authentication is reviewed; no accidental self-access.
- Report queries create no new Sheets or student rows and do not change student progress.

## Independent tests completed in this development step

- **34 / 34** synthetic source-level tests passed against the actual v8/v13/v14 GitHub JavaScript evaluated in a mocked School Suite environment. Cases cover feature gates, inactive school, class/section, cross-school, guardian denial/redaction, Nazra 1/30 vs 31, independent practice vs teacher assessment counts, latest teacher status, due vs future revision, class pagination, and unknown historical lesson handling. The v9 guardian session is **mocked**, not a live login.
- Separate downloadable Version 14 frontend (ZIP, **74 files**) retains 12 previous screens and adds a thirteenth `Unified Report` tab. The demo contains only fictional pupils, in-memory practice and two-language educational content. It can reflect fictional Version 13 Teacher Studio observations in the same open browser tab; it does not call live APIs.
- Headless Chromium at **390px** and **1280px**: 13 tabs, 19/19 fictional browser-contained privacy/authorization checks, teacher save -> unified report synchronization, role switches, guardian note hiding, Nazra filter, bilingual labels, Qaida navigation, no JavaScript errors or horizontal overflow.
- PWA ZIP archive integrity passed. Full local source paths and release notes are attached to the ChatGPT conversation, not committed to this GitHub branch.

## Blockers before any real-school use

1. Install shared add-ons only in an **isolated Apps Script TEST deployment**, with two separate fictional school spreadsheets and the real router. Verify active/suspended teacher sessions, exact school boundaries, real v9 guardian email/approval, revocation, session expiry and privacy.
2. Review Google Apps Script sheet row-scan performance, teacher assessment audit trail, concurrency, reliable pagination, date serialization and the school's own time zone.
3. Complete v11/v12 student auth security migration; old plaintext passwords and persistent keys are NOT solved for production.
4. Written child/guardian consent, privacy retention/deletion, proper access logs, administrator exports, offline cache privacy and safe logout.
5. Qualified scholar signoff for Quran, Nazra, Tajweed, Hifz and Islamic content; verify recitation and translation licenses; test on Android/PWA and accessible devices.
6. Obtain explicit approval before deployment or enabling real schools.

**No GitHub main merge, live Apps Script update, Vercel production deployment, or real student record mutation was performed.**
