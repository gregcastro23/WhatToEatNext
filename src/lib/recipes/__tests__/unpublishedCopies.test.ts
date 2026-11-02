/**
 * @jest-environment node
 *
 * The static copy of a recipe the operator unpublished is not listed.
 *
 * The identity index calls a static recipe with no live twin "static-only",
 * and static-only recipes are listed. An unpublished row is not live, so its
 * static copy looked static-only too, and the catalog re-served what the
 * operator had taken down. The database is the only thing mocked here.
 */
import { buildRecipeIdentityIndex, type RecipeIdentityRecord } from "../recipeIdentity";

const mockQuery = jest.fn<Promise<{ rows: unknown[] }>, [string]>();
const mockLogError = jest.fn();

jest.mock("@/lib/database", () => ({ executeQuery: (sql: string) => mockQuery(sql) }));
jest.mock("@/lib/logger", () => ({
  _logger: { error: (...args: unknown[]) => mockLogError(...args), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const HAEMUL: RecipeIdentityRecord = { id: "korean-dinner-haemul-pajeon", name: "Haemul Pajeon", cuisine: "Korean" };
const FUSION: RecipeIdentityRecord = { id: "fusion-dinner-kimchi-carbonara", name: "Kimchi Carbonara", cuisine: "Fusion" };
const LIVE_TWIN: RecipeIdentityRecord = { id: "japanese-dinner-oyakodon", name: "Oyakodon", cuisine: "Japanese" };
const STATIC = [HAEMUL, FUSION, LIVE_TWIN];

/** The static ids the index leaves without a live twin, as recipeRefResolver hands them over. */
function staticOnlyOf(live: readonly RecipeIdentityRecord[]): readonly string[] {
  return buildRecipeIdentityIndex(STATIC, live).staticOnlyIds;
}

const PUBLIC_OYAKODON = { id: "e03c3505-9729-4a7e-bc0c-5ae57aff83a9", name: "Oyakodon", cuisine: "Japanese" };
const UNPUBLISHED_HAEMUL = { id: "5b3f6a52-0000-4000-8000-000000000001", name: "Haemul Pajeon", cuisine: "Korean" };

/** The recipes table: `publicRows` answer the live read, `unpublished` the read of the rest. */
function table(unpublished: unknown[], publicRows: unknown[] = [PUBLIC_OYAKODON]): void {
  mockQuery.mockImplementation(async (sql) => ({ rows: sql.includes("IS NOT TRUE") ? unpublished : publicRows }));
}

async function served(staticOnlyIds: readonly string[]): Promise<string[]> {
  const { servedStaticOnlyIds } = await import("../unpublishedCopies");
  return servedStaticOnlyIds(staticOnlyIds, STATIC);
}

beforeEach(() => {
  mockQuery.mockReset();
  mockLogError.mockReset();
});

describe("servedStaticOnlyIds", () => {
  it("lists every static-only recipe while nothing is unpublished (control)", async () => {
    table([]);
    const staticOnly = staticOnlyOf([PUBLIC_OYAKODON]);
    expect(staticOnly).toEqual([HAEMUL.id, FUSION.id]);
    expect(await served(staticOnly)).toEqual([HAEMUL.id, FUSION.id]);
  });

  it("drops the static copy of an unpublished recipe and nothing else", async () => {
    table([UNPUBLISHED_HAEMUL]);
    const staticOnly = staticOnlyOf([PUBLIC_OYAKODON]);
    // The same two ids as the control: the unpublished row is the only difference.
    expect(staticOnly).toEqual([HAEMUL.id, FUSION.id]);
    expect(await served(staticOnly)).toEqual([FUSION.id]);
  });

  it("keeps a static recipe the database has never held", async () => {
    table([{ id: "x", name: "Something Else Entirely", cuisine: "Thai" }]);
    expect(await served(staticOnlyOf([PUBLIC_OYAKODON]))).toEqual([HAEMUL.id, FUSION.id]);
  });

  it("lists none when the unpublished rows have never been read and cannot be, and says so", async () => {
    mockQuery.mockRejectedValue(new Error("connection reset"));
    expect(await served(staticOnlyOf([PUBLIC_OYAKODON]))).toEqual([]);
    expect(mockLogError).toHaveBeenCalledTimes(1);
  });

  it("uses the unpublished rows it last read when a later read fails, and says so", async () => {
    table([UNPUBLISHED_HAEMUL]);
    expect(await served(staticOnlyOf([PUBLIC_OYAKODON]))).toEqual([FUSION.id]);

    mockQuery.mockRejectedValue(new Error("connection reset"));
    // A new refresh (a new array) whose read fails: Haemul stays hidden, Fusion stays listed.
    expect(await served(staticOnlyOf([PUBLIC_OYAKODON]))).toEqual([FUSION.id]);
    expect(mockLogError).toHaveBeenCalledTimes(1);
  });

  it("asks the database once for one catalog refresh, and again for the next", async () => {
    table([UNPUBLISHED_HAEMUL]);
    const refresh = staticOnlyOf([PUBLIC_OYAKODON]);
    await served(refresh);
    await served(refresh);
    await Promise.all([served(refresh), served(refresh)]);
    expect(mockQuery).toHaveBeenCalledTimes(1);

    await served(staticOnlyOf([PUBLIC_OYAKODON]));
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it("keeps a failed answer until the next refresh rather than retrying on every request", async () => {
    mockQuery.mockRejectedValue(new Error("connection reset"));
    const refresh = staticOnlyOf([PUBLIC_OYAKODON]);
    await served(refresh);
    await served(refresh);
    expect(mockQuery).toHaveBeenCalledTimes(1);

    table([UNPUBLISHED_HAEMUL]);
    expect(await served(staticOnlyOf([PUBLIC_OYAKODON]))).toEqual([FUSION.id]);
  });
});

describe("loadIdentities", () => {
  it("reads the live catalog's rows for 'public' and exactly the rest for 'unpublished'", async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const { loadIdentities } = await import("../unpublishedCopies");
    await loadIdentities("public");
    await loadIdentities("unpublished");
    const [publicSql, unpublishedSql] = mockQuery.mock.calls.map(([sql]) => sql);
    // LocalRecipeService reads `is_public = true`; a NULL flag is therefore not live,
    // and `IS NOT TRUE` is its exact complement (three-valued logic), NULL included.
    expect(publicSql).toContain("r.is_public = true");
    expect(unpublishedSql).toContain("r.is_public IS NOT TRUE");
  });

  it("maps a row as LocalRecipeService does and drops one with no usable id or name", async () => {
    mockQuery.mockResolvedValue({
      rows: [{ id: "a", name: "Soup", cuisine: "Thai" }, { id: "b", name: null, cuisine: null }, { id: null, name: "Nameless", cuisine: null }],
    });
    const { loadIdentities } = await import("../unpublishedCopies");
    expect(await loadIdentities("public")).toEqual([{ id: "a", name: "Soup", cuisine: "Thai" }]);
  });
});

describe("dropUnpublishedTwins", () => {
  it("is the rule the catalog and the sitemap share: it drops only the twin of an unpublished row", async () => {
    const { dropUnpublishedTwins } = await import("../unpublishedCopies");
    const staticOnly = staticOnlyOf([PUBLIC_OYAKODON]);
    expect(dropUnpublishedTwins(staticOnly, STATIC, [])).toEqual([HAEMUL.id, FUSION.id]);
    expect(dropUnpublishedTwins(staticOnly, STATIC, [UNPUBLISHED_HAEMUL])).toEqual([FUSION.id]);
  });

  it("does not touch the list it is given", async () => {
    const { dropUnpublishedTwins } = await import("../unpublishedCopies");
    const staticOnly = staticOnlyOf([PUBLIC_OYAKODON]);
    const before = [...staticOnly];
    dropUnpublishedTwins(staticOnly, STATIC, [UNPUBLISHED_HAEMUL]);
    expect(staticOnly).toEqual(before);
  });
});
