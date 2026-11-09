# LAMA PPSC Academy — Junior Clerk (BS-11), Faisalabad Paper 01

**Prepared:** 9 November 2026  
**Job family:** `junior-clerk-faisalabad-bor`  
**Practice Paper:** `JCF-FAISALABAD-2026-P01`  
**Question IDs:** `JCF01-001`–`JCF01-100`  
**Academic status:** 100 original AI-assisted **practice** MCQs. Automated technical validation passed; expert review and the original PPSC document check remain pending. These are not official PPSC past-paper questions.

## User-supplied PPSC written syllabus

From the uploaded **Faisalabad Board of Revenue Junior Clerk (BS-11)** syllabus screenshot:

- **100 questions / 100 marks / 90 minutes**.
- **80% General Ability**: General Knowledge, Pakistan Studies, Current Affairs, Islamic Studies (General Knowledge instead for non-Muslim candidates), Geography, Basic Mathematics, English, Urdu and Everyday Science.
- **20% MS Office and Computer Skills**.
- Only written-qualified candidates progress to English typing/proficiency assessment at the **1:20 ratio** stated in the screenshot; typing qualification precedes English proficiency. A typing or proficiency simulator has **not yet** been developed in this paper.
- Case number is not clearly legible in the supplied screenshot; **no official case ID is asserted**. A syllabus screenshot does not prove a vacancy is currently accepting applications.

## 100-question original paper breakdown

| Question range | Subject | Count |
|---|---|---:|
| 001–008 | General Knowledge | 8 |
| 009–016 | Pakistan Studies | 8 |
| 017–025 | Current Affairs and Institutions | 9 |
| 026–032 | Islamic Studies | 7 |
| 033–040 | Geography | 8 |
| 041–050 | Basic Mathematics | 10 |
| 051–060 | English | 10 |
| 061–068 | Urdu | 8 |
| 069–080 | Everyday Science | 12 |
| 081–100 | MS Office and Computer Skills | 20 |
| **Total** | **80 General Ability + 20 Computer** | **100** |

The general-ability subtopic counts are **academy preparation allocations**, not a further official PPSC split. All 100 MCQs contain four options, a correct key, subject and unique topic, difficulty label and explanation. Question choices rotate deterministically without changing the correct answer; Urdu Unicode and spreadsheet-symbol answer comparisons are preserved. Independent academic review remains required, particularly for language and historical details.

## Files and technical integration

- `papers/junior-clerk-faisalabad-01-part1.js` through `part4.js` — four original 25-question content blocks.
- `papers/junior-clerk-faisalabad-01-register.js` — separate job identity, paper ID, 90-minute duration, 20-paper family ceiling, 80/20 validation, no duplicate stems, and a candidate-facing note about the non-Muslim General Knowledge alternative.
- `index.html`, `print.html`, `answer-key.html`, `sw.js` — loaded paper in candidate exam, two-column A4 PDF printing, post-submission answer review, and public PWA offline cache.
- `test-junior-clerk-faisalabad-paper1.cjs` and `test-paper-library.cjs` — key rotation, sequential IDs, distinct stems/topics, no high-text overlap with Bahawalpur Paper 1, preserve 24 previous paper objects, 25 total public practice papers / 2,500 MCQ positions, and no cross-job question fallback.
- `validate-papers.cjs` and GitHub Actions now include the new paper. PPSC automated quality workflow passed at source integration commit `a9c50447dc1db1f865e19912a58dbbd45cb746ff`, run `42647036327`.
- The academy's printable-paper template was separately corrected to keep a readable mobile header while applying **two columns only for actual A4 printing**; this test checks source and component references, not a complete real-device Chrome print-preview screenshot.
- `jobs.js` now marks **Faisalabad Junior Clerk `ready:true`**; the parallel Bahawalpur job remains independently ready. Other supplied-syllabus jobs without papers remain pending.

## Protected Supabase editorial bank

- Inserted exactly **100 `JCF01-*` entries** in four batches of 25, `job_id='junior-clerk-faisalabad-bor'`, `review_status='draft'` and documented AI-assisted provenance; non-destructive `ON CONFLICT DO NOTHING` used.
- Verified: **100 distinct normalized question texts, 100 valid four-option answer indices, 100 draft records**.
- Existing protected items preserved: Teaching **1,930**, Information Officer **300**, Junior Clerk Bahawalpur **100**; the new total is **2,430** private editorial questions.
- No source publication or technical test means an academic reviewer has approved these questions; public JavaScript practice answer keys are not secure paid/proctored exam storage.

## Outstanding release gates and next work

1. Confirm the live Vercel production alias is on a commit including the new source code; CI passing is not confirmation of a successful production release. Avoid unnecessary manual deployments due to previously reached Vercel limits.
2. On actual Android Chrome/PWA: choose Faisalabad Junior Clerk, manually start Paper 01, test 90-minute countdown, question marking, saved attempt, result and explanation, and **two-column A4 Print / Save PDF output**.
3. Provide an opt-in General Knowledge alternate question form for non-Muslim candidates, **without inferring personal religion**; this current form includes seven Islamic Studies questions and should be labeled accordingly.
4. Add a separate English typing and English-proficiency practice module if the owner requests testing beyond written MCQs.
5. **Next `Continue`: Assistant (BS-16), Kot Addu Paper 01**, using the supplied **100-mark General Ability** screenshot without invented subject percentages, distinct job ID `assistant-kot-addu-bor` and question IDs.

