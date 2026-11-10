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
