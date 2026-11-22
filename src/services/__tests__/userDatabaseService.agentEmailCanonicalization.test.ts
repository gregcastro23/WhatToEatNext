/**
 * @jest-environment node
 *
 * Verifies that userDatabaseService canonicalizes incoming agent emails before
 * user lookup and auto-provisioning — preventing duplicate rows for legacy
 * `@agents.alchm.kitchen` and unprefixed `<planet>-<sign>-<deg>` inputs.
 */

const mockWithTransaction = jest.fn();
const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  withTransaction: (...args: unknown[]) => mockWithTransaction(...args),
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

import { userDatabase } from "@/services/userDatabaseService";

const savedDatabaseUrl = process.env.DATABASE_URL;

beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * Must run BEFORE any test sets `process.env.DATABASE_URL`, because
 * `userDatabaseService` caches the loaded DB module in a module-level variable
 * on first access while `DATABASE_URL` is defined.
 */
describe("userDatabase — in-memory agent email canonicalization (no DATABASE_URL)", () => {
  it("normalizes unprefixed degree emails and derives a classifiable placement name without displayName", async () => {
    expect(process.env.DATABASE_URL).toBeUndefined();

    const provisioned = await userDatabase.ensurePlanetaryAgent(
      "mercury-leo-7@agentic.alchm.kitchen",
    );

    expect(provisioned.email).toBe(
      "planetary-mercury-leo-7@agentic.alchm.kitchen",
    );
    expect(provisioned.profile.name).toBe("Mercury Leo 7");
    expect(provisioned.isAgent).toBe(true);
  });

  it("normalizes combined @agents.alchm.kitchen + unprefixed degree email and resolves the same user", async () => {
    const first = await userDatabase.ensurePlanetaryAgent(
      "  MARS-LEO-8@AGENTS.ALCHM.KITCHEN  ",
      "Mars in Leo 8 Degree",
    );
    expect(first.email).toBe("planetary-mars-leo-8@agentic.alchm.kitchen");

    const byCanonical = await userDatabase.getUserByEmail(
      "planetary-mars-leo-8@agentic.alchm.kitchen",
    );
    const byUnprefixed = await userDatabase.getUserByEmail(
      "mars-leo-8@agentic.alchm.kitchen",
    );
    const byLegacyDomain = await userDatabase.getUserByEmail(
      "mars-leo-8@agents.alchm.kitchen",
    );

    expect(byCanonical?.id).toBe(first.id);
    expect(byUnprefixed?.id).toBe(first.id);
    expect(byLegacyDomain?.id).toBe(first.id);
  });

  it("keeps canonical planetary-*, moon-phase-*, and legacy moon-agent-* emails intact", async () => {
    const planetary = await userDatabase.ensurePlanetaryAgent(
      "planetary-venus-virgo-8@agentic.alchm.kitchen",
    );
    expect(planetary.email).toBe(
      "planetary-venus-virgo-8@agentic.alchm.kitchen",
    );
    expect(planetary.profile.name).toBe("Venus Virgo 8");

    const phase = await userDatabase.ensurePlanetaryAgent(
      "moon-phase-waning-gibbous-24@agentic.alchm.kitchen",
      "Moon Phase Waning Gibbous 24",
    );
    expect(phase.email).toBe(
      "moon-phase-waning-gibbous-24@agentic.alchm.kitchen",
    );

    const legacyMoon = await userDatabase.ensurePlanetaryAgent(
      "moon-agent-276@agentic.alchm.kitchen",
      "Moon Agent 276",
    );
    expect(legacyMoon.email).toBe("moon-agent-276@agentic.alchm.kitchen");
  });

  it("still refuses non-agentic domains", async () => {
    await expect(
      userDatabase.ensurePlanetaryAgent("human@example.com", "Saturn Aries 5"),
    ).rejects.toThrow(/refusing to auto-provision/);
  });
});

describe("userDatabase — PostgreSQL query email canonicalization", () => {
  beforeAll(() => {
    process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";
  });
  afterAll(() => {
    if (savedDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedDatabaseUrl;
  });

  it("queries getUserByEmail with canonicalized agent emails and preserves human emails", async () => {
    mockExecuteQuery.mockResolvedValue({ rows: [] });

    await userDatabase.getUserByEmail("mars-leo-8@agentic.alchm.kitchen");
    expect(mockExecuteQuery).toHaveBeenLastCalledWith(
      expect.stringContaining("WHERE u.email = $1"),
      ["planetary-mars-leo-8@agentic.alchm.kitchen"],
    );

    await userDatabase.getUserByEmail("Socrates@agents.alchm.kitchen");
    expect(mockExecuteQuery).toHaveBeenLastCalledWith(
      expect.stringContaining("WHERE u.email = $1"),
      ["socrates@agentic.alchm.kitchen"],
    );

    await userDatabase.getUserByEmail("  Alice@Example.com ");
    expect(mockExecuteQuery).toHaveBeenLastCalledWith(
      expect.stringContaining("WHERE u.email = $1"),
      ["alice@example.com"],
    );
  });

  it("upserts ensurePlanetaryAgent with canonical email and strips planetary- from fallback displayName", async () => {
    const capturedQueries: Array<{ sql: string; values: unknown[] }> = [];
    const client = {
      query: jest.fn(async (sql: string, values: unknown[] = []) => {
        capturedQueries.push({ sql, values });
        if (/SELECT name, natal_positions/i.test(sql)) {
          return {
            rowCount: 1,
            rows: [{ name: "Mercury Leo 7", natal_positions: null }],
          };
        }
        return { rowCount: 1, rows: [{ id: "agent-uuid-1" }] };
      }),
    };

    mockWithTransaction.mockImplementation(
      async (cb: (c: unknown) => Promise<void>) => {
        await cb(client);
      },
    );

    mockExecuteQuery.mockResolvedValue({
      rows: [
        {
          id: "agent-uuid-1",
          email: "planetary-mercury-leo-7@agentic.alchm.kitchen",
          password_hash: "AGENT_NO_LOGIN",
          role: "USER",
          is_active: true,
          is_agent: true,
          created_at: new Date(),
          profile_name: "Mercury Leo 7",
        },
      ],
    });

    const user = await userDatabase.ensurePlanetaryAgent(
      "mercury-leo-7@agents.alchm.kitchen",
    );

    expect(user.email).toBe("planetary-mercury-leo-7@agentic.alchm.kitchen");

    const userInsert = capturedQueries.find((q) =>
      q.sql.includes("INSERT INTO users"),
    );
    expect(userInsert?.values[1]).toBe(
      "planetary-mercury-leo-7@agentic.alchm.kitchen",
    );
    expect(userInsert?.values[2]).toBe("Mercury Leo 7");

    expect(mockExecuteQuery).toHaveBeenCalledWith(
      expect.stringContaining("WHERE u.email = $1"),
      ["planetary-mercury-leo-7@agentic.alchm.kitchen"],
    );
  });
});
