# LAMA Coding Academy — Release Readiness Verification

Scope: draft PR #85, optional learner accounts, Python Lab, Project Studio and guest progress.
Status: engineering checklist; manual verification required. Do not enable cloud accounts or publish a launch claim on automated tests alone.

## A. Basic guest experience (Android Chrome + desktop Chrome/Firefox)

- [ ] Open Coding Academy, Foundation Lessons, Industry Labs, Python Lab, Project Studio, My Learning Journey, Optional Account and Privacy page with a clean browser profile.
- [ ] Verify mobile 360-pixel width and a tablet viewport: no inaccessible buttons or horizontal editor clipping.
- [ ] Complete one foundation lesson, one JavaScript practice task, one Python behavior test and a Project Studio milestone.
- [ ] Refresh each page and confirm drafts and activity progress persist locally.
- [ ] Turn on airplane mode after a successful first load and verify cached static pages and local progress still open. **Do not promise Python WebAssembly offline availability.**
- [ ] Open English/Urdu modes and test right-to-left text without reversing left-to-right source code.
- [ ] Verify keyboard navigation, focus indicators, labels, color contrast, screen-reader reading order and low-memory Android behavior.

## B. Local data lifecycle (no Supabase required)

- [ ] Export the complete 52-activity JSON progress backup, then inspect its private drafts and optional reflections.
- [ ] Import the file to a separate test browser profile; verify counts, code drafts and Urdu preferences are restored.
- [ ] Reject malformed, oversized, unknown-module or suspicious backup files.
- [ ] Cancel a restore and verify nothing changes.
- [ ] Delete local progress with the confirmation; verify only the four Coding Academy storage keys disappear.
- [ ] Confirm unrelated browser storage, other LAMA product data, sign-in tokens and exported backup files are not erased by the local action.

## C. Dedicated cloud backend (blocked until approved)

- [ ] Provision a distinct Coding Academy Supabase project. Do NOT use the connected LAMA PPSC Academy backend.
- [ ] Review and apply the Coding Academy table SQL to that project only; verify grants and RLS policy names/conditions.
- [ ] Test an unauthenticated client cannot read/write progress records.
- [ ] Sign up two test learners A and B and confirm email delivery and sender branding.
- [ ] Verify A can only read/update/delete A's own row; A cannot select or modify B's row, even with guessed B user id, and vice versa.
- [ ] Test sign-in, wrong password, reset-password email, update password and sign-out.
- [ ] Verify no lesson progress uploads on account creation, login, sign-out, refresh or background tab activity.
- [ ] Tick upload consent, confirm, and check that exactly one private cloud snapshot is written for the signed-in user.
- [ ] Sign in on a second device and explicitly restore; verify progress and code drafts. Test cancellation preserves local state.
- [ ] Upload a newer snapshot from device B, then try to upload an older snapshot from device A. Confirm conflict protection stops the older upload.
- [ ] Delete the cloud backup only and confirm Auth still works and browser-local lesson progress persists.

## D. Permanent account deletion — protected Edge Function (blocked until approved)

- [ ] Deploy the staged deletion function only to the dedicated Coding Academy Supabase project, with platform JWT verification enabled, approved CORS origins and server-only secret key.
- [ ] Verify deletion controls remain hidden unless cloud accounts AND the separate accountDeletionEnabled flag are enabled.
- [ ] Verify wrong password, missing/expired JWT, invalid confirmation phrase, oversized request and unapproved browser Origin are rejected.
- [ ] Verify a user cannot specify a different target user ID (server must delete the verified JWT owner only).
- [ ] Verify the function requires password reauthentication for the same account, and does not log credentials.
- [ ] Test actual deletion with a dedicated disposable learner after two-step confirmation. Check Auth user is removed and that its progress row cascades away; other test learners remain unaffected.
- [ ] Verify sign-in after deletion fails and review whether previously issued JWTs remain usable until token expiry.
- [ ] Test optional local-data deletion after successful account erasure, and local-data preservation when unchecked.
- [ ] Confirm deletion limitations for passwordless/OAuth identities, provider retained backups, and required support process.

## E. Before approving launch

- [ ] Finish English/Urdu privacy policy review, contact/support route, data retention, children's registration/guardian-consent rules and account deletion response process.
- [ ] Bundle/review pinned dependencies or approve third-party CDN runtime risks and licensing.
- [ ] Verify GitHub Actions passes all academy test steps at the final review commit.
- [ ] Conduct real-device Pyodide first-use, timeout and worker-cancellation testing.
- [ ] Check Cloudflare DNS and existing deployment/rollback path; do not create an unnecessary Vercel deployment.
- [ ] Merge the draft PR only after independent review and explicit launch authorization.

Automated test suite: practice.test.cjs, studio.test.cjs, python.test.cjs, progress.test.cjs, cloud.test.cjs and privacy.test.cjs. Passing this list's automated tests does NOT imply the blocked live account/backend tests have been carried out.

## F. Phase 8 device diagnosis (do on real Android and desktop)

- [ ] Open coding-academy/diagnostics.html from the feature preview or an approved test deployment, not the still-unmodified live production site.
- [ ] Run eight local capability checks on Android Chrome and desktop Chrome/Firefox. Record any warning and whether cached pages work in airplane mode.
- [ ] Verify the page does not prompt for email, read private lesson content for the report, or start a Python download automatically.
- [ ] After explaining mobile-data use, explicitly press Test Python now; verify the real runtime loads, prints 5, and passes its test. Repeat on a lower-memory Android device.
- [ ] Test Stop during a long initial download or slow program. Verify the worker is terminated without freezing the app.
- [ ] Download an anonymous JSON diagnostic and confirm it has only check identifiers, statuses, and Python pass/fail status—no saved student code or identifiers.
- [ ] Verify every renamed or new lesson is reflected in tests/integrity.test.cjs and the 52-activity aggregation.
- [ ] Review the results alongside real lesson/backup flows. The page is a readiness aid, not security certification.


## G. Phase 9 — Low-data Python and secure offline cache

- [ ] On a real Android phone, turn on Data Saver or use slow cellular data; open Python Lab. Confirm Run Python asks before starting the large Pyodide download.
- [ ] Cancel first-use permission. Verify no Python worker/runtime download begins and the learner's edited draft remains saved after refresh.
- [ ] Approve first-use permission, verify real Python loads, then run a second mission without another permission dialog during the same page session.
- [ ] Open the Urdu version: verify first-download consent warning and the no-interpreter low-data practice link are understandable and all code stays left-to-right.
- [ ] After obtaining approval and network, test large Python print statements (e.g. >200 KB output) and verify the output is truncated without exhausting all available browser memory. Do not run deliberately dangerous, secret-reading or untrusted code.
- [ ] Install/refresh the PWA and check static pages work offline after an initial online load. Verify the service worker is v9 and not interfering with other LAMA Studio PWAs.
- [ ] With **fake non-sensitive** query values only, inspect CacheStorage after navigating to account.html?code=TEST-NOT-REAL. Confirm this query URL is not cached. Never put real recovery tokens in public bug reports.
- [ ] Verify no-store responses and dynamic private URLs are not cached by the academy service worker; external Pyodide resources remain outside its scope.
- [ ] Confirm all ten academy Node regression files and AskLama tests pass on the final review commit.
- [ ] Repeat actual lesson, project milestone, backup/export, restore, privacy and account-deletion readiness tests. No cloud service should be enabled before the dedicated database/RLS/Auth QA described earlier.

## H. Phase 10 — Real Chromium CI smoke tests

- [ ] Confirm the LAMA Coding Academy Chromium smoke GitHub Actions workflow completes successfully on the FINAL feature branch commit. This is separate from the Node.js regression and AskLama workflows.
- [ ] Review real-browser results for the first lesson's complete edit → save → preview → quiz → pass → progress sequence.
- [ ] Review guest account, privacy, low-data Python cancellation, diagnostic export, service-worker installation, offline pages and fake Auth token non-caching.
- [ ] Check mobile-emulated desktop Chromium at both 390px and 360px. Repeat on physical Android phones; emulator viewport success is not a hardware compatibility guarantee.
- [ ] Perform explicit first Pyodide WebAssembly download/mission completion on a real supported phone using an appropriate connection, respecting learner data bundles.
- [ ] Verify real storage/backup roundtrips, screen-reader labels, keyboard navigation, color contrast and PWA install/uninstall on physical devices.
- [ ] Keep dedicated cloud backend, Supabase security checks, password email delivery and Auth account deletion disabled until their separate project and privacy review are complete.
- [ ] Do not merge/deploy to www.lamastudio.pk without final approval and existing production pipeline review.

The browser test instructions are in coding-academy/browser-tests/README.md; its Playwright dependency is test-only and not included on published academy pages.


## I. Phase 11 — Backup round-trip and keyboard accessibility

- [ ] Confirm the browser smoke suite passes the full four-module **backup → local deletion → preview/cancel → re-import → restore** test; validate real draft text and reflection preservation.
- [ ] Try exporting from a browser with intentionally malformed test-only learning JSON. The export must refuse to create a misleading empty backup, display an explanation, and leave the original data untouched. Do not corrupt actual learner data.
- [ ] Verify a valid exported file remains below the 800 KB import limit; malformed and oversized backups must be blocked.
- [ ] Review the WCAG 2.0/2.1 A/AA Chromium audit results for eight core pages. Serious/critical findings must be resolved, and other findings reviewed. Automated passing does NOT prove accessibility compliance.
- [ ] Navigate the horizontally scrolling privacy table using only a keyboard and verify a visible focus indicator at phone width.
- [ ] Repeat with real Android screen-reader support, a physical keyboard where available, landscape orientation and zoomed text; document any accessibility blockers.
- [ ] Confirm all GitHub Actions workflows pass on the final reviewed commit before approving any merge.


## J. Phase 12 Android beginner acceptance

- [ ] Install LAMA Code TEST v12 alongside the earlier v0.11 test app. The older app and its saved progress must remain unchanged.
- [ ] On the first screen, read the English/Urdu glossary for HTML, CSS, JavaScript, Python and SQL.
- [ ] Open Level 1. Verify that Level 2 and Level 3 lessons are locked until the earlier activities are completed.
- [ ] Type <My name is Wajid> on a line. The line number should be highlighted and its warning should explain that it is an invalid tag for displaying ordinary text.
- [ ] Tap the warning to select that line, fix it using <p>My name is Wajid</p>, and verify the hint disappears and the Live Preview displays the words.
- [ ] Complete the first concept quiz and confirm the next lesson unlocks. Test the other 21 lessons in order, including the advanced mini counter.
- [ ] Check the three level groupings: 10 Beginner, 6 Intermediate, 6 Advanced; confirm the complete progress dashboard contains 62 activities.
- [ ] Test readable Urdu, line numbers and error hints at a narrow Android phone width, and ensure the line gutter scrolls with the editor.
- [ ] In airplane mode, verify offline lessons, definitions and line hints still work. Real Python execution may require a first-use internet download.
- [ ] Do not enter sensitive learner/student details in trial code or enable optional cloud accounts without a separate security review.


## K. Phase 13 — New original question bank and Android round QA

- [ ] Install **LAMA Code TEST v13** alongside v11/v12; verify older app data is not automatically overwritten. This is a distinct test app, not a production update.
- [ ] Open **Practice Questions (150)** from the academy dashboard or any foundation lesson, then choose HTML → Beginner.
- [ ] Answer 10 questions in sequence. Verify different modes include multiple choice, output/behavior prediction and tap-to-build code pieces; code pieces should be removable and their order should matter.
- [ ] Check that a wrong answer shows both the correct answer and a helpful explanation. A correct answer should receive positive feedback; both should let learners continue with no life limits or punishment.
- [ ] Finish a full round, verify final score, close/reopen the app and confirm all attempts and missed counts persist.
- [ ] Tap **Review my mistakes**. Previously missed questions should be prioritized; switching to Mixed subjects should rotate through unseen questions across all five languages.
- [ ] Verify 150 original question IDs, exactly 10 per language/level, and 30 code-building plus 35 output-prediction tasks in the Node catalog regression.
- [ ] Turn on Airplane mode after initial installation, open Question Practice and complete a full round without an internet connection. Neither a real SQL server nor Python interpreter should start.
- [ ] Check phone widths 360px and 390px, text wrapping, touch target sizes, screen-reader labels, keyboard navigation and contrast in both light/bright environments and dark surroundings.
- [ ] Confirm question practice does **not** alter existing 62-activity foundation/practice/Python/studio progress, and no cloud account becomes enabled.
- [ ] Review competitor-analysis document and confirm every item is independent original educational content, not copies of third-party exercises.
