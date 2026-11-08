# Class 2 English — 1,500-draft milestone and next subject

## English
- Batch 1: `data/class2-english-batch1-500-draft.json` — 500 records.
- Batch 2: `data/class2-english-batch2-500-draft.json` — 500 records.
- Batch 3: `data/class2-english-batch3-500-draft.json` — 500 records, commit `ad764195960c54a8a1ccaa4792f3a98ba48de1bd`.
- Total **1,500 supplemental drafts** in three batches. Each batch has 125 examples × four assessment formats, so this does not mean 1,500 independent concepts. Batch 3 includes simple present, present continuous, conjunctions, question words and reading comprehension.
- Automated checks for batch 3: 500 unique IDs, no empty answers, no duplicate literal prompts. This does **not** validate pedagogical correctness or cross-batch semantic uniqueness.
- All English questions remain `approved=false` and `onlineReady=false`. Textbook lesson/page mapping, answer-key verification, semantic deduplication and teacher-assessed oral/written responses are pending. Some conjunction items have ambiguous choices; action-word distractors may be weak.

## Next subject: Class 2 Mathematics
- Registered intake: `data/class2-mathematics-intake.json`.
- Source: `math 2.pdf`, Google Drive ID `11SMlZk9Z3mdAG49ewxxK0ge1DnvyKViZ`, 154 pages. Intake says PDF text extraction unavailable and visual review required.
- Current Mathematics question count: **0**. Do not claim the textbook was inspected or mathematics questions generated until performed.
- Next: retrieve the source, inspect pages and units, create mathematically verified 500-question drafts with source references and age-appropriate visuals.

No production deployment or student-facing activation.

## Mathematics batch 1 — 2026-11-08
- Source `math 2.pdf` (154 pages), Drive ID `11SMlZk9Z3mdAG49ewxxK0ge1DnvyKViZ` retrieved. Visually inspected PDF pages 4–6: Unit 1 Whole Numbers learning outcomes, ordinal-number bees and ordinal exercise with alphabet cars.
- `data/class2-mathematics-batch1-500-draft.json` commit `c06d7ec47c77a4052f6c86f4f13899099a47317a`: 500 supplemental drafts, 50 each in ordinal numbers, number names, numerals, place value, comparison, ascending, descending, backward count, tens, hundreds.
- Construction checks: 500 unique IDs, 500 unique literal prompts, all answers present, MCQ answers present in options. This is **not** an independent validation of each answer, classroom suitability or semantic uniqueness. The hundreds sequence has repeated numeric patterns with different labels. Some questions reference curriculum outcomes on PDF page 4, not an identical textbook exercise.
- All `approved=false`, `onlineReady=false`; no live exams or Vercel deployment. Next: math QA and batch 2 from additional visually verified pages.

## Mathematics batch 2 — 2026-11-08
- `data/class2-mathematics-batch2-500-draft.json` committed at `ba203afd141cfafc4f20b74c64f1749e5d49a34d` (500 draft records, IDs 501–1000). Covers number sequences, number names, 3-digit numbers, hundreds/tens/ones, place value, expanded form, successor, comparison, and ascending order.
- Visually inspected source PDF pages 7–18 and later pages 19–26. Pages 19–26 cover comparison, ascending/descending ordering, backward counting, counting in tens, and hundreds. Some repeated concepts are intentionally present across batches.
- Structural checks: 500 unique IDs, 500 distinct literal prompts, no empty answers, no missing MCQ answers in options. **Independent arithmetic validation, semantic duplicate review and teacher grading still pending.** The `sourcePdfPage` is a lesson-topic reference, not an exact-question citation. All drafts unapproved and offline.
- Mathematics progress: 1,000/1,500; next batch 3 (1001–1500). No Vercel deployment.

## Mathematics batch 2 discovered and verified — 2026-11-08
- Existing file `data/class2-mathematics-batch2-500-draft.json` was found on `main`, with 500 records and IDs `C2-MATH-B2-0501`–`C2-MATH-B2-1000`. Do **not** overwrite or double-count it.
- Topics: Counting to 100, Number words, Three-digit names, Numerals, Base-ten blocks, Place value, Expanded form, Next number, Compare numbers, Ascending order. Source references visually inspected PDF pages 7–18; independent verification of each source mapping remains pending.
- Existing batch metadata reports 500 unique IDs, 500 unique literal prompts, and no missing answers. All records are unapproved. This is a structural check, not a complete arithmetic or pedagogical audit.
- Class 2 Mathematics now has **1,000 saved draft questions** across batches 1 and 2. Next: batch 3 (1001–1500) after inspecting further textbook pages; do not deploy.

## Class 2 Mathematics — third 500-draft batch (2026-11-08)
- Committed `data/class2-mathematics-batch3-500-draft.json`, commit `ec56b6fac69607618b31dae604b8cdf70e88def5`, IDs `C2-MATH-B3-1001`–`C2-MATH-B3-1500`.
- 500 supplemental questions, 50 each: addition, subtraction, number before/after, missing addend/subtrahend, ten more/less, hundred more/less. Arithmetic answers programmatically checked; 500 unique IDs and prompts.
- Class 2 Mathematics has **1,500 draft records across three batches**. All remain `approved=false`, `onlineReady=false`. Batch 3 is **not individually textbook page-verified** and may need adjustments for teaching progression and regrouping. Editorial review, cross-batch deduplication and textbook mapping required before activation.
- No live website deployment. Next subject to be selected from verified Class 2 intake.
