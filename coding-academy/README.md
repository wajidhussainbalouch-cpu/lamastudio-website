# LAMA Coding Academy — MVP 1

**Status:** GitHub feature-branch implementation, not deployed or quality-assured for release.

## Purpose

Take complete beginners from uncertainty to working, explainable code by repeating the **Dream → Understand → Edit → Run → Debug → Prove → Build** loop. Learners choose a long-term industry direction; they start with transferable web fundamentals and create portfolio evidence instead of only reading material.

## Present functionality
- 12 original beginner labs from HTML through CSS, JavaScript, accessibility and portfolios.
- One-file HTML/CSS/JS editor and sandboxed iframe preview; no external execution service.
- Small exercise pattern checks **plus** a correct concept question required before lesson completion. These are heuristics, not a full parser, code security scan or proctored assessment.
- 6 career roadmaps (web, mobile, data/AI, automation, cybersecurity, games), honestly labeled as guides beyond the interactive web track.
- 4 capstone project briefs and tips for making a portfolio.
- Dashboard progress, skill-area completion and next lesson.
- On-device-only saves (localStorage), downloadable HTML and JSON progress export, data-reset control.
- Responsive web interface, web manifest, app icon and scoped service-worker cache. After an initial successful online load, core page may be available offline on a supported HTTPS browser.

## Test the functionality before release
1. Open /coding-academy/index.html on the feature-branch preview or serve this directory locally on localhost (service workers require a secure context).
2. Choose a dream and refresh: it should remain selected.
3. Open lesson 1; click Run. Modify h1 to "Hello, Developer!", answer the quiz, click Check, verify progress changes.
4. Try invalid HTML and incorrect quiz selections: neither should give completion.
5. Edit a draft, refresh: code should return. Download and open an HTML exercise.
6. Verify lesson 8 click event, lesson 9 function, desktop and phone layouts, keyboard use.
7. Load once online, then use browser offline mode and reload: the main page should still work after the service worker installs.
8. Verify CSP and sandbox behavior with malicious demo scripts (do not enter secrets). Test across Chrome Android and desktop.
9. Verify no regressions to existing homepage and education cards.
10. Review learning content with a coding educator; verify exercises from live browser testing before public launch.

## Future production milestones
- Auth and cross-device/cloud progress (requires privacy and consent design).
- Guided Urdu/English switch, audio narration and more exercises per unit.
- Real structural checking/AST tests and meaningful auto-feedback, with accessibility checks.
- Git exercises, debugging scenarios, API/networking lessons and more full project workflows.
- Separate interactive mobile, data, security and games courses (currently only roadmaps).
- Learner and instructor dashboards, manual project review and portfolio links.
- Downloadable offline lesson bundles, accessible mobile controls and PNG installation icons.

## Security and privacy
- Code runs in a sandboxed iframe with no allow-same-origin and a restrictive CSP, but no browser code playground should be treated as a safe place to run adversarial programs.
- User code is **not** saved to a backend; storage can be wiped by browser settings. Export your work regularly.
- Do not accept sensitive data into examples, promise industry certificates, or treat regex exercise checks as verification of employment-ready skills.

## Deployment note
Changes deliberately live in a feature branch so existing deployment quota and production app flows are not disturbed. Merge and deploy only after review. Recommended canonical route after deployment: https://www.lamastudio.pk/coding-academy/
