# LAMA PPSC Academy — Headmaster / Headmistress Paper 3

**Batch completed:** 6 November 2026  
**Paper ID:** `HM-2026-P03`  
**Status:** 100 new original FREE educational-practice MCQs, automated quality checks passed; academic subject-matter review pending. It is NOT an official PPSC examination and is not represented as a verified case-specific syllabus.

## What was added

Paper 3 contains exactly **100 new questions**, stable IDs `HM03-001` to `HM03-100`, divided into four files of 25. Each contains a subject, nonrepeated topic, substantive question, four distinct options, one answer index, an explanation and difficulty category. The 100 topics cover school leadership and governance, instructional methods, psychology, assessment, data interpretation, quantitative reasoning, English, ICT and general science.

In the candidate-facing `Papers & Examinations` section, the school-head tracks now have **three free, full-length papers** (300 questions total). Paper 3 has a **separate 90-minute attempt**, timer, results history and mark calculation under `lama_ppsc_attempt_HM-2026-P03`, leaving Paper 1 and Paper 2 records untouched.

Candidates may review selected answers, correct answers and explanations **after submitting**. `answer-key.html?paper=HM-2026-P03` supports printing / saving the key as PDF only when a submitted local attempt exists. The printable question-only paper has no visible answers. A public free paper ships JavaScript with answer keys, so this is an **interface-level review gate** and is **not** secure exam-key protection.

## Database source and non-repetition

The 100 questions were inserted into Supabase `public.ppsc_question_bank` as private, editable **draft** records, not human-approved exam-bank items. The 130 earlier entries were left intact. Post-import database checks:

- Total school-head private bank: **230**
- Unique case-normalized question stems: **230**
- New HM03 records: **100**
- Editorial draft records: **230**
- Independent human-approved records: **0**
- Structural invalid new records: **0**

Question stems were compared against Paper 1 (100), Paper 2 (100) and the 30 earlier separate draft questions. No exact duplicates or strong token-overlap matches were found; every Paper 3 topic is distinct within Paper 3. Automated screening does not guarantee semantic non-overlap or scientific accuracy; academic review is required before making official alignment claims.

GitHub Actions verifies all three papers, answer-key preservation after deterministic option rotation, question IDs, options, topic variety, job routing, source-script order, offline PWA asset inclusion and that answer keys do not appear in the standard UI before submission.

## Updated source files

- `papers/headmaster-03-part1.js` through `headmaster-03-part4.js`: new items 001–100
- `papers/headmaster-03-register.js`: independent Paper 3 metadata and answer rotation
- `index.html`, `print.html`, `answer-key.html`: exam, print and review loader updates
- `sw.js`: PWA public asset version `lama-ppsc-preview-v58`
- `validate-papers.cjs`, `test-paper-library.cjs`, `test-headmaster-paper3.cjs`: cross-paper and answer-key regression checks
- `.github/workflows/ppsc-academy-checks.yml`: Paper 3 in CI
- `README.md`, `PROJECT_MASTER_HANDOFF.md`, `QUESTION_BANK_WORKFLOW.md`: synchronized project handoff

No private `ppsc_question_bank` answer-key export, Auth secret, service-role credential or candidate record was committed to the repository.

## Instructions for the next command: Continue

On the next Headmaster/Headmistress `Continue`:

1. Fetch the current GitHub main revision, read **this document**, Paper 1, Paper 2, Paper 3 and all private `ppsc_question_bank` stems. Do not work from stale cached ZIPs.
2. Write **100 additional genuinely different MCQs**, IDs `HM04-001`–`HM04-100`, with four credible choices and specific rationales. Avoid repetitions, superficial rephrasings and template-driven filler.
3. Validate against all **300 existing public** questions plus any current separate private drafts. Recheck factual accuracy, calculations and best-answer ambiguity.
4. Insert another 100 in Supabase as private `draft` rows; never overwrite or delete old IDs, scores, registration or subscription data.
5. Register independent free Practice Paper 4 (e.g. `HM-2026-P04`) with its own 90-minute state, selection card, printed questions and post-submission answer key. Preserve old papers, and update PWA cache, regression tests, CI and all MD handoffs.
6. Do not represent practice as official PPSC material or activate premium billing without server-side authorization. Verify the latest Vercel production commit independently; **do not initiate a manual deployment** under the established GitHub-first policy.

## Release limits

Successful GitHub tests do not by themselves prove that a new Vercel build is deployed or has passed live Android Chrome testing. An independently reviewed syllabus/answer audit and real mobile UX check remain separate from this batch. Supabase Auth's previously flagged leaked-password protection setting remains a distinct launch-security issue.
