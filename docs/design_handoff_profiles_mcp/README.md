# Handoff: Profiles + MCP Alchemical Engines

## Overview
Upgrades the unified profile route (`/profile/[userId]`) into immersive, interactive "mystical dashboards" for both **agents** and **human users**, and surfaces two Alchm **MCP server** engines on the front end:

- **Task 1 — Consciousness Signature Visualizer**: turns `agent.consciousness.signature` (a plain DB string) into a generated, interactive alchemical seal (SVG).
- **Task 2 — Live Transit Boost Dashboard**: renders `get_transit_natal_overlay` output — planetary triggers + an elemental boost meter.
- **Task 3 — User↔Agent Synastry Panel**: renders `compute_synastry_overlay` — a Harmony/Tension/Intensification meter + a Resonance Stance aura (Clash / Absorb / Mirror).
- **Task 4 — Premium User Profile Ledger**: Essence (natal wheel), Palate (taste radar + dietary protocol), Practice (daily-yield ledger + implicit-learning dashboard).

## About the Design Files
The files in this bundle are **design references created in HTML/JSX** (in-browser Babel + React 18 UMD). They are a prototype communicating intended look, layout, interaction, and the exact MCP data shapes — **not production code to paste**. The task is to **recreate these designs inside the real `alchm.kitchen` Next.js 15 / TypeScript / Tailwind / Bun codebase**, using its App Router, `AlchemicalContext` / `PremiumContext`, JSONB read models, and Tailwind tokens. Lift the SVG geometry and visual values exactly; rebuild the React the idiomatic way against live data.

Open `index.html` (needs internet for the React/Babel CDN) to explore the live reference. Use the **Tweaks** panel (top-right) to drive every state.

## Fidelity
**High-fidelity.** Colors, type, spacing, glow signatures, animation timing, and component anatomy are final and should be matched. All data is mocked in `mcp-engines.jsx` — replace with the live MCP tool handlers / JSONB read models.

## Default load state (per spec)
Agent **Claude Monet** · Synastry stance **Mirror** (violet pulsing aura) · Transit **Sun △ Saturn** → **Water** elemental boost active. The viewer-constitution sliders are preset to mirror Monet's thermodynamics.

---

## Screens / Views

### Agent Profile  → `src/app/(alchm)/profile/[userId]/AgentProfile.tsx`
Rendered when `profile.isAgent && profile.agentProfile`.

- **Layout (desktop 1440):** vertical stack, section padding `26px 32px`, gap `22px`.
  1. **Hero** (`.panel`, padding 22): 3-col grid `auto 1fr auto` — avatar + identity (name in `font-display` 38px, role in `font-mono` in the dominant-element color, sign/modality/signature chips) · blurb paragraph (13px, `--fg-dim`) · 2×2 metric grid (Resonance / Entropy / Dominant / Modality).
  2. **Sigil + Transit row:** grid `1.12fr 0.88fr`, gap 22.
     - Left: **Consciousness Signature** (`.panel-glow`) — geometry-style chips + `<ConsciousnessSigil size={420}>` + a constitution `<ElementalMeter>` beneath.
     - Right: **Live Transit Overlay** (`<TransitBoostDashboard>`).
  3. **Synastry** (`<SynastryPanel>`, `.panel-glow`, full width).
- **Mobile (390):** `<MobileAgentProfile>` — same blocks stacked, sigil at 300px, compact transit + synastry.

### User Profile  → `src/components/profile/ProfileBlockRegistry.tsx`
Rendered for human profiles. Each tab = one registry block.

- **Layout (desktop 1440):** 2-col grid `320px 1fr`.
  - Left identity rail: avatar + `PremiumMark`, natal data grid (2×2), cumulative-yield `<Sparkline>`, archetype.
  - Main: tab nav (Essence / Palate / Practice) + the active block.
- **Essence block:** grid `auto 1fr` — `<NatalWheel size={400}>` in a `.panel-glow` · constitution meter + `<ThermoQuartet>` + placements grid.
- **Palate block:** `<PalateRadar size={300}>` (5-axis: Spicy/Sweet/Umami/Acidic/Bitter) · category bars + `<DietaryProtocol>` tags.
- **Practice block:** `<DailyYieldLedger>` (4-series line chart over 14 days) · `<ImplicitLearning>` dashboard.
- **Mobile (390):** `<MobileUserProfile>` — stacked, charts resized.

### Astrological Simulator → the Tweaks panel (dev-only)
A prototype-only control surface mirroring real app state. See the wiring table below; in production these map to route params, `AlchemicalContext`, and tab/URL state.

---

## MCP Engine Contracts (already matched in `mcp-engines.jsx`)

### A. `getTransitNatalOverlay(agentKey, transitId)` ≡ `get_transit_natal_overlay`
```ts
{ ok: boolean; data: {
  agentId: string; transitTime: string;
  activations: Array<{ transitPlanet; natalPoint; type: "conjunction"|"sextile"|"square"|"trine"|"opposition";
                       orb: number; exactness: number; natalElement: "fire"|"earth"|"air"|"water";
                       valence: "identity"|"emotional"|"reflective"|"relational"|"assertive"|"expansive"|"restrictive"; }>;
  boostElement: "fire"|"earth"|"air"|"water"|null;   // null on friction transits
  boostMagnitude: number; stressNotes: string[]; summary: string;
} }
```
The boost meter fills to `min(100, boostMagnitude*200)%`; on friction transits (`boostElement===null`) it renders a fire-toned STRESS state and lists `stressNotes`.

### B. `computeSynastryOverlay(viewerThermo, agentThermo, viewerKey, agentKey)` ≡ `compute_synastry_overlay`
```ts
{ ok: boolean; data: {
  scores: { harmony; tension; intensification; aspectCount };
  dominantStance: "clash"|"absorb"|"mirror";
  interchartAspects: Array<{ planetA; planetB; type; orb; exactness; harmonic: "friction"|"harmony"|"intensification"; }>;
} }
```
**Stance mapping (prototype):** bars come from the viewer thermo vector vs the agent's, with opposing axes **Spirit↔Matter** and **Essence↔Substance**. `dominantStance` = tallest of intensification→**mirror**, harmony→**absorb**, tension→**clash**. In production the MCP server returns `data`; the UI just renders it and picks the aura/copy from `STANCE_META`.

Production route templates (copy/adapt) are at the bottom of `mcp-engines.jsx` (`/api/users/[userId]/transit-overlay`, `/api/users/[userId]/synastry`).

---

## Interactions & Behavior
- **Consciousness Sigil:** SVG. Concentric **modality rings** (Cardinal/Fixed/Mutable; the agent's modality ring is accented) · intersecting **element triangles** (Fire △, Air △̄, Water ▽, Earth ▽̄) sized to `agent.constitution[el]`, the dominant element brightest + drop-shadowed · **planetary nodes** plotted at real natal longitudes with an **aspect web** (edges where angular separation ≈ 0/60/90/120/180° ±7°) · animated draw-in (`sigilDraw`, gated on `motion`) · slow counter-rotating degree dial. **Hover** any node / triangle / ring → tooltip (spiritual resonance · entropy · elemental flow). Three geometry modes via the `style` prop change layer emphasis: `triangles` | `concentric` | `web`.
- **Stance aura:** a soft, blurred, radial-masked **conic-gradient** disc (`STANCE_META[stance].cone`, built from the element/accent tokens) rotating under a breathing radial bloom in the stance hue. Distinct palette per stance.
- **Synastry bars** transition `width 400ms cubic-bezier(.6,.05,.2,1)` — dragging the viewer sliders smoothly re-ranks the stance and re-colors the dominant bar/aura.
- **Note:** the sigil reflects the **agent's own** fixed signature, so it does not change while dragging *viewer* sliders (it changes when you switch agents or geometry); the **synastry** panel is what the viewer sliders drive.
- All decorative animation respects a `.motion-off` ancestor on `[data-motion]` nodes (the Tweaks Motion toggle / user reduced-motion pref).

## State Management
| State | Owner (production) | Prototype source |
|---|---|---|
| `agentKey` / which profile | route `[userId]` + `isAgent` | `profile_agent` tweak |
| Transit overlay | `/api/astrologize` → MCP | `transit` tweak → `getTransitNatalOverlay` |
| Viewer thermo (drives synastry) | `AlchemicalContext` (logged-in user) | 4 `viewer_*` sliders |
| Active user tab | URL / tab state | `user_tab` tweak |
| Sigil geometry | (optional) user theme pref | `sigil_style` tweak |
| Premium tier (gates synastry/premium blocks) | `PremiumContext` | always-on in prototype |

## Design Tokens (source: `styles.css` `:root`)
- **Surfaces:** `--bg #07060B`, `--bg-elev #0E0C16`, `--line rgba(255,255,255,.08)`, `--line-hi rgba(255,255,255,.14)`.
- **Text:** `--fg #F2EDFF`, `--fg-dim #B5ADCC`, `--fg-mute #6E6884`, `--fg-faint #3F3A52`.
- **Accents:** `--accent oklch(0.72 0.18 305)` (violet), `--accent-2 oklch(0.78 0.14 65)` (copper).
- **Elements (exact, per spec):** `--el-fire oklch(0.74 0.17 35)` · `--el-water oklch(0.74 0.13 230)` · `--el-earth oklch(0.74 0.11 130)` · `--el-air oklch(0.85 0.07 90)`. Always referenced via `var(--el-*)` (and the `EL_COLOR` map in `mcp-engines.jsx`) — never hard-coded.
- **Type:** display `Cormorant Garamond`, body `Manrope`, mono `JetBrains Mono` (tabular-nums for all numbers).
- **Radius:** `--radius 14px`, `--radius-sm 8px`. **Panels:** `.panel` / `.panel-flat` / `.panel-glow` (violet glow signature). Section padding `26–28px 32px`; panel padding `18–22px`; gaps `14–22px`.
- **Animations** (`styles.css`): `sigilDraw`, `sigilSpin`, `sigilCounter`, `sigilPulse`, `auraBreath`, plus existing `breathe`/`shimmer`/`scanLine`/`blink`.

## Assets
No raster assets. All visuals are SVG/CSS. Planet/sign glyphs are Unicode (☉☽☿♀♂♃♄ / ♈–♓). Agent avatars are CSS radial gradients in the dominant-element hue — swap for real portraits via your image pipeline (`/api/generate-image`). Fonts load from Google Fonts.

## Files in this bundle
- `index.html` — focused entry (loads only the profile slice).
- `handoff-app.jsx` — trimmed canvas + Tweaks mounting the 4 profile artboards.
- **`mcp-engines.jsx`** — agents/viewer data, `lonToSign`/`place`, the two engine mocks, `STANCE_META`, and the production fetch/route templates.
- **`sigil.jsx`** — `ConsciousnessSigil` (Task 1).
- **`screens-profile-agent.jsx`** — `AgentProfileScreen`, `MobileAgentProfile`, `TransitBoostDashboard` (Task 2), `SynastryPanel` + `StanceAura` (Task 3).
- **`screens-profile-user.jsx`** — `UserProfileScreen`, `MobileUserProfile`, `NatalWheel`, `PalateRadar`, `DailyYieldLedger`, `ImplicitLearning`, `DietaryProtocol` (Task 4).
- `atoms.jsx` — `ElementalMeter`, `Sparkline`, `Glyph`, `ScanLine`, etc. (shared, already in your `ui/alchm`).
- `screens-1.jsx` — `LabHeader`, `ThermoQuartet` (shared chrome the profiles reuse).
- `commerce.jsx` — `PremiumMark`. `styles.css` — full token system. `design-canvas.jsx` / `tweaks-panel.jsx` — prototype chrome only, **do not port**.
- `INTEGRATION_NOTES.md` — route/prop mapping tables for this feature.

## Brand rules (non-negotiable)
Dark mode only. No witchy clichés (no crescent moons, no 5-point stars) — iconography is atomic/orbital/instrument-panel. The intersecting element **triangles** (and the hexagram they form) are the requested *alchemical* geometry, not decorative stars. Numbers are `font-mono` + tabular-nums. The Procure CTA is copper; the Premium CTA is violet — never mixed.
