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
