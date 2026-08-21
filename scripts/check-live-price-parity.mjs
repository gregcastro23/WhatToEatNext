#!/usr/bin/env node

const KITCHEN_URL =
  process.env.ALCHM_KITCHEN_PRICE_URL ??
  "https://alchm.kitchen/api/economy/price-index";
const AGENTS_URL =
  process.env.ALCHM_AGENTS_PRICE_URL ??
  "https://agents.alchm.kitchen/api/economy/price-index";
const TOKEN_NAMES = ["Spirit", "Essence", "Matter", "Substance"];
const PRICE_TOLERANCE = 0.00005;

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }

  return response.json();
}

function kitchenPrices(payload) {
  return Object.fromEntries(
    payload.tokens.map(({ token, index }) => [token, Number(index)]),
  );
}

function agentsPrices(payload) {
  if (Array.isArray(payload.tokens)) {
    return kitchenPrices(payload);
  }
  // Legacy response support keeps this smoke test red-capable until the
  // Agents adapter is deployed; the old endpoint called these synthetic USD.
  return Object.fromEntries(
    TOKEN_NAMES.map((token) => [
      token,
      Number(payload.elements[token].priceUsd),
    ]),
  );
}

const [kitchenPayload, agentsPayload] = await Promise.all([
  fetchJson(KITCHEN_URL),
  fetchJson(AGENTS_URL),
]);
const kitchen = kitchenPrices(kitchenPayload);
const agents = agentsPrices(agentsPayload);
const rows = TOKEN_NAMES.map((token) => ({
  token,
  kitchen: kitchen[token].toFixed(4),
  agents: agents[token].toFixed(4),
  delta: (agents[token] - kitchen[token]).toFixed(4),
}));

console.table(rows);

const mismatches = rows.filter(
  ({ token }) => Math.abs(kitchen[token] - agents[token]) > PRICE_TOLERANCE,
);

if (mismatches.length > 0) {
  console.error(
    `FAIL: ${mismatches.length}/${TOKEN_NAMES.length} ESMS token prices diverge across the two sites.`,
  );
  process.exitCode = 1;
} else {
  console.log("PASS: both sites publish the same four ESMS token prices.");
}
