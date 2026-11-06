# LAMA PPSC Preparation Academy — Private Question Bank

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
