# Next Session Prompt: ESMS 2.0 Synchronization Across MCP Servers, Railway, and SpacetimeDB

> **Context**: ESMS 2.0 Unified Physics Model & Gaussian Wave Function Field Engine (`0647e6d6`) has landed and merged into `master`. 
> All 161 TypeScript test suites (1,337 tests) and Python conformance test suites pass with zero drift ($< 10^{-5}$).

---

## 0. Current System State (July 31, 2026)

- **Repository**: `WhatToEatNext-master` @ `master` (`0647e6d6`).
- **Core Physics Status (ESMS 2.0)**:
  - **TypeScript Engine**: [planetaryAlchemyMapping.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/planetaryAlchemyMapping.ts) contains inverse-square gravitational inertia ($M/r^2$), tidal pull ($M/r^3$), and dynamic Ascendant positional vessel `calculatePositionalAscendantVessel(sign, degree)`. Inertia variable sprawl disambiguated to `thermodynamicResistance`.
  - **Python FastAPI Engine**: [backend/utils/planetary_alchemy.py](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/backend/utils/planetary_alchemy.py), [backend/utils/esms_wavefunction.py](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/backend/utils/esms_wavefunction.py), and [backend/utils/natal_alchemy.py](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/backend/utils/natal_alchemy.py) operate at 100% mathematical parity with TS using `Planet Identity × Sect` and continuous Gaussian wave packets $\mathbf{\Psi}(\theta) = \mathbf{S} \mathbf{\Lambda}(r) \mathbf{g}(\theta)$.
  - **Golden Vectors & Conformance**: [esms_conformance.json](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/physics/esms_conformance.json) (20 charts) verified across Python `unittest` and TS `bun test`.
  - **Specification**: Documented in [ESMS_WAVE_FUNCTION_SPECIFICATION.md](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/physics/ESMS_WAVE_FUNCTION_SPECIFICATION.md).

---

## 1. Mission Objectives: Deploy & Synchronize ESMS 2.0 Across 3 Nodes

### Target Node 1: MCP Server Instrumentation (`mcp-server/` & `src/lib/mcp/`)
1. **Update Tool Handlers**:
   - Update MCP tool implementations (`get_live_sky_transits`, `synastry_calc`, `alchm_quantities_probe`, `natal_chart_analysis`) to use the ESMS 2.0 engine functions.
   - Expose the 4 continuous scalar wave functions ($\psi_S, \psi_E, \psi_M, \psi_\Sigma$) and inverse-square inertia ($M/r^2$) in MCP tool response payloads.
2. **Verification**:
   - Run stdio integration tests (`bun test mcp-server/src/__tests__/stdio.test.ts`).
   - Validate telemetry logging in `mcp_invocations` table.

### Target Node 2: Railway Production Backend Service (`backend/` & Railway Postgres)
1. **Production Service Update**:
   - Verify deployment of updated FastAPI backend ([backend/utils/natal_alchemy.py](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/backend/utils/natal_alchemy.py), [backend/utils/esms_wavefunction.py](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/backend/utils/esms_wavefunction.py), [backend/utils/alchemical_quantities.py](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/backend/utils/alchemical_quantities.py)) to Railway (`api.agents.alchm.kitchen`).
2. **Database & API Parity Audit**:
   - Run Python parity test suite against live Railway PostgreSQL connection:
     `PYTHONPATH=. python3 backend/tests/test_esms_conformance.py`
   - Verify that `/api/alchm-quantities` and `/api/alchemize` endpoints return continuous non-clamped ESMS state vectors matching TS output.

### Target Node 3: SpacetimeDB Live Layer Synchronization (`spacetime-module/`)
1. **Rust Module ESMS Physics Alignment**:
   - Inspect Rust spacetime module (`Spacetimedbhackathon/Pentacles` or `spacetime-module/`).
   - Update Rust planet weighting and sect lookup logic to match ESMS 2.0 (`Planet Identity × Sect`, inverse-square mass weighting $M/r^2$).
2. **Publish Spacetime Module**:
   - Build and publish updated module binary:
     `spacetime publish cookingwithcastrollc/alchm-culinary`
   - Test live websocket synchronization (`wss://maincloud.spacetimedb.com`) across planner, commensal lobby, and feed event modules.

---

## 2. Mandatory Verification & Operational Rules

1. **Strict Runtime Enforcement**: Always execute dev tools via `bun` (`bun --bun run dev`, `bun test`, `bun run typecheck`).
2. **No Raw Clamps or Heuristics**: Do not re-introduce `min(score, 1.0)` clamps or linear element fallbacks (`Fire * 0.6 + Air * 0.4`).
3. **No ORM Usage**: All database queries must use raw PostgreSQL (`pg` / `asyncpg`).
4. **Zero-Drift Invariant**: Both Python and TS test suites must pass cleanly before pushing any production build.
