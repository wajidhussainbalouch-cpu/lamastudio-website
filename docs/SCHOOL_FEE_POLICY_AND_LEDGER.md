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

Status: Phase 1 code in review branch only; phase 2 is a design, not implemented or deployed. No actual school payment or configuration was changed.
