# Class 1 Urdu — reproducible validation (2026-11-04)

Source inputs: three 500-record local draft JSON batches. These draft files are **not yet stored in the repository**. The validation script must be run with a directory containing all three named input files.

- Total records: 1,500 (500 per batch); unique IDs: 1,500.
- Unique literal question prompts: 1,451. One visual prompt repeats 50 times (49 duplicate occurrences), with picture-dependent answers.
- Difficulty: easy 470; medium 720; hard 310.
- Scoring: exact choice 910; teacher review 410; exact text 180.
- Visual fields: 840.
- All 1,500 lack verified textbook chapter, lesson and PDF page mapping.
- Structural validation issues: **0**. This does **not** certify factual correctness, teaching quality, semantic uniqueness, or textbook alignment.
- Approved: 0; online-ready: 0.

## Release gates
1. Visually check actual textbook lessons and map each question to verified material or classify as supplemental practice.
2. Editorially review questions, answers, difficulty, repeated concepts, and acceptable Urdu spellings.
3. Review all teacher-marked responses and exact-text answer variants.
4. Replace provisional emoji visuals with accessible licensed/original assets; test RTL on mobile.
5. Keep draft questions unavailable to students until approved.

No website deployment or live examination activation was performed.
