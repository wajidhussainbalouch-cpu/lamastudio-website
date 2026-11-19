# School Fee Policy and Accounting Integration
## Phase 1: shared school configuration
- Preserve existing school-level/type/class/section/curriculum controls.
- Add Kachi, ECCE and KG selectable options (not automatic enrollment).
- Store enabled categories, cadence (monthly, one-time, as-needed) and per-class amounts inside the existing school registry feeCategoriesJson field. Old category-only documents are accepted; missing amounts are not zero. Class aliases such as 1 and Class 1 match.
- Government and PEF: tuition and voucher previews excluded by default in this phase; authorized non-tuition rates may be configured. No assumed Rs. 20 charge or schedule. Schools must verify permission and frequency. Legacy collections remain unchanged.
- Private: select class, month and category in fee-plan.html. Each matching student gets a draft estimate using the configured rates. Explicitly select one-time/as-needed heads; incomplete rates are skipped. Never distribute as billed amounts or use alongside legacy generator to issue duplicate obligations.
- Strict profile read and comparison before save; no backend migration. Comparison reduces accidental stale changes but is not a transactional compare-and-set. Rate previews do not change finance records.

## Required Phase 2: issued obligations and payment allocations
The current Fees headers contain amount and status but not a reliable billing month, fee category, invoice ID or payment allocation. Do not represent a partial payment by editing the original amount or marking the entire invoice Paid.

Use the school-scoped existing Apps Script backend, with administrator authorization, subscription write checks and append-only audit records:
- FeeDemands: id, unique obligation key (school/student/category/period or event reference), studentId, class/section snapshot, category snapshot, month/event reference, amount in integer paisa, concession, issue date, due date, createdBy.
- PaymentReceipts: id, idempotency key, studentId, amount in integer paisa, receipt reference, paidAt, method, actor, reversal reference.
- PaymentAllocations: receiptId, demandId, allocated amount, reversal reference.
- Derive paid = net valid allocations; balance = net demand less allocated amount; status = unpaid, partial, paid; overdue is a separate due-date condition. Example 100000 paisa demand and 50000 paisa payment => 50000 remaining. Reject or explicitly account for overpayments instead of silently losing them.
- Under a backend lock, revalidate settings and student/class scope, prevent duplicate demands for each category/period, and make retries idempotent. Ensure payment and allocations are committed as one logical transaction with recoverable outcomes. For one-time charges require distinct issue/event references and preview.
- Print vouchers from issued demand snapshots, reflecting verified allocations; receipts only for actual payments. Filter by class, month/event, student, category and balance status. No new charge created by printing.
- Government/PEF: use a verified, configurable non-tuition collection register and receipt workflow; no default private-school vouchers. Expose applicable features in dashboard, parent portal and navigation only after mode and authorization checks. Existing receipt/collection history remains available.
- Support explicitly approved per-student exemptions/concessions as audited adjustments, never overwrite previously issued bills when changing school rates.
- Legacy Fees rows: preserve as historical records; do not infer demand or apply a payment based only on row date or status. Reconcile via admin-reviewed mapping before combining summaries. Keep reports separate until reconciliation is verified.

## Acceptance gates before financial production release
1. Verified school configuration round-trip on a test school; exact fee values across devices, no cross-school sharing.
2. Repeat class/month generation twice; one obligation per student/category/period. Parallel calls and retries produce no duplicates.
3. Rs. 1000 bill + Rs. 500 payment = Rs. 500 due; second Rs. 500 = paid; duplicate receipt retry leaves balance unchanged. Reversal restores correct balance.
4. Multi-category and multiple-month balances, exclusions, concessions, refunds, overpayment policy and one-time events tested.
5. Government/PEF tuition and voucher controls tested; authorized collections and historical receipts still accessible.
6. Server-side verification, parent access control and audit verification, actual Apps Script deployment and live Vercel check. No financial write feature is considered live merely because Vercel frontend is READY.
7. Preserve original school data and test rollback with a separate sandbox school.

Status: Phase 1 and initial phase 2 backend code are in the review branch only. Neither phase is deployed to production. No actual school payment or configuration was changed.

## Phase 2 implementation — pilot backend (2026-11-19)
The existing Apps Script code.gs now includes feeLedgerRead, feeLedgerIssue, feeLedgerPay and feeLedgerReverse, with matching API client wrappers. All require a verified school administrator and school-scoped authorization. Mutations require a writable subscription; all endpoints require the explicit Script Property LAMA_FEE_LEDGER_PILOT_<schoolId>=true. No pilot is enabled by this change. POST only.

Instead of committing three separate sheets independently, the initial backend stores complete immutable events in a dedicated FeeLedgerJournalV1 sheet outside generic collection CRUD. A payment and all its allocations share one appended event. Each event records actor, timestamp, school, request ID and exact request fingerprint. Server-side script lock serializes ledger requests, duplicate obligation keys prevent repeat issue, exact integer-paisa allocations must balance, and a retry with identical ID and payload returns the prior event. Monthly keys use month; one-time keys charge once per student/category; as-needed keys require an explicit event reference. Category frequency cannot change for previously issued categories without reconciliation. Existing rates remain immutable on issued obligations. Receipt reversal is append-only, requires reason, and restores outstanding balance. Overpayments are rejected in this pilot. Journal replay derives outstanding amounts and fails on detected invalid events. Legacy Fees rows remain separate and untouched.

34/34 simulated backend checks passed: empty read, issue, repeat/no-op issuance, retry, partial and full payment, altered retry rejection, overpayment, cross-student allocation, unbalanced amounts, reversal/retry, duplicate reversal, stale policy, invalid dates/months/students, separate event charges and duplicate-event protection, missing rates, government/PEF issue restrictions, expired subscription read-only, pilot/administrator/role/school gates, lock contention, replay integrity, GET restriction and syntax. These tests used mock Apps Script and spreadsheet services, not live Google Sheets or actual parallel traffic.

Remaining gates: build admin issue/payment/receipt/reversal UI with stable retry keys retained through reloads; filtered issued voucher printing and parent-specific read API; government/PEF permitted-collection receipt module; audited concessions and refunds; stable category IDs and migration for renamed categories; legacy reconciliation, including verifying existing payments before enabling each school's pilot; real Apps Script sandbox deployment; test actual concurrent requests, timeout/uncertain-write recovery, storage growth, direct sheet access/tampering and backup restoration. School settings writes are not serialized with the ledger lock; each issue uses the verified snapshot read by the backend. Improve config/issue coordination before wider rollout. No financial production deployment performed.
