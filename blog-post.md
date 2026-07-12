# Blog Post Skill

Create SEO-optimized blog posts for CaseWalay using the brand voice files and a structured workflow.

## Trigger

When the user asks to create a blog post, or says "write a blog post about...", or "create content for..."

---

## Phase 1: Setup & Research

### 1.1 Pick a keyword

- Read `keywords.csv` and `used-keywords.md` from the project root
- Pick a **primary keyword** from `keywords.csv` that is NOT in `used-keywords.md`
- Pick **4-5 secondary keywords** from the same CSV that form a semantic cluster around the primary
- If the CSV doesn't have good secondaries for the cluster, make them up — they should be natural variations and long-tail versions of the primary

### 1.2 Add to used-keywords.md

- After selecting the primary keyword, immediately add it to `used-keywords.md`:

```
| [primary keyword] | [today's date] |
```

- This prevents reusing the same primary keyword in future posts

### 1.3 Read brand voice files

Read ALL of these files before writing a single word:

| File | Purpose |
|------|---------|
| `References/voice.md` | How the brand talks — sentence rhythm, word choices, formatting rules, words to never use |
| `References/humour.md` | Humour rules — mandatory dad jokes, self-deprecation, parenthetical asides, pop-culture references, sign-offs |
| `References/opinions.md` | Strong opinions — "don't buy from us if," industry critiques, contrarian takes backed by numbers |
| `References/stats.md` | Canonical numbers — prices, timelines, counts (use exactly, never round) |
| `References/stories.md` | Real anecdotes — adapt these, don't invent new ones |

**Critical voice rules (from voice.md):**
- Short sentences. Mostly under 18 words
- Answer first, then context
- No exclamation marks. No emojis in body text
- Headings as statements, not labels ("Nine out of ten people overthink custom cases" not "Introduction")
- Real numbers over adjectives — "Rs. 1,499" not "affordable"
- One strong opinion per post, backed by a number or story
- Talk people OUT of buying when it's not right for them — the single biggest voice tell
- Sign-off must make the reader smile

### 1.4 SERP research

- **Search Google** for the primary keyword
- **Fetch and analyze the top 3 ranking pages**:
  - Identify the content format (listicle / tutorial / guide / comparison)
  - Estimate word count of each
  - List every H2 they use
  - Note whether they have an FAQ section
  - Note whether they answer the main question in the first paragraph
  - Count images, note any tables or comparison charts
- **Target metrics**:
  - Match the dominant format of the top 3
  - Target word count: within 20% of the top-3 average
  - Cover every topic that ALL top 3 pages talk about
  - Add 1-2 extra topics they missed
  - Answer the main question directly at the top (optimized for featured snippet)
  - Include an FAQ section with questions from "People Also Ask"

### 1.5 Find images


- Select 3-4 relevant images from my "Images" folder
- Place them above H2 sections in the post

---

## Phase 2: Write the Blog Post

### 2.1 File setup

- Create the post in `blog/[post-slug].html`
- Use the existing blog template structure (navbar, footer, styling from `blog/custom-phone-cases-pakistan.html`)
- Add the post to the `posts` array in `blog/index.html`

### 2.2 Content structure

1. **H1** — Direct answer to the query (featured snippet bait). Contains primary keyword.
2. **Opening paragraph** — Primary keyword in first 100 words. Direct answer.
3. **TL;DR box** — The entire post in 2-3 sentences.
4. **Table of Contents** — Anchor links to every H2.
5. **Body sections** — Each H2 is a statement, not a label.
6. **CTA boxes** — 2 placed naturally in the content.
7. **FAQ section** — 5-7 questions with direct, short answers.
8. **Author bio** — Name + credentials.
9. **Sign-off** — Makes the reader smile.

### 2.3 Voice checklist (before proceeding to Phase 3)

- [ ] At least 3 dad jokes or puns
- [ ] At least 2 self-deprecating or parenthetical asides
- [ ] One strong opinion backed by a number or story
- [ ] One "don't buy from us if" section
- [ ] No exclamation marks (except CTA buttons)
- [ ] No emojis in body text
- [ ] Headings are statements, not labels
- [ ] Real numbers used, not adjectives
- [ ] Sign-off makes the reader smile

---

## Phase 3: On-Page SEO

### 3.1 Read the SEO checklist

Read `on-page-seo.md` from the project root. Apply every applicable item.

### 3.2 HEAD / METADATA

- [ ] **Title tag**: 50–60 chars, primary keyword near the start
- [ ] **Meta description**: 150–160 chars, primary keyword + benefit + soft CTA
- [ ] **Canonical URL**: `https://casewalay.com/blog/[post-slug].html`
- [ ] **Open Graph tags**: `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:type`, `og:site_name`
- [ ] **Twitter Card**: `summary_large_image` with all four tags
- [ ] **Favicon** + charset + viewport + language attribute

### 3.3 SCHEMA MARKUP (JSON-LD in `<head>`)

Add these three `<script type="application/ld+json">` blocks:

1. **Article schema** — headline, description, image, datePublished, dateModified, author (Organization), publisher with contactPoint
2. **FAQPage schema** — every FAQ question/answer pair
3. **BreadcrumbList schema** — 3-level hierarchy (Home → Blog → Post Title)

### 3.4 ON-PAGE ELEMENTS

- [ ] Primary keyword in first 100 words
- [ ] Direct answer in first paragraph
- [ ] Table of contents with anchor-linked jump links
- [ ] 3-5 internal links to relevant pages (custom cases, iPhone page, FAQ, return policy)
- [ ] 2-3 external links to authoritative sources (Wikipedia, Statista, .edu, .gov)
- [ ] Published date with `<time datetime="">` element
- [ ] Short paragraphs (1–4 sentences)
- [ ] Bold key phrases sparingly
- [ ] Descriptive anchor text (never "click here")

### 3.5 IMAGES

- [ ] Downloaded locally to `/images/` (never hotlinked from CDN)
- [ ] Descriptive filenames with hyphens (`custom-phone-case-design.jpg`)
- [ ] Alt text describes the image + keyword where natural
- [ ] `width` and `height` attributes (prevents CLS)
- [ ] `loading="lazy"` for below-fold images
- [ ] `decoding="async"` on all images
- [ ] Under 200 KB per image

### 3.6 ACCESSIBILITY

- [ ] Skip-to-content link as first element in `<body>`
- [ ] Semantic HTML5: `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`
- [ ] ARIA labels on nav, main, breadcrumb, TOC
- [ ] Color contrast meets WCAG AA (4.5:1 for body text)
- [ ] Heading hierarchy: exactly one H1, no skipped levels (H1 → H2 → H3)
- [ ] Table headers use `<th scope="col">`
- [ ] Focus indicators visible on all interactive elements

### 3.7 PERFORMANCE & SECURITY

- [ ] Fonts loaded with `display=swap` + `preload` for critical woff2 files
- [ ] CSP meta tag: `upgrade-insecure-requests`
- [ ] X-Frame-Options meta tag: `DENY`
- [ ] Referrer policy meta tag: `strict-origin-when-cross-origin`
- [ ] No third-party CDN images (causes cookies + performance issues)

### 3.8 E-E-A-T SIGNALS

- [ ] Author byline with name
- [ ] Author bio with credentials and location
- [ ] Published date displayed on page
- [ ] Real stories, real numbers, real opinions
- [ ] External authoritative sources cited

### 3.9 LONG-FORM CONTENT (1500+ words)

- [ ] Table of contents with anchor links at the top
- [ ] Jump links (`id`) on every H2
- [ ] Back-to-top button (appears after 600px scroll)

### 3.10 BLOG LISTING

- [ ] Add the new post to the `posts` array in `blog/index.html`:
```js
{
    title: 'Post Title',
    slug: 'post-filename.html',
    date: 'Month DD, YYYY',
    tag: 'Category',
    excerpt: 'Brief description.',
    readTime: 'X min read'
},
```

### 3.11 NAVIGATION

- [ ] Add blog link in navbar and footer of ALL pages if not already present
- [ ] Breadcrumb navigation on the post page: Home / Blog / Post Title

---

## Phase 4: Lighthouse Optimization

### 4.1 Ask for the report

After writing and deploying the post, ask the user:

> "Please open the blog post in Chrome Incognito mode, run a Lighthouse audit (Desktop or Mobile), and share the report with me."

**Important:** Tell them to use Incognito mode — Chrome extensions heavily skew the Performance score.

### 4.2 Analyze and fix

When the user provides the Lighthouse report:

**Performance (target 100):**
- [ ] Check for render-blocking resources (fonts, CSS, JS)
- [ ] Check LCP element — should be text or local image, not CDN
- [ ] Check for third-party cookies
- [ ] Check image sizes and formats
- [ ] Check for critical request chains
- [ ] Verify `font-display: swap` and font preload are in place

**Accessibility (target 100):**
- [ ] Check color contrast ratios (4.5:1 minimum)
- [ ] Check heading hierarchy (no skipped levels)
- [ ] Check that all images have descriptive alt text
- [ ] Check ARIA labels on interactive elements
- [ ] Check that links are distinguishable without color

**Best Practices (target 100):**
- [ ] Check for third-party cookies — all images must be local
- [ ] Check for CSP and security headers
- [ ] Check for correct image aspect ratios
- [ ] Check that all links use `rel="noopener"` for `target="_blank"`

**SEO (target 100):**
- [ ] Verify structured data is valid (Article, FAQ, BreadcrumbList)
- [ ] Verify canonical URL is set
- [ ] Verify meta description length
- [ ] Verify all images have alt text
- [ ] Verify no crawl-blocking elements

### 4.3 Fix and re-deploy

- Apply fixes to the blog post HTML file
- Commit: `git add -A && git commit -m "Lighthouse optimization: [list fixes]" && git push`
- Vercel auto-deploys
- Ask user to re-run the audit to verify

---


---

## Summary: Complete Workflow

```
Phase 1: SETUP
  → Pick keyword from CSV, add to used-keywords.md
  → Read all 5 brand voice files
  → SERP research (Google top 3, analyze format/length/topics)
  → Find Pexels images

Phase 2: WRITE
  → Create blog/[post-slug].html with brand voice
  → Add to blog/index.html posts array
  → Voice checklist: dad jokes, asides, opinions, sign-off
  -> add atleast 3 images related to the keyword. You can fetch them using Pexels API key. I have written key in the file @Pexels-API.md

Phase 3: SEO
  → Read on-page-seo.md
  → Add metadata, schema (3 JSON-LD blocks), OG/Twitter tags
  → Download images locally, add width/height/alt/lazy/async
  → Accessibility: skip-link, semantic HTML, ARIA, contrast
  → Performance: font preload, CSP, XFO, no CDN images
  → E-E-A-T: author bio, dates, internal links, external sources
  → Long-form: TOC, jump links, back-to-top
  → Update blog listing + site-wide nav/footer links

Phase 4: LIGHTHOUSE
  → Ask user for Incognito Lighthouse report
  → Fix Performance, Accessibility, Best Practices issues
  → Push fixes → Vercel auto-deploys
  → Verify 100% across all 4 categories
```
