/**
 * @jest-environment node
 *
 * The bundled copy of a recipe the operator unpublished is not served.
 *
 * The identity index calls a bundled recipe with no live twin "static-only",
 * and static-only recipes were served. An unpublished row is not live, so its
 * bundled copy looked static-only too and came back through every surface that
 * reads the bundled catalog. The database is the only thing mocked here.
 */
import { databaseConfig } from "@/lib/database/config";
import { CATALOG_TTL_MS } from "../catalogTtl";
import { buildRecipeIdentityIndex, type RecipeIdentityRecord } from "../recipeIdentity";
import type { RecipePublication } from "../unpublishedCopies";

const mockQuery = jest.fn<Promise<{ rows: unknown[] }>, [string]>();
const mockLogError = jest.fn();

jest.mock("@/lib/database", () => ({ executeQuery: (sql: string) => mockQuery(sql) }));
// A short connection timeout, so that a test can wait out the cap on a first read that never answers.
jest.mock("@/lib/database/config", () => {
  const actual = jest.requireActual<typeof import("@/lib/database/config")>("@/lib/database/config");
  return { ...actual, databaseConfig: { ...actual.databaseConfig, connectionTimeout: 300 } };
});
jest.mock("@/lib/logger", () => ({
  _logger: { error: (...args: unknown[]) => mockLogError(...args), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const HAEMUL: RecipeIdentityRecord = { id: "korean-dinner-haemul-pajeon", name: "Haemul Pajeon", cuisine: "Korean" };
const FUSION: RecipeIdentityRecord = { id: "fusion-dinner-kimchi-carbonara", name: "Kimchi Carbonara", cuisine: "Fusion" };
const OYAKODON: RecipeIdentityRecord = { id: "japanese-dinner-oyakodon", name: "Oyakodon", cuisine: "Japanese" };
const STATIC = [HAEMUL, FUSION, OYAKODON];

const PUBLIC_OYAKODON = { id: "e03c3505-9729-4a7e-bc0c-5ae57aff83a9", name: "Oyakodon", cuisine: "Japanese" };
const UNPUBLISHED_HAEMUL = { id: "5b3f6a52-0000-4000-8000-000000000001", name: "Haemul Pajeon", cuisine: "Korean" };
const PUBLIC_HAEMUL = { id: "6c4a7b63-0000-4000-8000-000000000002", name: "Haemul Pajeon", cuisine: "Korean" };

const publication = (published: RecipeIdentityRecord[], unpublished: RecipeIdentityRecord[]): RecipePublication => ({
  published,
  unpublished,
});

/** The recipes table as the one query returns it: every row, flagged. */
function table(rows: Array<{ row: RecipeIdentityRecord; published: boolean }>): void {
  mockQuery.mockResolvedValue({ rows: rows.map(({ row, published }) => ({ ...row, published })) });
}
const standardTable = (): void =>
  table([
    { row: PUBLIC_OYAKODON, published: true },
    { row: UNPUBLISHED_HAEMUL, published: false },
  ]);

let clock = 1_000_000_000_000;
let nowSpy: jest.SpyInstance<number, []>;

beforeEach(() => {
  mockQuery.mockReset();
  mockLogError.mockReset();
  clock += CATALOG_TTL_MS * 10;
  nowSpy = jest.spyOn(Date, "now").mockImplementation(() => clock);
});
afterEach(() => nowSpy.mockRestore());

async function module_(): Promise<typeof import("../unpublishedCopies")> {
  return import("../unpublishedCopies");
}

/** Let a read that is under way, and the handlers behind it, finish. */
const settle = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

describe("readPublication", () => {
  it("splits the table the way the live catalog does: only a true flag is published", async () => {
    table([
      { row: PUBLIC_OYAKODON, published: true },
      { row: UNPUBLISHED_HAEMUL, published: false },
      { row: { id: "x", name: "Flag Never Set", cuisine: "Thai" }, published: false },
    ]);
    const { readPublication } = await module_();
    const { published, unpublished } = await readPublication();
    expect(published.map((r) => r.name)).toEqual(["Oyakodon"]);
    expect(unpublished.map((r) => r.name)).toEqual(["Haemul Pajeon", "Flag Never Set"]);
  });

  it("drops a row with no usable id or name", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        { id: "a", name: "Soup", cuisine: "Thai", published: true },
        { id: "b", name: null, cuisine: null, published: false },
        { id: null, name: "Nameless", cuisine: null, published: true },
      ],
    });
    const { readPublication } = await module_();
    expect(await readPublication()).toEqual({ published: [{ id: "a", name: "Soup", cuisine: "Thai" }], unpublished: [] });
  });

  it("keeps a row with no cuisine: the name is all the rule needs", async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: "c", name: "Haemul Pajeon", cuisine: null, published: false }] });
    const { readPublication } = await module_();
    expect((await readPublication()).unpublished).toEqual([{ id: "c", name: "Haemul Pajeon" }]);
  });

  it("reads once per live catalog refresh; after it the old set is served at once while the read lands behind it", async () => {
    standardTable();
    const { readPublication } = await module_();
    const first = await readPublication();
    clock += CATALOG_TTL_MS - 1;
    expect(await readPublication()).toBe(first);
    expect(mockQuery).toHaveBeenCalledTimes(1);

    clock += 1;
    expect(await readPublication()).toBe(first); // stale, and served without waiting
    expect(mockQuery).toHaveBeenCalledTimes(2); // the read behind it has begun
    await settle();
    expect(await readPublication()).not.toBe(first);
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it("lets concurrent callers share one read", async () => {
    standardTable();
    const { readPublication } = await module_();
    const all = await Promise.all([readPublication(), readPublication(), readPublication()]);
    expect(all[1]).toBe(all[0]);
    expect(all[2]).toBe(all[0]);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("rejects, and says so, in a process that has never read the table", async () => {
    mockQuery.mockRejectedValue(new Error("connection reset"));
    const { readPublication } = await module_();
    await expect(readPublication()).rejects.toThrow("connection reset");
    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(String(mockLogError.mock.calls[0]?.[0])).toMatch(/no set has been read/);
  });

  it("keeps rejecting for a connection timeout from the attempt's start in a process that has never read it, without asking again", async () => {
    mockQuery.mockRejectedValue(new Error("connection reset"));
    const { readPublication } = await module_();
    await expect(readPublication()).rejects.toThrow("connection reset");
    await expect(readPublication()).rejects.toThrow("connection reset");
    expect(mockQuery).toHaveBeenCalledTimes(1);

    clock += databaseConfig.connectionTimeout;
    table([{ row: PUBLIC_OYAKODON, published: true }]);
    await expect(readPublication()).rejects.toThrow("connection reset"); // the retry begins behind this call
    expect(mockQuery).toHaveBeenCalledTimes(2);
    await settle();
    await expect(readPublication()).resolves.toMatchObject({ unpublished: [] });
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it("serves the set last read when a later read fails, and says so", async () => {
    standardTable();
    const { readPublication } = await module_();
    const first = await readPublication();

    clock += CATALOG_TTL_MS;
    mockQuery.mockRejectedValue(new Error("connection reset"));
    expect(await readPublication()).toBe(first);
    await settle();
    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(String(mockLogError.mock.calls[0]?.[0])).toMatch(/set last read/);
    expect(await readPublication()).toBe(first);
  });

  it("asks again no sooner than a connection timeout after a failed read began, then recovers", async () => {
    standardTable();
    const { readPublication } = await module_();
    const first = await readPublication();
    clock += CATALOG_TTL_MS;
    mockQuery.mockRejectedValue(new Error("connection reset"));
    await readPublication();
    await settle();
    await readPublication();
    expect(mockQuery).toHaveBeenCalledTimes(2); // the first read, and the one failed retry

    clock += databaseConfig.connectionTimeout;
    table([{ row: PUBLIC_OYAKODON, published: true }]);
    await readPublication(); // begins the read that recovers
    await settle();
    const recovered = await readPublication();
    expect(mockQuery).toHaveBeenCalledTimes(3);
    expect(recovered).not.toBe(first);
    expect(recovered.unpublished).toEqual([]);
  });

  it("reads again when the clock has been stepped backwards, instead of trusting the set for the step and the TTL", async () => {
    standardTable();
    const { readPublication } = await module_();
    const first = await readPublication();
    clock -= 60 * 60 * 1000;
    table([{ row: PUBLIC_OYAKODON, published: true }]);
    expect(await readPublication()).toBe(first);
    await settle();
    expect((await readPublication()).unpublished).toEqual([]);
  });

  it("asks for every row with a flag, so that nothing the live read excludes is missed", async () => {
    standardTable();
    const { readPublication } = await module_();
    await readPublication();
    const sql = String(mockQuery.mock.calls[0]?.[0]);
    // LocalRecipeService reads `is_public = true`; `IS TRUE` is the same test
    // with a NULL flag counting as false, and the two halves cannot overlap.
    expect(sql).toContain("(r.is_public IS TRUE) AS published");
    expect(sql).not.toMatch(/WHERE/i);
  });
});

describe("readPublication after a failed first attempt", () => {
  it("rejects at once while the next attempt runs behind it, instead of waiting for it", async () => {
    mockQuery.mockRejectedValueOnce(new Error("connection reset")).mockImplementation(() => new Promise(() => undefined));
    const { readPublication } = await module_();
    await expect(readPublication()).rejects.toThrow("connection reset"); // the first attempt is waited for
    clock += databaseConfig.connectionTimeout;
    const outcome = await Promise.race([
      readPublication().then(() => "answered", () => "rejected"),
      new Promise<string>((resolve) => setTimeout(() => resolve("stuck"), 1000)),
    ]);
    expect(outcome).toBe("rejected");
    expect(mockQuery).toHaveBeenCalledTimes(2); // the second attempt is under way
  });
});

describe("firstReadSettled", () => {
  const elapsedMs = async (work: Promise<unknown>): Promise<number> => {
    const started = performance.now();
    await work;
    return performance.now() - started;
  };

  it("resolves when the first read has answered, which a synchronous run before it can have starved", async () => {
    standardTable();
    const { firstReadSettled, publicationNow } = await module_();
    expect(publicationNow()).toBeNull(); // begins the read
    await firstReadSettled();
    expect(publicationNow()).not.toBeNull();
  });

  it("resolves after one connection timeout when the first read never answers, and at once from then on", async () => {
    mockQuery.mockImplementation(() => new Promise(() => undefined));
    const { firstReadSettled, publicationNow } = await module_();
    publicationNow();
    const first = await elapsedMs(firstReadSettled());
    expect(first).toBeGreaterThanOrEqual(databaseConfig.connectionTimeout - 50);
    expect(first).toBeLessThan(databaseConfig.connectionTimeout + 700);
    expect(await elapsedMs(firstReadSettled())).toBeLessThan(100);
  });

  it("resolves when the first read has failed, without waiting out the timeout", async () => {
    mockQuery.mockRejectedValue(new Error("connection refused"));
    const { firstReadSettled, publicationNow } = await module_();
    publicationNow();
    expect(await elapsedMs(firstReadSettled())).toBeLessThan(databaseConfig.connectionTimeout - 100);
  });

  it("is already resolved when no read has been begun and none is under way", async () => {
    const { firstReadSettled } = await module_();
    expect(await elapsedMs(firstReadSettled())).toBeLessThan(100);
  });
});

describe("startPublicationRead", () => {
  const saved = { url: process.env.DATABASE_URL, publicUrl: process.env.DATABASE_PUBLIC_URL };
  afterEach(() => {
    for (const [key, value] of [["DATABASE_URL", saved.url], ["DATABASE_PUBLIC_URL", saved.publicUrl]] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("begins a read when a database is configured, once however often it is called", async () => {
    process.env.DATABASE_URL = "postgresql://test@localhost/test";
    standardTable();
    const { startPublicationRead } = await module_();
    startPublicationRead();
    startPublicationRead();
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("asks nothing when no database is configured", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_PUBLIC_URL;
    standardTable();
    const { startPublicationRead } = await module_();
    startPublicationRead();
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe("publicationNow", () => {
  it("is null before the first read, begins it at once, and never waits for it", async () => {
    mockQuery.mockImplementation(() => new Promise(() => undefined)); // a read that never answers
    const { publicationNow } = await module_();
    expect(publicationNow()).toBeNull();
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(publicationNow()).toBeNull();
    expect(mockQuery).toHaveBeenCalledTimes(1); // one read at a time
  });

  it("answers from the set last read while a refresh hangs, however old it is", async () => {
    standardTable();
    const { publicationNow, readPublication } = await module_();
    const first = await readPublication();
    clock += CATALOG_TTL_MS * 100;
    mockQuery.mockImplementation(() => new Promise(() => undefined));
    expect(publicationNow()).toBe(first);
    expect(publicationNow()).toBe(first);
    expect(mockQuery).toHaveBeenCalledTimes(2); // the hung refresh, asked once
  });

  it("does not leave a rejected promise unhandled when a read nobody waits for fails", async () => {
    const unhandled = jest.fn();
    process.on("unhandledRejection", unhandled);
    try {
      mockQuery.mockRejectedValue(new Error("connection reset"));
      const { publicationNow } = await module_();
      expect(publicationNow()).toBeNull();
      await settle();
      await settle();
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off("unhandledRejection", unhandled);
    }
  });
});

describe("dropUnpublishedTwins", () => {
  it("drops only the static-only id whose twin is an unpublished row", async () => {
    const { dropUnpublishedTwins } = await module_();
    const staticOnly = buildRecipeIdentityIndex(STATIC, [PUBLIC_OYAKODON]).staticOnlyIds;
    expect(staticOnly).toEqual([HAEMUL.id, FUSION.id]);
    expect(dropUnpublishedTwins(staticOnly, STATIC, [])).toEqual([HAEMUL.id, FUSION.id]);
    expect(dropUnpublishedTwins(staticOnly, STATIC, [UNPUBLISHED_HAEMUL])).toEqual([FUSION.id]);
  });

  it("does not touch the list it is given", async () => {
    const { dropUnpublishedTwins } = await module_();
    const staticOnly = [HAEMUL.id, FUSION.id];
    dropUnpublishedTwins(staticOnly, STATIC, [UNPUBLISHED_HAEMUL]);
    expect(staticOnly).toEqual([HAEMUL.id, FUSION.id]);
  });
});

describe("hiddenStaticIds", () => {
  it("hides the bundled copy of an unpublished recipe and nothing else", async () => {
    const { hiddenStaticIds } = await module_();
    expect([...hiddenStaticIds(STATIC, publication([PUBLIC_OYAKODON], [UNPUBLISHED_HAEMUL]))]).toEqual([HAEMUL.id]);
  });

  it("hides nothing while nothing is unpublished (control)", async () => {
    const { hiddenStaticIds } = await module_();
    expect(hiddenStaticIds(STATIC, publication([PUBLIC_OYAKODON], [])).size).toBe(0);
  });

  it("keeps a copy that also has a public twin: the live row serves it and takes its authored times", async () => {
    const { hiddenStaticIds } = await module_();
    expect(hiddenStaticIds(STATIC, publication([PUBLIC_OYAKODON, PUBLIC_HAEMUL], [UNPUBLISHED_HAEMUL])).size).toBe(0);
  });

  it("keeps a bundled recipe the database has never held", async () => {
    const { hiddenStaticIds } = await module_();
    const other = { id: "x", name: "Something Else Entirely", cuisine: "Thai" };
    expect(hiddenStaticIds(STATIC, publication([PUBLIC_OYAKODON], [other])).size).toBe(0);
  });

  it("hides the copies that share the unpublished name, and never a recipe under another name", async () => {
    const { hiddenStaticIds } = await module_();
    const twin: RecipeIdentityRecord = { ...HAEMUL, id: "korean-dinner-haemul-pajeon-2" };
    const hidden = hiddenStaticIds([HAEMUL, twin, FUSION], publication([PUBLIC_OYAKODON], [UNPUBLISHED_HAEMUL]));
    expect(hidden.has(HAEMUL.id)).toBe(true);
    expect(hidden.has(FUSION.id)).toBe(false);
  });

  it("matches the name when only the accents differ, as the identity index does", async () => {
    const { hiddenStaticIds } = await module_();
    const plain: RecipeIdentityRecord = { id: "vietnamese-lunch-bun-bo-hue", name: "Bun Bo Hue", cuisine: "Vietnamese" };
    const accented = { id: "u", name: "Bún Bò Huế", cuisine: "Vietnamese" };
    expect([...hiddenStaticIds([plain, FUSION], publication([], [accented]))]).toEqual([plain.id]);
  });
});

describe("servedStaticOnlyIds", () => {
  it("lists the static-only recipes minus the copy of an unpublished one", async () => {
    standardTable();
    const { servedStaticOnlyIds } = await module_();
    expect(await servedStaticOnlyIds([HAEMUL.id, FUSION.id], STATIC)).toEqual([FUSION.id]);
  });

  it("lists none when the table has never been readable", async () => {
    mockQuery.mockRejectedValue(new Error("connection reset"));
    const { servedStaticOnlyIds } = await module_();
    expect(await servedStaticOnlyIds([HAEMUL.id, FUSION.id], STATIC)).toEqual([]);
  });

  it("answers from the set last read when the table becomes unreadable", async () => {
    standardTable();
    const { servedStaticOnlyIds } = await module_();
    expect(await servedStaticOnlyIds([HAEMUL.id, FUSION.id], STATIC)).toEqual([FUSION.id]);
    clock += CATALOG_TTL_MS;
    mockQuery.mockRejectedValue(new Error("connection reset"));
    expect(await servedStaticOnlyIds([HAEMUL.id, FUSION.id], STATIC)).toEqual([FUSION.id]);
  });

  it("reuses its answer for one list and one read, and recomputes for either to change", async () => {
    standardTable();
    const { servedStaticOnlyIds } = await module_();
    const staticOnly = [HAEMUL.id, FUSION.id];
    const first = await servedStaticOnlyIds(staticOnly, STATIC);
    expect(await servedStaticOnlyIds(staticOnly, STATIC)).toBe(first);
    expect(await servedStaticOnlyIds([HAEMUL.id, FUSION.id], STATIC)).not.toBe(first);
    clock += CATALOG_TTL_MS;
    expect(await servedStaticOnlyIds(staticOnly, STATIC)).toBe(first); // the old read, served while the new one lands
    await settle();
    expect(await servedStaticOnlyIds(staticOnly, STATIC)).not.toBe(first);
  });
});

describe("databaseIsConfigured", () => {
  const saved = { url: process.env.DATABASE_URL, publicUrl: process.env.DATABASE_PUBLIC_URL };
  afterEach(() => {
    for (const [key, value] of [["DATABASE_URL", saved.url], ["DATABASE_PUBLIC_URL", saved.publicUrl]] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("is true for either variable, which is the order the pool itself reads them in, and false for neither", async () => {
    const { databaseIsConfigured } = await module_();
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_PUBLIC_URL;
    expect(databaseIsConfigured()).toBe(false);
    process.env.DATABASE_PUBLIC_URL = "postgresql://test@localhost/test";
    expect(databaseIsConfigured()).toBe(true);
    delete process.env.DATABASE_PUBLIC_URL;
    process.env.DATABASE_URL = "postgresql://test@localhost/test";
    expect(databaseIsConfigured()).toBe(true);
  });
});

describe("withoutHiddenRecipes", () => {
  const saved = process.env.DATABASE_URL;
  beforeEach(() => {
    process.env.DATABASE_URL = "postgresql://test@localhost/test";
  });
  afterEach(() => {
    if (saved === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = saved;
  });

  /** One entry per ingredient line, as the index has them: a recipe's lines all carry its one id. */
  const entry = (recipeId: string, recipeName: string, cuisine: string, line: string) => ({ recipeId, recipeName, cuisine, line });
  const ENTRIES = [
    entry("korean-dinner-haemul-pajeon", "Haemul Pajeon", "Korean", "squid"),
    entry("thai-dinner-pad-thai", "Pad Thai", "Thai", "rice noodles"),
    entry("korean-dinner-haemul-pajeon", "Haemul Pajeon", "Korean", "scallion"),
  ];

  it("drops the entries of a hidden recipe, every line of it, and keeps the rest in order", async () => {
    standardTable();
    const { withoutHiddenRecipes } = await module_();
    expect((await withoutHiddenRecipes(ENTRIES)).map((e) => e.line)).toEqual(["rice noodles"]);
  });

  it("keeps everything while nothing is unpublished (control)", async () => {
    table([{ row: PUBLIC_OYAKODON, published: true }]);
    const { withoutHiddenRecipes } = await module_();
    expect(await withoutHiddenRecipes(ENTRIES)).toEqual(ENTRIES);
  });

  it("keeps everything when the table has never been readable: a list is not worth an error", async () => {
    mockQuery.mockRejectedValue(new Error("connection reset"));
    const { withoutHiddenRecipes } = await module_();
    expect(await withoutHiddenRecipes(ENTRIES)).toEqual(ENTRIES);
  });

  it("asks nothing and keeps everything when no database is configured", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_PUBLIC_URL;
    standardTable();
    const { withoutHiddenRecipes } = await module_();
    expect(await withoutHiddenRecipes(ENTRIES)).toEqual(ENTRIES);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
