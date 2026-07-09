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
| 2 | `voice.md` | Brand voice — sentence rhythm, word choices, anti-patterns |
| 3 | `humour.md` | Humour rules — dad jokes, self-deprecation, parenthetical asides |
| 4 | `opinions.md` | Strong opinions — "don't buy from us if," industry critiques |
| 5 | `stats.md` | Canonical numbers — use exact figures, never round |
| 6 | `stories.md` | Real anecdotes — adapt these, don't invent new ones |
| 7 | `on-page-seo.md` | **52-point SEO checklist — every item must pass** |

### Keyword Selection

- Read `keywords.csv` and `used-keywords.md` from the project root
- Pick a primary keyword from `keywords.csv` that is NOT in `used-keywords.md`
- Immediately add the chosen keyword to `used-keywords.md` with today's date

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
