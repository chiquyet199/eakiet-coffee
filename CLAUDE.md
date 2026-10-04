# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Website of Hợp tác xã Nông nghiệp – Dịch vụ Công Bằng Ea Kiết ("HTX Công Bằng Ea Kiết", repo name eakiet-coffee) —
a coffee co-operative's B2B-leaning marketing site (products, process, news, certifications, quote/contact forms).
Astro 5 + Tailwind, built with the Cloudflare adapter and deployed to Cloudflare Workers via Wrangler.
Content is authored by non-developers through Decap CMS, which commits Markdown/JSON straight to `main`.

Note: `README.md` is the unmodified "Astro Blog Starter" template readme. It is stale — this is not a blog
starter, there is no MDX or RSS. Trust this file and the actual config over the README.

## Commands

```bash
npm run dev       # astro dev — localhost:4321
npm run build     # astro build → ./dist (includes dist/_worker.js)
npm run preview   # build, then serve through wrangler dev (real Workers runtime)
npm run check     # astro build && tsc && wrangler deploy --dry-run — the full gate; run before deploying
npm run deploy    # wrangler deploy (expects dist/ already built)
npm run cf-typegen # regenerate worker-configuration.d.ts from wrangler.json bindings
```

There is no test suite and no linter. `npm run check` is the only verification step; `tsc` runs under
`astro/tsconfigs/strict`, so type errors in `.astro` frontmatter will fail it.

Deploy is a two-step: `npm run build && npm run deploy` (the `deploy` script alone does not build).

## Architecture

**Rendering.** Every page is prerendered at build time — the dynamic routes (`src/pages/products/[...slug].astro`,
`src/pages/news/[...slug].astro`) use `getStaticPaths()`. The only server code is `src/pages/api/lead.ts`
(`prerender = false`), run by the Worker (`wrangler.json` points `main` at `dist/_worker.js/index.js`, with `dist`
bound as `ASSETS`). `public/.assetsignore` keeps Worker build artifacts out of the asset bundle. `/awards` is a
redirect to `/about#chung-nhan` (`redirects` in `astro.config.mjs`).

**Lead forms.** `LeadForm.astro` (variant `quote` on the homepage, `contact` on `/contact`) POSTs to `/api/lead`,
which checks a honeypot + Cloudflare Turnstile, inserts into D1 (`LEADS_DB`, schema in `migrations/`), then emails
`LEAD_NOTIFY_EMAIL` (from `src/data/site.json`) via the `LEAD_EMAIL` `send_email` binding, sender `LEAD_EMAIL_FROM`
(a `vars` entry in `wrangler.json`). Email failures are logged, never surfaced — the lead is already stored. The
recipient must be a verified destination in Cloudflare Email Routing on the sender's domain; locally, wrangler writes
the message to a `.eml` file and logs its path. `/admin/leads` (`src/pages/admin/leads.astro`, `prerender = false`)
lists leads; outside `astro dev` it requires a valid Cloudflare Access JWT (`src/utils/access.ts`, checked against the
`ACCESS_TEAM_DOMAIN` / `ACCESS_AUD` vars) and returns 403 while those are empty — it fails closed by design.
JS submits via fetch (JSON response); without JS the endpoint 303-redirects to `/cam-on` or back to `/contact?error=`.
Astro's CSRF origin check rejects POSTs without a matching `Origin` header, so test with `-H 'Origin: …'`.
Deep links prefill the contact form: `/contact?type=sample&product=<name>#lien-he`. Production setup:
`wrangler d1 migrations apply LEADS_DB --remote`,
`wrangler secret put TURNSTILE_SECRET_KEY` (or add it as a Secret in the dashboard). The public Turnstile site key is
in `src/utils/leads.ts`; `astro dev` swaps in Cloudflare's always-pass test key. Locally: `cp .dev.vars.example .dev.vars` and `wrangler d1 migrations apply LEADS_DB --local`.
Then create a Cloudflare Access self-hosted application for `<domain>/admin/leads*` and copy its team domain and AUD
tag into those vars. `npm run cf-typegen` uses `--strict-vars=false` so vars type as `string`, not literals.

**Content.** Four collections in `src/content/`, defined in `src/content/config.ts`:

| Collection | Type | Location | Notes |
|---|---|---|---|
| `products` | content (md) | `src/content/products/` | filtered by `published`, sorted by `order`; `productLine` (green/roasted/gift) switches the detail layout |
| `news` | content (md) | `src/content/news/` | filtered by `published`, sorted by `publishedDate` desc; `category` drives the filter tabs |
| `awards` | data (json) | `src/content/awards/` | `kind` = certification (homepage logos) / award / legal (About page) |
| `settings` | data (json) | `src/content/settings/home.json` | single file: hero slogan, metrics, process steps (Decap `files` collection) |

Enum values (product line, bean type, process method, news category, award kind) live in `src/utils/taxonomy.ts`
and are repeated as Decap `select` options — change both. `price` is optional; missing renders "Liên hệ báo giá".

Pages consistently call `getCollection('x', (e) => e.data.published)` and then sort — keep that pattern when
adding listing pages so unpublished drafts never leak.

**The CMS contract is the important coupling.** `src/content/config.ts` (Zod schema) and `public/admin/config.yml`
(Decap field definitions) describe the same frontmatter and must be changed together. Adding a field to the Zod
schema without adding the matching widget makes it uneditable; adding a required Zod field without a default
breaks the build as soon as the CMS writes a document without it. Two consequences already baked in:

- `images` is typed `z.union([z.string(), z.object({ image: z.string() })])` because Decap's list widget writes
  `- image: /path` objects while hand-written files use plain strings. Consumers must normalize both shapes
  (see the `imageList` mapping in `products/[...slug].astro`).
- Image fields are plain URL strings pointing at `/images/uploads/...` (Decap's `media_folder`/`public_folder`),
  rendered with a raw `<img>`. They are *not* Astro image assets, so there is no `astro:assets` optimization and
  no import-time validation that the file exists.

Decap uses the `git-gateway` backend against `main` with Netlify Identity (`public/admin/index.html`), so editor
saves land as commits like `Update Sản phẩm "arabica-premium"` directly on the main branch. Expect content files
to change outside of local work.

**Presentation.** `src/layouts/BaseLayout.astro` is the single layout and owns all `<head>` meta (canonical URL,
OpenGraph, Twitter card) — pass `title` / `description` / `image` props rather than emitting meta tags in a page.
Styling is Tailwind only. Brand palette (60-30-10) in `tailwind.config.mjs`: `coffee-*` (900 = #3E2723, 50 = cream
#FDFBF7 background), `leaf-*` (700 = #2E5A44, certifications/icons), `ripe-*` (500 = #D97724, CTA buttons only).
Headings use `font-serif` (Merriweather), body `font-sans` (Be Vietnam Pro), loaded from Google Fonts in BaseLayout;
`src/styles/global.css` sets the `bg-coffee-50` / `text-coffee-900` base. `src/utils/` holds `formatPrice`
(VND → `500.000 ₫` via `vi-VN`) and `formatDate` (long Vietnamese dates); use them instead of inline `Intl` calls.

## Conventions

- **The site is Vietnamese.** `<html lang="vi">`, all user-facing copy, CMS labels, and nav strings are in
  Vietnamese. Write new UI text in Vietnamese and match the existing tone.
- Imports are relative (`../../utils/formatPrice`). A `@/*` → `src/*` alias exists in `tsconfig.json` but is
  unused; follow the relative style unless converting the whole codebase.
- `public/sitemap.xml` is hand-maintained and lists only the top-level pages — product and news detail URLs
  are not in it. Adding a new top-level route means editing that file by hand.
- **Contact details have one source: `src/data/site.json`** (phone, Zalo, email, notify email, hours, tax code,
  representative, addresses, map location, social links), editable in Decap under "Cài đặt → Thông tin liên hệ &
  pháp lý". `src/utils/constants.ts` validates it with Zod at build time and derives `CONTACT.tel`, `ZALO_URL`
  (`zalo.me/84…` from the phone unless `zalo` is set) and `LEAD_NOTIFY_EMAIL`. Never hardcode a phone/email in a
  component — import from constants. Site name and hero video URL are still plain constants in that file.
