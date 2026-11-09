# Class 2 Islamiat — structural QA audit

Date: 2026-11-09
Status: **review-only / NOT production-ready**

## Files inspected on main
- `data/class2-islamiat-batch1-500-draft.json`
- `data/class2-islamiat-batch2-500-draft.json`
- `data/class2-islamiat-batch3-500-draft.json`

## Verified structural counts

| Check | Batch 1 | Batch 2 | Batch 3 | Total |
| --- | ---: | ---: | ---: | ---: |
| Question records | 500 | 500 | 500 | 1500 |
| Duplicate literal prompts within batch | 0 | 0 | 0 | 0 within each batch |
| Missing answer values | 0 | 0 | 0 | 0 |
| Missing `sourcePdfPage` | 500 | 500 | 500 | 1500 |
| `approved=true` | 0 | 0 | 0 | 0 |
| `onlineReady=true` | 0 | 0 | 0 | 0 |

**Important:** These checks do not establish semantic uniqueness, correctness, age appropriateness, or PCTB alignment. Each batch explicitly contains 100 concepts repeated in five formats, meaning 1500 records represent about 300 underlying drafted concepts before cross-batch deduplication.

## Integration blocker: inconsistent answer fields

- Batch 1 uses `correctAnswer`.
- Batches 2 and 3 use `expectedAnswer`.
- A future normalized importer should map either to a canonical `expectedAnswer` for subjective/oral assessment, without silently treating these as machine-graded MCQs.
- Existing source files should not be rewritten blindly because consuming code may depend on the current field names.

## Content-review blockers

1. The 48-page `Islamiat 2 PCTB Watermark_compressed.pdf` is registered under Drive ID `1Z6_q9lf4H2zdXw_VInOMIUZRLFG_QL8X`, but lesson-by-lesson visual verification is not completed.
2. No record is linked to an actual source textbook page.
3. Many items are general ethics/life skills rather than demonstrably from the Class 2 Islamiat textbook.
4. Literal uniqueness does not exclude semantically repeated prompts or answers.
5. Religious details, Arabic spellings, honorifics, and curricular relevance require qualified teacher review.
6. Oral and written responses require teacher marking; avoid automatic string comparison as final grading.

## Release gates

1. Inspect the source PDF visually and create a verified chapter/page index.
2. Mark every question as textbook-aligned or supplemental; reject or revise inaccurate/unclear items.
3. Run semantic deduplication on all 1500 records and replace repeated question formats with independently useful assessment items where needed.
4. Normalize answer fields in a versioned adapter and ensure school/teacher permissions and tenant separation.
5. Secure answer keys and publish only approved questions to paper printing and online testing.
6. Run controlled school-level end-to-end tests before any production release.

No Vercel deployment, question approval, or school-data changes were made by this audit.

## Integration safeguard increment — 2026-11-09
- Added `tools/class2-islamiat-draft-adapter.cjs` (commit `723f678e07af839ef18b112d3b0723a2679b0d7b`) to normalize either `correctAnswer` or `expectedAnswer` into a review-only representation.
- Added `tools/class2-islamiat-draft-adapter.test.cjs` (commit `631c060ca87a2b08e5c118c94fbdfdd0168f37c9`) with Node assertions covering answer-field fallback, rejection of approved/non-draft input, duplicate IDs, rejection of student delivery for drafts, and student answer-key omission.
- This is **not wired into the Paper Generator or Online Testing**. Tests are committed but were **not executed in CI or a runtime during this increment**. Run `node examination-system/tools/class2-islamiat-draft-adapter.test.cjs` and integrate only after verifying test results.
- The adapter is not a substitute for a secure server-side authorization check; approved content still requires a verified teacher-review and school-access workflow.

## Reproducible audit tooling — 2026-11-09
- Added `tools/audit-class2-islamiat.cjs` in commit `79c0ccefc760f736fb4832d3d386358db8bed254`.
- Run from repository root: `node examination-system/tools/audit-class2-islamiat.cjs`.
- Script checks all three batch files for total and per-batch counts, IDs, literal prompts, answers, textbook page mapping, approval and online-ready flags, and question-type distribution; exits nonzero on structural blockers.
- In an independent in-session data inspection, all 1500 records were fetched. A simple normalization that removes some assessment-mode prefixes reduced 1500 prompts to 1000 normalized strings, with 200 repeated groups totaling 700 records. **This is only a partial lexical heuristic, not a reliable count of distinct concepts**: inconsistent prefix conventions cause under-detection, and the source metadata explicitly says each batch contains 100 concepts repeated five times. Teacher-led semantic deduplication is still required.
- The committed CLI has not been run with Node in this session, and no production integration or deployment occurred.

## CI validation workflow — 2026-11-09
- Added `.github/workflows/class2-islamiat-draft-qa.yml`, commit `237f92f3d471d97cc32ad0944875459bf09ea08a`.
- On relevant pushes, pull requests, and manual dispatch, GitHub Actions is configured to run Node 22, the draft adapter unit tests, and the 1500-record structural audit. Permissions: read-only contents. No deploy steps.
- **Workflow execution status has not been verified.** Do not claim CI passed until checking its actual run logs/status. This is structural QA, not textbook or theological review.

## Concept-aware paper selection prototype — 2026-11-09
- Added `tools/class2-islamiat-paper-selector.cjs` (commit `dfe51b6445697dc97ced219f7e0bd9912b0e001d`) and synthetic fixture tests (commit `b131feafbf1ee0722f21b2fa9ec2581b4c44446f`).
- Selector accepts a **server-authorized** question pool and explicit concept-family index, chooses at most one variant per family, and excludes answer keys from the returned paper.
- Requires approved status, online readiness, completed teacher review, and a positive textbook page integer. It does **not** independently verify that a page number matches the book, authenticate the caller, or enforce tenant separation; these must be provided by trusted server code.
- The current 1500 draft questions remain ineligible for selection. Tests use synthetic approved fixtures only; they are not evidence of approved textbook content.
- Added the selector test to `.github/workflows/class2-islamiat-draft-qa.yml` (commit `bc57af05e3cdc83545917374cb1e1613f69fba27`). CI status and runtime execution have not been verified, and no live integration or deployment occurred.
