# LAMA PPSC Academy — Headmaster / Headmistress Paper 14

**Created:** 6 November 2026  
**Public practice ID:** `HM-2026-P14`; question IDs `HM14-001`–`HM14-100`.

**Status:** 100 original free educational-practice MCQs. Structural and automated overlap screening passed. Independent human academic review and case-specific PPSC official syllabus alignment remain pending. This is not an official PPSC paper.

## Delivery
- Four new 25-question sources: `papers/headmaster-14-part1.js` to `part4.js`, each with unique ID, subject, topic, difficulty, four choices, keyed answer and detailed explanation.
- 90-minute distinct public practice `papers/headmaster-14-register.js`, assigned to the teaching job family. Separate saved attempt key `lama_ppsc_attempt_HM-2026-P14`.
- `index.html` loads Paper 14 in the selection and examination UI; `print.html?paper=HM-2026-P14` prints question-only papers; `answer-key.html?paper=HM-2026-P14` supports printable explanation review after submission.
- PWA cache `lama-ppsc-preview-v69` includes all five new JavaScript assets for offline use.
- GitHub source now includes **14 distinct papers with 100 items each, or 1,400 public practice MCQs**. All Papers 1–13, scores, student data, subscriptions and existing attempts were preserved.
- Strict **MAX_PAPERS_PER_JOB=20** in `paper-library.js`. Teaching variants including Headmaster and Senior Headmaster share one 20-paper ceiling; unrelated job families have independent limits. The Paper 14 registration also refuses to append a 21st teaching paper.
- Dedicated `test-headmaster-paper14.cjs`, `test-paper-library.cjs`, `validate-papers.cjs` and GitHub Actions workflow extended to check correct-answer rotation, 100 unique question IDs, 14 papers, 1,400 positions, unchanged preceding 13 papers, post-submission key review, public assets and job restrictions.

## Originality and technical QA
- 100 sequential unique IDs and normalized stems, 100 different topic labels and **71 subject labels**.
- 4 distinct options for every question; question and explanation minimum lengths verified; valid answer index and correct-answer text preserved on deterministic rotation.
- Compared Paper 14 stems against the prior **1,230 private teaching-bank stems** and 100 original public Paper 1 stems. Four strongly overlapping mathematics/statistics question stems were replaced, and one gain-comparison answer-key error corrected before publication. No remaining matches above the established token-Jaccard screening threshold.
- Source correct-answer positions: A24 / B31 / C23 / D22; rotated examination positions A31 / B26 / C21 / D22.
- These automated checks do not establish human editorial approval, numerical accuracy of every scenario, absence of semantic similarity, or official PPSC syllabus relevance.

## Protected Supabase editorial bank
Four append-only batches of 25 were inserted into `public.ppsc_question_bank` under `job_id='teaching'`, `review_status='draft'`, with `ON CONFLICT(id) DO NOTHING` preserving previous records.

| Measure | Verified |
| --- | ---: |
| Paper 14 private draft rows | 100 |
| Total private teaching records | 1,330 |
| Distinct normalized private stems | 1,330 |
| Total unapproved editorial drafts | 1,330 |
| Human-approved rows | 0 |
| Invalid Paper 14 structural rows | 0 |

The private bank includes Papers 2–14 (1,300 questions) plus 30 older unpublished editorial drafts. Paper 1's 100 items are public-source legacy practice, so the 1,400 public slots and 1,330 private records are not the same metric. Private bank permissions and RLS must stay restrictive.

## Live deployment
A production attempt for Paper 13 was rejected on 6 November 2026 with Vercel HTTP 402 (`api-deployments-free-per-day`; daily Hobby quota, retry after 24 hours). **Do not assume Paper 14 is live** simply because the GitHub tests pass. Check the latest production commit for `lamastudio-website` and test the actual `www.lamastudio.pk/education-academy/` paper selection and submission workflow. Do not repeatedly retry a quota-rejected deployment.

The public free-practice JavaScript itself contains answer keys; requiring local submission before displaying the answer-key page is not secure paid/proctored exam enforcement.

## Next Continue — Paper 15

1. Inspect GitHub latest `main`, Supabase table and source files first, avoiding duplicate file or DB creation.
2. Produce original `HM15-001`–`HM15-100` across four 25-item JS parts. Compare against 1,400 public practice MCQs and all private drafts; do not recycle concepts by simply changing numbers.
3. Verify arithmetic, grammar, unique topics, distractors, explanations and correct-answer rotation.
4. Register independent free 90-minute `HM-2026-P15`, with its own attempt ID, question-only print and post-submission score/explanations.
5. Update PWA assets, paper library validator, standalone Paper 15 regression and GitHub Actions; preserve the **20-per-job** ceiling and all historical results.
6. Insert 100 protected private drafts without overwriting previous records. Update release and master MD handoffs, check GitHub CI and actual Vercel production state.
7. Human academic review and recruitment-specific syllabus checks remain required before making any official or expert-verified claims.
