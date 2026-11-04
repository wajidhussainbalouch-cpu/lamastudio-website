# LAMA Examination → Student Portal → Smart Marker Integration Contract
Status: architecture + prototype utilities; NOT live integration.

## Required access control
- Super Admin enables `examination` entitlement per school, with expiry and limits; separate `smartMarking` entitlement.
- School admin can create, approve, publish, unpublish, schedule, and print exams for that school.
- Teacher can create exams only for assigned classes/subjects and can publish only when school policy grants permission.
- Student sees **only** assigned published tests for their school/class, within open/close times and attempt limits.
- Never trust client-side entitlement, teacher class, student ID, scores or timestamps; validate in authenticated server endpoints.
- All APIs must enforce school tenancy and role permissions; avoid cross-school leaks. Persist exam version, question snapshot, assignments, attempts and audit events.

## Chapter/term selection
- Chapter picker: one chapter, multiple chapters (e.g. 1+2+5), quarter (Q1–Q4), half (first/second), full.
- Chapter IDs, order, curriculum version and page ranges must come from verified source metadata, not numeric assumptions.
- Optional question type/difficulty/marks quotas; reject unsatisfiable selection rather than silently reuse questions.
- Include only approved, online-ready, non-duplicate questions. Questions without verified chapter IDs are excluded.
- Deterministic seed + exam version for reproducible paper; store selected question IDs and answer-key version server-side.
- Quarter/half boundaries require school-defined term mapping when curriculum is not equally split; generic equal split is only a fallback preview.

## Student online exam lifecycle
1. Teacher/admin creates draft; chooses chapter scope, categories, count, marks, duration, availability, attempt policy.
2. Backend validates school entitlement and actor role; generates from approved bank; teacher previews and publishes.
3. Student portal queries eligible assignments using authenticated student school/class ID.
4. On start, backend issues attempt ID, time window and **answer-free** question payload.
5. Student submits responses to backend; backend checks attempt status, timing and server-held answer keys; grade objective items.
6. Subjective, handwriting, oral and ambiguous answers go to teacher review; do not auto-award marks.
7. Finalize result transactionally and idempotently; update student result dashboard only after review/finalization.
8. Record exam ID, school ID, class ID, student ID, question IDs, version, score, reviewer, timestamps and audit log.

## Printed exam and Smart Marker contract
- Each paper starts with verified school name, optional school logo, exam title, class, subject, date, time, maximum marks, student identification, paper version and QR.
- Print A4 with sensible page breaks, consistent question numbering, bilingual/RTL font support, answer space, page number and optional instructions. Browser Print → Save as PDF is preview only; server PDF generation and visual QA remain outstanding.
- QR **must not** contain an answer key or student private data. Suggested opaque payload: `https://www.lamastudio.pk/mark/verify/<opaque-signed-token>`. URL is illustrative; route does not yet exist.
- Backend resolves signed token to paper ID, school ID, exam version, sheet type (OMR/handwritten), expiry and permitted marking workflow.
- Print OMR registration marks, answer bubbles, paper/roll identifiers and scanner calibration using a versioned layout; handwritten answer pages must link to the same exam and student without guessing identity.
- Marker scans QR, checks signature and tenancy, reads paper version and question mapping, proposes scores, flags low-confidence OCR/handwriting for teacher review.
- Duplicate scans must be idempotent; never double-award scores. Log scan ID, hash, operator, confidence, edits and final approval.
- Results post to student exam record only after authenticated approval. Wrong/missing student mapping enters manual reconciliation.
- QR issuance, marker verification, PDF layout and student-result APIs require coordination with the separate LAMA Smart Marker module.

## Existing implementation
- `exam-blueprint.js`: pure chapter scope selection, draft quality gates, deterministic assembly, answer-free payload helper and **illustrative** role/entitlement validator. Not wired to server.
- `print-preview.html`: A4 school-header layout with QR placeholder and browser Print / Save PDF. Not a production QR or PDF engine.
- `practice-preview.html`: standalone public-draft practice only; **not** a secure student exam.
- Existing 1,500 Class 1 Mathematics records are unapproved drafts and largely lack verified `chapterId`, so `assemble()` intentionally cannot turn them into live exams.

## Release blockers
Actual chapter mapping, textbook verification, semantic duplicate review, protected answer storage, authenticated APIs, persistent attempts, secure QR issuer/verifier, OMR calibration, handwritten marking review, PDF visual validation, end-to-end tests and school portal integration. Do not deploy without approval.
