# Cozy Hotels Maldives — Guest guide

Responsive guest guides for Cozy Nest, Cozy Roots and Cozy Arts, with a shared hotel hub and password-protected content editor.

## Guest pages

- `/` — choose a hotel
- `/cozy-nest.html`, `/cozy-roots.html`, `/cozy-arts.html` — property guides
- `/qr-codes.html` — printable room QR codes
- `/admin.html` — staff content editor

The guides use a teal, photo-led layout with ten navigation tiles, opening hours, dining and diving cards, island highlights, WhatsApp requests, and expandable hotel information. Existing property-specific details are retained.

## Editing information and photos

1. Open `/admin.html` and sign in with the existing `ADMIN_PASSWORD`.
2. Choose a hotel or Shared contacts.
3. Edit the welcome/about text, dining and diving descriptions, hours, Wi-Fi, notices, island highlight labels, or the detailed guest information.
4. In Photo library, choose a JPG, PNG or WebP from your computer, or paste an HTTP(S) image URL. Preview it before saving. Uploaded images are resized to at most 1400 px and compressed to WebP. “Use default photo” restores the bundled sample for that slot.
5. Click **Save changes**. Reload the guest guide to see the update.

The initial photographs are sample Unsplash images, not verified photographs of these properties or island locations. Replace them with approved hotel photography before a public launch.

Saved text and compressed photos persist together in Neon Postgres. No image-storage subscription is required for this small fixed photo library. New photo uploads are limited to 220,000 data-URL characters (150,000 for gallery photos); a content document is capped at 3.5 MB. For a large gallery, use dedicated object storage instead.

Requests open WhatsApp with a prepared message; they do not send automatically. If no restaurant menu URL is configured, the menu button opens a request to the restaurant. Shared contact edits also update these links.

## Production configuration

Required Vercel environment variables:

- `DATABASE_URL` — valid Neon Postgres connection URL (automatically supplied by the integration)
- `ADMIN_PASSWORD` — staff sign-in password
- `SESSION_SECRET` — random secret for signed sessions

The `cozy-hotel-content` Neon Free resource is connected to this Vercel project. Redeploy after changing environment variables. Authentication uses an HttpOnly, SameSite cookie (Secure on Vercel). Public reads are allowed; writes require an authenticated session. Text is rendered without HTML interpretation and links/images are validated.

Content defaults are in `data/content/`. Database records overlay new defaults so existing saved content survives design/schema additions. In local development without a database, saves update these JSON files. Production rejects saves without a database.

## Local development

```powershell
npm install
$env:ADMIN_PASSWORD = 'choose-a-local-password'
$env:PORT = '4173'
npm run preview
```

Open `http://localhost:4173/cozy-nest.html` or `/admin.html`. The preview server uses the same API handlers and serves only public HTML/assets; environment files and internal code cannot be downloaded.

Alternatively, `npm run dev` runs Vercel's local environment. Never commit `.env` files.

## Checks

- `npm test` — data validation, safe merge behavior, and Neon array response handling.
- `node tests/guest-guide.cjs` — browser integration checks against a running local preview. Requires Playwright accessible to Node and Microsoft Edge. `TEST_URL` and `ADMIN_PASSWORD` can override the local test target/credentials. The test temporarily edits the local Cozy Nest seed and restores it afterward; use only a local preview with file storage.

Browser coverage includes three properties at desktop/mobile sizes, disclosures and keyboard navigation, hotel hub, rejected sign-in, authenticated editing, image upload, save/reload, unsafe URL rejection, and logout.

## Cozy Nest gallery and practical information

The guest layout expands up to 1,680 px on wide screens. Cozy Nest includes four gallery slots with a keyboard-accessible full-size viewer. In the editor, use **Photo library → Gallery1–Gallery4** to upload gallery images, and **Gallery title & captions** to edit their captions. Empty gallery slots reuse the current hero, about, dining and diving images.

**Practical guest information** contains currency, time, payments, room keys, clothing, laundry, diving school, excursions, property damage and tips. New fields are merged with saved database content; no existing records or photos need to be replaced.
