# Class 1 Urdu — Draft question-bank QA audit

Audit date: 2026-11-04. Scope: three locally generated 500-question JSON drafts (1,500 total).

## Machine-check results
- 1,500 records and 1,500 unique question IDs.
- 1,451 unique literal question prompts; 49 repeated literal prompts. The prompt `تصویر دیکھ کر درست لفظ منتخب کریں۔` appears 50 times with different visual cards.
- Difficulty: easy 470, medium 720, hard 310.
- Visual fields: 840 (750 emoji cards, 90 emoji sequences).
- Scoring: 910 exact-choice, 410 teacher-review, 180 exact-text.
- No empty answers; no MCQ correct answers missing from options.
- 590 questions have no options (includes written/oral tasks).
- All 1,500 lack verified textbook page, chapter, and lesson mappings.
- Approved: 0; online-ready: 0.

## Release blockers
1. Visually verify chapter/page mappings against the 168-page Class 1 Urdu source textbook.
2. Editorially check semantic duplicates, spelling, answer validity, and age-appropriate difficulty.
3. Replace provisional emoji with accessible original illustrations and verify RTL layout.
4. Do not auto-score the 410 teacher-review questions; review 180 exact-text questions for acceptable answer variants.
5. Keep drafts disabled in live examinations pending approval and scoring tests.

## Next subject
Identify and inspect the next subject's actual textbook before drafting 500 new questions. Do not invent textbook chapters or page references. Continue in batches of 500 without requesting per-batch approval.
