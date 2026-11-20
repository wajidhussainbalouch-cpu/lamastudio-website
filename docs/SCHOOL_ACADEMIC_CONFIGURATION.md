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

## 20 November 2026 — published academic terms
- Admin can define up to 12 named, nonoverlapping terms inside the selected academic session in Timetable & Academic Calendar > Academic terms. Dates are persisted in the existing planning-session resource; no new database columns or Apps Script changes are introduced. Existing term dates are retained when session dates are edited; invalid changes are blocked.
- Admin and teacher homework reports select published session/term dates. Custom date range remains available when terms are not published. Student timetable displays published term ranges. Configuration Center indexes the editor. Existing saved homework and results are not changed.
- Five simulated validation cases and a report scope/overlap test passed. Live authenticated save/refresh and print testing remains required. Examination marks term IDs, section-specific exams, syllabus integration, and certificate issuance remain incomplete.

## School-wide working days and all-class timetable
- School Settings > Working Days & Holidays publishes one existing Resources record (school-working-week). Monday–Friday, Monday–Saturday or custom closure days. Published weekly closure takes precedence over older weekday settings; seasonal times and vacations remain separately configurable. Current policy applies to historical calculations too; no attendance rows are deleted.
- Timetable batch editor supports all classes and 500 changed lessons per request. Existing lesson IDs are retained and cross-class teacher conflicts checked before writing. Closed weekday entries cannot be newly saved; old entries remain in storage. Larger batches must be split.
- Connected daily/monthly student and staff attendance, history, dashboard, calendar and timetable views use central policy. Other standalone modules, including examination and syllabus scheduling, need independent integration review. Live account verification outstanding.
- Redeploy both code.gs and bulk-attendance-backend.gs in existing Apps Script project. No production data created for tests.

## 20 November — official timetable formats
- Choose a weekday and seasonal timing for the daily official master landscape or classroom portrait timetable. Full-week print remains available. School logo/name and signature lines are included; class in-charge is shown only when a unique registered assignment exists. Assembly/lunch are optional seasonal settings rather than fixed defaults. The two user images are layout references only; no sample teachers or time settings were written to school records.
- Class builder supports one optional additional active teacher or non-teaching staff member per lesson. Batch save validates both assignments and conflicts; previous single-period editors cannot edit a saved lesson with additional staff. Student lesson view shows both names. Additional-staff saving requires latest code.gs backend redeployment; actual authenticated testing remains outstanding.

## Class-specific period counts
- The Easy timetable builder allows 1–14 daily lesson slots per class/section, stored in the existing academic session resource when the admin presses Save period counts. All-class mode provides independent selectors. Counts persist across weekdays, sessions remain independent, and no preset is imposed on ECCE/KG or other classes. Existing period numbers are used as suggestions when a count is not configured (eight when no lessons exist).
- Changing a count redraws only the configured number of slots and preserves visible unsaved lesson values. Reducing a count below existing saved periods is blocked; no lesson is automatically deleted. Master grid shows unavailable cells beyond each class's count. Actual published timetable and prints continue to use saved lessons. Existing backend supports the session resource update; no new Apps Script action is required. This is an editor setting rather than a server-side maximum on alternate period entry routes.

## Timetable conflict report
- Admin weekly timetable displays saved conflict pairs above the record table. Batch, quick and detailed editor preflight reports affected proposed and saved lessons with class/section, weekday, period, times, subject and main/additional staff, plus overlap interval and conflict cause. Existing rows are highlighted. Report links navigate to the correction controls; switching class/day with unsaved changes requires confirmation. Last blocked attempt remains labelled until next check/save. The report does not alter or delete records.
- Client-side preflight checks all affected pairs, separately audits saved working-day records and preserves server validation. Eight simulated conflict tests passed. Concurrent server-only conflicts may still return generic error; refresh to see the latest records. No Apps Script update required; authenticated UI test remains outstanding.

## Multi-class teacher scheduling
- Per academic session, the administrator may publish Strict (default) or Multi-class teaching in the Easy class timetable builder. Multi-class mode permits overlapping registered teachers (primary or additional) across distinct class/section slots; these are amber advisories, with explicit confirmation before submitting the frontend save. Same-class duplicate slots and time overlaps and non-teaching staff overlaps remain blocking. The conflict report preserves both exact lesson details. Changing policy never deletes lessons; strict mode reports existing overlaps.
- Backend reads the persisted session policy when validating batch and legacy period saves. Deploy latest code.gs as a new version to enable multi-class saving. No sample school data was changed. Simulated frontend and backend policy checks passed; live authenticated saves need verification.

## Direct duplicate-period correction
- Easy class builder displays all saved records for a duplicate slot, with subject, teacher, additional staff, times, room, publication state and record ID. Admin can explicitly confirm removal of only the unwanted record. verifies the current slot snapshot before calling the existing authorized remove API, and verifies removal and surviving slot records afterwards. Once one record remains, it is editable with its original ID. Other visible lesson drafts are preserved; no automatic deletion. The existing API is not an atomic compare-and-delete transaction; uncertain results require refresh. No new backend action. Eight simulated slot/snapshot tests passed; live authenticated testing required.

## Multi-class lesson coverage
- In Multi-class mode only, a distinct registered additional teacher covers the period; the primary teacher stays on the record as the original teacher but is not treated as occupying that time. This interpretation also applies to existing saved assignments with supportKind=teacher. The actual cover teacher remains subject to multi-class advisory checks. Caregivers and other non-teaching staff provide assistance, not teacher replacement, and their overlapping assignments still block saves. Strict mode retains both teacher bookings; same-class overlaps and duplicate slots remain blocked in either mode. The editor, weekly report, student view and timetable print distinguish cover teacher from original teacher. No saved records modified. Eight backend helper tests and eight frontend conflict tests passed. Latest code.gs must be redeployed for consistent backend behavior; authenticated tests remain required.
