# Alchm.kitchen MCP Server Architecture

This document outlines the dual-database, multi-agent Model Context Protocol (MCP) architecture powering the data calculations, alchemical scoring, and cognitive persona layers of **Alchm.kitchen (Alchm)** and **Planetary Agents (PA)**.

---

## 🗺️ Architectural Topology

Our system implements a strict, enterprise-grade separation of concerns between user-facing transactions and agent-focused cognitive state, anchored by two separate databases and bridged by the Model Context Protocol.

```mermaid
graph TD
    User([External LLM / Cursor / Antigravity Agent]) -->|JSON-RPC| MCP_Client[Unified MCP Client]
    
    subgraph WTEN Web Surface [Data & Transaction Layer]
        MCP_Client -->|stdio/SSE| Alchm_MCP[Alchm Data MCP Server]
        Alchm_MCP -->|Query| DB_WTEN[(WTEN Postgres)]
        Alchm_MCP -->|Compute| Ephemeris[Swiss Ephemeris]
        
        DB_WTEN -->|Stores| User_Profiles[User Profiles / ESMS Tokens]
        DB_WTEN -->|Stores| Recipe_Catalog[579 Recipes & ASINs]
    end
    
    subgraph Planetary Agents Standalone [Cognitive & Persona Layer]
        MCP_Client -->|stdio/SSE| Agent_MCP[Planetary Agents MCP Server]
        Agent_MCP -->|Query/Write| DB_PA[(PA Postgres)]
        
        DB_PA -->|Stores| Agent_Memories[Agent Short & Long-Term Memories]
        DB_PA -->|Stores| Chat_Logs[Persona Contexts & Chat Logs]
        
        Agent_MCP -->|Socrates| Agent1[Socrates Persona]
        Agent_MCP -->|Rumi| Agent2[Rumi Persona]
        Agent_MCP -->|Galileo| Agent3[Galileo Persona]
    end
    
    %% Inter-Server Bridge
    Agent_MCP -.->|Queries Transits & Recipes| Alchm_MCP
```

---

## 🗄️ Database Separation

1.  **WTEN Postgres (Transactional Web Anchor)**:
    *   **Scope**: Manages user profiles, birth data, alchemical reserves (ESMS balances), Stripe subscriptions, daily limits, and Amazon Fresh shopping carts.
    *   **Characteristics**: Highly optimized for transactional integrity, fast user hydration, and deterministic operations.
2.  **PA Postgres (Cognitive Agent Anchor)**:
    *   **Scope**: Manages agent long-term memory logs, conversational histories, vector memories, and historical character state files.
    *   **Characteristics**: Isolated to prevent massive agent conversational logs from bloating or degrading performance on transactional user tables.

---

## 🛠️ Exposing the Alchm MCP Server Tools

The `alchm-mcp-server` resides in `mcp-server/` and runs on Bun. It exposes three primary tools over the Stdio transport channel:

### 1. `get_live_sky_transits`
*   **Purpose**: Computes live planetary degrees and active elements.
*   **Arguments**:
    *   `latitude`: (optional) number
    *   `longitude`: (optional) number
*   **Output**: Current sky elements (Fire, Water, Earth, Air), dominant sign placements, and house degrees calculated using Swiss Ephemeris.

### 2. `alchemize_ingredients`
*   **Purpose**: Computes the Spirit, Essence, Matter, and Substance (ESMS) balances of raw foods.
*   **Arguments**:
    *   `ingredients`: (required) array of strings (e.g. `["tomato", "basil"]`)
*   **Output**: Individual ingredient scores, overall alchemical harmony ratings, and thermodynamic indices (heat, entropy, reactivity).

### 3. `generate_cosmic_recipe`
*   **Purpose**: Discovers cosmos-aligned dishes from our high-performance recipe catalog.
*   **Arguments**:
    *   `prompt`: (optional) string search keyword
    *   `cuisine`: (optional) string
    *   `dietary`: (optional) array of restrictions (`['vegetarian', 'vegan']`)
    *   `dominantElement`: (optional) target element (`'Fire' | 'Water' | 'Earth' | 'Air'`)
*   **Output**: High-fidelity recipes with complete ingredient quantities and alchemical properties.

---

## 🔗 Running Locally

You can launch this server inside any LLM environment (Cursor, Claude Desktop, Google Antigravity SDK) using Bun:

```bash
bun run mcp-server/src/index.ts
```

Ensure the `DATABASE_URL` is set in your environment variables to connect directly to the WTEN database, or run without it to automatically fallback to local static assets.
