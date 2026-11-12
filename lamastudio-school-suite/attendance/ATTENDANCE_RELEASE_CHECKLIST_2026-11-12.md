# Attendance recovery — controlled release checklist (12 November 2026)

**Status:** Draft code validated in automated tests. **Not installed in the live Google Apps Script deployment and not released on the production website.** No real school records were changed by this work.

## Why this release is coordinated

- The 12 November tablet screenshot shows seven teachers listed as Present but the same page says "Attendance history unavailable", with a stale 85% loading indicator. A client label is not proof of saved Google Sheets rows.
- The new API adds **`teacherAttendanceDailySnapshot`** and **`bulkTeacherAttendanceVerified`**. The browser only uses the one-request fast path after a compatible Apps Script backend is deployed; older backends fall back to slower readback without automatic resubmission.
- The backend also adds **`attendanceDateSnapshot`** for school-local student readback and normalizes spreadsheet Date values. Teacher, student, school dashboard, and QR views must agree on one school-local date.

## Release gates (must be completed before rollout to ten trial schools)

1. Confirm the target Apps Script **project and deployment ID** for an isolated consenting test school. Back up its original Google Sheets spreadsheet, including **Attendance** and **TeacherAttendance**, with a recoverable copy. Do not remove duplicates or use Clear Date.
2. Update and **deploy** the matching Apps Script files from this PR. Verify the version in the chosen *test* Apps Script deployment, not just GitHub. Preserve school-scoped authorization and check login for the school owner and verified school admin token.
3. In a staged frontend, test a teacher register for a new date with **7 unique teachers**: record all seven, click Save once, and verify one request returns the exact **7** saved rows with **verified=true**. Confirm the page shows **7/7 — 100%**, a success receipt, 0 unmarked, and corresponding Google Sheets records. Refresh; the results must remain.
4. Change one saved teacher from Present to Absent through the authorized correction flow. Verify 6 Present, 1 Absent, 0 Unmarked, with **no extra row**, retained remarks and no accidental follow-up to the wrong teacher.
5. Select one class. Verify the **Selected class** cards count only the class, the **Whole school** cards still count every teacher, and all classes remain in the coverage section. Verify teacher and student records are never combined.
6. Test a class with students: mark, save and refresh. Verify selected-class and whole-school totals, each student and class-teacher dashboard, parent absence follow-up, and the admin dashboard/checklist. Present-among-marked is *not* the same as whole-register completion.
7. Simulate an HTTP timeout or a lost acknowledgment after Sheets committed. Confirm the UI reports **Not verified**, stops duplicate saving, and uses a **read-only Refresh** to confirm the existing row. It must **not** display a green success or an artificial 85% or 100% during failure.
8. Simulate duplicate teacher/day rows, missing teacher, mismatched school account and wrong date. Verify saves are rejected before writing; preserve the original records for explicit administrator review.
9. Test QR attendance once with an already-marked teacher, once with a new teacher. Verify green success only after server verification and no repeated row.
10. Run all 12 CI regression suites (including token-only school admin authentication for both fast and legacy teacher attendance). Release the frontend and matching Apps Script together only after the isolated test passes. Check the production site and school sheet immediately after the coordinated release, and retain rollback/backups.

## Confirmed automated tests

GitHub Actions **Attendance Recovery Regression** run **43173955305** passed all 12 commands at commit `86f79e122918c27ff36584034d931742c29c60a4`. Vercel preview **dpl_E2E3EjxpiVWR7FPueyfF6M1UH6T9** is READY. These are synthetic and preview tests—not a live Apps Script or Android-device end-to-end acceptance.

## Additional root cause fixed in this branch

The previous generic `teacherAttendance` read/write actions were not consistently recognized as *school admin token-scoped* operations, despite the new snapshot actions being configured in the browser. Token-only school administrators could fail to load history or save records even when the teacher roster loaded. This branch now scopes `list/get/add/update/remove` of `teacherAttendance` and both new fast endpoints in **both** the web API client and Apps Script dispatcher. New regression: `test-attendance-admin-token-scope.cjs` proves token-only access, write audit attribution, and invalid/cross-school token rejection.

Live backend code must be updated together with the frontend: changing GitHub alone does not update Google Apps Script.

## User guidance for the photographed school

Do **not** click Save again simply because the screenshot said "Attendance history unavailable." Inspect **TeacherAttendance** sheet rows for **12 November 2026** (school time), verify seven distinct teacher IDs and their statuses, and then run a read-only Refresh. An uncertain saved result must not be duplicated.

## Backout

If any verification fails, leave the live school and Apps Script versions unchanged and keep this PR as draft. If a coordinated rollout eventually fails, restore the previous frontend and Apps Script deployment **without deleting or overwriting attendance rows**. Preserve logs and the backup for reconciliation.
