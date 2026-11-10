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
