# Cozy Hotels Maldives — Guest Guide

Guest information site for Cozy Hotels Maldives. Static HTML/CSS/JS, no build step.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | "Our Hotels" hub — links to each property |
| `cozy-nest.html` | Cozy Nest Fuvahmulah guest guide |
| `cozy-roots.html` | Cozy Roots Fuvahmulah guest guide |
| `cozy-arts.html` | Cozy Arts Dhangethi guest guide |
| `qr-codes.html` | Staff tool — printable QR codes linking to each property page |

Each property has its own dedicated page and QR code, independent of the others.
Guests scanning a room QR code land directly on that property's page.

## Run locally

No build tools needed — any static file server works:

```bash
python -m http.server 8934
```

Then open `http://localhost:8934`.

## Deploy — GitHub + Vercel

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/<your-org>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. **Connect Vercel**
   - Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
   - Framework preset: **Other** (static site — no build command, no output directory needed).
   - Deploy. Vercel gives you a `*.vercel.app` URL immediately; attach a custom domain under Project → Settings → Domains when ready.
3. **QR codes stay correct automatically** — `qr-codes.html` encodes whatever domain it's opened from, so the printed codes will point at your live Vercel/custom domain once you print them from the deployed site (not from localhost).

Every push to `main` auto-deploys via Vercel.

## Structure

```
assets/
  css/style.css     — shared design system (brand colors, type, components)
  js/icons.js       — inline SVG icon set, injected via [data-icon]
  js/qrcode.lib.js  — vendored QR generator (MIT, kazuhikoarase/qrcode-generator)
  js/qr.js          — renders QR codes into [data-qr] elements
  js/main.js        — mobile menu + back-to-top behavior
```

## Still to fill in

- Real property photos (currently colored placeholder blocks)
- Wi-Fi network names / passwords per property
- Exact check-in / check-out policy wording
- Restaurant menu link (currently `#`)
- Cozy Roots / Cozy Arts Instagram handles, if different from Cozy Nest's

## Content editing

Content currently lives directly in the HTML files. See the project conversation
for the plan to add a git-backed admin so non-developers can update hours, prices,
contacts and photos without editing code.
