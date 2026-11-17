# LAMA School Suite — Two-way Attendance Release Gate (17 Nov 2026)

**Branch / PR:** `release/attendance-cross-portal-staging-20261117` / #115  
**Scope:** one shared attendance register for School Admin and assigned Class Teacher, including selected-class and all-school admin views.  
**Status:** **DRAFT / NO LIVE DEPLOYMENT YET**. Eight synthetic CI workflow checks are green. This does not constitute a tested Google Sheets or Apps Script deployment.

## Verified in code / synthetic tests
- School Admin's saved Present / Absent / Leave appears on Class Teacher's assigned-class register after a verified attendance reload.
- Class Teacher's corrected saved mark appears in School Admin's selected class and All classes registers after reload.
- Counts are separately reported for selected class and All classes; completion is based on marked students, not a guessed whole-school rate.
- The teacher's view uses a school-local day for native Google Sheets UTC timestamp strings.
- Teacher may only read/write their assigned class and section; school admin retains authorized whole-school view.
- Explicit Edit attendance; changed marks only; bulk write and readback; no silent auto-retry on uncertain write.
- Duplicate/conflicting saved rows are never silently overwritten; ambiguous marks require administrator review.
- Bounded batch response, attendance readback, Saturday config, boys/girls totals, prior-day calendar, and optional student photos.

## Critical verification needed before production
1. **Check the exact published Apps Script version** in the existing *Lamastudio School DB* project. Vercel production deployment does not publish Apps Script; the backend `code.gs` and `bulk-attendance-backend.gs` must be deployed together as the tested version. Preserve other existing Apps Script project files.
2. **Back up each trial school's entire Google Sheet**, record backup time, and prove the backup/restore path. Do not overwrite, remove, or reconcile historical rows automatically. Preserve audit history and privacy.
3. **Read-only inspect existing Attendance sheets**, identify duplicate student/date, staff/date and conflicting-status rows before running new tests. The previously inspected sample contained historical duplicates. Block ambiguous rows, not legitimate records.
4. Test **School Admin → Teacher:** on the backed-up test school, admin selects Class 4, saves one Present and one Absent. Teacher of that class opens attendance for that date, taps Verify, and sees statuses and **Attendance completed** only if all students in that class were marked.
5. Test **Teacher → School Admin:** teacher corrects Absent → Present using Edit attendance. Admin opens Class 4, then All classes, refreshes, and sees the corrected mark. Exactly one student/date row must exist.
6. Repeat with another class, including **Playgroup**, and with the entire school. A teacher of Class 4 must never see another class.
7. Correct Present → Absent; verify student/parent notice is created or updated only after saved record verification. No false claim that WhatsApp was delivered.
8. Test **two devices and concurrent writes** to the same student/date, Apps Script ScriptLock, and teacher/school sessions. Record any unexpected status changes; do not assume test data isolation from shared production.
9. Simulate read timeout / write response lost on 4G. The UI must retain selected marks, display uncertain outcome and **not retry automatically**. Inspect the Sheet before allowing a new save.
10. Test Saturday allowed at a working school, configured holidays, a failed calendar fetch, and historical dates.
11. Confirm all eight GitHub Actions workflow checks green **on the exact merged commit**, and a matching Vercel deployment READY. Do not rely on a preview built from an older SHA.
12. Roll out to one backed-up trial school, then two others, then the trial cohort, monitoring saved rows, readback, duration and browser errors.

## Rollback (must be rehearsed)
- Keep the previous `main`/Vercel production deployment identifier and previous Apps Script deployment/version.
- If any cross-portal mismatch is observed, stop new attendance writes, preserve current school rows/audit, restore the previous published Apps Script version and previous website deployment in coordination. Never delete recent saved student marks simply to recover software.
- Record the affected school/date/student ID **in authorized admin logs only**; do not paste student identity details into public GitHub issues.

## Connected Sheets verification status
A read-only Drive discovery found relevant school spreadsheet candidates, but direct Sheets metadata inspection returned **HTTP 429 quota exceeded** on 17 Nov 2026. No live school rows were read, edited, or cleared during this check; actual readback remains unverified.

**Release decision:** Keep PR #115 draft until published Apps Script and backed-up real-school cross-role readback are demonstrated. Frontend-only Vercel deployment of the new bulk teacher UI against an unknown Apps Script version is not a safe substitute.
