# Alchm.kitchen (WhatToEatNext) - Version 2.0 Release

Welcome to the **2.0 Release** of Alchm.kitchen (WhatToEatNext). This release marks a major milestone in the project's evolution, establishing a robust framework across our database, system architecture, and user interface. 

While there is still work to be done, Version 2.0 solidifies the core foundation of our alchemical culinary recommendation system.

## 🚀 2.0 Upgrades & Milestones Achieved

### 1. Architectural & System Framework
- **Decoupled Backend**: Migrated the FastAPI Python backend from Vercel to a standalone **Railway** service, optimizing build times (< 60s) and performance.
- **NextAuth.js v5**: Completed a full migration from Privy to NextAuth.js v5 for robust, Edge-compatible authentication with Google OAuth.

### 2. Database Integrity
- **High-Availability PostgreSQL**: Integrated **Neon Serverless Postgres** for scalable, reliable user and session data storage.
- **Lazy DB Startup**: Implemented non-blocking database connectivity tests, ensuring our FastAPI server bounds to Railway's port immediately and passes health checks smoothly.

### 3. UI / UX Overhaul
- **Alchemical Dark Theme**: Upgraded the entire application interface to a cohesive, glassmorphism-based dark theme (`bg-[#08080e]`) with ambient glowing orbs, creating a rich, premium aesthetic.
- **Unified Styling**: Standardized cards, headers, buttons, and layouts across all feature pages (Recipes, Premium, Profile, Quantities, Birth Chart, etc.) to match the new "deep space" look.

### 4. Culinary & Astrological Enhancements
- **Recipe Catalog Expansion**: 351 recipes strictly typed to the `AlchemicalRecipe` interface, complete with nutritional payloads and authentic preparation procedures.
- **Mathematical Elemental Balancing**: Every recipe now features rigorously balanced Fire/Water/Earth/Air properties summing perfectly to 1.0.

---

## 🔮 Plans & Remaining Work for 2.0

Even with this solid framework, we are tracking several initiatives to fully realize the 2.0 vision:

- **Enhanced Personalization Engine**: Fine-tuning the ESMS (Spirit, Essence, Matter, Substance) token yields based on live planetary transits.
- **Economy Integration**: Expanding the Token Economy's quest mechanics and daily alignments.
- **Additional Cuisines & Cultural Rigor**: Continuing to build out underrepresented cuisines with authentic recipes and balanced thermodynamic properties.
- **Performance & Testing**: Expanding test coverage and performance monitoring dashboards to maintain zero TypeScript errors and ensure rapid response times.

---

## Technical Stack
- **Frontend**: Next.js 15 (React 19), Tailwind CSS, Framer Motion
- **Backend**: Python FastAPI (hosted on Railway), Swiss Ephemeris (`pyswisseph`)
- **Database**: Neon PostgreSQL
- **Auth**: NextAuth.js v5

## Quick Start
Check `GEMINI.md` for in-depth architectural overviews, environment variable configurations, and Alchemical Calculation Rules.
