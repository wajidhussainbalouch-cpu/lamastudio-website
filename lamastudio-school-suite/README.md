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
6. Upload everything else in this folder to your web host, **keeping this
   exact folder structure** — `assets/`, `js/`, `portals/` all need to stay
   where they are relative to the root pages.

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
| `manage-students.html` | School Admin | Full roster: add/edit/delete any student |
| `manage-teachers.html` | School Admin | Add/edit/delete teacher accounts |
| `result-card.html` | School Admin | Official result card generator, per student |
| `report-card.html` | School Admin | Behavioral/teacher evaluation report |
| `date-sheet.html` | School Admin | Exam schedule |
| `tests.html` | School Admin | Class tests & quizzes schedule |
| `notifications.html` | School Admin | Parent circulars/broadcasts |
| `activities.html` | School Admin | Sports/extracurricular/plantation feed (shown on School Board) |
| `resources.html` | School Admin | Free-category resources — syllabus, books, uniform, exam prep links, etc. (shown on School Board) |
| `fees.html` | School Admin | Fee records per student |
| `teacher-attendance.html` | School Admin | Mark teacher attendance, ping anyone who hasn't marked their class yet |
| `promote-students.html` | School Admin | Year-end bulk/individual class promotion, with automatic pass/fail detection |
| `import-students.html` | School Admin | Bulk-import an existing roster from Excel/CSV **or a standard Punjab EMIS/SIS PDF export** |
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
- **`import-students.html` is now actually linked** — there's a "📤 Bulk
  Import" button right in `manage-students.html`'s header, plus a card on
  the main dashboard. It had zero navigation entry points before this.
- **`promote-students.html` confirmed present** in this package — it
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
