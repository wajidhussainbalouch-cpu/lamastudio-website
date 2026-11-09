# Class 2 General Knowledge — question-bank progress

Updated 2026-11-09

## Source
- Google Drive: `GK 2.pdf`, file ID `1zcFk3RFMgOqGpsZWtJi67kSAyDgC9kw_`, 96 pages per source register. File metadata fetched; PDF pages/lessons not yet visually inspected.
- Intake file `data/class2-general-knowledge-intake.json` was **not found on main**; older handoff records an unresolved merge. Do not claim intake was merged.

## Batch 1
- `data/class2-general-knowledge-batch1-500-draft.json`, commit `fbe312d151a9c2e932441a5dbbc6c0a1bcdcbfeb`.
- 500 records, IDs 0001–0500, 125 concepts × four assessment formats, 100 each on human body/health, plants/nature, animals, community/transport, Earth/environment.
- Automated structural checks: 500 unique IDs, 500 unique literal prompts, nonempty answers and MCQ correct options included. This does NOT verify factual accuracy, appropriate distractors or absence of semantic repetition.
- **All 500 are supplemental drafts**, `approved=false`, `onlineReady=false`; not mapped to textbook chapters or PDF pages. They must not be used in official printed papers or live student exams before editorial review.

## Next work
1. Resolve GK intake on main, inspect actual source pages and chapter list.
2. Audit and correct 500 draft questions against textbook and age-appropriate learning outcomes; improve distractors and deduplicate concepts.
3. Continue with 500 further original draft questions, then another 500, avoiding prior topics where possible.
4. Only after validation integrate reviewed questions with shared bank for paper printing and online testing; keep answer keys secure.

No Vercel deployment or school data changes.

## Batch 2 — 2026-11-09
- `data/class2-general-knowledge-batch2-500-draft.json`, commit `9b317f1373408782e234565ae9df7d2603a9cb3f`.
- 500 draft records, IDs `C2-GK-B2-0501`–`C2-GK-B2-1000`; 250 original question stems, each in short-answer and oral forms. Ten new topic groups, 50 records each.
- Structural QA passed: 500 unique IDs and literal prompts. All are teacher-review-required, not auto-graded, not approved or online-ready. Source GK 2.pdf content has not been examined; alignment and factual checking remain pending.
- Running GK total: 1,000/1,500 drafts. Next: batch 3, 500 drafts, avoiding semantic duplication; review source and batches before production.

## Batch 3 — 2026-11-09
- `data/class2-general-knowledge-batch3-500-draft.json`, commit `dc81b547c4529d322de3c409319de5d63119652d`.
- IDs `C2-GK-B3-1001`–`C2-GK-B3-1500`: 125 supplemental concepts × four formats = 500 question records, five topic groups. Structural checks: 500 unique IDs and prompts; no empty answers.
- **GK total: 1,500 draft records** (batch 1 500, batch 2 500, batch 3 500). The records are not 1,500 independent facts; formats repeat concepts. All `approved=false`, `onlineReady=false`; not textbook-aligned or ready for official paper printing/online tests. Check semantic duplicates, age appropriateness, factual correctness, and curricular relevance before activation.
- No deployment or school data changes. Next subject to work on: Class 2 Islamiat, subject to source verification and user's earlier instructions about prioritization.
