# Alchemical Calculation Pipeline: Next Steps & Architectural Optimizations

Following the successful cross-backend quantity verification and contract synchronization between `WhatToEatNext` and `planetary_agents`, the pipeline is now significantly more robust. Below are proposed next steps for continuing the evolution of the alchemical pipeline.

## 1. Architectural Optimizations

### A. Shared Distributed Sync Cache
Currently, `PlanetaryPositionSyncService` utilizes an in-memory `Map` cache. As the system scales horizontally on Railway or Vercel, this cache will not be shared across worker processes.
- **Action**: Migrate the synchronization cache to a shared Redis instance. This will ensure consistent cache hits across all agent instances and reduce redundant external queries to `WhatToEatNext`.

### B. Event-Driven Pub/Sub Synchronization
The current architecture relies on synchronous REST polling (and optional webhook calls).
- **Action**: Introduce a lightweight Pub/Sub queue (e.g., Redis Pub/Sub) specifically for planetary/alchemical shifts. When `planetary_agents` computes a high-precision VSOP87 shift, it can broadcast the event immediately to `WhatToEatNext` Edge workers.

### C. Consolidating the Ephemeris Source of Truth
The `WhatToEatNext` frontend currently falls back to a moderate-precision `astronomy-engine` if the Python backend is down.
- **Action**: Package the high-precision VSOP87 calculations from `planetary_agents` into a standalone, cached microservice or Edge Function. This ensures both projects rely strictly on the same mathematical implementation rather than reconciling two different libraries.

## 2. Diagnostic Tasks

### A. VSOP87 vs Astronomy Engine Drift Analysis
We now collect `original_discrepancy` whenever `planetary_agents` rectifies `WhatToEatNext`.
- **Action**: Build a chron-driven diagnostic script that aggregates these discrepancies over a 30-day window. This will give empirical data on the exact degree of drift between the local TS calculations and the backend calculations, determining if the local TS engine should be entirely deprecated.

### B. Internal Network Latency Audits
We have migrated `WhatToEatNext` to use internal Railway Networking (`postgres.railway.internal` and API links).
- **Action**: Implement continuous latency tracking specifically for cross-backend verification calls. We need to confirm if the 2000ms AbortController timeout in the Next.js `alchm-quantities` route is ever triggered during peak load.

### C. Alchemical Quantity Anomaly Detection
With quantities verification active, `discrepancy` metrics for Spirit/Essence/Matter/Substance are logged.
- **Action**: Route these discrepancies to a dedicated alerting channel (e.g. Sentry or a Discord webhook) to notify the team instantly if the thermodynamic/kinetic models drift apart between Python and TypeScript implementations.