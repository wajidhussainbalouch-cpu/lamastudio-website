# LAMA School Suite — Market Launch Quality Gates
Updated: 25 November 2026. Applies to the existing multi-school School Suite only.

## Policy: no duplicate modules or unverified marketing claims
- Extend **existing** attendance, fee management, examination, planning, Communication Center, and admin/teacher/student portals. Reuse the school-scoped collections and API.
- Keep original school Sheets, accounts, IDs, attendance, fees, certificate and examination history. No production resets, migration or mass deletion for launch polishing.
- Vercel **READY** only verifies a deployment build; it does **not** certify real logins, Apps Script backend compatibility, paid subscriptions, printer hardware, WhatsApp delivery, or tenant isolation.
- Advertise **offline synchronization**, **AI paper automation**, **online payment gateways**, **bulk WhatsApp delivery**, or **fully automated marking** only after independent production acceptance. A UI label, prototype, draft question bank or code in GitHub is not evidence of delivery.

## Fixes implemented during the November 25 quality pass
- `js/attendance-history.js`: a duplicate enrollment number cannot silently map a legacy attendance row to the first matching student; an explicitly unknown student ID is no longer silently reassigned by enrollment. Existing unique legacy ID-less attendance records still match. This is read-only; nothing in the school database was changed.
- Attendance-history asset versions refreshed in existing teacher, communication, monthly register and daily attendance pages.
- `tests/core-regressions.cjs`: reproducible non-destructive Node 22 regression checks for correct-status precedence, missing marks, ambiguous enrollment, stale IDs, duplicate private portal notices, bilingual messages, normalized parent contacts and role isolation.
- `.github/workflows/school-suite-core-regressions.yml`: automated checks on relevant source changes. Check GitHub Actions job success before treating CI as green.
- `dashboard.html`: mobile administrator toolbar uses one compact sticky row, retaining the six existing actions with touch targets and full labels.

## P0 — must pass before commercial rollout to additional schools
- [ ] **Actual backend deployed version**: back up the live Apps Script project, registry and each school-specific spreadsheet; diff ALL deployed Apps Script modules against GitHub. Safely merge only tested changes. Do not replace the live project with a partial repository file.
- [ ] **Authorization**: for at least two different test schools, verify admin, teacher, student and staff accounts cannot read or change another school's information. Test logout, token expiration, browser back, and role-switch on the same Android tablet.
- [ ] **Student roster**: import 300+ representative rows; handle duplicated enrollment, name and father names, missing photo, uppercase/lowercase classes, and rejected entries. Confirm no accidental overwrites/deletions.
- [ ] **Attendance**: mark a class by teacher, verify admin counts and student status; repeat admin to teacher. Test correction, date switching, save/refresh, failed write, QR scanning, holiday rules, Saturday working day, Friday five-period/12:30 closing policy and printed monthly register. Never display unsaved marks as confirmed.
- [ ] **Parent messages**: save an absence; check the selected student's name/class/date/parent number and Urdu/English text; open WhatsApp/SMS; manually send and confirm with the parent. Verify bulk **portal** notice dedupe and private student visibility. App handoff is not automatic message delivery.
- [ ] **Timetable and homework**: verify actual seasonal/Friday hours, teacher assignments, conflicts, class only vs all classes, save/refresh, posted homework and student completion in real accounts. Check A4 print on Android and desktop.
- [ ] **Finance**: preserve legacy fees and pilot ledger separately. Verify fee categories, school modes, receipts, partial/full payments, reversals, duplicate transaction prevention, voucher printing and totals against a test school ledger before enabling a real-money pilot. Never issue live bills in a test.
- [ ] **Exams/results**: verify permissioned paper publication, approval of question content, student-only access, marks and result cards. Do not market question-bank drafts or blueprint prototypes as fully integrated AI assessment.
- [ ] **Mobile/device QA**: verify 360/390/430px Android screens, tablet landscape, desktop widths; sticky header, scrollable tables, consistent button sizes, readable Urdu and print output. Check offline/error states; don't claim offline save without verified queue + sync.
- [ ] **Restore/rollback**: test backup and restore on sandbox copies, never on a production school; keep a known-good version, failure logs and a rollback path.

## Automated acceptance checks
Run from repository root:
```bash
node lamastudio-school-suite/tests/core-regressions.cjs
```
The source-based checks passed in a JavaScript compatibility harness on 25 November 2026. The GitHub Actions workflow was added in this pass; its run status still needs independent confirmation. These tests do not log in to live school accounts, call Apps Script or send messages.

## Release decision
**NOT YET CERTIFIED FOR FULL COMMERCIAL LAUNCH.** Code quality is improving, but the P0 live backend, tenant separation, actual save/refetch, fee ledger, examination and device checks remain unverified. Limited demos/trials should clearly identify unsupported features and retain verified school data. Record the date, device, school test tenant, tester, evidence, result and rollback version for each gate.
