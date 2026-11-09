# Class 2 Islamiat — question-bank progress

Updated 2026-11-09

## Textbook
- Registered source `data/class2-islamiat-intake.json`: `Islamiat 2 PCTB Watermark_compressed.pdf`, Drive ID `1Z6_q9lf4H2zdXw_VInOMIUZRLFG_QL8X`, 48 pages, 2022 PCTB web version.
- Drive text extraction mostly returns watermark text. **Lesson-by-lesson visual textbook verification has not occurred.** Do not present supplemental questions as textbook-derived.

## Batch 1
- `data/class2-islamiat-batch1-500-draft.json` commit `ca7218b613829f83ba7456539affb2daefb69d7b`.
- 500 draft records: 100 general-Islamiat concepts in five near-repetitive modes; topics: beliefs, worship, Seerah/prophets, manners, calendar/places.
- 500 unique IDs and literal prompts. Not 500 independent concepts. No textbook lesson/page mapping; all `approved=false`, `onlineReady=false`, `requiresTeacherReview=true`.
- Needs qualified teacher verification of theological details, exact wording, Urdu spelling, child suitability, curricular coverage and repeated concept formats. These questions must not be used for official printed papers or live online tests until approved.

## Next
1. Visually review the supplied PDF chapter-by-chapter and record actual chapter/page coverage.
2. Audit batch 1, revise or reject unclear questions, and ensure oral answers are not auto-graded.
3. Create further batches only after topic coverage and repetition checks.
4. Connect reviewed questions to shared Paper Generator and Online Testing question bank without leaking answer keys.

No Vercel deployment or live activation.

## Batch 2 — 2026-11-09
- `data/class2-islamiat-batch2-500-draft.json` committed as `f2540a768e5d084cb21593f08cb451456a53d96b`.
- IDs 0501–1000; 100 supplemental Urdu concept stems in five modes, 500 structurally unique prompts, not 500 independent facts. Topics: cleanliness, Quranic manners, daily phrases and supplications, service, social conduct.
- Automated structural QA passed: count, IDs, literal prompts. **No visual verification of the 48-page PCTB textbook**; factual/theological/curriculum suitability review outstanding. All `approved=false`, `onlineReady=false`, `requiresTeacherReview=true`.
- Running Class 2 Islamiat total: 1,000/1,500 draft records. Do not expose these as approved questions in paper generator or online exams.
