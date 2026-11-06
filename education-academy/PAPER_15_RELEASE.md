# LAMA PPSC Academy — Headmaster / Headmistress Paper 15

**Date:** 6 November 2026  
**Paper ID:** `HM-2026-P15`  
**Question IDs:** `HM15-001` through `HM15-100`  
**Editorial status:** Original LAMA educational-practice questions, **not official PPSC MCQs**. Automated structural checks and textual similarity screening passed; independent academic review and recruitment-specific syllabus matching remain pending.

## Implementation

- Four 25-question original files: `papers/headmaster-15-part1.js` … `part4.js`, each MCQ including unique ID, topic, subject, four distinct options, answer, explanation and difficulty.
- `papers/headmaster-15-register.js`: separate free 90-minute `HM-2026-P15` paper for the `teaching` job family, with a distinct saved attempt `lama_ppsc_attempt_HM-2026-P15`.
- The exam selector (`index.html`), question-only print view (`print.html?paper=HM-2026-P15`) and post-submission printable answer/review (`answer-key.html?paper=HM-2026-P15`) load the new scripts.
- Offline service worker assets bumped to `lama-ppsc-preview-v70`.
- Source now contains **15 separate school-head free practice papers, 1,500 public practice question positions**, preserving all 14 earlier papers and candidate accounts, memberships, scores and history.
- The existing `MAX_PAPERS_PER_JOB=20` limit stays enforced per job family, with Headmaster and Senior Headmaster variants sharing teaching-family capacity. Registration refuses to append a 21st teaching-family paper.

## Structural and originality screening

- 100 sequential unique IDs `HM15-001`–`HM15-100`, 100 unique normalized stems, 100 topic labels, 65 distinct subject labels.
- Every stem at least 45 characters and explanation at least 65 characters, exactly four unique normalized options with one correct key index.
- Checked candidate stems against **1,330 older private editorial teaching questions plus 100 original public Paper 1 questions**. Five repeated or near-repeated items were substantially rewritten; final screening reports no strong token-Jaccard overlaps above the established threshold within the paper or against those existing references.
- Raw keyed options A25/B29/C23/D23; after ID-seeded deterministic option rotation A29/B25/C18/D28, with correct answer text retained.
- Tests added: `test-headmaster-paper15.cjs` and updates to `validate-papers.cjs`, `test-paper-library.cjs`, and `.github/workflows/ppsc-academy-checks.yml`. These validate all 15 papers, 1,500 practice slots, compatibility with existing papers, answer review/printing, and the job-specific library behavior.
- Automated tests do not independently establish correctness of every question, suitability of distractors, complete substantive originality, human approval, or conformity with a particular PPSC vacancy's official syllabus.

## Supabase private editor bank

- Appended 100 `HM15-*` questions in four 25-row batches to existing `public.ppsc_question_bank`, `job_id='teaching'`, `review_status='draft'`, using the existing authorized editor and `ON CONFLICT(id) DO NOTHING` without overwriting prior records.
- **1,430 private teaching questions**, **1,430 distinct normalized stems**, **1,430 editorial drafts**, zero human-approved items. Paper 15 has no structurally invalid records.
- The public free-practice source contains Paper 1 (100) plus Papers 2–15 (1,400), while the private editor table contains Papers 2–15 (1,400) plus 30 older unpublished drafts; these intentionally produce different public and private totals.
- Preserve row-level security and absence of anonymous direct database access. Public JS practice answer keys are visible to browser users and cannot be treated as secure premium or proctored-examination content.

## Live production publication

GitHub integration and successful CI alone do not establish that the 15th paper is live on `www.lamastudio.pk`. Earlier attempts to manually deploy resulted in Vercel Hobby quota HTTP 402 (`api-deployments-free-per-day`, over 100 deployments daily). Verify the exact latest READY **production** commit and the custom-domain paper selector; do not claim Paper 15 live until the full version is available. Avoid repeated manual deployments when rate-limited.

## Next Continue: Paper 16

1. Inspect the latest GitHub `main`, Supabase database, test status and production deployment before creating files. If another process already finished Paper 16, do not duplicate it.
2. Write 100 genuinely new school-head practice questions `HM16-001`…`HM16-100`, four batches of 25; avoid recycled concepts, changed figures and weak distractors.
3. Compare all stems with **1,500 existing public practice MCQs** and private editorial drafts; verify calculations, grammar, option correctness, explanation quality and subject coverage.
4. Register distinct free 90-minute `HM-2026-P16` with its own attempt, score, printable questions and post-submission answer key.
5. Preserve every existing exam, user and result, and strictly enforce the **20 papers maximum per job family**.
6. Extend service-worker cache, validator, standalone Paper 16 test, GitHub Actions, release report and all master MD files; append private `draft` rows safely.
7. Check actual Vercel deployment SHA and Android Chrome workflow separately from CI. Academic review and official syllabus verification remain necessary.
