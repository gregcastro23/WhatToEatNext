/**
 * @jest-environment node
 *
 * The live catalog's load begins the read of which recipes are unpublished,
 * beside its own query. The bundled fallback it drops to when the database is
 * down leaves out the copies of those recipes, and the read it needs would
 * otherwise begin only when the live query has already failed: with the
 * database hung, the fallback then waits a second connection timeout
 * [MEASURED 2026-11-02, real 5 s timeouts: the first outage call took 10.0 s
 * where it took 5.7 s before the rule existed]. Nothing is answered here: both
 * queries are left pending, and only what was asked, and when, is observed.
 */
const mockQueries: string[] = [];

jest.mock("@/lib/database", () => ({
  executeQuery: (sql: string) => {
    mockQueries.push(sql);
    return new Promise(() => undefined);
  },
}));
jest.mock("@/lib/redis", () => ({
  redisGet: async () => null,
  redisSet: async () => undefined,
  redisDel: async () => undefined,
}));
jest.mock("@/lib/assets", () => ({ getValidatedAssetUrl: async (url: string) => url }));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
jest.mock("@/utils/logger", () => {
  const quiet = { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() };
  return { logger: quiet, createLogger: () => quiet };
});
jest.mock("next/server", () => ({ after: (work: () => void) => work() }));
jest.mock("@/actions/recipes", () => ({ getServerRecipes: async () => [] }));

const savedUrl = process.env.DATABASE_URL;
const savedPublicUrl = process.env.DATABASE_PUBLIC_URL;
const settle = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

beforeEach(() => {
  mockQueries.length = 0;
  process.env.DATABASE_URL = "postgresql://test@localhost/test";
});
afterAll(() => {
  if (savedUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = savedUrl;
  if (savedPublicUrl !== undefined) process.env.DATABASE_PUBLIC_URL = savedPublicUrl;
});

const liveQuery = (sql: string): boolean => sql.includes("WHERE r.is_public = true");
const tableQuery = (sql: string): boolean => sql.includes("AS published");

describe("LocalRecipeService.getAllRecipes", () => {
  it("begins the read of the unpublished recipes beside the live query, before the live query can fail", async () => {
    const { LocalRecipeService } = await import("../LocalRecipeService");
    void LocalRecipeService.getAllRecipes();
    await settle();
    expect(mockQueries.filter(liveQuery)).toHaveLength(1);
    expect(mockQueries.filter(tableQuery)).toHaveLength(1);
  });

  it("asks nothing of the table when no database is configured", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_PUBLIC_URL;
    const { LocalRecipeService } = await import("../LocalRecipeService");
    void LocalRecipeService.getAllRecipes();
    await settle();
    expect(mockQueries.filter(tableQuery)).toHaveLength(0);
  });

  it("does not begin a second read for a second caller while the first is under way", async () => {
    const { LocalRecipeService } = await import("../LocalRecipeService");
    void LocalRecipeService.getAllRecipes();
    void LocalRecipeService.getAllRecipes();
    await settle();
    expect(mockQueries.filter(tableQuery)).toHaveLength(1);
  });
});
