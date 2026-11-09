# LAMA PPSC Preparation Academy — Headmaster / Headmistress Paper 19

**Completed:** 9 November 2026  
**Practice paper ID:** `HM-2026-P19`  
**Question IDs:** `HM19-001`–`HM19-100`  
**Content status:** Original AI-assisted LAMA Academy educational practice. These are not official PPSC questions and have **not** received independent academic approval or vacancy-specific syllabus certification.

## Paper content and learner experience

- Four batches of exactly 25 MCQs: `papers/headmaster-19-part1.js` through `headmaster-19-part4.js`, each containing four answer options, keyed response, explanatory feedback, subject and topic.
- **80 education-domain questions:** 25 school management and governance, 25 educational psychology and teaching, 25 curriculum and assessment, and 5 additional education-related questions.
- **20 general-ability questions:** English grammar and reading, quantitative reasoning, logic, general science and digital literacy.
- `papers/headmaster-19-register.js` enables a separate **90-minute**, 100-question free public practice paper for the teaching job family, with per-paper candidate attempts and score histories, deterministic option rotation, unique ID `HM-2026-P19`, and a maximum 20 full-length papers per family.
- `index.html`, `print.html`, `answer-key.html` and the public offline PWA include the new paper; PWA cache `lama-ppsc-preview-v80`.
- **19 teaching-family public papers / 1,900 practice MCQ positions**; Headmaster, Headmistress and senior school-head variants share the teaching job family. No changes to existing candidate accounts, payment records, earlier papers or scores.

## Originality, validation and limitations

- 100 unique sequential IDs and stem texts, 100 unique topics, and four structurally distinct options per question.
- Screened against all 1,700 publicly released school-head questions from Papers 2–18 using normalized exact-stem and token-overlap Jaccard threshold 0.60. One initially similar probability question was replaced with a new independently spun spinner question; repeat screening found no remaining above-threshold matches. The legacy Paper 1 appears in the paper registration exact-overlap checks.
- The Paper 19 regression test verifies answer rotation, registration, counts, preservation of existing papers, quality constraints, and that the full answer key is exposed **only after a submitted attempt**.
- Academy GitHub Actions: `PPSC Academy Quality Checks` **passed** on integration commit `cb137e39de191cdfc58dc72b3cabd0efe07b3cef` (run `42583768621`).
- Automated checks cannot guarantee that all explanations and keyed answers are academically correct, or that all questions align with the current official PPSC vacancy syllabus. Independent human review remains mandatory before labeling any private editorial question approved.
- Public client-side JavaScript necessarily exposes practice answer keys to users who inspect the scripts, so this is unsuitable for secure premium, proctored or high-stakes examination purposes.

## Protected editorial question bank

- Added all 100 `HM19-*` questions to `public.ppsc_question_bank` for `job_id='teaching'` as `review_status='draft'`, four non-destructive insert batches of 25 (`ON CONFLICT DO NOTHING`).
- Verified **1,830 private teaching editorial records**, **1,830 distinct normalized stems**, **100 Paper 19 drafts**, **100 valid four-option keys** and **zero human-approved** items. Supabase RLS and permission rules were not changed.
- No earlier editorial questions overwritten or deleted.

## Remaining release gates and next paper

- Check production READY deployment Git SHA for `www.lamastudio.pk` and then live Android/browser test for candidate routing, start examination, 90-minute timer, submission/scoring, question-only printing, post-submission explanations and PWA cache refresh. CI does not establish live browser behavior.
- Do not trigger unnecessary manual Vercel deployments because quota may be constrained.
- **Next:** Paper 20, IDs `HM20-001`–`HM20-100`. This reaches the user-configured **20-paper teaching-family ceiling**. Confirm it is absent from source and database before creating it.
