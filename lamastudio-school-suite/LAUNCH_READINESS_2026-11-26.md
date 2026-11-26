# LAMA School Suite — Market Launch Readiness
Review date: 26 November 2026
Status: **NOT YET CERTIFIED FOR FULL MARKET LAUNCH**. Core source code is being hardened; live backend and real-device acceptance remain required.

## Product scope — finish before adding features

One existing multi-school ERP: School Admin, Teacher and Student/Parent portals; school registration; student directory/import/admissions; teacher/student attendance; timetable, calendar and working-week policy; homework diary; lesson plans; parent follow-up; school notices; reports/printing; fees (private/government mode); tests/results. No duplicate dashboard, communication, fee, or examination subsystem should be created.

Do not advertise optional examination, Smart Marker, AI textbook automation, offline payment processing or automated WhatsApp as fully functional until their separately scoped end-to-end gates pass.

## Release blockers and acceptance

| Priority | Existing workflow | Source status | Release acceptance — must be demonstrated |
| --- | --- | --- | --- |
| P0 | Role isolation + private notifications | Source hardening in `backend-api/code.gs` and retained snapshot; 17 fixture cases per source passed | Two schools, two classes, two students and two teachers: deny unrelated private notifications; verify deployed Apps Script responds with the intended scoping. No cross-tenant exposure. |
| P0 | School registration and administrator login | Implemented frontend and backend actions; login affected earlier message workflows | Fresh school registration → approval → activation → owner/admin login, logout, password reset; test no stale role/token leak on the same phone. |
| P0 | Attendance save / refresh / edit | Existing student, teacher and admin registers; history regression scenarios passed | Two classes, 10+ saved records, mixed absent/present/leave, edit a mark, reload; teacher/admin/student views agree. No missing records, no duplicate writes, clear success/error state. |
| P0 | Parent follow-up and school notices | Shared manual Urdu/English messaging and bulk private portal notices exist; source duplication checks passed | Saved absence shows correct parent contact; manual WhatsApp/SMS requires actual Send; private portal notice appears **only** for that student's account; corrections suppress obsolete alerts; no duplicate notices on retry. |
| P0 | Deployed Apps Script consistency | **NOT VERIFIED** | Back up the entire active Apps Script project, Script Properties, school Sheets and deployment ID; compare with modular source before selectively publishing. Never replace the deployed project with the older retained master snapshot. |
| P1 | School working week, Friday and seasonal hours | Existing shared helper; regression cases for Friday five periods, no break, 12:15–12:30 activity passed | Publish winter/summer hours and Friday (working); teacher, student, admin and print show identical P1–P5 + activity, no Friday P6/P7. Saturday works according to school policy. |
| P1 | Homework diary and completion | Existing teacher batch, student diary and progress views | Teacher posts 7 subjects in one save; both portals and printed register show all; checkbox progress saves per student and remains after refresh. |
| P1 | Enrollment/import and data integrity | Existing import preview/dedup screens | Two schools' records remain isolated; PDF/Excel preview, duplicate IDs/enrollment, failed import and retry produce auditable added/updated/skipped/rejected counts without overwriting existing fields. |
| P1 | Mobile UX and print | Dashboard, responsive menus and A4 registers exist | Test Android phone + tablet at 320/360/412/768px; no clipped buttons or invisible controls; print A4 with Urdu legible, school header/page breaks correct. |
| P1 | Finance policy and ledgers | Legacy fee tools exist; new ledger is **pilot gated** | Never claim paid/partial/overdue based on unrelated legacy records. Verify policy and school mode, receipts, partial/full payments, duplicate retry, reversal, sandbox Apps Script and audit before enabling pilot for even one school. |
| P2 | Lesson planner, assessment, examination | Some live UI and isolated prototypes; complete examination system **not certified** | Approve versioned syllabus/question bank; secure paper generation, mark entry, results, teacher/student permissions and PDF; no answer-key leakage. |
| P2 | External WhatsApp / online payment / offline operations | **Not established as complete** | Meta opt-in + approved templates and actual delivery evidence; real gateway reconciliation; safe offline sync with conflict and idempotent payment handling before advertising. |

## Safe verification sequence

1. Freeze new feature development until P0 regressions are stable.
2. Use a disposable test school, not real parent contacts, for role / privacy / attendance / notice checks.
3. Save an exact snapshot of the deployed Apps Script and each active school Sheet before backend changes. Protect owner credentials and students' personal data.
4. Run read-only fixture checks:
   - `node lamastudio-school-suite/tests/notification-visibility.test.cjs`
   - `node lamastudio-school-suite/tests/core-attendance-regression.test.cjs`
5. Compare all live API actions to their checked-in source; deploy the reviewed full Apps Script project as a **new version**, not a partial replacement, and retain the rollback version.
6. Test end-to-end role scenarios using separate logins/devices, including a correction and re-open of a previously absent student's private alerts.
7. Verify live Vercel alias/version, mobile/tablet layouts and printable A4 before onboarding a new paying school.
8. Record PASS / FAIL / NOT TESTED with date, school (test ID only), browser/device, GitHub commit, deployed Apps Script version, and screenshots without private student data. Any P0 FAIL blocks marketing claims of a complete ERP.

## Source hardening delivered 26 November 2026

- Shared notification visibility now denies teacher/admin notices to students, other students' private alerts, unknown audiences, and other classes/sections; teachers cannot list another class's private student notifications.
- Teacher-authored class notice payload is server-scoped to assigned class/section (teacher cannot forge `studentId`/audience in the generic notification write).
- Retained older Apps Script snapshot has equivalent visibility guards for reference, **but remains incomplete and must not be published wholesale**.
- `tests/notification-visibility.test.cjs`: 17 cases against each backend snapshot; read-only source fixtures.
- `tests/core-attendance-regression.test.cjs`: saved identity and date handling, corrected attendance, consecutive absence, notices deduplication, Friday policy, read-only fixtures.
- GitHub Actions: `.github/workflows/lama-school-suite-privacy-check.yml` triggers source tests on relevant commits. Workflow execution status still requires checking GitHub.
- These changes are to GitHub source only. **Vercel READY does not deploy Google Apps Script**. No live student records or parent messages were modified by this review.

## Rule for launch claims

**Ready for invited pilot** means an explicitly scoped school and feature set passed P0 tests. **Ready for public commercial launch** requires all advertised features to have current end-to-end evidence. If an optional feature remains pilot/preview, hide it or visibly identify its limitation; never sell it as fully functioning.
