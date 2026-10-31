# Lama IQ Test — Question Bank

This directory contains **5,000 generated draft question records**, stored in five JSON files. Each field has 10 levels with 100 records per level.

| File | Records |
| --- | ---: |
| number_logic.json | 1000 |
| visual_patterns.json | 1000 |
| memory.json | 1000 |
| attention.json | 1000 |
| advanced.json | 1000 |

## Data contract
Each record has `id`, `field`, `level`, `kind`, `prompt`, `options`, `correctIndex`, `explanation`, `language`, `source` and `reviewStatus`.

## Quality status — NOT READY FOR RELEASE
- Automated creation confirmed 5,000 distinct IDs and distinct literal prompts, not 5,000 conceptually distinct puzzles.
- Many records are parameterized variants of only five template families. Some visual sequences repeat the same logical rule with different record labels; they need more varied pattern families and semantic deduplication.
- Memory records currently expose the memorization target in the prompt; the game must separate timed presentation and recall screens before these are playable.
- Attention records require a visual/timed presentation, accessible alternatives, and careful display validation.
- Difficulty is only parameterized; it has not been calibrated to ten genuinely progressive levels.
- All records are English-language drafts; Urdu, Arabic, Hindi and Spanish translation has not been done.
- No native-speaker review, user testing, independent answer verification or APK integration has been completed.
- Do not market this bank as 5,000 validated unique brain puzzles until those checks pass.

## Architecture
GitHub JSON is the source of truth. Release builds can bundle validated question packs as offline assets, without a per-question cloud database or paid AI service. Only validated records should enter the player-facing app.

## Access
Target: first 100 free questions, ten-question batches, 7/10 progression. Additional packs via verified rewarded ads or optional Pro subscription. AccessPolicy.kt currently defines policy only and is not wired to this JSON bank.

## Offline quality gate (31 October 2026)

Run `python3 apps/lamaiqmaster/question-bank/validate_bank.py` from the repository root.
The validator checks the five 1,000-record packs, field/level counts, unique IDs,
option validity, answer-index bounds, missing explanations, and repeated substantive
prompts after stripping artificial trial/pattern suffixes. It also warns when memory
questions require hiding the stimulus before answers are shown. The validator exits
nonzero on any warning or error. Passing structural checks alone would **not**
establish educational correctness or 5,000 conceptually unique questions; those
require independent answer checking and editorial review. No deployment was run.
