# Admin Ecosystem — Stitch Redesign Prompt

Authored 2026-08-17, off the back of `docs/admin/AUDIT_2026_08_17.md` (121 verified
findings) and `docs/admin/UPGRADE_PLAN.md`.

Paste the **Global Style Block** at the top of every screen prompt, then one screen
block. Screen 3 (the kit) is the highest-value one — generate it first and let the rest
inherit from it.

**Running it in Stitch:** at stitch.withgoogle.com the composer defaults to **App**
(native mobile). Toggle to **Web** before submitting — every screen here is a desktop-first
operator surface at ≥1280px, and App mode will produce phone frames. Generate Screen 3
first, then reuse its output as the reference for Screens 1–2 and 4–8 so the provenance
vocabulary stays identical across tabs. The admin is desktop-primary; only the shell
(Screen 1) needs a genuine mobile treatment.

---

## Why this revamp exists (read before prompting)

Three measured facts drive every decision below. They are not aesthetic preferences.

**1. The admin runs two disjoint design systems with zero overlap.**

| Group | Files | Tailwind class uses | CSS-var uses |
|---|---|---|---|
| `src/app/admin/_dashboard/*` | 11 | **0** | **630** |
| Everything else under `src/app/admin` + `src/components/admin` | 22 | **~600** | **0** |

**2. The dark system is the on-brand one — the light Tailwind admin is the outlier.**
`src/app/globals.css:312+` defines `--bg: #07060b`, `--fg: #f2edff`, `--accent`,
`.alchm-panel`, and the shadcn token mappings **globally**, for the whole app. The
`_dashboard` chrome is simply the only admin surface using the house language. So this is
a *migration onto existing tokens*, *not* a new theme. **Stitch must not invent a palette.**

**3. Two tabs are currently unreadable.** `admin/chat-reports/page.tsx` and
`admin/feed/comment-reports/page.tsx` are written in dark tokens (`text-white`,
`bg-white/[0.03]`, `border-white/10` — 27 uses) but `admin/layout.tsx:142` wraps them in
`bg-gray-100`. `#ffffff` on `#f3f4f6` is a **1.07:1** contrast ratio; WCAG AA requires
4.5:1. Unifying the shell on the dark tokens *fixes these two tabs for free*.

**4. Status and domain share a palette.** There are no semantic status tokens. The dark
console maps `OK → var(--el-earth)`, `DEGRADED → var(--el-fire)`, `UNKNOWN → var(--fg-mute)`
and `INCIDENT → "#FF5252"` — a hardcoded hex repeated across 7 files. So a **Fire-element
dot and a DEGRADED badge are the same color**, while the light panels use an unrelated
Tailwind emerald/amber/rose set and a third value `#f43f5e` appears in a few places.
Creating a status palette distinct from the elemental one is part of this job.

### The part that makes this more than a reskin

The audit's dominant root cause is that **absence and staleness have no visual language**.
There are ~25 hand-typed `● LIVE` literals across the admin using **7 different words** for
the false state, and panels routinely render a failed query as a confident `0`. So the
design must supply **states, not just surfaces**. Every data atom needs five looks:

`LIVE` · `STALE` · `NO SOURCE` · `NOT INSTRUMENTED` · `PARTIAL`

A metric whose source failed must be visually incapable of looking like a real zero.
This is the project's standing rule (`CLAUDE.md`): *never fabricate admin data; degrade to
an honest state instead.*

---

## GLOBAL STYLE BLOCK  *(prepend to every screen prompt)*

```
STYLE: A calm, dense, professional operator console in a refined DARK theme (dark mode
only — never white or light-grey surfaces). Think Linear or Vercel's dashboard rendered in
obsidian glass, with a restrained alchemical signature. It is an instrument panel, not a
marketing page and NOT a sci-fi/terminal cosplay: no neon, no scanlines, no crosshair
gauges, no fake telemetry ornament. Information density is a feature — an operator scans
this during an incident. Generous but not wasteful spacing, strong hierarchy, one primary
action per region.

COLOR PALETTE (dark). The first two groups are the app's REAL tokens — resolved from
src/app/globals.css and verified by rasterizing the oklch values. Use them exactly.
- Backgrounds (darkest→lightest): #07060B, #0E0C16, #15121F
- Text: #F2EDFF (primary), #B5ADCC (secondary/labels), #6E6884 (muted), #3F3A52 (faint)
- Hairlines: white at 8% and 14% for emphasis
- Primary accent (violet): #BF83FE
- Secondary accent (amber-gold): #E9A23B
- ELEMENT accents — a DOMAIN palette (Fire/Water/Earth/Air), for elemental dots ONLY:
    Fire #FF7D5C · Water #3BB9ED · Earth #94B96D · Air #DFCC99

- STATUS: the app has NO semantic status tokens yet — YOU ARE DESIGNING THEM. Today the
  console reuses the element palette for status, so a DEGRADED badge and a Fire-element
  dot are literally the same color, and "error" is a hardcoded #FF5252 in 7 files while
  the light panels use Tailwind emerald/amber/rose. Propose four dedicated status hues
  that are clearly DISTINCT from the four element hues above and stay separable at 8px:
    OK / healthy      a green that is NOT Earth #94B96D
    DEGRADED / warn   an amber that is NOT Fire #FF7D5C and NOT the gold accent
    INCIDENT / error  a red/rose (replacing the ad-hoc #FF5252)
    UNKNOWN / absent  muted grey #6E6884 — NEVER green, NEVER red
  Show the status swatches and the element swatches side by side to prove they don't
  collide.

SURFACES: Translucent glass panels — white 2.5–5.5% fill, 1px hairline border, subtle
backdrop blur, 14px radius (8px for small chips). Elevated/hero panels get a faint violet
glow. Avoid heavy borders and drop shadows.

TYPOGRAPHY:
- Panel titles: elegant serif (Cormorant Garamond), medium weight, tight tracking.
- Body/UI: clean humanist sans (Manrope).
- ALL numbers, metrics, IDs, timestamps, status words, table data: monospace
  (JetBrains Mono), tabular figures. Micro-labels are UPPERCASE with ~0.14em tracking.
  This mono-caps micro-label treatment is the brand signature.

THE FIVE PROVENANCE STATES (design these explicitly, they appear on every panel):
  ● LIVE              emerald dot, full-opacity value
  ◐ STALE             amber dot + relative age ("4m old"), value slightly dimmed
  ○ NO SOURCE         grey hollow dot, value replaced by an em-dash "—", never a 0
  ◌ NOT INSTRUMENTED  grey dashed outline, explanatory caption
  ◑ PARTIAL           amber, with a count ("3 of 5 sources")
An unreadable source must be visually IMPOSSIBLE to mistake for a healthy zero.

ICONOGRAPHY: Minimal line icons (Lucide). No occult ornament. Status is carried by the
dot + color + word, never by color alone (accessibility).

MOOD: trustworthy, legible, quiet under normal conditions and unmissable during an
incident. The operator should be able to answer "is anything wrong, and where" in under
three seconds.
```

---

## SCREEN 1 — Admin Shell (navigation + chrome)

> Unifies the light legacy sidebar and the full-bleed dashboard chrome into one shell.

```
Design the persistent shell for an operator admin console, dark obsidian glass.

LAYOUT: Fixed left rail 240px on desktop (≥1024px); collapses to a horizontal scrolling
tab strip under a compact top bar on mobile. Main content area is fluid with comfortable
padding, max-width ~1600px.

LEFT RAIL: Product wordmark "alchm.kitchen" at top with a small "ADMIN" mono-caps label
beneath. Then a single flat list of 10 sections, each a line icon + label:
Overview · Dashboard · Reliability · MCP Network · Users · Onboarding · Settlements ·
Chat Reports · Comment Reports · Settings.
- The active item gets a violet left-edge bar plus a slightly elevated glass fill.
- Sections that can carry a backlog (Settlements, Chat Reports, Comment Reports) show a
  right-aligned count badge. Design THREE badge states: a real count (rose pill), zero
  (no badge at all — not a "0"), and unknown (a small grey "—" pill, because the count
  query itself can fail).
- Bottom of rail: a compact system-health strip — one status dot + the word OK/DEGRADED/
  INCIDENT/UNKNOWN + "checked 2m ago". This is a global at-a-glance and must be visible
  from every tab.

TOP BAR: breadcrumb, a global search input ("search users, orders, agents… ⌘K"), a live
clock in mono, and an operator avatar/identity chip.

Show the rail in both expanded and mobile-collapsed states.
```

---

## SCREEN 2 — Overview (`/admin`) — the panel grid

```
Design the main operator overview: a responsive grid of glass telemetry panels, dark theme.

Panels, in priority order top→bottom:
1. LAUNCH READINESS strip — horizontal row of subsystem chips (Stripe, Payments, On-chain
   ESMS, Recipe NFT, Privy, Amazon, Agent network, Email, Alerting), each showing
   "configured N/M" with a status dot. Plus a settlement-backlog callout that shows both
   the pending COUNT and the OLDEST PENDING AGE (an old stuck payout is the real hazard).
2. TODAY'S HIGHLIGHTS — 4–6 large mono numbers with 24h-vs-prior-24h deltas (up/down
   arrow + %). Each number must support the NO SOURCE state ("—", grey).
3. LIVE ACTIVITY — a chronological merged event feed with category filter chips
   (signup, sign-in, onboarding, recipe, token, agent). Each row: timestamp (mono,
   relative), a category dot, actor name (a link), and a short description.
4. SYSTEM STATUS — a grid of flow tiles (Auth, Onboarding, Recipes, AI, Economy,
   Payments, Agents, Database, MCP). Each tile: name, status dot + word, one-line summary,
   2–4 mono micro-metrics, and — important — a "→ investigate" affordance that deep-links
   somewhere useful. Tiles must be expandable to reveal recent issues.
5. RELIABILITY OVER TIME — see Screen 8.

Show one panel deliberately in the NO SOURCE state and one in DEGRADED, so the empty and
unhealthy treatments are visible alongside healthy ones.
```

---

## SCREEN 3 — The Component Kit  ⭐ *generate this first*

```
Design a component specimen sheet for an operator console design system, dark obsidian
glass. This is the atomic vocabulary every other screen composes from. Show each component
in ALL its states, side by side, labelled.

1. PROVENANCE BADGE — a tiny mono-caps pill with a leading dot. Five variants:
   ● LIVE (emerald) · ◐ STALE 4m (amber) · ○ NO SOURCE (grey) ·
   ◌ NOT INSTRUMENTED (grey, dashed border) · ◑ PARTIAL 3/5 (amber).

2. METRIC — a labelled number. Show: (a) healthy large mono value with a caption,
   (b) with a delta chip (+12% emerald / −8% rose), (c) the NO SOURCE variant where the
   value is an em-dash "—" in grey with a "no source" sub-caption, and (d) a genuine
   measured zero, which must look CLEARLY different from (c). Make (c) vs (d) unmistakable
   — this distinction is the single most important thing in the whole system.

3. STATUS TILE — name, status dot + word, summary line, micro-metrics row, expand chevron,
   and a deep-link action. Four states: OK, DEGRADED, INCIDENT, UNKNOWN.

4. EMPTY STATES — three semantically different kinds, visually distinct:
   (a) "All clear" — genuinely nothing pending, calm emerald check.
   (b) "Never used" — the feature has no history at all; neutral grey, explanatory
       ("No restaurant order has ever been placed"). Must NOT look like success.
   (c) "Can't measure" — the query failed; amber/grey, explicit ("This is not a zero").

5. DESTRUCTIVE / MONEY ACTION BUTTON — for irreversible operations (retry a transfer,
   refund, revoke sessions, ban). Show: default, hover, in-flight spinner, success, and
   failure-with-reason. Include a confirmation popover design that restates the exact
   consequence and the amount.

6. DATA TABLE — dense mono rows, sticky header, sortable columns, a row-hover state that
   clearly reads as clickable, pagination footer showing "51–100 of 1,284", and a
   loading skeleton. Include an inline "filters active" indicator.

7. TIMESTAMP + ENTITY LINK — relative time ("4m ago") with the absolute time on hover;
   entity chips for user / agent / order that look like links and carry a tiny type icon.

8. ALERT ROW — severity pill (info/warn/error), title, component, relative time, and a
   DELIVERY indicator showing which channels the alert reached vs failed
   (e.g. "email ✓ · slack ✗"). Design the "undelivered" treatment as a rose warning.
```

---

## SCREEN 4 — Moderation Queue *(fixes the two unreadable tabs)*

```
Design a moderation queue for reported chat messages and reported feed comments, dark
obsidian glass. One layout serving both.

- Status filter tabs across the top: Open · Resolved · Dismissed, each with a count
  (and a grey "—" when the count is unknown).
- A list of report cards. Each card: reporter identity chip, reported-at relative
  timestamp, a severity/reason tag, and the reported content quoted in a recessed
  darker inset block with clear "quoted content" framing. If the content was removed,
  show an explicit italic "(removed)" placeholder.
- CRITICAL — each card must identify and link to the OFFENDER (the account that posted),
  with a small repeat-offender indicator ("3 prior reports") when applicable.
- Action row per card: Hide / Unhide (a true toggle, both directions), Dismiss,
  and "View account →". Actions show in-flight and failure states inline on the card —
  a failed action must never silently look like a success.
- Bulk selection with a sticky action bar for multi-resolve.
- Pagination, with the total backlog count always visible.
- Empty state: use the "All clear" variant, but if the queue is empty because the source
  could not be read, use the "Can't measure" variant instead.
```

---

## SCREEN 5 — Users (list + detail)

```
Design two linked screens for user administration, dark obsidian glass.

LIST: a dense sortable data table. Columns: user (avatar + name + email), role/tier chip,
status (active/suspended) dot, signup date, last seen, token balance (mono), and a
row-action menu. Above it: a search field that makes clear it matches name, email, AND id;
filter chips for role, status, and tier; and a result count. Rows are obviously clickable.
Include the loading skeleton and a "search returned nothing" state distinct from a
"couldn't load" state.

DETAIL: a header with identity, tier, status, join date, and primary actions
(Grant tokens · Suspend/Activate · Revoke sessions). Below, a two-column layout:
- Left: profile facts, subscription state, token balances by type (mono figures).
- Right: a vertical activity TIMELINE — sign-ins, onboarding steps, purchases, grants,
  moderation events — each with an icon, relative time, and detail.
Also design an "active sessions/devices" list with a per-device revoke, and make the
result of a revoke explicit (what actually happened, when it takes effect).
Every numeric field needs its NO SOURCE variant.
```

---

## SCREEN 6 — Settlements (irreversible money actions)

```
Design an operator screen for resolving stuck restaurant payments, dark obsidian glass.
This screen moves real money — it must be sober and unambiguous.

- Header summary: count pending, oldest pending age (prominent — age is the hazard),
  and total value at risk.
- A table of stuck orders. Each row MUST surface the two fields that decide the operator's
  choice: payment_status and whether a stripe_transfer_id already exists. Also: restaurant
  name, customer (linked), amount + currency, created-at age, and current status chips.
- Per row, two actions: "Retry transfer" and "Refund ESMS". The UI must make clear which
  one is valid for that row's state and disable the other WITH a reason tooltip, rather
  than letting the operator discover it from a server error.
- A confirmation popover restating: the exact amount, the restaurant, the customer, and
  the irreversibility.
- Design the result states inline per row: succeeded, failed with reason, and already-
  resolved-by-someone-else.
- TWO different empty states, and they must not look alike:
  (a) "No orders awaiting settlement — 42 settled to date" (calm, healthy).
  (b) "Rail not yet in use — no restaurant order has ever been placed. This screen stays
      empty until the crypto-food rail goes live; it is not a sign of health." (neutral
      grey, explicitly NOT a success state.)
```

---

## SCREEN 7 — Settings / Launch Readiness

```
Design a launch-readiness configuration board, dark obsidian glass.

- A grid of subsystem cards: Stripe, Restaurant crypto-food payments, On-chain ESMS,
  Recipe NFT, Privy, Amazon Fresh, Agent network, Email, Alerting.
- Each card: subsystem name, a one-line purpose, a READY/PARTIAL/MISSING status, an
  "N of M configured" progress meter, and an expandable list of individual checks.
- Each check row shows a NAME and the ENV VAR it derives from, plus a present/absent
  indicator. CRITICAL: this board reports presence only — it must never display a secret's
  value. Design the absent state as an explicit "not set", and mark which checks are
  public (NEXT_PUBLIC_*) versus secret with a small lock icon.
- A platform-facts section (version, region, runtime). Each fact needs a source caption —
  static facts must be visibly labelled as static with an "as of" date, so a hardcoded
  value can never masquerade as live.
```

---

## SCREEN 8 — Reliability over time

```
Design a panel answering "is the platform getting better or worse", dark obsidian glass.
Three stacked sections.

1. SYSTEM HEALTH HISTORY — a horizontal status ribbon: one thin cell per hourly snapshot
   across 7 days, colored OK/DEGRADED/INCIDENT/UNKNOWN, with time labels at each end and a
   hover tooltip per cell. Above it: a large uptime percentage, and a week-over-week drift
   chip reading e.g. "▲ degrading 14.4% → 82.6% unhealthy".
2. SYNTHETIC PROBE RELIABILITY — a compact table: probe name (mono), runs, failure RATE
   (not just a count), p50 and p95 latency, and last error. Rows with a nonzero failure
   rate are tinted amber; ≥5% are rose. Latency at or above a timeout threshold gets a
   visible marker.
3. ALERT DELIVERY — one card per channel (email, slack) showing delivered/attempted as a
   ratio, a delivery-rate bar, and the last failure reason in mono. Design the catastrophic
   case prominently: a channel at 0/176 with the reason "ALERT_SLACK_WEBHOOK_URL not set"
   must read as an urgent rose failure, because alerts firing into the void is worse than
   no alerting at all.
```

---

## CONDENSED ONE-SHOT PROMPT  *(single paragraph, Stitch quick mode)*

```
Design a dense, professional operator admin console in a refined dark obsidian-glass theme
(dark only, never light surfaces) — Linear/Vercel dashboard calm with a restrained
alchemical signature, never a sci-fi terminal. Backgrounds #07060B/#0E0C16/#15121F; text
#F2EDFF, #B5ADCC, #6E6884; violet accent #BF83FE, gold #E9A23B; element dots Fire #FF7D5C,
Water #3BB9ED, Earth #94B96D, Air #DFCC99 — and propose four NEW dedicated status hues
(ok / degraded / incident / unknown-grey #6E6884) that are visibly distinct from those
element colors, since the console currently reuses them and the two collide. Glass panels, white
2.5–5.5% fill, 1px hairline borders, 14px radius, subtle blur. Cormorant Garamond for panel
titles, Manrope for UI, JetBrains Mono with tabular figures for every number, ID, timestamp
and status word; micro-labels uppercase with wide tracking. Screens: a fixed 240px left
nav rail with backlog badges and a global health strip; an overview grid of telemetry
panels (launch readiness, headline metrics with deltas, live activity feed, system-status
flow tiles); a moderation queue of report cards with offender links and hide/dismiss
actions; a dense users table with a detail page and activity timeline; a settlements table
for irreversible money actions with confirmation popovers; and a reliability panel with an
hourly status ribbon, a probe failure-rate table, and per-channel alert-delivery cards.
Crucially, design an explicit provenance vocabulary used everywhere — LIVE, STALE, NO
SOURCE, NOT INSTRUMENTED, PARTIAL — where a metric whose source failed renders as a grey
em-dash and is visually impossible to confuse with a real measured zero, and where three
distinct empty states exist: "all clear", "never used", and "cannot measure".
```

---

## After Stitch generates — wiring notes

Follow the `menu-planner` precedent: **synthesize into the real app, do not paste Stitch's
scaffold.** Specifically:

1. **Use app tokens, not Stitch's hex.** The hex values above already equal the
   `globals.css:312+` custom properties. Wire to `var(--bg)`, `var(--fg)`, `var(--line)`,
   `.alchm-panel`, etc. Drop Stitch's CDN Tailwind config, its invented nav, and any
   placeholder copy.
1b. **Land the status tokens before any component work.** Add `--status-ok`,
   `--status-warn`, `--status-incident`, `--status-unknown` to `globals.css` next to the
   existing tokens, then replace the 7-file `#FF5252` literal and the `--el-*` status
   aliases with them. Until this exists, every migrated panel re-encodes the collision.
2. **Build the kit first**, at `src/components/admin/kit/` — `ProvenanceBadge`, `Metric`,
   `StatusTile`, `EmptyState`, `AdminAction`, `DataTable`, `EntityLink`, `AlertRow`.
   Everything else is a migration onto it. This matches Phase A of
   `docs/admin/UPGRADE_PLAN.md`.
3. **Order of migration** (lowest risk → highest value):
   - `admin/layout.tsx` shell onto dark tokens. This **simultaneously fixes** the two
     unreadable moderation tabs, so migrate `chat-reports` and `feed/comment-reports`
     in the same commit — they already use dark classes.
   - Then the 9 panels in `src/components/admin/*Panel.tsx`.
   - Then `users`, `settings`, `mcp`, `onboarding`, `settlements` pages.
   - `_dashboard/*` needs **no** color migration (already on tokens) — only adopt the kit's
     provenance components to replace its ~25 hand-typed `● LIVE` literals.
4. **Do not regress the honesty work.** `ReliabilityPanel`, `SettlementPanel`, and the
   alert-delivery rendering have tests pinning their empty/degraded states
   (`src/components/admin/__tests__/`). Reskin must keep those strings or update the tests
   deliberately — they are the guard against fabricated zeros.
5. **Icons:** Lucide, consistent with the rest of the app.
6. **Dedup:** `_dashboard/dashboard.css` re-declares tokens that `globals.css` already
   defines globally. Collapse to one source while migrating.
7. **Accessibility floor:** status must never be conveyed by color alone (dot + word), and
   every surface must clear 4.5:1 body contrast — the defect being fixed here measured
   1.07:1.
