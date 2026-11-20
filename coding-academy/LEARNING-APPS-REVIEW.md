# LAMA Coding Academy — Learning Apps Comparative Review

**Review date:** 13 November 2026  
**Scope:** Publicly described app experiences and curricula, not proprietary source code or private user data.  
**Goal:** Make the academy understandable to an adult or child who has never written any computer language, using a low-data Android-first teaching design.

## What makes a coding-learning app approachable?

Five recurring instructional patterns stand out:

1. **An explanation before a puzzle.** Define the term, then immediately use it with a very small exercise.
2. **An active response every few minutes.** Tap a choice, predict output, construct a line, edit real code, or repair a mistake. Passive reading alone is insufficient.
3. **Immediate feedback with a reason.** Tell the learner what they misunderstood and why the correct approach works, without shaming them or ending a session.
4. **Revisit knowledge after errors.** Errors are remembered for a later practice set; successful correction should remove that outstanding review flag.
5. **Apply knowledge in a real project.** A quiz is preparation for making something, not a substitute for coding.

## Product-by-product analysis

| Product | Observed teaching behavior (publicly described) | What is educationally valuable | LAMA's differentiated choice |
|---|---|---|---|
| **Google Grasshopper (historical)** | Taught foundational coding using graphics, simple puzzles, quizzes, goal tracking and an interface combining instructions, editable code and output. Google discontinued it in June 2023. | A very small first success builds confidence; visible results lower the intimidation of typing. | Original tap-to-build code tiles plus real HTML preview and clickable line explanations; **not** a copy of Grasshopper's questions, artwork or text. |
| **Mimo** | Short step-by-step lessons, daily mobile practice, interactive coding, real projects, streaks/achievements and optional AI assistance. | Users alternate explanation, exercise and completed project. | Short ten-question rounds, real local school/business examples and beginner-friendly English/Urdu explanations. Future: optional study streaks, never penalties for missed days. |
| **Sololearn** | Small lessons with embedded code editor, quizzes, community help, certificate pathway and optional AI guidance. Current tiers can limit practice through hearts. | Instant code execution in the lesson is compelling; small practice units keep progress visible. | Keep the original learner's ability to retry freely; **no hearts, lives, wait periods or forced account** for question practice. |
| **Khan Academy — computer programming** | Tutorial → interactive challenge → review → larger project sequences, covering drawing, functions, events and logic. Hints can depend on which automated tests are still failing. | Challenges are connected to an underlying concept and larger outcome. | Provide the reasoning for mistakes; pair quizzes with 22 authored HTML/CSS/JS foundation labs, 18 focused drills and 12 project milestones. |
| **freeCodeCamp** | Practical HTML/CSS learning, project building, browser test-based checks and accessibility-focused examples. | Learners produce and test real work; automated checks make expectations explicit. | Preserve honest limits: pattern checks and heuristics are not full compilers or evidence of work readiness. Use real portfolio/self-review milestones. |

### Sources used

- Grasshopper history and closure: [9to5Google, March 2023](https://9to5google.com/2023/03/13/grasshopper-shut-down/).
- Mimo's [mobile app learning method](https://mimo.org/mimo-coding-app) and [course structure](https://mimo.org/learn-to-code).
- Sololearn's [web development course explanation](https://www.sololearn.com/en/web-development) and [plans and learning limits](https://www.sololearn.com/en/plans).
- Khan Academy's [programming exercises, challenges and projects](https://www.khanacademy.org/computer-programming) and [how its code-check hints work](https://support.khanacademy.org/hc/en-us/articles/37734479937421-Why-isn-t-my-Python-code-working).
- freeCodeCamp's [responsive web design lesson and project curriculum](https://www.freecodecamp.org/learn/responsive-web-design).

Descriptions are based on public documentation available at review time. App designs and pricing may change. These resources justify general teaching patterns; they do not validate LAMA's learning outcomes.

## LAMA implementation — Phase 13

### Already implemented and testable

- **22 foundation labs** in three levels (10 Beginner, 6 Intermediate, 6 Advanced), with introductory definitions, English/Urdu glossary, real HTML preview and line-numbered mistakes.
- **150 original practice questions**, 10 for each of 5 languages at each of 3 levels. The bank contains 85 conceptual choices, 35 output/behavior predictions and 30 tap-to-construct code puzzles.
- **Ten-question micro-sessions**, no timer or hearts, and detailed explanations after the learner commits an answer.
- **Mixed practice**: two questions each from HTML, CSS, JavaScript, Python and SQL at the chosen level. Short rounds favor less-practiced items.
- **Shuffled code tiles**, so correct code cannot be solved just by tapping the initial display order. Complete example code is shown only after submission, not before.
- **Mistake review**: missed questions return first; after a correct retry the outstanding mistake flag clears, while attempt history remains saved locally.
- A separate offline PWA/Android asset pack containing the questions; no backend, user account, Python interpreter or database query is required for the question bank.

### Why this is useful for first-time learners

The first question can be *What is a web browser?*, and the second asks learners to build a short HTML paragraph from three pieces. Progress should mean understanding a series of small ideas, not memorizing 150 answers in one sitting. Each question should connect to a lab that lets the learner see the same idea working.

### Mobile and learner-safety requirements

- Explanations must fit **360–390-pixel** screens with large tap targets and visible focus.
- All question progress is local under **`lama-coding-questions-v1`**, separate from the 62-activity foundation/practice/Python/Studio progress, and is **not yet in the four-module backup/export file**.
- Avoid advertisements, mandatory streaks, accidental purchases, forced login and punitive daily check-ins.
- SQL and Python quiz puzzles are **non-executable simulations**. A real Python runtime exists in a separate optional lab and may need a large download.
- Do not claim that the offline hint checker is a full programming-language parser.
- Exercise wording, code fragments and examples must remain independently authored; never copy another company's proprietary question bank.

## Next product improvements worth testing

| Priority | Feature | Why | Acceptance criterion |
|---|---|---|---|
| 1 | Real-device Android validation of full 10-question rounds | Desktop emulation cannot prove touch/low-memory behavior | Install the separate v0.13 test APK on an entry-level Android phone; finish all question types with no clipped controls |
| 2 | Question progress export and restore | Different test APK packages have separate local data | Explicit user-controlled JSON backup/restore, with size/schema validation and no unrelated product changes |
| 3 | Better local feedback in Urdu | Code terms can be unfamiliar to learners | Check 20 learner-visible explanations with native Urdu readers; code keywords remain English |
| 4 | More authentic code-tracing tasks | Recognizing an answer is easier than writing a program | Learner correctly predicts a multi-step output after reasoning through variables, loops and conditionals |
| 5 | Optional challenge/project recommendation by weak area | Quiz scores should connect to a real coding skill | A missed HTML-tag question offers an HTML practice lesson; never silently change official lesson progress |
| 6 | Optional study continuity without pressure | Consistency can help, but punishment can discourage beginners | Learner can see a study-history calendar and disable notifications, with no lives/hearts system |

**Release rule:** Automated CI validates authored items and browser interactions, but physical Android testing, accessibility checks and reviews of answer correctness still precede public release. No change in this review authorizes a production merge, Supabase activation or store publication.
