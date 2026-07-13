# Stitch Export — Commensal "Tables" Redesign (2026-07-11)

Six screens were generated on stitch.withgoogle.com from the prompts in `../commensal-tables-stitch-prompts.md`:

1. **Tables Home** — stories-style table rail + feed of table artifact cards
2. **Live Table** — LIVE header, presence row, composite panel, Up Next menu card, live chat + composer
3. **Plan a Table** — title/date/venue, invite buttons (link/QR/commensals), guest RSVP list, composite preview, "Set the Table" CTA
4. **Table Memory** — hero photo collage, "Who broke bread", Resonance reactions + comments, Energy Record + The Sequence menu
5. **Profile** — gradient-ring avatar, FOLLOW / BREAK BREAD actions, stats, Cosmic Identity bars, Table Memories gallery
6. **Discover** — search + filter chips, compatibility-ring table cards, map strip, Kindred Alchemists cards

The raw HTML lives in the owner's Stitch project (and the 2026-07-11 chat transcript). It is NOT vendored here because:
- Image URLs are Google-hosted Stitch placeholders (`lh3.googleusercontent.com/aida-public/...`) that expire — art direction only.
- It uses CDN Tailwind + Google Fonts + Material Symbols, none of which we ship.

**Implement from `../tables-design-spec.md`** — the complete distilled mapping of the Stitch output onto this repo's Tailwind config, fonts, icon set, and component conventions (every token, class recipe, and per-screen blueprint was extracted from the raw export).
