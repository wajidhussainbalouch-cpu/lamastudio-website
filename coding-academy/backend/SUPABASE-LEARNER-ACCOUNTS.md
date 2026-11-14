# LAMA Coding Academy — Secure Supabase Account Setup (Staged)

**Status: code and database setup prepared; live learner accounts and cloud syncing are NOT activated.**

This file explains how to build the account experience requested for Coding Academy without risking existing LAMA PPSC, School Suite, or other student records. The only currently connected Supabase project is **LAMA PPSC Academy**; it already has RLS-protected `ppsc_*` candidate, job, subscription and assessment tables. **Do not reuse those PPSC tables or keys for Coding Academy**.

## Intended learner flow

1. Open LAMA Coding Academy on Android. The interface starts in **guest / learn without account** mode.
2. Optional: Open **Account & Cloud Backup** and create an account with email and password. Hosted Supabase Auth may require email confirmation. No password is stored in our application database.
3. All lessons and question results continue saving **on-device**, even offline.
4. For cloud backup, a verified signed-in learner must explicitly tick the upload consent and press **Upload this device**, then confirm overwriting a previous cloud copy. Nothing uploads in the background.
5. The private cloud row holds one JSON snapshot with the four guided learning modules (62 activities total) and the separate 150-question practice state. The prepared cloud snapshot has format `lama-coding-academy-cloud-v2`, validation, a conservative 240 KB client cap, and rollback-safe local restoration.
6. A learner can preview the cloud copy before restoring or delete only their cloud progress. Account deletion should remain disabled until the protected password-verifying edge function has been deployed and tested.

## Database setup

Use a **dedicated Supabase project** for Coding Academy unless a future, security-reviewed LAMA-wide identity decision explicitly chooses another architecture. One Supabase organization can manage multiple isolated projects, but separate projects do not automatically share user accounts. Unified LAMA identity across products would need a deliberate SSO / authorization design, not reused school logins.

- Review `backend/cloud-progress-setup.sql` before any execution. The script creates `public.lama_coding_progress`, a one-row-per-user table referencing `auth.users` with `on delete cascade`, enabling RLS and strictly owning SELECT, INSERT, UPDATE, and DELETE policies.
- Its Data API grants are limited to `authenticated`; `public` and `anon` are explicitly revoked.
- The ownership policy checks `(select auth.uid()) = user_id` both on reads and on writes, including `WITH CHECK` for UPDATE and INSERT.
- The table has a 256 KiB server JSON size check, and the browser uses a stricter 240 KB limit.
- The full account deletion feature must be tested with the separate `coding-account-delete` Edge Function before being enabled.
- Never put a Supabase `service_role`, `sb_secret_*`, database password, or private PPSC token in the browser or Android app.

## Before enabling

- [ ] Provision and identify a dedicated Coding Academy project with known expected billing/quotas.
- [ ] Verify email confirmation redirects (Android virtual origin cannot be assumed to have a public callback URL; use the future production HTTPS origin after review), password recovery, and custom SMTP deliverability.
- [ ] Apply `backend/cloud-progress-setup.sql` to that **dedicated** project, then inspect actual RLS policies and Data API grants.
- [ ] Create two separate TEST accounts; verify that User A cannot read, update, delete, or impersonate User B's row with the publishable key. Test in both directions using authenticated requests.
- [ ] Validate user input, JSON limits, offline work and reconnect scenarios. Never replace a newer cloud snapshot without warning.
- [ ] Verify that both the 62-activity course state and 150-question practice results upload and restore correctly; corrupt and oversized JSON must fail safely.
- [ ] Test sign-out, password recovery, email verification, local erase vs. cloud erase, and protected full account deletion.
- [ ] Publish a reviewed privacy notice suitable for the jurisdictions and ages served, with special safeguards for child learners and parent consent where applicable.
- [ ] Only then set `coding-academy/cloud-config.js` to `enabled:true`, using the dedicated project HTTPS URL and **publishable** key, after an explicit deployment review. Do not silently turn on sync or background upload.

## Current limitations

The browser account UI, v2 cloud snapshot validation, staged SQL and local tests do not prove a working cloud deployment. No dedicated project has been provisioned here and no database migrations were applied to the live PPSC project. Any v1 cloud snapshot would need explicit migration to v2 if a v1 deployment ever existed; in the current draft the account feature was disabled from the start. User accounts do **not** automatically span all LAMA products.

The Android test APKs have distinct app IDs and therefore distinct device-local storage. Use the **Complete Academy Backup** on My Journey to carry data between QA versions until live account sync passes the above security checks.

**References:** Supabase [password-based Auth](https://supabase.com/docs/guides/auth/passwords), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), and [Securing the Data API](https://supabase.com/docs/guides/api/securing-your-api).
