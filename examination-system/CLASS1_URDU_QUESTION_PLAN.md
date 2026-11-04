# Class 1 Urdu — Question Bank Editorial and Source Verification Plan

**Status:** Source confirmed, lesson/page mapping unverified, 0 textbook-approved questions.
**Source:** `urdu 1  2024 water mark.pdf`, Google Drive ID `17o-AGE3z00m-z8Kih389pmAeWolTxA2N`, 168 PDF pages, application/pdf.
**Warning:** Google Drive's parsed text is badly corrupted for Urdu. Do not derive chapter titles, quotations, page citations, vocabulary lists or learning outcomes from that text.

## Production workflow
1. Visually inspect the PDF table of contents and chapter opening pages. Record PDF page, printed page, chapter title in Urdu, and a short description of the verified lesson.
2. Build `data/class1-urdu-chapter-map.json` only from visually verified pages. Include page evidence and source edition; never guess missing chapters.
3. Draft **original** Urdu questions tied to a verified lesson: reading comprehension, vocabulary, word formation, spelling, singular/plural, gender, sentence formation, punctuation, dictation, matching, oral reading, and picture prompts only when applicable to the verified source and class level.
4. Every question needs `questionId`, `class`, `subject`, `chapterId`, `lessonId`, `sourcePdfPage`, `questionType`, `questionText`, `correctAnswer`, `difficulty`, `marks`, `reviewStatus`, `approved`, `onlineReady`, `requiresTeacherReview`.
5. Ensure proper Urdu script and right-to-left display in print and student previews; test font rendering and punctuation. Never auto-score dictation, pronunciation or creative writing as a simple exact-string match.
6. Run exact and semantic duplication review. Reject rewordings that merely change a name or swap one word without testing a different concept.
7. Require independent answer and curriculum review before setting `approved=true`; require security and marking-mode review before `onlineReady=true`.
8. Maintain teacher-only answer keys and keep all unapproved question datasets out of live student exam delivery.

## Question-count target (planning, not generated)
1,500 original, quality-reviewed questions across verified textbook lessons. Balance difficulty and question types by actual textbook scope, not by invented chapter quotas. Preserve meaningful differences between recall, comprehension and application.

## Status and release gate
- Source registration: confirmed.
- Text extraction: unsuitable for reliable chapter authoring.
- Visually verified chapter map: pending.
- Draft questions: 0.
- Approved questions: 0.
- Online-ready questions: 0.
- Manual and online Urdu papers: not ready.

## Coordination
The separate School Suite integration conversation owns authenticated paper delivery, print/PDF, permissions and official results. This conversation owns Urdu textbook mapping, question authoring, answer verification and quality gates. Do not deploy to Vercel.
