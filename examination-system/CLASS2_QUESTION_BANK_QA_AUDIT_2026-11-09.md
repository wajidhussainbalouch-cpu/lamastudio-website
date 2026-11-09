# Class 2 Question Bank — automated QA baseline
Date: 2026-11-09
Repository branch: main

## Scope
Read all 15 Class 2 draft JSON batches, 500 records each: Urdu, English, Mathematics, General Knowledge and Islamiat.

| Subject | Records | Missing question text | Missing answer field | Exact duplicate prompt occurrences within subject | Null sourcePdfPage | Approved |
|---|---:|---:|---:|---:|---:|---:|
| Urdu | 1500 | 0 | 0 | 23 | 1500 | 0 |
| English | 1500 | 0 | 0 | 0 | 1500 | 0 |
| Mathematics | 1500 | 0 | 0 | 0 | 500 | 0 |
| General Knowledge | 1500 | 0 | 0 | 0 | 1500 | 0 |
| Islamiat | 1500 | 0 | 0 | 0 | 1500 | 0 |
| **Total** | **7500** | **0** | **0** | **23** | **6500** | **0** |

All 7,500 question IDs are unique across these 15 batches. All records contain an answer in either `correctAnswer` or `expectedAnswer`. No obviously malformed MCQ answer options were detected by a basic check. This does NOT establish that answers are correct.

**Important interpretation:** `sourcePdfPage` is non-null for 1,000 Mathematics items; this does not prove those references were verified against the original textbook. Every reference needs source review.

## Priority issues
1. **Zero approved items:** do not publish any of these records as official printable or online exam questions.
2. **23 exact repeated Urdu prompts:** review and replace after confirming intended learning outcomes; do not blindly delete student content or change IDs.
3. **Semantic repetition:** many GK and Islamiat records deliberately use multiple formats for the same underlying concept. Unique prompt text is not independent content.
4. **Source alignment:** 6,500 records have null textbook page references. Verify all textbook alignment, including non-null Math references, with the actual source PDFs.
5. **Question schema drift:** Islamiat batches 2–3 use `expectedAnswer`, whereas many other batches use `correctAnswer`; importers must normalize safely and must not expose answer keys to students.
6. **Type compatibility:** oral, matching, reflection, dictation and written-response questions require appropriate grading workflows; do not treat them all as auto-graded MCQs.
7. **Security:** the draft JSON files contain answer keys. They are in a repository path and must not be served as public client assets. Store reviewed answer keys server-side with authenticated access and school isolation.

## Release gates
- Independent curriculum/textbook verification per item; teacher approval, documented reviewer and date.
- Deduplicate near-identical learning outcomes, not merely literal prompts.
- Validate all option sets, answers, Urdu and Arabic orthography, marks and age suitability.
- Produce a reviewed, sanitized question-delivery API that never sends answers before permitted review.
- Test both Paper Generator and Online Testing end-to-end, including scoring, student isolation and result persistence.
- Obtain approval before any production deployment. No deployment was performed by this audit.

## Audit method
Fetched and parsed each JSON file from GitHub main; checked array lengths, global ID uniqueness, blank question/answer fields, null page references, `approved` flags, basic MCQ option membership, and lowercased trimmed exact prompt repetition within each subject. No semantic similarity model, external textbook validation or live browser test was performed.
