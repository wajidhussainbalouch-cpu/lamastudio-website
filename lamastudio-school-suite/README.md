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

## 4. Work in GitHub but NOT deployed

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

## Setup (do this first)

1. [script.google.com](https://script.google.com) → New project → paste in
   `backend-api/code.gs`.
2. Run `setup` once (top toolbar → function dropdown → `setup` → Run).
   Approve permissions. This creates your **Master Registry** spreadsheet.
3. Near the top of the file, change `SUPER_ADMIN_PASSWORD_PLAINTEXT` to your
   own password, then run `setupSuperAdmin` once.
4. Deploy → New deployment → **Web app** → Execute as **Me** → Who has
   access **Anyone** → Deploy. Copy the URL ending in `/exec`.
5. Open `js/api-client.js`, find `const API_URL = '...'` near the top, and
   replace the placeholder with that URL.
6. Upload everything else in this folder to your web host, keeping the
  directory structure: shared `assets/` and `js/` stay at the suite root,
  student workflows live in `students/`, academic pages live in `academics/`,
  examination pages live in `exams/`, Communications pages live in
  `communications/`, Attendance pages live in `attendance/`, Staff pages live
  in `staff/`, Finance pages live in `finance/`, and role-specific pages stay
  in `portals/`.

To update the backend later: Apps Script → Deploy → Manage deployments →
pencil icon → New version → Deploy. This keeps the same URL, so you never
need to touch `api-client.js` again after the first setup.

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
