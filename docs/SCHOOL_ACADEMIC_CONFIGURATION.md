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
