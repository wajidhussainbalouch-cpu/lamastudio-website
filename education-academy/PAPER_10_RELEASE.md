# LAMA PPSC Academy — Headmaster / Headmistress Paper 10

**Completed:** 6 November 2026  
**Paper ID:** `HM-2026-P10`  
**Stable question IDs:** `HM10-001`–`HM10-100`  
**Academic status:** Original **LAMA free educational practice**, automated tests passed; independent subject-expert review and official PPSC vacancy-specific syllabus verification have **not** been completed. Never claim these are official PPSC paper questions.

## Delivered

- Four newly authored JavaScript batches of 25 MCQs each: `papers/headmaster-10-part1.js` to `part4.js`, plus `papers/headmaster-10-register.js`.
- All 100 questions have a subject, distinct topic, substantive question stem, four answer choices, one keyed correct response, explanation and difficulty.
- Coverage includes governance, school leadership and records, pedagogy and inclusion, mathematical reasoning, educational statistics and research, English, ICT/security and general science.
- A distinct **90-minute free practice** paper available under the teaching job family, including Headmaster/Headmistress and Senior Headmaster/Headmistress. The source now registers **10 separate papers × 100 questions = 1,000 public practice MCQ slots**.
- Unique attempt key `lama_ppsc_attempt_HM-2026-P10`, separate question state, existing score/history integration, post-submission correct answers and explanations.
- `answer-key.html?paper=HM-2026-P10` supports browser Print / Save as PDF after a locally submitted attempt. `print.html?paper=HM-2026-P10` prints a question-only version without the key.
- `index.html`, `print.html`, `answer-key.html`, `test-paper-library.cjs`, `validate-papers.cjs`, the Paper 10 standalone test and GitHub Actions updated. PWA cache version **`lama-ppsc-preview-v65`** includes Paper 10 scripts.
- Older Papers 1–9, accounts, submissions, marks, financial data and memberships were **not replaced or reset**.

**Public answer-key limitation:** The free-practice JavaScript embeds the correct answer options. The post-submission answer-key gate is an interface workflow, not confidentiality protection for paid or high-stakes examinations. Secure premium testing needs server-side entitlement and scoring.

## Content and automated QA

- Exactly **100 sequential unique question IDs**, 100 distinct normalized stems and 100 topic labels across 74 subject labels.
- Every answer set contains four distinct normalized options, a correct answer index and an explanation at least 65 characters long. A few answers and stems were revised before registration to avoid ambiguous options or strong lexical overlap.
- Compared every new stem with **830 prior private Supabase teaching questions** (including earlier published papers and 30 separate editorial drafts) and **100 legacy public Paper 1 questions**. No exact or strong token-Jaccard overlap at the screening threshold of 0.32 remained.
- Deterministic option rotation maintains the keyed answer text across exam, print and review views. Raw answer indices A23/B25/C25/D27; displayed option positions after rotation A29/B25/C20/D26.
- GitHub Actions test suite for Paper 10 and earlier paper regressions passed at <https://github.com/wajidhussainbalouch-cpu/lamastudio-website/actions/runs/42209279037>. Automated QA cannot replace checking content accuracy, potential semantic duplication, distractor plausibility or examination syllabus alignment by qualified editors.

## Supabase private editorial database verification

The four 25-question sections were inserted into the existing RLS-protected `public.ppsc_question_bank` under `job_id='teaching'`, `review_status='draft'` and the existing authorized owner. `ON CONFLICT(id) DO NOTHING` prevented overwriting earlier IDs.

| Verified metric | Value |
| --- | ---: |
| New Paper 10 private draft records | 100 |
| Total private teaching-question records | 930 |
| Unique normalized private question stems | 930 |
| Pending editorial drafts | 930 |
| Independently human-approved records | 0 |
| Structurally invalid Paper 10 rows | 0 |
| RLS enabled | Yes |
| Anonymous SELECT or INSERT privilege | No |

Public source contains 100 original Paper 1 questions plus 900 practice questions from Papers 2–10. The private database holds the latter 900 plus 30 prior unpublished drafts, accounting for the different 1,000 public / 930 private totals.

## Source files and checks

- `papers/headmaster-10-part1.js`–`part4.js` and `headmaster-10-register.js`
- `index.html`, `print.html`, `answer-key.html`, `sw.js`
- `test-headmaster-paper10.cjs`, `test-paper-library.cjs`, `validate-papers.cjs`
- `.github/workflows/ppsc-academy-checks.yml`
- `README.md`, `PROJECT_MASTER_HANDOFF.md`, `QUESTION_BANK_WORKFLOW.md`

## Next 'Continue' instruction — Paper 11

1. Read this file and fetch the current GitHub `main`, all prior public question scripts and the latest private Supabase editorial stems. Never assume earlier source or counts have remained unchanged.
2. Create 100 genuinely different original Headmaster/Headmistress MCQs `HM11-001`–`HM11-100` with unambiguous correct options, good distractors and clear evidence-based explanations. Avoid recycling previous scenarios through only number or phrase substitutions.
3. Compare against all **1,000 existing public questions and all private drafts**. Independently check numerical answers and critical factual claims; retain academic-review-pending status until an expert approves them.
4. Add separately identified free `HM-2026-P11` with its own timer, submitted answers, printable question paper and post-submission answer key. Preserve Papers 1–10 and all saved candidate records.
5. Insert 100 new private editorial `draft` records using conflict-safe, authorized writes; extend the PWA cache, standalone Paper 11 tests, global validation, job-wise regression tests, CI and master MD files.
6. Continue **GitHub commits only** under the standing no-manual-Vercel-deployment restriction. Independently inspect the deployed production SHA and perform real Android mobile Chrome end-to-end testing before claiming the new paper is available on the live website.
7. Do not portray client-side free-paper answer keys as secured premium examination material or these questions as official PPSC.

## Remaining release gates

Qualified academic review, verified vacancy-specific syllabus compliance, confirmed current Vercel production SHA and real mobile browser testing remain distinct from completed code/CI/Supabase development.
