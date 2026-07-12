# Tables Design Spec — distilled from the Stitch export (2026-07-11)

Source: six Stitch screens (see `stitch-output/README.md`). This document maps every design decision in that export onto this repo's stack (Tailwind config, `globals.css`, lucide-react, existing `(alchm)` theme). Implementation agents build from THIS file.

## 1. Token mapping (Stitch → repo)

| Concept | Stitch value | Repo target |
|---|---|---|
| Void (page bg) | `#07060B` (used on Plan/Memory/Profile/Discover) | ✅ already `alchm-bg #07060B` — standardize; Tables Home used `#141218`, treat that as WRONG, always void |
| Surface / containers | `surface #141218`, `surface-container #201f25`, `-low #1c1b21`, `-high #2b292f`, `-highest #36343a`, `-lowest #0f0d13` | map to existing `alchm-bg-elev #0E0C16` + white-alpha glass; do NOT import the whole M3 tonal ladder — glass panels replace it |
| Copper (primary) | `#fec184` (light) / `primary-container #e0a66b` | `alchm-copper` (oklch 0.78 0.14 65 ≈ #e0a66b); add `alchm-copper-bright: #fec184` for icon/accent tints |
| Violet (secondary) | `#e1b6ff` (light) / gradient stop `#B57EE0` / `secondary-container #632f8c` | `alchm-violet` (oklch 0.72 0.18 305 ≈ #B57EE0); add `alchm-violet-bright: #e1b6ff` |
| Text | `on-surface #e6e1e9`, `on-surface-variant #d5c3b5` (warm!) | keep `alchm-fg #F2EDFF` scale; the warm variant tone is a nice touch → optional `alchm-fg-warm: #d5c3b5` for metadata |
| Gradient | `linear-gradient(135deg, #e0a66b → #b57ee0)` (Stitch mixes 90deg/135deg and bright/deep stops) | ONE canonical: `135deg, alchm-copper → alchm-violet`; utilities `.text-gradient-alchm` and `.bg-gradient-alchm` |
| Glass panel | `rgba(255,255,255,0.03–0.05)` bg, `blur(24px)`, border `white/12%`, hover border `white/25%` | ≈ existing `.glass-card-premium`; add lighter `.glass-panel` (0.03 bg, no gradient) for dense layouts |
| Glow (live/violet) | `box-shadow: 0 0 15px rgba(181,126,224,0.6)`; pulse keyframes `pulse-glow` | `.glow-violet`, `.glow-amber` (`rgba(254,193,132,0.6)`) + `animate-pulse-glow` keyframes |
| Radii | cards `rounded-xl` (12px), feed artifact cards `rounded-[32px]`, chips/buttons `rounded-full` | keep repo `rounded-2xl` for standard cards; feed artifact cards get `rounded-[32px]` (signature) |
| Fonts | Plus Jakarta Sans (display/headline/body) + Space Mono (labels) | do NOT add new font loads; map display/body → existing `--f-body`, labels → existing `--f-mono` idiom (`.t-mono`); keep the SCALE below |
| Type scale | display-lg 48/56 -0.02em 700; display-lg-mobile 32/40; headline-md 24/32 600; body-lg 18/28; body-md 16/24; **label-xs 10/16 +0.1em 700 uppercase mono** | adopt as Tailwind fontSize entries `display-lg`, `headline-md`, `body-lg`, `label-xs` (label-xs is the signature metadata style, already close to repo's tiny-mono idiom) |
| Icons | Material Symbols Outlined (FILL variation for active) | lucide-react (see §5 mapping); active state = filled variant or `strokeWidth` bump + color |
| Ambient aura | fixed radial blobs: violet `opacity-10 blur-[100px]` top-left, copper `opacity-5 blur-[120px]` bottom-right; card-level `.aura-glow` 300px radial violet 10% | one `<TablesAura />` fixed background component + optional per-card aura div |

**Element colors — Stitch was inconsistent (3 palettes across screens). Standardize on repo's existing element palette:**
Fire = orange (#ff6b6b accents ok), Water = blue (#6B8EAD–#8da5ff range), Air = violet/gray, Earth = green (#8fbc8f). Element chips: `bg-black/40 border border-{el}/30 backdrop-blur-md` + glowing 2px dot (`shadow-[0_0_5px_{el}]`).

## 2. Shared component kit (build once, used across all six screens)

1. **`GlassPanel`** — `.glass-panel` recipe above; props: `interactive` (hover border/bg lift), `rounded` (2xl | [32px]).
2. **`GradientText` / `GradientButton`** — canonical 135° copper→violet; button hover = violet glow `0 0 20px rgba(181,126,224,0.4)` + slight translate-y.
3. **`LabelXS`** — 10px mono uppercase tracking-widest metadata label (the system's signature).
4. **`AvatarClusterRing`** — circular tile: `p-[2px]` gradient ring (violet-gradient + `.glow-violet` = LIVE; solid copper + `.glow-amber` = upcoming; dashed white/20 = "Host a Table" +); inner `bg-surface` circle containing up to 3 overlapping mini avatars + a bottom-right element-glyph badge (`w-5 h-5 rounded-full bg-surface border border-white/10`).
5. **`AvatarRow`** — overlapping `-space-x-2` avatars `border-2 border-surface/80`, overflow cell `+N`.
6. **`PresenceAvatar`** — avatar + bottom-right online dot (`bg-violet` + `shadow-[0_0_8px]` + border-2 border-void; `animate-ping` layer when live).
7. **`CompositeRadialBadge`** — small (w-12) conic-gradient 4-element donut with dark inner circle + glyph. Feed cards use pure CSS `conic-gradient`; Live Table uses SVG ring arcs (`stroke-dasharray` per element, `-rotate-90`); Discover uses an SVG **compatibility ring** with gradient stroke + centered `NN%`. Build one SVG component with variants: `composite` (4 arcs) | `compatibility` (single gradient arc + % label).
8. **`ElementChip`** — pill with glowing dot + `LabelXS` text ("WATER DOMINANT", "FIRE · ARIES SUN").
9. **`ElementBars`** — Cosmic Identity: per-element 1px-high track (`bg-surface-container`) + colored fill + tiny mono % labels.
10. **`ReactionBar`** — elemental reaction buttons: ⚡ spark + 🔥💧🌱🌬 (Stitch showed subsets; ALWAYS render all five), each `flex items-center gap-1` + count in `LabelXS`, hover tints to element color. Chip variant (Memory screen): `rounded-full px-4 py-2` bordered.
11. **`BottomNav`** — 5 tabs: Kitchen, Discover, Plan, **Tables** (glyph: ring/orbital — Stitch used `blur_circular`), Profile. Container `bg-surface-container-lowest/80 backdrop-blur-2xl border-t border-white/10 rounded-t-xl pb-safe`. Active tab = copper text + `bg-surface-container-highest/50 rounded-full p-2 ring-1 ring-primary/30` + amber glow (Home screen also floats it `-mt-6 w-16 h-16` — adopt the simpler non-floating variant). Integrate with existing `MobileGlassTabBar` rather than a parallel nav.
12. **`ChatBubble`** — other: `bg-surface-container/40 blur border-white/5 rounded-2xl rounded-bl-sm p-3.5 max-w-[75%]` + tiny avatar; self: gradient tint `from-primary/15 to-secondary/15 border-secondary/20 rounded-br-sm` right-aligned; message reactions = tiny element-icon badges overlapping bottom-right (`-bottom-2.5 -right-2`, stacked `-ml-2`).
13. **`ChatComposer`** — fixed above bottom nav, gradient fade backdrop, pill `bg-surface-container-highest/60 blur-2xl border-white/10 rounded-full p-1.5 pl-5`: transparent input ("Share a thought...") + photo button + gradient circular send w/ violet glow.
14. **`RsvpChip`** — `LabelXS` pill: JOINED (tertiary/green-ish border) / INVITED (copper border) / DECLINED (muted).

## 3. Per-screen blueprints

### 3.1 Tables Home (`/commensal` rebuilt, route may become `/tables` alias)
- Fixed top bar: search icon | gradient "Alchm" wordmark | bell. (Integrate with existing `RedesignedHeader` — don't fork it.)
- **Table rail**: horizontal snap-scroll of `AvatarClusterRing` tiles: first = Host (+), then LIVE tiles (violet ring/glow, label "LIVE"), then upcoming (amber, label = time "8:00"/"TOM").
- **Feed**: `TableArtifactCard` (rounded-[32px] GlassPanel):
  - header: host avatar (+ pulsing violet live-dot if live), name (16px semibold), `LabelXS` "2H AGO · KYOTO", overflow `more_horiz`;
  - guest row: `LabelXS` "GUESTS" + `AvatarRow`;
  - media: `aspect-[4/5]` photo, hover `scale-105 duration-700`, vignette `bg-gradient-to-t from-background/90 via-background/20 to-transparent`;
  - overlay bottom: `ElementChip` ("WATER DOMINANT") + 28px gradient-text dish title + `CompositeRadialBadge` (conic) bottom-right;
  - footer: `ReactionBar` + comment + share, `border-t border-white/5 bg-black/20`.

### 3.2 Live Table
- Header row: `LabelXS` LIVE pill (violet, `animate-ping` dot) over gradient 24px table title; host controls right: lock + close icon buttons (`w-10 h-10 rounded-full bg-surface-container-highest/40 border-white/5 blur`), close tinted error.
- **Presence row**: host avatar 56px w/ copper border + glow, guests 48px w/ violet online dots, trailing "+ INVITE" chip (opens invite sheet: link/QR/search).
- **Composite panel** (collapsible GlassPanel): SVG dual-arc ring (dominant element arc + minor arc) + element icon center; text: `LabelXS` "TABLE ENERGY" + one-line reading ("Balanced toward Water — slow-cooked, communal dishes"); chevron expands to full `CompositeEnergyVisualizer` (existing component, dark theme).
- **Up Next menu card**: left 1px copper gradient accent bar, 64px dish thumb, `LabelXS` "UP NEXT" + 18px dish name, circular swap button → recommendation swap.
- **Live Discussion**: divider with `LabelXS` centered label; `ChatBubble` thread; message-level element reactions.
- Fixed `ChatComposer` above `BottomNav`.

### 3.3 Plan a Table
- Centered gradient-text title input ("Name your table...", 32px, transparent).
- Schedule+venue GlassPanel: date + time inputs (icon-prefixed `input-glass` rows: `bg-white/[0.03]`, focus border violet), divider, venue search row, "Cooking at home" toggle (peer-checked copper).
- Invite GlassPanel: "Invite Guests" 24px; 3-button grid (link / qr_code / group_add) icon-over-`LabelXS`; person-search row; guest list rows (avatar + name + `RsvpChip`) with hairline dividers.
- Composite preview GlassPanel: `LabelXS` "TABLE ENERGY" corner tag; row of 48px element circles for joined guests (glowing borders) + dashed "+" placeholders for empty seats; copy "Waiting for more guests to reveal the full elemental profile."
- CTA: full-width gradient pill "Set the Table" (violet glow, hover lift).

### 3.4 Table Memory (`/tables/[id]` past state)
- Floating glass back button (no full nav — immersive page).
- **Hero collage**: h-[400–500px] grid `grid-cols-3 grid-rows-2 gap-1` (big cell `col-span-2 row-span-2` + 2 small), hover zoom; void gradient overlay; bottom-left: `LabelXS` violet "TABLE MEMORY", gradient display title ("Solstice Feast"), date w/ calendar icon.
- Bento grid (md:12-col: left 7 / right 5):
  - **Who broke bread**: 64px avatars, host has copper ring + star badge; names in `LabelXS`.
  - **Resonance**: reaction chips row; comment thread (hairline dividers, `LabelXS` colored author names — violet guests / copper host, timestamps); input "Add a memory...".
  - **Energy Record** (right): `LabelXS` tracking-[0.2em] header; radar-style chart: concentric rings (dashed copper inner, violet mid) + 4 glowing element dot-nodes at N/E/S/W + translucent SVG polygon connecting values; **The Sequence** menu list: dish name 18px in element color + muted sub-line (pairing notes).
  - Actions: gradient "SHARE THIS TABLE" (ios_share icon) + ghost "HOST AGAIN".

### 3.5 Profile (rework of `/profile/[userId]`)
- Left column (md:4): identity GlassPanel — 128px avatar in gradient ring + pulsing live dot; name 24px, @handle muted; `ElementChip` "FIRE · ARIES SUN" (copper); action row: gradient FOLLOW + glass **BREAK BREAD** (invite-to-table CTA — adopt this naming) + chat icon button.
- Stats GlassPanel: 2×2 grid — TABLES HOSTED / TABLES JOINED / COMMENSALS / FOLLOWERS (24px copper number over `LabelXS`).
- Cosmic Identity GlassPanel: `ElementBars` with % labels.
- Right column (md:8): "Table Memories" header + HOSTED/ATTENDED `LabelXS` tab toggle (copper underline active); 2-col gallery of memory cards: h-48 photo (hover zoom), composite badge top-right, `LabelXS` date badge bottom-left, 18px title, 2-line clamp description, footer: mini `AvatarRow` + "VIEW MEMORY" in copper `LabelXS`.
- Desktop: full top nav w/ inline links; mobile: `BottomNav` (Profile active).

### 3.6 Discover
- Search pill (`rounded-full py-4 pl-12` glass, violet focus ring) "Search realms, energies, or ingredients...".
- Filter chips: Near me (active: copper border+tint) / My element / Open tables / People.
- **Tables near your energy** (header + pulsing violet dot): grid of match cards — compatibility ring (SVG gradient stroke, % center) top-left; "N SEATS LEFT" `LabelXS` pill top-right (pulsing copper dot when ≤2); h-32 photo; 20px title; date row; footer `border-t`: host avatar + `LabelXS` "HOSTED BY" + name, circular arrow CTA.
- **Map strip**: h-48 full-bleed-on-mobile dark map image + void gradient; "Explore the Realm" + "N open tables nearby"; glass "VIEW MAP" chip. (Implement with existing restaurant-map assets or static styled tiles; pairs with best-match/Overpass work.)
- **Kindred alchemists**: horizontal scroll of 240px person cards — compat % top-right (link icon), 80px gradient-ring avatar, name, element-sign chip (element-colored), "N mutual commensals", outlined violet FOLLOW pill.

## 4. Deviations from Stitch (deliberate)
1. **No CDN Tailwind / Google Fonts / Material Symbols** — repo Tailwind config + existing font stack + lucide-react.
2. **Placeholder images expire** — real sources: R2 cook photos, restaurant/nanobanana imagery, user avatars (PR 4 upload pipeline; until then OAuth image or generated sigil fallback).
3. **Element palette unified** (Stitch shipped 3 variants).
4. **Full 5-reaction set everywhere** (Stitch rendered subsets).
5. **Accessibility** (Stitch has none): tablist/tab roles on tab toggles, `role="progressbar"`+`aria-valuenow` on rings/bars, labels on icon buttons, alt text on media, focus-visible rings (violet).
6. **One nav** — extend `MobileGlassTabBar`/`RedesignedHeader` with the Tables tab + active-pill treatment; don't ship the parallel navs Stitch generated per screen.
7. **Copy voice** — keep Stitch's ("Who broke bread", "Set the Table", "BREAK BREAD", "Resonance", "The Sequence", "Add a memory..."); NO token amounts anywhere (invisible economy).
8. **REAL IDENTITIES ONLY — never Stitch's invented personas.** Every demo, sample, seed, dev-preview, or marketing identity ("Chef Elara Vance", "Chef Orion", "Elena R.", "Marcus T.", "Julian Vance", "Amara Lin", "Elias Thorne", "Silvia Vane" — all fictional) must be replaced with the app's ACTUAL roster: **historical agents** (chart-bearing sages served by `GET /api/commensal/companions` cosmic roster + `GET /api/community/agents` directory + the feed's historical-agent posts) and **planetary agents**. Use their real names, bios, dominant elements, and profile data from the DB. Where a visual avatar is needed and the agent has none, use the element sigil / `Glyph` fallback — do not invent faces or names. Table guests in mockups and seeds = mix of real humans (dev/test users) + historical agents, matching how "Invite to Table" actually works today.

## 5. Icon mapping (Material Symbols → lucide-react)
search→Search · notifications→Bell · add→Plus · more_horiz→MoreHorizontal · chat_bubble→MessageCircle · share/ios_share→Share2 · lock→Lock · close→X · swap_horiz→ArrowLeftRight · add_a_photo→Camera · send→Send · calendar_today→Calendar · schedule→Clock · link→Link · qr_code→QrCode · group_add→UserPlus · person_search→UserSearch · water_drop→Droplet · local_fire_department→Flame · eco→Leaf · air→Wind · auto_awesome→Sparkles · near_me→Navigation · map→Map · restaurant→UtensilsCrossed · explore→Compass · person→User · blur_circular/blur_on→existing alchm `Glyph` ring/orbital · arrow_forward→ArrowRight · arrow_back→ArrowLeft · star→Star · keyboard_arrow_down→ChevronDown
