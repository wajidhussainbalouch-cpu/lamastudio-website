# LAMA PPSC Preparation Academy — Private Question Bank

## Latest Academy question bank — Paper 6 (6 November 2026)

**Paper 6 is complete in GitHub source:** `HM-2026-P06`, original MCQs `HM06-001`–`HM06-100`, across teaching, school leadership, educational research, English, ICT and science. It has a **separate 90-minute attempt**, marks, post-submission explanation/answer key and printable PDF review. The earlier five papers remain available with their original history: **6 free Headmaster/Headmistress practice papers / 600 questions**.

**Supabase:** Added 100 private `draft` records; the separate school-head editorial question bank now contains **530 unique normalized stems** (all 530 pending human academic approval). Automated checks verified question uniqueness, options, rationales and paper-link/answer-review logic. The source also uses PWA cache `v61`; tests and GitHub CI passed. **Do not claim official PPSC syllabus endorsement or independently reviewed questions.** Free client JavaScript includes keys and cannot protect premium exams.

The new handoff is **[PAPER_06_RELEASE.md](./PAPER_06_RELEASE.md)**. When the owner says **Continue**, next prepare Paper 7 with **100 additional non-repeating items `HM07-001`–`HM07-100`**, separate ID `HM-2026-P07`, keep old papers and candidate records, insert new private drafts, update CI/PWA/docs. Follow GitHub-only policy: **do not manually deploy to Vercel** under current project constraints. A CI pass is not proof that the latest commit is live or mobile-tested.


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


**Updated:** 6 November 2026  
**Status:** working private Supabase question-draft store, Super Admin editing UI committed, not a published new examination.

## What was implemented

A dedicated RLS-protected Supabase table `public.ppsc_question_bank` is now available. The first batch contains **30 original, scenario-oriented Headmaster / Headmistress practice MCQs**, IDs `EDU-HM-101` through `EDU-HM-130`, covering 11 preparation subjects: School Leadership, School Governance, Assessment, Educational Psychology, Data Interpretation, Inclusive Education, School Safety, Curriculum, Classroom Management, Ethics, and Pedagogy. Each item has a topic, four distinct options, one answer index, explanatory rationale and difficulty. Answer locations were systematically rotated; SQL verification confirmed **all 30 correct answer texts were preserved**.

**All 30 questions are editorial drafts, not human-approved and not available to students yet.** The earlier published 100-MCQ foundation paper remains unchanged. Do not mix draft/private content with public `papers.js`, service-worker assets, or the premium client. A new free/full paper requires 100 independently reviewed questions, deduplication, case-specific coverage verification, balanced difficulty, substantive explanations, 90-minute timing only if appropriate, and full examination tests.

## Super Admin editing

Once the owner has confirmed email and authenticated at `admin.html`, the **Private Question Bank Editor** supports:

1. Select a job that exists in the server-managed job catalog.
2. Enter a stable uppercase Question ID, subject, topic, question, options A–D, correct option, difficulty, and an evidence-based explanation.
3. Save a **Draft**. Existing questions can be opened using **Edit & Review**.
4. After manual academic checking, change the status to **In review** or **Academically reviewed**. That status is internal only; it is **not** publication to the exam system.
5. Import up to **100 draft questions** in a single 1 MB JSON batch. The import is all-or-nothing on conflicting IDs and cannot publish questions. Export the **currently loaded latest 200** question records to a *private* JSON file. Since the export includes answers, retain it securely and do not upload it to the public repository.

An import file has this shape (values below are **illustrative placeholders**, not a valid question):

~~~json
{
  "format": "lama-ppsc-questions-v1",
  "version": 1,
  "questions": [
    {
      "id": "EDU-HM-999",
      "job_id": "teaching",
      "subject": "Assessment",
      "topic": "Content validity",
      "question_text": "A fully written original question of at least thirty characters...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer_index": 1,
      "explanation": "A specific explanation at least forty characters long...",
      "difficulty": "intermediate",
      "source_notes": "Source / fact-check notes"
    }
  ]
}
~~~

All imported rows receive `review_status=draft` even when the file contains a different status. The candidate-facing Papers section **does not** read from this private table. Premium papers need a separate server-owned paper/attempt service with access checks and private answer keys before release.

## Security checks completed

- Anonymous visitors: **no SELECT, INSERT or UPDATE** grant on the private question table.
- Candidate and admin sessions: row-level security is enforced against `ppsc_admin_members`, never `user_metadata`.
- Simulated authenticated Super Admin role: reads 30 private MCQs and the registration mirror.
- Simulated normal authenticated candidate: reads **0** private MCQs and **0** private registration rows; can see the one public job.
- Exam drafts are excluded from public service worker caching.
- 30 inserts validated by the database; no known invalid option counts or answer indices.

These are database/contract tests, **not** a completed live mobile browser sign-in or editorial accuracy audit.

## Next academic batches

Priority is **Headmaster / Headmistress, Senior Headmaster / Headmistress**, then expand by job. Produce genuinely new items by syllabus topic and cognitive level, not rephrased duplicates. Each batch must be reviewed against trustworthy educational literature and the relevant official PPSC case syllabus when available.

A future paper builder should select reviewed, syllabus-mapped items without repeats, store a private paper version and score attempts on the server. Avoid advertising 500 papers or 50,000 reviewed questions until actually available.

## Files and database

- `admin.html`, `admin-question-bank.js`: private MCQ authoring and review.
- `auth-supabase.js`: authenticated admin CRUD and JSON batch import.
- `backend/supabase/003_question_bank_private.sql`: reviewable schema summary.
- `backend/supabase/004_registration_sync.sql`: account status mirror and trigger summary.
- `admin-registrations.js`: verification dashboard (read-only).
- Supabase migrations: `private_ppsc_question_bank_drafts_rls`, `ppsc_registration_status_secure_sync`.
- Existing public `papers.js`, `engine.js` continue the one free foundation paper.

Do not paste service-role keys, SMTP credentials, private candidate records, or complete private-answer backups into GitHub. Protect the account and keep independent verified database backups, especially when using the free tier.
