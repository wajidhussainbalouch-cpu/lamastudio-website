# Attendance save/reload incident — 10 November 2026

## Reported symptoms (owner screenshot)
- **Student daily attendance V2:** 349 students in school roster, Class 5 selected, after a save the UI reports **“Server accepted save, but 38 records are not yet verified. Do not submit again.”** Reload shows 0 marked students.
- The school owner also reports that **teacher/staff attendance did not save**.
- These symptoms do **not prove that the Google Sheets write failed**. The server reported accepting 38 student records; the independent readback could have failed to match them. No live Sheet was inspected by this patch.

## Diagnosed source-level risks
1. The School Suite Apps Script backend returned attendance and teacher-attendance Date cells using default JSON conversion. A Sheets midnight Date in Pakistan can become the **previous UTC calendar date**, so the browser's strict YYYY-MM-DD comparison finds no saved attendance even though the row is present.
2. The browser API client and master backend did **not include `teacherAttendance` list/add/update** in the verified school administrator token handling, unlike students/attendance and teacher management.
3. Generic teacher attendance `add` wrote a **new row every time**, including when a mobile/network request's acknowledgment was lost; duplicates then caused ambiguity on readback.

## Changes in isolated draft branch
- `backend-api/code.gs` now serializes attendance and staff attendance dates in the **school spreadsheet's timezone** before returning list results.
- `backend-api/bulk-attendance-backend.gs` uses the same timezone when matching existing daily attendance.
- `js/api-client.js` routes teacher attendance list/add/update as **POST** operations under the school-admin token; a different active teacher role cannot override the administrator's school.
- `backend-api/code.gs` resolves the token to the school key server-side for teacherAttendance, and adds a **locked, idempotent teacher/day upsert** with school/teacher validation. It refuses existing duplicate teacher/day rows instead of guessing which to overwrite.
- `attendance/teacher-attendance.html` shows an immediate error if the School Administrator session is missing; QR/one-click marks are not sent in this case.
- Four isolated Node mock regressions cover local-date readback, frontend admin-token routing, backend admin verification, and teacher attendance retry/correction/duplicate safeguards. They **passed in mocked source execution**. GitHub Actions runs these tests on pull requests.

## Safe recovery for the 38 students and staff
1. **Do not tap Save again or clear the attendance date.** Do not manually delete or re-import any student or teacher rows.
2. With a school-authorized account, **back up the school's existing spreadsheet first**. Inspect the **Attendance** tab for the selected date (November 10, 2026) and Class 5; count unique student IDs, inspect whether the 38 expected statuses exist and identify any duplicate or contradictory rows. Use the sheet's displayed date, not a raw UTC timestamp.
3. Independently inspect the **TeacherAttendance** tab for the same date, teacher ID and status. Check for duplicates from prior attempts.
4. In a **disposable test school only**, install the corrected master Apps Script source and matching bulk module in the **existing Apps Script project**, deploy a new *test* version, and verify student and teacher attendance through the same UI with only fake/test records. Do not create a second master script or registry.
5. Verify a school-admin login, normal save/reload, another-tab session changes, repeated teacher save, and class/section filters on actual Android Chrome.
6. Only after the owner reviews the test results and approves a release, merge/deploy the necessary frontend changes and updated Apps Script version. Vercel production quotas and independent work on `main` must be respected.
7. If records truly do not exist in Sheets, investigate the exact deployed Apps Script version, sheet tab, authorization error and write response **before** attempting another submission. Do not paste admin tokens, school API keys or private student details into issue comments.

**Status:** Code-only GitHub draft; no production Apps Script, Google Sheet, or Vercel change has been made. The report cannot guarantee repair of existing rows without inspecting the real school database.

## Additional safeguards: pending writes remain visible until independently verified

- Student Attendance V2 no longer clears selected marks immediately after an accepted bulk-save response. If independent readback lacks an exact unique student ID/date/status match, **the submitted marks remain visible but locked** on that browser page. The Save/QR/bulk and date-clear controls cannot submit a second write. **Refresh only checks the cloud** until all attempted rows are verified; CSV export remains available.
- Teacher Attendance now preserves each attempted teacher mark until independent readback confirms exactly one row with the same teacher ID, local date, status and applicable remarks. The manual Save button is blocked while a request is unverified. Teacher QR also uses this pending verification lock so repeated scans cannot create new unverified writes.
- The register status explicitly distinguishes **selected / pending** marks from **confirmed cloud records**. An uncertain server result is not called success.
- The existing `attendance-save-regressions.yml` workflow now runs **six** source-level/mock checks, including `attendance/test-pending-student-save.cjs` and `attendance/test-pending-teacher-save.cjs`. All six passed in isolated tests. Real Android/Google Sheets acceptance remains unverified.
- These pending selections live only in the open browser page; they are **not durable encrypted backups**. When verification is pending, export CSV as a local reference before closing the page.
- The user's 38 previously unverified November 10 marks predate this fix. **Do not re-submit those 38 marks**. First inspect the real `Attendance` sheet, then the `TeacherAttendance` sheet, and confirm raw date values, ID counts and duplicate rows.

## Screenshot follow-up — teacher register shows 2 or 7 mismatches

- Follow-up screenshots show the teacher register reaches **100% "Teacher register ready"**, but warns about **2** status/remarks mismatches on the phone and **7** on the larger screen; the larger screen shows **7 teachers and 7 unmarked**. This means the list response was available, **not** that a save was independently verified.
- The native date picker displays `11/10/2026` while the app's display below shows `10/11/2026`. Those are two UI formats for **10 November 2026** (US month/day vs day/month), not necessarily two different selected dates. The backend may still have a real timezone conversion bug when serializing a Sheets Date.
- The new read-only `diagnoseTeacherReadback()` identifies **missing teacher/day rows**, **wrong status or remarks**, **duplicate saved teacher/day rows**, and a **possible prior-UTC-day conversion**. A record found under 2026-11-09 is **not** silently treated as confirmed for November 10; it is only a clue for the administrator to inspect the original spreadsheet.
- All teacher-attendance *corrections* now use the same locked idempotent teacher/day backend upsert as additions and verify that the original row ID still exists. A stale ID or concurrent record replacement is refused; no separate unguarded update path remains.
- Expanded mock tests cover wrong status, duplicate saved record, date-shift hints, corrected teacher/day status, stale record ID and the public update route, plus no-duplicate submission during pending verification.
- The live site's deployed web and Apps Script versions are **unverified** and may still contain the older code shown in screenshots. GitHub changes cannot repair that deployment by themselves. Do not resubmit the 2, 7 or 38 unverified marks until checking the original Google Sheet; use disposable-school end-to-end validation and explicit release authorization before deploying.
