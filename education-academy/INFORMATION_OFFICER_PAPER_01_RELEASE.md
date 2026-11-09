# LAMA PPSC Preparation Academy — Information Officer (BS-17) Paper 01

**Created:** 9 November 2026  
**New job family:** `information-officer` — separate from `teaching`  
**Practice paper:** `INFO-2026-P01` · 100 MCQs · 90 minutes  
**Question IDs:** `IO01-001` through `IO01-100`  
**Status:** Original AI-assisted educational practice, **not official PPSC questions**. No independent subject-expert approval or recruitment-specific official syllabus certification.

## Job-category decision

- The academy's existing `jobs.js` already lists Information Officer (BS-17) next after the completed Headmaster/Headmistress teaching family.
- The two Headmaster variants share `teaching`'s full 20-paper limit; Information Officer is a genuinely separate job family with **Paper 01 of up to 20**.
- Publicly indexed notices related to Information Officer BS-17 refer to journalism/mass communication as the major subject area. Supporting qualification subjects may include political science, history, Urdu and English literature. **No fixed 80/20 official weight is being asserted.**
- **Source discrepancy to verify:** the legacy frontend's `caseNo` value `09H2026` does not unambiguously match publicly reported `09-RH/2026`. Do not treat either as official or silently change applicant eligibility without checking the commission's original publication. The new protected job registry uses empty case number and `vacancy_status='unverified'`; it does **not** claim a currently open vacancy.
- Source context: official PPSC publication should be the final authority for a particular post's test content, current vacancy, eligibility and dates.

## Paper 01 content

The first independently selectable Information Officer practice paper contains:
- **Q001–025:** journalism, news reporting, verification, editing, ethics and broadcast reporting
- **Q026–050:** public relations, government communications, media briefings, crisis messages and public service campaign evaluation
- **Q051–075:** communication models and theories, audience research, sampling, content analysis, digital journalism and media metrics
- **Q076–080:** further media ethics, verification and evaluation
- **Q081–085:** political science (constitutional structures, rule of law, legitimacy)
- **Q086–090:** Pakistan history and constitutional history
- **Q091–095:** Urdu literature terminology
- **Q096–100:** English literature and rhetoric

This is an **80 media / 20 related humanities** educational-practice allocation, *not* an assertion that an official PPSC paper has that weighting.

## Implementation

- `papers/information-officer-01-part1.js` through `part4.js` — four batches of 25 with answer choices, correct index, explanatory feedback, subject and topic.
- `papers/information-officer-01-register.js` — public practice registration, distinct job and question IDs, deterministic option rotation, stop if incomplete, global exact-stem check, **job-specific** maximum of 20, no modification of teaching-family quota.
- Candidate `index.html`, A4 `print.html`, post-submission `answer-key.html` include all five scripts; `sw.js` public PWA cache `lama-ppsc-preview-v82` includes them for offline access.
- `paper-library.js` already supports job-specific paper sequences and job-specific exam URL routing. `test-paper-library.cjs` now verifies 20 teaching and 1 information-officer paper, no cross-job fallback, saved history, and each family's own 20-paper limit.
- `validate-papers.cjs` includes all 21 registered papers. The new `test-information-officer-paper1.cjs` verifies sequential 100 IDs, answer-key stability after rotation, earlier 20 teaching objects unchanged, separate job family, distinct topics, structural answers and page/print/PWA references.
- GitHub Actions `PPSC Academy Quality Checks` passed for source integration commit `964ba6c4d72fb8a9283677e3a4ab2f298d5f69dd`, run `42597044754`.

## Supabase editorial bank

- Created the missing `information-officer` row in `public.ppsc_job_catalog` after a legitimate foreign-key check rejected insertion before job registration. Only inserted a missing row, no existing records changed.
- `is_published=true` allows job discovery; `vacancy_status='unverified'`, case number blank, no official URL claimed.
- Added **100** non-destructive `draft` rows in `public.ppsc_question_bank` under `job_id='information-officer'`, using four 25-question batches and `ON CONFLICT DO NOTHING`.
- Confirmed **100 distinct normalized stems, 100 structurally valid answer keys, zero independently approved** in the Information Officer bank; existing teaching bank remains **1,930** rows, all editorial drafts. Total private editorial rows across two jobs: **2,030**.
- Live public practice JavaScript exposes answer keys and therefore cannot secure premium/proctored assessments. Private Supabase rows remain editorial drafts pending a human review gate.

## Release and next steps

1. Verify that `www.lamastudio.pk` Vercel production alias is READY for a commit containing these files. A GitHub CI pass alone does not establish live production.
2. Check candidate routing `/education-academy/index.html?job=information-officer&paper=INFO-2026-P01`, Start Examination, 90-minute timer, scoring, history, print, post-submission answer key, PWA installation and offline cache on Android Chrome. The server cannot simulate the user's logged-in Android behavior.
3. **Next `Continue`: Information Officer Paper 02** (`IO02-001` to `IO02-100`), up to 20 papers in this job family, after checking for concurrent source/database work. Increase breadth of subject-matter questions and avoid repetition. Do **not** create Headmaster Paper 21.
4. The published job catalog has case-number ambiguity; confirm directly with PPSC before asserting eligibility or an active application opportunity.
