# alchm.kitchen — Auth + Navigation Revamp · Integration Notes

Companion to the existing `design_handoff_alchm_kitchen/README.md`. This doc covers the **new** files added in this session and how they map onto the production codebase (`src/...`).

---

## What's new in this session

### Files added
- `screens-auth.jsx`   — Sign-in, onboarding wizard (4 states), error page, re-auth modal, mobile variants
- `screens-auth-2.jsx` — Handshake splash, Welcome-back, Upgrade gate, Account & Sessions
- `screens-nav.jsx`    — IA audit, new header, mega-menus, command palette, mobile glass tab bar

### Single source of truth: `NAV_IA`
Lives at the top of `screens-nav.jsx`. **Header, footer, command palette, and audit map all read from this one constant.** When porting:

```
// src/config/navigation.ts
export const NAV_IA = { ... }
export const PRIMARY_KEYS = ['kitchen', 'discover', 'plan', 'commensal', 'lab']
```

Header (`LabHeader`), footer, palette, and any future sitemap import from here.

---

## Auth flow (drop-in mapping)

| Prototype screen     | Production route / component                        | Notes |
|---|---|---|
| `NewSignInScreen`    | `src/app/login/page.tsx`                             | One Google button. No email field. |
| `MobileNewSignIn`    | Mobile variant of `/login`                           | |
| `OnboardingFlow`     | `src/app/onboarding/page.tsx` + `OnboardingWizard`   | 4 states param: `step` 0=Moment, 1=Place, 2=Palate, 3=Ready |
| `MobileOnboarding`   | Mobile variant                                       | |
| `AuthHandshakeScreen`| New: post-callback splash, `/auth/establishing` or in `[...nextauth]` callback page | `progress` driven by real-time status if possible; otherwise optimistic curve clamped at 8s |
| `WelcomeBackScreen`  | Variant of `/login` when `localStorage.last_user` exists | Show before auth; don't trust the hint server-side |
| `AuthErrorScreen`    | `src/app/auth/error/page.tsx`                        | Auto-retry pattern visible for `OAuthCallback` and `Configuration` codes |
| `SignInModalScreen`  | `src/components/auth/SignInModal.tsx`                | Reuse for 15s trigger + `open-signin-modal` event |
| `UpgradeGateScreen`  | `src/app/upgrade/page.tsx`                           | Middleware redirects free users here with `?from=` |
| `AccountSecurityScreen` | `src/app/profile/security/page.tsx`               | Sessions, linked providers, cookie scope, agent-sync |

### Mesh propagation step
When the handshake's `MESH` step completes, call `update()` from `useSession()` before the final redirect — this prevents the middleware bounce the user mentioned (the `onboarding_completed=1` cookie pattern still applies).

### Returning-user hint
On successful login, write a minimal `last_user` hint to `localStorage`:

```js
localStorage.setItem('last_user', JSON.stringify({
  name: session.user.name,
  email: session.user.email,
  initial: session.user.name?.[0],
  // no tokens, no ids
}))
```

`/login` checks for this on mount and renders `WelcomeBackScreen` instead of the cold sign-in.

---

## Navigation revamp

### IA changes vs live site

| Was (live)                       | Becomes                                     |
|---|---|
| 14 flat top-level items          | 5 primary: Kitchen / Discover / Plan / Commensal / Lab |
| Emoji prefixes (🍽️ 🥬 🔥 …)        | `Glyph` atoms (atom · ring · diamond · flask · …) |
| Footer nav diverges              | Footer reads `NAV_IA` — cannot drift again  |
| Static search label              | Real `⌘K` command palette                   |
| "Sun Hour" plain text            | `PlanetaryChip` component                   |

### Mobile center action button
Wire to the **most high-value action** — recommend Recipe/Menu Composer, OR a barcode scanner if you have one planned. The button is intentionally large to telegraph "do something" not "navigate".

### Command palette indexing
Recommend indexing **all four**:
- Routes (from `NAV_IA`)
- Recipes (top 200 by your recommendation engine, refreshed nightly)
- Ingredients (full 2,901 — small payload)
- Quick actions (`Add to pantry`, `Compose tonight's menu`, etc.)

Use [`cmdk`](https://cmdk.paco.me/) on the React side — its primitives match what the prototype shows.

### Mega-menu prefetching
On hover/focus of a primary nav item, prefetch the featured tile's data (`fetch('/api/featured/' + key)`). The tiles in the prototype currently show static copy; in production they should be live.

---

## Tweaks panel (prototype only)

Drives the live walkthrough in the prototype canvas. **Do not port** — these are exploration controls. Real implementation uses actual routing + state.

- **Onboarding · Step** → drives `OnboardingFlow`'s `step` prop
- **Handshake · Progress** → 0..6, plus a "Cold start" toggle for the 8s budget mode
- **Upgrade · From** → `?from=` param simulation
- **Navigation · Mega-menu** → which menu is open
- **Navigation · Mobile state** → default / action-sheet-open

---

## What I did NOT design (intentional)

- **Sign-out confirmation modal** — trivial, follow existing modal pattern
- **Password / magic-link UI** — Google-only per the brief
- **Email verification landing** — flagged as out-of-scope
- **Subscription billing / payment UI** — Stripe Checkout handles this; only the upgrade gate is in scope
- **Cookie consent banner** — handle via existing pattern, not part of auth surface

---

## Open questions for the dev

1. **Handshake real-time vs optimistic** — does the auth callback emit progress events we can subscribe to (websocket/SSE), or do we run an optimistic curve client-side? Prototype assumes optimistic.
2. **Agent-sync indicator visibility** — should it show for all users, or only `@agentic.alchm.kitchen` emails as the original spec suggested? Currently shown for all; trivial to gate.
3. **Mega-menu hover delay** — 100ms feels right but should match the rest of the app's hover-intent timing.
4. **Mobile center button** — recipe composer? scanner? Decide before ship.

---

Cross-references: `design_handoff_alchm_kitchen/README.md` (existing screens), `src/lib/auth/auth.ts` (split config), `src/middleware.ts` (route gating).

---

# Profiles + MCP Alchemical Engines · Integration Notes (this session)

## Files added
- `mcp-engines.jsx` — in-process mocks of the two MCP tools + agent/viewer data + production fetch templates (commented at EOF)
- `sigil.jsx` — `ConsciousnessSigil` (Task 1)
- `screens-profile-agent.jsx` — `AgentProfileScreen` + `MobileAgentProfile`, hosting `TransitBoostDashboard` (Task 2) and `SynastryPanel` (Task 3)
- `screens-profile-user.jsx` — `UserProfileScreen` + `MobileUserProfile` (Task 4) and the viz atoms `NatalWheel`, `PalateRadar`, `DailyYieldLedger`, `ImplicitLearning`, `DietaryProtocol`

All four artboards live in the **Profiles · MCP Alchemical Engines** canvas section. Everything is driven live by Tweaks → see the wiring table below.

## Production route mapping

| Prototype | Production target | Notes |
|---|---|---|
| `AgentProfileScreen` | `src/app/(alchm)/profile/[userId]/AgentProfile.tsx` | Rendered when `profile.isAgent && profile.agentProfile`. Lift the hero + 3 panels. |
| `ConsciousnessSigil` | `src/components/ui/alchm/ConsciousnessSigil.tsx` | Pure SVG; props `{ agent, size, style, motion }`. No deps beyond `agent.consciousness.signature` + `agent.natalChart.planets` + constitution. |
| `TransitBoostDashboard` | section inside `AgentProfile.tsx` | Replace `getTransitNatalOverlay(agentKey, transitId)` with the `/api/users/[userId]/transit-overlay` fetch (template in `mcp-engines.jsx`). Output shape already matches `get_transit_natal_overlay`. |
| `SynastryPanel` | new tab/card in `AgentProfile.tsx` titled "Planetary Alignment & Resonance" | Gate on logged-in user. POST viewer natal/thermo to `/api/users/[userId]/synastry`; render `data.scores` (3 bars) + `data.dominantStance` (aura) + `data.interchartAspects`. |
| `UserProfileScreen` tabs | `src/components/profile/ProfileBlockRegistry.tsx` | Each tab = one registry block: `EssenceBlock` (NatalWheel + constitution + thermo + placements), `PalateBlock` (PalateRadar + category bars + DietaryProtocol), `PracticeBlock` (DailyYieldLedger + ImplicitLearning). |
| `page.tsx` | `src/app/(alchm)/profile/[userId]/page.tsx` | Branch on `isAgent`: agent → `AgentProfile`, human → tabbed registry blocks. The `LabHeader` stays in `app/layout.tsx`. |

## MCP tool contracts (already matched)
- `getTransitNatalOverlay(agentKey, transitId)` → `{ ok, data: { agentId, transitTime, activations[], boostElement, boostMagnitude, stressNotes[], summary } }` — identical to `get_transit_natal_overlay`.
- `computeSynastryOverlay(viewerThermo, agentThermo, viewerKey, agentKey)` → `{ ok, data: { scores: { harmony, tension, intensification, aspectCount }, dominantStance, interchartAspects[] } }` — identical to `compute_synastry_overlay`. Swap the local arg pair for `{ agentA, agentB }` natal charts per the route handler.

**Stance derivation (prototype):** bars are computed live from the viewer's thermodynamic vector vs the agent's (opposing axes Spirit↔Matter, Essence↔Substance); `dominantStance` = tallest of intensification(mirror) / harmony(absorb) / tension(clash). In production this is the MCP server's job — the front-end just renders `data`.

## Tweaks → props wiring (dev-only, mirrors real state)
| Tweak | Drives | Real source |
|---|---|---|
| `profile_agent` (monet/galileo) | `agentKey` | route `[userId]` |
| `transit` | `transitId` → transit overlay | live sky / `/api/astrologize` |
| `viewer_spirit/essence/matter/substance` | `viewerThermo` → synastry stance | logged-in user thermo (`AlchemicalContext`) |
| `sigil_style` (triangles/concentric/web) | sigil geometry | could become a user theme pref |
| `user_tab` (essence/palate/practice) | active `ProfileBlockRegistry` block | URL/tab state |

All viz respects the `.motion-off` ancestor (Tweaks Motion toggle) on `[data-motion]` nodes, consistent with the rest of the prototype.
