# WhatToEatNext - Claude AI Assistant Guide

_Version: 2.2.0 | Last Updated: May 5, 2026_

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**.

## Current Project Status (May 2026)

### 🎉 **ALCHEMICAL INFRASTRUCTURE OPTIMIZED**

- **Database**: ✅ **MIGRATED TO RAILWAY POSTGRES** (Internal: postgres.railway.internal)
- **Read Model**: ✅ **DENORMALIZED** (Sub-100ms recipe loads)
- **Assets**: ✅ **OPTIMIZED** (Logo/Hero images shrunk by 90%+)
- **Latency**: ✅ **SUB-1MS** DB response times.

---

## Environment Variables (Production)

```bash
# Database
DATABASE_URL=postgresql://postgres:<password>@postgres.railway.internal:5432/railway

# APIs & Secrets
API_BASE_URL=https://whattoeatnext-production.up.railway.app
INTERNAL_API_SECRET=<internal-api-secret>
GALILEO_API_KEY=<galileo-api-key>

# Auth (NextAuth.js v5)
AUTH_SECRET=<auth-secret>
AUTH_GOOGLE_ID=<google-client-id>
AUTH_GOOGLE_SECRET=<google-client-secret>
AUTH_ADMIN_EMAIL=<admin-email>
AUTH_URL=https://alchm.kitchen

# Payment & Messaging
STRIPE_SECRET_KEY=<stripe-secret-key>
RESEND_API_KEY=<resend-api-key>
SMTP_PASS=<smtp-pass>
```

---

## Core Architecture

- **Three-Tier Hierarchical Data**: Ingredients → Recipes → Cuisines.
- **NextAuth.js v5**: Google OAuth with Server/Edge split config.
- **Denormalized Recipes**: `read_model` column for high-speed delivery.

---

_Updated May 5, 2026 — Optimization & Migration Complete._
