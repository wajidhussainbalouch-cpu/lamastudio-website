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

## Teacher portal class attendance — accepted 2, dashboard zero

- New mobile screenshots show a **different flow from staff/employee attendance**: the Playgroup class teacher has **2 assigned students (1 boy, 1 girl)**, and the teacher portal alerts **`Attendance saved: 2. Failed: 0.`** while its own **`Present Today` and `Absent Today` both display 0**.
- The previous teacher portal `portals/teacher/index.html` incremented `ok` immediately after each `LamaAPI.add/update('attendance')` HTTP acknowledgment, called a generic `refresh()`, and **silently swallowed** any attendance fetch error via `Promise.allSettled`. That could produce a misleading “saved” popup and an empty dashboard. An all-zero dashboard does **not prove** a write failed; it can also mean both attempted statuses were `Leave`, the wrong date was read, or records failed ID matching.
- Reworked the teacher portal’s class-student attendance tab to **disable Save until a valid attendance history is loaded**; retain submitted marks and block repeat writes if independent readback fails, is missing, duplicates a student/day, or has a different status. “Recheck saved attendance (read-only)” checks the official register **without sending another POST**. The student/date selection remains locked until confirmation, and it warns that this page does not persist drafts between browser restarts.
- `updateStats()` shows **—** instead of a false verified 0 for Present/Absent when attendance history is unavailable or an attempted save is pending. On a unique matching readback, it updates the cloud records and displays the verified status counts. The updated code uses canonical student IDs, with a safe enrollment fallback only when the server's student ID is absent.
- New regression `portals/teacher/test-attendance-save-verification.cjs` uses two fake pupils, checks that an accepted submission with zero matching cloud rows stays pending, blocks a second write, diagnoses a possible prior-UTC-day shift (not treated as success), detects duplicates and wrong statuses, retains drafts on network errors, and verifies two matching rows before displaying Present Today = 2. It passed in source-level mocks.
- Existing **staff attendance** warnings showing 2/7 mismatches remain a **separate** register (`attendance/teacher-attendance.html` and `TeacherAttendance` sheet). The user’s 38 student marks, staff marks, and 2 teacher-portal student marks may have already reached Google Sheets. **Do not resubmit or clear any of these without checking the original sheets**. Production Apps Script and frontend have not been deployed from this draft.

### Release test for this teacher-portal fix

1. With a disposable school and two Playgroup students, mark one Present and one Absent, save, and verify that the students' records appear under the **same school-local date** in `Attendance`. The teacher dashboard should then show 1 Present and 1 Absent for that day, not merely an “accepted” popup.
2. Simulate a delayed, empty or stale attendance readback; confirm the save stays pending and pressing Save again sends **no second write**. Recheck must be read-only.
3. Test an existing record correction, two phones saving the same student/day, duplicate rows, session loss, class/section scopes and a date that serializes to the previous UTC calendar day.
4. Test employee attendance separately through the administrator’s `TeacherAttendance` tab. No production merge/Apps Script deployment or real-school attendance mutation until tested and explicitly approved.

## 10 November 2026 — Read-only Google Sheets duplicate confirmation

- Read-only inspection of two connected school-owned spreadsheets showed **real repeated student/date and teacher/date attendance rows**. Data already exists despite zero counters or “not verified” warnings. The original school data was **not edited or removed**.
- On 2026-11-10, a small-school test dataset had **6 student attendance rows for 2 students** (4 extra repeated entries) and **8 staff attendance rows for 2 teachers** (6 extra entries). A larger-school dataset had **145 student rows for 89 student IDs**, with 37 duplicate groups and 56 extra rows, and **26 staff attendance rows for 7 teachers**, with 7 duplicate groups and 19 extra rows.
- All repeated entries for that date had the same status *within each person/day group*. This does **not** authorize automatic deletion; the user must explicitly approve backup and supervised reconciliation. Historical dates may contain contradictory statuses. No private spreadsheet IDs, student IDs, teacher IDs or access credentials are recorded in this repository.
- Added school-administrator-only `attendance/attendance-integrity.html`: reads existing student and staff attendance, groups records by person/day, reports repeated and conflicting statuses/remarks, shows source record IDs and times, and exports an optional review CSV. No write, clear or delete path is present.
- Updated both `student-attendance-v2.html` and `teacher-attendance.html`: when current selected date already has duplicate records, mark/edit, bulk marking, Save, QR and clear-date operations are blocked. A visible **Review duplicates (read-only)** link opens the integrity page. Staff counts are no longer reported as verified when duplicated; the school administrator must reconcile backed-up data before Refresh.
- New source-level mocked regressions: `attendance/test-attendance-integrity.cjs` and `attendance/test-attendance-duplicate-block.cjs`. The CI workflow now invokes **nine** attendance regressions. These checks do not mean the fix is deployed or live Google Sheets data has been reconciled.
- **Mandatory next step:** backup original spreadsheets and obtain explicit owner authorization for a scoped cleanup plan that retains an agreed single canonical record per teacher/student/date and preserves an immutable audit of every extra row. Never silently remove repeated rows.

## Prevention for future single-student attendance retries

- The class-teacher portal previously called `LamaAPI.add('attendance')` and the master `addRecord` path used `appendRow` without a student/day uniqueness check. A lost HTTP acknowledgment followed by a retry could insert identical rows repeatedly. This explains why UI-only duplicate prevention was insufficient.
- The master backend now routes single-student `add attendance` through `addStudentAttendanceOnce_`, a **script-locked idempotent write**. It resolves the canonical student and authorized class, checks the selected date in the school's own timezone, and returns an existing matching row without appending. A differing status, duplicate existing student/day record, invalid student/date or unauthorized class is rejected without a write.
- New `backend-api/test-student-attendance-single-idempotence.cjs` checks duplicate HTTP retries, correct student ID, conflicting marks, teacher class permissions, invalid dates, preexisting duplicates and lock release. Passed in isolated mock execution. Total attendance-focused mock checks in CI: **10**.
- Existing repeated rows must still be reconciled carefully from a verified backup under explicit owner approval. This new code **does not silently delete or collapse** old entries. Frontend + matching Apps Script backend must be validated against a disposable test school and deployed together before claiming a live fix.

## 11 November 2026 — Faster verified bulk attendance and class-completion display

A new screenshot showed a **12-second "Saving" state** while the register displayed **349 students: 20 Present, 18 Absent, 0 Leave and 311 Unmarked**. This is **38 selected marks, not 349 completed school-wide**. The previous UI counted local selections during saving, making submitted vs officially saved attendance unclear. The 12-second observation is not an independently measured server benchmark.

### Changes in draft PR #86 only
- `backend-api/bulk-attendance-backend.gs`: after batched Google Sheets writes and `SpreadsheetApp.flush()`, re-read the **selected school date** inside the same request and check each submitted student/date/status has exactly one matching persisted record. Return `verification:'confirmed'` and `verifiedDateRecords` only when the readback matches. If it fails, refuse to claim success and preserve the client's pending state; **never resend automatically**. Existing idempotent/deduplication safeguards remain.
- `backend-api/code.gs`: new **POST-only**, verified-school-admin `attendanceDateSnapshot` action, returning only rows from one school-local date. No student data or login system is created. `js/api-client.js` provides `LamaAPI.attendanceDateSnapshot(date)` with the existing school-admin token.
- `attendance/student-attendance-v2.html`: consume the server-verified date records immediately when provided, avoiding a **second full-history HTTP request after Save**. A read-only date-specific request is used when verification is needed; only an older backend's unknown-action response triggers the existing full-history fallback.
- Present/Absent/Leave cards show **selected totals** and separate **verified/pending** counts. A distinct completion banner displays **selected-class verified totals** and **whole-school verified totals**. No "Day complete" statement appears until all registered students are independently verified; a class may be complete while other classes are still pending.
- For the screenshot's modeled 38-student Class 5, after verified save, the UI says **Class 5 38/38 saved and verified (20 Present, 18 Absent, 0 Leave)** and **Whole school 38/349 confirmed, 311 remaining**.
- The Save progress/elapsed indicator now measures **the Save and verification operation**, not an earlier roster load. Mark-visible-present applies all marks in one page render instead of rerendering the entire roster once per student.
- Student, staff, and teacher-portal duplicate and uncertain-save protections remain. `attendance-integrity.html` is the read-only reconciliation screen; this change does not remove historical duplicate records.

### Verification and release
- New `attendance/test-attendance-save-completion.cjs` checks the 20/18/311 scenario, exact class-vs-school completion, batched render, and zero extra read HTTP calls after an already verified save.
- New `backend-api/test-attendance-bulk-confirmation.cjs` simulates 38 school records, an actual Sheets date conversion, repeat writes, existing duplicates and stale readback refusal.
- The attendance workflow now runs **12** regression scripts; all **12 passed in isolated source-level mocks**. Real Apps Script/Google Sheets/network latency, Android Chrome and parent notifications have not been performance-tested.
- No automatic school Sheets cleanup, production merge, Apps Script update or Vercel deployment. Actual speed improvements require a disposable-school integration test and explicit release approval. Save latency may still include the existing synchronous parent-portal notification update, which was not removed.



## 11 November 2026 — Two-teacher phone screenshot: confirmed stored attendance, misleading zero display

- The owner's **11 November 2026** phone showed **two teachers, zero Present, two Unmarked**, and a toast reporting **two status/remark mismatches, zero duplicate records** immediately after Save. The 100% load indicator means the response finished; it does not establish that the correct school-local date was applied.
- A **read-only connected Google Sheets inspection** of the matching school spreadsheet confirmed **exactly one Present record for each of the two rostered teachers on 2026-11-11** in `TeacherAttendance`. The records are **native Google Sheets dates**, not plain date text. Neither record was missing. No rows were edited.
- For **2026-11-10** the same source spreadsheet has **four repeated Present rows for each of those two teachers** (eight rows total), explaining earlier duplicate warnings. These are historical rows, **not authorization to delete or replace them**.
- This is direct evidence of a mismatch between stored school-local attendance and what the browser reported. The source-level cause remains consistent with Apps Script's default JSON serialization of a Sheets midnight Date: **2026-11-11 00:00 in Asia/Karachi becomes 2026-11-10T19:00:00Z**, and the current production frontend's `recDate(r)` takes the first ten characters. The draft backend `listRecords` fix formats dates with the spreadsheet timezone before JSON response. Exact active Apps Script deployment version remains unverified.
- **Do not submit another Save for those two teachers on 2026-11-11.** Their Present statuses already exist; do not use Clear Date, delete the Nov 10 duplicates, or bulk-reimport staff. In the isolated trial school, deploy the coordinated date-serialization/token/upsert backend and matching staff frontend **to a test Apps Script deployment first**. Confirm 11 November returns both Present with the same two row IDs, without sending any new write. Also confirm Nov 10 duplicates trigger read-only integrity review and block modifications.
- Extended `backend-api/test-attendance-date-verification.cjs` with school-local **2026-11-11** and **2026-11-10** cases for both collections; mocks check UTC previous-day behavior without accessing real school records.
- **Production remains unchanged**. PR #86 is draft; GitHub and automatic Vercel preview builds do not deploy the updated Google Apps Script source, and no school attendance data was mutated.
