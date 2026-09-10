# Cozy Hotels Maldives — Guest Guide

Guest information site for Cozy Hotels Maldives, with a password-protected
admin panel for updating hours, contacts, Wi-Fi, policies and photos —
changes appear on the live site immediately, no redeploy needed.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | "Our Hotels" hub — links to each property |
| `cozy-nest.html` | Cozy Nest Fuvahmulah guest guide |
| `cozy-roots.html` | Cozy Roots Fuvahmulah guest guide |
| `cozy-arts.html` | Cozy Arts Dhangethi guest guide |
| `qr-codes.html` | Staff tool — printable QR codes linking to each property page |
| `admin.html` | Password-protected content editor |

Each property has its own dedicated page and QR code, independent of the others.
Guests scanning a room QR code land directly on that property's page.

## How content editing works

- `/admin` is a password-gated page (`ADMIN_PASSWORD` below) with a form per property.
- Saving writes to a Postgres database via `/api/content` (a Vercel serverless function).
- Every guest page loads `assets/js/content-loader.js`, which fetches the latest
  values on page view and swaps them into hours, Wi-Fi, phone numbers, policies,
  notices, the menu link and photos.
- If the database isn't connected yet, or a request fails, the page simply shows
  the values already written into the HTML — nothing ever breaks or goes blank.

**Editable per property:** check-in/out & reception hours, dining hours, Wi-Fi
network/password, the policies line, the two notice boxes, the menu link, and
4 photos (hero, about, dining, transfers). **Editable site-wide:** the 3 phone
numbers and the Instagram link. Everything else (page structure, activities
list, island guide, section order) lives in the HTML/CSS and is a code change.

## Part 1 — Push this code to GitHub

You'll need a free [GitHub account](https://github.com/signup) if you don't have one.

1. On [github.com/new](https://github.com/new), create a new **empty** repository
   (no README/license/gitignore — this project already has them). Note its URL,
   e.g. `https://github.com/<your-username>/cozy-hotels-guest-guide.git`.
2. In this folder, run:
   ```bash
   git remote add origin https://github.com/<your-username>/cozy-hotels-guest-guide.git
   git push -u origin main
   ```
   (This repo is already initialized locally with one commit — this just connects
   and uploads it.)

## Part 2 — Deploy on Vercel

1. Sign up / log in at [vercel.com](https://vercel.com) (the free "Hobby" plan works),
   using **"Continue with GitHub"** so it can see your repos.
2. Click **Add New → Project**, select the repo you just pushed, and click **Import**.
3. Framework Preset: leave as **Other** — no build command, no output directory needed.
4. Before clicking Deploy, open **Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `SESSION_SECRET` | a random string — generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `ADMIN_PASSWORD` | the password you'll use to log into `/admin` |
5. Click **Deploy**. You'll get a live URL like `https://cozy-hotels-guest-guide.vercel.app`.

Every future `git push` to `main` auto-deploys.

## Part 3 — Connect the database (Postgres via Neon)

The admin panel works and logs in without this step, but **saving** needs a database.

1. In your Vercel project, go to **Storage → Create Database** (or **Marketplace**
   if Storage doesn't show it directly) and choose **Neon** (Postgres) — it has a
   free tier that's plenty for this site.
2. Follow the prompts to create the database and connect it to this project.
   Vercel will automatically add a `DATABASE_URL` environment variable — no
   copy-pasting needed.
3. Redeploy (Vercel usually prompts you to; otherwise **Deployments → ⋯ → Redeploy**).
4. Visit `/admin`, log in, and the badge at the top should switch from
   "No database yet" to "Database connected". Saved changes now persist and
   show up instantly on the guest pages for every visitor.

## Part 4 — Everyday use

- **Guests:** scan the QR code at their property → lands straight on that page.
- **Staff:** open `/qr-codes.html` on the *live* site (not localhost) and print —
  the codes always encode whatever domain they're opened from, so they'll be
  correct for your real Vercel/custom domain.
- **Editing content:** open `/admin`, log in with `ADMIN_PASSWORD`, edit, Save.

## Run locally (optional, for development)

Static preview only (no admin saving, since that needs the API + database):
```bash
python -m http.server 8934
```

To test the admin/API locally with a database, use the Vercel CLI:
```bash
npm install
npx vercel dev
```

## Structure

```
data/content/       — seed JSON per scope (site, cozy-nest, cozy-roots, cozy-arts);
                       also the fallback used whenever the database is empty/unset
lib/db.js            — reads/writes content (Postgres if configured, else the seed files)
lib/session.js       — signed-cookie admin session (no external auth dependency)
lib/readBody.js      — JSON body parsing helper for the API routes
api/content.js       — GET (public) / PUT (auth) content by scope
api/login.js         — checks ADMIN_PASSWORD, sets the session cookie
api/logout.js        — clears the session cookie
api/session.js       — reports whether the current visitor is signed in
assets/css/style.css — shared design system (brand colors, type, components)
assets/js/icons.js   — inline SVG icon set, injected via [data-icon]
assets/js/qrcode.lib.js — vendored QR generator (MIT, kazuhikoarase/qrcode-generator)
assets/js/qr.js      — renders QR codes into [data-qr] elements
assets/js/content-loader.js — overlays live content onto the guest pages
assets/js/admin.js   — admin panel login, forms, save
assets/js/main.js    — mobile menu + back-to-top behavior
```

## Still to fill in

- Real property photos — either paste image URLs into `/admin`, or replace the
  placeholder blocks in the HTML directly
- Exact check-in / check-out policy wording, if different from the current default
- Restaurant menu link — paste the URL into `/admin` once you have one
- Cozy Roots / Cozy Arts Instagram handles, if different from Cozy Nest's
  (currently the same Instagram link is used site-wide)
