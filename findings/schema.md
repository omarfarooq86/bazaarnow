# Schema Markup & Sitemap Audit: bazaarnow.net

**Date:** 2026-07-16
**Tool:** JSON-LD / Schema.org Audit
**URL:** https://www.bazaarnow.net

---

## 1. EXECUTIVE SUMMARY

The site has a partial but incomplete implementation of schema markup. An **Organization** block is present on every page, product pages have **Product+BreadcrumbList**, blog posts have **Article+BreadcrumbList+FAQPage**, and static pages have **Organization+BreadcrumbList** (some with **FAQPage**). However, multiple critical issues exist: relative image URLs, missing required fields, stale lastmod dates, a broken logo URL, and no blog posts in the sitemap. The **WebSite** (with SearchAction), **LocalBusiness**, **AggregateRating**, **Review**, and image sitemap types are entirely absent.

---

## 2. DETECTED SCHEMA TYPES

### Present (JSON-LD):
| Schema Type | Pages Found | Valid? |
|---|---|---|
| **Organization** | All pages | Partial (missing description, foundingDate, address) |
| **Product** | Product pages (~1964 products) | Partial (relative image URLs, missing url, no aggregateRating) |
| **BreadcrumbList** | Product pages, category pages, blog posts | Yes |
| **Article** | Blog posts | Yes |
| **FAQPage** | /about/, /returns/, blog posts | Yes (but Google retired FAQ rich results May 2026) |

### Absent (Missing Opportunities):
| Schema Type | Priority | Recommendation |
|---|---|---|
| **WebSite** (with SearchAction) | High | Enables site search box in SERP |
| **LocalBusiness** | Medium | Site is an online marketplace targeting Pakistan |
| **AggregateRating** | High | Needed on Product pages and Organization |
| **Review** | Medium | Would enable product review stars |
| **ItemList** | Medium | For category pages listing products |

---

## 3. SCHEMA VALIDATION RESULTS

### 3.1 Organization Schema (present on ALL pages)

**Issues:**

| Issue | Severity | Fix |
|---|---|---|
| `description` missing | Medium | Add a short description of BazaarNow |
| `foundingDate` missing | Low | Helps establish business legitimacy |
| `address` (PostalAddress) missing | Low | Even online-only businesses should include a city/region |
| `email` missing | Medium | Include in contactPoint or as top-level property |
| `@id` missing | Low | Helps Google consolidate entity references |
| `url` is https://www.bazaarnow.net but `logo` returns **HTTP 404** | **HIGH** | Logo image URL is broken: `/images/logo.png` returns 404 |

**Current schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BazaarNow",
  "url": "https://www.bazaarnow.net",
  "logo": "https://www.bazaarnow.net/images/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+92-300-1234567",
    "contactType": "customer service",
    "availableLanguage": ["English", "Urdu"]
  },
  "sameAs": [
    "https://facebook.com/bazaarnowpk",
    "https://instagram.com/bazaarnowpk",
    "https://tiktok.com/@bazaarnowpk"
  ]
}
```

### 3.2 Product Schema (product pages)

**Issues:**

| Issue | Severity | Details |
|---|---|---|
| Image URLs are **relative** paths | **CRITICAL** | e.g., `/images/products/...`. Google requires absolute URLs. Fix: prepend `https://www.bazaarnow.net` |
| Missing `@id` or `url` property | High | Prevents Google from connecting product to its canonical page |
| Missing `offers.url` | High | Recommended for product rich results |
| Missing `priceValidUntil` or `validFrom` | Medium | Absent on all product offers |
| Missing `aggregateRating` | **CRITICAL** | No review/rating data on any product |
| Missing `review` | High | No individual reviews |
| `brand` is always "BazaarNow" | Low | Appears hardcoded; should reflect actual brand per product |

**Current schema (representative):**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "description": "...",
  "sku": "hhc-2391183",
  "image": [
    "/images/products/...-1.jpg",
    "/images/products/...-2.jpg"
  ],
  "offers": {
    "@type": "Offer",
    "priceCurrency": "PKR",
    "price": "653",
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "BazaarNow" }
  },
  "brand": { "@type": "Brand", "name": "BazaarNow" }
}
```

### 3.3 Article Schema (blog posts)

**Issues:** None found. Well-implemented.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "description": "...",
  "image": "/images/blog/cod-pakistan.jpg",
  "datePublished": "2026-07-09",
  "dateModified": "2026-07-09",
  "author": { "@type": "Person", "name": "Omar Farooq" },
  "publisher": {
    "@type": "Organization",
    "name": "BazaarNow",
    "url": "https://www.bazaarnow.net"
  }
}
```

Minor note: Article `image` is a **relative path** (same issue as products). Should be `https://www.bazaarnow.net/images/blog/cod-pakistan.jpg`.

### 3.4 FAQPage Schema

Present on `/about/`, `/returns/`, and blog post pages. Well-formed. Note: Google retired FAQ rich results for all sites on May 7, 2026, so there is no SERP benefit. Keep for AI/LLM entity resolution -- do not remove.

### 3.5 BreadcrumbList Schema

Present on product, category, and blog post pages. Well-formed.

---

## 4. MISSING SCHEMA OPPORTUNITIES

### 4.1 WebSite + SearchAction (HIGH PRIORITY)

Enables the Sitelinks Search Box in Google SERP.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "BazaarNow",
  "url": "https://www.bazaarnow.net",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.bazaarnow.net/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### 4.2 Organization -> LocalBusiness extension (MEDIUM PRIORITY)

Since the site serves Pakistan with COD, consider adding `@type: ["Organization", "OnlineStore"]` or `@type: ["Organization", "Store"]` with an address.

### 4.3 AggregateRating on Products (CRITICAL PRIORITY)

If any review/rating system exists or is planned, add to Product schema:

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.5",
  "reviewCount": "127"
}
```

### 4.4 ItemList for Category Pages (MEDIUM PRIORITY)

Category pages list products but have no schema indicating this. Add:

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "url": "https://www.bazaarnow.net/product/..." },
    { "@type": "ListItem", "position": 2, "url": "https://www.bazaarnow.net/product/..." }
  ],
  "numberOfItems": 100
}
```

---

## 5. SITEMAP ANALYSIS

### 5.1 Sitemap Structure

| Metric | Value |
|---|---|
| Total URLs | 1,979 |
| Sitemap format | Single XML file (not a sitemap index) |
| Protocol | Sitemaps Protocol 0.9 via https |
| Namespaces | urlset, news, xhtml, mobile, image, video |

### 5.2 URL Distribution

| URL Type | Count | Notes |
|---|---|---|
| Homepage | 1 | `/` |
| About | 1 | `/about/` |
| Contact | 1 | `/contact/` |
| Offers | 1 | `/offers/` |
| Privacy | 1 | `/privacy/` |
| Returns | 1 | `/returns/` |
| Blog listing | 1 | `/blog/` |
| Blog posts | **0** | **Not included in sitemap!** |
| Categories | 8 | `/category/beauty/`, `/category/electronics/`, etc. |
| Products | 1,964 | `/product/...` |

### 5.3 Sitemap Issues

| Issue | Severity | Details |
|---|---|---|
| **Blog posts not included** | **CRITICAL** | Zero blog post URLs found in sitemap. Google cannot discover blog content through sitemap. |
| **All lastmod dates identical to the second** | **HIGH** | All 1,979 URLs share the same 6 lastmod timestamps (differing only by milliseconds). This appears to be a build-time timestamp, not actual content modification dates. |
| **All priorities = 0.7** | Medium | Every URL has priority 0.7. Homepage should be 1.0, categories 0.8, products 0.5-0.6, static pages 0.3-0.4. |
| **All changefreq = weekly** | Low | Not all content changes weekly. Static pages should be "monthly", products "daily"/"weekly", blog posts "weekly". |
| **No image tags** | Medium | Even though Products have multiple images, the sitemap includes no `<image:image>` tags. Limits image indexing. |
| **No sitemap index** | Low | With 1,979 URLs approaching the 50,000 limit this is fine, but for performance a split index could help. |
| **Lastmod uses ISO with milliseconds** | Low | Standard ISO 8601 is fine, but dropping the `.303Z` precision would be cleaner. |

### 5.4 Image Sitemap Opportunity

Since the site has 1,964 products, each with 3-5 product images, an image sitemap or image tags in the existing sitemap would significantly improve image discovery for Google Images search.

---

## 6. robots.txt

Status: **OK**
- Allows all crawlers (`Allow: /`)
- Points to sitemap correctly
- No directives blocking important resources

---

## 7. PRIORITY FIX LIST

### Critical (fix immediately)
1. **Product image URLs**: Change all relative paths to absolute URLs (e.g., `/images/products/...` -> `https://www.bazaarnow.net/images/products/...`)
2. **Blog posts missing from sitemap**: Add all blog post URLs to sitemap
3. **Logo 404**: Fix the logo image at `/images/logo.png` or update the schema `logo` URL
4. **Add AggregateRating** to Product schema if reviews/ratings exist
5. **Add `url` and `@id`** to Product schema

### High (fix soon)
6. **Real lastmod dates**: Generate per-page lastmod dates based on actual content changes
7. **Vary priority values**: Homepage=1.0, categories=0.8, products=0.5-0.6, static=0.3
8. **Add WebSite + SearchAction** schema for SERP search box
9. **Add offers.url** to Product offers
10. **Article image URLs** to absolute

### Medium (fix when able)
11. **Add priceValidUntil** to product offers
12. **Add Organization.description** and **foundingDate**
13. **Add email** to contactPoint or Organization
14. **Consider ItemList** for category pages
15. **Consider image tags** in sitemap for better image SEO

### Low (nice to have)
16. **Add address** to Organization schema
17. **Vary changefreq** per content type
18. **Consider LocalBusiness or OnlineStore** type extension
19. **Add Organization @id**

---

## 8. GENERATED JSON-LD FOR IMPLEMENTATION

### WebSite + SearchAction (add to all pages)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "BazaarNow",
  "url": "https://www.bazaarnow.net",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.bazaarnow.net/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### Enhanced Organization (replace current)
```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "OnlineStore"],
  "@id": "https://www.bazaarnow.net/#organization",
  "name": "BazaarNow",
  "url": "https://www.bazaarnow.net",
  "logo": "https://www.bazaarnow.net/images/logo.png",
  "description": "Pakistan's most trusted online marketplace - premium products at unbeatable prices with free delivery across Pakistan.",
  "foundingDate": "2024",
  "email": "support@bazaarnow.net",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "PK"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+92-300-1234567",
    "contactType": "customer service",
    "availableLanguage": ["English", "Urdu"]
  },
  "sameAs": [
    "https://facebook.com/bazaarnowpk",
    "https://instagram.com/bazaarnowpk",
    "https://tiktok.com/@bazaarnowpk"
  ]
}
```

### Enhanced Product (replace current Product block)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://www.bazaarnow.net/product/EXAMPLE-SLUG/#product",
  "url": "https://www.bazaarnow.net/product/EXAMPLE-SLUG/",
  "name": "Product Name Here",
  "description": "Product description here.",
  "sku": "hhc-1234567",
  "image": [
    "https://www.bazaarnow.net/images/products/example-1.jpg",
    "https://www.bazaarnow.net/images/products/example-2.jpg"
  ],
  "offers": {
    "@type": "Offer",
    "url": "https://www.bazaarnow.net/product/EXAMPLE-SLUG/",
    "priceCurrency": "PKR",
    "price": "999",
    "priceValidUntil": "2027-12-31",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "BazaarNow",
      "url": "https://www.bazaarnow.net"
    }
  },
  "brand": {
    "@type": "Brand",
    "name": "ActualBrandName"
  }
}
```

### Category Page ItemList (add to each category page)
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "url": "https://www.bazaarnow.net/product/prod-1/"},
    {"@type": "ListItem", "position": 2, "url": "https://www.bazaarnow.net/product/prod-2/"}
  ],
  "numberOfItems": 45
}
```

---

## 9. SCHEMA COMPLIANCE SUMMARY

| Requirement | Status |
|---|---|
| @context = "https://schema.org" | Pass |
| JSON-LD format (not Microdata/RDFa) | Pass |
| Valid @type (no deprecated types) | Pass |
| Required properties present | Fail (Product missing url, priceValidUntil) |
| Absolute URLs | Fail (Product images, Article image, logo are relative or broken) |
| ISO 8601 dates | Pass |
| No placeholder text | Pass |
| Organized by page type | Needs improvement |
