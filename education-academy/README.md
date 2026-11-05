# LAMA PPSC Academy — development handoff
Status: **preview only; NOT production ready**. This directory is isolated from the School Suite. No deployment authorized.

## Commercial requirements
- One account per verified email; PKR 1,000 for 12 months; academy-only entitlement, separate from school subscriptions.
- Secure server-side email verification, password handling, roles, payment verification, subscription lifecycle and audit logs.
- Super Admin: subscriber counts, pending payments, approvals, expirations, gross/net receipts, refunds, CSV export, paper review and content management.
- Premium papers: 500 full papers of 100 MCQs each (50,000 question slots), 80 professional education / 20 general ability, validated questions with provenance, non-repetition checks and explanations.
- BS-17 and BS-18 separately; provisional subject weighting pending official PPSC notification.
- Timed exam engine, printable PDF questions, answer sheets and optional answer keys; watermarked downloads.
- Offline PWA: downloaded authorized packs, IndexedDB attempts and sync conflict handling; server-validated time-limited offline entitlements. Cached public demo is not premium security.
- Planner: date-driven study phases, daily tasks, missed-day recovery, weak-topic revision, persistent sync.

## Implemented now
- Standalone mobile-friendly preview page, three original sample MCQs with results, printable question page, local study planner, PWA shell cache and manifest.
- No backend, no payment collection, no subscriber registration, no admin portal, no 500-paper content. Do not advertise as completed.
- PWA installation quality needs proper icon assets and browser/device testing.

## Release gates
1. Select and configure production auth, database and payment provider; keep secrets server-side.
2. Implement server-validated roles and payment webhook/manual verification with transaction reconciliation.
3. Implement content ingestion/review, 500-paper generation and answer-key access controls.
4. Build offline pack encryption/entitlement expiration strategy and device sync.
5. Test accessibility, print layout, installation, offline behavior, security and backups.
6. Verify official PPSC vacancy, eligibility, exam pattern and date; only then publish claims.
7. Explicit owner approval before any Vercel deployment or public launch.
