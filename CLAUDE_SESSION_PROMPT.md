# Claude Code Session — Alchm Kitchen: Premium Payments, Recipe Generator & Restaurant Creator

## Project Context

**WhatToEatNext / Alchm Kitchen** is a Next.js 15 + React 19 culinary recommendation app that combines real-time planetary/astrological data with elemental alchemy to generate personalized food recommendations. Live at [alchm.kitchen](https://alchm.kitchen).

**Stack**: Next.js 15, React 19, TypeScript 5.8.3, Tailwind CSS, Chakra UI, PostgreSQL, Yarn 3.6.4, Vercel deployment.

**Current state after last session (commit `feat: add premium feature gate and fix recipe generator ingredient selection`)**:
- Zero TypeScript errors maintained
- `PremiumContext` + `PremiumGate` component created (localStorage-based, needs real payment)
- Recipe generator ingredient selection bug fixed (was always returning generic defaults)
- `/recipe-builder` page gated behind premium with blurred preview + pricing modal
- `PremiumProvider` added to global provider tree in `src/app/providers.tsx`

---

## Session Goals (Priority Order)

### 1. PAYMENT INTEGRATION — Wire up Stripe for real premium subscriptions

**Files to create/modify:**
- `src/app/api/stripe/checkout/route.ts` — create Stripe Checkout session
- `src/app/api/stripe/webhook/route.ts` — handle `checkout.session.completed`, `customer.subscription.deleted` events
- `src/app/api/stripe/portal/route.ts` — customer portal for subscription management
- `src/contexts/PremiumContext.tsx` — replace `localStorage` mock with real DB-backed subscription check
- `src/app/premium/success/page.tsx` — post-checkout success page
- `src/app/premium/cancel/page.tsx` — cancelled checkout page

**Pricing tiers to implement (same as modal currently shows):**
```
Starter:  $4.99/mo  — 10 recipe generations/month
Premium:  $9.99/mo  — Unlimited recipes + full feature set
```

**Implementation requirements:**
- Use `stripe` npm package (add to dependencies)
- Environment variables needed: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_STARTER_PRICE_ID`, `STRIPE_PREMIUM_PRICE_ID`
- On successful checkout: store `{ userId, stripeCustomerId, subscriptionTier, subscriptionStatus, expiresAt }` in PostgreSQL `user_subscriptions` table
- `PremiumContext` should call `/api/user/subscription` on mount to check real subscription status
- `PremiumGate` pricing modal "Get Premium" / "Start Free Trial" buttons should trigger Stripe Checkout (redirect to Stripe-hosted page)
- After successful payment, redirect to `/premium/success` which updates context and redirects to `/recipe-builder`
- The `upgradeToPremium()` function in context should be replaced by checking DB subscription status

**Database migration needed** (`src/db/migrations/`):
```sql
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  tier VARCHAR(50) NOT NULL DEFAULT 'free',  -- 'free' | 'starter' | 'premium'
  status VARCHAR(50) NOT NULL DEFAULT 'inactive',  -- 'active' | 'inactive' | 'canceled' | 'past_due'
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API route needed** (`src/app/api/user/subscription/route.ts`):
- GET: returns `{ tier, status, expiresAt }` for authenticated user
- Uses existing JWT auth (see `src/services/AuthService.ts`)

---

### 2. RECIPE GENERATOR IMPROVEMENTS — Make generated recipes richer and more varied

**Current state**: The generator produces real ingredient-based recipes now (bug fixed), but:
- Only 11 hardcoded ingredients in `src/constants/alchemicalPillars.ts` → `ALL_ENHANCED_INGREDIENTS`
- Instructions are still very generic (3-4 boilerplate steps)
- Recipe names are predictable ("Seasonal Bowl with Chicken Breast")

**Files to improve:**

#### 2a. Expand `ALL_ENHANCED_INGREDIENTS` (`src/constants/alchemicalPillars.ts`)
Add at least 40 more ingredients covering:
- **Proteins**: beef, pork, tofu, tempeh, shrimp, tuna, lentils, chickpeas, eggs
- **Vegetables**: sweet potato, zucchini, eggplant, cauliflower, mushroom, asparagus, bok choy, leek, butternut squash
- **Grains**: brown rice, couscous, farro, oats, pasta, bread, polenta
- **Aromatics**: ginger, shallot, lemongrass, chili pepper, celery, green onion
- **Fruits**: lemon, lime, orange, apple, mango, avocado
- **Herbs/Spices**: cilantro, parsley, rosemary, cumin, turmeric, paprika, coriander
- **Dairy/Fat**: butter, cream, olive oil, coconut milk, parmesan
- **Legumes**: black beans, kidney beans, edamame

Each ingredient needs: `name`, `amount`, `unit`, `category`, `cuisine` (or "universal"), `elementalProperties`, `tags`, `allergens` (if any), `seasonality`.

#### 2b. Improve `generateBaseInstructions` (`src/data/unified/recipeBuilding.ts`)
Make instructions more specific to the actual ingredients and cooking method:
- Separate prep instructions per ingredient category (proteins vs veggies vs grains)
- Method-specific steps: Braise = sear first, then slow cook with liquid; Stir-Fry = high heat, add in order; Roast = season, spread, specific temperatures
- Include timing per step ("cook for 3-4 minutes", "roast 25 minutes until golden")
- Final seasoning and plating step with tasting cue

#### 2c. Improve `generateRecipeName` — more varied and appetizing names
- Pull from cuisine-specific name patterns (e.g., Italian → "Pollo al...", Thai → "Pad...", Mexican → "Enchiladas...")
- Use flavor adjective + technique + main protein/veg format
- Avoid generic "Bowl" as default — use specific dish types

#### 2d. Add recipe generation count tracking for `Starter` tier (10/month limit)
- Store count in `user_subscriptions` table: `monthly_recipe_count`, `count_reset_date`
- API middleware checks count before generation for Starter tier
- UI shows "7/10 recipes used this month" for Starter tier users

---

### 3. RESTAURANT CREATOR — New premium feature

**Create a new page**: `/restaurant-creator` — allows premium users to design their own cosmic restaurant concept.

**Core concept**: Users define a restaurant's elemental/alchemical identity and get:
- A full restaurant name, concept, and tagline
- A sample menu (5-7 dishes) aligned to their chosen elements and planetary influences
- Décor and ambiance recommendations based on elemental properties
- Signature cocktail/mocktail concept
- Suggested music playlist vibe (genre descriptions, not actual tracks)

**Files to create:**
- `src/app/restaurant-creator/page.tsx` — main page (premium gated)
- `src/app/api/restaurant/generate/route.ts` — generation API
- `src/components/restaurant-creator/RestaurantBuilderPanel.tsx` — selection UI
- `src/components/restaurant-creator/RestaurantConceptDisplay.tsx` — results display
- `src/types/restaurant.ts` — type definitions
- `src/data/unified/restaurantBuilding.ts` — generation logic (similar pattern to `recipeBuilding.ts`)

**Restaurant builder UI selections:**
1. **Primary Element** (Fire / Water / Earth / Air) — drives the whole concept
2. **Cuisine Style** — pick from the 14 supported cuisines
3. **Atmosphere** — Intimate / Lively / Mystical / Modern / Rustic
4. **Planetary Ruler** — Sun / Moon / Mercury / Venus / Mars / Jupiter / Saturn
5. **Price Point** — Casual ($) / Bistro ($$) / Fine Dining ($$$)

**Restaurant concept output (TypeScript interface):**
```typescript
interface RestaurantConcept {
  name: string;                    // e.g. "Ember & Ether"
  tagline: string;                 // e.g. "Where fire meets the cosmos"
  concept: string;                 // 2-3 sentence description
  element: Element;
  planetaryRuler: PlanetName;
  cuisine: string;
  atmosphere: string;
  menu: RestaurantMenuItem[];      // 5-7 items
  signatureDrink: SignatureDrink;
  ambianceProfile: AmbianceProfile;
  monicaScore: number;             // Overall alchemical harmony score
  elementalBalance: ElementalProperties;
}

interface RestaurantMenuItem {
  name: string;
  category: "starter" | "main" | "side" | "dessert";
  description: string;
  elementalProfile: ElementalProperties;
  planetaryInfluence: PlanetName;
  price: string;                   // e.g. "$18"
  signatureDish: boolean;
}

interface SignatureDrink {
  name: string;
  description: string;
  ingredients: string[];
  elementalProfile: ElementalProperties;
  isAlcoholic: boolean;
}

interface AmbianceProfile {
  colorPalette: string[];          // e.g. ["Deep Crimson", "Burnished Gold"]
  lightingStyle: string;           // e.g. "Warm candlelight with copper accents"
  musicVibe: string;               // e.g. "Jazz fusion with Middle Eastern influences"
  scentProfile: string;            // e.g. "Smoked cedar and saffron"
  tableSetting: string;
}
```

**Generation logic in `restaurantBuilding.ts`:**
- Name generation: combine element + planetary adjectives (reference `PLANETARY_HOUR_ADJECTIVES` from `recipeBuilding.ts`) with evocative nouns
- Menu generation: use existing recipe generation logic to create 5-7 `MonicaOptimizedRecipe`-based dishes, wrapped in `RestaurantMenuItem` format
- Monica score: use `calculateAlchemicalFromPlanets()` with the restaurant's planetary ruler
- All calculations must use existing alchemical calculation infrastructure

**Add to navigation** in `src/app/layout.tsx` — new nav link "Restaurant Creator" with premium lock indicator

---

### 4. PREMIUM DASHBOARD — `/premium` page showing subscription status

**Create** `src/app/premium/page.tsx`:
- Shows current tier, renewal date, usage stats (recipes generated this month)
- "Manage Subscription" button → Stripe Customer Portal
- "Upgrade" button for Starter → Premium
- Feature comparison table (Free / Starter / Premium columns)
- Links to premium features: Recipe Builder, Restaurant Creator

---

## Key Architectural Notes

### Existing Infrastructure to Reuse
- **Alchemical calculations**: `src/utils/planetaryAlchemyMapping.ts` → `calculateAlchemicalFromPlanets()`
- **Recipe generation**: `src/data/unified/recipeBuilding.ts` → `UnifiedRecipeBuildingSystem`
- **Planetary scoring**: `src/services/planetaryScoring.ts`
- **Auth**: `src/services/AuthService.ts` (JWT-based, lazy initialized)
- **DB**: PostgreSQL via `pg` package — see existing usage in the codebase
- **Logger**: `createLogger()` from `src/utils/logger.ts`

### Critical Rules
1. **NEVER use `as any` without justification** — use proper types
2. **Maintain zero TypeScript errors** — run `yarn tsc --noEmit` to verify
3. **ESMS (Spirit/Essence/Matter/Substance) ONLY from `calculateAlchemicalFromPlanets()`** — never approximate from elemental properties
4. **Elements**: Fire, Water, Earth, Air (Capitalized) — no opposing elements concept
5. **Planets**: Capitalized (`Sun`, `Moon`, etc.)
6. **Zodiac signs**: lowercase (`aries`, `taurus`, etc.)
7. **Package manager**: Yarn 3.6.4 — use `yarn add` not `npm install`
8. **Build check**: `NODE_OPTIONS="--max-old-space-size=4096" yarn build` to verify Vercel will succeed

### Environment Variables to Add (`.env.local` + Vercel dashboard)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
```

---

## Current Files Modified Since Last Stable Build

```
src/contexts/PremiumContext.tsx          ← NEW — localStorage premium state
src/components/premium/PremiumGate.tsx   ← NEW — paywall gate + modal
src/app/providers.tsx                    ← MODIFIED — added PremiumProvider
src/app/recipe-builder/page.tsx          ← MODIFIED — premium gate applied
src/data/unified/recipeBuilding.ts       ← MODIFIED — ingredient selection bug fixed
```

---

## Start Here

Begin with **Goal 1 (Stripe payment integration)** as it is the foundation for everything else. The `PremiumContext.tsx` currently uses a localStorage mock — replace it with a real subscription check once the API route exists. Then move to **Goal 2 (recipe generator improvements)** to expand the ingredient database and improve instruction quality, followed by **Goal 3 (Restaurant Creator)**.

Run `yarn tsc --noEmit` after each major change to confirm zero TypeScript errors are maintained.
