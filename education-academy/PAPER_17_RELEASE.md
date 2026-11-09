# LAMA PPSC Preparation Academy — Headmaster / Headmistress Paper 17

**Date:** 9 November 2026  
**Paper ID:** `HM-2026-P17`  
**Question IDs:** `HM17-001`–`HM17-100`  
**Academic status:** New LAMA original AI-assisted educational-practice MCQs. **Not official PPSC items**. Independent subject-expert academic review and recruitment-specific syllabus validation are still outstanding.

## Questions and academy integration

- Four sequential 25-question source files: `papers/headmaster-17-part1.js` through `headmaster-17-part4.js`, each question containing an ID, subject, unique topic, stem, four answer options, one answer index and educational explanation.
- Content plan: **80 education-domain MCQs**, covering school management, educational psychology, curriculum, pedagogy, assessment and research; **20 general-ability MCQs**, covering English, mathematics, logic, computing and science. This split is a preparation design decision, not official endorsement of a particular vacancy's current PPSC syllabus.
- `papers/headmaster-17-register.js`: separate **90-minute** public free-practice exam for teaching job variants, with deterministic answer rotation and 20-paper-per-job-family guard.
- Candidate exam `index.html`, two-column question-only A4 print `print.html`, and completed-attempt answer-review `answer-key.html` load the five Paper 17 files. Candidate answers and score attempt are separated by `HM-2026-P17`.
- All earlier papers and saved attempt history remain in place. Total public school-head source registry: **17 papers / 1,700 MCQ positions**, with a **maximum 20 papers per teaching job family** shared by Headmaster/Headmistress and Senior Headmaster/Headmistress variants.
- Service worker cache is `lama-ppsc-preview-v78`, with new assets listed for offline use.

## Originality and quality checks

- All 100 IDs are sequential and unique; 100 distinct topics and normalized stems; 67 distinct subject labels.
- Each question has exactly four distinct options, one keyed correct answer, a sufficiently detailed stem, and an explanation.
- Raw answer positions: 25 A / 25 B / 25 C / 25 D. The deterministic client registration rotation gives 31 A / 24 B / 20 C / 25 D while retaining correct answer text.
- Automated normalized-stem and token-Jaccard checks against the **1,500 public school-head questions in Papers 2–16** found no exact duplicates or above-threshold near-text repeats (threshold 0.60); the legacy Paper 1 questions are separately included in the general registry's exact-duplicate validation.
- Added `test-headmaster-paper17.cjs` and extended the all-paper structural validator, job-specific library test and GitHub Actions quality workflow. GitHub Actions passed on integration commit `b897e66fc92a121b9906073a0fbf68558065056b`.
- **Limitation:** Automation cannot establish that all 100 explanations, keys, curricula, distractors, or underlying concepts have passed independent academic review. Question similarity below the threshold is not proof of complete conceptual originality.

## Protected editorial database

- Added 100 records `HM17-*` for `job_id='teaching'` to `public.ppsc_question_bank` in four 25-record batches, non-destructively with `ON CONFLICT DO NOTHING`.
- Verified Supabase totals: **1,630 teaching editorial questions**, **1,630 distinct normalized stems**, **100 Paper 17 drafts**, **0 academic approvals**. All 100 new rows pass structural field checks.
- Existing Supabase RLS and authorization remain unchanged. Public free-practice browser JavaScript exposes its answer keys and is **not suitable for secure premium or proctored testing**.

## Release readiness and next steps

- CI passing and a commit on GitHub do not alone verify the updated content on the custom domain `www.lamastudio.pk`. Confirm READY production deployment and its commit SHA; then test Android Chrome and PWA flows for start, timer, scoring, printing, post-submission key and offline cache.
- Respect earlier Vercel deployment quota concerns. There is no need to trigger additional manual builds simply to check deployment state.
- **Next paper:** Headmaster / Headmistress **Paper 18**, IDs `HM18-001`–`HM18-100`, within the 20-paper family limit, after checking source and private bank for concurrent work.
