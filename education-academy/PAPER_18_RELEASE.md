# LAMA PPSC Preparation Academy — Headmaster / Headmistress Paper 18

**Date:** 9 November 2026  
**Paper ID:** `HM-2026-P18`  
**Question IDs:** `HM18-001`–`HM18-100`  
**Editorial status:** Original AI-assisted academy educational practice, **not official PPSC questions**. Automated checks do not replace independent educator approval or vacancy-specific syllabus verification.

## Content and integration

- Four 25-question source batches: `papers/headmaster-18-part1.js` through `headmaster-18-part4.js`, each MCQ containing ID, subject, topic, stem, four options, keyed answer, explanation and difficulty.
- **80 education-related and 20 general-ability MCQs**. The split is the academy's design goal, not a claim that official current PPSC syllabus requirements have been verified.
- New `HM-2026-P18` free public practice exam registered for teaching-family job variants, with the **90-minute** timer, a separate browser attempt key and score history, two-column printable A4 paper, and post-submission answer/explanation review.
- Added the Paper 18 assets to candidate `index.html`, `print.html`, `answer-key.html`, `validate-papers.cjs`, `test-paper-library.cjs`, `test-headmaster-paper18.cjs`, GitHub Actions and the service worker cache **`lama-ppsc-preview-v79`**.
- **18 public teaching-family papers / 1,800 practice question positions** now registered. The existing maximum **20 papers per job family** remains in force; Headmaster and Senior Headmaster variants share a teaching family.
- Candidate accounts, memberships, earlier exam source, saved attempts, scores and records were not changed.

## Question bank quality and duplicate screening

- 100 sequential unique IDs; 100 distinct topics, 60 subject labels; 100 nonrepeated normalized stems within the new paper.
- Exactly four distinct normalized options per item, one correct option and an explanation; one punctuation-distractor normalization issue was identified and corrected before registration.
- Raw key distribution A25/B25/C25/D25; expected deterministic option rotation with the standard hash produces A29/B26/C20/D25 while retaining correct answer text.
- Compared the 100 new stems against **1,630 existing private teaching editorial questions** (including Papers 2–17 and additional private drafts): **zero exact matches and zero token-Jaccard scores at or above 0.60** using the established stop-word filtering. Closest observed similarity was 0.50. Legacy public Paper 1 is handled by the registration/validator exact-stem safety checks.
- GitHub Academy CI passed after integration (workflow also tests job-specific paper numbering and answer review). This is automated structural and surface-text QA, **not a subject-expert assessment of scientific correctness, explanation quality, or semantic originality**.

## Protected Supabase editorial data

- 100 new `HM18-*` items inserted for `job_id='teaching'` in four non-destructive groups of 25, with `review_status='draft'` and `ON CONFLICT DO NOTHING`.
- Live SQL verification: **1,730 protected editorial questions, 1,730 distinct normalized stems, 100 Paper 18 draft rows, zero academically approved rows**; all 100 Paper 18 rows have four choices and an in-range answer key.
- Existing Supabase role restrictions and row-level-security definitions unchanged; public JavaScript practice answers are visible and **must not be used for secure premium/proctored examinations**.

## Release and next steps

GitHub and database completion do not by themselves prove that the updated custom domain is on the same release. Verify Vercel's READY production SHA, custom-domain mapping, PWA cache version, and on-device start, submission, score history, print and answer-review behavior. Do not force a manual Vercel deployment while respecting the previously observed Hobby deployment limit.

**Next `Continue`:** Confirm no other worker has already created Paper 19, then prepare `HM19-001`–`HM19-100` within the 20-paper per teaching-family ceiling. Independent academic review remains essential.
