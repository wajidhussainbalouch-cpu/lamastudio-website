# lamaPhotoResizer API (Laravel backend)

Handles the three things a static client-side app genuinely cannot do on its
own: a trial/license state that's the same regardless of which device or
browser checks it, payment-claim review that only *you* (the admin) can act
on, and admin authentication that can't be bypassed by reading the frontend
JS.

## What's in this folder

This is **not** a full Laravel install — composer/packagist aren't reachable
from the sandbox that generated this, so these are the app-specific files to
drop into a fresh Laravel project:

```
app/Models/{License,PaymentClaim,Admin,ApiUsage}.php
app/Http/Controllers/Api/{LicenseController,PaymentClaimController}.php
app/Http/Controllers/Api/Admin/{AdminAuthController,AdminLicenseController,AdminPaymentClaimController}.php
database/migrations/2026_08_08_*.php
database/seeders/AdminSeeder.php
routes/api.php
config/cors.php
```

## Setup

```bash
composer create-project laravel/laravel lamaPhotoResizerBackend
cd lamaPhotoResizerBackend
composer require laravel/sanctum

# Copy every file from this deliverable into the matching path,
# overwriting routes/api.php and config/cors.php.

php artisan install:api        # publishes Sanctum's migration + config if not already present
```

Edit `.env`:

```
DB_CONNECTION=mysql
DB_DATABASE=lama_photo_resizer
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

Register the Admin model with Sanctum's token relation — in
`app/Models/Admin.php` this is already done via `use HasApiTokens;`, no
extra config needed since Sanctum tokens are polymorphic and don't require
a dedicated auth guard.

```bash
php artisan migrate
php artisan db:seed --class=Database\\Seeders\\AdminSeeder
php artisan serve   # http://127.0.0.1:8000 for local testing
```

## First admin login

The seeder creates `wajid@lamastudio.pk` / `change-me-now`. **Change that
password immediately** — either edit `AdminSeeder.php` before seeding, or
update it directly in `tinker`:

```bash
php artisan tinker
>>> $a = App\Models\Admin::first();
>>> $a->password = Hash::make('a-real-password');
>>> $a->save();
```

## API surface

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/license/trial-start` | — | Create/return the trial license for a `device_id` |
| POST | `/api/license/verify` | — | Look up a license's current status |
| POST | `/api/license/consume` | — | Server-side trial-usage counting after a batch |
| POST | `/api/payment-claims` | — | Submit an EasyPaisa/JazzCash/Bank/Raast TxID |
| GET | `/api/payment-claims/{id}/status` | — | Poll whether a submitted claim was reviewed |
| POST | `/api/admin/login` | — | Returns a Sanctum bearer token |
| GET | `/api/admin/stats` | Bearer | Dashboard summary numbers |
| GET | `/api/admin/licenses` | Bearer | Search/list licenses |
| GET | `/api/admin/payment-claims` | Bearer | List claims by status |
| POST | `/api/admin/payment-claims/{id}/approve` | Bearer | Activates the license |
| POST | `/api/admin/payment-claims/{id}/reject` | Bearer | Marks rejected with a note |

## Deployment notes

- Put this behind `api.lamastudio.pk` (or a `/api` path on the same domain
  as the static site) and update `config/cors.php` `allowed_origins` and
  the frontend's `API_BASE_URL` (see the web app's `README.md`) to match.
- `unique(['method','tx_id'])` on `payment_claims` blocks accidental/abusive
  duplicate submissions of the same transaction — if a genuine customer
  needs to resubmit, reject the first claim rather than deleting it, so
  there's an audit trail.
- Nothing here validates the TxID against EasyPaisa/JazzCash's own systems
  — that would need their merchant API, which is a separate integration.
  Today this is "customer self-reports a TxID, human admin eyeballs their
  own merchant account statement and approves/rejects" — appropriate for
  a small operation, not for scaling past what one person can review daily.
