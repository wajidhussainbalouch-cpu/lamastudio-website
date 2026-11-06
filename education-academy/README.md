# LAMA PPSC Preparation Academy — development handoff

## Current release note — 6 November 2026

**The dedicated Supabase project is active and the frontend has an enabled publishable-key configuration; old preview text below is historical where it states registration or backend do not exist.** The database currently has 2 Auth users (1 confirmed email), but 0 candidate profiles and 0 provisioned Super Admin accounts. Signup email delivery, branded sender and full mobile confirmation have **not** been verified. Candidate profiles are created after verified sign-in; payment and premium entitlement are still inactive.

The private **Super Admin Job Manager** has an RLS-protected Supabase job table and a source-code UI. Published admin jobs load automatically into dashboard/job dropdowns, planner, syllabus and paper library after the updated website is deployed. **No account can manage jobs until independently provisioned as Super Admin.** See [ADMIN_JOB_MANAGEMENT.md](./ADMIN_JOB_MANAGEMENT.md) and [backend/EMAIL_SETUP.md](./backend/EMAIL_SETUP.md). The existing School Suite is unchanged.


Status: **working public practice preview; NOT ready for paid memberships**.
This module belongs to the LAMA Studio website, not the School Suite. Keep school data, user roles, payment records, and subscriptions separate.

## First release scope

Priority: Headmaster / Headmistress BS-17 and Senior Headmaster / Headmistress BS-18 educational administration preparation. Other PPSC posts appear as future preparation tracks; they are **not** currently supplied with full question banks. The job catalog references historical results, not currently open vacancies.

## Implemented

- Mobile-first academy entry, separate job cards and per-job preparation roadmaps.
- Teaching administration free paper with 100 MCQs, 90-minute timer, explicit start and submit, countdown pinned to the page, answer persistence on this browser, unanswered-question navigation, and automatic submission at timeout.
- Correct-answer explanations, question-option rotation and migration of earlier saved answer indices.
- Per-attempt local scores, weak-subject breakdown, recent score trend, suggested five-day revision plan, CSV export and confirmed local-history deletion.
- Print layout, basic study planner, and offline PWA shell. Offline installation and cross-browser behavior still require device testing.
- Automated GitHub Actions checks for JavaScript syntax, navigation IDs, and paper structure; see `validate-papers.cjs`, `check-links.cjs`, and `check-exam-contract.cjs`.

## Not implemented — must not be advertised as active

- Candidate signup, verified email/password login, password reset, and persistent user identity. The visible registration form is **disabled** until a secure backend is configured.
- Cloud score history and cross-device synchronization.
- Payment screenshot/transaction reference submission, payment reconciliation, manual Super Admin approval, and subscription activation.
- Premium access authorization and 500 validated 100-MCQ papers. The 500-paper figure is a **target**, not current content.
- Official syllabus verification for each recruitment case; current study topics are educational guidance, not confirmed case weightings.

## Proposed paid access policy

PKR 1,000 per verified candidate for 12 months, academy-wide access to all published job-specific tracks during the active period. This is a planned policy, not a currently purchasable product.

## Backend groundwork (not deployed)

A provider-neutral, isolated PostgreSQL draft is available at [`backend/schema.sql`](./backend/schema.sql), with the proposed API and security rules at [`backend/README.md`](./backend/README.md). These are **design files only**. No database was created, no candidate registration was activated, and no payments can be accepted.

## Secure backend acceptance requirements

1. Choose the academy's authentication and storage service and configure secrets outside the public GitHub repository.
2. Server verifies email ownership; passwords must be processed by the authentication provider, never stored in localStorage, Google Sheets or public code.
3. Server checks every protected request for user identity, role, and active subscription. Hiding buttons is **not** access control.
4. Payment submission creates a pending record with transaction reference, claimed amount, optional private evidence upload and audit timestamps. Do not grant access from a screenshot alone.
5. Super Admin approves only after independent transaction reconciliation. Approval must be idempotent and recorded in an audit log.
6. Start and expiry times are server-generated; expiration is enforced server-side for premium papers.
7. Scores and answers are associated with the authenticated candidate; provide access control, export/deletion rules, and backup/restore procedures.
8. Verify question provenance, originality, difficulty, non-repetition, and official PPSC case-specific syllabus before premium publication.
9. Run integration tests for authentication, payment review, unauthorized access, expired membership, data recovery, and mobile PWA behavior.
10. Obtain explicit approval before deploying new changes to Vercel. GitHub commits do not themselves prove production publication.

## Developer checks

```bash
node education-academy/validate-papers.cjs
node education-academy/check-links.cjs
node education-academy/check-exam-contract.cjs
for f in education-academy/*.js education-academy/*.cjs; do node --check "$f"; done
```

These checks detect structural issues but **do not establish academic accuracy or production security**.

## Job-wise paper library (6 November 2026)

- `jobs.js` is the single public preparation-job catalog; the Papers & Examinations job dropdown is derived from it (including the two school-head post variants).
- `paper-library.js` discovers only explicitly public, full-length free papers. The legacy `DEMO-01` educational foundation set remains available for teaching administration. To publish another free paper, add an academically reviewed 100-item object to `LAMA_PPSC_PAPERS` with `jobIds: ["job-id"]`, `access: "free"`, `publishStatus: "public"`, and `reviewStatus: "approved"`. Its questions require unique IDs, clear answers and substantive explanations. Run the paper validation and editorial review before publishing.
- Other jobs display syllabus and planning links with an honest unpublished status; no teaching paper is mislabelled for another profession. Only public papers are shipped to visitors; do not put premium answer keys in public JS files.
- Paper states come from existing local `lama_ppsc_attempt_<paperId>` and `lama_ppsc_history_v1` records. Saved scores, in-progress timers and previous answers are not overwritten by the new library. Backups remain available under My Scores.
- Job track availability does **not** mean the PPSC vacancy is open or the case-specific syllabus is verified. User data is browser-local unless the configured and authenticated cloud attempt API separately reports a successful save.
- The 500-paper figure is a roadmap, not a published paper count. Subscription activation and secure entitlement checks must be completed server-side before paid content is released.
