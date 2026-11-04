# LAMA School Suite — System Integration Handoff
Updated: 2026-11-04
Status: architecture review, NOT production-ready.

## Baseline
User ZIP: lamastudio-website-main (4).zip, 349 entries. GitHub: wajidhussainbalouch-cpu/lamastudio-website, main. Preserve existing records and concurrent question-bank work. Do not deploy to Vercel without explicit approval. Do not replace main wholesale from ZIP.

## Ownership
Question content and validation belong exclusively to examination-system/QUESTION_BANK_HANDOFF.md and its separate conversation. This stream owns subscriptions, authorization, exam workflows, printing, scoring, results, and integrations.

## Existing components
examination-system/exam-blueprint.js contains pure draft helpers, not server authorization. examination-system/EXAM_SMART_MARKER_INTEGRATION.md explicitly describes prototype contracts, not live integration. examination-system/SMART_SYLLABUS_PLANNER.md says the scheduling engine is not connected to production portals/Apps Script. Existing exam UI, print preview, School Suite exam pages, role-isolated api-client.js, and super-admin-app/app.js must be preserved and inspected before modifications.

## Backend-first contracts
Entitlements: management, examination, questionBank, smartMarking; each school grant has status, validity, limits, audit and revision. Super Admin alone grants/revokes through authenticated server actions. Expiry must never delete historical results. School admins manage school exams; teachers only assigned classes/subjects, with publish permission controlled by policy; students only own assigned exams/results. All actions enforce server-side school isolation, verified identity and permissions. Never trust client-provided role, school ID, score, answer key or time.

Exam lifecycle: draft -> approved -> published -> open -> closed -> reviewed -> finalized. Persist immutable paper/question snapshots, syllabus chapter IDs and plan version, school/student assignments, attempts, answer-free student payloads, server-side objective grading, human review for subjective/oral/handwriting, audit events and idempotent finalization. Smart Marker scans must not double-post results.

A4/PDF: printable school header, exam metadata, candidate identifier, marks, numbering, page breaks, bilingual/RTL support, version and page numbers. Student output never contains answer keys. Teacher keys require authenticated server authorization. Marker QR contains opaque signed lookup only, not private data or answers.

## Proposed persistence (not implemented)
school_module_grants; exam_definitions; exam_versions; exam_assignments; exam_attempts; exam_responses; exam_reviews; exam_results; exam_audit_events; marker_scan_events. Each record tenant-scoped and versioned.

## Next steps / release gates
1. Complete per-file ZIP versus current main comparison; preserve concurrent edits.
2. Locate and inspect real Apps Script backend and existing sheet schema.
3. Add secure grant storage and super-admin APIs with tests.
4. Add server-validated exam, attempts, grading, result and PDF endpoints.
5. Connect school/teacher/student UI and syllabus/marker contracts.
6. Test cross-school isolation, expiry, answer leakage, replay, duplicates, RTL/PDF and data preservation.
7. Commit only verified incremental changes to main. No Vercel deployment.

## Verification record
ZIP inventory and traversal safety checked; key documentation and GitHub UI files inspected. Full repository diff, backend integration, E2E testing and production readiness remain unverified.
