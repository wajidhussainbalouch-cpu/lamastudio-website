# LAMA Platform — Module Integration Contracts
Status: proposed contract v0.1, NOT a deployed API. Existing endpoints and identifiers remain unchanged pending migration.

## Common IDs
Opaque immutable IDs: schoolId, campusId, classId, sectionId, subjectId, teacherId, studentId, academicSessionId, examId, examVersionId, paperId, attemptId, resultId. SchoolId is mandatory for all tenant records. CampusId is optional only for legacy single-campus records; explicit scoped migration required. Display enrollment numbers are aliases, not primary keys. Preserve legacy IDs with mapping records; never reassign existing IDs.

## Entitlements
Modules: schoolManagement, examination, smartMarker. Backend grant: {schoolId,module,status,startsAt,expiresAt,limits,revision,updatedBy}. Status active/suspended/expired. An independent examination license includes automated syllabus planning; schoolManagement includes manual syllabus planning. Smart Marker is separately licensed. Read-only historical data access follows retention policy after expiry. Every write requires server-authenticated principal, tenant, permission and entitlement check.

## Principals
Roles: superAdmin, schoolOwner, schoolAdmin, teacher, student, parent, markerReviewer. A teacher must be assigned to the relevant class/subject. A parent may only view linked students. Server derives school and identity from verified session, never from client claims. Deny by default, audit privileged actions.

## Question Bank -> Paper
Accept only approved questions with verified source/chapter metadata and active curriculum version. Persist immutable paper snapshot and answer key separately. Return student-safe question projection without answers, scoring rules, private metadata or key endpoints. Never trust client-side filtering as protection.

## Exam lifecycle
draft -> approved -> published -> open -> closed -> reviewed -> finalized; cancel/void via audited policy. Server checks scheduling windows, attempt count and idempotency key. Server timestamps and grades objective responses. Subjective/handwriting grading requires reviewer approval; finalization is atomic and audit logged. Historical versions remain immutable.

## Planner adapter
Inputs: tenant, session calendar, holidays, class/subject mapping, chapter IDs, lesson completion. Outputs: dated diary suggestions, planned/revised coverage and exam scope references. Planner cannot change exam papers after publication; replan produces a versioned plan.

## Marker adapter
Inputs: signed opaque paper lookup, examVersionId, studentId, scan job ID and capture metadata. Match identifiers server-side. Output: provisional mark items, confidence flags, human verification and idempotent sync key. Reject duplicate or mismatched scans. Never auto-finalize uncertain handwriting.

## Error and evolution
Version all public contracts; return structured errors (UNAUTHORIZED, FORBIDDEN, ENTITLEMENT_REQUIRED, INVALID_SCOPE, CONFLICT, VALIDATION_FAILED). Additive fields first; migration scripts must be reversible, tenant scoped and tested against copies. No destructive database reset.
