# BazaarNow — SEO Ranking Plan

**Target:** `bazaarnow.net` (www canonical) · **Goal:** organic traffic growth · **Market:** Pakistan
**Data window:** 2026-07-12 → 2026-10-10 (90 days)
**Sources:** Google Search Console (`sc-domain:bazaarnow.net`), SE Ranking Data API (PK), live SERP pull, local source code

---

## 1. Where you actually stand

| Metric | 90-day value |
|---|---|
| Clicks | **85** |
| Impressions | **3,259** |
| CTR | **2.61%** |
| Average position | **12.8** |
| URLs in sitemap | **~1,979** |
| Referring domains | **1** |
| Domain InLink Rank | **3 / 100** |

**Pakistan is the whole business:** 74 clicks / 2,488 impressions (76% of impressions), avg position 13.1, CTR 2.97%. Everything else is noise.

**Two numbers side by side tell the story:**

- Impressions grew **~15/day in July → ~55–90/day in October** (3–5×).
- Clicks stayed flat at **1–3/day**.

You are earning visibility and converting almost none of it. This is not a "get more traffic" problem yet — it's a "convert the visibility you already have, then widen it" problem.

**The ceiling nobody mentions:** 1,979 indexed URLs produced 85 clicks. That's **0.043 clicks per page per 90 days**. Roughly 99% of your catalogue is invisible. Adding page 2,000 does nothing.

---

## 2. Diagnosis — three binding constraints, in order

### Constraint A — No authority at all

1 referring domain. 2 backlinks. InLink Rank 3/100.

You cannot outrank `daraz.pk` (a live SERP check for *desi ghee price in pakistan* shows daraz at #2) on head terms, and you shouldn't try. But the SERPs you *can* win are staffed by small D2C stores — `adamsestore.com`, `achhaemart.com`, `alfatah.pk`, `thalnaturals.com`, `fieldnfeather.com` — none of which are authority monsters. This is winnable, but only with real links, not more pages.

### Constraint B — Index bloat drowns your good pages

1,979 URLs, ~85 clicks. ~1,516 of those are product pages, competing with each other for the same thin, near-duplicate supplier copy. Crawl budget and internal-link equity are spread across 1,516 near-identical pages while your 8 category pages and 8 blog posts — the pages that can actually rank — get scraps.

Evidence of the waste, straight from GSC:

- `cartier-style-rectangular-analog-watch…` — **102 impressions, 1 click** (position 10.0, CTR 0.98%)
- `laban-infant-milk-formula…` — **118 impressions, 3 clicks** (position 7.7)
- `gluta-white-night-cream…` — 25 impressions, 1 click (position 34.6)

You are ranking *on page one* for real commercial queries and converting under 1% of them.

### Constraint C — Snippets don't earn the click

Position 7.7–10 with 1–3% CTR is below what those positions normally deliver (typically 4–8%). Combined with:

- **No star ratings in the SERP.** Product and Merchant listing rich results are valid and passing, but Google reports them **missing `aggregateRating` and `review`** — so your listings show a price with no stars, directly suppressing CTR at exactly the positions where you sit.
- **Truncated slugs, live in production.** Real indexed URLs end mid-word: `…quartz-wrist-`, `…party-decoration-kit-for-labub`, `…moisturizing-gel-socks-cracked-de`. The cause is truncated product filenames in `data/products/` (imported at ~80 chars), not `slugify()` — see `src/lib/utils.ts:30` for the correct implementation.
- **`/search/`, `/cart/`, `/checkout/` are all indexable.** There is **no `noindex` directive anywhere in `src/`**. `next-sitemap.config.js` excludes them from the sitemap, but internal links still let Google crawl them. This is the likely source of junk queries in GSC (`2`, `algo similar?`, `/proshot`, `back photo`, `ai54089`, `a9por`).

### The opportunity hiding in plain sight

Your GSC query list is full of queries that are **low-volume, low-difficulty, and already ranking** — just badly:

| Query (GSC, 90d) | Impr | Your position |
|---|---|---|
| bleu de chanel perfume price in pakistan | 4 | 46.2 |
| bleu de chanel | 12 | 84.4 |
| always cotton soft pads price in pakistan | 2 | 28 |
| apple hair color 500ml price in pakistan | 1 | 47 |
| baellerry wallet | 2 | 50.5 |
| balisi wallet price in pakistan | 2 | 19.5 |
| barkat ghee price in pakistan | 1 | 28 |

And SE Ranking confirms these are **genuinely winnable**:

| Keyword | Vol/mo | Difficulty | CPC |
|---|---|---|---|
| desi ghee price in pakistan | **990** | **5** | $0.01 |
| nitrile gloves price in pakistan | **170** | **4** | $0.01 |
| bleu de chanel price in pakistan | 80 | 5 | $0.03 |
| wall clock price in pakistan | 60 | 5 | $0.01 |
| cartier watch price in pakistan | 40 | 23 | $0.01 |

> **Caveat on SE Ranking here:** 15 of 20 keywords I tested returned no data at all in the `pk` database. The PK index is sparse — treat SE Ranking volumes as directional and use **GSC as your keyword source of truth** (it has real impressions from real Pakistanis). SE Ranking's value for you is *rank tracking, competitor discovery, and backlink monitoring*, not keyword discovery.

---

## 3. The strategy in one line

**Stop competing on 1,516 thin product pages. Win a repeatable, low-difficulty "[product] price in Pakistan" pattern with ~30 strong money pages and category hubs, prove you can rank, then buy authority with links.**

---

## 4. Phase 0 — Stop the leaks (Week 1–2, no new content)

These are all fixes, not strategies. Do them first because everything else is built on top.

### 0.1 Kill index bloat
- [ ] Add `robots: { index: false, follow: true }` to metadata for `/search/`, `/cart/`, `/checkout/` (`src/app/search/page.tsx`, `src/app/cart/page.tsx`, `src/app/checkout/page.tsx`). **This is the single highest-value one-hour fix in this document.**
- [ ] Add `Disallow: /search`, `/cart`, `/checkout` to `next-sitemap.config.js` `robotsTxtOptions.policies` (currently `allow: "/"` blanket).
- [ ] In GSC, use the URL Inspection tool on the junk-query URLs to confirm they're search pages. Then let the noindex de-index them naturally.
- [ ] Decide the fate of the ~1,516 product pages. Do **not** delete them wholesale (they earn some long-tail). Instead: add `noindex, follow` to products with zero impressions over 90 days, so equity flows to the ones that work. Revisit in 90 days.

### 0.2 Fix what's broken in production
- [ ] **`src/app/about/page.tsx:130`** builds an email from the domain: `hello@www.bazaarnow.net`. Should be `omee00@gmail.com` per `data/site-config.json`. Copy-paste bug, user-facing on the About page.
- [ ] **`/shop/` does not exist** in `src/app/` (verified: routes are `about, blog, cart, category, checkout, contact, offers, privacy, product, returns, search`). GSC has it queued as "URL is unknown to Google". Find and remove whatever links to `/shop/`.
- [ ] **Delete the committed `out/` folder from git — its `.pk` URLs point at a stranger's domain.** It is a stale build: its `robots.txt` reads `Host: https://bazaarnow.pk` and its `sitemap.xml` contains **1,530 URLs all on `bazaarnow.pk`**. Confirmed: `bazaarnow.pk` is **not yours** — it is an empty LiteSpeed directory listing owned by someone else. It is **not live** (Vercel runs `npm run build` per `vercel.json`; `next.config.ts` has no `output: "export"`), so no current damage. But if anyone ever switches this project to static export, you would publish a robots.txt and sitemap pointing Google at a third party's domain. Add `out/` to `.gitignore` and delete it from the repo.
- [ ] **Fix the truncated slugs** for future imports. `data/products/*.json` filenames are cut at ~80 chars mid-word. Fix the import script, then migrate existing slugs **with 301 redirects** — do this as one careful batch, not piecemeal, or you'll break the few rankings you have.

### 0.3 Verify the crawler can actually reach you
- [x] **RESOLVED — Googlebot is not affected. Keep the Vercel challenge enabled.** My curl requests got HTTP 429 from Vercel's Security Checkpoint, but that is the feature working as intended against a non-browser client. GSC URL Inspection (8 URLs, run 2026-10-10) shows the homepage **last crawled 2026-10-09** and every product, contact and category page `PASS / Submitted and indexed`, with **zero fetch issues**. **Do not disable bot protection** — this is an ecommerce site with 1,500+ products and scrapers are a real threat. If you ever do need to whitelist crawlers, use Vercel Firewall's verified-bot bypass rather than turning the challenge off.
- [ ] Still worth eyeballing `https://www.bazaarnow.net/robots.txt` in your own browser to confirm the deployed file is not a stale `.pk` copy (see 0.2). Hygiene check, not an emergency.

### 0.4 Make the pages you already rank with earn clicks
- [ ] **Add star ratings and complete the Merchant listing fields.** *Correction to the first draft of this plan: your rich results are not broken.* GSC confirms `Product snippets`, `Merchant listings` and `Breadcrumbs` are all detected and **`PASS`** on product pages. The real gaps are the warnings Google reports on every product page:
  - `Product snippets` → **missing `aggregateRating` and `review`** — this is why no star ratings show. Stars are the single biggest CTR lever you're leaving on the table at positions 7–10, where you currently convert ~1%.
  - `Merchant listings` → missing `validFrom`, `hasMerchantReturnPolicy`, `shippingDetails` — these unlock Google's shipping/returns annotations in free listings.
  Add `aggregateRating`, `review` and the three merchant fields to the existing `Product` JSON-LD in `src/app/product/[slug]/page.tsx`. You have the order volume to justify real review collection — start there rather than inventing ratings.
- [ ] **Rewrite titles for the 20 pages with the most impressions and worst CTR.** Formula: `{Product} Price in Pakistan — Rs. {price} | Free Delivery`. You have the data to do this; sort your GSC page export by impressions and start at the top.
- [ ] Fix the blog post `how-to-pay-with-jazzcash-online-pakistan` — Google says "Crawled — currently not indexed" (65 impressions, 2 clicks). Thin/duplicate signal. Expand it with real JazzCash/EasyPaisa steps, fees, screenshots, and a FAQ.

---

## 5. Phase 1 — Own the "price in Pakistan" pattern (Week 2–6)

This is your growth engine. Difficulty 4–5 means you can rank without authority — which is the only kind of keyword you should chase right now.

### 5.1 Build 30 "money pages", not 30 blog posts

For each target product, build a single strong commercial page that answers the query directly and beats the small D2C stores. Target the top ~30 products by GSC impressions.

Each page must have:
- Title: `{Product} Price in Pakistan — Rs. {price} | BazaarNow`
- First 100 words: the actual price, the delivery time, the COD terms. Answer first.
- A real **price-comparison table** (your price vs. typical market range) — this is what earns the click and what AI Overviews quote.
- Product + Offer + FAQ schema
- 3–5 internal links to the matching category hub and related products
- Review/rating signal if you have any (even a WhatsApp-order count builds trust)

**Priority targets** (highest GSC impressions, winnable positions):

| Product | GSC impressions | Current position | Action |
|---|---|---|---|
| Cartier-style watch | 102 | 10.0 | P1 — 1 click from 102 impressions is the biggest single leak |
| Laban infant milk formula | 118 | 7.7 | P1 — highest-impression page on the site |
| Etude Real loose powder | 35 | 9.4 | P1 |
| FDM men's underwear | 35 | 7.5 | P1 |
| Gluta White night cream | 25 | 34.6 | P2 — needs content, not just a title |
| Adjustable back support belt | 27 | 13.6 | P2 |
| Tea Town cardamom tea | 22 | 31.0 | P2 |
| Barkat buffalo desi ghee | 12 | 12.3 | **P0 — see below** |

### 5.2 The desi ghee play (your single best keyword)

`desi ghee price in pakistan` — **990 searches/month, difficulty 5**. You already rank ~28 for `barkat ghee price in pakistan` and you sell Barkat buffalo desi ghee.

The SERP has an **AI Overview**, review snippets, People Also Ask, images and video. Daraz is at #2 but positions 4–11 are held by small D2C stores. This is the most winnable high-volume commercial query available to you.

Build a dedicated **"Desi Ghee Price in Pakistan (2026)"** buying guide — a hub, not a product page:
- Real price table across brands (Barkat, Dalda, Sufi, Kashmir) and sizes, with a stated "last updated" date
- How to spot adulterated ghee
- Your own products linked with descriptive anchors
- FAQ answering the People Also Ask questions verbatim
- FAQPage + Article schema, and aim to be the source the AI Overview cites

Then: `nitrile gloves price in pakistan` (170/mo, diff 4), `wall clock price in pakistan` (60/mo, diff 5), `cartier watch price in pakistan` (40/mo, diff 23 — harder, worth it).

### 5.3 Suppress the noise
- [ ] India sends **188 impressions and 1 click** at position 11.3. You don't ship to India. Either add `IN` geotargeting exclusion guidance or accept it, but stop optimising for it — check whether it's bleeding crawl budget from PK pages.
- [ ] Stray impressions from Argentina, Brazil, Bulgaria, Barbados at positions 5–8 with zero clicks are brand-name collisions on the generic phrase "bazaar now". Ignore them.

---

## 6. Phase 2 — Build topical authority (Week 4–12)

### 6.1 Make the 8 category pages into real hubs

You have 1,516 product pages and only 8 category pages. The categories should be your ranking surface for mid-tail terms; right now they're thin. For each of the 8 categories:
- 800–1,200 words of genuinely useful buying guidance (not filler)
- A "Top 10 [category] in Pakistan" ranked list with prices
- Links down to the best 20 product pages, and up to the relevant blog posts
- `BreadcrumbList` + `ItemList` schema

### 6.2 Build the content cluster you've started

You have **8 blog posts**, all broad "buy X online Pakistan" topics. That's the right instinct but too shallow to rank against established PK ecommerce blogs. From `keywords.csv` / `used-keywords.md` you have a queue — extend it into clusters:

- **Payment cluster** (you have the JazzCash post): EasyPaisa vs JazzCash fees, how to pay COD safely, refund process, scam avoidance
- **Price cluster**: the "[category] price in Pakistan 2026" series — one per category
- **Trust cluster**: is online shopping safe in Pakistan, how to spot fake products, how to check a seller

Each post: 1,200–1,800 words, FAQ section, real numbers, your `References/` voice files. Internal-link every post to its category hub and to 2–3 money pages.

**Cadence:** 2 posts/week. At 8 posts you're invisible; at 40 you have topical authority. This is a 4-month commitment, not a sprint.

---

## 7. Phase 3 — Authority (Month 2–6, runs in parallel)

With InLink Rank 3 and 1 referring domain, nothing else you do will reach its ceiling until this moves.

**Do:**
- Pakistani business directories, local chamber of commerce, PSEB registration
- Supplier/brand pages — if you stock Barkat, Etihad, Kryolan, Masarrat Misbah products, ask for a stockist listing
- Digital PR: the desi ghee adulteration angle, or "what Pakistanis actually pay for X" data stories built from your own order data
- Relevant PK ecommerce/startup press and founder interviews
- Merchant/trust badges you legitimately qualify for

**Don't:** buy bulk links, guest-post farms, PBNs. At your size a single manual action is fatal.

**Realistic target:** 15–25 referring domains in 6 months. Enough to rank the long tail, not enough to fight Daraz.

---

## 8. Phase 4 — Measurement

Set these up now so you can tell whether any of this worked.

- [ ] **Create the SE Ranking project for `bazaarnow.net`** — it doesn't exist yet. Add the PK Google engine, import your keyword list, enable daily checks. (Note: your SE Ranking subscription **expires 2026-10-15** — renew first. 66,018 of 100,000 units remain.)
- [ ] Commit to tracking these 8 KPIs monthly: PK clicks, PK impressions, PK CTR, impressions at position ≤10, indexed pages, referring domains, money-page count, blog post count.
- [ ] **North-star metric for the next 90 days: PK CTR at positions 4–10.** It's 2.97% now. Getting it to 6% doubles your traffic with zero new pages.
- [ ] Re-audit in 30 days: re-run the same GSC queries and diff.

---

## 9. Priority summary

| # | Action | Impact | Effort | When |
|---|---|---|---|---|
| 1 | noindex `/search`, `/cart`, `/checkout` | High | 1 hr | Week 1 |
| 2 | Verify live robots.txt isn't `bazaarnow.pk` | Critical if broken | 5 min | Day 1 |
| 3 | Fix product rich results (price/review) | High | 1 day | Week 1 |
| 4 | Rewrite titles on top-20 impression pages | High | 1 day | Week 1 |
| 5 | Fix About-page email bug | Low | 5 min | Week 1 |
| 6 | Remove `/shop/` links; delete `out/` from git | Medium | 1 hr | Week 1 |
| 7 | 30 money pages for top-impression products | **Highest** | 3 wks | Weeks 2–5 |
| 8 | "Desi Ghee Price in Pakistan" hub | **Highest** | 2 days | Week 2 |
| 9 | 8 category hubs upgraded | High | 2 wks | Weeks 4–8 |
| 10 | Link building (directories → PR) | High (compounding) | ongoing | Month 2+ |
| 11 | Blog to 40 posts, 2/wk | Medium (compounding) | ongoing | Weeks 3–20 |
| 12 | Prune/noindex zero-impression products | Medium | 1 day | Week 6 |
| 13 | Fix truncated slugs + 301s | Low | 2 days | Week 6+ |
| 14 | Find and remove `/shop/` link source | Low | 1 hr | Week 1 |

---

## 10. What not to do

- **Don't add more product pages** until the existing 1,516 are triaged. More thin pages makes Constraint B worse.
- **Don't chase Daraz on head terms** like "online shopping pakistan". You will lose, and the attempt wastes the crawl budget you need for winnable queries.
- **Don't buy links.** InLink Rank 3 with a manual action is a dead site.
- **Don't mass-rewrite slugs without 301s.** You'll lose the handful of rankings you have.
- **Don't trust SE Ranking's PK volumes alone.** 75% of the keywords I tested had no data. GSC is your truth.

---

## 11. Open questions — I need these answered to finish the plan

1. ~~Is `bazaarnow.pk` also yours?~~ **ANSWERED: no — and it is not a competitor either.** It is a bare, empty LiteSpeed directory listing (`Index of /`) on a Pakistani .pk domain, serving nothing at all. So there is **no duplicate-content risk and nothing to redirect**. The stale `out/` folder merely points at a stranger's empty hosting — a hygiene problem, not a strategic one. This removes the one open question that could have invalidated the plan.
2. **Are the 8 blog posts and 1,979 sitemap URLs currently live and current?** The local `out/` build is stale and lacks the blog entirely, so I could not verify the deployed state directly.
3. **Do you have any existing backlinks, social following, or supplier relationships** I should factor into the authority phase?
4. **Who is `bazaarnow.net` competing with in your mind** — Daraz, or the small D2C stores? It changes the whole strategy.

---

## 12. What success looks like

| Horizon | Realistic outcome |
|---|---|
| 30 days | Leaks closed. CTR at positions 4–10 up from 2.97% → 4–5%. Clicks ~4–6/day. |
| 90 days | 30 money pages + 8 hubs ranking. 15–25 clicks/day. Desi ghee hub in top 5. |
| 6 months | 40+ blog posts, 15–25 referring domains, top-3 for several "price in Pakistan" terms. 50–80 clicks/day. |

**The honest summary:** your problem is not traffic, it's conversion of existing visibility plus a total absence of authority. Fix the first in 2 weeks with code changes. Fix the second over 6 months with content and links. There is no third option, and adding pages is not one of them.
