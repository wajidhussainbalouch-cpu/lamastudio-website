# LAMA PPSC Preparation Academy — MASTER PROJECT HANDOFF
**Last updated:** 2026-11-05  
**Status:** Development preview, NOT ready for paid launch  
**Canonical repository:** `wajidhussainbalouch-cpu/lamastudio-website`  
**Branch:** `main`  
**Website:** https://www.lamastudio.pk/  
**Academy route:** https://www.lamastudio.pk/education-academy/index.html  
**Source folder:** `education-academy/`

> **NEW CHAT: READ THIS FIRST.** Continue the existing project in place. Read this file, `README.md`, `index.html`, `engine.js`, `papers.js`, `jobs.js`, `shell.js`, `sw.js`, and the existing quality-check scripts before modifying code. Fetch the current GitHub `main` files and check latest commits; this document may be older than the source. Do not claim features are live simply because they are committed. Do not deploy without fresh explicit authorization. Do not overwrite or damage other LAMA Studio modules or the School Suite.

## 1. Vision and ownership
Build a professional, commercially viable, mobile-first **LAMA PPSC Preparation Academy**, part of the LAMA Studio website and reachable from its homepage/Education category. It is **NOT** part of the LAMA School Suite and must have isolated data, accounts, subscriptions, permissions, and storage.

Mission: help serious candidates prepare for Punjab Public Service Commission (PPSC) recruitment examinations through job-specific syllabus guidance, original and academically checked questions, full-length timed papers, performance reports, topic-level remediation, and a reliable study plan.

Permanent user-facing name: **LAMA PPSC Preparation Academy**. Avoid naming the whole academy “Teaching Academy,” “PPSC Lahore Academy,” or “LAMA Education Academy.” The first **active** job track is educational administration. Other job tracks will be developed later. Do not imply the academy is officially affiliated with PPSC or that a historical results list is an open vacancy announcement.

The owner works primarily from an Android phone and wants changes committed directly to the existing GitHub repository. Prioritize working end-to-end functionality, clean UI, fast load, and realistic launch gates over repetitive interface-only changes.

## 2. First-priority recruitment tracks
**FIRST ACTIVE TRACK**: Headmaster / Headmistress BS-17 and Senior Headmaster / Headmistress BS-18, including relevant educational leadership/administration preparation. Keep distinct official syllabi and exam patterns for different case numbers and posts **only when confirmed by an official source**. Never fabricate official subject weights, recruitment notices, eligibility, or exam dates.

Other PPSC job cards are **future tracks**, based partly on a historical PPSC result-list screenshot: lecturer, Information Officer, Water Management Officer, Assistant Registrar Cooperative Societies, Junior Clerk, Stenographer, Child Psychologist, Data Analyst, Manager IT, Assistant/Deputy Superintendent Jail and other entries already present in `jobs.js`. Cards can show provisional study roadmaps, but must be clearly marked as not yet having a dedicated question bank. Candidate should select a job first; then see **that job's** syllabus, papers, material, study plan, and exam preparation.

## 3. Approved candidate journey
1. LAMA Studio homepage/Education category: a concise PPSC jobs preparation introduction and **Enter the Academy** button, not BS-17-only marketing.
2. Academy welcome: logo, benefit cards with distinct complementary colors, mobile-left three-line hamburger icon (no “Menu” text), Install App control, and job cards.
3. General sidebar: Job Categories, My Scores & Progress, Membership, New User Registration, Install Academy App. Remove redundant or nonfunctional entries.
4. Select Headmaster/Headmistress BS-17/18: open dedicated preparation track, with syllabus/materials, paper list, planner, exam and scores.
5. One **complete free trial paper**, **100 original MCQs**, **90 minutes**, explicit **Start Examination** (never auto-start on entering/scrolling), visible sticky countdown and paper position, remaining time, unanswered count, jump-to-unanswered, persistent **Flag for review** checkboxes and next-flagged navigation, confirmation before submission, automatic submission at timeout.
6. Results: score, correct/wrong/blank, explanations, subject strengths/weaknesses, saved attempt history, score trends, recommended revision, printable paper and CSV export and optional validated JSON score backup/restore (manual file transfer only, **not** cloud sync). Candidate should be able to see performance across Paper 1, Paper 2, etc., once more papers exist.
7. New registration: name, email, occupation and other strictly necessary details, password with show/hide, verified account, login and password reset. **Current form is not operational.**
8. Subscription: **PKR 1,000 for 12 months per verified candidate**, intended to grant academy-wide access to all published job tracks during active membership. Show the plan only once prominently, not repeated in several sections.
9. Manual payment flow (future): candidate submits transaction reference and optional screenshot via private secure upload; Super Admin independently verifies receipt, then approves/rejects. Do not activate based on screenshot alone.
10. Premium papers available only after **server-side** subscription validation. Expiration, renewals, refunds and audit trails required.

## 4. Examination and academic content requirements
- Long-term target: **500 complete papers × 100 MCQs = 50,000 question slots**; NOT yet created. Do not advertise as ready.
- Separate original, syllabus-relevant question banks for each post/case; 80 professional education + 20 general ability is an **earlier provisional target**, not an official PPSC pattern.
- Question fields: stable ID, subject, topic/subtopic (to add), stem, four plausible unique options, answer index, specific evidence-based explanation, difficulty, provenance/review status, syllabus version/case applicability, reviewer and revision date (to add).
- Academic QA: detect duplicate/rephrased questions, ambiguous stems, unsupported facts, wrong keys, weak distractors, generic explanations and answer-position patterns. Human review of all questions required before paid release.
- Print/PDF: professional compact two-column question layout, minimal wasted space, header **LAMA PPSC Preparation Academy**, footer **A Project of LAMA Studio.pk**, tasteful `lamastudio.pk` watermark, and square L brand with **Software · Education · Innovation**. Preserve legibility; optional answer key must not appear on candidate paper.
- Online paper timing must be tamper-resistant for premium exams using server timestamps, not only client localStorage.
- Review real past-paper patterns and current official PPSC case-specific syllabi before making claims. Do not copy proprietary past papers without permission.

## 5. Existing implementation — inspect source for exact current behavior
| File | Purpose |
|---|---|
| `index.html` | Responsive academy UI, benefits, job cards, menu, registration preview, membership, teaching preparation, examination, score reporting |
| `jobs.js` | Job catalog; only teaching track marked ready |
| `shell.js` | Menu, job selection, route visibility, PWA install controls |
| `papers.js` | 100-question educational practice paper, explanations, stable option rotation |
| `engine.js` | 90-minute timed exam, answer persistence, flagged-question review navigation, submission, local history, topic scores, revision plan, trend, CSV export, validated JSON score backup/restore |
| `app.js` | Older planner/sample interactions; inspect before removing or refactoring |
| `print.html` | Printable question paper |
| `manifest.webmanifest` | PWA metadata; currently lacks real install icons |
| `sw.js` | Offline shell cache and service worker; review scope/security |
| `validate-papers.cjs` | Paper structure, repetition and generic-explanation checks |
| `check-links.cjs` | HTML anchors, duplicate IDs, required controls |
| `check-exam-contract.cjs` | Exam start/submit guards, migration, flag persistence, public cache contract checks |
| `README.md` | Technical implementation and release gates |
| `backend/schema.sql` | Unapplied isolated PostgreSQL schema draft with deny-by-default RLS enabled |
| `backend/supabase/001_candidates.sql` | Unapplied Supabase Free candidate profile migration with auth.uid() owner RLS |
| `supabase-config.js` | Disabled-by-default public Supabase configuration placeholder |
| `auth-supabase.js` | Inert candidate auth adapter; no live sign-up, no persistent session |
| `backend/README.md` | Proposed authenticated API contract and payment-approval security rules |
| `.github/workflows/ppsc-academy-checks.yml` | GitHub Actions syntax and QA checks |

Existing exam records are stored **locally in the current browser**. This is not an account or cloud record. Browser clearing/device change can lose history unless the candidate has explicitly exported and safely retained a JSON score backup. Backup files contain personal performance data; restoring them is not identity verification. The study plan and revision recommendations are guidance, not official syllabus verification or a guarantee of passing.

## 6. Visual design and image inventory
**Approved appearance based on the owner's screenshots and feedback:**
- Dark forest-green academy header, white text, clean white/soft-green cards and modern rounded corners.
- Small square **L** mark/logo; LAMA Studio branding and tagline **Software · Education · Innovation**. Existing academy HTML draws the mark with text/CSS; do **not** mistake it for a finished PNG/SVG logo.
- Hamburger `☰` at **top-left**, icon only. Compact aligned mobile header with Install App at top-right.
- Four academy benefit tiles use different harmonized colors (blue, purple, amber and teal).
- Job cards: first and prominent **Headmaster / Headmistress BS-17 & BS-18**. Distinct card appearance and clear **View Preparation** button. Other jobs marked roadmap-only.
- Keep registration/subscription presentation concise and not repeated three times.
- Exam top bar remains visible while scrolling; print layout is separate from mobile exam layout.

**Screenshots and image limitations:** The owner supplied screenshots of the main website, Education category, academy mobile header, job cards, sidebar, examination and print layouts across ChatGPT conversations. These chat screenshots are **not embedded in this GitHub repository or this Markdown file**. A new chat should ask for or retrieve relevant screenshots when visual pixel-perfect comparison is needed. Do not claim screenshots were attached to this file. The current `education-academy/index.html` has no referenced standalone PNG/JPG/SVG image files, and `manifest.webmanifest` currently defines no icon assets. Creating approved production logo/icon assets and real 192×192 / 512×512 PWA icons is pending. Do not invent asset paths.

**Visual acceptance checklist:** header/menu aligned at 320–430 px; no horizontal scrolling; legible exam timer; accessible touch targets; cards have adequate contrast; PWA icons load; two-column print works on A4; header/footer/watermark do not obscure questions; no dated Independence Day banner.

## 7. Data architecture (required before paid launch)
Use a secure, separate academy backend. An **unapplied** provider-neutral PostgreSQL schema draft, Supabase candidate RLS migration, and API contract are in `backend/`; the disabled configuration and initial auth adapter are in `supabase-config.js` and `auth-supabase.js`. The registration UI is still disabled, and the adapter has no production-ready session refresh or profile sync.  they are not live endpoints or registration. **Owner decision 2026-11-05:** Supabase **Free** is the initial preferred backend, strictly $0 with no paid trial, upgrade or chargeable resources; provider account/project and credentials have NOT been configured. Free projects may pause and have resource limits. School Suite must remain on its existing Apps Script/Sheets architecture.  do not assume Google Apps Script or Sheets can securely handle passwords or premium authorization.

Suggested entities:
- `candidate`: uid, verified email, display name, occupation, createdAt, status.
- `job_track`: id, post, BS grade, official case reference, syllabus source/version, status.
- `paper`: id, jobTrackId, paperNo, questionSetVersion, minutes, publication status.
- `question`: id, stem, options, correctAnswer, explanation, subject, topic, difficulty, provenance, review status.
- `attempt`: uid, paperId, version, serverStart, serverDeadline, serverSubmit, answers, score, subject breakdown, state.
- `payment_request`: uid, amount, currency, transaction reference, secure evidence URL, pending/approved/rejected, reviewer, audit times.
- `subscription`: uid, startAt, expiresAt, status, paymentRequestId.
- `audit_log`: actor, action, target, timestamp, before/after metadata.
- `study_plan`: uid, jobTrackId, targetDate, daily tasks, progress, weak topics.

Access: candidate reads only own records; admin access role-checked on server; premium content gated on every request; no payment evidence in public buckets; never store plaintext passwords, provider secrets or answer keys in publicly accessible premium JS bundles. Protect against duplicate transaction reuse and double approvals.

## 8. Private Super Admin requirements
Separate, private academy administration: pending registrations and payment submissions; independent transaction verification; approve/reject with reason; subscriptions active/expiring/expired; subscriber counts; gross receipts and refunds; candidate account status; paper creation/import/review/publication; question versioning; academic QA reports; audit log; export and backup. No public access to personal records.

## 9. PWA and security
Mobile-first installable PWA, offline access to already authorized material where safe, clear offline state and sync/retry indicators. Public free practice can be cached; premium answer keys and unexpired entitlements must not be exposed by unrestricted static assets. Review `sw.js` so it does not cache arbitrary same-origin pages, private APIs or payment uploads. A service worker cannot replace backend authentication. Candidate data must be protected in transit and at rest; define retention and deletion controls.

## 10. Immediate priorities (do these before polishing more cards)
1. **Verify GitHub Actions checks actually pass**, fix failures; run syntax and question-bank validators. Inspect the 100-MCQ bank and confirm every answer and explanation; replace generic/repetitive items with verified originals.
2. **Fix exam integrity and usability**: restore/resume, timeout, answer migration, flag persistence, rejection of answers before exam start, accidental submission, print layout, local results; test on Android Chrome and offline PWA.
3. **Configure Supabase Free auth/database (zero-cost only)** (review `backend/schema.sql` and `backend/README.md`; neither is deployed) with owner consent; implement registration, verified email, login, reset, per-user storage. Do not put secrets in GitHub.
4. **Cloud sync** attempts, scores, topic breakdowns, planner and progress.
5. **Payment request + manual approval** with audit log and server-enforced annual entitlement.
6. Super Admin dashboard and end-to-end security tests.
7. Premium paper publishing workflow, job-specific official syllabus review, content scale-up and printable assets.
8. Final accessibility, responsive, PWA install, recovery, backup, and launch acceptance tests.

## 11. Release / deployment policy
- Production is served by Vercel from GitHub `main`.
- Owner authorized **one prior production deployment**; do not interpret that as standing permission for unlimited deployments.
- GitHub commits are not automatically proof that production updated. Verify deployment SHA, state and assigned domains before reporting “live.”
- Do not accept payments, publish premium subscription checkout or claim production readiness until backend and access control have been verified.
- Preserve unrelated LAMA Studio homepage modules and **all** School Suite functionality and data. No destructive replacements.

## 12. Instructions for a new ChatGPT development conversation
1. Read this handoff and current source first.
2. State **what is actually implemented, what is missing, and what you will work on now**.
3. Make substantial, logically grouped code improvements; do not stop at cosmetic changes.
4. Run or verify tests, and be candid about tests that have not run.
5. Commit only tested, non-destructive changes to GitHub `main` as authorized for development. Do not deploy without fresh approval.
6. Update this file and `README.md` whenever functionality or architecture changes.
7. Ask the owner only for necessary decisions/credentials through secure configuration workflows; never ask them to paste private keys into chat.
8. When discussing the screenshots, use the design descriptions above and request specific missing image references instead of claiming assets exist.
9. Maintain the single most important near-term objective: **a genuinely useful, reliable, academically sound Headmaster/Headmistress BS-17/BS-18 preparation experience**, then secure paid launch.

### New-chat starter prompt
> Continue development of **LAMA PPSC Preparation Academy** in GitHub `wajidhussainbalouch-cpu/lamastudio-website` on `main`. Read `education-academy/PROJECT_MASTER_HANDOFF.md`, `README.md` and current implementation first. Follow the first-priority BS-17/BS-18 Headmaster/Headmistress requirements, preserve all existing website and School Suite data, verify changes and tests, commit meaningful improvements, update the handoff, and **do not deploy to Vercel without my explicit approval**. Prioritize working exams, question quality, secure registration, cloud records, subscription verification and Super Admin over cosmetic UI changes.


### Mobile live-test issue (2026-11-05)
User confirmed the public academy page displays the free Paper 1 and Start Examination button, but reported that tapping Start does not open the exam. Removed the JavaScript `confirm()` start gate so a single tap starts immediately; updated the public PWA cache to v24. This is a candidate fix, **not yet confirmed on the live production site**. Test that `examWorkspace` opens, Question 1 renders, timer counts down and answers persist on refresh. If the button still fails, inspect browser console for runtime errors, verify `papers.js` and `engine.js` network loads, and verify production deployment SHA. Do not deploy without authorization.

### Mobile screenshot finding: missing Start button (2026-11-05)
Screenshot shows empty job cards and no teaching/exam section, while static cards render. This suggests the job/engine scripts may be unavailable or failing in the deployed version, but runtime root cause is not confirmed. Committed fallback in `index.html`: show `teachingAcademy` by default, add direct hero `#paper` link and static Headmaster/Headmistress job card with direct paper link; service-worker cache v25. This guarantees the start-button markup is not hidden when `shell.js` fails, but actual timer/questions still require `papers.js` and `engine.js`. **Live deployment not verified and not initiated.** Next verify script network loads and console errors, and test end-to-end after authorized deployment.

### Live desktop-mode screenshot: missing job categories, missing examination, misaligned benefit cards (2026-11-05)
User screenshot showed empty job category grid, no Start Examination button and uneven colored benefits. Added a fixed-height responsive 2-column benefits grid, prominent always-visible link to free Headmaster/Headmistress Paper 1, and **all 16 job roadmaps as static HTML fallback cards**, each with relevant preparation topics. Only Headmaster/Headmistress is marked with a published free practice paper; others explicitly state their job-specific exam is not yet published. Existing `shell.js` dynamically replaces static cards if working. The teaching examination section remains visible by default, so it does not depend on `shell.js` to be unhidden. Cache bumped to v26. **Not deployed or browser-verified**; confirm production deployment before claiming live fix. If cards still absent, inspect deployment and service worker asset delivery. Future papers must be keyed by job ID, with per-job syllabus and question bank; never reuse teaching exam for unrelated jobs.

### Mobile load diagnostics (2026-11-05)
Added a visible non-invasive load-status banner in `index.html` that appears **only if** the dynamic job catalog, 100-question paper bank, exam question controls or static job cards fail to initialize. It reports which component is unavailable and offers Refresh Academy. Does not clear saved scores or attempts. Public cache v27. This is a diagnostic, not proof of a live fix. **GitHub-only; no deployment.** Next inspect live banner after approved deployment and fix exact script failure; ensure job-specific exams are independently authored and validated before activation.


### Connected Supabase Free database implementation (2026-11-05)
Supabase project **LAMA PPSC Academy**, project ref `cqoeokovxuimbltskuze`, is ACTIVE_HEALTHY. Connected Supabase tools verified access. No database password or service-role key belongs in GitHub.

Applied and verified in the live Supabase database:
- `public.ppsc_candidates`: primary key `id` references `auth.users(id)`; `display_name`, optional `occupation`, timestamps. RLS enabled, own-row SELECT/INSERT/UPDATE policies, UPDATE column grants limited to `display_name` and `occupation`.
- `public.ppsc_practice_attempts`: UUID attempt ID, `candidate_id` references `auth.users`, job/paper IDs, total and correct counts, duration, completion timestamp, fixed `source='client_practice'`. RLS enabled; authenticated users can SELECT and INSERT only their own attempts; no client UPDATE/DELETE grants. Index on candidate and completion date. **Client-submitted practice scores are unverified** and must never be used as authoritative graded results, payment confirmation or premium entitlement.
- Revoked PUBLIC/anon/authenticated EXECUTE on pre-existing `public.rls_auto_enable()` privileged function after security advisor identified exposed execution.
- Supabase security advisor returned **zero findings** after changes. Both public tables verified RLS enabled; currently empty.

**Not yet done:** integrate web UI with Supabase Auth and profile/attempt sync, verify signup email confirmation and session refresh, secure server-side grading for authoritative results, verified payment/subscription workflows, end-to-end browser tests. Existing website registration remains disabled. Keep academy separate from School Suite and do not deploy Vercel without explicit approval.


### Supabase subscription ledger (2026-11-05, continuation)
Applied migration `create_private_write_ppsc_subscription_ledger` to project `cqoeokovxuimbltskuze`: `public.ppsc_subscriptions` with candidate FK, pending/active/expired/rejected/cancelled statuses, approval and date fields, and validity constraints. RLS enabled. Authenticated candidates have **SELECT only** for their own rows; anon and authenticated have no INSERT/UPDATE/DELETE grants. SQL grants inspection verified authenticated SELECT only, and security advisor reported zero findings. There is **no trusted admin payment approval workflow yet**; no subscription can be activated from browser. Keep payment collection and premium gates disabled until verified admin-only backend and end-to-end tests are completed. Do not confuse this table with self-reported `ppsc_practice_attempts`.


### Supabase browser adapter expansion (2026-11-05)
Updated `education-academy/auth-supabase.js` on `main` with in-memory access/refresh tokens (not persisted in localStorage), token refresh when needed, REST profile read/create, candidate-scoped practice history read/insert, and read-only subscription status. Strict local validation for practice attempts. JavaScript syntax check passed. **The config stays `enabled:false`, signup UI stays disabled, and no Vercel deployment occurred.** Not yet browser/end-to-end tested. Cloud practice results remain unverified browser submissions; profile creation must be wired to confirmed-email signup/login; check handling of session expiry, account verification, and errors before enabling.


### Candidate account UI implementation (2026-11-05)
Added accessible signup, login, password reset, sign-out, cloud practice history and read-only subscription UI to `index.html` and new `candidate-account-ui.js`. Entire interactive account area remains **hidden until `supabase-config.js` is explicitly enabled**; public configuration remains disabled and no credentials are accepted by the site yet. Candidate auth module uses in-memory tokens. Added UI file to PWA cache v28. Syntax checked controller, but **browser/end-to-end behavior and email confirmation remain untested**. IMPORTANT: do not enable until email delivery, redirect allowlist, authenticated profile creation, token refresh and real-device tests pass. Current candidate signup metadata is not yet automatically inserted into `ppsc_candidates`; implement secure post-confirmation profile creation before release. Cloud score save function exists but is not yet called from exam engine. GitHub-only; do not deploy without explicit authorization.


### Candidate profile initialization and cloud practice saving (2026-11-05)
`auth-supabase.js` now exposes `ensureProfile()` to create an own-row candidate profile from signed-in Auth `user_metadata.full_name` and occupation if missing; UI invokes it after verified sign-in. User metadata is used only for profile display, **never** authorization or premium entitlement. `engine.js` attempts an authenticated cloud INSERT for a completed free practice paper and reports failure without losing local history. `sw.js` cache bumped to v29. All three changed JS files passed syntax parsing. **Unverified browser flow**: email confirmation, signup/login, profile RLS, cloud attempt insert and recovery need real candidate tests. Cloud saves currently have no stable idempotency key and a failed write may need manual retry; avoid treating attempts as official exam results. Signup config remains disabled, and no Vercel deployment was initiated. Also note no durable login across reload because tokens are intentionally memory-only; improve with a reviewed secure session strategy before public launch.


### Job-first dashboard and dedicated examination navigation (2026-11-05)
Based on mobile screenshot feedback, `index.html` now routes the dashboard to job categories and hides membership, registration, scores, study plan, resources and paper until selected. Sidebar contains Dashboard/Job Categories, Study Plan, Papers & Exams, Syllabus & Resources, Scores, Membership and Registration. Added `academy-router.js` to map hashes to dedicated visible sections; clicking Start Examination keeps the existing exam engine responsible for starting the timer and displaying the question workspace. PWA cache bumped to v30. Router JavaScript syntax checked. **GitHub-only: live mobile behavior not yet tested or deployed**. Verify actual browser navigation, job-card selection, start click, 100-question rendering, 90-minute timer, reload persistence, and back navigation before calling complete.


### Navigation conflict repair (2026-11-05)
After job-first router implementation, reviewed `shell.js` and found stale `showPassword` / `previewPassword` references (removed by account UI replacement) which would throw during initialization, plus old `showTeaching` / menu handlers that overrode selected hash routes. Removed stale handler, synchronized job-detail and category routes, prevented track navigation from resetting to `#papers`, and hardened `academy-router.js` entry display and job detail handling. Dashboard hides overview to show jobs only; all other modules are sidebar/dedicated views. PWA cache v31. Syntax checks passed for `shell.js`, `academy-router.js`, and `engine.js`. Browser interaction tests and Vercel deployment still pending; do not claim live fix until verified.
