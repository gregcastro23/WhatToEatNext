# Data Infrastructure Audit & Optimization Roadmap

## 1. Current State Assessment

### 1.1 Performance Metrics
- **Network Latency (Cold):** ~550ms (Initial connection/SSL handshake)
- **Network Latency (Warm):** ~45ms (Subsequent queries)
- **Full Recipe Load (Complex Query):** ~900ms for 579 recipes
- **Migration Speed:** ~1.5 - 2 recipes/second (Bottlenecked by serial inserts and network round-trips)

### 1.2 Bottlenecks Identified
1. **Migration Pipeline:** The `migrate_data.py` script performs serial inserts. With ~580 recipes and several thousand ingredients/relationships, this results in thousands of round-trips.
2. **Cold Start Latency:** The initial connection to the Neon serverless database adds ~500ms of overhead.
3. **Data Fetching Pattern:** The application often fetches "all recipes" to perform local filtering/sorting. As the catalog grows, this load time will become a significant UX blocker.
4. **Complex Joins:** The `RECIPE_QUERY` uses multiple subqueries to aggregate data into JSON. While elegant, this is computationally expensive.

---

## 2. Optimization Recommendations

### 2.1 Middleware & Type Safety (NEW)
- **Zod Integration:** `zod` is already present in `package.json`. It should be strictly enforced for all frontend API responses and form validations to ensure data integrity before it reaches the UI.
- **Hono for Edge/Backend:** While the backend is currently FastAPI (Python), a migration to `Hono` (TypeScript) should be considered if the goal is to unify the stack. `Hono` is extremely fast, has built-in Zod support, and runs efficiently on Edge (Vercel/Cloudflare).
- **CORS Preflight Fix:** Resolved the `400 Bad Request` on `OPTIONS` by ensuring `allow_credentials=True` is never paired with `allow_origins=["*"]`.

### 2.2 Reliability Layer (NEW)
- **Fetch with Retry:** Implemented a unified `fetchWithRetry` utility with exponential backoff to handle intermittent `NetworkError` and `400` status codes.
- **Increased Timeouts:** Bumped frontend and API route timeouts to **15-20 seconds** to accommodate serverless cold starts (Railway/Neon) and complex SQL aggregations.
- **Graceful Degradation:** Refined fallback logic to ensure components like `DynamicCuisineRecommender` transition smoothly to local calculations if the backend remains unresponsive after retries.

### 2.3 Migration Strategy (Short Term)
- **Bulk Inserts:** Rewrite migration scripts to use bulk `INSERT` statements. This can reduce migration time from minutes to seconds.
- **Transaction Batching:** Group related inserts into single transactions.

### 2.4 Application Data Access (Medium Term)
- **Server-Side Caching:** Implement a caching layer (e.g., Redis) for the recipe catalog.
- **Materialized Views:** Create a materialized view that pre-calculates the complex `RECIPE_QUERY` JSON to avoid expensive joins on every read.

### 2.5 Architecture & Schema (Long Term)
- **Denormalization:** Store ingredient summaries directly in the `recipes` table to eliminate joins for list views.
- **Edge Data:** Use globally distributed caching to minimize cold start latency for end-users.

---

## 3. Fundamental Architectural Analysis: SQL vs. NoSQL

### 3.1 The "SQL-to-JSON" Anti-Pattern
The current system uses PostgreSQL as a relational database but treats it as a Document Store by aggregating deeply nested relationships (Ingredients, Contexts, Elemental Properties) into a JSON blob on every read.

- **The Cost:** For every request, the database engine must perform multiple joins, index scans, and JSON construction operations. This results in the **~900ms** latency for ~580 recipes.
- **The Redundancy:** Since recipe data is mostly static (351+ curated items), re-calculating this structure on every request is wasted compute.

### 3.2 SQL vs. NoSQL Comparison

| Feature | Current SQL (Relational) | Proposed NoSQL / Document |
| :--- | :--- | :--- |
| **Data Model** | Normalized (Many tables) | Denormalized (Single Document) |
| **Read Speed** | Slow (~900ms) - Aggregation heavy | Ultra-fast (<20ms) - Direct fetch |
| **Write Speed** | Complex - Multiple table inserts | Fast - Single document update |
| **Consistency** | High - Referential integrity | Eventual - Schema-less flexibility |
| **Use Case** | Complex analytical queries | Rapid content delivery |

**Recommendation:** For the **Recipe Catalog**, a **Document Store approach** is superior. We should either:
1. **Denormalize SQL:** Store the final `Recipe` JSON blob in a single `jsonb` column in the `recipes` table.
2. **Pre-computed Cache:** Use Redis or a flat JSON file at the Edge to serve the catalog, bypassing the DB entirely for reads.

### 3.3 Parallel Request Contention
On initial app load, the frontend triggers **3-4 concurrent heavy requests** (Current Astrology, Historical Astrology, Cuisine Recommendations).
- **Backend Impact:** These requests compete for the same database connections and compute resources on the Railway container.
- **Cold Start Amplification:** If the backend is cold-starting, these parallel requests can cause a "thundering herd" effect, leading to the timeouts and `AbortError` seen in the logs.

### 3.4 Backend Disk I/O Bottlenecks
The Python backend was loading and parsing large JSON files (e.g., **21MB** `cuisines.json`) from disk on every single request.
- **The Fix:** Implemented `@lru_cache` for the `load_json_file` function in `main.py`. This ensures that after the first load, subsequent requests serve the data from RAM, eliminating disk latency and JSON parsing overhead.

### 3.5 Asset Bloat
- **Logo Size:** `Aklogo.jpg` in the public folder is **1.7MB**. This is massive for a header logo and blocks the initial page render.
- **Preload Warning:** The console warning regarding preloads is often a side effect of slow asset loading or mismatches in how Next.js pre-fetches these large binaries.
- **Recommendation:** Convert all static assets to optimized formats (WebP/AVIF) and resize them to the actual display dimensions.

---

## 4. Implementation Plan (Updated)

| Task | Priority | Estimated Impact |
| :--- | :--- | :--- |
| **Denormalized Recipe "Read Model"** | Critical | 10x faster recipe loading |
| **Image Optimization (Logo)** | High | Faster initial paint |
| **Request Serialization/Batching** | High | Resolved startup timeouts |
| **Bulk Migration Script** | High | 10x faster seeding |
| **In-Memory Cache (Applied)** | High | Resolved Backend I/O lag |

---

## 5. The Ideal Architecture Blueprint

To achieve sub-100ms performance and maximum reliability, we should move from a "Fragmented SQL" model to a **"Unified Edge-First"** stack.

### 5.1 The Stack
| Layer | Technology | Role | Why? |
| :--- | :--- | :--- | :--- |
| **Frontend/API** | Next.js + Hono | Unified Stack | Eliminates the Python/TS boundary. Hono is optimized for Edge performance. |
| **Real-time Data** | Upstash Redis | Global Cache | Stores pre-computed astrology and "Top 10" recommendations. Sub-1ms latency. |
| **Static Content** | Cloudflare KV | Document Store | Stores the full Recipe catalog as JSON. Globally distributed to the user's nearest edge. |
| **Relational Data** | Neon Postgres | Source of Truth | Handles Users, Subscriptions, and the Food Diary where referential integrity matters. |

### 5.2 Why this is "Ideal"
1. **The "Read Model" Pattern:** Instead of asking SQL to "build" a recipe JSON on every request (900ms), we store the *already finished* JSON in a KV store or Redis. Reading a key-value pair is **50x faster** than a 5-way join.
2. **Unified Language:** Using TypeScript for the Astrology Engine (via `astronomy-engine`) allows the frontend to compute positions locally or via Edge functions, removing the **~500ms round-trip** to the Railway Python backend.
3. **Regional Proximity:** Vercel + Cloudflare KV moves your data to within miles of the user. Your current stack (Neon/Railway) forces all data through a single US-East data center, adding 100ms+ of physical travel time for global users.

### 5.3 Implementation Steps for "Ideal" State
1. **Denormalize Recipes:** Add a `data` (jsonb) column to the `recipes` table that holds the full payload.
2. **Edge API Route:** Create a `/api/recipes` route in Next.js that fetches from that single column (or a KV store).
3. **Deprecate Python:** Port the remaining Python-specific logic (pyswisseph) to a specialized TS worker or optimize the existing TS library.

---
*Created: May 5, 2026 | Prepared by: Gemini CLI*
