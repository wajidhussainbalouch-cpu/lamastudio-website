# Attendance Save Recovery — 10 November 2026

## Incident from school-admin screenshot
- **Student register:** 349 students, 0 displayed as marked after reloading.
- The page reported **"Server accepted save, but 38 records are not yet verified. Do not submit again."**
- The school owner also reported that **teacher attendance was not saved**.
- **Important:** A server-accepted request followed by an empty/stale register does **not** prove the 38 writes failed. There may be 38 rows in the school's Attendance sheet, and resubmission could duplicate or overwrite data.
- These observations relate to the existing live UI; no access to the owner's live Google Sheets data or actual Apps Script deployment was available to validate the 38 records.

## Root causes addressed in this proposed patch
1. **Google Sheets date conversion:** A school-local date cell may serialize as the previous UTC day (for example Nov 10 at 00:00 in Pakistan is Nov 9 at 19:00 UTC). The backend `listRecords` now formats attendance and teacher-attendance **Date objects** in the spreadsheet's own timezone before returning JSON. The bulk-attendance backend compares existing dates using the spreadsheet timezone as well.
2. **Teacher-attendance administrator identity:** The browser and master backend now route teacher-attendance `list`, `add` and `update` through the verified school administrator token. A different active teacher account does not replace the school administrator identity. Teacher-attendance lists use POST to keep the token out of URL query strings.
3. **Do not lose attempted student marks on uncertain readback:** The V2 register no longer clears selected/dirty marks immediately after a server acknowledgment. Until unique, matching rows are loaded by **read-only Refresh**, it retains the selected marks on-screen and disables Save, bulk marking, QR attendance and date clear. CSV export remains usable.
4. **Do not lose attempted teacher marks:** The teacher register similarly keeps attempted marks pending. Refresh rechecks `TeacherAttendance` without a new write; a second Save is blocked until exactly one matching teacher/date/status/remarks record is verified. Existing backend teacher/day upsert uses an Apps Script lock to prevent duplicate appends.

## Regression checks
Six mock/source-level regression scripts:
- `backend-api/test-attendance-date-verification.cjs`
- `js/test-teacher-attendance-auth.cjs`
- `backend-api/test-teacher-attendance-backend-auth.cjs`
- `backend-api/test-teacher-attendance-upsert.cjs`
- `attendance/test-pending-student-save.cjs`
- `attendance/test-pending-teacher-save.cjs`

These have passed in isolated mock execution. GitHub Actions workflow: `.github/workflows/school-suite-attendance-save-checks.yml`. **Real browser, real Apps Script and live school data have not been tested.**

## School owner's immediate safe procedure
1. **Do not press Save again** for the 38 Nov 10 marks, and **do not use "Admin: clear selected date"**.
2. Back up the original school's Google Spreadsheet first.
3. Inspect the school's `Attendance` sheet for **2026-11-10**, comparing student IDs, enrollment numbers and statuses; also inspect records whose raw cell Date becomes `2026-11-09T19:00:00.000Z` after UTC serialization. Look for duplicates.
4. Inspect `TeacherAttendance` for the same local school date and school ID. Verify teacher IDs/statuses and duplicates.
5. Do **not** assume missing rows and resend until that inspection is complete. Capture the browser's actual error message, Apps Script execution log and deployed version if there is a mismatch.
6. For deployment QA, use **disposable school data**, the matching master Apps Script code, and a controlled preview of the web UI. Test a student save and a teacher save, independent readback, timezone conversions, ambiguous network acknowledgments and role isolation.
7. Only after validation and approval should the owner replace the live Apps Script version / publish the web frontend. Code committed to GitHub does not itself update Apps Script or make the live site change.

## Constraints
- No automatic resend, reset, deletion, or production migration of school attendance.
- Offline-attendance / branded-PWA work remains isolated in draft PR #84 and must not be merged accidentally with this focused hotfix.
- A page reload/browser restart may still discard unverified **in-memory** selections; export the CSV as a reference when verification is pending. This branch has not implemented durable encrypted persistence for the live V2 register.
