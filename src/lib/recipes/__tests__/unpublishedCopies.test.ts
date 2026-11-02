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

  it("reads once per live catalog refresh, and again after it", async () => {
    standardTable();
    const { readPublication } = await module_();
    const first = await readPublication();
    expect(await readPublication()).toBe(first);
    clock += CATALOG_TTL_MS - 1;
    expect(await readPublication()).toBe(first);
    expect(mockQuery).toHaveBeenCalledTimes(1);

    clock += 1;
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

  it("serves the set last read when a later read fails, and says so", async () => {
    standardTable();
    const { readPublication } = await module_();
    const first = await readPublication();

    clock += CATALOG_TTL_MS;
    mockQuery.mockRejectedValue(new Error("connection reset"));
    expect(await readPublication()).toBe(first);
    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(String(mockLogError.mock.calls[0]?.[0])).toMatch(/set last read/);
  });

  it("does not ask again until a connection timeout has passed, then does, and recovers", async () => {
    standardTable();
    const { readPublication } = await module_();
    const first = await readPublication();
    clock += CATALOG_TTL_MS;
    mockQuery.mockRejectedValue(new Error("connection reset"));
    await readPublication();
    await readPublication();
    expect(mockQuery).toHaveBeenCalledTimes(2); // the first read, and the one failed retry

    clock += databaseConfig.connectionTimeout;
    table([{ row: PUBLIC_OYAKODON, published: true }]);
    const recovered = await readPublication();
    expect(mockQuery).toHaveBeenCalledTimes(3);
    expect(recovered).not.toBe(first);
    expect(recovered.unpublished).toEqual([]);
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

  it("never hides more recipes than there are unpublished rows, even from duplicate names", async () => {
    const { hiddenStaticIds } = await module_();
    const twin: RecipeIdentityRecord = { ...HAEMUL, id: "korean-dinner-haemul-pajeon-2" };
    const hidden = hiddenStaticIds([HAEMUL, twin, FUSION], publication([PUBLIC_OYAKODON], [UNPUBLISHED_HAEMUL]));
    expect(hidden.size).toBeLessThanOrEqual(1);
    expect(hidden.has(FUSION.id)).toBe(false);
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
    expect(await servedStaticOnlyIds(staticOnly, STATIC)).not.toBe(first);
  });
});
