# Assistant (BS-16), Kot Addu — Paper 01 (10 November 2026)

## Paper identity and evidence
- PPSC Advertisement 07/2026, Case 29-RJ/2026, Office of the Deputy Commissioner, Kot Addu (Board of Revenue).
- Written test: **100 MCQs, 100 marks, 90 minutes**.
- Uploaded screenshot and independently located reproductions of the PPSC notice specify **General Ability**. Subjects: General Knowledge, Pakistan Studies, Current Affairs, Islamic Studies (or General Knowledge for non-Muslim candidates), Geography, Basic Mathematics, English, Urdu, Everyday Science, Basic Computer Studies.
- **No official subject-specific weightages were supplied**. This educational mock assigns ten questions to each of the ten headings by editorial design, not as a PPSC-mandated percentage.
- Notice reproductions: https://www.scribd.com/document/1064535195/Advt-No-07-2026-21-07-2026-X7-Version and https://www.studocu.com/row/document/quaid-i-azam-university/functional-english-2/advt-no-07-2026-ppsc-job-openings-syllabus-details-for-various-posts/168745996
- Official PPSC website should be consulted before advertising current eligibility, vacancies or exam dates. This historical 2026 advertisement is not evidence of an open application window.

## Files and integration
- Independent job ID: `assistant-kot-addu-bor`; paper ID: `AKD-KOT-ADDU-2026-P01`.
- 100 new items: `AKD01-001`–`AKD01-100`, four independent 25-question JavaScript batches: `papers/assistant-kot-addu-01-part1.js` ... `part4.js`.
- `papers/assistant-kot-addu-01-register.js` verifies the batches and their unique IDs/topics/answer choices/explanations, checks exact normalized question duplicates against previously registered source papers, rotates answer choices deterministically and registers the job-specific paper.
- Included in `index.html`, `print.html`, `answer-key.html`, `sw.js` (offline shell cache v89), `jobs.js` (ready true), `validate-papers.cjs`, and `test-assistant-kot-addu-paper1.cjs`.
- Question-only A4 two-column print and post-submission explanation display reuse the existing academy engine.
- This creates a **26-paper / 2,600-question-position** source catalog (20 Headmaster, 3 Information Officer, 2 Junior Clerk, 1 Assistant Kot Addu), assuming the previously implemented 25 papers load.
- Separate 20-paper family cap preserved.

## Validation results / what remains
- Standalone execution of the four batches and registrar produced **100 questions, 100 unique topics, ten subjects × ten items, four distinct choices per question, answer distribution 20/25/31/24** and no registration errors.
- Comparing the new paper against existing Bahawalpur and Faisalabad Junior Clerk papers and the base demo yielded no exact normalized duplicate stems.
- **Not yet verified:** full historical 2,500-question collision scan, Node regression suite run on the complete repository, live deployed site, mobile/PWA cache behavior, or human academic and Urdu/Islamic Studies subject-matter review. No claim of production acceptance is made.
- Content is AI-assisted original **practice**, not authenticated previous PPSC exam questions and not human-approved.
- PPSC provides a General Knowledge alternative for non-Muslim candidates. The content currently includes ten Islamic Studies items; a separate suitable alternate form is still required without inferring a user's religion.
- Browser-side answer keys are viewable; do not treat free/source practice as secured premium question material.
- Supabase protected editorial bank was **not modified** by this source-only update.

## Next priority
Assistant (BS-16), Faisalabad — Paper 01 (100 General Ability MCQs), then Secretary 'A'/'B' Class Market Committee papers using their specified 60/40 qualification/general split, subject to source validation.
