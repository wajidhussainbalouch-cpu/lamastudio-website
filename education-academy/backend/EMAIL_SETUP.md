# LAMA PPSC Academy — candidate registration and confirmation email

**Checked:** 6 November 2026

## Actual status

Supabase project **LAMA PPSC Academy** is active, and the website's Supabase browser configuration is enabled. The authentication adapter supports email/password signup, verified-email sign-in, session refresh, logout and password reset.

Observed database counts on 6 November:
- 2 Supabase Auth accounts.
- 1 email-confirmed account.
- 0 candidate-profile rows in public.ppsc_candidates.
- 0 authorized Super Admin accounts.

These figures prove that Auth has accounts, **not** that signup confirmation email delivery or the full candidate journey was verified on the live website. Candidate-profile creation currently happens on the first successful verified sign-in, so the admin candidate directory can remain empty after signup alone.

## Does the candidate receive email from LAMA or Supabase?

**Supabase Auth sends the verification email.** Its exact current SMTP sender and email template were not inspectable with the connected database tools. Do not assume it displays LAMA PPSC branding. On Supabase's restricted default mail service, messages may not reach ordinary external email addresses at all.

For a branded sender, verify ownership of a sender domain and configure an SMTP service in Supabase Dashboard → Authentication → SMTP Settings. A sender such as **no-reply@lamastudio.pk** is only an example until the domain and mailbox/service are verified. Configure SPF, DKIM and DMARC. Use a confirmed From address, sender name **LAMA PPSC Preparation Academy**, and customize the **Confirm Signup** email subject/body. The sending provider and sender address must be configured in SMTP settings; editing a template alone does not change the sender.

**Suggested subject:** Confirm Your Registration — LAMA PPSC Preparation Academy

**Suggested HTML confirmation email template:**

~~~html
<div style="font-family:Arial,sans-serif;color:#153e33;max-width:560px;margin:auto">
  <h2 style="color:#14664f">LAMA PPSC Preparation Academy</h2>
  <p>Welcome to LAMA PPSC Preparation Academy, a project of LAMA Studio.</p>
  <p>Please confirm your email address to activate your candidate account.</p>
  <p><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#14664f;color:#fff;padding:12px 16px;text-decoration:none;border-radius:8px">Confirm My Email</a></p>
  <p>If you did not create an account, ignore this message.</p>
  <p>lamastudio.pk</p>
</div>
~~~

Supabase Free projects created from June 2026 onward may restrict customization while using the default Supabase email provider; use configured custom SMTP to unlock branding if applicable.

## Required end-to-end test

1. Verify allowed redirect URLs and the academy's site URL in Supabase.
2. Register an opt-in test candidate at the deployed site, observe the actual response and delivered email sender/subject.
3. Confirm the address using the emailed link; sign in; verify the profile is created, belongs to the same Auth user and appears in the authorized admin directory.
4. Test password recovery, invalid email confirmation, expired token, mobile redirects and message rate limits.
5. Do not activate paid membership or claim production readiness until tests pass.

Do not commit SMTP credentials or any privileged Supabase keys.

Official docs:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/auth-email-templates
