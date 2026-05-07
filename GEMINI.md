# WhatToEatNext - AI Assistant Guide (Alchm.kitchen)

_Version: 2.2.0 | Last Updated: May 5, 2026_

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**.

## Current Project Status (May 2026)

### 🎉 **INFRASTRUCTURE OPTIMIZATION COMPLETE**

- **Backend Hosting**: ✅ **RAILWAY** (Standalone Service)
- **Frontend Hosting**: ✅ **VERCEL** (Next.js)
- **Database**: ✅ **RAILWAY POSTGRES** (Migrated from Neon | Internal: `postgres.railway.internal`)
- **Latency**: ✅ **SUB-1MS** (Internal Railway Networking)
- **Recipe Catalog**: ✅ **579 recipes** with Denormalized Read Models
- **Build Status**: ✅ **BUILDING ON RAILWAY** (Optimized with .railwayignore)
- **Assets**: ✅ **OPTIMIZED** (Logo/Hero images reduced by 90%+)

### 🚀 **MAJOR CHANGES (Version 2.2.0)**

#### **Read Model Optimization**
- ✅ **Denormalized Recipes**: Added `read_model` JSONB column to `recipes` table for high-speed delivery.
- ✅ **Batch Queries**: Eliminated N+1 query bottlenecks in recommendation engines.
- ✅ **10x Faster Migration**: Rewrote migration logic for bulk SQL inserts.

#### **Infrastructure Migration**
- ✅ **Neon to Railway**: Successfully moved all data to Railway-native Postgres.
- ✅ **Internal Networking**: Configured backend to communicate via `postgres.railway.internal`.
- ✅ **Asset Optimization**: Reduced `Aklogo.jpg` from 1.7MB to 69KB and hero image by 90%.

---

## Core Architecture

### **Hierarchical Culinary Data System**

**Three-Tier Architecture:**

1.  **Tier 1 - Ingredients** (Elemental Only)
2.  **Tier 2 - Recipes** (Computed - Full Alchemical)
3.  **Tier 3 - Cuisines** (Aggregated - Statistical)

### **Authentication System (NextAuth.js v5)**

- **Provider**: Google OAuth only (Server/Edge split config).
- **Roles**: ADMIN, USER.

---

## Environment Variables Reference (Production)

```bash
# Backend (Python)
API_BASE_URL=https://whattoeatnext-production.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://whattoeatnext-production.up.railway.app
CORS_ALLOWED_ORIGINS=http://v0-alchm-kitchen.vercel.app,https://alchm.kitchen,http://localhost:3000
INTERNAL_API_SECRET=<internal-api-secret>
GALILEO_API_KEY=<galileo-api-key>

# Database (Internal Railway Network)
DATABASE_URL=postgresql://postgres:<password>@postgres.railway.internal:5432/railway

# Auth (NextAuth.js v5)
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

_Updated May 5, 2026 — Optimization & Migration Complete. Sub-1ms latency achieved via Railway Internal Networking._
