# Rain Store

A small internal Next.js app that lets new hires at Rain swap their default
laptop for a different option. Submissions land in a Google Form (or any
configured email / form backend).

- **Default standards** (read-only reference on the page):
  - MacBook Air · Operations
  - MacBook Pro · Engineering
- **Choosable alternatives** (grouped into Mac / Windows dropdowns):
  - MacBook Air 13" · M3
  - MacBook Pro 14" or 16" · M4 Pro
  - Microsoft Surface Laptop · Snapdragon X Elite
  - Lenovo ThinkPad P1 Gen 8

Whole page is gated by a shared password (HTTP-only signed cookie, 30-day
session). Submissions go through `/api/submit` which can fan-out to any of:
Resend, a Google Form, or a generic JSON form endpoint.

## Local dev

```sh
cp .env.example .env.local
# fill in STOREFRONT_PASSWORD + STOREFRONT_SESSION_SECRET, plus one delivery option
npm install
npm run dev
```

Open <http://localhost:3000>, enter the password from `.env.local`, pick a
laptop, fill in shipping details, submit.

## Environment variables

See [`.env.example`](./.env.example). At minimum you need:

| Variable | Purpose |
|---|---|
| `STOREFRONT_PASSWORD` | Password shared with new hires |
| `STOREFRONT_SESSION_SECRET` | Used to sign the session cookie (generate with `openssl rand -base64 32`) |

Then pick **one** of:

- **Google Form** — `STOREFRONT_GOOGLE_FORM_URL` + per-field `STOREFRONT_GOOGLE_FORM_ENTRY_*` mappings.
- **Resend** — `STOREFRONT_RESEND_API_KEY` + `STOREFRONT_NOTIFY_EMAIL` (and optional `STOREFRONT_FROM_EMAIL`).
- **JSON form endpoint** (Formspree etc.) — `STOREFRONT_FORM_ENDPOINT`.

If you configure more than one, every successful sender counts as a success.

## Deploying to Vercel

1. Import this repo on [vercel.com/new](https://vercel.com/new).
2. Add the same env vars from `.env.local` in **Project → Settings → Environment Variables**.
3. (Optional) attach a custom domain.

Catalog data lives in [`src/lib/catalog.ts`](./src/lib/catalog.ts) — edit
specs / add models there.
