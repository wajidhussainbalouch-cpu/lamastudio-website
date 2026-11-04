# Class 1 Urdu — draft package checkpoint

The three local batches contain 1,500 **unapproved** questions (500 per batch). A local ZIP package and QA summary were generated for review, but the three JSON drafts are **not yet uploaded to this repository**.

## Current machine checks
- 1,500 unique question IDs; 1,451 unique literal prompts; 49 repeated-prompt occurrences.
- Easy: 470; medium: 720; hard: 310.
- Visuals: 750 emoji, 90 emoji sequences, 660 without visual fields.
- Scoring: 910 exact choice; 410 teacher review; 180 exact text.
- All 1,500 missing verified chapter and source page mappings.
- Structural issues detected: 0; this does not establish semantic correctness or suitability.

## Next gates
- Verify individual lesson pages against the actual 168-page Urdu textbook.
- Review answers, duplicates, and teacher-marked rubrics.
- Replace emoji with age-appropriate accessible original visuals.
- Commit vetted JSON files as draft data and integrate only after separate approval.
- Proceed to another subject only after checking its actual source textbook.

No production deployment or live activation was made.
