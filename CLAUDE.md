# WhatToEatNext - Claude AI Assistant Guide

_Last Updated: March 6, 2026_

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**.

## Current Project Status (March 2026)

### 🎉 **ZERO TYPESCRIPT ERRORS - Maintained!**

- **Build Status**: ✅ **FULLY OPERATIONAL - ZERO ERRORS!**
- **Current TypeScript Errors**: **0** (maintained since Nov 23, 2025)
- **Vercel Deployment**: ✅ **STABLE**
- **Latest Commit**: `4e0544d` - "fix: correct planetary positions (geocentric), Ascendant, and onboarding emails"
- **Latest PR**: #252 (March 6, 2026)
- **Total PRs Merged**: 252+ (active development continues)

### 🚀 **MAJOR CHANGES SINCE JANUARY 14, 2026** (91 commits, ~57 features/fixes)

#### **Authentication Migration: Privy → NextAuth.js v5** (PRs #229–#233)

- ❌ **Removed**: Privy auth provider (all artifacts cleaned up, 1400+ stale files removed)
- ✅ **Added**: NextAuth.js v5 (Auth.js v5) with Google OAuth only
- ✅ **Edge Runtime**: Auth split into two files:
  - `src/lib/auth/auth.config.ts` — Edge-safe config (used by middleware)
  - `src/lib/auth/auth.ts` — Server-only config (DB lookups via dynamic import)
- ✅ **JWT Strategy**: 30-day sessions, updated once per day
- ✅ **Admin Detection**: First user or `AUTH_ADMIN_EMAIL` gets `ADMIN` role

#### **New Features** (January–March 2026)

- ✅ **Recipe Generator** (`/recipe-generator`) — Sophisticated carousel cycling with personalization and planetary scoring across all 14 cuisines
- ✅ **Food Tracking** (`/food-tracking`) — Food diary/tracking page
- ✅ **User Dashboard Enhancements** — Added Dining Companions and Food Lab Book sections
- ✅ **Comprehensive User Dashboard** — Natal/transit chart overlay, step-based profile flow
- ✅ **Enhanced Cooking Methods Recommender** — Full physics visualization with mass-weight planetary kinetics
- ✅ **Registration + Onboarding Emails** — Personalized onboarding email from Greg Castro via Nodemailer
- ✅ **Planetary Mass Constants** — Actual planetary mass constants grounding alchemical scoring
- ✅ **Planetary Positions Fix** — Geocentric calculations, Ascendant corrections, live calculations replacing placeholders

#### **Bug Fixes** (January–March 2026)

- ✅ Session persistence extended and hardened
- ✅ Google OAuth 401 resolved (AUTH_SECRET, PKCE cookie config)
- ✅ Edge Runtime errors resolved (no Node.js modules in middleware)
- ✅ Birth info redirect to dashboard (robust with fallbacks)
- ✅ Blank page / hydration gate issues resolved
- ✅ React hooks violations fixed
- ✅ astronomy-engine date parsing fixed
- ✅ TS2307/TS2322 errors resolved (zero errors maintained)
- ✅ Vercel preview deployments handle missing AUTH_SECRET gracefully

### ✅ **Build Status**

- **Branch**: master (latest commit: `4e0544d`)
- **Build**: ✅ FULLY OPERATIONAL (March 6, 2026)
- **TypeScript Errors**: **0** (zero errors maintained)
- **Dependencies**: ✅ Optimized (Yarn 3.6.4 required with corepack)
- **Vercel Deployment**: ✅ STABLE
- **Auth**: ✅ NextAuth.js v5 with Google OAuth

### 📝 **Recent Pull Requests (January 14 – March 6, 2026)**

| PR # | Description | Status |
|------|-------------|--------|
| #252 | Fix planetary positions (geocentric), Ascendant, and onboarding emails | ✅ Merged |
| #251 | Sophisticated recipe generator with carousel cycling and personalization | ✅ Merged |
| #250 | Add Dining Companions and Food Lab Book to user dashboard | ✅ Merged |
| #249 | Personalized onboarding email from Greg Castro | ✅ Merged |
| #248 | Registration email notifications, birth chart fixes, session persistence | ✅ Merged |
| #242 | Replace placeholder planetary positions with live calculations | ✅ Merged |
| #241 | Robust redirect to dashboard after birth info with fallbacks | ✅ Merged |
| #240 | Fix redirect to dashboard after birth info submission | ✅ Merged |
| #239 | Resolve Vercel production errors from log analysis | ✅ Merged |
| #238 | Resolve TS2307 and TS2322 errors for zero TypeScript errors | ✅ Merged |
| #237 | Build comprehensive user dashboard with natal/transit chart overlay | ✅ Merged |
| #236 | Rebuild profile page with step-based flow and personalized recommendations | ✅ Merged |
| #235 | Rebuild auth/profile navigation with dynamic Log In / Profile tab | ✅ Merged |
| #233 | Remove Privy artifacts, fix admin auth, clean up 1400+ stale files | ✅ Merged |
| #232 | Resolve Edge Runtime errors, remove conflicting session route, clean up Privy leftovers | ✅ Merged |
| #231 | Resolve Google OAuth 401 and wire NextAuth onboarding + admin flow | ✅ Merged |
| #230 | Handle missing AUTH_SECRET in Vercel preview deployments | ✅ Merged |
| #229 | Replace Privy auth provider with NextAuth.js (Auth.js v5) | ✅ Merged |

### 📝 **Earlier Pull Requests (November 8 – January 14, 2026)**

| PR # | Description | Status |
|------|-------------|--------|
| #144 | Apply pillar transformations to cooking method calculations | ✅ Merged |
| #143 | Enhance cooking methods recommender with real planetary calculations | ✅ Merged |
| #142 | Handle inconsistent seasonality data types in EnhancedIngredientRecommender | ✅ Merged |
| #141 | Add explicit type annotations to fix TS2345 errors | ✅ Merged |
| #140 | Enhance ingredient recommender with pagination, formatting, and protein data | ✅ Merged |
| #137 | Display all 14 cuisines with tier-based grouping | ✅ Merged |
| #136 | Revamp hero section with Alchm.kitchen branding | ✅ Merged |
| #120 | Integrate backend planetary calculations with cuisine recommendations | ✅ Merged |
| #119 | Migrate Swiss Ephemeris to Python backend (pyswisseph) | ✅ Merged |
| #116 | Swiss Ephemeris v2 upgrade for high-precision calculations | ✅ Merged |
| #114 | User personalization system with natal/moment charts | ✅ Merged |

_Total: 252+ pull requests merged since November 2025._

---

## Core Architecture

### **Hierarchical Culinary Data System**

**Three-Tier Architecture:**

1. **Tier 1 - Ingredients** (Elemental Only)
   - Store ONLY elemental properties: Fire, Water, Earth, Air (normalized to 1.0)
   - NO alchemical properties at ingredient level
   - Rationale: Ingredients lack astrological context for ESMS

2. **Tier 2 - Recipes** (Computed - Full Alchemical)
   - Alchemical properties from planetary positions via `calculateAlchemicalFromPlanets()`
   - Elemental properties: 70% ingredients + 30% zodiac signs
   - Thermodynamic metrics from ESMS + elementals
   - Kinetic properties (P=IV circuit model)
   - Planetary mass-weight constants applied to alchemical scoring

3. **Tier 3 - Cuisines** (Aggregated - Statistical)
   - Weighted average properties across recipes
   - Cultural signatures (z-score > 1.5σ)
   - Statistical variance and diversity metrics

**Key Modules:**

- `src/utils/planetaryAlchemyMapping.ts` — Authoritative ESMS calculation
- `src/utils/hierarchicalRecipeCalculations.ts` — Recipe computation
- `src/utils/cuisineAggregations.ts` — Statistical signatures
- `src/types/celestial.ts` — Core type definitions

### **Authentication System (NextAuth.js v5)**

**Architecture:**

```
Edge Runtime (middleware.ts)
  └─→ auth.config.ts (Google OAuth provider, JWT session, route protection)
      └─→ NO Node.js imports (no pg, jsonwebtoken, bcryptjs)

Server Runtime (API routes, server components)
  └─→ auth.ts (extends auth.config.ts)
      └─→ signIn callback: dynamic import of userDatabaseService (pg)
      └─→ Creates/updates user in PostgreSQL on first login
      └─→ Assigns ADMIN role to first user or AUTH_ADMIN_EMAIL
```

**Key Files:**

- `src/lib/auth/auth.config.ts` — Edge-safe config (middleware uses this)
- `src/lib/auth/auth.ts` — Full server config (API route uses this)
- `src/lib/auth/roles.ts` — UserRole enum (ADMIN, USER)
- `src/lib/auth/validateRequest.ts` — Server-side session validation
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth catch-all route
- `src/middleware.ts` — Route protection (/profile, /onboarding, /admin)

**Required Environment Variables (Auth):**

```bash
AUTH_SECRET=<random-secret>          # REQUIRED in production
AUTH_URL=http://localhost:3000        # App URL
AUTH_TRUST_HOST=true                  # Required for Vercel
AUTH_GOOGLE_ID=<google-client-id>    # Google OAuth
AUTH_GOOGLE_SECRET=<google-secret>   # Google OAuth
AUTH_ADMIN_EMAIL=xalchm@gmail.com    # Admin user email
```

**Session Strategy:**
- JWT-based, 30-day max age, refreshed daily
- Session contains: `user.id`, `user.email`, `user.name`, `user.roles`, `user.birthInfo`
- Graceful degradation: Missing AUTH_SECRET in preview/dev uses placeholder (app works, auth features don't)

### **Primary APIs**

- **astrologize API** (`/api/astrologize`): Astrological calculations and planetary positions
- **alchemize API** (`/api/alchemize`): Alchemical transformations and elemental harmony
- **cuisines API** (`/api/cuisines/recommend`): Cuisine recommendations with real planetary data
- **recipes API** (`/api/recipes`): Recipe retrieval and generation
- **user API** (`/api/user/*`): User profile, dining groups, commensals
- **onboarding API** (`/api/onboarding`): User onboarding flow
- **food-diary API** (`/api/food-diary`): Food tracking/diary

### **Backend Architecture (Python FastAPI)**

```
Next.js Frontend (Vercel)
  └─→ /api/astrologize/route.ts
      ├─→ Primary: Call Python backend /api/planetary/positions
      │   └─→ Uses pyswisseph 2.10.3.2 (NASA JPL DE - sub-arcsecond)
      └─→ Fallback: astronomy-engine (moderate precision)
          └─→ Used when backend unavailable

Python Backend (localhost:8000 / production)
  └─→ /api/planetary/positions
      ├─→ Primary: pyswisseph (Swiss Ephemeris)
      └─→ Fallback: pyephem (moderate precision)
```

- **Backend**: `/backend/alchm_kitchen/main.py`
- **Config**: `BACKEND_URL` environment variable
- **Start backend**: `cd backend && ./dev_start.sh`

### **Key Components**

- **Elemental System**: Fire, Water, Earth, Air (no opposing forces)
- **Alchemical Properties**: Spirit, Essence, Matter, Substance (ESMS)
  - ⚠️ **CRITICAL**: ESMS ONLY from planetary positions, NOT elemental approximations
- **14 Alchemical Pillars**: Cooking method transformations
- **Planetary System**: Real-time astronomical calculations with geocentric positions
- **Planetary Mass Constants**: Actual planetary masses used in kinetic/alchemical scoring

### **Technology Stack**

- **Frontend**: Next.js 15.5.9, React 19.1.2, TypeScript 5.8.3
- **Auth**: NextAuth.js v5 (Auth.js v5) — Google OAuth, JWT sessions
- **Package Manager**: Yarn 3.6.4 (required — use corepack)
- **Styling**: Chakra UI v3, Tailwind CSS 3.4.1, Framer Motion
- **Backend**: Python FastAPI, pyswisseph (Swiss Ephemeris for high-precision calculations)
- **Astronomical**: astronomy-engine (frontend fallback), pyswisseph 2.10.3.2 (backend primary)
- **Email**: Nodemailer 6.9.16 (registration + personalized onboarding emails)
- **Database**: PostgreSQL (pg 8.16.3)
- **JWT (legacy)**: jsonwebtoken 9.0.3 (JWT auth service uses lazy initialization)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

---

## File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (13+ routes)
│   │   ├── auth/[...nextauth]/  # NextAuth catch-all
│   │   ├── astrologize/   # Planetary position calculations
│   │   ├── alchemize/     # Alchemical transformations
│   │   ├── cuisines/      # Cuisine recommendations
│   │   ├── recipes/       # Recipe data
│   │   ├── food-diary/    # Food tracking
│   │   ├── onboarding/    # User onboarding
│   │   └── user/          # User profile & social
│   ├── auth/              # Auth error page
│   ├── cooking-methods/   # Cooking methods page
│   ├── food-tracking/     # Food diary page
│   ├── login/             # Login page
│   ├── menu-planner/      # Menu planning
│   ├── onboarding/        # Onboarding flow
│   ├── planetary-chart/   # Planetary chart visualization
│   ├── profile/           # User profile (step-based flow)
│   ├── quantities/        # Alchemical quantities
│   ├── recipe-builder/    # Recipe builder
│   ├── recipe-generator/  # AI-powered recipe generator
│   └── recipes/           # Recipe browsing
├── calculations/           # Alchemical & astrological calculations
├── components/             # UI components
├── constants/              # Alchemical pillars, elements, zodiac
├── contexts/               # React context providers
├── data/                   # Ingredient databases, planetary data
├── hooks/                  # React custom hooks
├── lib/
│   ├── auth/              # NextAuth config (auth.ts, auth.config.ts)
│   ├── database/          # PostgreSQL client (client.ts, connection.ts)
│   └── ...                # Other lib utilities
├── services/               # Business logic services
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions

backend/
├── alchm_kitchen/          # FastAPI application
├── requirements.txt        # Python deps (pyswisseph, etc.)
└── dev_start.sh            # Start backend

database/
└── init/                   # DB initialization scripts
```

**Key Files:**

- `src/types/celestial.ts` — Core types (Planet, Element, AlchemicalProperty, ZodiacSign)
- `src/constants/alchemicalPillars.ts` — 14 alchemical cooking transformations
- `src/utils/planetaryAlchemyMapping.ts` — ESMS calculation authority
- `src/lib/auth/auth.config.ts` — Edge-safe NextAuth config
- `src/lib/auth/auth.ts` — Full server NextAuth config
- `src/middleware.ts` — Route protection middleware
- `src/app/api/astrologize/route.ts` — Planetary positions (backend → frontend)

---

## Development Commands

### **Essential Workflow**

```bash
make install     # Install dependencies (corepack yarn install)
make dev         # Start development server
make build       # Production build
make lint        # Run ESLint
make check       # TypeScript type checking

# Error analysis
make errors              # All TypeScript errors
make errors-by-type      # Group by error type
make errors-by-file      # Group by file
```

### **Starting Local Development**

```bash
# 1. Install dependencies
make install

# 2. Start Python backend (for planetary calculations)
cd backend && ./dev_start.sh

# 3. Start frontend
make dev

# 4. Test planetary calculations
curl -X POST http://localhost:8000/api/planetary/positions \
  -H "Content-Type: application/json" \
  -d '{"year":2026,"month":3,"day":6,"hour":12,"minute":0}'
```

### **Linting**

```bash
make lint-quick          # Fast (no type checking)
make lint-performance    # Performance optimized
yarn lint --fix          # Auto-fix issues
yarn lint:fix            # Same as above
```

### **Testing**

```bash
yarn test                # Run all tests
yarn test:watch          # Watch mode
yarn test:coverage       # With coverage
```

---

## Development Guidelines

### **Casing Conventions (CRITICAL)**

```typescript
// Elements - Capitalized
type Element = "Fire" | "Water" | "Earth" | "Air";

// Planets - Capitalized
type Planet = "Sun" | "Moon" | "Mercury" | "Venus";

// Zodiac Signs - Lowercase
type ZodiacSign = "aries" | "taurus" | "gemini";

// Alchemical Properties - Capitalized
type AlchemicalProperty = "Spirit" | "Essence" | "Matter" | "Substance";

// Cuisine Types - Capitalized with hyphens
type CuisineType = "Italian" | "Mexican" | "Middle-Eastern";
```

### **Alchemical Calculation Rules**

**The ONLY Correct Way to Calculate ESMS:**

```typescript
// ✅ CORRECT - Planetary Alchemy Mapping
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";

const alchemical = calculateAlchemicalFromPlanets({
  Sun: "Gemini",
  Moon: "Leo",
  Mercury: "Taurus",
  // ... other planets
});
// Result: { Spirit: 4, Essence: 7, Matter: 6, Substance: 2 }
```

**Planetary Alchemy Values:**

```typescript
Sun:     { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }
Moon:    { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
Mercury: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 }
Venus:   { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
Mars:    { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
Jupiter: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 }
Saturn:  { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 }
Uranus:  { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
Neptune: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 }
Pluto:   { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
```

**Thermodynamic Formulas:**

```typescript
Heat = (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²
Entropy = (Spirit² + Substance² + Fire² + Air²) / (Essence + Matter + Earth + Water)²
Reactivity = (Spirit² + Substance² + Essence² + Fire² + Air² + Water²) / (Matter + Earth)²
GregsEnergy = Heat - (Entropy × Reactivity)
Kalchm = (Spirit^Spirit × Essence^Essence) / (Matter^Matter × Substance^Substance)
Monica = -GregsEnergy / (Reactivity × ln(Kalchm)) if Kalchm > 0, else 1.0
```

### **Authentication Patterns**

**Reading session in Server Components / API Routes:**
```typescript
import { auth } from "@/lib/auth/auth";

const session = await auth();
if (!session?.user) return new Response("Unauthorized", { status: 401 });
```

**Reading session in Client Components:**
```typescript
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();
if (status === "loading") return <Loading />;
if (!session) return <SignIn />;
```

**Sign in / Sign out:**
```typescript
import { signIn, signOut } from "next-auth/react"; // client
// OR
import { signIn, signOut } from "@/lib/auth/auth"; // server action
```

**Protected routes** are configured in `src/middleware.ts`:
- `/profile/*` — requires auth
- `/onboarding/*` — requires auth
- `/admin/*` — requires auth (admin role check in auth.config.ts)

### **Edge Runtime Constraints**

The middleware runs in Edge Runtime. **Never import** these in `auth.config.ts` or `middleware.ts`:
- `pg` / database modules
- `jsonwebtoken`
- `bcryptjs`
- `nodemailer`
- Any module using Node.js built-ins

Use dynamic imports in server-only callbacks:
```typescript
// In auth.ts signIn callback only (server runtime)
const { userDatabase } = await import("@/services/userDatabaseService");
```

### **TypeScript Path Aliases**

```typescript
import { X } from "@/..."           // src/
import { X } from "@components/..." // src/components/
import { X } from "@utils/..."      // src/utils/
import { X } from "@types/..."      // src/types/
import { X } from "@services/..."   // src/services/
import { X } from "@data/..."       // src/data/
import { X } from "@constants/..."  // src/constants/
import { X } from "@contexts/..."   // src/contexts/
import { X } from "@hooks/..."      // src/hooks/
import { X } from "@lib/..."        // src/lib/
import { X } from "@calculations/..." // src/calculations/
```

### **TypeScript Error Patterns**

**Pattern P: createElementalProperties Object Literal Type Mismatch (TS2345)**

```typescript
// ❌ ERROR
elementalEffect: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),

// ✅ FIXED
elementalEffect: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 } as any),
```

**Pattern O: Array vs Single Item Parameter Mismatch (TS2345)**

```typescript
// ✅ FIXED - Map over array to transform individual items
export const _transformIngredients = (ingredients: ElementalItem[]): AlchemicalItem[] =>
  ingredients.map(ingredient => transformItemWithPlanetaryPositions(ingredient, ...));
```

**Pattern Q: LogContext Type in Catch Blocks**

```typescript
// ✅ FIXED
} catch (error) {
  log.error(`Error message`, error as any);
}
```

**Pattern R: `as unknown` Causing Index Type Errors**

```typescript
// ✅ FIXED
const elementKey = element as any;
const value = item.elementalProperties[elementKey];
```

**Common Parsing Error Patterns:**

```typescript
// ❌ Semicolon in filter
const errors = messages.filter(msg => msg.ruleId === 'error';)
// ✅ Correct
const errors = messages.filter(msg => msg.ruleId === 'error')

// ❌ Comma in class property
class MyClass { private config: Config, }
// ✅ Correct
class MyClass { private config: Config; }

// ❌ Apostrophe not escaped
'The region's cuisine'
// ✅ Correct
"The region's cuisine"
```

### **Elemental Logic Principles**

1. **No Opposing Elements**: Fire doesn't oppose Water
2. **Elements Reinforce Themselves**: Like strengthens like
3. **All Combinations Work**: Good compatibility (0.7+)
4. **No "Balancing"**: Don't balance elements against each other

---

## Environment Variables Reference

```bash
# Server / General
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_TELEMETRY_DISABLED=1

# Backend (Python)
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Auth (NextAuth.js v5) — ALL REQUIRED for auth to work
AUTH_SECRET=<random-secret-min-32-chars>
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
AUTH_GOOGLE_ID=<google-oauth-client-id>
AUTH_GOOGLE_SECRET=<google-oauth-client-secret>
AUTH_ADMIN_EMAIL=xalchm@gmail.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/whattoeat
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=whattoeat
POSTGRES_USER=user
POSTGRES_PASSWORD=password

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# JWT (legacy service — lazy initialized)
JWT_SECRET=<your-jwt-secret>
```

---

## Vercel Deployment Configuration

```json
{
  "buildCommand": "corepack yarn build",
  "installCommand": "corepack enable && corepack yarn install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": { "maxDuration": 10 }
  }
}
```

**Critical Vercel Notes:**
- Must use `corepack yarn` (not `npm` or plain `yarn`)
- `AUTH_SECRET` required in production — without it, auth fails silently
- `AUTH_TRUST_HOST=true` required for NextAuth in Vercel environment
- JWT auth service uses lazy initialization (Proxy-based) to avoid build-time errors
- Backend URL must be set via `BACKEND_URL` for planetary calculations

---

## Troubleshooting

### **Build Issues**

```bash
# TypeScript check should complete in ~5 seconds
yarn tsc --noEmit --skipLibCheck

# Full TypeScript check
yarn tsc --noEmit

# Build
NODE_OPTIONS="--max-old-space-size=4096" yarn build
# OR
make build

# If build hangs, kill zombie processes
ps aux | grep -E "(yarn build|next build)" | grep -v grep
pkill -9 -f "next build"
```

### **Auth Issues**

- **Google OAuth 401**: Ensure `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET` are set. Add `http://localhost:3000/api/auth/callback/google` to Google Console authorized redirect URIs.
- **Missing AUTH_SECRET in preview**: The app uses a placeholder secret — auth won't work but app won't 500.
- **Edge Runtime errors**: Never import Node.js modules (pg, bcrypt, etc.) from `auth.config.ts` or `middleware.ts`.

### **Planetary Calculations**

```bash
# Test backend
curl -X POST http://localhost:8000/api/planetary/positions \
  -H "Content-Type: application/json" \
  -d '{"year":2026,"month":3,"day":6,"hour":12,"minute":0}'

# Test astrologize API (calls backend)
curl -X POST http://localhost:3000/api/astrologize \
  -H "Content-Type: application/json" \
  -d '{"year":2026,"month":3,"date":6,"hour":12,"minute":0}'
# Check metadata: {"source": "backend-pyswisseph", "precision": "NASA JPL DE"}
```

### **Parsing Errors**

```bash
# Count parsing errors
yarn lint 2>&1 | grep "Parsing error" | wc -l

# List files with parsing errors
yarn lint 2>&1 | grep -B 1 "Parsing error" | grep "^/"
```

---

## TypeScript Configuration Notes

**Key `tsconfig.json` exclusions** (to keep zero errors state):

```json
"exclude": [
  "alchm-app-integration/**",              // Integration guide (non-production)
  "src/app/personalized-ingredients/**",    // Experimental feature
  "src/components/PersonalizedIngredientPage.tsx", // Experimental component
  "src/services/KiroCampaignIntegration.ts",
  "**/*.bak*",                             // Backup files
  "temp/**", "tmp-**",                     // Temp files
  "**/*.test.ts", "**/*.spec.ts",          // Tests (separate tsconfig.jest.json)
  "src/setupTests.ts",
  "src/types/jest-dom.d.ts"               // Jest types excluded from main build
]
```

**Key settings:**
- `strict: true` with selective relaxations (`noImplicitAny: false`, `strictFunctionTypes: false`)
- `moduleResolution: "node"` (not "bundler")
- `skipLibCheck: true`
- `isolatedModules: true` (required for Next.js)

---

## Memory Notes for AI Assistants

### **Critical Principles**

- **NEVER use lazy fixes or placeholder functionality**
- **Always use existing codebase functionality**
- **Follow proven casing conventions** (Elements/Planets Capitalized, zodiac lowercase)
- **No opposing elements concept**
- **ESMS only from planetary positions** — never from elemental approximations
- **Auth is NextAuth.js v5** — do not reference Privy (it's been completely removed)
- **Edge Runtime constraint** — auth.config.ts and middleware.ts must be Node.js free

### **TypeScript Zero-Error State**

The codebase has maintained **zero TypeScript errors** since November 23, 2025. When making changes:
1. Run `yarn tsc --noEmit` before and after changes
2. Do not introduce new `as any` casts unless following documented patterns
3. Do not break existing type contracts
4. Check that new files are not accidentally included by tsconfig

### **Auth Migration Summary**

Privy has been **completely removed**. The auth system is:
- **Provider**: Google OAuth only (no email/password)
- **Library**: NextAuth.js v5 (`next-auth@^5.0.0-beta.25`)
- **Session**: JWT strategy, 30 days
- **Roles**: UserRole enum in `src/lib/auth/roles.ts`
- **DB**: Users stored in PostgreSQL via `src/services/userDatabaseService.ts`
- **Admin**: Automatic for `AUTH_ADMIN_EMAIL` or first registered user

### **Quick Reference - Auth Functions**

```typescript
// Server components / API routes
import { auth } from "@/lib/auth/auth";
const session = await auth();

// Client components
import { useSession, signIn, signOut } from "next-auth/react";

// Server actions
import { signIn, signOut } from "@/lib/auth/auth";

// Route protection: configured in src/middleware.ts
```

### **Planetary Calculation Flow**

```
User Request
    ↓
/api/cuisines/recommend (or similar)
    ↓
getPlanetaryPositionsForDateTime()
    ↓
/api/astrologize → Python Backend /api/planetary/positions
    ↓
pyswisseph (NASA JPL DE - sub-arcsecond, geocentric)
    ↓
calculateAlchemicalFromPlanets(planetaryPositions)
    ↓
ESMS: { Spirit, Essence, Matter, Substance }
    ↓
Recommendations based on real planetary data ✅
```

---

## Quick Reference

```bash
# Start development
make install && make dev

# Check errors
make lint              # ESLint
make check            # TypeScript
make errors           # Detailed analysis

# Fix common issues
yarn lint --fix       # Auto-fix ESLint
rm -rf node_modules && yarn install  # Refresh deps

# Auth setup
# 1. Set AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET in .env.local
# 2. Add http://localhost:3000/api/auth/callback/google to Google Console
# 3. yarn dev → visit /login
```

---

_Updated March 6, 2026 — NextAuth.js v5 migration complete, Recipe Generator launched, User Dashboard enhanced with Dining Companions and Food Lab Book, 252+ PRs merged. Zero TypeScript errors maintained._
