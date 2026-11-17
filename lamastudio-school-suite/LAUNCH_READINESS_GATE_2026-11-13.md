# LAMA School Suite — Launch Readiness Gate
**Audit date:** 13 November 2026 (Asia/Karachi)  
**Recommendation:** **NO-GO for unrestricted commercial launch**; continue controlled trials with verified backups.  
**Scope:** LAMA School Suite on www.lamastudio.pk, Google Apps Script, and school-specific Google Sheets.

## Evidence established
- Public Vercel production alias `www.lamastudio.pk` points to a **READY** build of GitHub commit `f575b3252723281abf16abd3df6a3cca6aeff835`. This proves website deployment, **not** the version of the separately deployed Apps Script.
- The two visual fixes (full *Subscription* / *Log out* labels and Studio SVG seam) are in that production commit.
- Previously read-only inspected one authorized trial school's spreadsheet (local timezone Asia/Karachi). Student attendance for 12 Nov 2026 was 1 absent of 3 enrolled; staff attendance was 1 present and 1 leave out of 2. No duplicate student/date or teacher/date on that exact date.
- Earlier November historical records in the inspected rows 2–100 contained **24 excess student attendance rows across 6 duplicated student/date combinations**, and **8 excess staff attendance rows across 4 duplicated teacher/date combinations**. There was at least one student/date combination with conflicting statuses. These counts are **limited to the inspected range**, not a claim about the entire workbook or all trial schools.
- No original Google Sheets records were edited, deleted, or reconciled in this audit.
- Vercel serverless runtime errors showed no recent entries in the available query; that does **not** prove the separate Apps Script API or client browser is error-free. Measured real-user p75/p95 loading and saving latency remains unavailable.

## Release blockers (P0)
| Gate | Current state | Required proof |
|---|---|---|
| Data integrity | Historical duplicate attendance exists; older generic `addRecord` appends rows without atomic uniqueness | Back up each affected Sheet; review person/date duplicates with administrator, document canonical records, reconcile without losing audit history; re-count |
| Teacher portal save/read | Live teacher portal can treat failed history reads as empty and present POST success without read-back | Draft PR #107 is GREEN on synthetic failure tests and Vercel preview READY; release only after real backed-up school read/add/update/refresh/offline-error test |
| Backend simultaneous writes | Apps Script generic student and staff attendance Add routes lack locked uniqueness on deployed backend | Draft PR #108 implements ScriptLock and duplicate-safe idempotent create for both, validated by fake Sheets regression; deploy to same existing Apps Script project and verify its published version |
| Admin teacher-attendance auth | Token-only administrator and saved teacher attendance history have previously disagreed | Resolve and integrate draft PR #97, including Apps Script and frontend changes; verify teacher and admin access from 2 different schools without leaking records |
| Multi-school safety | Not tested end-to-end under simultaneous independent school logins in this review | Verify school ID separation, class/section scoping, teacher permissions, forbidden cross-school IDs and correct logout/session lifecycle |
| Recovery | No verified backed-up rollback/reconciliation exercise for this release | Copy and verify a trial-school Sheet, document restore procedure and validate no double write after network timeout |

## Important nonblocking work (P1)
- **Performance:** Avoid whole-history attendance fetches on each screen if daily snapshots are available. Instrument Apps Script and frontend request latency and errors. Proposed release benchmarks (not currently achieved measurements): 20 consecutive representative saved attendance tests with no lost/duplicated rows; acceptable network and school-size p95 times agreed in advance; safe failure and retry messaging.
- **Dashboard consistency:** Show both *attendance rate among marked students* and *register completion percentage* with different labels. A date with 1 Absent and 2 Unmarked has 0% present among marked but 33% marking completion.
- **Teacher portal:** Ensure post-save summaries, absentees, and weekly history use the same school-local date and server-verified data. The new PR #107 does this in a draft.
- **Parent follow-up:** Confirm guardian numbers are available and only claim *contacted* after real school action. Do not represent WhatsApp preparation as automatic delivery.
- **Admissions and optional pages:** Mark unimplemented pages honestly and do not sell unreleased modules as complete.
- **Mobile and PWA:** Retest Chrome, Android PWA, portrait layouts, class links, Copy ID, theme, subscription and logout; do not re-enable unreliable offline attendance sync.

## Acceptance checklist for an actual test school
1. **Back up** and retain the original Google Sheet with timestamp before changing code or reconciling history.
2. Validate published Apps Script `Code.gs` and any helper files use the expected commit/version; Vercel deploy alone does not update Apps Script.
3. School Admin marks one existing unmarked student **Present**; wait for *Saved and verified*. Reload. Confirm exactly one student/date row exists and dashboard, teacher, class and parent views agree.
4. Update that same saved student to **Absent**. Confirm the single existing row changes, a new row is **not** created, and follow-up appears only after successful verification.
5. Save a complete class of representative size and refresh. Confirm class totals = Present + Absent + Leave + Unmarked; test both individual class selection and All classes.
6. Save two teachers with distinct statuses; reload administrator and staff dashboards. Verify each teacher/date has one saved row and correct remark.
7. Simulate a lost connection **after submitting**; do not retry blindly. Reload when online and prove the record was either confirmed or remains safely unresolved.
8. Simultaneously submit attendance from teacher and administrator devices; verify lock/uniqueness prevents duplicates.
9. Repeat with two separate schools. Confirm data, alerts, class lists, staff and parent portal details do not cross school boundaries.
10. Test Saturday according to each school's working-day settings. Confirm PWA cached pages never present unverified attendance as fresh data.
11. Keep a daily sample monitoring log (load times, save time, timeout count, duplicates, school/session IDs *without secrets*) for the trial cohort.
12. Promote changes gradually: one backed-up test school, then two more schools, then all trials. Pause rollout on any unverified save or duplicate.

## Related code reviews
- [PR #97](https://github.com/wajidhussainbalouch-cpu/lamastudio-website/pull/97): broader attendance recovery and administrator-token routing — **draft**, paired backend integration needed.
- [PR #107](https://github.com/wajidhussainbalouch-cpu/lamastudio-website/pull/107): teacher portal school-local dates, fail-closed saves and read-back verification — **draft**, synthetic CI passed.
- [PR #108](https://github.com/wajidhussainbalouch-cpu/lamastudio-website/pull/108): Apps Script legacy student and teacher attendance atomic add — **draft**, synthetic CI passed.
- [PR #105](https://github.com/wajidhussainbalouch-cpu/lamastudio-website/pull/105): website mobile labels and Studio SVG — merged and deployed.

**Release decision:** Core pages and visual updates may remain live for existing controlled trials. Do not call the entire ERP **launch-ready** until the P0 items have been demonstrated on live Apps Script and backed-up Google Sheets without discrepancy.
