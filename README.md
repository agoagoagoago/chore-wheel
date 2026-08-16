# Chore Wheel

A fast, local-first chore wheel: add household chores, spin to pick one at random, or assign chores to people (with an optional Fair Rotation), then save, share, print or copy the result. Built to be the most useful result for “chore wheel” searches — the tool sits at the top of every page and the supporting content is written to be read, not to pad word counts.

- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4. No database, auth, CMS or state library.
- **Rendering:** every route is statically prerendered. Only the wheel/chart widgets hydrate on the client.
- **Data:** everything the visitor enters stays in `localStorage`. Share links carry the wheel in the URL hash.
- **Tests:** Vitest (domain logic) + Playwright (end-to-end, desktop and mobile).

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: fill in domain, contact email, etc.
npm run dev                  # http://localhost:3000
```

Other scripts:

| Script               | What it does                                                          |
| -------------------- | --------------------------------------------------------------------- |
| `npm run build`      | Production build (`next build`)                                       |
| `npm start`          | Serve the production build                                            |
| `npm run lint`       | ESLint (next/core-web-vitals + typescript)                            |
| `npm run typecheck`  | `tsc --noEmit`                                                        |
| `npm test`           | Vitest unit tests (`src/**/*.test.ts`)                                |
| `npm run test:e2e`   | Playwright tests (`tests/e2e`). Runs `next start` on port 3111 itself. Needs a build first and `npx playwright install chromium` once. |
| `npm run check`      | lint + typecheck + unit tests + build                                 |

## Project layout

```
src/
  config/site.ts            SITE_NAME, SITE_URL, CONTACT_EMAIL, ADSENSE_PUBLISHER_ID, FATHOM_SITE_ID, GA_MEASUREMENT_ID, LIMITS
  app/                      Routes (all static): /, /chore-wheel-for-kids, /family-chore-wheel,
                            /roommate-chore-wheel, /chore-list, /weekly-chore-chart, /about, /contact,
                            /privacy, /terms, /cookies, sitemap.ts, robots.ts, ads.txt/route.ts,
                            opengraph-image.tsx, icon.svg, not-found.tsx
  lib/
    chores/                 data.ts (canonical chore library), templates.ts, categories.ts, types.ts
    wheel/                  random.ts (selection), geometry.ts (SVG math), state.ts (reducer + validation)
    assign/                 assign.ts (assignment + Fair Rotation + text/CSV formatting)
    share/codec.ts          share-URL encode/decode/validate
    storage/                primitives.ts (safe localStorage), store.ts (useSyncExternalStore store), local.ts (keys, stores)
    analytics/index.ts      track() abstraction (Fathom / GA4; no-op unless configured; never sends user text)
    seo.ts                  pageMetadata() helper
  components/
    wheel/                  ChoreWheelApp (client root), WheelSvg, ChoreEditor, WheelResult, SpinHistory, WheelOptions, hooks
    assignments/            AssignmentPanel, AssignmentTable, PrintSheet
    templates/              TemplatePicker
    saved/                  SaveSharePanel
    library/                ChoreLibraryBrowser (the /chore-list widget)
    chart/                  WeeklyChart
    ads/AdSlot.tsx          AdSense-ready placement (renders nothing until configured)
    content/                Server-rendered content helpers (Section, TemplateCards, LegalPage, WithSidebarAd)
    layout/                 Header, Footer, Breadcrumbs
    seo/JsonLd.tsx
    ui/                     Button, Toggle, Toast, PrintPortal
tests/e2e/                  Playwright specs
```

## How things work

### Chore data and templates

`src/lib/chores/data.ts` is the single source of truth: ~100 chores with stable ids, category, typical frequency, effort, kid-friendliness and the youngest age group they usually suit. Templates (`templates.ts`) reference chore **ids**, never strings, so renaming a chore updates every template, the library page and share links. Pages and the wheel read from this data; don't hard-code chore names in components.

To add a chore: append to `CHORES` with a new kebab-case id. To add a template: add to `TEMPLATES` with the ids it should contain; it appears in the template picker automatically. Ids are part of saved wheels and share links, so don't rename existing ids.

### Wheel selection and animation

`selectWinner(items)` (`lib/wheel/random.ts`) picks the winner first using `crypto.getRandomValues` with rejection sampling (uniform), falling back to `Math.random`. `targetRotation()` (`geometry.ts`) then computes a CSS rotation that lands that segment under the pointer; the animation is a single CSS `transform` transition, so it can't influence the result and causes no layout shift. `prefers-reduced-motion` skips the animation and announces the result immediately.

### Assignment mode and Fair Rotation

`assignChores(people, items, { fair, history })` hands out every chore once before repeating and balances counts. With `fair` on, it uses recent assignment history (stored locally as person/chore/timestamp) and a regret-based greedy: the person with the biggest gap between their best and second-best option is assigned first, so someone who badly needs to avoid a chore gets priority. Scores decay with age (~half after two weeks). It reduces repeats; it makes no mathematical guarantee — the UI says so.

### Persistence

`lib/storage/store.ts` provides `createLocalStore(key, defaults, normalize)`, a tiny external store read via `useSyncExternalStore`. Server and hydration renders see deterministic defaults; the saved value is swapped in after hydration. Every read goes through a `normalize` function that turns arbitrary JSON into a valid shape, so corrupted or malicious storage can't crash the app. Storage keys are namespaced `chorewheel:v1:*`. If storage is unavailable (private mode / blocked), the app works in memory and says so.

### Share URLs

`lib/share/codec.ts` encodes `{ title, chores, people, options }` as compact JSON → base64url in the **hash** (`/#w=…`). Library chores are stored as `#id`, so a typical wheel is a couple of hundred characters. Hashes are never sent to the server and never indexed, so shared wheels can't create duplicate pages. Decoding validates types and enforces `LIMITS` (100 chores, 20 people, 60 chars per name, ~6 KB payload) and never throws. Other hash parameters: `#t=<templateId>` loads a template; `#add=<id,id,…>` merges library chores (used by the chore-list page).

### AdSense

`AdSlot` renders **nothing** until `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` is set (or `NEXT_PUBLIC_ADS_PLACEHOLDERS=true` for layout checks). Each slot reserves a fixed min-height so ads never shift content. Placements: after the tool (`*-after-tool`), mid-content on the home page, end of long pages, and a desktop sidebar on `/` and `/chore-list` (`WithSidebarAd`, which doesn't render the column at all when ads are off). None sit near the spin button or between wheel controls.

To go live: set the publisher id, then in `AdSlot.tsx` replace the reserved `<div>` with the `<ins class="adsbygoogle">` markup and load the AdSense script (e.g. via `next/script` in `layout.tsx`). `/ads.txt` (`src/app/ads.txt/route.ts`) automatically emits the correct `google.com, pub-…, DIRECT, f08c47fec0942fa0` line once the id is set — until then it serves a comment only. **Before enabling personalised ads, check the current Google consent (CMP) requirements for the EU/UK/other regions and add a certified consent banner**; the privacy and cookie pages already describe this.

### Analytics

`track(event)` in `lib/analytics/index.ts` is a no-op unless a provider is configured. Production uses **Fathom Analytics** (`NEXT_PUBLIC_FATHOM_SITE_ID`, cookieless; `layout.tsx` loads `cdn.usefathom.com/script.js` and events go to `fathom.trackEvent`). GA4 is also supported via `NEXT_PUBLIC_GA_MEASUREMENT_ID` if ever wanted. Events carry counts and flags only (`wheel_spin`, `chore_added`, `template_selected`, `assignment_generated`, `fair_rotation_enabled`, `share_created`, `print_clicked`, `saved_wheel_created`, `library_add_to_wheel`) — never names or chore text. Analytics failures are swallowed.

### Site metadata

`src/config/site.ts` reads `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`, etc. `SITE_URL` drives canonicals, Open Graph URLs, sitemap and robots. `lib/seo.ts#pageMetadata()` gives every page a unique title/description/canonical. The OG image is generated at build time (`app/opengraph-image.tsx`); replace with a designed image when you have one. `next.config.ts` redirects `/chore-wheel` and `/wheel-of-chores` to `/` so those URLs work without duplicating the page.

## Deploying

Any Node host works; the app is fully static. On Vercel: import the repo, set the `NEXT_PUBLIC_*` variables, deploy. See `SEO-CHECKLIST.md` for the post-launch list.

## Owner to-do (values not invented)

- `NEXT_PUBLIC_SITE_URL` (real domain), `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_CONTACT_EMAIL`
- Replace `OWNER_TO_SET_DATE` on the privacy/terms/cookies pages and review that copy with your own advice
- Add a sentence about who maintains the site on `/about`
- `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` only after AdSense approval (Fathom is already configured via `NEXT_PUBLIC_FATHOM_SITE_ID`)
- Optional: designed favicon/OG image
