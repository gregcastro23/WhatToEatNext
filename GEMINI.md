# WhatToEatNext - AI Assistant Guide (Alchm.kitchen)

_Version: 3.2.0 | Last Updated: June 2, 2026_

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**.

## Current Project Status (June 2026)

### 🎉 **3.2 — "HIGH ALCHEMIST" TELEMETRY & HARDENING — SHIPPED**

Following the 3.0 redesign and the 3.1 MCP release, the **3.2 update wires the High Alchemist admin dashboard (`/admin/dashboard`) to live project telemetry and hardening features.**

- **Toolchain**: ✅ **BUN v1.3.13** (Migrated from Yarn for 10x faster installs/builds)
- **Database**: ✅ **RAILWAY POSTGRES** (`postgres.railway.internal` internal networking)
- **Read Model**: ✅ **DENORMALIZED** (JSONB `read_model` for sub-100ms recipe loads)
- **Database Pool**: ✅ **PgBouncer Compatible** (Transaction-pooling safe raw pool extraction)
- **Migrations**: ✅ **AUTO-APPLIED** (Tracked via database `_migrations` table)

### 🚀 **MAJOR CHANGES (Versions 3.0.0 – 3.2.0)**

#### **Live Admin Dashboard Telemetry (v3.2.0)**
- ✅ **Git Deploy Logs**: Wired the deployment panel to a live sub-process wrapper executing `git log -n 5` to show recent commits.
- ✅ **Dynamic Feature Flags**: Added dynamic lookup of active environment integrations (`Privy`, `Stripe`, `Resend`, Astro Debug overlay, additive elements).
- ✅ **Practitioner Geography**: Built coordinate-based clustering of user birth locations and active timezones from the database.
- ✅ **MTD Cost Estimator**: Implemented month-to-date compute and hosting cost estimations mapped to DB size and active connections.
- ✅ **Weekly Cohort Heatmap**: Configured rolling cohort signup tracking and subsequent W1/W2/W4 retention heatmaps from user activity.

#### **MCP Server & Hardening (v3.1.0)**
- ✅ **MCP Server**: Designed a Bun-powered Model Context Protocol server enabling planetary recommendation queries and Stripe ESMS top-ups.
- ✅ **Authentication**: Replaced basic OAuth with **Privy EVM wallet** + social login and decentralized identity (DID) account linking.
- ✅ **Tarot Scoring**: Surfaced live "cards-of-the-moment" on `/current-chart` with real tarot layout weight scoring.
- ✅ **Observability**: Added request-log database mirroring, a `degraded` query flag, and an automated daily observability pruning cron.
- ✅ **Environment Centralization**: Integrated a centralized resolver (`serviceUrls.ts`) to validate all microservices with fail-fast guards.

#### **Modern Alchemist Redesign (v3.0.0)**
- ✅ **5-Slot IA Navigation**: Integrated desktop mega-menus and a mobile bottom glass tab bar (Kitchen, Discover, Plan, Commensal, Lab).
- ✅ **Global Command Palette**: Embedded a `CommandPalette` (`⌘K` dialog) route/action selector.
- ✅ **Device Session Management**: Allowed users to view and revoke active session fingerprints.
- ✅ **Funnel Auditing**: Wired stuck-user reports and pair-count analytics grids (`TodaysHighlightsPanel`).

---

## Core Architecture

### **Hierarchical Culinary Data System**

**Three-Tier Architecture:**

1.  **Tier 1 - Ingredients** (Elemental Only)
2.  **Tier 2 - Recipes** (Computed - Full Alchemical)
3.  **Tier 3 - Cuisines** (Aggregated - Statistical)

### **Authentication System**

- **Providers**: Google OAuth + Privy EVM Wallet + Social Sign-in.
- **Roles**: ARCHITECT (ADMIN), USER.

---

## Environment Variables Reference (Production)

```bash
# Backend (Python)
API_BASE_URL=https://whattoeatnext-production.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://whattoeatnext-production.up.railway.app
CORS_ALLOWED_ORIGINS=http://v0-alchm-kitchen.vercel.app,https://alchm.kitchen,http://localhost:3000
INTERNAL_API_SECRET=<internal-api-secret>
ALCHM_KITCHEN_SYNC_SECRET=<sync-secret-with-planetary-agents>
GALILEO_API_KEY=<galileo-api-key>

# Database (Internal Railway Network)
DATABASE_URL=postgresql://postgres:<password>@postgres.railway.internal:5432/railway

# Planetary Agents (PA) — cross-project integration
PLANETARY_AGENTS_API_URL=https://api.agents.alchm.kitchen        # PA Python/FastAPI backend
NEXT_PUBLIC_PLANETARY_AGENTS_URL=https://api.agents.alchm.kitchen
NEXT_PUBLIC_AGENTS_UI_URL=https://agents.alchm.kitchen           # PA Next.js UI (agent chat)

# Cron / synthetic monitoring
CRON_SECRET=<random-32-char-secret>                              # Vercel cron header (all /api/cron/* routes)
SYNTHETIC_PROBE_TOKEN=<jwt-for-synthetic-user>                   # bearer for synthetic-probe calls
SYNTHETIC_PROBE_BASE_URL=https://alchm.kitchen                   # optional override; defaults to VERCEL_URL

# Alerting
ALERT_SLACK_WEBHOOK_URL=<slack-incoming-webhook-url>             # optional; alerts skip Slack when unset
ALERT_COOLDOWN_MINUTES=60                                         # per (component, current_status) cooldown
SLOW_QUERY_THRESHOLD_MS=200                                       # tunable threshold for slow_query_log

# Auth (NextAuth.js v5)
# Note: Privy SDK is used alongside NextAuth config
AUTH_SECRET=<auth-secret>
AUTH_GOOGLE_ID=<google-client-id>
AUTH_GOOGLE_SECRET=<google-client-secret>
AUTH_ADMIN_EMAIL=<admin-email>
AUTH_URL=https://alchm.kitchen
AUTH_TRUST_HOST=true

# Third-Party Integrations
STRIPE_SECRET_KEY=<stripe-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe-pub-key>
RESEND_API_KEY=<resend-api-key>
SMTP_PASS=<smtp-pass>
SMTP_USER=<smtp-user>
```

---

_Updated June 2, 2026 — High Alchemist admin telemetry wired & telemetry endpoints hardened. Sub-1ms latency achieved via Railway Internal Networking._
