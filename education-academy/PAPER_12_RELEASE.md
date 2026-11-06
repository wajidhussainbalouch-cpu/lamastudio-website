# LAMA PPSC Academy — Headmaster / Headmistress Paper 12

**Date:** 6 November 2026  
**Practice paper:** `HM-2026-P12`  
**Questions:** `HM12-001`–`HM12-100`  
**Content status:** Original LAMA Academy free educational practice; automated validation passed. **No claim of official PPSC endorsement or independent expert verification.**

## Delivered

- **100 new MCQs** across four new files of 25: `papers/headmaster-12-part1.js` through `part4.js`. Each item has its own stable ID and topic, subject, substantial question, four distinct alternatives, a checked answer index, explanation and difficulty.
- Coverage includes school management and risk, safeguarding, educational psychology and classroom assessment, statistics and quantitative reasoning, English, ICT/security and general science.
- Independent **90-minute** public practice exam `HM-2026-P12` registered in `papers/headmaster-12-register.js` for the `teaching` job family (Headmaster / Headmistress and Senior Headmaster / Headmistress).
- A separate exam attempt at `lama_ppsc_attempt_HM-2026-P12`, existing saved-score history, 100 post-submission item explanations, question-only print view at `print.html?paper=HM-2026-P12`, and printable answer review at `answer-key.html?paper=HM-2026-P12`.
- `index.html`, `print.html`, `answer-key.html` and PWA cache `lama-ppsc-preview-v67` include the new scripts.
- **12 independent published school-head practice papers and 1,200 public MCQ positions.** Papers 1–11 and all candidate data remain intact.

## Maximum 20 papers per job

Owner's current policy: **Each job family is limited to 20 published full-length practice papers.** This is not an instruction to create 20 immediately for every listed PPSC job.

- The shared paper-library code sets `MAX_PAPERS_PER_JOB=20` and enforces the ceiling for `list()`, `forJob()`, direct paper lookup and active-paper deep links. It identifies the job family before the variant suffix, so `teaching:0` and `teaching:1` share one school-head collection.
- `forJob()` offers only the earliest 20 eligible published papers for that job, without deleting underlying registry entries, older attempts or user scores. New jobs have independent quotas; Headmaster questions must never auto-populate unrelated job categories.
- The Paper 12 registration also refuses to append a new teaching paper if the teaching collection has already reached 20.
- The library's UI displays the available count out of 20, e.g. **12 / 20**. The paper-library regression injects a simulated twenty-first publication into two different job tracks and verifies that both cap at 20 and the twenty-first deep link is rejected.
- Once the Headmaster collection reaches Paper 20, further papers for this job are not automatically published unless the owner explicitly revises this policy; next content efforts should focus on other authorized jobs and syllabus relevance.

## Originality and automated checks

- Verified 100 sequential unique IDs, 100 unique normalized question stems, 100 unique topic labels, 70 subject classifications, four distinct answer choices each and complete explanations.
- Compared all 100 stems against **1,030 existing Supabase private question stems** plus 100 original public Paper 1 stems. Three preliminary items (`HM12-034`, `HM12-066` and `HM12-080`) were replaced due to near-repetition. The revised 100 passed exact and strong token-overlap screening and internal duplication checks.
- Reviewed calculations, keyed choices and explanation alignment; raw source answer positions A24/B27/C24/D25, with deterministic rotation preserving correct text.
- Extended `validate-papers.cjs`, `test-paper-library.cjs`, `test-headmaster-paper12.cjs`, and `.github/workflows/ppsc-academy-checks.yml`. The CI suite checks 12 papers/1,200 MCQs, prior-paper references, stable answers, 90-minute duration, print/review gating, 20-per-job limit and isolation of unrelated jobs.
- Automated validation is **not** a substitute for independent academic item review, expert checking of ambiguous explanations or verification against a PPSC advertisement's official syllabus.

## Protected Supabase editorial bank

Inserted all `HM12-001`–`HM12-100` as **private editable `draft`** entries in `public.ppsc_question_bank` under `job_id='teaching'`, in four batches of 25. Used the existing authorized editor and `ON CONFLICT(id) DO NOTHING`, without overwriting earlier question IDs.

| Verified | Value |
| --- | ---: |
| New Paper 12 private rows | 100 |
| Total private `teaching` rows | 1,130 |
| Distinct normalized private stems | 1,130 |
| Editorial drafts still awaiting independent approval | 1,130 |
| Human-approved rows | 0 |
| Invalid structural Paper 12 rows | 0 |
| RLS enabled | Yes |
| Anonymous table SELECT / INSERT grants | No |

Private editorial bank includes 1,100 questions from Papers 2–12 and 30 older unpublished editorial drafts. Paper 1 exists in the public practice source only.

## Live website release gate

Production project: Vercel `lamastudio-website`, attached to the verified custom domain `www.lamastudio.pk`; GitHub source `wajidhussainbalouch-cpu/lamastudio-website`, branch `main`.

**Do not assume that passing GitHub CI automatically makes this Paper 12 commit live.** Inspect the READY production deployment's exact GitHub commit, correct custom-domain alias, and the deployed `/education-academy/` assets. When necessary, deploy the checked `main` commit through the existing linked Vercel project, not a new project. Keep candidate data and existing domain routing intact.

A successful deployment alone does not substitute for real candidate Android Chrome end-to-end testing.

## Next `Continue`: Paper 13

1. Fetch latest GitHub `main`, this handoff and all current private stems. Do not create a duplicate batch or overwrite prior paper content.
2. Create **100 new original** Headmaster/Headmistress MCQs, `HM13-001`–`HM13-100`, in four files with verified answers and distinct scenarios. Compare with all 1,200 public questions and current Supabase drafts.
3. Add separate `HM-2026-P13` 90-minute exam, printable question-only view, locally gated answer/explanation review, separate history, PWA assets, private `draft` rows, CI and documentation.
4. Recheck **20-paper limit** (Paper 13 would be 13 / 20 for teaching); other jobs have their own independent 20-paper limits and should not receive these Headmaster questions.
5. Deploy only after successful tests and verify actual live custom-domain content. Do not claim official PPSC content or human-approved private drafts.
