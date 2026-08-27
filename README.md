# EAPASER

A Forex automation marketplace and EA discovery platform: EA marketplace,
developer dashboard, admin CMS, EA Scout, licensing, and reviews.

This is a real, working application. This README states plainly what's
implemented, what's a genuine concrete integration versus what still needs
your credentials, and — importantly — the limits of how this was verified.

## Read this part first: how this was verified

This project was built in a sandboxed environment with **no network
access**, so none of the following has actually been run:
`npm install`, `tsc`, `next build`, `next dev`, or a real database
migration. Nothing here has been proven to compile or execute.

What was done instead, by hand, on every file:
- Every `@/...` import was grepped against the filesystem and confirmed to
  resolve to a real file.
- Every internal link (`href`, static and dynamic) was checked against an
  actual page route.
- Every Prisma field and enum used in application code was checked against
  `prisma/schema.prisma`.
- Every privileged API route was checked for a server-side
  `requirePermission()` / `userHasPermission()` call — not just a frontend
  guard.
- Ownership checks were checked by hand on every route that loads a record
  by ID (developer product routes check `developer.userId`, license/download
  routes check `customerId`, ticket routes check `customerId` or staff
  permission).

This caught real bugs along the way — for example, an earlier pass had
`ADMIN` missing the `manage_payouts`/`manage_support` permissions its own
nav links pointed to, which would have 403'd; that's fixed in
`src/server/auth/rbac.ts`.

None of this replaces actually running `npm install && npm run typecheck
&& npm run build` against a real database. That is the genuine first step
in your environment, and it is likely to surface something this manual
process missed — a typo, a type mismatch, a Prisma client field this pass
didn't think to check. Budget time for that pass before calling this live.

## What's implemented, and how real each integration is

**Public:** homepage, marketplace with search/filter/sort/pagination,
product detail pages, brokers/prop firms/signals directories, blog, reviews
feed, EA Scout explainer, legal pages, login/register (with 2FA step),
public support ticket flow.

**Customer** (`/dashboard`): overview, orders, licenses with protected
downloads, profile, password change with session revocation, TOTP
two-factor authentication (enroll, confirm, disable, backup codes).

**Developer** (`/developer`): apply flow, overview with real earnings math,
product create/edit, **file upload** for `.ex4`/`.ex5`/`.set`/`.zip`/`.pdf`
with size/type validation, a version history list with working signed
download links, submit-for-review, payouts history.

**Admin** (`/admin`): RBAC-gated dashboard with live stats, product
moderation (approve/reject/request changes), developers list, orders,
licenses with revoke, users with role/status management (self-modification
blocked), **payouts** with status transitions (requested → approved →
processing → paid, or rejected at any step), **support console** with
reply and status controls.

**Integrations — concrete adapters, not just interfaces:**
- **Payments:** `src/server/payments/stripe-provider.ts` — a real Stripe
  Checkout Sessions implementation (session creation, webhook signature
  verification via `stripe.webhooks.constructEvent`, refunds).
- **Email:** `src/server/email/resend-provider.ts` — a real Resend API
  call, no SDK dependency needed.
- **Storage:** `src/server/storage/s3-provider.ts` — a real S3-compatible
  adapter (AWS S3, or Cloudflare R2 / Backblaze B2 / DigitalOcean Spaces
  via a custom endpoint) using presigned URLs for downloads.
- **Registration:** `instrumentation.ts` → `src/server/bootstrap.ts` reads
  environment variables at server startup and registers whichever adapters
  have credentials present. Anything left unconfigured keeps the safe
  "not configured" fallback already built into each provider interface —
  nothing fakes success.

You still need to **supply your own credentials** for these to do
anything (a Stripe account, a Resend API key, an S3-compatible bucket) —
the code is real, the accounts behind it are yours to create.

**Not yet built, stated plainly:**
- CMS admin screens for pages/banners/FAQs/announcements (schema exists,
  no admin UI).
- Malware scanning on uploaded files (the hook and comment are in
  `assertSafeUpload`, no scanner wired in).
- Automated tests of any kind.

## Local development

```bash
npm install
cp .env.example .env
# fill in DATABASE_URL and AUTH_SECRET at minimum; add provider
# credentials for any integration you want active

npm run db:migrate
SEED_SUPER_ADMIN_EMAIL=you@example.com SEED_SUPER_ADMIN_PASSWORD="a-strong-password" npm run db:seed

npm run dev
```

Sign in with the seeded Super Admin credentials to reach `/admin`.

## Production build

```bash
npm run typecheck
npm run lint
npm run build
npm run db:deploy
npm run start
```

Run `typecheck` first. This is the step most likely to surface anything
the manual review in this environment couldn't catch.

## Connecting real providers

| Provider | Env vars | What happens when set |
|---|---|---|
| Stripe | `PAYMENT_PROVIDER_KEY`, `PAYMENT_WEBHOOK_SECRET` | Checkout redirects to Stripe; point a Stripe webhook at `/api/checkout/webhook` |
| Resend | `EMAIL_PROVIDER_KEY`, `EMAIL_FROM` | Verification, order, and support emails send for real |
| S3-compatible storage | `STORAGE_PROVIDER=s3`, `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, optional `STORAGE_ENDPOINT` | Developer file uploads and licensed downloads work end to end |
| Telegram | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID` | Admin gets notified of key events |

Swapping any of these for a different provider means writing one new class
against the existing interface in `src/server/{payments,email,storage}/provider.ts`
and registering it in `src/server/bootstrap.ts` — no call site elsewhere
changes.

## Security notes

- Passwords: Argon2id, never logged or stored in plaintext.
- Sessions: opaque tokens, only the SHA-256 hash is persisted.
- 2FA: RFC 6238 TOTP implemented on `node:crypto` with no external
  dependency; login is a two-step password-then-code flow using a
  short-lived signed token (`jose`) to link the steps without creating a
  session before the second factor is checked; backup codes are hashed at
  rest and single-use.
- Every privileged route checks permission server-side; the admin layout's
  role banner is UX only, never the actual boundary.
- Ownership is checked explicitly everywhere a record is loaded by ID —
  no object is reachable by knowing its ID alone.
- Payment success is only accepted from a signature-verified webhook, and
  the webhook handler ignores event types it doesn't explicitly recognize
  rather than treating anything-not-a-failure as a success.
- A user cannot change their own role/status via the admin API.
- Uploaded files are validated by extension and size before storage.

## Fixes from the latest recheck pass

A dedicated recheck pass (static analysis only — still no compiler
available in this environment) found and fixed these real issues:

1. **Next.js version mismatch.** `package.json` pinned Next 15, but every
   route and page in the codebase used Next 14's synchronous `params`,
   `searchParams`, and `cookies()` APIs (Next 15 made these async). Rather
   than hand-convert ~20 files without a compiler to verify against, the
   dependency is now pinned to Next 14.2.15, matching the code as written.
2. **17 files referenced `React.FormEvent` / `React.ReactNode` as a type
   without importing React**, which fails to compile under `isolatedModules`.
   Added `import type React from "react"` to each.
3. **`instrumentation.ts` was at the repo root**, but this project uses a
   `src/` directory — Next.js requires it at `src/instrumentation.ts` in
   that case, or it is silently never loaded. This would have meant every
   provider adapter (Stripe/Resend/S3) stayed "unconfigured" even with
   correct credentials set. Moved to `src/instrumentation.ts`.
4. **Stripe webhook signature header mismatch.** The webhook route read a
   made-up `x-payment-signature` header; Stripe actually sends
   `Stripe-Signature`. Every real webhook would have failed verification.
   Fixed to read `stripe-signature`.
5. **Hardcoded Stripe `apiVersion` literal** in the Stripe adapter risked a
   type mismatch against the pinned SDK version's exact expected literal.
   Removed it; the SDK's own compiled-in default is used instead.
6. **Prisma `Json` field type mismatches.** Both the webhook route's
   `Payment.metadata` and the shared `recordAuditLog()` helper passed
   loosely-typed objects (`unknown`-containing records, `object`) directly
   into fields typed `Prisma.InputJsonValue`, which is stricter than that.
   Both now round-trip through `JSON.parse(JSON.stringify(...))` before
   being cast.
7. **Fragile enum casting** in the marketplace filter query
   (`Prisma.EnumProductPlatformFilter["equals"]`) was replaced with the
   standard, lower-risk direct cast to the Prisma enum type
   (`as ProductPlatform`).

None of this changes what was said before: this is thorough manual review,
not a compiler run. Treat `npm run typecheck` in a real environment as the
next real checkpoint, not a formality.
