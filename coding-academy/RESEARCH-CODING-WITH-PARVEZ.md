# Research Notes: Coding With Parvez and beginner HTML teaching

**Reviewed:** November 18, 2026  
**Requested evidence:** User-provided Facebook screenshot named "Coding with Parvez" showing the post "HTML All Inputs" and 22 HTML input controls.

## Directly verified from the screenshot

The user supplied a screenshot of a Facebook post titled **"HTML All Inputs"** from a page visibly named **"Coding with Parvez"**. The screenshot shows 22 examples of HTML `<input type="...">`: text, password, email, number, tel, url, search, date, time, datetime-local, month, week, color, range, checkbox, radio, file, hidden, button, submit, reset, and image.

The screenshot does **not** contain a public page handle, profile ID, post ID or URL. Do not guess or claim a verified direct Facebook page URL.

## Other indexed content located on the public web

A third-party indexed document, **"HTML 30 Days Series: Mastering HTML with Parvez — Day 1 to Day 20"**, attributed within its preview to "Coding With Parvez", describes these instructional themes:

- HTML basics, page structure, headings, paragraphs and text-formatting tags
- Hyperlinks and images, including accessible alternative text
- Lists, tables, forms, common input types and buttons
- Semantic document structure, comments, multimedia, iframe embedding and metadata

**Source:** https://www.studocu.com/ph/document/access-computer-college/information-technology/html-30-days-series-mastering-html-with-parvez-day-1-to-day-20/158127014

Another public aggregation contains posts attributed to Coding with Parvez and discusses HTML lists and web-development practice:

**Source:** https://www.findglocal.com/XX/Unknown/884421891424106/freelance-skill-academy

**Confidence limitation:** These are third-party aggregations, **not authenticated access to the Facebook page**. They may be incomplete, mislabeled, or stale, and do not establish a definitive inventory of the page's posts, public ownership, or current active account. Treat them only as topic discovery.

## Technical content checked against primary standards

The resulting 22 interactive controls and 30 programming-symbol definitions were **written originally for LAMA Coding Academy**, not copied from the Facebook image or series. They were checked against:

- MDN HTML input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input
- WHATWG HTML input standard: https://html.spec.whatwg.org/multipage/input.html
- MDN week control limitations: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week
- MDN hidden controls are not secret: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/hidden

Important teaching cautions:

1. `type="hidden"` is only hidden from the normal display. It is inspectable and **never a security boundary**.
2. `type="password"` obscures typing visually but is **not encryption or safe storage by itself**.
3. `type="file"` lets a learner pick a device file; this Academy reference lab never reads, stores or uploads it.
4. `type="week"` has inconsistent browser support and may show a text fallback.
5. `type="datetime-local"` does not include a time zone.
6. `type="number"` is for quantities, **not** telephone numbers. `type="tel"` preserves number-like identifiers.
7. Symbol meaning varies by language: `===`, `!==`, `++`, `--`, `&&`, `||` are typical JavaScript operators, **not** Python equivalents.
8. `<` and `>` are HTML tag delimiters but can also be numerical comparison operators.
9. The interactive form demos prevent submission; user inputs are not persisted in localStorage or cloud databases.

## Implemented in the draft mobile academy

- `reference.html`, `reference-data.js`, and `reference-app.js`
- Searchable input cards with real native HTML controls and their escaped code examples
- 30 searchable, level-filtered symbols with tap-to-expand definitions, usage contexts and examples
- Six short original review questions with feedback; repeated practice without accounts, timers, advertising or data recording
- Direct link from the redesigned Academy home and sidebar
- PWA static allowlist and Android asset pack updates
- Node contracts and real Chromium mobile/offline tests

**These reference exercises do not increase the official existing 62-activity count or alter the validated complete-backup format.**

## Subsequent topics worth authoring independently

Use the above verified topic themes to prioritize **HTML Text Formatting**, **Lists and Tables**, **Forms and Validation**, **Semantic HTML & Accessibility**, **Images and Media**, **CSS Display & Flexbox**, **JavaScript Expressions and Loops**. Each future module should include a short explanation, a safe editable example, a concept question, and a clear feedback message. Do not copy any third-party branded infographics, images, question banks, wording, or course structure.
