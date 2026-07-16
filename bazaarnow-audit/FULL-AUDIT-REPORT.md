# BazaarNow.net — Full SEO Audit Report
**Date:** July 13, 2026 | **Overall Health Score:** 65/100 | **1,964 Products**
**Audited by:** 6 SEO specialists (Technical, E-Commerce, Content/Schema, Performance, GEO, Schema/Sitemap)

---

## Executive Summary

BazaarNow has solid fundamentals (SSR, structured data, sitemap, mobile-responsive) but critical gaps in product schema, title tags, and image optimization are preventing it from ranking. The fastest path to page 1: fix product titles, add complete schema, and serve WebP images.

---

## Top 5 Critical Fixes (Highest ROI)

### 1. 🔴 CRITICAL: Fix Product Title Tags
**Impact:** 76.7% of products have titles >60 chars. Google truncates them — key keywords invisible.

**Current:** `${shortName} | Rs. X,XXX — Buy Online Pakistan` (~72-78 chars)
**Fix:**
```
${product.name.slice(0, 55)} — ${category} | BazaarNow
```
Move price to meta description. This puts product name first.

### 2. 🔴 CRITICAL: Add Missing Product Schema Fields
**Impact:** No product rich results (stars, price, availability) showing in Google.

**Missing:** `@id`, `url`, `mpn`, `aggregateRating`, `priceValidUntil`
**Fix:** 15 lines of code in `ProductDetailClient.tsx` schema section. Add rating, URL, MPN from SKU.

### 3. 🔴 CRITICAL: Add width/height to All Product Images
**Impact:** Every product image causes Cumulative Layout Shift — hurts Core Web Vitals + user experience.

**Fix:** Add `width={800} height={800}` to every `<img>` tag in ProductCard.tsx and ProductDetailClient.tsx.

### 4. 🟠 HIGH: Serve WebP Images
**Impact:** 2,201 WebP files exist on disk but are never served. 30% bandwidth waste.

**Fix:** Either remove `images: { unoptimized: true }` from next.config.ts or wrap images in `<picture>` elements.

### 5. 🟠 HIGH: Clean Product Descriptions
**Impact:** 285 products (15%) have raw video shortcodes in descriptions. Descriptions are essential for content quality signals.

**Fix:** Strip `[video ...][/video]` markup and decode `&amp;` entities at import time.

---

## Category Scores

| Category | Score | Critical | High | Medium |
|----------|-------|----------|------|--------|
| Product Schema | 52/100 | 1 | 3 | 2 |
| Category Pages | 70/100 | 0 | 1 | 2 |
| Page Optimization | 45/100 | 1 | 4 | 2 |
| Internal Linking | 68/100 | 0 | 0 | 3 |
| Breadcrumbs | 85/100 | 0 | 0 | 1 |
| Images | 40/100 | 1 | 2 | 1 |
| Pricing Display | 60/100 | 0 | 2 | 2 |
| Checkout/SEO | 90/100 | 0 | 0 | 1 |

---

## All Findings by Severity

### Critical (Implement Now)
1. **No canonical tags on ANY page** — Google may index duplicate URLs, diluting ranking power
2. 76.7% product titles exceed 60 chars — rewrite title format
3. Product schema missing @id, url, mpn — add identifiers for rich results
4. No width/height on product images — causing CLS everywhere

### High (Implement This Week)
4. **`no-referrer` meta tag breaks analytics** — remove it, let HTTP header handle it
5. **271KB HTML served uncompressed** — enable Brotli/gzip on Vercel (60-80% reduction)
6. WebP files exist but aren't served — 30% bandwidth wasted
5. 285 products have broken description content (video shortcodes)
6. salePrice never populated — Google never sees discounts
7. AggregateRating hardcoded (4.0/24 reviews) but no real reviews exist
8. Category pages have no ItemList/CollectionPage schema
9. Product price in schema lacks priceValidUntil
10. Images use raw `<img>` tags — no srcSet, no responsive sizes
11. all product images share identical alt text (just product name)

### Medium (Implement This Month)
12. Category pagination has no rel="next"/"prev" — Google only sees first 24 products
13. No cross-category linking on category pages
14. Navbar only links 4 of 8 categories
15. HTML entities (&amp;) leaking into product names and descriptions
16. Product descriptions truncated to 300 chars in schema (should be 1000)
17. Category pages have schema breadcrumbs but no visible breadcrumb UI
18. No contextual in-content links on product pages

### Low (Backlog)
19. Brand field only populated for 1.5% of products
20. Breadcrumb schema uses deprecated "item" instead of "@id"
21. No published/modified dates on product pages
22. Checkout has no conversion tracking pixel
23. Categories with <6 products should be noindexed

---

## What's Working Well
- ✅ Sitemap auto-generated with all 1,984 pages
- ✅ SSR — Googlebot gets complete HTML
- ✅ Organization schema on every page
- ✅ robots.txt is clean
- ✅ Mobile-responsive design
- ✅ Free delivery + COD clearly communicated
- ✅ 6 blog posts with Article + FAQ schema
- ✅ SSL/HTTPS enforced
- ✅ Fast build (1,984 pages in ~20s)
- ✅ 100+ Pakistani cities in checkout

---

## Action Plan

### Week 1: Critical Fixes
- [ ] Rewrite product title format (generateMetadata)
- [ ] Add @id, url, mpn, priceValidUntil to Product schema
- [ ] Add width/height to all product <img> tags
- [ ] Enable WebP serving
- [ ] Strip video shortcodes from descriptions

### Weeks 2-3: High-Impact
- [ ] Add ItemList schema to category pages
- [ ] Add AggregateRating schema (connect to real reviews)
- [ ] Differentiate alt text per image
- [ ] Add rel="next"/"prev" to category pagination
- [ ] Decode HTML entities in product names

### Month 2: Content & Authority
- [ ] Add visible breadcrumbs to category pages
- [ ] Cross-link categories
- [ ] Add contextual product links
- [ ] Expand navbar to top 5 categories by product count

### Ongoing: Monitoring
- [ ] Track Core Web Vitals in Vercel Analytics
- [ ] Monitor search queries in Google Search Console
- [ ] Build backlinks through blog content
- [ ] Add real customer reviews system
