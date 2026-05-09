# 🚨 Railway Backend Diagnostic Report
**Service:** `whattoeatnext-production.up.railway.app` (alchm-backend)  
**Date:** 2026-05-09 @ 21:43 UTC  
**Reported by:** Planetary Agents project (cross-project diagnostic)

---

## Executive Summary

The WhatToEatNext Railway backend (`alchm-backend`) is in a **DEGRADED** state. The database is **OFFLINE**, which is causing cascading failures across multiple endpoints. The core `/alchemize` endpoint is **completely broken** (503), while mathematical/ephemeris-only endpoints like `/api/alchemical/quantities` and `/api/planetary/positions` still work because they don't require database access.

> [!CAUTION]
> The `/alchemize` endpoint — the critical alchemical calculation pipeline — is returning **503** with the message:  
> `"Alchemical calculation failed: 503: Failed to call alchemize API after trying 2 URLs"`  
> This suggests `/alchemize` internally tries to call downstream services (likely itself or a Swiss Ephemeris microservice) at 2 URLs, and **both are unreachable**.

---

## Health Check Response

```json
{
  "status": "degraded",
  "database": "offline",
  "timestamp": "2026-05-09T21:43:12.814000",
  "service": "alchm-backend"
}
```

Compare with the **Planetary Agents Core** Railway backend (`passionate-vibrancy-production-2e31.up.railway.app`), which is healthy:
```json
{
  "status": "healthy",
  "service": "planetary-agents-core",
  "database": "connected"
}
```

---

## Endpoint-by-Endpoint Status

| Endpoint | Method | Status | Notes |
|---|---|---|---|
| `/health` | GET | ⚠️ DEGRADED | Returns `"database": "offline"` |
| `/alchemize` | POST | ❌ **BROKEN** (503) | `"Failed to call alchemize API after trying 2 URLs"` — internal service-to-service calls failing |
| `/api/alchemical/quantities` | POST | ✅ WORKING | Returns spirit/essence/matter/substance scores correctly |
| `/api/planetary/positions` | POST | ✅ WORKING | Swiss Ephemeris calculations returning full planetary data |
| `/api/planetary/positions/bulk` | POST | ✅ LIKELY WORKING | Uses same Swiss Ephemeris backend as single positions |
| `/planetary/current` | GET | ✅ WORKING | Returns current planetary positions |
| `/recommend/recipes` | POST | ❌ **BROKEN** (500) | `"Internal Server Error"` — likely needs database |
| `/astrological/zodiac-recipes` | GET | ✅ WORKING | Returns full recipe data (with capitalized sign names, e.g. `Taurus` not `taurus`) |
| `/api/v1/cuisines` | GET | ✅ WORKING | Returns full cuisine catalog |
| `/api/v1/sauces` | GET | ✅ LIKELY WORKING | Catalog endpoint |
| `/api/me` | GET | 🔒 AUTH REQUIRED | Returns 401 as expected when unauthenticated |
| `/api/generate-alchemical-image` | POST | ⚠️ UNTESTED | Requires proper payload with `name` field |

---

## Root Cause Analysis

### 1. Database Offline
The health check explicitly reports `"database": "offline"`. This is the **primary failure**. The database being offline causes:
- `/recommend/recipes` → 500 (needs DB for recipe data)
- Likely any user-specific endpoints → failures
- Possible cascading impact on `/alchemize` if it stores/reads intermediate results from DB

### 2. `/alchemize` Internal Service Routing Failure
The `/alchemize` endpoint error message reveals it tries **2 internal URLs** to perform the alchemical calculation and **both fail**. This suggests:
- The `/alchemize` handler internally calls a downstream service (possibly a separate Swiss Ephemeris worker or the Render-hosted alchemize service)
- The 2 URLs it tries are both unreachable — **this could be the Render service that's been deprecated/shut down**
- The fix would be to update the internal URL routing in the WhatToEatNext backend to point to Railway-hosted services only

> [!IMPORTANT]
> The "2 URLs" in the error likely include a **Render URL** that no longer exists. The WhatToEatNext backend's alchemize handler needs to be updated to use only Railway-hosted endpoints.

### 3. OpenAI API Quota Exhausted (Separate Issue)
The Planetary Agents chat system uses OpenAI API for agent responses. The API key in `.env.local` has **exceeded its quota**:
```
You exceeded your current quota, please check your plan and billing details.
```
This is NOT a Railway issue — it's a billing issue on the OpenAI account.

---

## What's Working (No Action Needed)

These endpoints work perfectly and are being used successfully by the Planetary Agents frontend:

1. **`/api/alchemical/quantities`** — Spirit/Essence/Matter/Substance calculations ✅
2. **`/api/planetary/positions`** — Full Swiss Ephemeris planetary position data ✅
3. **`/planetary/current`** — Quick current positions ✅
4. **`/api/v1/cuisines`** — Full cuisine catalog ✅
5. **`/astrological/zodiac-recipes`** — Recipe recommendations by zodiac sign ✅

---

## Recommended Fixes (Priority Order)

### 🔴 P0: Fix Database Connection
- Check Railway PostgreSQL addon status
- Verify `DATABASE_URL` environment variable is set correctly in Railway dashboard
- Check if the database instance needs to be restarted or has hit storage/connection limits

### 🔴 P0: Fix `/alchemize` Internal URL Routing
- The handler tries 2 URLs internally — identify what those URLs are
- If one points to a **Render** deployment, update it to the Railway URL
- If it's calling itself recursively, check for circular dependency
- Search the WhatToEatNext codebase for the URL list (likely in an env var like `ALCHEMIZE_URLS` or hardcoded in the alchemize handler)

### 🟡 P1: Top Up OpenAI API Credits
- The `OPENAI_API_KEY` used by Planetary Agents has exceeded its quota
- Either add billing credits or rotate to a new key

### 🟢 P2: Fix `/recommend/recipes` 
- Likely self-heals once the database is back online

---

## Local Workaround (Currently Active)

The Planetary Agents project has configured a **local proxy architecture** to work around the Railway issues:

```
Next.js (localhost:3001)
  └─→ Local Python Core Backend (localhost:8000)
        ├── /api/agents, /api/chat, /api/moment-recommendations → local SQLite
        ├── /alchemize → proxies to Railway WhatToEatNext (currently failing upstream)
        ├── /api/alchemical/quantities → proxies to Railway WhatToEatNext ✅
        └── /api/planetary/positions → proxies to Railway WhatToEatNext ✅
```

---

*Report generated for cross-project reference by the Planetary Agents development session.*
