# Stitch Prompt Package — Commensal "Tables" Social Redesign

Paste these into [stitch.withgoogle.com](https://stitch.withgoogle.com) (sign in with Google → **App** mode for mobile-first, per the 2026-07-11 decision session). Generate Screen 1 first, then add the remaining screens **in the same project** so the theme stays consistent. Iterate in micro-steps: structure first, then refine colors/spacing with short follow-ups.

Decisions this package encodes: dining-first social network; the Table (dinner party) as the atomic social unit with a full lifecycle (plan → live → memory); real identity by default; commensals + follow two-tier graph; SpacetimeDB-live chat; evolved cosmic-glass design; mobile-first.

---

## Global style block (append to every prompt)

> Style: dark obsidian background (#07060B), premium glassmorphism cards — translucent white gradient fills (8% → 3%), heavy 24px background blur, 1px white/12% borders, 24px corner radius. Accent gradient from copper (#E0A66B) to violet (#B57EE0) used on headings (gradient text) and primary buttons. Tiny uppercase monospace labels for metadata. Soft violet glow on anything live. Element color code: Fire = orange, Water = blue, Air = violet, Earth = green. Mood: a candlelit dinner under a night sky — intimate, mystical, premium. Instagram's clarity with an alchemical soul. Show real human faces and names prominently.

---

## Screen 1 — Tables Home (the social hub)

> Alchm Kitchen is a dining-first social network where the dinner table is the atomic social unit. Users host "Tables" (dinner parties); the app computes the group's combined astrological "composite energy" and recommends menus, recipes, and nearby restaurants. Target users: friend groups planning real dinners, supper-club hosts, and compatibility-curious singles.
>
> Design a mobile home screen called "Tables". Layout top to bottom:
> 1. Top bar: "Alchm" wordmark left; search and notification-bell icons right.
> 2. A horizontally scrolling stories-style rail of Tables: circular table tiles — glowing violet ring = LIVE now, amber ring = upcoming; each tile shows a small cluster of member avatars and an elemental glyph; the first tile is "Host a Table" with a + icon.
> 3. A vertical feed of Table artifact cards. Each card: host avatar + real name + timestamp; an overlapping row of guest avatars; a small radial 4-element composite-energy chart; the menu headline (e.g. "Miso-glazed salmon · Water-dominant table"); one large food photo; footer with five elemental reaction buttons (spark ⚡, fire, water, earth, air) with counts, a comment count, and a share icon.
> 4. Bottom navigation, 5 tabs: Kitchen, Discover, Plan, Tables (active, ring glyph), Profile.
>
> [Global style block]

## Screen 2 — Live Table (presence + chat)

> Design the live dinner-party screen for an in-progress "Table". Layout:
> 1. Header: table name ("Friday Equinox Supper"), a LIVE badge with soft violet pulse, host controls (lock table, close) as small icons.
> 2. Presence row: circular avatars of everyone at the table with online dots; a "+ invite" chip that opens QR / link / search options.
> 3. A collapsible glass panel showing the group's composite energy: radial 4-element chart plus a one-line reading ("Balanced toward Water — slow-cooked, communal dishes").
> 4. The recommended menu card: dish name, thumbnail, "swap dish" affordance.
> 5. The lower half is a real-time group chat: message bubbles with avatars and names, elemental emoji reactions on messages, a text input with photo attach at the bottom.
>
> [Global style block]

## Screen 3 — Plan a Table (create + invite + RSVP)

> Design the "Plan a Table" creation screen. Layout:
> 1. Title input ("Name your table…") with gradient text preview.
> 2. Date & time picker row and a venue row (restaurant search or "cooking at home" toggle).
> 3. Invite section: three side-by-side glass buttons — "Share link", "QR code", "Invite commensals" — plus a search field to invite any user by name; below, an invited-guest list with avatar, name, and RSVP status chips (Joined / Invited / Declined) in element colors.
> 4. A live-updating composite-energy preview that fills in as guests accept, with empty avatar slots shown as dotted circles.
> 5. Primary CTA: "Set the Table" (copper→violet gradient, full width).
>
> [Global style block]

## Screen 4 — Table Memory (the artifact)

> Design the after-dinner "Table Memory" screen — the permanent shareable artifact of a past dinner party. Layout:
> 1. Hero: a photo collage of dishes from the night with the table name and date overlaid in gradient text.
> 2. "Who broke bread" row: guest avatars with names.
> 3. The composite-energy record: radial 4-element chart plus the menu that was served, styled like an elegant keepsake card.
> 4. Reactions bar (five elemental reactions with counts) and a comment thread below with avatars, names, timestamps.
> 5. A "Share this table" button and a subtle "Host again" secondary action.
>
> [Global style block]

## Screen 5 — Profile (table history + cosmic identity)

> Design a user profile screen. Layout:
> 1. Header: large avatar (real photo) with a thin elemental gradient ring, display name, @handle, and their elemental signature (e.g. "Fire · Aries Sun") as a glowing badge.
> 2. Action row: "Follow" primary button, "Break Bread" secondary button (invites them to a table), message icon.
> 3. Stats row: Tables hosted · Tables joined · Commensals · Followers.
> 4. Main content: a scrolling gallery of Table Memory cards they've hosted or joined — each with photo, date, mini composite chart, and guest avatar cluster.
> 5. A pinned "cosmic identity" glass card: natal chart highlights and 4-element balance bars.
>
> [Global style block]

## Screen 6 — Discover (people + tables)

> Design a discovery screen for finding people and dinner tables. Layout:
> 1. Search bar at top with filter chips: "Near me", "My element", "Open tables", "People".
> 2. "Tables near your energy" section: cards with compatibility percentage rings (copper→violet), table name, date, host avatar, seats-left indicator.
> 3. "Kindred alchemists" section: people cards with avatar, name, elemental signature, mutual-commensal count, compatibility ring, and Follow button.
> 4. A map preview strip showing nearby open tables as glowing pins.
>
> [Global style block]

---

## Iteration micro-prompts (use after first generation)

- "Increase the glassmorphism blur and make card borders more visible."
- "Make the elemental reaction bar smaller and more subtle, like Instagram's like row."
- "Warm the palette slightly — more candlelight amber in highlights, keep the obsidian base."
- "Show the live table rail with one table actively glowing to demonstrate the LIVE state."
- "Tighten vertical spacing so two full feed cards fit on one screen."
