# LAMA School Suite — Attendance Safe-Save Integration Gate
**Prepared:** 14 November 2026, Pakistan time
**Branch:** integration/school-attendance-safe-save-20261114
**Release status:** DRAFT / NO-GO for unrestricted commercial launch

## Scope
This branch combines previously separate draft work:

1. Student and teacher attendance Add requests use the same Apps Script lock, unique person/date checks and idempotent retry behavior, refusing historical duplicates and conflicting statuses.
2. Teacher portal refuses a failed history load, refuses duplicate person/date rows, submits changed statuses only, reloads and verifies every accepted write, and holds further writes on an uncertain outcome.
3. School Board shows saved Saturday attendance in teacher trends and avoids assuming all weekends are holidays; it differentiates Present among marked and Register completion.

This draft did NOT change live school records, Google Sheets, website production or published Apps Script.

## Integration/rollout gates
- The broader draft PR #97 fast-bulk teacher attendance and token routing changes are NOT part of this combined branch. They need separate conflict resolution and test-school validation.
- Require green integrated CI, existing policy checks, code review and a signed off backup/restore plan.
- Back up affected trial school workbooks. Review historical duplicate student/date and teacher/date combinations, especially conflicting statuses. Preserve original audit history; never silently delete rows.
- Record the published Apps Script deployment/version and verify code.gs is deployed into the existing authorized Apps Script project. Vercel deployment does not update Apps Script.
- Test school: save new student mark, confirm one row, simulate timeout and retry, confirm same row, then update to Absent and confirm no second row.
- Verify class-only student selection, counts, follow-up and dashboard agree after reload.
- Test teacher Present and Leave marks, two simultaneous devices for both student and teacher, and server readback.
- Test outage and uncertain response: prevent repeat submissions until confirmed by administrator.
- Test school A vs school B access, class and section isolation, token expiry and logout.
- Test operating Saturday at a working school and a closed school. The chart faithfully displays saved records, while working-day policy is configured separately.
- Gradual release: one backed-up school, then two additional schools, then trial cohort.

## Release checklist
- [ ] Integrated CI and review
- [ ] Verified backups and tested restore procedure
- [ ] Existing duplicate records reconciled with audit trail
- [ ] Exact Apps Script deployment version confirmed
- [ ] Teacher/admin save, readback, timeout and concurrent requests passed
- [ ] Multi-school permissions and class/section scoping passed
- [ ] Saturday school settings validated
- [ ] No high-severity errors during representative trial

Until complete, do not merge into main or deploy to all schools.
