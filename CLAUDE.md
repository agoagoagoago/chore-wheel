@AGENTS.md

# Chore Wheel — project notes for Claude

Read this first when resuming. `README.md` explains architecture in depth; `SEO-CHECKLIST.md` tracks launch tasks. This file is the running log of decisions, environment and state.

## What this is

A production website at **https://chorewheel.co** — a local-first chore wheel (spin to pick a chore, assign chores to people with Fair Rotation, templates, save/share/print) plus a small set of supporting SEO pages. Owner: Adrian (GitHub `agoagoagoago`, contact `adrian@sqftai.co`, Singapore-based developer and father — bio is on `/about`).

## Stack & commands

- Next.js 16.3 (App Router, Turbopack), React 19, TypeScript, Tailwind v4. Fully static; no DB/auth/CMS/state library.
- `npm run dev` · `npm run check` (lint + typecheck + vitest + build) · `npm run test:e2e` (Playwright, builds must exist; server on port 3111) · `npm run icons` (regenerate favicons from `src/app/icon.svg`).
- Unit tests: `src/**/*.test.ts` (33). E2E: `tests/e2e/wheel.spec.ts` (12 scenarios × desktop + Pixel 7). All green as of last commit.
- Windows dev machine; the Bash tool mangles heredocs containing `'` or `\uXXXX` — write source files with the Write tool or small `node` scripts.
- Next 16 lint rules forbid setState-in-effect; persistence uses external stores + `useSyncExternalStore` (`src/lib/storage/store.ts`). Keep that pattern.

## Key architecture (see README for detail)

- `src/config/site.ts` — all owner values via `NEXT_PUBLIC_*` env (SITE_URL, SITE_NAME, CONTACT_EMAIL, FATHOM_SITE_ID, ADSENSE_PUBLISHER_ID, GA_MEASUREMENT_ID) + `LIMITS`.
- `src/lib/chores/data.ts` — canonical chore library (98 chores, stable ids); `templates.ts` (12 templates by id). Never rename ids (used in share links / saved wheels).
- `src/lib/wheel/` random (crypto RNG, winner chosen before animation), geometry (SVG), state (reducer + `normalizeState` validation).
- `src/lib/assign/assign.ts` — assignment + regret-based Fair Rotation.
- `src/lib/share/codec.ts` — share links in URL **hash** (`/#w=`), also `#t=<template>` and `#add=<ids>`; never query strings (no duplicate indexable URLs).
- `src/components/wheel/ChoreWheelApp.tsx` — client root; SEO pages pass `presetTemplateId`.
- Print: `PrintPortal` → `#print-root` in layout; print CSS hides everything else.
- `AdSlot` renders nothing until `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` set. `/ads.txt` route auto-emits the line once set.
- Analytics: `track()` in `src/lib/analytics/index.ts` → Fathom (`fathom.trackEvent`, names only) and optionally GA4. Never send user-entered text.

## Routes (all static, all in sitemap)

`/` (primary "chore wheel" intent), `/chore-wheel-for-kids`, `/family-chore-wheel`, `/roommate-chore-wheel`, `/chore-list`, `/weekly-chore-chart`, `/about`, `/contact`, `/privacy`, `/terms`, `/cookies`. Redirects: `/chore-wheel`, `/wheel-of-chores` → `/`. Do NOT add near-duplicate keyword pages; add chores/templates via `src/lib/chores/` instead.

## Deployment / infra state

- GitHub: `agoagoagoago/chore-wheel`, branch `main`. Every push auto-deploys; I also run `npx vercel deploy --prod --yes` for immediate deploys.
- Vercel: team "Adrian Goh's projects" (`team_yAT7GefQOTVBmoxZZAnjLd2q`), project `chore-wheel` (`prj_z1pqqDTFyMb9mtgasKMlA3OEu9jS`). Vercel CLI is logged in as agoagoagoago (`npx vercel`). The MCP `create_git_project` deploy step lacks permission — use CLI.
- Domain: `chorewheel.co` is primary (apex serves 200); `www.chorewheel.co` 308 → apex (fixed via API PATCH on project domains — previously the reverse, which broke Search Console sitemap fetch). Vercel default: `chore-wheel-adrian-goh-projects.vercel.app`.
- Production env vars set: `NEXT_PUBLIC_SITE_URL=https://chorewheel.co`, `NEXT_PUBLIC_FATHOM_SITE_ID=CUEPISZE`, `NEXT_PUBLIC_CONTACT_EMAIL=adrian@sqftai.co`. Not set: SITE_NAME (defaults "Chore Wheel"), ADSENSE_PUBLISHER_ID, GA_MEASUREMENT_ID.
- Search Console: property `chorewheel.co`, sitemap submitted (initially "Couldn't fetch" due to the www redirect — resolved). Bing Webmaster verification meta `msvalidate.01` is in `layout.tsx` metadata.verification.
- Lighthouse mobile on live `/`: Perf 99 / A11y 100 / BP 100 / SEO 100 (LCP 1.8s, CLS 0). External SEO audits (Aug 2026): 93/100 → fixed short trust-page titles; then 99/100 → fixed missing CSP header. Nothing outstanding from audits.

## SEO decisions already made

- All pages use absolute titles via `pageMetadata({ absoluteTitle: true })`, 37–57 chars, brand words included (trust pages were lengthened after an audit flagged them <30 chars — e.g. "About Chore Wheel – Who Made It and How It Works"). Descriptions ~140–160 chars.
- JSON-LD: WebSite + Organization (layout), BreadcrumbList (sub-pages), WebApplication (home). No FAQ/rating/author schema.
- Robots meta: index, follow, max-image-preview:large, max-snippet:-1.
- Home FAQ covers "make a chore wheel at home", "how many chores", synonym cluster (wheel of chores / chore picker / randomizer).
- Favicons: `favicon.ico`, `icon.png`, `icon.svg`, `apple-icon.png`, `manifest.webmanifest`.
- Security headers in `next.config.ts`: CSP (self + unsafe-inline + Fathom hosts incl. img-src for beacons; GA hosts auto-added if configured), HSTS preload, nosniff, referrer, frame options. Verify with `node scripts/csp-check.mjs [baseUrl]`. AdSense will need extra hosts.

## Open items / ideas for next time

- AdSense: apply only when there's traffic; then set publisher id, wire `<ins class="adsbygoogle">` in `AdSlot.tsx`, extend the CSP allow-list, add a CMP for EU/UK consent, re-check CLS.
- After a few weeks: review Search Console queries and tune copy; consider a designed OG image (currently generated in `opengraph-image.tsx`).
- Legal pages "Last updated: 16 August 2026" — bump when copy changes.
- Optional: submit chorewheel.co to hstspreload.org (header already qualifies).
- `scripts/` holds `gen-icons.mjs` (npm run icons) and `csp-check.mjs` (console CSP-violation probe; run against localhost:3111 after `next start` or against the live URL).
- Possible future adjacent tools (name picker, dinner wheel, cleaning schedule) — deliberately NOT built; keep topical focus on household chores.
