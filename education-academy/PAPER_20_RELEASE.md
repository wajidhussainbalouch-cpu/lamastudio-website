# LAMA PPSC Preparation Academy — Final Headmaster / Headmistress Paper 20

**Completed:** 9 November 2026  
**Paper ID:** `HM-2026-P20`  
**Question IDs:** `HM20-001`–`HM20-100`  
**Academic status:** Original AI-assisted LAMA educational practice questions; **not official PPSC items** and not independently approved or verified against a particular current PPSC syllabus.

## School-head 20-paper milestone

- Four distinct source batches, each 25 questions: `papers/headmaster-20-part1.js` through `headmaster-20-part4.js`.
- **80 education-domain MCQs** (school administration/governance, pedagogy and psychology, assessment, curriculum, research) and **20 general-ability MCQs** (English, quantitative reasoning, logical reasoning, science and computing).
- Each question includes a sequential unique ID, subject, unique topic, stem, four options, keyed answer, teaching explanation and difficulty.
- `papers/headmaster-20-register.js` registers a free **100-question, 90-minute** practice paper for teaching-family variants, with a separate examination ID, stable option rotation, progress and saved score association.
- `index.html`, `print.html`, `answer-key.html`, `validate-papers.cjs`, `test-paper-library.cjs`, `test-headmaster-paper20.cjs` and academy GitHub Actions include Paper 20.
- The offline public shell service worker cache is **`lama-ppsc-preview-v81`**.
- **20 teaching-family full-length papers / 2,000 public practice MCQ positions** now meet the academy owner's ceiling. Headmaster and Senior Headmaster variants share this teaching-family quota. A 21st paper cannot be published within this family without a deliberate policy change.
- Earlier papers, candidate accounts, subscription records, saved attempts, scores and school data were not changed by Paper 20 integration.

## Question and answer validation

- Sequential IDs and 100 distinct normalized stems/topics in Paper 20; four structurally distinct option texts per question.
- Correct option distribution after stable rotation: A=25, B=23, C=21, D=31, preserving the keyed answer text.
- Automated normalized-stem and token-Jaccard screening against the previous **1,800 public school-head items in Papers 2–19**, using threshold 0.60, found no identical or above-threshold near-text repeats; the legacy Paper 1 is included in the registration layer's exact-stem check.
- CI including Paper 20's structural, originality and answer-key checks **passed** on source integration commit `b59cc788f8cde89c80d43e1e8846d2eea960c055`; GitHub Actions run `42593146629`.
- Automated text overlap checks cannot prove complete conceptual originality; independent review of factual correctness, syllabus relevance and item quality remains necessary.

## Private Supabase editorial database

- Added 100 `HM20-*` rows to `public.ppsc_question_bank` with `job_id='teaching'` and `review_status='draft'` in four non-destructive batches. Existing editorial rows and authorization rules were preserved.
- Post-write audit: **1,930 teaching editorial records / 1,930 distinct normalized stems**; exactly 100 Paper 20 rows, all 100 draft and structurally valid; **zero human-approved** items.
- Editorial database counts differ from 2,000 public question positions because the historical demo and previous public/assigned editorial sources are not a one-for-one copy of the private bank.
- Browser-delivered free-practice scripts include answer keys and are **not secure premium/proctored question storage**; server-side controls are required for protected assessments.

## Release gates after source integration

1. Confirm that `www.lamastudio.pk` resolves to a Vercel READY production deployment containing the Paper 20 integration commit or its descendant. CI success alone does not prove the live custom domain has this version.
2. On Android Chrome/PWA verify paper selection, user-initiated Start Examination, 90-minute timer, candidate answer saving, scoring/submission, A4 print, post-submission answer key, and offline cache refresh.
3. Keep the 20-paper teaching-family cap. **Next development phase is quality assurance, answer review, and launch hardening**, not Paper 21, unless the owner explicitly changes policy.
4. Do not consume additional manual Vercel deployments merely to inspect status.

