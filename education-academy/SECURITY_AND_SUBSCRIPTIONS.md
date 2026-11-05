# PPSC Academy: secure subscription implementation specification
**Status: design, not active billing.** Do not accept money or claim paid access is enabled.

## Data entities
- users: uid, email_normalized, email_verified_at, role (student|admin), created_at, disabled_at
- subscriptions: id, uid, product='ppsc-academy', starts_at, expires_at, status (pending|active|expired|revoked), approved_by
- payment_claims: id, uid, amount_pkr=1000, reference, payment_method, receipt_private_object_key, submitted_at, status (pending|verified|rejected), reviewed_by, reviewed_at
- audit_events: id, actor_uid, action, target_id, timestamp, immutable details
- papers: id, title, revision, published_at, reviewer_id, question_ids
- questions: id, stem, options, answer, explanation, topic, review_status, source_note

## Trust boundaries
- Use server-side authentication with verified email and secure password reset. Do not store credentials or admin roles in localStorage.
- A server must check the authenticated user, active subscription and expiry for every premium paper/answer API request. Never ship all premium answer keys in public JS.
- Super Admin privileges must be assigned server-side to a verified owner account; never self-assign via signup.
- Screenshots and transaction references are claims, not proof. Only approve after reconciling bank/JazzCash/Easypaisa records. Reject reused references.
- Receipt uploads: private object storage, type/size validation, malware precautions, signed access URLs, retention policy; no public screenshots.
- Idempotent approvals, append-only audit history, no irreversible deletion of financial history.
- Offline premium packs require an expiry-bound server-signed entitlement; never trust a device clock or browser flag as a payment source.
- Rate limiting, CSRF protection, secure cookies, backup/restore tests, accessibility and privacy notice are release requirements.

## Admin features
Metrics: registered, trial, pending, active, expiring, expired, gross verified payments, refunds. Filter/search/export users and claims; approve/reject with reason; issue renewal reminders. All figures from server records only.

## Product terms
Academy-only access: PKR 1,000 for 12 months, not a School Suite subscription. One free full sample paper is planned; current preview contains a 20-question demo. Never call the demo a 100-question full paper.
