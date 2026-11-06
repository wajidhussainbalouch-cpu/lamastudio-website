# LAMA PPSC Academy — Headmaster / Headmistress Paper 4

**Completed:** 6 November 2026  
**Paper ID:** `HM-2026-P04`  
**Question IDs:** `HM04-001` through `HM04-100`  
**Status:** 100 original free educational-practice MCQs, automated checks passed. Independent subject-matter academic review is pending. This is not an official or case-specific PPSC question paper.

## Delivered

- Four new 25-question JS source parts under `education-academy/papers/`, registered into the existing `LAMA_PPSC_PAPERS` array.
- Every question includes a specific subject, a distinct topic, substantive stem, exactly four answer options, one answer, an explanatory rationale and a difficulty label.
- **Paper 4** is available in the GitHub Academy source for Headmaster/Headmistress and Senior Headmaster/Headmistress study tracks. It has **100 questions, 90 minutes**, its own attempt state `lama_ppsc_attempt_HM-2026-P04`, results history and post-submission review.
- `answer-key.html?paper=HM-2026-P04` loads the correct answer and explanation for each item only after a submitted local attempt. Print / Save PDF is available on that answer-key page. `print.html?paper=HM-2026-P04` prints a question paper without answers.
- Papers 1, 2 and 3 and their attempt keys remain untouched. The public source now contains **four free practice papers / 400 total MCQ slots**. A candidate selecting a different job is not shown this teaching-specific paper.

## Content and technical checks

- Paper 4 items were compared to the **100 original Paper 1 items** and **230 existing private Supabase question stems**, including Papers 2 and 3 and the 30 earlier editorial drafts.
- No exact duplicate stems or strong token-overlap matches were identified against these earlier questions. The 100 Paper 4 topics are unique within the new set. Automated similarity tests cannot rule out every paraphrase or conceptual overlap.
- Structural checks caught two distractor-choice issues and both were corrected before release. Questions contain four distinct nonempty options, correct option indices, explanatory rationales and question-level content checks.
- Deterministic answer rotation maintains the same correct answer text across attempts, print, score and answer-review views. The displayed A/B/C/D answer distribution is balanced.
- GitHub CI runs `test-headmaster-paper4.cjs`, `test-paper-library.cjs`, `validate-papers.cjs` and earlier examination security and link regression checks.
- The answers in **public practice JavaScript** are available to anyone inspecting the source. The post-submission gate is a candidate-interface feature, not secure proctored-exam protection. A premium system must use private server-side evaluation.

## Supabase verification

Paper 4 was added to the existing RLS-restricted `public.ppsc_question_bank` table in the separate LAMA PPSC Academy Supabase project in four batches of 25. `on conflict(id) do nothing` protected existing records. Verified results:

| Metric | Value |
| --- | ---: |
| New Paper 4 private records | 100 |
| Total Headmaster/Headmistress private records | 330 |
| Distinct private question stems | 330 |
| Editorial drafts | 330 |
| Independently human-approved | 0 |
| Structurally invalid new records | 0 |

Super Admin review is still required. These private drafts are separate from the public free-practice scripts. Never publish private backup files, service-role credentials, student records or billing secrets.

## Source files updated

- `papers/headmaster-04-part1.js`–`part4.js`
- `papers/headmaster-04-register.js`
- `index.html`, `print.html`, `answer-key.html`, `sw.js` (public PWA cache v59)
- `test-headmaster-paper4.cjs`, `test-paper-library.cjs`, `validate-papers.cjs`
- `.github/workflows/ppsc-academy-checks.yml`
- `README.md`, `QUESTION_BANK_WORKFLOW.md`, `PROJECT_MASTER_HANDOFF.md`

## Next command: Continue → Paper 5

When the user next says **Continue** for Headmaster/Headmistress question development:

1. Fetch current GitHub `main`, this handoff, Papers 1–4, and all current private `ppsc_question_bank` stems. Do not assume a former snapshot is up to date.
2. Author **100 more distinct, academically useful MCQs** with IDs `HM05-001`–`HM05-100`. Avoid repeated scenarios, mere substitutions and superficial paraphrases.
3. Check stems against all **400 existing public MCQs** and private draft stems. Confirm factual correctness, calculation accuracy, explanation quality and unique defensible answers.
4. Add 100 private `draft` rows to Supabase without overwriting prior records. Register Paper 5 with a separate ID (`HM-2026-P05`), saved attempt, timer, job mapping and post-submission printable answer key. Preserve old registrations, marks and membership information.
5. Update the PWA cache, all-source validators, standalone Paper 5 checks, CI workflow, and all relevant MD handoffs.
6. Check **actual** Vercel production commit rather than assuming a GitHub commit is live. Respect the established GitHub-only / no manual deployment restriction.
7. Do not claim official PPSC syllabus alignment, independent human review or premium answer security unless actually verified.

## Open release checks

An independent academic editor should review the answer key and syllabus relevance. Mobile Chrome end-to-end tests and exact live domain deployment require separate verification. The project has previously reported Supabase Auth's leaked-password protection disabled; this remains a distinct security follow-up.
