/**
 * @jest-environment node
 *
 * An agent with an unparseable name and no chart must be UNCONSTRUCTIBLE.
 *
 * `[MEASURED 2026-08-09]` the "Agent monica drift + integrity" gate went red on
 * master and stayed red for two days for a single row: the agent `Chiron`, name
 * unparseable, `natal_positions = []`. Deleting the row cleared the gate; it did
 * nothing about the writer that made it. `ensureAgent` classifies monica at
 * creation but never writes `natal_positions` at all, so that exact shape was
 * still one feed event away from returning.
 *
 * These tests pin the writer-side invariant. It is the precise negation of the
 * gate's own failing predicate:
 *
 *     parseAgentPlacement(name) === null && fullChartMonica(positions) === null
 *
 * Remove the guard block from `ensureAgent` and the "refuses" tests fail.
 */

// The holder is deliberate — see the note in userDatabaseService.signupGrant
// test. `ensureAgent` reaches the DB through a lazy `await import`, which is a
// DIFFERENT module instance than a top-level import in this file; attaching an
// implementation to the latter would leave the transaction callback unrun and
// every assertion below passing vacuously on zero captured statements.
const mockWithTransaction = jest.fn();
const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  withTransaction: (...args: unknown[]) => mockWithTransaction(...args),
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

import { userDatabase } from "@/services/userDatabaseService";
import {
  AgentChartRequiredError,
  agentIsClassifiable,
} from "@/utils/agentChartInvariant";
import { MIN_CHART_BODIES } from "@/utils/fullChartMonica";

const AGENT_EMAIL = "test-agent@agentic.alchm.kitchen";

/** A chart with enough bodies to be usable, in the array shape every writer emits. */
const USABLE_CHART = [
  { planet: "Sun", sign: "aries", degree: 10 },
  { planet: "Moon", sign: "taurus", degree: 12 },
  { planet: "Mercury", sign: "gemini", degree: 3 },
  { planet: "Venus", sign: "cancer", degree: 21 },
  { planet: "Mars", sign: "leo", degree: 8 },
  { planet: "Jupiter", sign: "virgo", degree: 17 },
];

interface Captured {
  sql: string;
  values: unknown[];
}

/**
 * Drive the real `ensureAgent` through a fake transaction.
 *
 * `verifiedRow` is what the post-upsert read-back returns — i.e. the state the
 * row would have IN the database. That is the input the guard actually judges,
 * which is what lets these tests cover the refresh case where the chart was
 * written by some other producer.
 */
async function runEnsureAgent(
  displayName: string | undefined,
  verifiedRow: { name: string | null; natal_positions: unknown } | undefined,
): Promise<{ captured: Captured[]; error: unknown; committed: boolean }> {
  const captured: Captured[] = [];
  let committed = false;

  const client = {
    query: jest.fn(async (sql: string, values: unknown[] = []) => {
      captured.push({ sql, values });
      if (/SELECT name, natal_positions/i.test(sql)) {
        return { rowCount: verifiedRow ? 1 : 0, rows: verifiedRow ? [verifiedRow] : [] };
      }
      return { rowCount: 1, rows: [{ id: "agent-uuid" }] };
    }),
  };

  mockWithTransaction.mockImplementation(async (cb: (c: unknown) => Promise<void>) => {
    await cb(client);
    // Only reached when the callback did NOT throw. A guard that throws must
    // leave this false — that is the assertion that the row is rolled back
    // rather than merely reported.
    committed = true;
  });

  let error: unknown = null;
  try {
    await userDatabase.ensureAgent(AGENT_EMAIL, displayName);
  } catch (e) {
    error = e;
  }
  return { captured, error, committed };
}

const savedDatabaseUrl = process.env.DATABASE_URL;

beforeEach(() => {
  jest.clearAllMocks();
  // After the transaction commits, `ensureAgent` re-reads the user through
  // `getUserByEmail` and throws if it comes back empty. That lookup is not what
  // these tests are about, so it is stubbed to succeed — otherwise every
  // "allows" case fails on the lookup rather than on the guard.
  mockExecuteQuery.mockResolvedValue({
    rows: [
      {
        id: "agent-uuid",
        email: AGENT_EMAIL,
        password_hash: "AGENT_NO_LOGIN",
        role: "USER",
        is_active: true,
        is_agent: true,
        created_at: new Date(),
        profile_name: "Agent",
      },
    ],
  });
});

describe("agentIsClassifiable — the shared predicate", () => {
  it("accepts a name that parses as a placement", () => {
    expect(agentIsClassifiable("Saturn in Aries 5", null)).toBe(true);
    expect(agentIsClassifiable("Mars Agent 42", undefined)).toBe(true);
  });

  it("rejects the Chiron shape: bare name, empty chart", () => {
    expect(agentIsClassifiable("Chiron", [])).toBe(false);
  });

  it("accepts a bare name when it carries a usable chart", () => {
    // This is why Socrates, Plato and Rumi pass the gate while Chiron did not.
    expect(agentIsClassifiable("Socrates", USABLE_CHART)).toBe(true);
  });

  it("rejects a chart with too few bodies to be usable", () => {
    const tooFew = USABLE_CHART.slice(0, MIN_CHART_BODIES - 1);
    expect(agentIsClassifiable("Socrates", tooFew)).toBe(false);
  });

  it("rejects an object-shaped chart, as parseNatalPositions does", () => {
    // `natal_positions` is an ARRAY in every writer; an object yields no chart.
    const asObject = Object.fromEntries(USABLE_CHART.map((p) => [p.planet, p]));
    expect(agentIsClassifiable("Socrates", asObject)).toBe(false);
  });

  it("rejects a missing name with no chart", () => {
    expect(agentIsClassifiable(null, null)).toBe(false);
    expect(agentIsClassifiable("", [])).toBe(false);
  });

  /**
   * The distinction that makes this predicate correct rather than merely
   * plausible. `agentMonicaWithMethod` catches `UnknownMoonPhaseError` and
   * returns null for a name that IS a well-formed placement whose phase cannot
   * be classified. The gate counts such a name as a placement — so guarding on
   * the resolver instead of the parser would refuse a row the gate accepts.
   *
   * Swap `parseAgentPlacement` for `agentMonicaWithMethod` in
   * agentChartInvariant.ts and this test fails while every other one passes.
   */
  it("accepts a placement whose phase cannot be classified", () => {
    expect(agentIsClassifiable("Moon Phase Nonexistent 123", null)).toBe(true);
  });
});

/**
 * MUST run before the DB suite below. `getDbModule` caches the imported module
 * in a module-level `dbModule` and only consults `DATABASE_URL` while that cache
 * is empty — so once a DB test has run, unsetting the env var no longer returns
 * this branch. Ordering is the dependency; do not move this block.
 */
describe("ensureAgent — in-memory path (no DATABASE_URL)", () => {
  it("refuses an unparseable name there too", async () => {
    expect(process.env.DATABASE_URL).toBeUndefined();
    await expect(
      userDatabase.ensureAgent("chiron@agentic.alchm.kitchen", "Chiron"),
    ).rejects.toBeInstanceOf(AgentChartRequiredError);
  });

  it("still provisions a placement-named agent", async () => {
    const user = await userDatabase.ensureAgent(
      "saturn-aries-5@agentic.alchm.kitchen",
      "Saturn in Aries 5",
    );
    expect(user.isAgent).toBe(true);
  });
});

describe("ensureAgent — enforcement", () => {
  /**
   * `ensureAgent` only reaches the database when `isServerWithDB()` is true,
   * which requires `DATABASE_URL`. Without this the suite silently runs the
   * in-memory branch instead — the guard tests still pass, because that branch
   * throws too, but they would prove nothing about the transaction. The
   * "verifies inside the transaction" test is what exposes that substitution.
   *
   * The value is inert: `@/lib/database` is mocked in full, nothing connects.
   */
  beforeAll(() => {
    process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";
  });
  afterAll(() => {
    if (savedDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedDatabaseUrl;
  });

  it("refuses to create an agent with an unparseable name and no chart", async () => {
    const { error, committed } = await runEnsureAgent("Chiron", {
      name: "Chiron",
      natal_positions: [],
    });

    expect(error).toBeInstanceOf(AgentChartRequiredError);
    expect(committed).toBe(false); // rolled back, not merely reported
  });

  it("does not launder the refusal into a generic provisioning failure", async () => {
    // The catch in ensureAgent wraps everything in `new Error("Failed to
    // provision agent")`. If the typed error does not survive that wrapper,
    // every caller falls back to 500 and the 422 mapping is dead code.
    const { error } = await runEnsureAgent("Chiron", {
      name: "Chiron",
      natal_positions: [],
    });

    expect(error).toBeInstanceOf(AgentChartRequiredError);
    expect((error as Error).message).not.toBe("Failed to provision agent");
    expect((error as AgentChartRequiredError).agentEmail).toBe(AGENT_EMAIL);
  });

  it("allows an agent whose name parses as a placement", async () => {
    const { error, committed } = await runEnsureAgent("Saturn in Aries 5", {
      name: "Saturn in Aries 5",
      natal_positions: null,
    });

    expect(error).toBeNull();
    expect(committed).toBe(true);
  });

  /**
   * The case a pre-check on the arguments would get WRONG.
   *
   * On the DO UPDATE branch — an existing user being flipped to is_agent — the
   * row may already carry a chart written by another producer. The caller passes
   * only a name, so a guard reading its arguments sees no chart and refuses a
   * healthy agent. Reading the post-upsert row is what makes both cases correct.
   */
  it("allows a bare-name agent that already carries a chart in the row", async () => {
    const { error, committed } = await runEnsureAgent("Socrates", {
      name: "Socrates",
      natal_positions: USABLE_CHART,
    });

    expect(error).toBeNull();
    expect(committed).toBe(true);
  });

  it("refuses when the read-back finds no profile row at all", async () => {
    const { error, committed } = await runEnsureAgent("Saturn in Aries 5", undefined);

    expect(error).toBeInstanceOf(AgentChartRequiredError);
    expect(committed).toBe(false);
  });

  it("verifies inside the transaction, after the profile write", async () => {
    // Anti-vacuity: proves the guard reads real post-upsert state rather than
    // short-circuiting before the writes. If the SELECT is not last, the row it
    // judges is not the row that would be committed.
    const { captured } = await runEnsureAgent("Saturn in Aries 5", {
      name: "Saturn in Aries 5",
      natal_positions: null,
    });

    expect(captured.length).toBeGreaterThan(2);
    expect(captured[0].sql).toMatch(/INSERT INTO users/i);
    expect(captured[1].sql).toMatch(/INSERT INTO user_profiles/i);
    expect(captured[captured.length - 1].sql).toMatch(/SELECT name, natal_positions/i);
  });
});
