# Class 1 Urdu — deeper content risk audit

## Scope
Three existing local draft batches, 500 questions each, 1,500 total. This is an automated risk scan, **not** an educational approval.

## Findings (2026-11-04)
- **550 questions contain the literal correct answer in the question prompt**. Some may be intentional (spelling/copying/grammar), but all require type-specific review; many may be unsuitable as objective assessment items.
- **450 questions have the literal correct answer in the visual alternative-text field**. This is helpful for accessibility but dangerous if alt text is shown as an answer hint in the student interface. Implement separate accessible and exam-safe presentation rules.
- **95 distinct correct answers occur across multiple batches**. This is *not* proof of duplicate questions, but indicates vocabulary overlap that requires concept-level review.
- Visual assets: **750 emoji**, **90 emoji sequences**, **660 questions without visual assets**. Emoji are provisional; no final illustrations have been delivered.
- All teacher-review scoring flags are internally consistent (0 flag mismatches).
- 0 draft questions have fabricated PDF page mappings.

## Actionable fixes
1. Classify the 550 answer-in-prompt questions by intended task; rewrite any item where the prompt gives away the target response.
2. Preserve accessibility, but avoid exposing the correct answer via visible image labels, filenames, or hover hints during a scored examination. Test with assistive technology.
3. Review vocabulary repetition across batches and vary cognitive skills, not only wording.
4. Map actual lesson content from the supplied 168-page textbook; distinguish supplemental phonics practice from chapter-based questions.
5. Keep all 1,500 questions in draft, unapproved and offline-only until teacher review.

This audit does not assert that 550 questions are wrong; it identifies candidates for human review.
