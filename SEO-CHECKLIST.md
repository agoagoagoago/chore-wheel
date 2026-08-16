# SEO & launch checklist

What's already built in is marked ✅; the rest are actions for after the domain exists.

## Before launch

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real origin (no trailing slash). Canonicals, OG URLs, sitemap and robots all derive from it. Rebuild.
- [ ] Set `NEXT_PUBLIC_SITE_NAME` and `NEXT_PUBLIC_CONTACT_EMAIL`.
- [ ] Replace `OWNER_TO_SET_DATE` in `/privacy`, `/terms`, `/cookies`; add the maintainer sentence on `/about`.
- [ ] Optional: replace the generated OG image (`src/app/opengraph-image.tsx`) and `src/app/icon.svg` with designed assets.
- [ ] `npm run check` and `npm run test:e2e` pass.

## Technical SEO (verify after deploy)

- ✅ Unique `<title>` and meta description per page (`pageMetadata()` in every route).
- ✅ One `<h1>` per page; logical h2/h3 hierarchy; content is in the static HTML (view-source, not just DevTools).
- ✅ Canonical on every page; `/chore-wheel` and `/wheel-of-chores` 308 → `/`.
- ✅ Wheel/template/share state lives in the URL hash only — no indexable query variants.
- ✅ `/sitemap.xml` lists exactly the 11 canonical pages; `/robots.txt` allows all and points at the sitemap.
- ✅ Custom 404 with links back to the tool.
- ✅ JSON-LD: WebSite + Organization (layout), BreadcrumbList on sub-pages. No FAQ/ratings/authors schema.
- [ ] Open the deployed site with JS disabled: heading, intro, chore list and content sections should be readable.
- [ ] Check `view-source:` of `/` for `<link rel="canonical">`, OG tags and the JSON-LD block; validate JSON-LD in Google's Rich Results Test / Schema validator.
- [ ] Confirm no accidental `noindex` (none is set anywhere; `pageMetadata({ noindex })` exists only for future use).

## Google Search Console

- [ ] Verify the property (DNS or HTML tag).
- [ ] Submit `https://<domain>/sitemap.xml`.
- [ ] URL-inspect `/`, `/chore-list`, `/chore-wheel-for-kids` and request indexing.
- [ ] After a couple of weeks: review Pages report for excluded/duplicate URLs; make sure only the 11 canonical URLs are indexed.

## Performance

- [ ] Run PageSpeed Insights on `/` (mobile) and `/chore-list`. Targets: LCP ≤ 2.5 s, INP < 200 ms, CLS < 0.1.
- ✅ System font stack (no web-font requests), inline SVG wheel (no images), CSS-only spin animation, no third-party scripts unless GA/AdSense are enabled.
- [ ] If enabling AdSense, re-run PageSpeed and check CLS — every `AdSlot` reserves its height, keep it that way.

## Content

- ✅ Pages map to distinct intents: main wheel, kids, family, roommates, chore list, weekly chart.
- [ ] Re-read each page after setting the site name; fix anything that reads oddly.
- [ ] Add new templates/chores through `src/lib/chores/` rather than new pages. Don't add near-duplicate keyword pages.

## Analytics

- ✅ Fathom Analytics via `NEXT_PUBLIC_FATHOM_SITE_ID`; `/privacy` and `/cookies` name it. Set the same var in Vercel production.
- ✅ Events never include user-entered text.

## AdSense (only when the site has real traffic and content is final)

- [ ] Apply with the live domain. Do **not** set a publisher id before approval.
- [ ] Verify the current Google consent / CMP requirements (EU/UK/Switzerland and any other regions you serve) and integrate a certified CMP before personalised ads.
- [ ] Set `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`; confirm `/ads.txt` now shows the `google.com, pub-…` line.
- [ ] Wire the ad tag into `AdSlot.tsx`; check every placement on mobile: nothing near the spin button, nothing that looks like part of the tool, no layout shift.
- [ ] Update `/privacy` and `/cookies` if the ad setup differs from what they describe.
