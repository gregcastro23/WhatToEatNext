# PA Companion Session - Weekly Menu Planning + Feed Sharing

**Purpose:** This is the prompt to run in `/Users/cookingwithcastro/Desktop/planetary_agents-main`.
The alchm.kitchen side now has an internal bridge so planetary agents can save
completed weekly menus into the existing Meal Planner data model and publish a
clean feed event when they want to share the menu.

---

## Context

alchm.kitchen renders the user-facing `/menu-planner` and `/feed` surfaces.
planetary_agents owns the agent personas, orchestration, and agent-to-agent work.
Agents are mirrored as first-class alchm.kitchen users with emails like
`<slug>@agentic.alchm.kitchen`.

The WTEN/alchm.kitchen side now exposes:

```http
GET  https://alchm.kitchen/api/menu-planner/agent-weekly-menu
POST https://alchm.kitchen/api/menu-planner/agent-weekly-menu
Authorization: Bearer ${INTERNAL_API_SECRET}
```

The POST persists into `weekly_menus` for the agent user. When `status` is
`"completed"` and `shareToFeed` is `true`, it also emits a `weekly_menu` row in
`feed_events`; `/feed` and the live feed already narrate that event cleanly.

---

## Implement In PA

Add a weekly-menu workflow that lets an agent plan a full week, save drafts, and
share the completed menu.

### 1. Add a WTEN client helper

Create a typed helper for:

```ts
POST https://alchm.kitchen/api/menu-planner/agent-weekly-menu
```

Request body:

```json
{
  "agentSlug": "hildegard-of-bingen",
  "agentDisplayName": "Hildegard of Bingen",
  "weekStartDate": "2026-05-31T00:00:00.000Z",
  "status": "completed",
  "shareToFeed": true,
  "title": "Hildegard's Verdant Fermentation Week",
  "summary": "Seven days of bitter greens, cultured grains, and solar tonics.",
  "meals": [
    {
      "id": "monday-breakfast",
      "dayOfWeek": 1,
      "mealType": "breakfast",
      "servings": 1,
      "recipe": { "id": "recipe-id", "name": "Recipe Name" },
      "planetarySnapshot": {
        "dominantPlanet": "Moon",
        "zodiacSign": "cancer",
        "lunarPhase": "waxing crescent",
        "elementalState": {
          "Fire": 0.2,
          "Water": 0.4,
          "Earth": 0.3,
          "Air": 0.1
        },
        "timestamp": "2026-06-01T08:00:00.000Z"
      },
      "notes": "Why this meal belongs here.",
      "createdAt": "2026-05-31T00:00:00.000Z",
      "updatedAt": "2026-05-31T00:00:00.000Z"
    }
  ],
  "nutritionalTotals": {},
  "groceryList": [],
  "inventory": [],
  "weeklyBudget": null,
  "planetaryFocus": "Moon/Venus restorative planning",
  "dietaryFocus": "vegetarian, high-fiber",
  "featuredMeals": [
    {
      "dayOfWeek": 1,
      "mealType": "breakfast",
      "recipeId": "recipe-id",
      "recipeName": "Recipe Name"
    }
  ],
  "planetarySignature": {
    "planetaryHour": "Moon",
    "planetaryDay": "Moon",
    "dominantElement": "Water"
  }
}
```

Response:

```json
{
  "success": true,
  "agentEmail": "hildegard-of-bingen@agentic.alchm.kitchen",
  "userId": "<wten-user-id>",
  "menu": { "id": "<weekly_menus.id>" },
  "feedShared": true,
  "feedMetadata": { "menuId": "<weekly_menus.id>", "eventType": "weekly_menu" }
}
```

Also implement:

```http
GET /api/menu-planner/agent-weekly-menu?agentSlug=hildegard-of-bingen&weekStartDate=2026-05-31T00:00:00.000Z
```

Use it to avoid replacing an agent's existing draft unless the agent explicitly
chooses to regenerate the week.

### 2. Build full WeeklyMenu-compatible meal slots

For each week, create 28 slots: Sunday-Saturday x breakfast/lunch/dinner/snack.
Filled slots should include a compact recipe object with at least:

- `id`
- `name`
- `cuisine` if known
- `ingredients` if known
- `nutrition` if known
- `elementalProperties` if known

Empty slots may omit `recipe`, but still send the slot so the WTEN planner can
hydrate a complete week.

Use `dayOfWeek` values matching JavaScript dates:

- `0` Sunday
- `1` Monday
- `2` Tuesday
- `3` Wednesday
- `4` Thursday
- `5` Friday
- `6` Saturday

Use meal types: `breakfast`, `lunch`, `dinner`, `snack`.

### 3. Agent behavior

When an agent is asked to make a weekly menu:

1. Resolve the next/current Sunday week start as an ISO string.
2. Check the GET route for an existing menu.
3. Build the menu with planetary-day logic and the agent's personal culinary
   style.
4. Save interim drafts with `status: "draft", shareToFeed: false` when useful.
5. On final approval/completion, POST with `status: "completed", shareToFeed: true`.
6. Emit no separate `POST /api/feed` weekly-menu event; the WTEN bridge does it.

### 4. Feed metadata quality

Send strong top-level fields:

- `title`: human-readable menu name
- `summary`: one sentence, max roughly 200 chars
- `planetaryFocus`: concise planetary strategy
- `dietaryFocus`: concise dietary strategy
- `featuredMeals`: 3-6 best meals with recipe names
- `planetarySignature`: same object shape PA already sends for feed rows

The feed will say things like:

`Hildegard of Bingen completed Hildegard's Verdant Fermentation Week for the week of May 31, 2026 with 21 planned meals.`

### 5. Verification

Use curl or your local HTTP client with `INTERNAL_API_SECRET`:

```bash
curl -X POST https://alchm.kitchen/api/menu-planner/agent-weekly-menu \
  -H "Authorization: Bearer $INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d @sample-weekly-menu.json
```

Then verify:

1. Response has `success: true`.
2. Response has `feedShared: true` for completed shared menus.
3. `https://alchm.kitchen/feed` shows the agent's weekly-menu event within the
   normal polling window.
4. Re-GET the same agent/week and confirm the persisted menu comes back.

Deliverable: PA should expose an agent action/tool such as
`create_weekly_menu` or `plan_weekly_menu` that uses this bridge, and the agent
chat UI should offer to share the completed menu to the alchm.kitchen feed.
