<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Blog Post Writing — MANDATORY WORKFLOW

When the user asks to **write a blog post**, **create content**, or says **"write about…"**, you MUST follow this exact process. Do NOT skip steps.

### Files You Must Read Before Writing

Read these files in order before writing a single word:

| Order | File | What It Contains |
|-------|------|-----------------|
| 1 | `blog-post.md` | Full 4-phase workflow (research → write → SEO → Lighthouse) |
| 2 | `References/voice.md` | Brand voice — sentence rhythm, word choices, anti-patterns |
| 3 | `References/humour.md` | Humour rules — dad jokes, self-deprecation, parenthetical asides |
| 4 | `References/opinions.md` | Strong opinions — "don't buy from us if," industry critiques |
| 5 | `References/stats.md` | Canonical numbers — use exact figures, never round |
| 6 | `References/stories.md` | Real anecdotes — adapt these, don't invent new ones |
| 7 | `on-page-seo.md` | **52-point SEO checklist — every item must pass** |

> **Read `References/*.md` as rules, not as facts.** Every one of them is written
> against a worked example — a Melbourne plumber called Marco. Its numbers
> (18,420 jobs, $149 flat, VIC-PL-48217, the Prahran service area) belong to that
> example and must never appear in BazaarNow content. What transfers is the
> *craft*: sentence rhythm, humour beats, heading style, and the "tell people when
> not to buy" instinct. BazaarNow's real facts live in `data/site-config.json`,
> `data/blog/`, and the published posts — "the plumber is just an example. You
> will use the rules for the topic given to you" is stated at the top of each.

### Keyword Selection

- Read `keywords.csv` and `used-keywords.md` from the project root
- Pick a primary keyword from `keywords.csv` that is NOT in `used-keywords.md`
- Immediately add the chosen keyword to `used-keywords.md` with today's date

**`keywords.csv` columns:** `keyword,volume,difficulty,gsc_impressions,gsc_position,status`.

- `volume` and `difficulty` are **DataForSEO** figures for Pakistan/English, measured
  2026-10-15. `volume` is monthly searches; `difficulty` is 0–100 (keyword difficulty).
- `gsc_*` is the site's own standing from Google Search Console over 16 months, where
  it has one. Blank means the site has never appeared for that keyword.
- Rows are sorted so the winnable ones are at the top.

**This file was rebuilt twice on 2026-10-15.** The original `volume` column
(high/medium/low) had no data source behind it and was badly wrong — 38 of its 39
keywords had *zero* GSC impressions in 16 months, several labelled "high". The first
rebuild used GSC alone, which was also wrong: GSC only reports queries the site
already appears for, so it made every head term look worthless. The current version
uses DataForSEO for demand and GSC for the site's current position.

**Read `status` before picking:**

| status | meaning |
|---|---|
| `winnable` | difficulty ≤ 40 with real volume — start here |
| `unknown-difficulty` | demand exists but DataForSEO has no difficulty score; these are usually branded product or long-tail terms, and the pages ranking are often weak |
| `contested` | real volume, difficulty 41–55; needs a genuinely good page |
| `hard` | difficulty > 55 — do not target with a blog post |
| `no-demand` | volume under 30/month. Not worth a post |
| `no-data` | no volume figure available. Check GSC impressions before writing |

Two traps to avoid, both of which have already burned this project:

1. **A long-tail variant reporting more volume than its own head term is wrong.** When
   a query is too rare to measure, Google Ads returns the volume of the broader keyword
   it is bucketed with. `urapra glycolic acid toner price in pakistan` reported
   2,400/month while its own head term reported 1,600 — and the site's GSC shows 11
   impressions in 16 months, implying roughly 50–100/month. Sanity-check any figure
   against GSC before building a strategy on it.
2. **`no-data` is not `no-demand`.** A blank volume can mean nobody searches it, or
   that DataForSEO has no coverage. GSC impressions are the tiebreaker.

Before targeting a head term, check its row. `online shopping in pakistan` is
`contested` at difficulty 45 with 6,600/month — worth having on the homepage as a
long-term play, but the evidence points at a listicle page rather than a homepage to
win it.

### Content Rules (Non-Negotiable)

- Answer first, then context. Short sentences (under 18 words mostly)
- Headings as statements, not labels
- Real numbers over adjectives — "Rs. 1,499" not "affordable"
- One strong opinion per post, backed by a number or story
- At least one "don't buy from us if" section
- Sign-off must make the reader smile
- No exclamation marks. No emojis in body text

### SEO Checklist (from on-page-seo.md)

Before shipping, verify:
- [ ] Title tag 50-60 chars, primary keyword near start
- [ ] Meta description 150-160 chars
- [ ] OG + Twitter Card tags
- [ ] 3-5 internal links with descriptive anchor text
- [ ] 2-3 external links to authoritative sources
- [ ] Article + FAQPage + BreadcrumbList JSON-LD schema
- [ ] Author byline + bio with credentials
- [ ] Published date displayed on page
- [ ] FAQ section with 4-8 questions
- [ ] Alt text on all images
- [ ] Short paragraphs (1-4 sentences)

### File Structure

- Create blog post content in `data/blog/[post-slug].json`
- Add entry to `data/blog-index.json`
- The Next.js blog system auto-generates pages at `/blog/[slug]`

### Voice Vibe Check

Before shipping, read the post aloud. It should sound like a knowledgeable Pakistani e-commerce founder talking to a customer at a chai dhaba — helpful, honest, and physically unable to resist a well-timed observation. Not a brochure. Not a LinkedIn post. Not AI.
