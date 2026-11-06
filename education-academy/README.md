# LAMA PPSC Preparation Academy — development handoff

## Most recent Headmaster/Headmistress bank — Paper 5 (6 November 2026)

**Paper 5** (`HM-2026-P05`) is now authored and committed as **100 more original free-practice MCQs** (`HM05-001` through `HM05-100`). The academy source now contains **five separate free school-head papers, 500 total practice questions**. The new paper retains its own 90-minute state, separate saved attempts and scores, and post-submission correct answers, explanations, and Print / Save PDF review. Papers 1–4 and all existing marks remain intact.

The new 100-question batch was also inserted into the RLS-protected Supabase `ppsc_question_bank` as academic editorial drafts. The **private Headmaster/Headmistress bank now contains 430 unique question stems**, **430 still needing human approval**. Automated tests found no exact or strong word-overlap duplicates against earlier papers/drafts, and the question/answer structures passed. These are original LAMA educational practice questions, **not officially issued PPSC questions**, not independently verified syllabus coverage, and not secure premium material. Answer keys inside free client scripts remain inspectable.

Read **[PAPER_05_RELEASE.md](./PAPER_05_RELEASE.md)** for the complete changes, quality checks and next `Continue` instructions. The next Paper 6 batch is reserved as `HM06-001`–`HM06-100`, with paper ID `HM-2026-P06`. Keep GitHub `main` authoritative, verify actual Supabase status before inserting, preserve past candidate data, and update the exam/print/review/PWA/test/documentation files. **GitHub commits and checks are not proof that Vercel has deployed the new code**; do not manually deploy under the existing quota restriction.


## Latest content release — Paper 4 (6 November 2026)

**Headmaster / Headmistress Paper 4** (`HM-2026-P04`) adds **100 unique original free-practice MCQs** (`HM04-001` through `HM04-100`), complete with four choices, answer keys, explanations, difficulty and subject tags. Source registration, selected-job card, 90-minute attempt, independent saved score, question-only printing and post-submission answer-review/PDF printing are integrated. **Four school-head free practice papers / 400 public MCQ slots** now exist in GitHub source; previous papers and attempts are preserved.

**Supabase private draft bank** now has **330 unique school-head question records** (30 original drafts + 100 from each Paper 2, Paper 3 and Paper 4). All 330 remain drafts pending independent human academic review. SQL and GitHub automated checks passed; this is not a verified official PPSC paper or secure premium examination. Public practice answer keys are client-inspectable; the post-submission interface gate only guides practice.

**Read `PAPER_04_RELEASE.md` before the next `Continue`.** Next Paper 5 should add 100 original questions with IDs `HM05-001`–`HM05-100`, compare against every previous source and Supabase draft, retain all candidate data, update tests and PWA cache, and commit to GitHub `main`. Source commits and Supabase storage are **not proof of live Vercel deployment** or mobile-browser testing. No manual deployment is authorized.


**Private-bank usability fix:** With 230 stored records, the Super Admin editor formerly loaded only the newest 200. `auth-supabase.js` now requests successive RLS-protected pages of 250, retaining all authorized rows up to 5,000 (and reporting an error instead of silently truncating beyond that limit). The editor's search, review and explicit private JSON export can therefore reach earlier items. Private answer-key export requires user confirmation. For larger banks, replace whole-bank loading with server-side search and cursor pagination.


## Paper 3 completed — 6 November 2026 (newest academy question-bank status)

**Headmaster / Headmistress Paper 3** (`HM-2026-P03`) now contains **100 new original free-practice questions** (HM03-001–HM03-100), a separate 90-minute exam state, post-submission marks, per-question answer/explanation review and printable answer key. Papers 1 and 2 remain intact: **3 free school-head papers / 300 public practice questions** in the GitHub source.

The 100 additional questions are also saved as private **Supabase editorial drafts** under the `teaching` job. The private bank contains **230 unique question stems**, with **0 independently human-approved** items. Do not represent automated QA as academic approval or the papers as an official PPSC syllabus. Public free JavaScript contains the keys, so post-submission hiding is a user-experience gate and is not a secure premium exam design.

GitHub CI now tests Paper 3's item counts, answer positions, source originality, question-only printing, answer-key unlock, job links and PWA loading; all older exam records and school modules are preserved. Read [PAPER_03_RELEASE.md](./PAPER_03_RELEASE.md) first for the next `Continue` (Paper 4, IDs HM04-001–HM04-100). Latest source commits and automated testing do not, by themselves, establish whether the current live Vercel build or mobile Chrome has been updated.


## Latest verified Paper 2 development — 6 November 2026

A **second original Headmaster / Headmistress free practice paper (HM-2026-P02)** has now been authored with **100 new MCQs** (HM02-001 to HM02-100), 90-minute timer, post-submission answer key, explanations, and print-to-PDF via the browser. Both school-head preparation options display Paper 1 and Paper 2. Existing Paper 1, local scores and other academy modules are retained.

**Private Supabase bank:** the 100 additional questions were inserted as draft records in ppsc_question_bank, alongside the earlier 30 private drafts (**130 total, 130 unreviewed drafts, 0 human approved**). A free practice copy uses automated structural and duplicate checks and **must not be described as independently academically approved or official PPSC questions**.

**Non-repetition:** 100 new unique stems and IDs. Checks compare against Paper 1's 100 stems, 30 pre-existing private-stem fingerprints, and the new 100 internal pairs. Automatic answer-position rotation preserves the correct response. The paper's source contains answer keys because it is free practice; candidate UI displays them only after submitting. **Premium/private exams still require server-side answer security.**

**Files:** papers/headmaster-02-part1.js through part4.js, papers/headmaster-02-register.js, answer-key.html, index.html, print.html, paper-library.js, engine.js, sw.js, expanded validators and GitHub Actions. Read **PAPER_02_RELEASE.md** first before working on the next 100-question batch; next Paper 3 IDs are HM03-001 to HM03-100. Do not overwrite older papers or score records.

**Release distinction:** GitHub commits and automated CI do not prove that a latest Vercel production build is live or mobile-tested. No manual Vercel deployment was requested in this batch. Confirm actual production commit before sending candidates to the new paper.


## Final integration checks — 6 November 2026

- **Admin identity:** The previously designated academy owner email was matched to the connected Gmail account and to its existing Supabase Auth UID, then provisioned with `super_admin` in `ppsc_admin_members`. The Gmail confirmation message was confirmed delivered, but **the owner has not yet clicked the confirmation link** and the Auth account remains unconfirmed. Admin sign-in is blocked until the user completes that step.
- **Public job test:** the actual Headmaster/Headmistress preparation track is published as a managed Supabase job, status **unverified** (not an open vacancy). Using database transactions that were rolled back, an authenticated Super Admin role successfully inserted a test draft job; an ordinary candidate role was rejected by RLS. No test job remains.
- **Candidate verification:** private status mirror has two registrations, one confirmed and one pending; one candidate profile was created for the confirmed account. `admin-registrations.js` displays read-only status. Signup now requests an academy `confirm.html` redirect and includes a **Resend confirmation email** option. Configure the Supabase redirect allow-list and custom SMTP before unrestricted release. The observed email was sent by **Supabase Auth**, not an academy-branded sender.
- **Private MCQs:** 30 new Headmaster/Headmistress drafts across 11 subjects. Correct options were distributed across A–D (7 / 8 / 9 / 6) with answer-text preservation checked. They are private and not a second published 100-MCQ exam. The private Super Admin editor supports draft/review, JSON batch imports of up to 100 and local export of the last loaded 200.
- **PWA:** `admin.webmanifest`, `admin-install.js` and the secure login page provide a private admin installation path; the service worker caches only public academy shell assets, never private candidate or question bank API responses. **Android install and live mobile UX remain unverified.**
- **Tests:** Supabase role simulations, public visibility checks, answer-key rotation QA and GitHub Actions regression tests passed. Actual candidate browser signup, email-confirmation click, Super Admin UI sign-in, SMTP branding and live website deploy still have user/external dependencies. Do not claim these gates completed.
- **Deployment:** Vercel's latest inspected READY production deployment referenced an earlier GitHub commit, not all of the changes above. No manual deployment was triggered because of the earlier build-limit constraint. Update `main` and verify the live domain after deployment resumes.


## Verified implementation status — 6 November 2026 (latest)

**Super Admin:** One academy Auth account associated with the designated owner mailbox was independently matched to the connected Gmail account and provisioned in the protected `ppsc_admin_members` registry. The account is **not yet email-confirmed** and cannot sign in until its 6 November Supabase confirmation email is opened and confirmed. No Auth confirmation was bypassed. Another existing candidate account is confirmed.

**Candidate verification:** Supabase Auth sent a confirmation email to the owner's Gmail inbox, with a **Supabase Auth sender**. SMTP branding as LAMA PPSC Academy is **not** activated. A private `ppsc_candidate_registrations` status mirror and Auth trigger now track real confirmations and create valid candidate profiles after verification. At last check: **2 registrations / 1 confirmed / 1 candidate profile / 1 authorized Super Admin**. No arbitrary candidate email was marked confirmed.

**Real job record:** The priority Headmaster/Headmistress education preparation entry (`teaching`) exists as a **published Supabase-managed job** with six suggested subjects and vacancy status `unverified`. It is not an official open PPSC application. RLS role simulations confirmed public visibility, authorized administrator editing, and normal candidate editing denial.

**Private question bank:** `ppsc_question_bank` contains **30 new original draft MCQs across 11 subjects**, IDs EDU-HM-101–130. All are private, unpublished and awaiting academic review. Question-key rotation preserved every correct answer. Super Admin form, JSON bulk import/export and a read-only verification list are committed, with no public answer-key exposure. See [QUESTION_BANK_WORKFLOW.md](./QUESTION_BANK_WORKFLOW.md), [ADMIN_JOB_MANAGEMENT.md](./ADMIN_JOB_MANAGEMENT.md), and [backend/EMAIL_SETUP.md](backend/EMAIL_SETUP.md).

**Deployment:** Changes are in GitHub `main`. Connected Vercel reported a READY production build from an earlier commit, but **the newest Admin and question editor code has not been verified on the live domain**. No additional manual Vercel deployment was initiated. Automated GitHub tests cover source integrity, not live Chrome/PWA sign-in, SMTP configuration, or paid membership.

**Next release gates:** candidate must click email confirmation, current build must deploy, real browser sign-in and create/edit tests must run, and SMTP domain/sender must be verified before unrestricted public registration. Premium payment and private server-side exams remain disabled.


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
