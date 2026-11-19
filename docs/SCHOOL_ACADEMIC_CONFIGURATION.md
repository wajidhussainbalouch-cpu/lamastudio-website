# LAMA School Suite — academic configuration and module directory

Updated 19 November 2026.

## Source of truth
- School Settings stores offered classes and sections in existing school configuration.
- Class-subject assignments and rename aliases remain in the existing school-curriculum Resources record. `js/academic-config.js` is a read-only adapter, not a second database.
- Existing student, teacher, homework, result and date-sheet rows are not migrated or deleted by these changes.
- Previously saved subjects and classes remain readable. New test/date-sheet/result entries use the school's configured subjects; historic entries may retain their saved names.

## Administrator access
- Dashboard and School Settings link to `academics/configuration-center.html`.
- The center reads verified school configuration, displays the class/section/subject catalog and searches 21 registered module/field areas. Changes are saved through linked existing editors, not through duplicate fields in the center.
- Every new administrator feature or configurable field must be discoverable from this directory, with search keywords and a link to its real editor. Update the catalog in the same change as the new feature. Do not mark functionality as ready simply because a link exists.

## Connected pages
- Date sheet: configured class selection, class-specific subject dropdowns, historic class columns retained for print/export.
- Tests: configured class and subject dropdowns, historical entries retained.
- Academic results: new subject templates, bulk marks selector and award list from curriculum; saved marks preserved; validation permits existing historical subject names.
- Behavioral report: class filter includes configured classes even when empty; behavioral ratings are independent from academic marks.
- Certificates: select/search a saved student to fill identity fields into the editable draft. This is not a secure issuance/verification implementation.
- Existing homework and timetable already consume school curriculum.

## Remaining work
- Separate Examination System/question bank/syllabus planner integration with authenticated school curriculum needs its own audit; not completed by this change.
- Term date schema, historical class/section transitions, report titles, certificate issuance and any arbitrary user-defined database fields need independent design and testing. The directory links to existing settings only; it is not a schema editor.
- Date-sheet and result pages currently remain class-level exam tools, not newly introduced section-specific exam models.
- Frontend syntax and mock configuration tests are not authenticated browser end-to-end tests. Verify actual configured classes (including empty classes), eight Playgroup subjects, historical results, test/date-sheet save, result print and certificate draft on a test school. Do not modify production school data as a test.
- This change does not require an additional Apps Script redeployment. Earlier backend upgrades remain separate.

## 19 November 2026 — missing student profiles, admissions and voice
- Teacher portal: only missing whitelisted fields (photo, DOB, gender, contact, guardian/address, occupation, distance, literacy) and teacher remarks. Photo JPEG compressed below 45,000 characters. The backend checks class/section, fresh values, aliases, allowed fields, validation and audit. Existing populated profile fields and official identifiers remain admin-controlled. Student photos are not copied into the audit log.
- New Admission dashboard shortcut opens `admissions.html?new=1`. Roster and class configuration must load before new records can be saved; the editor has its own refresh control. Historical class selections retained on existing record edits. No records created for testing.
- Ask LAMA: explicit user-triggered browser speech recognition (English/Urdu), transcript review before sending, optional speech synthesis, and stop-on-close. Availability and voice languages depend on device/browser. No student record or private school data is injected into the chat.
- Staff management screenshot reports Unknown action: staffAdminDirectory. The route exists in repository code.gs, not in the current live Apps Script version. Redeploy the existing web app with the current backend after backup; preserve deployment URL, Script properties, sheets and all other Apps Script files. Teacher profile changes require the same backend deployment. Do not bypass authorization or use fake local staff records.
- Syntax and simulated voice/profile validation tests passed. Actual device microphone permissions, live authenticated admissions, photo upload and staff creation remain to be tested following deployment.

## Student-only schedule view
- Student home now renders the published assigned class/section timetable with subject teachers, school seasonal hours and a color-coded monthly calendar. No separate teacher-directory API is needed. Old student planning links redirect to this view. Read-only UI, no admin forms. Explicit publication required; no section-specific records shown when student's section is missing. Current academic session selected from dates, with session and weekday filters and manual refresh.
- Backend filters student planning resources by authenticated student class/section and publication status. Existing non-planning resource behavior is unchanged. Deploy updated code.gs to enforce the restriction server-side; old backend only permits the new UI's client filtering. No new student or timetable records created.
- Simulated class/section, draft exclusion, holiday, vacation and exam tests passed. Authenticated portal testing remains outstanding.

## Class-wise timetable batch editor
- Default admin timetable view is now the single-class editor: select session, class/section, weekday and period count. Existing entries are editable, the assigned teacher is suggested when uniquely matched, and missing times can be suggested from other saved school periods. Unsaved changes are amber. The all-class grid and detailed editors remain available via explicit controls.
- Save changed periods in one POST using planningSaveBatch, or apply changes/copy all filled periods to the configured working week. Existing target-day replacements require confirmation. The original saved lesson ID is retained, and room/publication settings remain as stored. Blank periods do not delete records.
- The backend verifies administrator identity, active teacher, configured subject, saved row snapshot and overlaps before writing. Contiguous edits/new records use grouped spreadsheet range writes. This is not a database transaction; on uncertain failure reload and verify. No automatic fallback to individual requests on backend errors.
- Redeploy current code.gs to enable fast batch saving. The old grid still uses its prior single-period workflow. Mock tests passed for record-ID retention, new periods, duplicate/overlap rejection, stale edits, invalid subjects, non-admin rejection, and grouped weekday appends. Actual authenticated saves, device layout and latency remain to be measured.
