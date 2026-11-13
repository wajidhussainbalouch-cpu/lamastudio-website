# LAMA Coding Academy — How leading learning-to-code apps teach

Research review: 13 November 2026. This analysis concerns public teaching patterns, not proprietary internal source code or unpublished metrics. The implementation in LAMA is original.

## What made Google's Grasshopper memorable?

Google's Grasshopper (Area 120) introduced JavaScript through small visual coding puzzles and short challenges suitable for a phone. Many tasks presented code blocks or short snippets rather than asking a complete beginner to type a whole program. It paired this with immediate feedback and visible progress, reducing the initial keyboard/syntax barrier. It also offered a desktop/web experience. **Important historical note:** Grasshopper was discontinued in June 2023; it is not an active service on which new students can rely.

Sources: https://9to5google.com/2023/03/13/grasshopper-shut-down/ and https://www.appbrain.com/app/grasshopper-learn-to-code/com.area120.grasshopper

## Publicly documented approaches across other learning tools

| Learning system | Observed public methods | Strength | Limits / lesson for LAMA |
| --- | --- | --- | --- |
| Grasshopper (discontinued) | Visual JavaScript puzzles, stepwise interaction, immediate checks | Very low typing barrier | Supplement puzzles with real transferable coding; the product no longer operates |
| Mimo | Very short mobile exercises, interact with a code snippet, instant feedback, project paths and achievements | Low-friction daily practice; explicit explanations | Too much score-gamification can become a distraction; offer clear explanations without punitive pressure |
| Sololearn | A concept, then working code, then immediate checks; short structured tracks and community | Connects quizzes to real code | Separate beginner recognition from later ability to build and debug independently |
| Khan Academy | Interactive talk-throughs, editable code and explicit challenge hints | Learners can see how a code change affects the output | Preserve code editing and live output; do not offer answers without an explanation |
| freeCodeCamp | Self-paced interactive tasks, practical projects, mobile curriculum and downloadable source | Real project depth and portability | Keep an actual project after small practice questions, and allow offline-first progress |

Primary references:
- Mimo, press kit: https://mimo.org/press-kit and current app feature overview: https://mimo.org/mimo-coding-app
- Sololearn method: https://www.sololearn.com/en/how-sololearn-teaches
- Khan Academy teaching process: https://en.khanacademy.org/computing/computer-programming/programming/intro-to-programming/a/learning-programming-on-khan-academy and https://en.khanacademy.org/khan-for-educators/resources/teacher-essentials/teaching-computing/a/programming-curriculum-overview
- freeCodeCamp mobile app repository: https://github.com/freeCodeCamp/mobile and main site: https://www.freecodecamp.org/

These sources support qualitative product-design comparisons, **not** a claim that one product is objectively better, has better learning outcomes, or endorses LAMA.

## Learning design adopted for LAMA (first practical implementation)

1. **A concept in ordinary language:** each question has a meaningful explanation; the original 22 foundation lessons continue teaching HTML/CSS/JavaScript with examples and Urdu terms.
2. **A tiny action with immediate feedback:** choose the correct answer, predict behavior, or **tap small pieces to assemble a real-looking code line**. This is original LAMA content and is not a copy of Grasshopper's course.
3. **Practice without punishment:** 10 questions per round, no timers, no limited lives, no compulsory account, no payment and no repeated prompts to buy anything.
4. **Optional choice of domain:** HTML, CSS, JavaScript, Python, SQL or Mixed review. Each domain has 10 original questions at Beginner, Intermediate and Advanced levels. There are **150 distinct questions** (5 subjects × 3 levels × 10).
5. **Mix identification, tracing and construction:** 85 choose-one questions, 35 predict-the-result questions and 30 tap-to-build code puzzles.
6. **Don't just say wrong:** show the correct answer and why it works, using a short example when useful. Correct solutions do not run external or untrusted code.
7. **Come back to challenging ideas:** locally saved misses can be reviewed; Mixed practice selects unseen questions preferentially and rotates through the available pool.
8. **Separate skill practice from certification:** question scores do not alter the previously validated 62 hands-on core activity counts. A multiple-choice score cannot prove someone can build an app.
9. **Connect to real programming:** links direct learners back to 22 guided foundation lessons, 18 coding labs, 10 real Python missions (optional online runtime) and 12 portfolio milestones. These tools offer more authentic application than quiz scores alone.
10. **Respect phone learners and privacy:** offline bundled assets, large touch-friendly answer buttons, clear focus behavior, no real SQL query execution, no real Python interpreter behind quiz snippets, local-only anonymized practice counters, optional backup under existing academy policies.

## Additional improvements recommended for future releases (not yet claimed as complete)

- More original questions per level and more than 150 total, based on *reviewed* learner mistakes rather than templated repetition.
- Accessible bilingual translations of each question and explanation, including Urdu and right-to-left support, beyond the current bilingual foundational glossary.
- Progress-sensitive recommendations: e.g. low performance in CSS selectors points to the relevant CSS lesson.
- Mixed-format interactive output prediction that safely executes constrained learner-generated JS in a hardened sandbox (not present in this quiz), with line-specific explanations; do not run untrusted code in the Android WebView host.
- Expert review, usability testing with actual beginners, quality audits for ambiguity, and screen-reader/talkback testing on physical phones.
- Cross-device progress sync only after dedicated Supabase project/RLS/auth and consent validation. Existing cloud feature remains disabled.

## Important boundaries

All questions in quiz-data.js are original, locally packaged educational examples. We do not redistribute Grasshopper software, trademarks, source code, screenshots or proprietary exercise text. The experience takes inspiration only from broadly established teaching techniques. No published evidence establishes that the new quiz module matches or exceeds the learning outcomes of any competitor.
