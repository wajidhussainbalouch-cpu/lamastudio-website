# Lama IQ Master — Product and Engineering Plan

Status: Planning foundation (not deployed). Branch: feature/lamaiqmaster-native-foundation.

## Product
- Free offline brain-training gameplay: logic, patterns, memory, attention, speed.
- Brain Performance Score measures in-app performance; do not advertise a clinically validated IQ test.
- Optional Pro subscription for expanded challenges, insights and ad-free experience.
- Free tier can use AdMob with non-disruptive ads and opt-in rewarded ads. Never show ads during timed challenges.
- No mandatory account. Optional account sync later.

## Architecture
- Android: native Kotlin, Jetpack Compose, MVVM, Room for offline progress.
- Website: retain /apps/lamaiqmaster/ as public product page (features, pricing, screenshots, privacy, support, Play Store listing when live).
- Shared product catalog/configuration: versioned JSON/API with no secrets in client.
- Subscriptions: Google Play Billing for in-app digital subscriptions, with server-side purchase verification and entitlement handling before launch. Never trust client-only purchase flags.
- Privacy: consent flow where required, data minimization, age-appropriate advertising, and accurate Play Data Safety declarations.
- Build: GitHub Actions debug APK first, signed AAB only after secure signing and release review.

## Milestones
1. Inventory existing Lama IQ Master assets and app sources; preserve existing content.
2. Implement offline Kotlin gameplay and deterministic scoring with unit tests.
3. Build debug APK using GitHub Actions; test on physical Android phone.
4. Refresh product website without modifying other apps or global site scripts.
5. Add AdMob test ads and consent; verify behavior.
6. Add optional Pro via Play Billing and backend verification.
7. QA, accessibility, privacy, screenshots, release signing and Play Console submission.

## Safety boundaries
- No changes to Lama School Suite, Lama Sky, VPN Pro, or school data.
- No production deployment from this branch until tested.
- Do not publish prices, active subscriptions, or Play Store download links before they exist.
- Keep all secrets, signing keys and production ad credentials outside the repository.
