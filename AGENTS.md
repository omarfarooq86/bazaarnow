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

**`keywords.csv` columns:** `keyword,impressions,clicks,ctr,position,status`.
These are **measured Google Search Console totals**, not estimates — the file was
rebuilt on 2026-10-15 because the previous `volume` column (high/medium/low) had no
data source behind it and was badly wrong. 38 of the 39 keywords it listed had
**zero** GSC impressions over 16 months, several of them labelled "high volume".

Two things to know before picking from it:

1. **It only lists queries the site already appeared for.** GSC reports impressions,
   not search demand. `status: no-impressions` means *no visibility*, which could mean
   either nobody searches it or the site ranks too deep to be seen. GSC cannot tell
   the two apart — do not read it as "no demand".
2. **Favour `status` values that are winnable.** `page-2` (position 11-20) is the best
   target: real, measured demand that is one push from page 1. `top-10` is already
   ranking. Prefer rows with higher `impressions`; a position derived from a single
   impression is noise, not a ranking.

Before targeting a head term, check its row. `online shopping pakistan` sits at
`no-impressions` — it is worth having on the homepage as a long-term play, but it is
not winnable now and should not drive a blog post.

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
