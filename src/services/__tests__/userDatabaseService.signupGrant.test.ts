/**
 * @jest-environment node
 *
 * The welcome grant is part of CREATING a user, not part of signing in.
 *
 * `[MEASURED 2026-08-10]` against production: 6 of 14 human signups held a zero
 * balance. `grantSignupBonus` had exactly one call site — the NextAuth `signIn`
 * callback — while THREE code paths create a user. The two JIT paths (the `jwt`
 * callback fallback and the heal in `getDatabaseUserFromRequest`) created the
 * row, seeded an empty `token_balances`, and granted nothing. All 6 affected
 * users had `login_count = 0` and no `accounts` row months later, so the
 * "self-heals on the next sign-in" retry could never reach them.
 *
 * These tests pin the structural fix: the grant is written inside `createUser`'s
 * own transaction, so it cannot be skipped by whichever caller got there. Delete
 * the loop in `createUser` and the first test fails.
 */

// The holder is deliberate. `createUser` reaches the database through a lazy
// `await import("@/lib/database")`, which resolves to a DIFFERENT instance of
// the mocked module than a top-level `import * as database` in this file — so
// an implementation attached to the latter never applies to the former, the
// transaction callback never runs, and every assertion below passes vacuously
// on zero captured statements. Routing both through one `mock`-prefixed
// function (the prefix is what lets babel-jest hoist it) removes the question.
const mockWithTransaction = jest.fn();
jest.mock("@/lib/database", () => ({
  withTransaction: (...args: unknown[]) => mockWithTransaction(...args),
  executeQuery: jest.fn(),
}));

import { tokenEconomy } from "@/services/TokenEconomyService";
import {
  SIGNUP_GRANT_PER_TOKEN,
  TOKEN_TYPES,
  signupGrantIdempotencyKey,
} from "@/services/tokenEconomyQueries";
import { userDatabase } from "@/services/userDatabaseService";
import type { TokenBalances } from "@/types/economy";

/** `creditTokensSql` positional parameters, in build order. */
const P_USER = 0;
const P_TOKEN_TYPE = 1;
const P_AMOUNT = 2;
const P_SOURCE_TYPE = 3;
const P_GROUP = 6;
const P_IDEMPOTENCY = 7;

type Seen = { sql: string; values: unknown[] };

/** Drive createUser through a fake transaction and capture every statement. */
async function createUserCapturingSql(email: string): Promise<Seen[]> {
  const seen: Seen[] = [];
  const client = {
    query: jest.fn(async (sql: string, values: unknown[] = []) => {
      seen.push({ sql, values });
      // Non-zero rowCount on the users INSERT => not an email conflict, so
      // createUser proceeds through the rest of the transaction.
      return { rowCount: 1, rows: [{ id: "row" }] };
    }),
  };
  mockWithTransaction.mockImplementation(
    async (fn: (c: unknown) => Promise<unknown>) => fn(client),
  );

  await userDatabase.createUser({ email, name: "Test Human" });
  return seen;
}

const grantsIn = (seen: Seen[]) =>
  seen.filter((s) => s.values[P_SOURCE_TYPE] === "signup_grant");

describe("createUser seeds the welcome grant in its own transaction", () => {
  const OLD_DB_URL = process.env.DATABASE_URL;

  beforeAll(() => {
    // Set explicitly rather than relying on the ambient environment:
    // `getDbModule` no-ops without it, which would make every assertion below
    // vacuously pass on a machine that happens not to export DATABASE_URL.
    process.env.DATABASE_URL = "postgres://test-only/not-a-real-db";
  });
  afterAll(() => {
    if (OLD_DB_URL === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = OLD_DB_URL;
  });
  afterEach(() => jest.clearAllMocks());

  it("writes one signup_grant credit per ESMS axis", async () => {
    const grants = grantsIn(await createUserCapturingSql("grant@example.com"));

    expect(grants).toHaveLength(4);
    expect(grants.map((g) => g.values[P_TOKEN_TYPE]).sort()).toEqual(
      [...TOKEN_TYPES].sort(),
    );
    for (const g of grants) {
      expect(g.values[P_AMOUNT]).toBe(SIGNUP_GRANT_PER_TOKEN);
    }
  });

  it("keys each credit exactly as grantSignupBonus would, so the two producers cannot double-credit", async () => {
    const grants = grantsIn(await createUserCapturingSql("idem@example.com"));
    const userId = grants[0].values[P_USER] as string;

    for (const g of grants) {
      expect(g.values[P_IDEMPOTENCY]).toBe(
        signupGrantIdempotencyKey(userId, g.values[P_TOKEN_TYPE] as never),
      );
    }
  });

  it("groups all four credits under one transaction_group_id", async () => {
    const grants = grantsIn(await createUserCapturingSql("group@example.com"));
    const groups = new Set(grants.map((g) => g.values[P_GROUP]));

    expect(groups.size).toBe(1);
    expect([...groups][0]).toEqual(expect.any(String));
  });

  it("grants nothing when the email already exists (ON CONFLICT no-op)", async () => {
    const seen: Seen[] = [];
    const client = {
      // rowCount 0 on the users INSERT => the email was taken; createUser must
      // return before seeding anything, or a re-sign-in would re-grant.
      query: jest.fn(async (sql: string, values: unknown[] = []) => {
        seen.push({ sql, values });
        return { rowCount: 0, rows: [] };
      }),
    };
    mockWithTransaction.mockImplementation(
      async (fn: (c: unknown) => Promise<unknown>) => fn(client),
    );
    jest
      .spyOn(userDatabase, "getUserByEmail")
      .mockResolvedValue({ id: "existing" } as never);

    await userDatabase.createUser({
      email: "taken@example.com",
      name: "Already Here",
    });

    // Prove the transaction actually ran before trusting the zero: "no grants"
    // and "nothing executed at all" look identical otherwise, and this suite
    // has already been fooled once by exactly that.
    expect(seen.some((s) => s.sql.includes("INSERT INTO users"))).toBe(true);
    expect(grantsIn(seen)).toHaveLength(0);
  });
});

describe("grantSignupBonus stays key-compatible with the createUser seed", () => {
  afterEach(() => jest.restoreAllMocks());

  it("derives the same per-axis key the transaction seed writes", async () => {
    const USER = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    const credit = jest
      .spyOn(tokenEconomy, "creditMultipleTokens")
      .mockResolvedValue({} as TokenBalances);

    await tokenEconomy.grantSignupBonus(USER);

    // creditMultipleTokens appends `:<TokenType>` to the base key it is given.
    const baseKey = credit.mock.calls[0][3]?.idempotencyKey as string;
    for (const tokenType of TOKEN_TYPES) {
      expect(`${baseKey}:${tokenType}`).toBe(
        signupGrantIdempotencyKey(USER, tokenType),
      );
    }
  });
});
