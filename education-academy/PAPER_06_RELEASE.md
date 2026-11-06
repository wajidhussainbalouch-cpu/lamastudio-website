# LAMA PPSC Academy — Headmaster / Headmistress Paper 6

**Completed:** 6 November 2026  
**Paper ID:** `HM-2026-P06`  
**Question IDs:** `HM06-001` to `HM06-100`  
**Status:** 100 original academy **free-practice** MCQs. Automated tests passed; independent academic review is not yet complete. This paper is not an official PPSC examination and is not guaranteed to reflect a particular recruitment case.

## Delivered

- A complete original 100-question bank across four sections of 25: governance and school administration, educational psychology/pedagogy, quantitative reasoning/research, and English/ICT/science.
- Every question includes a subject, distinct topic, question stem, four choices, one correct answer, a targeted explanation and difficulty. IDs are stable, preserving score and review alignment.
- Paper 6 is registered alongside Papers 1–5, producing **six free school-head papers and 600 public practice MCQs** in the GitHub source. The historical papers and attempts remain unchanged.
- Both Headmaster/Headmistress and Senior Headmaster/Headmistress tracks can select Paper 6.
- Paper 6 has a 90-minute exam, its own local attempt under `lama_ppsc_attempt_HM-2026-P06`, post-submission results and answer-by-answer explanations. The printable question-only paper and post-submission printable **answer key / Save as PDF** are available through the existing academy routes.
- The PWA cache version is `lama-ppsc-preview-v61`, including all five new source scripts.

## Non-repetition and accuracy checks

- Compared all 100 Paper 6 stems with **100 Paper 1 questions plus the 430 existing private school-head stems** from earlier drafts and Papers 2–5.
- One preliminary question about percentage points was replaced because of wording/concept overlap with an earlier private draft. The finalized Paper 6 has **100 unique IDs, 100 unique normalized stems and 100 unique topics**, with no strong wording overlaps in the final comparison.
- Validated four distinct answers per question, correct answer preservation through deterministic option rotation, explanation length, question length, source script order and answer-letter balance.
- `validate-papers.cjs`, `test-paper-library.cjs`, `test-headmaster-paper6.cjs`, earlier paper tests and the complete Academy CI suite pass.
- These automated tests **do not equal an independent expert review**. Editors must still verify numerical reasoning, possible ambiguity, local syllabus relevance, and any laws/standards before claiming examination alignment.

## Database verification

The four new sections were inserted in batches of 25 into the RLS-protected `public.ppsc_question_bank` with `job_id='teaching'` and `review_status='draft'`. Conflict-safe INSERTs did not replace earlier question IDs.

| Metric | Verified |
| --- | ---: |
| New Paper 6 records | 100 |
| Total private question-bank records | 530 |
| Unique normalized private stems | 530 |
| Pending editorial drafts | 530 |
| Independently human-approved | 0 |
| Structurally invalid Paper 6 rows | 0 |

RLS is enabled; anonymous SELECT and INSERT privileges on the private table are not granted. Public free practice scripts include the answer keys, which means a browser-savvy user can inspect them; the post-submission key feature is only a usability gate, **not secure premium/proctored exam delivery**.

## Source changes

- `papers/headmaster-06-part1.js`, `part2.js`, `part3.js`, `part4.js`
- `papers/headmaster-06-register.js`
- `index.html`, `print.html`, `answer-key.html`, `sw.js`
- `test-headmaster-paper6.cjs`, `test-paper-library.cjs`, `validate-papers.cjs`
- `.github/workflows/ppsc-academy-checks.yml`
- `README.md`, `QUESTION_BANK_WORKFLOW.md`, `PROJECT_MASTER_HANDOFF.md`

## Next Continue → Headmaster Paper 7

1. Fetch **latest GitHub main** and existing paper source plus all current Supabase question stems; do not assume numbers remain unchanged.
2. Write another **100 genuinely new MCQs** using IDs `HM07-001` to `HM07-100`. Avoid superficially changed numerical values, repeated cases and close paraphrases from any of the 600 existing public papers or current private drafts.
3. Verify each answer, explanation, calculation, distractors, and intended subject. Run both cross-paper and independent expert-content review where available.
4. Insert the next 100 questions as **private drafts** without changing old question IDs, candidate scores, accounts, memberships, school data or super-admin permissions.
5. Add `HM-2026-P07` as a new separately identified free paper with its own timer, history, printable question paper, post-submission review and answer key, PWA cache, CI and MD handoff.
6. Do **not** claim official PPSC alignment or human approval until separately verified. A free client-side key must not be reused as a secure premium examination engine.
7. Continue **GitHub commits only** and do not initiate manual Vercel deployments while the owner's quota restriction remains. Verify the actual production deployment SHA independently.

## Outstanding release checks

The successful GitHub validation and Supabase import do not constitute live Android Chrome testing or a verified Vercel production release. Independent academic item review and official case-specific syllabus verification are still outstanding.
