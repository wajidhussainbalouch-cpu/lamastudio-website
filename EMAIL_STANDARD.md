# LAMA Studio official email standard
Updated 27 November 2026.

## Approved sender and verified incoming support address
- Automated transactional mail: `no-reply@lamastudio.pk` (exact spelling; existing active Brevo sender, ID 2).
- Brevo reports `lamastudio.pk` DNS authenticated and verified, with Cloudflare as DNS provider.
- Customer support/business: `info@lamastudio.pk` is the sole public contact address. Cloudflare routing and Gmail destination are verified; an external test message was received on 27 November 2026 at 15:06 PKT (owner screenshot). Incoming contact links are approved. Branded outbound replies and automated Reply-To rollout remain subject to separate testing.
- Keep owner Google account for private admin, recovery, internal notification destinations and forwarding. Do not blindly replace admin identities, account IDs, OAuth identities, or internal notification recipients.
- Do not use personal Gmail as the customer-facing sender once each project migration has passed its tests.

## Mandatory zero-additional-cost policy
- Use only free, non-trial email services. No paid email hosting, subscription, add-on, prepaid credits, auto-upgrade, or billable fallback without explicit owner approval.
- Retain the existing verified Brevo sender on the Free plan: currently 300 outgoing emails per day, shared across projects on that account. Prioritize signup and recovery; rate-limit, queue eligible messages and alert the owner when capacity is exhausted. Never silently disable verification or send expired links.
- Use Cloudflare free Email Routing for incoming business mail to one owner-confirmed existing Gmail inbox; no separate paid mailbox or storage. Forwarded messages occupy that Gmail account's existing free storage. The owner must confirm the exact destination address privately before configuration. Do not publish it.
- no-reply is an automated sending identity, not a separate inbox; if an inbound route is required, route it to the same verified inbox. Use info for customer correspondence only after inbound delivery is tested. For branded outbound support replies, use a verified free sending workflow, not an assumed Gmail alias (Google has announced third-party Send as changes from January 2027).
- Existing domain renewal is separate from email service fees. Free provider terms and quotas can change; if a free service becomes unavailable, stop and evaluate a free alternative rather than incur charges.
- Keep existing live mail flows unchanged until the replacement passes delivery/security tests. No changes to DNS, billing, SMTP or destination are implied by this policy.

## Owner decision — single public address
Use only `info@lamastudio.pk` for all public contact, support, feedback, sales, privacy and business inquiries. Do not create additional aliases at this stage. Keep the existing `no-reply@lamastudio.pk` exclusively for automated messages. Once the free Cloudflare route is verified by an inbound test, replace public personal email links on active project contact pages, footers, privacy pages, help/support pages and notification help text with `mailto:info@lamastudio.pk`. Preserve private owner/admin identities, login accounts, recovery and internal notifications. Do not publish a non-working contact or alter deleted projects. No paid services.

## Project sender display names
| Project | From display name |
|---|---|
| School Suite (including Smart Marker) | LAMA School Suite |
| PPSC Preparation Academy | LAMA PPSC Preparation Academy |
| Bazar | LAMA Bazar |
| Coding App | LAMA Coding |
| Quran learning app | LAMA Studio / final product name |
| Main website and other active tools | LAMA Studio or actual product name |

Only configure email for tools that need it. Never add unnecessary signup or collect user email just for branding.

## Customer replies and Google Play contact
All public support replies must originate from `info@lamastudio.pk` with display name LAMA Studio (or actual product brand), including replies to website and Google Play support requests. Never send public correspondence from the personal Gmail account; Gmail remains the private receiving inbox. Publish info as the support contact in Play Console for active listings; verify the developer account's public contact requirements separately, and do not replace private sign-in/recovery identities. Google Play review replies posted through Play Console are distinct from email replies. Use the verified Brevo sender/API or a secure owner-only reply interface within the free plan, subject to sender verification and real delivery/header testing. Do not depend on Gmail third-party Send as after its announced January 2027 removal. No paid subscriptions or automatic upgrades. Until branded sending is tested, do not send customer replies through the personal Gmail address.

## Sender verification — 27 November 2026
Owner screenshot at 15:24 PKT shows both `info@lamastudio.pk` (LAMA Studio) and `no-reply@lamastudio.pk` (LAMA Bazaar) as verified Brevo senders, with domain DKIM and DMARC configured. Incoming forwarding to owner Gmail already passed a real delivery test. Outgoing customer-reply delivery and header inspection are still pending; a verified sender is not itself a tested reply interface. Keep the existing private Gmail sender until dependencies are audited; do not use it for new public customer correspondence. No billing changes.

## Provider and rollout
1. Brevo SMTP: smtp-relay.brevo.com, port 587; use the authenticated dashboard's SMTP login and a project-specific SMTP key where supported. Never store credentials in Git, browser code, email templates, or chat. Supabase projects: enable custom SMTP and use the exact verified From address with project display name. Verify site/redirect allowlists, preserve email confirmation and existing accounts, and test actual deliveries and links. Review rate limits and disable link rewriting if it interferes with single-use auth links.
2. School Suite: Google Apps Script MailApp cannot set an arbitrary From address. Migrate customer-facing activation/recovery/approval mail to a server-side Brevo transactional integration using Script Properties for a scoped API key. Preserve internal super-admin recipient and existing recovery/activation security. Do not email plaintext passwords. Test on a separate deployment before promoting; the repository may not include all current live backend modules.
3. Cloudflare Email Routing (or existing mail host): create info@lamastudio.pk to a verified owner inbox without disturbing existing MX/DNS or website configuration. Test inbound delivery. Configure an authorized outbound mailbox/SMTP identity separately for professional replies; forwarding alone does not configure send-as. Then update public support links, privacy/contact pages and reply-to addresses, and test again.
4. Verify actual From name and address, DKIM/SPF alignment/DMARC, inbox delivery, confirm/reset links, expiry, failure handling and no exposed secrets, separately for every live project. Do not claim launch complete before this.

## Current evidence
Brevo sender and domain verified on 27 November 2026. Bazaar has an existing active sender identity, but end-to-end live authentication mail not independently tested in this audit. School Suite source uses MailApp; public contact links are being migrated to info@lamastudio.pk; academy SMTP configuration is not exposed by the connected database tools. Support address receiving is verified by the owner screenshot; branded send-as remains unverified. This standard does not itself change live SMTP or email routing.

References: https://supabase.com/docs/guides/auth/auth-smtp ; https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP ; https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/
