# LAMA PPSC Academy — Information Officer (BS-17), Paper 02

**Created:** 9 November 2026  
**Job family:** `information-officer` (separate from `teaching`)  
**Practice paper:** `INFO-2026-P02`  
**Question IDs:** `IO02-001`–`IO02-100`  
**Academic status:** Original AI-assisted educational practice, **not official PPSC questions**; independent subject review and direct PPSC syllabus confirmation still required.

## Scope and learning objectives

- **Q001–025:** investigative and data journalism, source verification, editing, attribution, correction policy, broadcasting and reporting ethics
- **Q026–050:** mass communication theory, media effects, audience studies, sampling, content analysis, media networks and research design
- **Q051–075:** public information operations, PR campaign planning, crisis communication, digital analytics, accessible public notices and media relations
- **Q076–080:** editorial practice, data journalism, AI-transcription accuracy, media monitoring and community radio
- **Q081–085:** political science (parliamentary government, judicial review, subordinate law, freedoms and accountability)
- **Q086–090:** Pakistan history (All-India Muslim League, Lucknow Pact, Allahabad address, Cabinet Mission and independence legislation)
- **Q091–095:** Urdu literature forms (musaddas, rubai, masnavi, tazkira and qasida)
- **Q096–100:** English literature (soliloquy, oxymoron, synecdoche, enjambment and assonance)

The educational-practice allocation is **80 journalism/communications-related and 20 related humanities** items. Current official PPSC eligibility, syllabus, case number and weightage must be checked from the original advertisement/commission notice before representing them as authoritative. A historical secondary listing refers to case **09-RH/2026**; the website's older catalog uses **09H2026**, which remains unresolved and should not be silently promoted as an official case identifier.

## Technical integration and isolation

- Four question batches, 25 each: `papers/information-officer-02-part1.js` to `part4.js`.
- Dedicated `papers/information-officer-02-register.js` publishes `INFO-2026-P02` as **100 questions / 90 minutes**, `sequence:2`, `jobIds:['information-officer']`, public free original practice. Separate paper ID preserves isolated attempts, scores and answer keys.
- The existing `paper-library.js` exposes exactly **2 of 20** Information Officer papers and **20 of 20** school-head teaching papers. No 21st teaching paper was added. Across jobs, the public source registry has **22 papers / 2,200 MCQ positions**.
- Integrated in `index.html`, `print.html`, `answer-key.html` and `validate-papers.cjs`, with public offline service-worker cache `lama-ppsc-preview-v83`.
- `test-information-officer-paper2.cjs` verifies 100 unique stems/topics, four distinct options, answer rotation, paper registration, previous question/paper-object preservation, 90-minute duration, job isolation, no high-overlap repeats against Paper 01, page references and offline cache. `test-paper-library.cjs` adds direct-link, history and quota checks. CI now invokes the new test.
- GitHub Actions `PPSC Academy Quality Checks` **passed** at commit `2bb379fa071242053aeb322976494b14bcf1492e` (run `42604313502`).
- Initial automated CI failures were caused by a Paper 01 regression test asserting an **obsolete static cache version v82**. Updated both Information Officer tests to validate a versioned cache generically so future cache revisions do not break unrelated historical tests.

## Supabase editorial data

- Inserted all 100 Paper 02 questions as protected `draft` entries in `public.ppsc_question_bank`, using non-destructive `ON CONFLICT DO NOTHING`, under already registered `job_id='information-officer'`.
- Verified Information Officer editorial bank: **200 rows, 200 distinct normalized stems, 100 Paper 02 drafts**. Existing teaching bank remains **1,930** questions. Total across both job families **2,130 editorial rows**.
- Editorial draft approval requires independent academic verification, separate from the automated structural and key consistency tests.
- Public browser JS necessarily contains correct answers and therefore is **not a secure premium/proctored examination backend**.

## Release and next steps

1. Check the Vercel READY production alias for a commit that contains the completed Paper 02 integration; passing source CI does **not** establish that the public site has been updated.
2. Android Chrome/PWA live QA: select Information Officer, choose Paper 02, start manually, check timer, save and resume, submit, score, post-submission explanation and question-only print.
3. **Next `Continue`**: Information Officer **Paper 03** (`IO03-001`–`IO03-100`) with original subject-specific questions and separate 20-per-family cap; check for concurrent work before authoring.
4. No manual Vercel deployment was initiated during this batch, respecting previously reported deployment quota issues.
