# Urdu Class 1 — draft ingestion contract

This directory contains the source map and intake record. The 3 × 500 draft JSON files currently exist as local conversation artifacts, **not in GitHub**. Never claim they are deployed.

## Import safeguards
- Accept exactly three batches of 500 records and 1,500 globally unique question IDs.
- Preserve question IDs, answers, choices, difficulty, provisional visuals, and teacher-review flags.
- Force `approved=false`, `onlineReady=false`, `reviewStatus=draft` for every unverified record.
- Reject any question missing ID, prompt, or answer.
- Keep `chapterId`, `lessonId`, and `sourcePdfPage` null until visual source verification; never invent page numbers.
- Never expose drafts to live student exams.
- Treat `onlineScoringMode=teacher_review` as requiring human grading; exact-text requires variant review.
- Use a deterministic import keyed by `questionId` to prevent duplicates and preserve previous reviews.
- Only publish after manual editorial and textbook verification.

## Local deliverables
The conversation contains `class1-urdu-batch1-500-draft.json`, `class1-urdu-batch2-500-draft.json`, `class1-urdu-batch3-500-draft.json` and a ZIP review package. A SHA-256 manifest and safe review copies can be regenerated locally.

## Handoff to next subject
Proceed in groups of 500 from the next subject's actual textbook. Confirm chapter/source mapping before claiming textbook alignment. Do not deploy or overwrite production data.
