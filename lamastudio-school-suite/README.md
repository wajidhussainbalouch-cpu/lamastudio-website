# LamaStudio School Suite — Project Operations Guide

> Last reviewed: 2026-10-26. This guide describes the GitHub source and safe maintenance procedure. **A GitHub commit is not an Apps Script deployment.** Production functionality must be tested before release.

## Project ownership and scope

- Public website: https://lamastudio.pk
- GitHub source: https://github.com/wajidhussainbalouch-cpu/lamastudio-website
- School Suite root: `lamastudio-school-suite/`
- Backend source: `backend-api/code.gs` plus additive Apps Script modules in `backend-api/`
- Shared frontend API: `js/api-client.js`
- Intended architecture: one Apps Script web-app deployment, one Master Registry, separate Google Sheets for each school.
- Primary data-safety rule: **never overwrite, truncate, delete, or re-create an existing school spreadsheet or Master Registry during a code update.**

## Android home-screen app entry and school branding

- One installable **Lama School Suite** PWA icon, not separate Android apps for each module.
- Manifest `start_url` points to `portal-login.html`, which offers **Student & Parent**, **Teacher**, and **School Admin** choices, plus school registration and school-owner login.
- After school-owner login, the chooser displays the school's saved name and logo when available. Upload/change the school logo through `settings.html`. A generic icon is shown when no school has been selected.
- The home-screen app icon is **the platform Lama School Suite icon**. A per-school dynamic Android launcher icon is **not implemented**; the selected school's logo is shown **inside the app**. This distinction is important because a single PWA manifest cannot automatically switch installed icons for different accounts.
- Role pages retain their existing authentication. Simply choosing a role does not create an account or grant access.
- **Not yet deployed or verified on Chrome Android.** Test the manifest, icon assets, installation, start URL, and post-login logo rendering on the live site after approval.

## Source of truth and backups

1. Use the current GitHub `main` branch as the reference for production source, but verify the actual deployed Apps Script version before changing it.
2. Make changes in a dedicated feature/audit branch; review the diff and test before merging.
3. Before changing the live backend, back up the Apps Script project, Master Registry, and affected school databases. Preserve spreadsheet IDs, Script Properties, and the existing web-app deployment ID/URL.
4. Never delete an HTML, JS, CSS, or Apps Script file just because it looks duplicated or unused. First check inbound links, imports, dynamic navigation, Apps Script references, and published URLs. Prefer temporary deprecation and redirects.
5. Do not commit credentials, OAuth callback URLs, session tokens, API keys, or personal student data.

## Google Drive organization

The intended master workspace is [LAMA STUDIO — MASTER](https://drive.google.com/drive/folders/1BRvvC_byN89huaARPuL0SJx6rdSreSnV):

| Folder | Purpose |
| --- | --- |
| [01 — Apps Script Projects](https://drive.google.com/drive/folders/1tG-vUnE6HswBiK74nAKWGrmsu5Kg-hDe) | Script project documentation and exports |
| [02 — School Databases](https://drive.google.com/drive/folders/1H9U1a1fbNewbpQMwr8AGbQ3xLC27Tq02) | Master Registry and school database files |
| [03 — LamaSky and Android Apps](https://drive.google.com/drive/folders/19vu9kg7y9w7luPkawVwTttiMJHyoaWin) | Android app-related assets |
| [04 — Backups and Archives](https://drive.google.com/drive/folders/14dAGIeGsJR97KfCU62JklPLXjQ6xOyPO) | Timestamped backups |
| [05 — Documentation](https://drive.google.com/drive/folders/14oAOfTZXMy7WtrOuB44aBl_tN2iNet5x) | Operations notes and architecture |

**Important:** The existing `createSchoolSheet()` implementation uses `SpreadsheetApp.create()`. This creates a spreadsheet but **does not explicitly move it to folder 02**. Folder placement must be implemented and tested separately. Do not assume that a spreadsheet found in Drive is already wired to the registry. The registry's `sheetId` must refer to the actual native Google Sheet, not an exported `.xlsx` copy.

## Current application entry points

| Role or area | Path | Responsibility |
| --- | --- | --- |
| LamaStudio public website | repository-root `index.html` | Public marketing and product navigation |
| School Suite public entry | `index.html` | Suite information and login entry |
| New school registration | `register.html` | Create a school account and school database |
| Existing school owner | `login.html` | Log in to existing school; **must not create a new sheet** |
| School administration | `dashboard.html` | School-scoped administration |
| School Board | `main-dashboard.html` | Display published school information; not a public editing surface |
| Teacher/student sign-in | `portal-login.html` | Role-specific authentication |
| Teacher portal | `portals/teacher/index.html` | Assigned-class workflows |
| Student portal | `portals/student/index.html` | Student-specific records |
| Super Admin | `portals/superadmin/` | Platform-wide administration |
| Student roster | `students/manage-students.html` | Student records |
| Student import | `students/import-students.html` | Preview and controlled import |
| Teacher management | `staff/manage-teachers.html` | Teacher records |
| Attendance | `attendance/` | Student and teacher attendance |
| Academic materials | `academics/` | Resources and reports |
| Exams and results | `exams/` | Tests, datesheets, results |
| Notices and events | `communications/` | Published notices and activities |
| Fees and finance | `finance/` | School finance records |

Some older portal filenames and alternate pages also exist. **They are not authorized for deletion** until link/dependency checks are complete.

## Backend database contract

- `REGISTRY_SHEET_NAME = 'Schools'`; `REGISTRY_HEADERS` defines required registry columns.
- `MASTER_SHEET_ID` is held in Apps Script Script Properties. Preserve it.
- Each registry row maps `schoolId` to `sheetId` and school credentials/status.
- `COLLECTIONS` in `backend-api/code.gs` defines the per-school tabs and headers. Append missing headers without reordering or dropping existing data.
- Registration currently calls `registerSchool()` -> `createSchoolSheet()` -> registry append.
- Existing school login calls `loginSchool()` and should reuse the stored `sheetId`.
- Registration folder placement, concurrent signup handling, and recovery from partially completed signup require additional verification before being called production-ready.
- School data must be isolated by authorized `schoolId` and role. Client-side hiding is not authorization; enforce permissions in Apps Script.
- Existing student records with missing enrollment numbers must not be silently dropped during import. Show a preview, detect duplicates, preserve original source rows, and report counts.

## Safe Apps Script setup and updates

### Existing installation (normal case)

1. **Do not create another Apps Script project or run `setup()` as an update step.**
2. In Apps Script > Project Settings > Script Properties, confirm that `MASTER_SHEET_ID` points to the correct existing native Google Sheet. Do not paste or expose its secret values publicly.
3. To configure or rotate super-admin credentials, set a temporary Script Property `SUPERADMIN_SETUP_PASSWORD` to a new unique password of **at least 12 characters**. Run `setupSuperAdmin()`; the function stores its hash and deletes the temporary property. Run `checkSuperAdminSetup()` to verify configuration. **A previously committed plaintext password must be considered exposed and rotated.**
4. Confirm all additive `.gs` modules are in the **same Apps Script project** and that there is only one intended `doGet`/`doPost` entry-point pair.
5. Update the **existing** deployment: Deploy > Manage deployments > Edit > New version > Deploy. Preserve the existing `/exec` URL.
6. Verify `js/api-client.js` still points to the correct `/exec` endpoint.
7. Test an existing school login and read-only queries before attempting new registration or any write.

### Brand-new installation only

A brand-new installation may run `setup()` once to create a Master Registry. Do **not** do this for the existing LamaStudio environment. Set up super-admin credentials separately via Script Properties as above. New deployments should use the approved access and execution configuration after reviewing security and data privacy.

## Registration acceptance checks (not yet certified)

- [ ] New school creates **exactly one** native Google Sheet.
- [ ] The new sheet contains all required collection tabs.
- [ ] The registry receives exactly one row with the correct `schoolId` and `sheetId`.
- [ ] The new sheet is stored in the intended Drive school-database folder.
- [ ] Repeat signup with the same email does not create another sheet.
- [ ] Existing school login never creates or replaces a sheet.
- [ ] Partial failure can be recovered without losing data or creating duplicates.
- [ ] Simultaneous registration requests do not create duplicate accounts.
- [ ] Existing schools retain their original sheet IDs and records.
- [ ] School A cannot access School B's private records.
- [ ] Published School Board data can be viewed without exposing admin-only editing.


## Question Paper Studio (review branch feature)

- Page: `exams/question-paper-studio.html`, linked from `exams/tests.html`.
- Paper setup: school, class, subject, date, title, time, marks, language (English/Urdu), syllabus chapters and division (chapter-wise, selected, half-book, full-book, custom).
- Question types: MCQ, true/false, fill-in-the-blank, short and long; per-question marks and optional answer key.
- Output: A4 printable paper, answer key, individual result preview and participation/achievement certificate.
- Draft storage: **browser session only**; export JSON for durable backup and import later. **Not yet connected to Google Sheets, student result records, certificate verification, or automated grading.** No backend schema migration is needed for this draft feature.
- Urdu output depends on available device fonts; verify print rendering on a printer/PDF viewer before production use.
- Release checklist: verify school-admin login, navigation, mobile layout, Urdu RTL, paper printing, JSON import/export, and isolation from existing Tests records.


## Admissions, syllabus planning and assessment roadmap

This is a **broader school academic workflow**, not only admission testing. All teacher capabilities are **default-deny** and individually granted/revoked by the school's administrator. Backend enforcement is mandatory before exposing teacher actions.

| Module | Administrator responsibilities | Optional teacher permissions |
| --- | --- | --- |
| New admissions | Configure admission form, eligibility, required documents, applicant status, approval and enrollment | `admissions.viewApplicants`, `admissions.enterApplication`, `admissions.review`; **final approval remains admin-only** |
| Syllabus | Define academic session, class, subject, book, chapters, units, learning outcomes | `syllabus.plan`, `syllabus.divide`, `syllabus.view` |
| Syllabus division | Divide into chapter, half-chapter, full-chapter, selected chapters, half-book, full-book, weekly/monthly/term segments | `syllabus.divide`, `syllabus.assign` |
| Assessments | Configure admission, chapter-wise, half-chapter, full-chapter, half-book, full-book, weekly, monthly, term and practice papers | `assessments.create`, `assessments.edit`, `assessments.print` |
| Question bank | Curate syllabus-tagged MCQ, true/false, fill-in, short and long questions; set difficulty and marks | `questions.create`, `questions.edit`, `questions.view` |
| Results | Approve grades, final results, admissions decisions and published reports | `results.enterMarks`, `results.viewAssigned`; publishing is admin-only |
| Certificates | Approve templates, issuance and revocation | `certificates.prepare`, `certificates.printDraft`; issuance is admin-only |

### Proposed persistent records (additive only; not yet implemented)

- `Applicants`: application ID, school ID, applicant details, guardian, applied class, submitted date, status, admission decision and reviewer.
- `TeacherPermissions`: school ID, teacher ID, permission key, grant/revoke state, administrator ID, timestamp.
- `SyllabusPlans`: school ID, academic session, class, subject, book, chapter/unit, portion (first half, second half, full), learning outcomes, scheduled date and assigned teacher.
- `QuestionBank`: school ID, syllabus plan/chapter ID, language, category, difficulty, question, options, answer key, marks, author and review state.
- `ExamPapers`: school ID, purpose, coverage, selected question IDs, version, publication status, creator and approver.
- `ExamResults`: school ID, paper ID, applicant/student ID, obtained marks, examiner, moderation and publication status.
- `Certificates`: school ID, recipient ID, certificate type, issuer, unique verification code and revocation state.

**Safety:** Do not store applicant records in `Students` until administrator approval. Do not migrate or overwrite existing `Tests`, `DateSheet` or `Students` data. Only append new tabs/columns after a reviewed migration and backup. Never trust client-supplied teacher permission flags.

### Example papers

The review-branch `exams/question-paper-studio.html` includes two optional **demonstration-only** paper templates: an English General Science model paper and an Urdu sample paper. It now supports half-chapter and full-chapter coverage in addition to half-book/full-book. These are illustrative questions, **not verified against a particular Punjab textbook edition**. The teacher-permission backend, admissions records, persistent question bank and school-wide result ledger are still pending.

### Admission-test teacher permissions (required before teacher rollout)

- School administrators own admission-test settings and decide which individual teachers may create, edit, preview, print, or manage admission tests for newly applying students.
- **Default deny:** teachers have no admission-test permission until the school administrator explicitly grants it. Revocation takes effect for subsequent requests.
- Scope every grant by `schoolId` and `teacherId`; never infer permission from a teacher's ability to log in, an assigned class, or a hidden/shown frontend button.
- Backend must verify authenticated role, school ownership, and explicit permission on every protected admission-test API action. Teacher requests must never alter another school's tests or permissions.
- Suggested permission keys: `admissionTests.create`, `admissionTests.edit`, `admissionTests.print`, `admissionTests.viewResults`. Admin-only actions include granting/revoking permissions and publishing final admission decisions.
- Keep admissions applicants and admission-test results separate from enrolled student records until an administrator explicitly approves admission. No automatic student creation.
- **Current implementation status:** specification only. The existing Question Paper Studio is school-admin-only and browser-session-based. Do not expose it to teachers or claim backend enforcement is live until the backend, permission-management UI, and tests are implemented and verified.

## Pre-deployment verification

- [ ] Compare current branch to `main` and review every changed file.
- [ ] Run link checks for relative paths, scripts, styles, and assets.
- [ ] Check mobile navigation and every role's login/logout behavior.
- [ ] Confirm `main-dashboard.html` is display-only for published content.
- [ ] Verify school registration and role permissions against a **test school**.
- [ ] Test import preview, missing enrollment numbers, duplicate prevention, and repeat uploads.
- [ ] Verify subscriptions, blocked accounts, and non-destructive expiration handling.
- [ ] Back up production registry and school Sheets; record a rollback point.
- [ ] Merge approved changes, then separately deploy Apps Script using its existing deployment.
- [ ] Record date, commit SHA, Apps Script version, and test results.

## Known risks and pending audit

- Historical README instructions about editing `SUPER_ADMIN_PASSWORD_PLAINTEXT` were outdated and unsafe; do not follow them.
- Older backend source exposed a hard-coded super-admin password. The source fix alone does **not** rotate a deployed credential.
- Backend comments identify legacy student portal passwords as plaintext; review and migrate securely before claiming production-grade authentication.
- Teacher password-reset workflow, pricing-tier registration mapping, and multi-class teacher support need independent verification.
- Embedded images in some uploaded PDFs/spreadsheets may not be importable automatically.
- A full navigation and unused-file audit is still pending. No old portal or demo file is approved for deletion.
- Never assume that the GitHub `main` branch, Codespaces working tree, and currently deployed Apps Script are identical.

## Change log

| Date | Area | Change | Status |
| --- | --- | --- | --- |
| 2026-10-26 | Documentation | Replaced outdated setup instructions with source map, Drive folder map, safety policy, and deployment checklist | GitHub review branch |
| 2026-10-26 | Backend authentication | Removed embedded super-admin password from `code.gs`; setup now reads temporary Script Property | GitHub review branch; **not deployed** |
| 2026-10-26 | School registration | Documented folder-placement and idempotency requirements | Audit pending; **not claimed fixed** |

**Production rule:** no destructive cleanup, registry replacement, school database reset, or deployment without review and verification.
