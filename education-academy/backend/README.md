# Academy secure backend — implementation contract

**Status: schema and API design only. NO backend deployed, NO signup or payment accepted.**

The file `schema.sql` is an **unapplied PostgreSQL draft**. Do not execute against School Suite databases or reuse School Suite administrator accounts. A backend/auth provider and its identity mapping must be chosen before implementation. The schema contains no passwords, no credentials, and no public row-level security policies.

## Identity
Use a managed identity provider supporting verified email, secure password hashing, login rate limits, email reset, refresh token rotation and logout. The authenticated provider UID must map exactly to `candidates.id`. Do not trust a UID, role, price or subscription status supplied by the browser. No anonymous signups are active.

## Suggested versioned API contract
All endpoints below are **planned**, not live. Serve over HTTPS. Authenticate on server and validate CSRF/session policy where applicable.

| Method | Endpoint | Required access | Behavior |
|---|---|---|---|
| GET | /api/academy/v1/me | verified candidate | Return safe profile and entitlement summary |
| PATCH | /api/academy/v1/me | verified candidate | Update display name/occupation only |
| GET | /api/academy/v1/tracks | public | Published job catalog and verified syllabus sources |
| GET | /api/academy/v1/papers | verified candidate | Published metadata, filtered by job track |
| POST | /api/academy/v1/attempts | verified candidate with entitlement, or free-preview | Create server-timed attempt |
| PATCH | /api/academy/v1/attempts/:id/answers | owner of attempt | Validate question IDs and answers; save until deadline |
| POST | /api/academy/v1/attempts/:id/submit | owner of attempt | Idempotently score on server; return result and explanations |
| GET | /api/academy/v1/attempts | verified owner | Paginated own history only |
| POST | /api/academy/v1/payments | verified candidate | Create pending payment request; amount set on server |
| POST | /api/academy/v1/payments/:id/evidence | verified owner | Short-lived private upload authorization |
| GET | /api/academy/v1/admin/payments | admin role | Pending queue, audit metadata |
| POST | /api/academy/v1/admin/payments/:id/review | admin role | Reconcile and approve/reject atomically |
| GET | /api/academy/v1/admin/summary | admin role | Aggregated membership/revenue statistics |

## Security invariants
- Do not expose premium correct answers or unpublished questions in publicly downloadable `papers.js`, public caches, HTML or client API metadata.
- The current `papers.js` contains **free-demo answer keys**; acceptable only for a clearly labeled public practice demo, never as an anti-cheat premium exam.
- Paper authorization must be checked on **each** server request; a cached client flag is not entitlement.
- Create attempts with server `started_at` and `deadline_at`; accept answers only before the deadline; submit at most once; score from server-held answer keys.
- A payment request starts `pending`. Validate independently against the payment provider/bank statement; a screenshot or reference alone never activates access.
- Approval and subscription issuance must occur in a single database transaction, using row locking and uniqueness on `payment_request_id` to prevent duplicate activation.
- Admin actions must be audited; never trust an email address alone as proof of admin role.
- Avoid exposing payment evidence through public storage URLs; keep private uploads subject to MIME/size scanning and retention policy.
- Rate-limit login, payment submission, answer writes, and admin operations.
- Ensure PPSC Academy data is isolated from School Suite accounts, databases and backups.

## Implementation order
1. Confirm hosting/provider, email delivery, and private secrets workflow with the owner.
2. Apply reviewed schema in **new isolated database** and create least-privilege database roles/RLS policies.
3. Implement verified email registration and session-aware `/me`.
4. Implement server-side attempts, private answer keys, and owner-only results.
5. Implement manual payment request and reconciled admin approval.
6. Implement subscriptions, expiration, renewal, and revocation.
7. Add integration tests for unauthorized access, cross-user reads, replayed payment references, double approval, expiry, and server timeouts.
8. Add monitoring, encrypted backups, privacy policy, recovery tests and deployment approval.

## Owner decision required
Choose the secure authentication/database provider (for example, managed Postgres + identity service). This draft is deliberately provider-neutral and cannot be turned into working signup by committing static frontend code.

## Owner decision: zero-cost infrastructure only (2026-11-05)

The owner explicitly requires **no paid plan, no paid trial, no automatic upgrade, and no chargeable infrastructure**. Selected initial candidate: **Supabase Free** (managed PostgreSQL + Auth), subject to account/project creation and current free quotas. The application must remain disabled for live registration and payment until the free project is securely configured and tested. No Supabase account, project, secrets, or database have been created by this GitHub commit.

Free-plan caveats: free projects can pause after insufficient activity for roughly seven days; the free plan has resource limits and lacks included automatic backups. Use manual verified exports/backups and a recovery procedure; do not promise production uptime. Monitor limits, and stop onboarding or switch to a zero-cost alternative rather than enabling billing. Never introduce a credit-card requirement without the owner's approval.

**School Suite remains unchanged.** Its existing Apps Script/Sheets school registration is not evidence that the PPSC Academy can safely store candidate passwords or protect premium papers in Sheets. Supabase is an architectural choice for this new module, not a requirement for all LAMA Studio projects. If Supabase Free ceases to be suitable, evaluate a free identity provider with a separate secure server-side storage solution, not homemade password hashing in Apps Script.

**Supabase Free implementation groundwork now committed:** `supabase/001_candidates.sql` contains an **unapplied** candidate-profile table and owner-only RLS policies tied to `auth.uid()`; `../supabase-config.js` is explicitly disabled; `../auth-supabase.js` provides an inert, opt-in auth adapter for sign-up, verified-email sign-in, logout and password recovery. The registration UI remains disabled. No real Supabase project, migrations, profile creation flow, token refresh/session persistence, integration tests, or cloud examination storage exists yet. The adapter holds a short-lived token only in memory and must be extended and tested before real users are admitted. Keep `enabled:false` until that work is complete.
