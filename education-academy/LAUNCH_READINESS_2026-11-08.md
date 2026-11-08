# LAMA PPSC Preparation Academy — Final Launch Readiness Review

**Audit date:** 8 November 2026 (Pakistan)  
**Repository:** `wajidhussainbalouch-cpu/lamastudio-website` · `education-academy/`  
**Production site:** https://www.lamastudio.pk/education-academy/  
**Current decision:** **NO-GO for paid/commercial launch.** Public free-practice preview is a separate, conditional release decision.

## Executive assessment

The academy has a working structure, a branded dashboard/PWA, job-wise preparation paths, an exam engine, downloadable print/answer-key views, score history, a study planner and a published Headmaster/Headmistress paper registry. GitHub source tests currently expect **15 public 100-MCQ school-head practice papers**; publishing more job tracks does not create corresponding exam banks.

The verified latest Vercel production deployment inspected during the audit was **READY** and assigned to `www.lamastudio.pk`. This confirms build/deployment, **not** end-to-end user flows, Android UX, cloud email, or payment processing.

The Supabase project `cqoeokovxuimbltskuze` is `ACTIVE_HEALTHY`. All seven public-schema academy tables checked have RLS enabled. Read-only policy inspection found that candidate records and practice attempts are limited to their owners, while private question-bank and administrative rows require an authorized super-admin. Supabase Security Advisor reported a warning: **Leaked Password Protection Disabled** ([official remediation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)).

## Launch gate table

| Area | Current evidence | Gate |
|---|---|---|
| Branding and PWA | Approved green/gold emblem set as 192px and 512px PNG; both candidate/admin manifests; updated service-worker cache | **Code ready**; verify icon on a real Android launcher |
| Mobile interface | Professional responsive stylesheet, compact secondary page header, keyboard focus, touch-target improvements, reduced-motion support | **Code ready**; requires live Android and desktop screenshots |
| Job-wise catalog and library | Numbered paper library and subject counts are linked to published job-specific papers; Headmaster/Headmistress prioritized | **Code ready**; test live filtering and empty tracks |
| Practice exams | Existing registration/tests reference 15 papers, 100 MCQs each, 90-minute duration and per-paper attempt keys | **Needs real 90-minute-resume, timeout, answer-key and print tests** |
| Academic correctness | Automated structure and duplication tests exist; many items have not received independent subject-expert sign-off | **Blocker for quality certification / claim of PPSC syllabus fidelity** |
| Registration | Public Supabase Auth configured; email confirmation uses academy-branded redirect | **Blocker until signup, verification, reset and deliverability tested end-to-end** |
| Security | 7/7 RLS-enabled tables; only publishable client key used; leaked-password check disabled | **Security setting must be reviewed**; verify anonymous/candidate/admin boundaries |
| Paid subscriptions | 0 active subscription records at audit; no approved public payment activation; plan in UI is labelled proposed | **HARD BLOCKER: do not accept fees or promise premium entitlements** |
| Paid question access | Free practice papers and answer keys are distributed in public JavaScript/PWA cache | **HARD BLOCKER if selling restricted premium question content**; move paid access behind verified server-side entitlements first |
| Local progress and data | Exam history saved on-device; cloud attempt writes require authenticated success | **Test backup/restore, change of device, logout, offline reconnection** |
| Privacy/terms/help | Pre-launch candidate Help, Privacy and Practice Terms pages added; support footer linked | **Owner approval required** for contact method, data retention and legal disclosures |
| Offline PWA | Public HTML, question bank and new informational pages are cached; query-aware public navigation fallback | **Test install/update/offline with real Chrome and intermittent connectivity** |
| CI and deployment | GitHub workflow includes exam, job-wise library and new launch disclosure checks; inspected Vercel deployment READY | **CI test pass and live functional run not independently confirmed** |
| Other jobs | Job catalog includes many tracks, but only the school-head family has dedicated public exams | **Do not advertise 100-MCQ papers for other jobs until their banks exist** |

## Changes in this preparation pass

- New `academy-polish.css`: compact secondary header, clear hover/focus states, coherent layout and mobile touch targets, reduced motion and print safeguards.
- `index.html`: visible help/privacy/terms footer, skip-to-main accessibility link and updated stylesheet.
- `academy-router.js`: descriptive page titles, current-menu marker and robust malformed-fragment handling.
- New `help.html`, `privacy.html`, and `terms.html`: accessible informational notices with clear PPSC non-affiliation and paid-membership inactive statements.
- `sw.js`: bumped to v74 and caches the added public stylesheet and informational pages; private admin pages remain excluded.
- New `test-launch-polish.cjs` is included in the GitHub Actions academy workflow.

## Mandatory real-world acceptance tests

1. **Android mobile (primary audience):** open the production site in Chrome on a 360–420px screen, verify no horizontal scrolling or nested narrow card view; check menu, header, job cards and all routes.
2. **PWA:** install; verify approved logo on home screen, open offline, visit cached exam, reconnect, and verify update prompts/cache without deleting local scores.
3. **Exam:** start each offered Headmaster track, answer/flag, navigate away/back, resume, submit, verify score/answer explanations and the correct per-paper saved attempt; test auto-submit on time expiry.
4. **Printing:** print and Save PDF for paper and submitted answer key on Android and desktop; verify readable font, footer, logo and low-opacity watermark.
5. **Accounts:** register a fresh test user, confirm email, sign in/out, reset password, check wrong-password response and admin authorization boundaries without using a real candidate's personal data.
6. **Subscriptions:** do **not** accept test payments in a public account. Build, secure and dry-run a trusted server-side approval/entitlement workflow only after business and refund terms are approved.
7. **Question QA:** academic expert signs off correct options, explanations, no critical duplication and PPSC subject coverage for every advertised paper.
8. **Security and policy:** enable/review leaked-password protection, verify RLS with user and anonymous test sessions, agree on support/privacy/retention details.
9. **CI:** obtain a successful run of `PPSC Academy Quality Checks` on the exact intended release commit (including `test-launch-polish.cjs`).
10. **Release control:** confirm the production deployment SHA, HTTP responses for both PNG icons, service worker version, support pages and manifest icons, then approve commercial opening separately.

## Known limitations and ownership

- The browser tool could not fetch the live site directly in this audit; Vercel deployment readiness was inspected via authenticated connector. **READY does not prove the page looks correct on user devices.**
- The Supabase admin's leaked-password protection warning requires project-owner action in Auth settings; this audit did not change authentication policy, billing, database records, or payment access.
- GitHub commits on `main` may trigger existing Vercel Git auto-deployments; **no direct Vercel deploy/promote action** was initiated by this work. Monitor production through the existing Git pipeline.
- Owner approval is required before announcing a final **paid** launch, taking fees, or presenting an unverified syllabus as official.

**Recommended launch sequence:** Free preview and feedback -> verified technical and academic acceptance -> secure membership/payment implementation -> owner approval -> separate paid launch.
