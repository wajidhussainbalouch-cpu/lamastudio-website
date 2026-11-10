# LAMA Coding Academy — MVP 6 (optional cloud account foundation)

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


## Second learning stage — 18 practical challenges

New route: [Industry Practice Labs](./practice.html), linked from the learner dashboard.

Six hands-on **JavaScript** business cases are tested by code execution in a sandboxed iframe. Each includes three independent cases, including boundary and empty-value checks: billing totals, attendance rates, pass thresholds, inventory alerts, case-insensitive student search and readable record labels.

Six **SQL** exercises query built-in example school/office datasets. A deterministic, read-only teaching simulator supports a **small SQL subset**: SELECT chosen columns, one WHERE comparison, ORDER BY, LIMIT, COUNT(*), SUM and AVG. Query output must match the mission's reference result. This is **not a complete SQL engine**; it does not support JOIN, GROUP BY, writes, multiple conditions, or production database operations.

Six **Python** syntax drills guide learners through print, variables, functions, if statements, loops and dictionaries. These are intentionally marked **non-executable**; the app checks specific syntax patterns and shows a teaching output. Students must use a real Python interpreter to verify real behavior and edge cases.

All 18 exercises save drafts and pass status in browser localStorage, provide hints and downloadable source code, and are cached for offline use after a successful online load where supported.

Progress in the 18-lab track is separate from the 12-lesson foundation track. **Total authored introductory activities: 30.**

### Run repeatable checks

From the repository root:

    node coding-academy/tests/practice.test.cjs

GitHub Actions workflow: .github/workflows/coding-academy-checks.yml, scoped to changes under coding-academy/** and manual dispatch. No external packages, credentials, or deploy job are required.

**Current limitations:** The JavaScript runner is intended for short, trusted learning exercises; a sandbox limits origin access, but malicious or infinite-loop code can still affect the device or spoof local results. No proctored exams, code certification, remote grading, teacher review, student accounts, Python runtime, real SQL database, or cross-device synchronization has been implemented. No paid or private course data is stored.

### Manual release checks still needed

1. Open /coding-academy/practice.html on desktop and Android browsers.
2. Verify all 6 JavaScript examples fail before edits and pass using correct solutions; check invalid syntax, too-large source and timeout reporting.
3. Verify the 6 SQL starters produce different results from the target, and correct queries pass; injection-like/multiple statements are rejected.
4. Verify Python "syntax only" explanation is clear and no execution is claimed.
5. Check next/back challenge navigation, track switching, draft saves after refresh, local pass counts, download extensions and keyboard controls.
6. Test a low-memory Android phone and desktop browser for offline cache install/update behavior.
7. Manually inspect accessibility (screen reader, contrast, mobile keyboard resizing) and runtime CSP behavior.
8. Reconcile latest main-branch commits before merging; production remains unchanged until a reviewed merge/deploy.


## Phase 3 — Portfolio Project Studio

Open [Project Studio](./studio.html) from the academy dashboard.

Three carefully scoped, editable portfolio starters, each with four guided milestones (**12 portfolio milestones**):
- **School Information Website** — semantic navigation, a programs section, mobile CSS and contact linking.
- **Tuition Fee Calculator** — reusable multiplication, numeric inputs, live result updates and invalid-value handling.
- **Attendance Summary** — data filtering, derived absent counts, an accessible summary and safe student-list rendering.

Each milestone includes the reason the skill matters, a concrete editing task, a hint, formative code-pattern checks, and a **learner-run preview + learner-confirmed review** gate. Learners can switch between all three projects, save local drafts/reflections, download a standalone HTML project, restore a starter, audit all criteria on the current code and export a transparent self-reported JSON portfolio record.

Core coaching copy and all 12 milestone explanations are available in **English or Urdu** via the language control. Technical tokens/code remain in English.

**Phase totals:** 12 foundation labs + 18 subject practice challenges + 12 coached project milestones = **42 instructional activities**, grouped into 3 portfolio projects, six career roadmaps and the original four simpler project ideas. The 12 project milestones are not standalone lessons.

Run project regression tests:

    node coding-academy/tests/studio.test.cjs

Both practice and project-studio tests are included in the coding-academy GitHub Actions workflow.

### What the checks do *not* prove

Milestone checks look for teaching patterns, not complete program correctness or accessibility. Learners can still write broken code that satisfies a pattern. The final audit confirms that the current source contains required patterns, records the learner's earlier self-review confirmations, and requires a meaningful reflection of at least 80 characters; it is **not an instructor assessment, security review, certificate, or guarantee of employment**. Real device testing and human review remain necessary. Project code executes in a browser sandbox with a restrictive CSP, but unknown code could still slow or disrupt a device. Do not enter private student records, financial accounts, passwords, or production keys.

Data remains on-device in localStorage; back it up with HTML and report exports. No back-end account, automatic remote progress sync, real Python interpreter, real SQL server, or public-facing publication is implemented. Installability/offline operation must still be checked on physical Android devices before release.

### Before merge/deployment

- Confirm that GitHub Actions passed both regression test files.
- Complete manual Chrome Android/desktop tests of the project preview and milestone flow.
- Verify the Urdu coaching, right-to-left layout legibility, browser storage reset behavior and keyboard/screen-reader access.
- Confirm current main-branch changes are incorporated without overriding newer edits. This remains a draft PR and **does not initiate a Vercel deployment**.


## Phase 4 — Real executable Python learning (10 Nov 2026)

Route: [Real Python Lab](./python.html), linked from the main learner navigation and from the older Python syntax warm-up course.

- **10 original executable Python missions** with **30 behavioral test cases** and a concept question for every mission.
- Content: greeting functions, fee totals, pass/fail conditions, attendance rates, low-stock filtering, average marks, string normalization, absence counts, grade bands and a passing-students report.
- This is a **genuine Python interpreter**, powered by [Pyodide](https://pyodide.org/) Python 3/WebAssembly in a **module-type Web Worker**, not a JavaScript syntax mock or regular-expression approximation. Pinned release: v314.0.7 (not a floating latest release).
- Student code is executed by python-harness.py in a fresh Python globals dictionary per run. Standard output, errors and individual behavioral-test outcomes are reported to the page.
- Separate python-runner.mjs fetches the local Python harness, loads Pyodide from a version-pinned CDN, runs code and returns results via structured worker messages.
- Students edit local saved drafts, start the runtime on demand, cancel execution, see output and tracebacks, answer one concept question and download .py source code.
- Completion is granted only after the **current code** passes all 3 authored tests and the correct concept answer is chosen; editing previously passed code clears its lesson completion.
- A 120-second first initialization timeout and 8-second execution timeout terminate and recreate a stuck worker. A full browser reload may be needed on low-memory devices.
- Third-party runtime/wasm assets are **not bundled or guaranteed offline**. Local lesson content and Python worker/harness files are cached, but the actual Python interpreter normally needs a network connection for first launch and potentially later if external cache has been cleared.

### Python regression test

From repo root:

    node coding-academy/tests/python.test.cjs

This Node test runs the same Python harness via system Python 3, checks all 10 reference solutions against 30 test cases, confirms all incomplete starter code fails, checks output/error capture and verifies worker version pinning, timeout controls and page wiring. GitHub Actions now runs foundation-practice, project-studio and executable-Python test files.

### Security / release restrictions

A Web Worker **prevents many blocking computations from freezing the page** and allows cancellation, but it is **not a hostile-code security sandbox**. Arbitrary Python can still use Pyodide browser bridges, consume memory or attempt network access within browser rules. Only learner-authored practice is intended. Never use an account password, API key, real student details, payment information or production credentials inside this lab. This local, non-proctored learning feature must not be exposed as a secure multi-tenant evaluation service.

The pinned runtime is downloaded from a CDN. Its availability, offline behavior, loading performance, browser support, WebAssembly compatibility, and Android memory requirements still require hands-on verification. Browser-specific Pyodide behavior is **not proven** by Python CLI tests. No production merge or deployment has occurred.

**Authored activity count: 52** = 12 foundational guided labs + 18 industry practice challenges (including 6 non-executable Python syntax warm-ups) + 12 project-studio milestones + 10 real Python missions. Six career roadmaps remain separate informational guides.


## Phase 5 — Unified progress and English/Urdu Python guidance (10 November 2026)

- Added [Learning Journey dashboard](./progress.html): one place to view completion from all four independent browser-local modules:
  - 12 foundation lessons (original academy)
  - 18 industry practice challenges (6 JavaScript, 6 SQL subset, 6 non-executable Python syntax)
  - 10 real Python missions (Pyodide when supported)
  - 12 coached milestones across 3 portfolio projects
- Progress charts and next-step links are based on existing module data; no duplicate source of truth, migration, accounts, external storage or cloud sync.
- Added device-only **JSON progress backup and restore**. Backup includes current code drafts, choices, completion metadata and optional portfolio reflections from all four modules.
- Import requires an explicitly chosen local JSON file, correct backup format, a four-module schema, size limit, field/type validation, an on-screen review and user confirmation before replacing stored data. On storage write failure, the app attempts to roll back each previous entry. This is not a cloud backup service.
- Importing code from an untrusted third party is unsafe because code can be executed later when a learner chooses Run; accept only your own trusted backups. The backup may contain personal notes; keep it private and never publish it in forums or repositories.
- New python-i18n.js contains **Urdu lesson explanations and quiz options for all 10 executable Python missions**, plus an English/Urdu interface toggle. Technical code and Pyodide runtime behavior remain unchanged.
- Python language preference is saved in the existing local Python data store and included in portable backups.
- Added tests/progress.test.cjs and wired it to the scoped GitHub Actions checks. It validates all 52 activity counts, translation coverage, backup file format, explicit confirmation, cancel behavior and rejection of malformed restore data.
- Expanded service worker cache v5 to include local progress pages and Urdu strings. External Pyodide WASM/CDN runtime is **not** available offline by promise; first use and some later use require network access.

### Testing and release notes

Run all regression tests:

    node coding-academy/tests/practice.test.cjs
    node coding-academy/tests/studio.test.cjs
    node coding-academy/tests/python.test.cjs
    node coding-academy/tests/progress.test.cjs

Required hands-on checks still include Android WebAssembly compatibility and memory, Pyodide initialization time, Urdu layout on real devices, long code entry, local storage quotas, file picker/import/export round trips, keyboard/screen-reader use and browser update/offline behavior. Tests only cover modeled behavior, not complete security, educational effectiveness or production readiness. This is still a draft GitHub PR and has not been deployed to the live website.


## Phase 6 — Optional Learner Accounts and Manual Cloud Sync

Status: development branch only. The account service is DISABLED BY DEFAULT and no cloud project, user account or database table was changed as part of this implementation.

New route: [Optional learner account](./account.html). Other academy pages link to this option, but remain open to guest learners.

### Built components

- account.html + account.js: email sign-up and login, email confirmation handling, forgot-password links, reset password, session status, sign-out, visibility toggles and offline-friendly setup messages.
- cloud-config.js: disabled-by-default browser configuration. Cloud can be activated only after a dedicated project is approved and supplied with a valid Supabase URL and public publishable key. Never place service-role keys or private credentials in browser source.
- cloud-core.js: validated snapshot format for the 52 existing learning activities across four independent stores; size/shape checks, safe local copy application with rollback attempt, and local counts.
- backend/cloud-progress-setup.sql: OWNER-REVIEWED, NOT APPLIED SQL for a distinct Supabase project. One row per authenticated user, strict SELECT/INSERT/UPDATE/DELETE row-level policies, timestamp handling and a 256-KiB database size limit.
- backend/README.md: dedicated project activation checklist, Auth/email/redirect setup, data API grants, RLS tests across accounts and privacy requirements.
- tests/cloud.test.cjs: local simulation, validation rejection, rollback, RLS policy inspection and assurance that the account UI loads with the cloud disabled.
- Service-worker cache v6 includes local account UI and config, but remote Auth and cloud sync need an internet connection.

### How learners control their data

Creating an account does not automatically upload anything. The learner explicitly opts in for each upload, confirms before changing their private cloud copy, and chooses whether to restore a cloud copy to the current device. Cloud deletion removes only the remote progress row, not local data or the Auth account. Sign-out preserves local lesson progress.

Uploads use a server timestamp to check for another device's more recent changes, and conditional update/insert protects against silent overwrites. No automatic cross-device merging or realtime sync is implemented. If the cloud changed elsewhere, the learner must refresh and review before uploading.

A cloud snapshot can contain personal source code and reflections. Data is NOT end-to-end encrypted by this application, and authorized backend administrators may be able to access it. Do not place real student data, passwords or secret keys in lessons.

### Production blockers

1. A dedicated Coding Academy Supabase project, not the existing PPSC academy backend, must be approved.
2. Its SQL setup must be manually reviewed and applied; RLS isolation must be tested using two different users.
3. Email confirmation, password-recovery templates, account deletion support and privacy policy/guardian protections must be configured.
4. Browser and Android QA must verify authentication, manual upload/restore, concurrent devices, local backup/export and offline learning.
5. GitHub draft PR must be reviewed and merged through the existing deployment pipeline only after approval.

Regression suite: node coding-academy/tests/cloud.test.cjs. GitHub Actions runs all five academy test files. Static and mocked checks do not prove production Supabase availability or real end-to-end security.
