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
