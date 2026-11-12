# CURRENT PROJECT HANDOVER — READ FIRST
**Updated:** 27 October 2026  
**Repository:** `wajidhussainbalouch-cpu/lamastudio-website` · **production branch:** `main`  
**Live website:** https://www.lamastudio.pk/  
**School Board:** https://www.lamastudio.pk/lamastudio-school-suite/main-dashboard.html

> This section is the current cross-chat handover. Historical README content below is preserved for reference, but older statements about file availability, login/logout behavior, import readiness, and backend setup may be outdated. Verify actual GitHub files and live deployments before making changes.

## 1. Owner's vision and operating rules

Build **Lama School Suite** into a polished, fast, responsive, secure **multi-school ERP / school management SaaS**. Each registered school has its own tenant-scoped records, branding, admins, teachers, students and parents. The **public School Board** shows published activities, notifications, tests, resources, events and academic information. The School Board is **display-only**; authorized admin interfaces publish or edit data. Teacher, student/parent, school-admin and superadmin portals must remain distinct, role-scoped, and must return to the public School Board when the user logs out.

The owner authorizes carefully tested GitHub changes and production deployment, and prefers finished results visible at `lamastudio.pk`, not only recommendations. **Never erase, overwrite, reset, replace, or silently migrate existing Sheets, school registry, users, credentials, or live Apps Script modules.** Preserve data even if an interface appears empty. Back up before any backend migration; favor reversible, additive changes, review diffs, and validate live behavior. Production Vercel READY means deployment built; it does **not** prove authenticated flows work.

The owner's institutions include Government Primary School Shah Sadar Din and Allama Iqbal Model School. Treat this as a **commercial product for many schools**, including schools with 1,000+ students, not a single-school prototype.

## 2. Architecture / source of truth

- GitHub: `wajidhussainbalouch-cpu/lamastudio-website`, production `main`.
- Vercel: `lamastudio-website`; production aliases `www.lamastudio.pk`, `lamastudio.pk`.
- Frontend: `lamastudio-school-suite/` with `main-dashboard.html`, `dashboard.html`, `portals/{admin,teacher,student,superadmin}/`, `students/`, `staff/`, `academics/`, `finance/`, `planning/`, etc.
- API client: `lamastudio-school-suite/js/api-client.js` (`LamaAPI`).
- Google Apps Script backend source tracked at `lamastudio-school-suite/backend-api/code.gs`; the deployed Apps Script and its other modules may **not match the repository copy**. Do not assume a GitHub commit deploys Apps Script.
- Live Apps Script has additional modules (e.g. bulk attendance and trial monitoring). Never blindly push a partial `code.gs` or create a new backend deployment that omits existing modules.
- Tenant records are in school-specific Google Sheets, with a separate master school registry. Student enrollment numbers should be unique **within a school**; internal student IDs remain stable across class promotions. Class alone is **not** a unique identity.
- School admin privileges must be enforced **server-side**; never rely on hiding buttons or client-side filtering for access control. Student, parent and teacher records require tenant and class/section scoping.
- The owner's preferred primary Google account for project Apps Script/Sheets/Drive work is `wajidhussainbalouch@gmail.com`; verify connected access before acting. Do not copy passwords or API keys into docs.

## 3. Completed and production-deployed (confirmed 27 October 2026)

**PR #12 — canonical URL cleanup**: merged to `main`, commit `889fb8b1b72ddf23ff67adebc11d0030c6369bbd`. Removed ten redundant root redirect HTML stubs, added redirects in `vercel.json`, preserved intended URLs.

**PR #14 — planning/timetable/calendar**: merged, commit `acaf104a5a4bfa5f16abd37d61a0180d940228f6`. Added `planning/index.html`, `js/lama-school-planning.js`, planning links and dashboard event display. This is an **initial implementation**, not a fully secured production-ready academic calendar. Existing generic `resources` API may expose unpublished planning records to reader roles; fix server-side authorization and publication filtering before storing sensitive draft data. Teacher ping is manual; WhatsApp automation not present.

**PR #16 — app home and logout navigation**: merged, commit `c7f382279dd773c008739fb5f5e8135e2c3312dc`. Vercel deployment `dpl_AgCnzb5PsuxVtG44yVJZ2K2djoz4` was verified **READY** and aliased to `www.lamastudio.pk` / `lamastudio.pk`. PWA manifest `start_url` now points to `main-dashboard.html` rather than `portal-login.html`; service worker cache version/fallback updated; School Board registers service worker. Main student, teacher and admin portal logout handlers return to School Board, with school-admin session cleanup. **Still needs real-device and authenticated role-by-role verification**. Older installed PWA shortcuts may retain stale manifests.

No school records were deliberately migrated or deleted by PR #16.

**PR #17 — tablet header fix:** merged, commit `62f7ce64ca6113cde78a2b4a93f01b5b9b5724bf`. Restored visible School Board, Settings, Colors, Logout and Admission labels on tablet; full school name now wraps instead of truncating. Vercel READY, user screenshot confirmed improved display.

**PR #18 — dashboard polish and Certificate Center:** merged, commit `672e77313c476ab3909a3359856c06eacf517fc4`, Vercel deployment `dpl_M7ZGri3votJ6678oHiWA1yDVjMwJ` READY and aliased to production. Refined dashboard module cards and added Certificate Center links. `certificates/index.html` is administrator-gated, preview/print only: academic excellence, good performance, sports, participation, conduct and leaving/transfer drafts. **No issuance register, audit trail, official verification, or backend writes.** Test admin login and A4 printing in live browser. Earlier draft PR #13 still exists separately and should not be assumed merged wholesale.

**PR #19 — editable certificate designer:** merged, commit `077c09e80ce01e4cf3a3c3a23e1e24c49c6287f3`, Vercel deployment `dpl_7mYYPjdDTXfXPerQch9FC41ZpU4m` READY and aliased to production. Certificate Center now offers navy/gold landscape A4 design with customizable primary/accent colors, school heading/address, title, introduction, body wording, seal text, signatory labels, and live preview/print. This is a draft designer only; no verified issuance register, approval workflow, or database writes. Test mobile/tablet rendering and print background graphics.

**PR #20 — certificate mobile preview and administrator entry:** merged, commit `ce40bdd7648387122a5b84c5d2e0b058afa0d082`, Vercel deployment `dpl_E5thshqs35FK6wd1LshbA5ReV5we` READY on production. Corrected phone screenshot showing overlapping title/seal/details by scaling a fixed landscape certificate canvas, retained A4 landscape print, and added explicit admin sign-in link for missing/expired administrator session. Real-device and print validation still needed. No backend writes or school data changes.

**PR #21 — three certificate templates and portal galleries:** merged, commit `d3445381c49df1b3de8cbc4fb5daf502a3f16c69`, Vercel deployment `dpl_GyYKwBbXbEWGceoU5knsbuSAaMqT` READY. Adds selectable Classic Gold, Royal Gold, Executive Blue certificate themes, editable colors/text and A4 preview/print. Adds read-only school certificate register UI and student `My Certificates` UI. **The live backend has no Certificates collection yet, so digital issuance and delivery are NOT active.** Both panels explicitly report unavailability; they must never pretend a draft is issued. Real-device design/print tests still needed.

**PR #24 — unified school administration login:** merged commit `174cb0638a539779499b1a5cffa16ce25eb16da7`, Vercel deployment `dpl_6xKMsnW9zSh7QKBCjwBXzAk937qT` READY on production. School administrator entry now has school account and administrator verification as two conditional steps on one page; dashboard missing-school guard routes to same entry, avoiding confusing cross-page redirects. Backend roles and existing school data unchanged. Test real school and admin credentials on phone.

## 4. Work in GitHub but NOT deployed

**PR #22 — secure certificate issuance backend:** https://github.com/wajidhussainbalouch-cpu/lamastudio-website/pull/22, **DRAFT / NOT MERGED / NOT DEPLOYED**. Adds backend Certificates collection, server-side student-only list scoping, verified admin issuance, immutable records, reference deduplication, audit and enrollment validation. Requires test school, full Apps Script module backup/synchronization and backend deployment, admin issue action, digital certificate viewer and revocation policy before release. Do not merge backend PR alone or assume GitHub changes deploy Apps Script.

**PR #15 — delegated enrollment**: https://github.com/wajidhussainbalouch-cpu/lamastudio-website/pull/15, branch `feature/teacher-delegated-enrollment-20261027`, **DRAFT / NOT MERGED / NOT LIVE**. Proposed backend additions: administrator-granted `canEnrollStudents` and optional expiry on teacher/staff accounts; at most two active enrollment officers per school; assigned class/section enforcement; school-wide enrollment number and B-Form duplicate checks with lock; enrollment notification; admin permission page; teacher enrollment form. Subsequent development added `canCompleteStudentProfiles` permission and an admin checkbox. **Incomplete**: class-teacher profile completion page/script, field-specific backend tests, proper staff-account model for non-teachers, and safe live Apps Script deployment. An attempted incomplete profile page creation was not reliably completed. Check branch contents before continuing. Do not merge until backend and frontend are coordinated and tested. WhatsApp delivery is **not implemented**.

**PR #10 — student importer**: https://github.com/wajidhussainbalouch-cpu/lamastudio-website/pull/10, draft `feature/universal-import-detection-20261027`. Read-only Excel/PDF header detection, preview and duplicate flags. `STUDENT_IMPORT_READ_ONLY=true`; safe bulk-save backend and validation still required. Related PR #9 PDF extraction is also draft.

**PR #13 — earlier certificate-center draft (partially superseded by deployed PR #18)**: https://github.com/wajidhussainbalouch-cpu/lamastudio-website/pull/13, draft `feature/certificate-center-20261027`. Printable certificate templates, not an audited issuance register; not deployed. Rebase/check dashboard conflicts before merge.

**PR #11**: audit/documentation draft, not merged.

Do not claim any draft PR is live just because its source exists on a GitHub branch.

## 5. Agreed student admission and profile workflow (HIGH PRIORITY)

Owner's latest decision: **do not grant enrollment rights to all teachers**. The school admin can enroll students directly and may appoint **one or two designated enrollment officers** (e.g. an assistant teacher or admission clerk). Ordinary class teachers **cannot create student records by default**.

**Stage A — initial enrollment:** admin/enrollment officer enters only essential fields (student name, enrollment number, class/section, guardian/father and contact as applicable). Support validated **bulk imports** for schools with 1,000+ students; preview, field mapping, duplicate report, user confirmation, safe transactional/locked writes, and audit. Avoid forcing admins to type 1,000 records manually.

**Stage B — class profile completion:** admin may separately grant class in-charge `canCompleteStudentProfiles`. Authorized class in-charge updates **the existing record** for students in their own assigned class/section: address, photo, DOB, guardian details, contact, other non-identity fields. Never generate another student ID/enrollment when completing a profile. Teacher cannot edit enrollment number, identity/credentials, school ownership, class assignment, delete/archive, or students in other classes. Keep enrollment permission and profile-completion permission **separate**. Prefer visible progress indicators (e.g. `Basic enrolled`, `Profile incomplete`, `Profile complete`) and an audit log of field changes. Use an admin-controlled list of required vs optional fields.

**Notifications:** after confirmed save, show new enrollment in authorized admin/teacher/student-parent views with appropriate privacy filtering. Portal notifications should show safe summary (student, enrollment number, class, date, school); never publish private student details to all students. Parent/admin WhatsApp requires consent, a configured approved provider, delivery status and retry handling. Do not claim WhatsApp works without an actual integration. Avoid duplicate notifications on retries.

**Security / correctness:** unique enrollment number per school, optional B-Form duplicate checks, stable internal ID, safe concurrent enrollment, admin-controlled permission and revocation, audit trail, field-level server-side allowlists, class/section enforcement, and test coverage.

## 6. Portal and app requirements

- Public `main-dashboard.html` is the **PWA home**, not merely a portal selector; it should show published school information, activities, notices, academic events, tests and resources.
- Separate school-admin, superadmin, teacher, student and parent experiences; authentication and permissions must be isolated. Admin alone publishes/edit public School Board content.
- Logout from every portal and its legacy alternate pages should clear **only appropriate role sessions** and navigate to `main-dashboard.html`. Audit remaining legacy routes and browser-back session behavior.
- Existing `portal-login.html` remains a login entry point **from** the public School Board.
- Confirm school-specific public board context is selected correctly, not accidentally exposing another school's data.
- Validate Android installed PWA entry, manifest refresh, offline fallback, navigation and responsive/mobile layouts.
- Future native Android wrapper/app should show the same public School Board **plus** portal access, not a portal-only menu. No verified native-app build/deployment has been made for this change.

## 7. Next work, in recommended order

1. **Inspect current GitHub `main` and PR #15**; fix any incomplete files, implement authorized class profile completion and ensure secure server-side field permissions. Clarify a staff enrollment officer account versus a teacher assigned class.
2. **Design/test a safe bulk enrollment pipeline**: CSV/XLSX/PDF where reliably readable, preview and mapping, stable student ID, school-wide dedupe, audit and non-destructive writes. Do not turn on bulk writes without a backend tested against a test school.
3. **Back up and inspect live Apps Script** and ALL deployed modules; plan additive schema changes and staged backend deployment. Verify no loss of school registry, users, Sheets, or API credentials. Coordinate frontend and backend rollout.
4. Add portal notifications and optional WhatsApp via consented provider, with status and retry.
5. Audit all portal login/logout flows, School Board published-only data, role isolation, PWA behavior and mobile responsiveness. Resolve planning draft exposure.
6. Complete class-subject-teacher mapping, fees/receipts, promotions/archive, payroll/expenses, complaints/PTM, backup/recovery and certificate issuance, enhancing existing modules instead of duplicating them.
7. After successful staging tests, merge/deploy, confirm Vercel `READY`, test authenticated live flows and update this handover with **actual** PR/commit/deployment IDs and limitations.

## 8. Instructions to the next ChatGPT conversation

Start with: **“Read `lamastudio-school-suite/README.md` from GitHub `main`, especially CURRENT PROJECT HANDOVER. Inspect current branches/PRs and production deployment before editing. Continue the Lama School Suite work without erasing data. Distinguish implemented, draft, deployed and tested. Update this handover after each meaningful release.”**

Use GitHub and Vercel connected tools when available. If the user uploads a newer ZIP, **compare its contents and version** against GitHub `main` before deciding which is canonical; the user's previously uploaded `lamastudio-website-main (1).zip` was described as the then-current baseline, but may be older than later GitHub deployments. Never overwrite newer code with an older ZIP. If the user asks for an updated ZIP/MD, produce it and link the exact created artifact. Do not assume GitHub edits modify an earlier uploaded ZIP.

---

## Historical README (preserved below)

[README.md](https://github.com/user-attachments/files/32550460/README.md)
# LamaStudio School Suite — Complete Package

Every file needed to run the full system: Super Admin, School Admin, Teacher,
and Student & Parent portals, all backed by one Google Apps Script Web App
and each school's own private Google Sheet.

## Existing production installation — safety first

This repository already has a live Google Apps Script backend, a Master Registry,
and an existing Vercel deployment. **Do not create a new Apps Script project,
run `setup()` or `setupSuperAdmin()`, or deploy a new Web App** when maintaining
the production installation. These operations can create a different registry,
reset credentials, or change the API URL.

- Preserve the current Apps Script script ID, deployment ID, and script properties.
- Back up the entire live Apps Script project, including the bulk-attendance and
  trial-monitor modules, before considering a backend push.
- Never run `clasp push` from a partial source directory; missing live modules
  can be removed from the Apps Script project.
- Keep passwords and OAuth credentials out of the repository and documentation.
  Use protected secrets and rotate any credentials previously committed or shared.
- The suite uses `js/api-client.js` to reach the existing deployed API. Do not
  replace that URL without a controlled migration.
- The root-level short HTML files are compatibility redirects to the module pages.
  Do not delete them without checking inbound links and bookmarks.
- Run `node scripts/audit-school-suite.cjs` from the repository root to inspect
  duplicate content, redirects, and unresolved local links before cleanup.

The full application is organized into `students/`, `staff/`, `attendance/`,
`academics/`, `exams/`, `communications/`, `finance/`, and `portals/`.

## The four panels

- **Super Admin** — `portals/superadmin/superadmin-login.html`. Sees every
  registered school, total students/teachers, can block/unblock a school or
  reset its password.
- **School Admin** — `login.html` → `dashboard.html`. Full control center:
  students, teachers, fees, attendance monitoring, activities, resources,
  promotions — everything.
- **Teacher** — `portal-login.html` → `portals/teacher/index.html`.
  Attendance, homework, marks, one-tap absentee alerts, class promotion —
  scoped to their own assigned class only.
- **Student & Parent** — `portal-login.html` → `portals/student/index.html`.
  Read-only: their own result, homework, attendance history, notices.

## Every page, at a glance

| File | Who uses it | What it does |
|---|---|---|
| `index.html` | Public | Marketing homepage, pricing, login modal |
| `register.html` | Public | School self-signup |
| `login.html` | School Admin | Login |
| `portal-login.html` | Teacher / Student | Combined login, routes by role |
| `dashboard.html` | School Admin | Main control center — live stats, quick links |
| `main-dashboard.html` | All three roles | Shared "School Board" — notices, activities, exams, tests, resources. No fees/HR data ever shown here |
| `admissions.html` | School Admin | Printable official admission form — now actually saves to the student database |
| `students/manage-students.html` | School Admin | Full roster: add/edit/delete any student |
| `students/manage-students-enhanced.html` | School Admin | Alternate roster with historical results and bulk tools |
| `students/student-login.html` | Student / Parent | Student portal login |
| `attendance/student-attendance.html` | School Admin | Daily student attendance register |
| `staff/manage-teachers.html` | School Admin | Add/edit/delete teacher accounts |
| `staff/meet-the-teachers.html` | Public / School | School-scoped faculty showcase, print and share |
| `exams/result-card.html` | School Admin | Official result card generator, per student |
| `academics/report-card.html` | School Admin | Behavioral/teacher evaluation report |
| `exams/date-sheet.html` | School Admin | Exam schedule |
| `exams/tests.html` | School Admin | Class tests & quizzes schedule |
| `communications/notifications.html` | School Admin | Parent circulars/broadcasts |
| `communications/activities.html` | School Admin | Sports/extracurricular/plantation feed (shown on School Board) |
| `academics/resources.html` | School Admin | Free-category resources — syllabus, books, uniform, exam prep links, etc. (shown on School Board) |
| `finance/fees.html` | School Admin | Fee records per student |
| `finance/finance-center.html` | School Admin | Income, expenses, and daily finance ledger |
| `finance/finance-import.html` | School Admin | Import and review finance documents and bank statements |
| `finance/print-studio.html` | School Admin | Print fee records |
| `attendance/teacher-attendance.html` | School Admin | Mark teacher attendance, ping anyone who hasn't marked their class yet |
| `students/promote-students.html` | School Admin | Year-end bulk/individual class promotion, with automatic pass/fail detection |
| `students/import-students.html` | School Admin | Bulk-import an existing roster from Excel/CSV **or a standard Punjab EMIS/SIS PDF export** |
| `settings.html` | School Admin | Edit school profile, logo, cover photo |
| `portals/teacher/index.html` | Teacher | Attendance, homework, marks, absentee alerts, promotions — own class only |
| `portals/student/index.html` | Student/Parent | Own result, homework, attendance, notices |
| `portals/superadmin/*.html` | Super Admin | Platform-wide login and dashboard |

## Known open items (by design, not oversights)

- **Bulk SMS/WhatsApp** is one-tap-per-parent, not one-tap-for-everyone —
  true bulk sending needs a paid gateway (Twilio, Meta's WhatsApp Business
  API, or a local Pakistani SMS provider).
- **Teacher password reset** isn't wired into the edit form yet — the
  generic update endpoint can't hash a new password; would need a small
  dedicated backend action.
- **One class per teacher account** — a teacher who teaches multiple
  classes currently needs one account per class.
- **Promotion's "Fail" rule is a soft default**, not a hard lock: failing
  students are unchecked and flagged red automatically, but the checkbox
  can still be manually checked to promote them anyway (schools sometimes
  do this on discretion). Say the word if you want it to be a true hard
  block instead — it's a small change.
- **Embedded photos in spreadsheets/PDFs** (an actual floating image
  object, not a URL or base64 text) can't be extracted automatically by
  the bulk importer — add those per-student afterward.
- **Pricing tiers** on the homepage (`?tier=Standard` etc.) aren't
  currently read by `register.html` — every school gets the same account
  regardless of which pricing card they clicked.

## Fixed this round

- **Every admin page now has a working Logout button.** Previously, 12
  pages (`activities`, `date-sheet`, `import-students`, `main-dashboard`,
  `manage-students`, `notifications`, `promote-students`, `report-card`,
  `resources`, `settings`, `teacher-attendance`, `tests`) had no logout at
  all — clicking around trying to find one, then falling back to the
  browser's own back button, is exactly what made navigation feel like it
  randomly dumped you back at the homepage after several clicks. All 15
  admin pages are consistent now.
- **`students/import-students.html` is now actually linked** — there's a "📤 Bulk
  Import" button right in `students/manage-students.html`'s header, plus a card on
  the main dashboard. It had zero navigation entry points before this.
- **`students/promote-students.html` confirmed present** in this package — it
  wasn't on the live site before because it was never actually uploaded,
  not because of a code issue.

## On your live site specifically

A few cleanup items were flagged during earlier fixes that only you can
verify/complete on the live repo:
- Old disconnected demo files that never call the real backend
  (`portals/admin/*`, `portals/teacher/teacher-diary.html`,
  `teacher-grades.html`, `portals/student/student.html`, `student-diary.html`,
  `student-grades.html`) — recommended for deletion.
- A stray capitalized `Index.html` — should be lowercase `index.html` for
  reliable auto-serving on most hosts.
- A `setting.html`/`settings.html` filename mismatch — every link in this
  package points to `settings.html` (plural).


---

## CURRENT PROJECT HANDOVER — 1 November 2026 (teacher management / Apps Script)

**Read this section first in the next chat.** This is the current continuation point, not proof that the production bug is fixed.

### Canonical code and deployment
- Repository: `wajidhussainbalouch-cpu/lamastudio-website`, branch `main`.
- Backend source: `lamastudio-school-suite/backend-api/code.gs`.
- Apps Script editor contains the existing `Master-backend-code.gs` plus other project files. Do not delete them, create duplicate master declarations, run `setup()`, or reset the master registry.
- Current website-configured Apps Script endpoint (verified against `js/api-client.js`):
  `https://script.google.com/macros/s/AKfycbz8Num29Df94i-TNlX4ggN6nveyVLpoPDo4feStMXV3DuAx-JoRD3nZH1Q90kVuEH57/exec`.
- User stated backend API was deployed 31 October 2026. The deployment selected in their Apps Script UI appeared to be version 38; **the live deployed source/version has not been independently verified**.
- Latest confirmed backend commit: `6173f3db8ac0428fb844fe06414e22d127b58708` on 1 November 2026. It adds authenticated `getTeacherManagementBootstrap`, returning `school`, `classes`, `records` (teachers), and `teacherCount` in one school-scoped call. It is a read-only operation and does not change spreadsheet data.

### Outstanding production issue and requirements
- `staff/manage-teachers.html` has shown school name as "School Name", school ID as a dash, a teacher directory that sometimes hangs, and an assigned-class dropdown stuck on "Loading this school's classes…".
- A teacher named Zahid assigned Class 4 and one Class 4 student were seen in other pages; never interpret the failing page as proof records are absent.
- Class choices must come from classes/sections saved in School Settings, **including classes with zero students**. Existing `getSchoolClassOptions` prefers `offeredClassesJson` but falls back to student-derived classes when configuration is empty; verify whether this fallback complies with the owner's latest requirement before release.
- The current teacher-management HTML still invokes `LamaAPI.list('teachers')` and `LamaAPI.getSchoolClassOptions()` separately; it **has not yet been wired to** `getTeacherManagementBootstrap`.
- Next engineering tasks: inspect `js/api-client.js` and `staff/manage-teachers.html`; wire a school-scoped API wrapper and the teacher page to the bootstrap response, with explicit session errors and bounded retries; validate school identity, existing teacher list, offered classes (including empty classes), teacher assignment, and mobile layout. Avoid changing unrelated modules.
- Check that Apps Script editor has the latest backend source and **update the existing Web app deployment version**, preserving the current /exec URL. A GitHub commit alone does not deploy Apps Script. Test live authenticated API results using a legitimate school session without exposing passwords/API keys in chat.
- Status: **backend source committed; Apps Script deployment unverified; frontend integration pending; live end-to-end test pending**. Do not claim success prematurely.

### Owner workflow and data protection
- Owner works on Android mobile. For copying code, give the **exact GitHub file page** URL, not only a raw URL. Android may redirect GitHub links into its app; suggest copying the website URL and pasting it into Chrome manually if needed.
- Do not delete or overwrite existing school records, spreadsheets, student/teacher rows, attendance, settings, registry, Apps Script properties, or deployments. Keep one master registry and school-specific databases.
- Owner requests this Markdown handover be updated after meaningful changes so a new chat can continue from the latest verified state.


### 1 November 2026 follow-up: teacher-management frontend connected
- Commit `6658d0f7c34a83577ee1efb45f69bd1fbac5eb3d`: `js/api-client.js` now exposes `getTeacherManagementBootstrap` and explicitly selects the school session for it.
- Commit `846f949b9d2139a30de5f34344778fa57aa3940e`: `staff/manage-teachers.html` first requests the combined backend result, paints the authenticated school name/logo, fills classes (including empty offerings when configured), and renders existing teacher records. If the live backend is still old, it falls back to the previous endpoints with visible error handling.
- **Important status**: GitHub changes are committed; not yet confirmed live in Vercel or deployed in Apps Script. No live school credentials were available for end-to-end verification. Update the existing Apps Script deployment with `backend-api/code.gs`, retaining the same URL, and verify the authenticated page on mobile. Do not claim the issue is resolved until this succeeds.


### 1 November 2026: authorized teacher-test-data replacement, defensive loading fix
- Owner explicitly authorizes replacement/loss of **test teacher records** across testing schools if required to restore the teacher-management feature; prioritize functioning software. **No data was actually deleted or reset in this update**, and this authorization does not extend to student records, master registry, or other school data.
- Backend commit `f226bae450bd1ee83d18aa67745c9ce53e4cc7f5`: bootstrap now authorizes school first and independently reads school profile, configured class options, and teachers. It returns `warnings` for failures so one broken data source cannot blank the entire page.
- Frontend commit `d3d01314733016a24068b0fa5aca8095d28289fa`: show backend warnings explicitly; do not falsely report zero teachers when their sheet could not be read.
- **Next**: update existing Apps Script Web app deployment with latest `backend-api/code.gs`, verify GitHub/Vercel production build, then test school name, class list, teacher list, create teacher, reload. Still not confirmed end-to-end. Avoid `setup()` and any registry reset.


### 1 November 2026 19:10 PKT: user mobile screenshots show unresolved teacher loading
- Screenshots: placeholder 'School Name' / SCH, school ID '-', 'Loading faculty...' and 'Loading this school's classes...' after user updated Apps Script. These symptoms point to missing school session/initialization or unreachable backend; do **not** assume empty teacher rows caused it.
- Commit `fa26cc07c9fafbbb42a6f6fec3083f5803d5df59` improves missing school ID/API key feedback and adds independent browser error/watchdog diagnostics so placeholders cannot spin forever without a reason.
- Next: verify fresh School portal login yields a valid school session, then retest teacher page. Obtain the exact displayed error; if school identity remains missing, inspect school login response/session persistence and browser script errors. No student or teacher data deleted. Live Apps Script deployment remains unverified.


### 1 November 2026, 21:09 PKT: School Board authentication controls and subscription
- User screenshots show `main-dashboard.html` publicly displays a school ID and placeholder "School Name", while `staff/manage-teachers.html` reports school session missing after multiple sign-outs/sign-ins. A school ID displayed on the public board is NOT proof of an authenticated school session. Avoid blaming teacher sheet or clearing teacher data.
- Main dashboard commits `07e0ac467a4e079375796ae4144e3f182780e839`, `6441cb0649489d4125c09d14cc3fa15b7e1e6356`, `ee0aecdef0772aa07873827fea8544bf55c57f37`: add visible School Login / Logout controls, role-specific school session use, and subscription dialog showing actual `getSubscriptionStatus` values for authenticated schools; unauthenticated users see sign-in guidance and link to index pricing. No backend change required for these buttons.
- **Still outstanding**: independently verify live deployment and authenticated school login session. The school ID in the public board may come from `getMainDashboardData` rather than school authentication. Verify `login.html` actually returns `schoolId` and `apiKey` and stores `lamastudio_session_school`; investigate routing or role confusion if absent. Never expose API keys in screenshots/logs.
