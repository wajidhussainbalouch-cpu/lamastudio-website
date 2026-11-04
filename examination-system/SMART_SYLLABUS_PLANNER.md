# LAMA Smart Syllabus Planner — Architecture and Integration
Status: Scheduling engine committed; not connected to production portals or Google Apps Script.

## Product placement and licensing
- **Management entitlement:** Basic manual syllabus division, calendar configuration, chapter checklist, printable plan and teacher progress entry. Schools can use these without Examination subscription.
- **Examination entitlement:** Automated scheduling and recalculation, suggested teacher diary lessons by date, chapter/term test scope, automated progress forecasts, exam-linked revision and assessment days.
- **Smart Marker entitlement:** Optional separate OMR and handwritten paper marking; no dependency for basic syllabus planning.
- Super Admin controls entitlements per school; backend must verify school/tenant and entitlement on every action. Do not rely on client-only checks.

## School calendar
- School selects session start date and duration (1–24 months), optionally an end date.
- Select weekly off days (Sunday=0, Monday=1, … Saturday=6): e.g. government Sat+Sun [0,6], private Sun [0].
- Add public holidays by region and year, school-specific holidays, exams, closures and make-up days. **No hard-coded holiday dates:** religious holidays and government notifications may change. Admin reviews imported calendar before approval.
- Separate calendar from curriculum: changing academic start month reflows dates, not lesson/chapter IDs or learning outcomes.
- Classes may use different subject timetables and periods per day; the initial engine models a single subject's available teaching slots, not a full cross-subject timetable.

## Syllabus metadata and allocation
- School/class/subject/curriculum version -> ordered chapters -> ordered lessons -> required teaching periods, difficulty, learning outcomes, optional source pages.
- One period is one teaching slot. School can change pace, reserve revision and assessment days and customize teacher assignments.
- Generated schedules start in **draft** status; admin approves and publishes versioned plan. Teacher diary shows proposed daily lessons with date and topic, not auto-completed entries.
- If calendar has too few teaching days, stop with capacity error; never silently drop lessons.
- Holidays and closures are excluded. Teachers may mark taught, delayed, skipped or rescheduled; keep original plan, change history and reasons. A replan must not overwrite past attendance or diary entries.
- A student-level accommodation can be teacher-managed; never automatically infer learning ability from marks or sensitive personal data.

## Exam integration
- Monthly/term/chapter test selection references **verified** chapter IDs and published syllabus-plan version.
- Teacher/admin chooses covered chapters and approves the paper. The exam engine selects only quality-approved, online-ready questions, not all 1,500 unverified drafts.
- Future diary should show 'Today's suggested lesson', 'Next lesson', progress and upcoming chapter test. Student portal may show assigned syllabus and exam scope according to school policy.

## API / persistence contract (future work)
- `school_calendars`: schoolId, sessionId, startDate, endDate, timezone, weeklyOffDays, holidayOverrides, revision.
- `syllabus_catalog`: curriculumId, classId, subjectId, chapterId, lessonId, order, periods, sourceVersion.
- `syllabus_plans`: schoolId, classId, subjectId, calendarVersion, catalogVersion, mode, planVersion, status, approvedBy.
- `syllabus_plan_entries`: date, lessonId, chapterId, teacherId, slot, status, completionDate, changeReason.
- `syllabus_events`: append-only change audit with actorId, timestamp, before/after and correlationId.
- `exam_assignments`: approved plan version, selected chapter IDs, teacher/admin publish approval and student scope.
- APIs: draftPlan, previewPlan, approvePlan, publishPlan, teacherDiarySuggestions, markLessonProgress, requestReplan, approveReplan, examScopeFromPlan.
- Enforce authenticated tenant isolation and atomic versioned writes; do not let client edit published records directly.

## Current code
- `examination-system/syllabus-scheduler.js`: pure JavaScript functions `workingDates`, `periods`, `buildPlan`, `teacherDiary` for planning. No backend writes.
- `examination-system/test-syllabus-scheduler.js`: Node test script; execute with `node examination-system/test-syllabus-scheduler.js`.
- Existing `examination-system/exam-blueprint.js`: question selection by chapter, approval/entitlement blueprint.

## Release blockers
1. Confirm real syllabus chapter/lesson catalog per class and subject, source pages and lesson duration.
2. Integrate school settings and admin/teacher UI; persist and audit versioned plans with tenant permissions.
3. Add school holiday administration, exceptions, make-up days and timetable-specific subject slots.
4. Handle date-aware replan without rewriting taught lessons; add cross-year tests, timezone/term edge tests.
5. Run automated tests and browser/print/PDF validation; confirm online exam and Smart Marker integration.
6. No deployment without user approval.


## Syllabus planner development continuation — 2026-11-04
- Added `syllabus-progress.js` as a standalone read-only companion to the existing scheduler. Tracks completed, pending and delayed lesson periods using stable composite schedule-entry keys; provides diary suggestions and chapter coverage for exam scoping.
- Added `test-syllabus-progress.js` covering completion/delay classification, diary suggestions, chapter coverage, invalid keys and invalid dates.
- Coverage is advisory only: chapter tests still require teacher approval and separately verified question-bank questions. This helper does not publish papers or modify grades.
- Existing scheduling engine, textbook metadata, school records, portals and Apps Script were not modified. New files committed directly to `main`.
- **Still outstanding:** execute tests in CI, connect real verified chapter/lesson catalogs, manual Management UI, automated Examination UI, backend tenant/entitlement checks, versioned persistence, teacher diary writeback, calendar exceptions/make-up days, and approved exam scope. No Vercel deployment.


## Continuation — verified catalog and manual checklist (2026-11-04)
- Added `examination-system/syllabus-catalog.js`: standalone verified textbook lesson catalog normalization, globally unique lesson IDs, positive teaching-period validation and basic manual lesson checklist output.
- Added `examination-system/test-syllabus-catalog.js`: Node assertions for verified catalog normalization, completed manual checklist, rejection of unverified catalogs, unknown lesson IDs and duplicate chapter IDs.
- **Important:** textbook intake registration is not equivalent to a verified chapter/lesson catalog. Automatic scheduling must not invent chapter names or lesson content; verified lesson metadata remains a prerequisite.
- The catalog/checklist functions are pure and read-only; no school data or production portal changes. Tests are committed but execution not confirmed.
- Pending: integration with real school settings and teacher diary, authenticated backend persistence and entitlement enforcement, approved chapter-wise exam scope, live catalog verification and end-to-end testing. No Vercel deployment.
