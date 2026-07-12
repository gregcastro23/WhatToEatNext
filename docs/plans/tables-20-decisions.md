# The 20 Questions — Commensal→Tables Decision Record (2026-07-11)

After the commensal-route audit, these 20 multiple-choice questions were put to the owner (4 per batch, 5 batches, via the interactive question UI). The chosen answers below are LOCKED product decisions driving the 6-PR roadmap (`tables-program-sequencing.md`), the Stitch design prompts (`../design/commensal-tables-stitch-prompts.md`), and the design spec (`../design/tables-design-spec.md`).

## Batch 1 — Vision & identity
1. **North star for the "Facebook/Instagram-killer"?** (Dining-first social network / Cosmic identity network / Instagram-of-food / Full general-purpose social) → **Dining-first social network** — the dinner table is the atomic unit; every social feature radiates from meals.
2. **Primary social unit?** (The Table / The Post / The Circle / The Profile) → **The Table (live dinner party)** — hosted sessions with members, composite chart, menu, chat, and an afterlife.
3. **First wave of users?** (Friend groups planning dinners / Existing alchm believers / Food creators & hosts / Curious singles-daters) → **ALL FOUR** (multi-select: design for every wave).
4. **Identity model?** (Real identity by default / Pseudonymous personas / Dual-layer / Keep anonymous-first) → **Real identity by default** — names + avatars shown, opt-out per post.

## Batch 2 — Core features
5. **First flagship social capability?** (Live Table chat + presence / Real invites / Comments + reactions / DMs) → **Live Table chat + presence** — turn the lobby on and make the Table alive.
6. **Feed evolution?** (Table-centric artifacts / Free-text composer / Both / Structured-only, more types) → **Table-centric artifacts** — the feed is a chronicle of real meals, not a text box.
7. **Table persistence model?** (Full lifecycle plan→live→memory / Ephemeral live sessions / Scheduled events w/ RSVP / Recurring supper clubs) → **Full lifecycle: plan → live → memory** — one entity, three states.
8. **Invite modes to ship?** (Shareable link / In-app invites to commensals / QR at the table / Search & invite any user) → **ALL FOUR** (multi-select).

## Batch 3 — Graph & discovery
9. **Relationship model?** (Commensals + follow layer / Symmetric commensals only / Asymmetric follow only / Circles as the graph) → **Commensals + follow layer** — trusted inner circle + public reach, two-tier like real dining life.
10. **Profile centerpiece?** (Table history + cosmic identity / Natal chart identity / Cooked-dish gallery / Taste graph + activity) → **Table history + cosmic identity** — "who you've broken bread with" as the profile story.
11. **Avatars?** (Upload + generated cosmic fallback / Generated only / OAuth photo + upload / Static element sigils) → **Upload + generated cosmic fallback** — real photos to R2, AI elemental sigil for those who don't upload.
12. **Discovery modes?** (Compatibility matchmaking / People directory / Nearby-local tables / Feed-driven) → **ALL FOUR** (multi-select).

## Batch 4 — Realtime, chat, safety, mobile
13. **Realtime backbone?** (SpacetimeDB live + Postgres record / Hardened polling / All-in SpacetimeDB / Third-party realtime) → **SpacetimeDB for live, Postgres for record** — polling remains the fallback.
14. **Chat scope this cycle?** (Table chat → then DMs / Table chat + DMs together / Circle chats / Everything) → **EVERYTHING: tables, DMs, circles** — build the message model once.
15. **Safety floor?** (Block + report + host controls / Block only / Full moderation kit / Trusted-circle beta) → **Block + report + host controls** — the minimum credible floor for real identities + open invites.
16. **Mobile posture?** (First-class mobile tab / PWA push / Mobile-first redesign / Desktop-first) → **First-class tab + PWA push + mobile-first redesign** (multi-select, all three).

## Batch 5 — Economy, sequencing, design, rollout
17. **ESMS reward visibility in social flows?** (Invisible-felt-not-shown / Subtle ambient cues / Visible rewards / Recognition over currency) → **Subtle ambient cues** — no numbers in-flow; a soft glow/pulse on the token widget when actions land.
18. **Repair vs build sequencing?** (Foundation PR first / Parallel tracks / New build absorbs fixes / Features first) → **Foundation PR first, then features** (→ became PR #589).
19. **Design direction for Stitch?** (Evolved cosmic glass / Warm candlelit social / Instagram-dark minimal / Editorial print-menu) → **Evolved cosmic glass** — keep the obsidian + copper/violet glassmorphism, reorganize into social-app anatomy.
20. **Rollout strategy?** (Ship visible, gate the risky / Invite-only waves / Everything day one / Silent flag-gated beta) → **Ship visible, gate the risky** — no beta labels; chat/DMs behind flags until hardened.

## Downstream artifacts
- Stitch prompt package (delivered to stitch.withgoogle.com; its 6 generated screens came back and were distilled): `../design/commensal-tables-stitch-prompts.md` → `../design/tables-design-spec.md`
- Audit → repair: PR #589 (foundation), PR #588 (UI kit); implementation plans: `pr2-table-entity-plan.md`, `pr3-messaging-plan.md`, arbitration in `tables-program-sequencing.md`.
