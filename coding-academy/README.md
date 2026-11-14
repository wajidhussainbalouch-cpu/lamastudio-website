# LAMA Coding Academy — MVP 15 (complete progress transfer)

**Status:** GitHub feature-branch implementation, not deployed or quality-assured for release.

## Purpose

Take complete beginners from uncertainty to working, explainable code by repeating the **Dream → Understand → Edit → Run → Debug → Prove → Build** loop. Learners choose a long-term industry direction; they start with transferable web fundamentals and create portfolio evidence instead of only reading material.

## Present functionality
- 22 foundation lessons, including the 12 original HTML/CSS/JavaScript/portfolio labs plus 10 new beginner and advanced activities.
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


## Phase 7 — Learner privacy and account erasure (10 November 2026)

Added privacy.html with an English product-specific explanation and Urdu summary of where learner progress, code, optional Auth data and cloud snapshots reside; how opt-in works; the risks of sharing exported backups; and the distinction between deleting a browser record, a cloud backup, and the full Auth identity. This is a draft for owner/legal review, not a completed public privacy policy.

Account & Data now includes an explicit **Delete learning data on this device** action. It erases only the four known local Coding Academy module keys after confirmation and attempts rollback if browser writes fail. It does not delete unrelated product data, the optional account, or cloud records.

A separate, strongly confirmed **permanent account deletion** form is prepared for email/password accounts. It requires a current password and exact DELETE ACCOUNT phrase; users may choose whether to also erase local learning data. This is **disabled by default** with cloud-config.js accountDeletionEnabled false. The Edge Function staged under backend/supabase/functions/coding-account-delete/index.ts requires a valid signed-in JWT plus successful password reauthentication for the same Auth user before calling a server-only admin delete. The client cannot supply a different user's id.

The staged backend function is NOT deployed; the dedicated Coding Academy database/Cloud Auth system is still not configured or active. The linked cloud progress row is designed to be deleted via the foreign-key cascade when the Auth identity is deleted. Tokens may remain valid until expiry, and retained provider backups may have different retention. These require real testing, provider review and careful disclosures.

Added tests/privacy.test.cjs and a sixth academy regression step in GitHub Actions to check local guest erasure, other-storage preservation, privacy content and staged deletion guards. Cache v7 includes the privacy page. Earlier practice, Studio, Python, progress, and cloud tests remain in the same workflow.

**Release blockers:** real Android/browser QA, dedicated backend approval, RLS checks with two users, live Edge Function deletion tests, branded confirmation email, published privacy/support/retention policy, minors/guardian consent rules and merge/deployment approval. No deployment or production database change was made.


## Phase 8 — Actual catalog integrity and device self-test (11 November 2026)

New learner-facing page: [System Check](./diagnostics.html), linked from the main academy, progress, Python Lab and optional-account pages.

### Real lesson catalog contract

Added tests/integrity.test.cjs: unlike manually populated activity-count fixtures, it evaluates the **actual** authored catalog sources: 12 foundation lessons from index.html, 18 practice tasks from practice.js, 10 real Python missions from python-lessons.js and 12 project milestones from projects-data.js. It confirms the cloud progress identifiers and reviewed-milestone rules match those source catalogs, checks partial completion behavior, verifies a full 52/52 JSON save and restore, and rejects unexpected or malicious fields. This guards against future lesson IDs being changed without updating the cloud progress tracker.

### On-device System Check

Added diagnostics.js + diagnostics.html with eight on-device capability checks: secure browser context, writable localStorage, compatibility of the four stored learner modules, Worker+WebAssembly presence, local file/download support, academy service-worker activation, cache presence for seven important academy pages, and basic browser connectivity indication.

A **separate, optional Test Python now** button starts the same Python worker used in the 10 missions and runs a real simple function/behavior test. The test can trigger a substantial network download, is never started automatically, and includes cancellation and initialization/execution timeouts. The page does not read or upload the learner's saved code for the Python diagnostic.

The downloadable anonymous diagnostic report includes only test identifiers and statuses; it does not include browser storage contents, saved code, learner name, email, IP address or browser user-agent string. This is a convenience for manual testing, not a complete privacy or security guarantee.

Added tests/diagnostics.test.cjs: mocked browser features verify local tests, consent-based worker startup, correct worker protocol, cleanup, download format, and the absence of private storage contents in reports.

Service-worker cache v8 includes diagnostics.html and diagnostics.js. The external Pyodide WebAssembly runtime is **not bundled offline** and is tested only after explicit user action.

### Limits

These tests are automated static/mocked checks, not proof that the runtime works on actual Android phones. Manual on-device testing remains mandatory for mobile data use, CDN access, WebAssembly performance, storage quota, installation, offline reload, Urdu layout and real learner pathways. Optional accounts and self-service Auth deletion remain disabled pending an approved dedicated Coding Academy Supabase backend, live multi-account RLS checks and privacy review. Nothing was deployed or merged to production.

All eight Coding Academy test files run through the dedicated GitHub Actions workflow. At code commit f43034cb07f3da97c12d7eb95d40b8e356733b24, both the Coding Academy checks and AskLama regression workflows completed successfully.


## Phase 9 — PWA cache security, low-data Python execution and bounded output (12 November 2026)

### Offline service worker hardened

- Updated coding-academy/sw.js scoped cache to v9 and restricted caching to the exact, explicitly listed public static academy assets.
- One-time authentication/recovery links with URL query parameters are **never intercepted or stored** by the service worker. Requests with no-store cache policy or response headers, dynamic paths, unknown files, POST requests and external Pyodide CDN resources are not cached.
- Offline navigation to unknown paths may still fall back to the already cached academy homepage. Cached static pages retain first-visit offline behavior.
- Tests/offline.test.cjs validates cache privacy and offline fallback in a mocked service worker, and checks that every required static asset actually exists in the repository. No student identity or sensitive query tokens are copied to CacheStorage intentionally.
- Real PWA installation, offline recovery and browser cache timing on Android remain manual QA requirements; browser HTTP caching is separate from this service-worker policy.

### Large Python runtime requires explicit approval

- Python Lab now asks permission before starting the first Pyodide WebAssembly download on each page visit. It warns when the browser reports slow or data-saving connectivity.
- Learners can cancel the download and keep editing. Their current Python draft is saved locally even if they decline the download.
- The Python Lab now links to the existing non-executable Python syntax practice challenges as a low-data alternative. Both the link and consent message have English/Urdu presentation.
- Subsequent runs in the same page session reuse the worker and do not repeat the download dialog; no permanent consent record is written.
- Runtime initialization and execution limits and a Stop button remain in effect. A real phone/network test must verify the CDN can be reached.

### Bounded stdout/stderr memory usage

- The Python harness replaces unbounded StringIO output capture with a limited streaming text sink: first 4,000 stdout and 1,000 stderr characters only.
- Learners receive a clear truncation message when printing excessive text, rather than storing the whole output in the worker.
- This reduces memory pressure but **does not sandbox arbitrary Python or prevent a malicious program from allocating huge data in other ways**; execution still requires trusted learner code and manual QA.

### Expanded regression tests

- tests/python.test.cjs runs real system Python for all 10 mission reference solutions, 30 behavior checks, and large-output memory-bound assertions.
- tests/offline.test.cjs covers static cache allowlist, query-token bypass, external/dynamic requests and offline fallback.
- tests/python-ui.test.cjs covers cancel/approve runtime, preserving local drafts, bilingual switch, quiz completion and invalidation after edits.
- All ten Coding Academy Node-based regression files run in GitHub Actions, alongside the pre-existing AskLama checks. This is **mocked/browser-API and Python CLI validation**, not a complete live Android/browser acceptance test.

No production deployment, branch merge, new Supabase project, account activation or cloud database modification was carried out in Phase 9.

## Phase 10 — Chromium browser test suite (12 November 2026)

Added a dedicated GitHub Actions workflow `.github/workflows/coding-academy-browser.yml`, with isolated test files under `coding-academy/browser-tests/`. It installs a pinned Playwright 1.65.0 dependency and the matching Chromium browser **only inside GitHub Actions**. There is no added production browser dependency, Vercel deployment or cloud account.

The `browser-tests/smoke.cjs` script starts a short-lived local HTTP server over the checked-out repository and runs real headless Chromium interactions, rather than only Node mocks. Tests include lesson navigation, editing and persistence of local code, passing the actual first foundation lesson, updating the 52-activity progress dashboard, opening Practice and Studio pages, guest-mode account protections, privacy navigation, cancelling the first Pyodide download, draft restoration, viewport overflow at 390px/360px, anonymous System Check export, and real service-worker offline navigation without caching fake Auth recovery query values.

The test workflow runs separately from the existing ten Node-based Coding Academy test files and the AskLama regression suite. Both browser suites use disposable local demo data, not actual student records.

**This is real desktop Chromium with emulated mobile viewport dimensions, not physical Android testing.** Python CDN download and execution, memory behavior on budget Android phones, installation mode, screen-reader checks, Supabase Auth, two-account RLS, confirmation emails and account deletion remain manual or separate staging-backend acceptance requirements. No live production deployment or merge was made during Phase 10.

Instructions for local execution: see `coding-academy/browser-tests/README.md`.


## Phase 11 — Verified portable backup and browser accessibility (12 November 2026)

- Export now validates each of the four real local progress records **before** generating a backup. Previously malformed browser JSON could be read as a missing module, and a later restore might accidentally erase work. Export now refuses damaged, unsupported or oversized data rather than producing a misleading file. It also enforces the 800 KB import limit on the produced backup so exported files are restorable under the app's documented constraints.
- Expanded tests/progress.test.cjs to prove corrupted and oversized local records do not create a new downloadable backup, and corrected data can be exported safely.
- Added a full real-Chromium test of **download → delete four academy module keys → preserve unrelated product storage → preview → cancel → re-import → confirm → verify all saved drafts/reflections and the 3/52 dashboard count**. The same test rejects malformed JSON without altering the restored progress.
- Added pinned axe-core test dependency (test-only), and two browser audits covering eight key Academy pages, checking serious/critical WCAG 2.0/2.1 A and AA findings. The first audit found a wide privacy table inaccessible to keyboard users. The table has a named focusable region and a clear keyboard focus outline.
- The browser accessibility checks are automatic indicators, not a certification of WCAG compliance: manual keyboard-only navigation, screen readers, reduced motion, low-memory Android, contrast in different displays, and real-user feedback are still required.
- No production site deployment, draft PR merge, cloud database change or real-account activation was made in Phase 11.

## Phase 12 — Beginner-first Android update (13 November 2026)

Based on the learner's Android screenshots, the academy now teaches web coding from zero. The current author-written course contains **22 ordered foundation lessons**, arranged as ten Beginner activities, six Intermediate activities, and six Advanced activities. Six lessons introduce browsers, HTML, opening/closing tags, CSS, JavaScript and debugging; four additional hands-on lessons teach labelled forms, if/else conditions, objects and a clickable counter. The original 12 foundation lessons remain available, and saved progress is preserved.

The dashboard and every lesson now include a glossary: computer code, HTML, CSS, JavaScript, Python, SQL, Kotlin/Dart and debugging, with simple English and Urdu explanations. A new mobile-friendly editor gutter numbers every code line and marks suspected mistakes. Tapping the explanation for a line selects that line in the editor. For example, a learner typing the mistaken tag <My name is Wajid> sees why it is a tag attempt rather than paragraph text; the checker suggests <p>My name is Wajid</p>. It also catches some missing tag closures and CSS/JavaScript bracket mistakes. This is a teaching heuristic, not a full compiler, browser validator or security check.

All **62 learning activities** are accounted for: 22 foundation + 18 industry practice + 10 real Python + 12 project milestones. The local backup format and previous localStorage keys remain supported. Cloud accounts are still disabled.

The v0.12 owner-testing Android APK has a new package ID so it can be installed **alongside** the previous v0.11 test APK without erasing the older app's on-device data. These two builds do not automatically share progress; voluntary JSON backup/restore may be used if supported on the device. All new glossary and checker files are packaged offline. The real Python interpreter remains an optional large CDN download.

The GitHub Actions checks include a new beginner content/diagnostics suite, Chromium UI regression for locked levels and line-specific hint correction, and the Android debug APK build. Physical Android usability remains to be tested and verified before any production approval. No live website merge/deployment or new cloud data service was performed.


## Phase 13 — Original coding question bank and mobile practice (13 November 2026)

**Research-informed, independent implementation.** See [LEARNING-APP-RESEARCH.md](./LEARNING-APP-RESEARCH.md) for a sourced comparison of the discontinued Google Grasshopper app, Mimo, Sololearn, Khan Academy and freeCodeCamp. The academy uses the broadly useful interaction patterns (short concept, immediate question, code-piece puzzle, clear explanation, repeat missed knowledge) without copying competitor questions or assets.

### New practice content

- New **150-question original question bank**: 5 subjects (HTML, CSS, JavaScript, Python, SQL) × 3 levels (Beginner, Intermediate, Advanced) × 10 questions each.
- 85 choose-one concept questions, **35 predict-the-output/behavior exercises** and **30 tappable code-building puzzles**. Every authored item includes why the correct answer works; many include a short original code example.
- Learners select a subject or Mixed subjects and complete **10-question micro-rounds** without a timer, paywall, limited lives or mandatory login. A round checks each answer and displays the correct explanation immediately.
- Mixed rounds prioritize unseen questions. A Review missed action reintroduces questions the learner struggled with, followed by other practice as needed. Sessions and per-question attempts are saved **only on the device** under the new `lama-coding-questions-v1` key.
- The question bank is separate from the existing **62 completed hands-on activities** and does not silently change the academy's four-module progress format or claim to be a certification.
- Navigation links from the academy dashboard, within every foundation lesson and from My Journey open the practice. New files are allowlisted in the PWA v11 offline cache and bundled in the test-only Android app.
- The quiz does not execute learner input, issue real SQL queries or run arbitrary Python. Original syntax puzzles are plain text.
- Added `tests/quiz.test.cjs` to validate all 150 authored items, distributions, solution indices, unique IDs, local counters and missed review. Real Chromium tests exercise ten actual questions end-to-end, including the code-piece interface and round results, mobile widths, accessibility and offline availability.

### Android test build

**LAMA Code TEST v13** is a separate APK with package identifier `pk.lamastudio.codingacademy.testing.v13`. It can be installed beside the previous v11/v12 test packages so none of their existing local progress is overwritten or automatically migrated. It contains the original HTML/CSS/JS/Python/SQL question practice and has a permanent TEST BUILD banner. All APK and browser testing is performed from the GitHub feature branch; production remains unmerged.

### Future content work

This release adds real curated questions, not an infinite AI-generated catalog. Expand further only after reviewing learner difficulty and answer ambiguity, ideally with Urdu versions of each question and more authentic sandboxed code-tracing challenges. No claim of equivalent learning outcomes to Grasshopper or another education provider is made.

### Phase 13 practice quality refinement — 13 November 2026

- Original competitor-learning review and differentiation decisions are documented in [LEARNING-APPS-REVIEW.md](./LEARNING-APPS-REVIEW.md), with public-source links for Grasshopper's historical approach, Mimo, Sololearn, Khan Academy and freeCodeCamp.
- **Mixed-subject rounds are balanced**: at each level, two questions each from HTML, CSS, JavaScript, Python and SQL; previously the ID-based ordering could over-represent a single language.
- Tap-to-build puzzle pieces are now shuffled independently from the correct answer indices. Learners do not see a completed code example until they submit their answer.
- Mistake review is **mastery-aware**: the latest answer is tracked as correct/incorrect and a correct retry clears the outstanding mistake flag, preserving total attempt history. Old saved question-stat records are still readable.
- Extended the pure question-bank tests for original puzzle distribution, token permutations, mixed-subject balance and a recovered mistake; extended real Chromium practice testing to verify shuffling and review recovery on a mobile-sized viewport.
- Question practice is an independent offline learning module, not part of the established four-module 62-activity local backup. Future explicit export/restore is a documented planned improvement, not a claimed feature.

## Phase 14 — Safe offline question-score portability (14 November 2026)

**Problem uncovered during Android trials:** Separate test APKs use distinct package IDs and therefore separate WebView local-storage spaces. The 150-question module introduced in v0.13 could not export its own score history, so it was possible to lose that progress when trying a future build.

**Implemented in v0.14:**

- Added **Download Question Scores**, **Import Saved Scores**, **Review Backup**, **Confirm Restore**, **Cancel**, and a separately confirmed **Clear Question Scores** control directly on the Practice Questions page.
- Export format: `lama-coding-questions-backup-v1` (JSON) with metadata, question bank version, per-question attempts and last-correct status, completed round history, language/level selection and study-round counters. The file contains **no lesson code, account password, student record, cloud token or other LAMA project data**.
- Strict 200 KB size limit and schema validation block malformed or oversized imports, invalid score counts, unknown question IDs, mismatched question-bank versions and suspicious fields. Export refuses corrupt local JSON instead of producing a misleading empty backup.
- Import previews **current scores vs backup scores** before writing. Confirmation is required and replaces **only** the `lama-coding-questions-v1` local-storage key. Cancel makes no changes; a failed storage write leaves the previous record intact.
- Updated offline service-worker cache to `lama-coding-academy-v12` so the question backup logic is available without an internet connection. Android v0.14 uses its own package ID `pk.lamastudio.codingacademy.testing.v14`, installable beside v0.11–v0.13.
- Added dedicated Node regression `tests/quiz-backup.test.cjs` for portable round-trip, corrupted files, format/version mismatches, storage failures and non-interference with other modules; extended the real Chromium mobile test to download actual JSON, clear quiz scores, preview/cancel, confirm restore and reject the wrong file.
- Test APK download/restore uses Android's document picker and WebView blob save bridge. **Actual file-save behavior on the owner's physical Android phone still requires hands-on confirmation.**

**Important compatibility limitation:** Old v0.13 test builds did not have question-score export. Therefore v0.14 cannot automatically migrate their question results. Starting with v0.14, the user can export a portable question-score file to import into later builds. Existing core 62-activity progress has its own independent export/restore and is not included in this quiz file.

No production deployment, draft PR merge, Play Store release, Supabase activation or database changes were made.


## Phase 15 — One complete five-area backup and Android v0.15 (14 November 2026)

Question scores were formerly exported separately from the four-course learning backup. The updated Learning Journey page now offers a **Complete Academy Backup** that saves and restores five device-local records in one JSON file:

1. 22 Foundation lessons, including code drafts and quiz choices
2. 18 industry-practice drills
3. 10 executable Python lesson drafts and checked results
4. 12 portfolio project milestones and reflections
5. The separate 150-question practice history, review state and checked attempts

The complete backup has format `lama-coding-academy-complete-v1` and a **1.1 MB file cap**. It validates the same four course schemas used by earlier exports, then uses the separate strict question-bank schema and version validation. Restore requires a visible preview and explicit confirmation. Invalid files, mismatched question-bank versions and oversized files are rejected *before* writing. The restore engine writes only the five known localStorage keys and attempts to roll back all five if any write fails. This does not claim crash-proof storage transactions: export a backup before any restore.

The previous **four-course-only JSON backup** and **question-only JSON backup** remain available and importable through their original screens. An older four-course backup does not modify question scores. Optional Supabase cloud snapshots remain four course modules and remain **disabled**; the complete five-area backup is local and voluntary, not a new cloud-sync feature.

The Account & Data page's **Delete learning data on this device** now erases all five academy learning records (including question scores), with explicit confirmation and rollback on storage errors. It deliberately leaves unrelated LAMA project storage and account/session keys untouched. The privacy explanation and tests were updated to match.

A new real-Chromium test verifies the whole five-record download → local erase → preview/cancel → restore flow, exact recovery of drafts/quiz results and rejection of malformed files. A pure regression test exercises version/size guards and rollback. The Android PWA offline cache is updated to v13 and packages the complete-backup script.

Android build **LAMA Code TEST v0.15** uses a new package identifier `pk.lamastudio.codingacademy.testing.v15` and is debug-signed for owner acceptance testing, independently installable alongside v0.14. Nothing is merged or deployed to the live website.


## Phase 16 — Learn from missed questions (14 November 2026)

The new quiz-guidance.js module recommends authored lessons after missed questions across HTML, CSS, JavaScript, Python and SQL. Each language maps to Beginner, Intermediate and Advanced guidance (15 destinations total). Mistake summaries on Practice Questions rank active wrong answers; a correct retry clears the active review flag but preserves answer history. Feedback after an incorrect answer links to a relevant lesson. The lesson page uses safe #lesson= fragments and does not bypass stage locks. All suggestions run offline without changing stored lesson completion, and the guidance includes simple Urdu explanations. This is rules-based coaching, not an AI tutor or a measure of employment readiness.

The v0.16 Android TEST APK has a distinct package ID to avoid overwriting v0.15 data. Users must export and explicitly restore a Complete Academy Backup to transfer local learning progress. New pure tests verify 15 mappings and recovery after correct retries; Chromium tests verify genuine navigation and lock behavior. Physical Android validation remains outstanding; no production merge or backend activation was made.


## Phase 17 — Learner-first mobile app shell and staged Supabase accounts (14 November 2026)

A physical Android screenshot revealed that the old header wrapped onto multiple lines, hid lessons below the fold, and provided no clear starting point. The refreshed interface uses the existing LAMA Coding Academy SVG icon as its prominent brand mark, a single-row 66px mobile header, an accessible hamburger sidebar with 12 navigation links, and four fixed bottom shortcuts (Home, Lessons, Practice, Journey). The same shell is shared by all nine main pages, with a persistent desktop sidebar from 1024px upward. Navigation stays local and offline; when JavaScript is unavailable, the original page headers remain as fallback.

The dashboard is now an actual learner welcome screen: **Learn coding from zero** leads directly to a six-minute first lesson, followed by a compact Next Step progress card, three plain-language learning instructions, and four clear module choices. The separate lessons view places the actual lesson before the 22-lesson list on phones, and groups the three-level course map inside an expandable panel. Existing progress keys, authored lessons, question bank and backups remain unchanged.

For optional accounts, the browser-only Supabase snapshot is staged as **lama-coding-academy-cloud-v2**, with four course records and the separate 150-question score record, maximum 240 KB and local restore rollback. The RLS-protected database setup is in backend/cloud-progress-setup.sql; the account feature stays **enabled:false**, no secret keys are in the app, and no data goes to the live PPSC project. The separate security and rollout checklist is in backend/SUPABASE-LEARNER-ACCOUNTS.md. Real account creation/cloud sync is not active or verified; the owner must provision an isolated Coding Academy project, review privacy/email confirmation settings and pass two-account RLS tests before activation.

The Android v0.17 QA build uses its own app package ID, so v0.16 work is preserved. To transfer results, explicitly export **My Journey → Complete Academy Backup** in the old test app and import it in v0.17. CI includes first-screen mobile onboarding, drawer and bottom navigation, 62-activity progression, five-store v2 cloud serialization, and security regression checks. Native phone testing and a real Supabase project end-to-end validation remain outstanding.
