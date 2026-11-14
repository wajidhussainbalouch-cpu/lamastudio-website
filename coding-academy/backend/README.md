# LAMA Coding Academy — Optional Cloud Account Setup

**Status:** Account service disabled by default, and no database changes applied.

## Dedicated backend

The connected Supabase project belongs to LAMA PPSC Academy, a different product. Do not reuse it or its credentials without separate review. Create a dedicated Coding Academy project.

## Activation checklist

1. Create/approve a separate Coding Academy Supabase project, checking region, quotas and data retention.
2. Review the adjacent cloud-progress-setup.sql file. Apply it **only after approval** to the dedicated project, not PPSC. It creates one private JSON row per learner with strict auth.uid() RLS ownership, size limits and server-managed timestamps.
3. Verify RLS with two authenticated test accounts and anonymous requests. Neither account must read, create, change or delete the other learner's row.
4. Configure and brand email/password Auth, confirmation and recovery templates. Allowlist the production redirect https://www.lamastudio.pk/coding-academy/account.html plus development origins.
5. Set enabled:true, a valid HTTPS Supabase project URL and the **public** sb_publishable_ key in coding-academy/cloud-config.js. Never put service-role keys, sb_secret_ keys, SMTP passwords, database passwords or private tokens in public JavaScript.
6. Confirm Data API access to the public table and grants for authenticated users (while anon has no access).
7. Test sign-up, confirmation, login, password recovery, manual upload/restore/delete, sign-out, cross-device behavior, network errors and offline practice.
8. Publish privacy and account deletion policies, particularly for underage learners and guardians, before inviting sign-ups.
9. Merge and deploy only after browser/Android QA and approval. No production deployment was made in this stage.

## Behavior and data handling

Cloud accounts are optional; every learning page and manual local backup works without an account. Pinned Supabase JS 2.119.0 downloads only when a valid account service is enabled, requiring internet.

Uploads require a signed-in user, an opt-in checkbox and confirmation. Restores validate the latest remote four-module backup and ask before overwriting all local lesson states. There is **no automatic sync, conflict merging, realtime collaboration or server-side grading**.

The private remote record can contain source code drafts, quiz answers and portfolio reflections. The data is not end-to-end encrypted by this app, and authorized project administrators may be able to access it. Never enter passwords, real student records or production credentials in exercises. Sign-out does not erase local progress. Deleting the cloud progress row does not delete the learner's Auth account; an account deletion request process is still required.

The snapshot size is capped at 200 KB in the client and 256 KiB in PostgreSQL. Browser storage can be cleared or become unavailable. Code from untrusted backups may be dangerous when the learner later chooses Run; use only trusted personal backups.

## Test suite

    node coding-academy/tests/cloud.test.cjs
    node coding-academy/tests/practice.test.cjs
    node coding-academy/tests/studio.test.cjs
    node coding-academy/tests/python.test.cjs
    node coding-academy/tests/progress.test.cjs

Automated tests validate local snapshot handling and the SQL RLS rules structurally. They **do not** demonstrate real email delivery or cross-account isolation in a live database. That verification remains mandatory before enabling cloud accounts.


## Phase 7 — Data erasure and staged account deletion

New privacy page: coding-academy/privacy.html. It distinguishes device-only progress, signed-in cloud progress, and the separate Supabase Auth identity; an Urdu summary is provided. This is a DRAFT product notice, not a final lawyer-reviewed privacy policy.

The learner account page now offers device-only deletion (explicit confirmation, four named Coding Academy storage keys only) and a separate permanent Auth-account deletion form. Device deletion does not delete Auth sessions or cloud progress. Auth-account deletion is gated by a second feature flag in cloud-config.js: accountDeletionEnabled remains false until the protected Edge Function is deployed and tested.

The server function source is staged at backend/supabase/functions/coding-account-delete/index.ts. It has NOT been deployed. Before enabling:

1. Use a SEPARATE Coding Academy Supabase project. Do NOT deploy to the existing LAMA PPSC Academy backend.
2. Review the Edge Function source and platform documentation. Use secure server-only SUPABASE_SECRET_KEYS (and corresponding publishable key). Never put these in browser config.
3. Deploy only after review using your dedicated project's normal Supabase function workflow. Keep verify_jwt enabled: this function is called using a real signed-in user's access JWT. The handler calls Auth getUser(token) to verify identity and also rechecks that same user's current password. It never accepts a client-supplied target user id.
4. Verify allowed browser Origins, CORS, password handling, invalid sessions, wrong passwords, cross-account requests, successful deletion, database FK cascade, subsequent sign-in failure and expected data retention in provider backups.
5. The account deletion route is designed for EMAIL/PASSWORD identities. It is not a full solution for OAuth/passwordless accounts or parental-consent flows. Provide a supported manual account deletion path before launch if those sign-in methods are allowed.
6. Set accountDeletionEnabled to true only after successful multi-account security testing, published product-specific privacy notice and owner approval.
7. Deleting an Auth user may not immediately invalidate every already-issued JWT. Verify session behavior and configure a short appropriate token lifetime/other revocation controls before launch. Supabase backup-retention and legal preservation can also limit immediate erasure of historical copies.
8. Finalize legal owner/contact, support route, retention periods, minimum registration age, parental permission and service data-sharing details. Do not invite learners until these are reviewed.

Test account deletion guards locally using node coding-academy/tests/privacy.test.cjs. This is a mocked/structural test; the server function must separately be tested using a staging Supabase project and test identities.
