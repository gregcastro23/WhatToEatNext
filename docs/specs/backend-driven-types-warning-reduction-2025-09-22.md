## Backend-Driven Type Safety and Warning Reduction Spec

Created: 2025-09-22
Updated: 2025-09-22

Status: Zero-Error Baseline Achieved; Warning Reduction In Progress (~4,625 warnings)

### Objectives

- Establish backend as the source of truth for types to prevent drift and eliminate explicit-any usage.
- Centralize API access in a typed client to remove scattered fetch calls and consolidate error handling.
- Migrate complex calculations to backend endpoints to reduce frontend complexity and warnings.
- Replace console statements with structured logging compatible with backend analytics.
- Consolidate duplicate interfaces into a unified set generated from backend OpenAPI.
- Implement type-safe WebSocket channels for real-time updates.
- Drive a systematic warning reduction campaign without compromising functionality (no lazy fixes).

### Guardrails

- Run `yarn build` before `yarn dev`; ensure edits are accepted before builds.
- Enforce definitive casing conventions and Elemental Logic Principles.
- No placeholders/fallbacks: always use real code paths and proper imports.

---

### 1) Generate Frontend Types from Backend Models

Plan:
- Use `openapi-typescript` against FastAPI OpenAPI docs to generate `.d.ts` types for both services.
- Commit generated types under `src/types/api/` and set up a yarn script.

Proposed script (example):

```javascript
// scripts/generate-types-from-backend.js
const { exec } = require('child_process');

exec('npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api/alchemical.ts', (err) => {
  if (!err) console.log('✅ Alchemical API types generated');
});

exec('npx openapi-typescript http://localhost:8100/openapi.json -o src/types/api/kitchen.ts', (err) => {
  if (!err) console.log('✅ Kitchen API types generated');
});
```

TODOs:
- [ ] Add `openapi-typescript` as a dev dependency and create `scripts/generate-types-from-backend.js`.
- [ ] Add yarn script: `"types:api": "node scripts/generate-types-from-backend.js"`.
- [ ] Ensure backends are running locally and CI has access to OpenAPI JSON.
- [ ] Commit generated types under `src/types/api/`.

---

### 2) Centralized Strongly-Typed API Client

Plan:
- Create `src/lib/api/alchm-client.ts` as the single entry point for backend calls.
- Use generated types for request/response; handle errors uniformly.

Example:

```typescript
// src/lib/api/alchm-client.ts
import type { ElementalProperties, ThermodynamicsResult, RecommendationRequest, Recipe } from '@/types/api/kitchen';

export class AlchmAPIClient {
  private readonly endpoints = {
    alchemical: process.env.NEXT_PUBLIC_BACKEND_URL!,
    kitchen: process.env.NEXT_PUBLIC_KITCHEN_BACKEND_URL!,
  };

  async calculateElemental(ingredients: string[]): Promise<ElementalProperties> {
    const response = await fetch(`${this.endpoints.alchemical}/calculate/elemental`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }

  async getRecommendations(request: RecommendationRequest): Promise<Recipe[]> {
    const response = await fetch(`${this.endpoints.kitchen}/recommend/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  }
}

export const alchmAPI = new AlchmAPIClient();
```

TODOs:
- [ ] Create `src/lib/api/alchm-client.ts` using generated types.
- [ ] Add env vars: `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_KITCHEN_BACKEND_URL`.
- [ ] Replace scattered fetch calls to use `alchmAPI` (incremental).
- [ ] Add basic integration tests for client methods.

---

### 3) Backend-First Complex Calculations

Plan:
- Inventory complex calculation modules and migrate to backend endpoints.
- Keep the frontend thin: delegate, validate, display.

Example delta:

```typescript
// Before (complex, weak types)
const calculateComplexAlchemy = (ingredients: any[], factors: any): any => {
  // ...
};

// After (delegate to backend)
const getAlchemicalAnalysis = async (ingredients: string[]): Promise<ThermodynamicsResult> => {
  return alchmAPI.calculateThermodynamics(ingredients);
};
```

TODOs:
- [ ] Identify and list modules to migrate (e.g., `src/calculations/alchemicalEngine.ts`, `src/utils/thermodynamics.ts`).
- [ ] Ensure backend endpoints exist and are documented in OpenAPI.
- [ ] Replace frontend computation paths with API calls; keep feature parity.
- [ ] Remove deprecated calculation code after migration and verification.

---

### 4) Structured Logging Service

Plan:
- Replace raw console usage with a `logger` service that is dev-friendly and sends to analytics in prod.

Example:

```typescript
// src/lib/logger.ts
class Logger {
  private readonly analyticsEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_URL;

  async log(level: 'info' | 'warn' | 'error', message: string, data?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console[level](`[${new Date().toISOString()}] ${message}`, data);
    }
    if (this.analyticsEndpoint) {
      await fetch(`${this.analyticsEndpoint}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, data, timestamp: new Date() }),
      }).catch(() => {});
    }
  }
}

export const logger = new Logger();
```

TODOs:
- [ ] Create `src/lib/logger.ts` with dev + analytics output.
- [ ] Add `NEXT_PUBLIC_ANALYTICS_URL` (optional) and document behavior.
- [ ] Codemod: replace `console.*` with `logger.log` where appropriate.

---

### 5) Consolidate Duplicate Interfaces (Backend as Source of Truth)

Plan:
- Create `src/types/unified.ts` to re-export backend-generated types and add UI-only extensions.
- Deprecate and remove duplicate local interfaces.

Example:

```typescript
// src/types/unified.ts
export * from './api/alchemical';
export * from './api/kitchen';

export interface UIElementalProperties extends ElementalProperties {
  displayColor?: string;
  animationState?: 'idle' | 'calculating' | 'complete';
}

/**
 * @deprecated Use ElementalProperties from '@/types/unified'
 */
export type OldElementalType = ElementalProperties;
```

TODOs:
- [ ] Create `src/types/unified.ts` and re-export generated API types.
- [ ] Move components/services to import from `@/types/unified`.
- [ ] Delete deprecated duplicate interfaces after migration.

---

### 6) Type-Safe WebSocket Integration

Plan:
- Define discriminated unions for message channels and use a typed WebSocket client.

Example:

```typescript
// src/lib/websocket/alchm-websocket.ts
type WSMessage =
  | { channel: 'planetary_hours'; data: PlanetaryHourUpdate }
  | { channel: 'energy_updates'; data: EnergyUpdate }
  | { channel: 'celestial_events'; data: CelestialEvent };

export class AlchmWebSocket {
  private ws: WebSocket | null = null;

  connect(): void {
    this.ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL!);
    this.ws.onmessage = (event) => {
      const message: WSMessage = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }

  private handleMessage(message: WSMessage): void {
    switch (message.channel) {
      case 'planetary_hours':
        this.updatePlanetaryHour(message.data);
        break;
      // ...
    }
  }
}
```

TODOs:
- [ ] Define `PlanetaryHourUpdate`, `EnergyUpdate`, `CelestialEvent` using backend-generated types where possible.
- [ ] Implement `src/lib/websocket/alchm-websocket.ts` with typed handlers and reconnection.
- [ ] Add integration tests or storybook mocks for WS flows.

---

### 7) Strategic Warning Reduction Plan

Plan:
- Phase-by-phase reduction targeting the heaviest categories first while preserving functionality.

Commands/examples:

```bash
# Find all explicit any usage
grep -r "\bany\b" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```

TODOs:
- [ ] Phase 1: Replace explicit `any` with backend-generated types where applicable.
- [ ] Phase 2: Remove unused variables and legacy calculation code moved to backend.
- [ ] Phase 3: Consolidate interfaces to `@/types/unified`; update imports project-wide.
- [ ] Track progress: warnings per category before/after; enforce zero-new-warning policy for touched files.

---

### Implementation Strategy

1. Generate API types → commit.
2. Introduce typed API client and migrate a limited scope (recipes) → verify.
3. Migrate complex calc for a second domain (ingredients) → remove old code.
4. Introduce logger and codemod consoles → verify analytics integration.
5. Create `types/unified` and refactor imports → delete duplicates.
6. Add typed WebSocket client → integrate in relevant screens.
7. Iterate warning reduction phases until baseline significantly drops.

### Deliverables

- `scripts/generate-types-from-backend.js` + yarn script.
- `src/types/api/{alchemical,kitchen}.ts` (generated) and `src/types/unified.ts`.
- `src/lib/api/alchm-client.ts` and `src/lib/logger.ts`.
- `src/lib/websocket/alchm-websocket.ts` with typed channels.
- Removal of legacy calculation code superseded by backend.

### KPIs

- Explicit `any` occurrences reduced by >80% in the first pass.
- Duplicate interfaces removed; imports converge on `@/types/unified`.
- Warnings reduced by 30% in first campaign wave; zero-error baseline maintained.
- No new placeholders; all code paths use real functionality.

### Risks & Mitigations

- Backend endpoints not ready: mitigate by aligning API surface and adding missing routes.
- Drift between backend and frontend models: enforce generation in CI and as a pre-build step.
- Temporary warning spikes during refactors: stage migrations by domain; keep PRs focused.
