# LAMA PPSC Academy — Private Super Admin Job Manager

## Verified implementation status — 6 November 2026 (latest)

**Super Admin:** One academy Auth account associated with the designated owner mailbox was independently matched to the connected Gmail account and provisioned in the protected `ppsc_admin_members` registry. The account is **not yet email-confirmed** and cannot sign in until its 6 November Supabase confirmation email is opened and confirmed. No Auth confirmation was bypassed. Another existing candidate account is confirmed.

**Candidate verification:** Supabase Auth sent a confirmation email to the owner's Gmail inbox, with a **Supabase Auth sender**. SMTP branding as LAMA PPSC Academy is **not** activated. A private `ppsc_candidate_registrations` status mirror and Auth trigger now track real confirmations and create valid candidate profiles after verification. At last check: **2 registrations / 1 confirmed / 1 candidate profile / 1 authorized Super Admin**. No arbitrary candidate email was marked confirmed.

**Real job record:** The priority Headmaster/Headmistress education preparation entry (`teaching`) exists as a **published Supabase-managed job** with six suggested subjects and vacancy status `unverified`. It is not an official open PPSC application. RLS role simulations confirmed public visibility, authorized administrator editing, and normal candidate editing denial.

**Private question bank:** `ppsc_question_bank` contains **30 new original draft MCQs across 11 subjects**, IDs EDU-HM-101–130. All are private, unpublished and awaiting academic review. Question-key rotation preserved every correct answer. Super Admin form, JSON bulk import/export and a read-only verification list are committed, with no public answer-key exposure. See [QUESTION_BANK_WORKFLOW.md](./QUESTION_BANK_WORKFLOW.md), [ADMIN_JOB_MANAGEMENT.md](./ADMIN_JOB_MANAGEMENT.md), and [backend/EMAIL_SETUP.md](backend/EMAIL_SETUP.md).

**Deployment:** Changes are in GitHub `main`. Connected Vercel reported a READY production build from an earlier commit, but **the newest Admin and question editor code has not been verified on the live domain**. No additional manual Vercel deployment was initiated. Automated GitHub tests cover source integrity, not live Chrome/PWA sign-in, SMTP configuration, or paid membership.

**Next release gates:** candidate must click email confirmation, current build must deploy, real browser sign-in and create/edit tests must run, and SMTP domain/sender must be verified before unrestricted public registration. Premium payment and private server-side exams remain disabled.


**Updated:** 6 November 2026
**Status:** Database table and source code implemented. Website deployment, Super Admin account provisioning, and live browser verification still required.

## How to add a new job

1. Open https://www.lamastudio.pk/education-academy/admin.html after the updated website is deployed.
2. Sign in with an account explicitly authorized as a LAMA PPSC Super Admin.
3. Open the **Manage PPSC Jobs** section. Enter the job title, department/post, category, optional case number and listing date, and 1–25 suggested subjects (one per line).
4. The job ID is suggested from the title. Adjust it before the first save. It remains fixed during editing.
5. Set the vacancy status: unverified, upcoming, open, or closed. To mark **open**, an official ppsc.gop.pk URL is mandatory; a URL alone does not prove that a notice is current.
6. Save as **Draft** first. Check **Publish for candidates** only after reviewing details. Use **Edit** to change or unpublish the entry later.
7. Published entries are loaded automatically from Supabase by catalog-store.js and merged into the shared jobs list. The Dashboard, Study Planner, job-specific Syllabus Finder, and Papers & Examinations selectors all receive them. Users with an open page may refresh; the loader also refreshes on window focus.

Adding a job **does not** create question papers, activate premium membership, or verify a PPSC recruitment opening. New jobs show preparation guidance and an accurate no-paper-yet state. The existing Headmaster/Headmistress paper remains assigned only to the teaching track.

## Where jobs are stored

Supabase project: **LAMA PPSC Academy**. Table: **public.ppsc_job_catalog**.
Migration name in Supabase: **ppsc_super_admin_job_catalog_rls** (applied 6 Nov 2026).
The built-in jobs.js file remains an offline/connection fallback. Administrator-created jobs are kept in Supabase, not manually committed into the website for every new post.

## Authorization

- Public visitors, including unauthenticated users, can read **published preparation metadata only**.
- Ordinary registered candidates cannot insert, update, or unpublish job entries.
- Only a verified Supabase account whose ID is explicitly provisioned into public.ppsc_admin_members with role **super_admin** can write. Supabase Row Level Security enforces this; merely seeing the HTML page does not grant permission.
- At inspection on 6 November 2026, there were **0 provisioned Super Admin accounts**. This was not changed because the correct owner Auth UID has not been independently verified. Never promote the first registrant or an email claimed in a browser.
- Provisioning requires a trusted project administrator to identify the intended account in Supabase Authentication → Users and insert that exact ID in the existing private admin registry. Revoke permission there when necessary.
- Premium question keys and payment administration are separate; never put restricted answer keys, candidate passwords, or billing secrets in the public job table.
- All dashboard changes are source commits only until website deployment; the live site cannot update itself merely from a GitHub commit.

## Main files

- admin.html / admin-jobs.js: private job editor.
- auth-supabase.js: authenticated read and write API.
- catalog-store.js: publicly accessible published metadata loader.
- jobs.js: fallback catalog.
- shell.js, job-catalog-ui.js, app.js, syllabus-finder.js, paper-library.js: consumer views and event-driven updates.
- backend/supabase/002_admin_jobs.sql: reviewable snapshot of applied database schema.
- test-job-catalog.cjs: basic job visibility and source-merge regression coverage.

## Remaining acceptance checks

- Authorize intended Super Admin using an independently confirmed Auth UID.
- Run an actual authorized create, edit, unpublish and public-view cycle.
- Attempt inserts/updates as a normal candidate and unauthenticated user and confirm denial.
- Verify mobile Chrome, offline PWA fallback, published-domain release, and real-time refresh behavior.
- Audit access and role revocation. Maintain original site and School Suite isolation.
