/** @jest-environment node */
/**
 * Unit tests for `relationExists` and `memoizeRelationPresent`.
 *
 * @file src/lib/database/__tests__/relationExists.test.ts
 */

import {
  memoizeRelationPresent,
  relationExists,
  resetRelationExistsCache,
} from "../relationExists";

beforeEach(() => {
  resetRelationExistsCache();
});

describe("relationExists", () => {
  it("caches positive presence in memory after the first true result", async () => {
    const queryFn = jest.fn(async () => ({ rows: [{ present: true }] }));

    await expect(relationExists("public.page_views", queryFn)).resolves.toBe(true);
    await expect(relationExists("public.page_views", queryFn)).resolves.toBe(true);
    await expect(relationExists("public.page_views", queryFn)).resolves.toBe(true);

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(queryFn).toHaveBeenCalledWith(
      "SELECT to_regclass('public.page_views') IS NOT NULL AS present",
    );
  });

  it("deduplicates concurrent in-flight probes for the same relation", async () => {
    let resolveProbe!: (val: { rows: Array<{ present: boolean }> }) => void;
    const queryFn = jest.fn(
      (): Promise<{ rows: Array<{ present: boolean }> }> =>
        new Promise((resolve): void => {
          resolveProbe = resolve;
        }),
    );

    const p1 = relationExists("public.tables", queryFn);
    const p2 = relationExists("public.tables", queryFn);
    const p3 = relationExists("public.tables", queryFn);

    expect(queryFn).toHaveBeenCalledTimes(1);
    resolveProbe({ rows: [{ present: true }] });

    await expect(Promise.all([p1, p2, p3])).resolves.toEqual([true, true, true]);
    await expect(relationExists("public.tables", queryFn)).resolves.toBe(true);
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it("does not permanently latch false or failed probes", async () => {
    const queryFn = jest
      .fn()
      .mockRejectedValueOnce(new Error("pool timeout"))
      .mockResolvedValueOnce({ rows: [{ present: false }] })
      .mockResolvedValueOnce({ rows: [{ present: true }] });

    await expect(relationExists("public.follows", queryFn)).resolves.toBe(false);
    await expect(relationExists("public.follows", queryFn)).resolves.toBe(false);
    await expect(relationExists("public.follows", queryFn)).resolves.toBe(true);
    await expect(relationExists("public.follows", queryFn)).resolves.toBe(true);

    expect(queryFn).toHaveBeenCalledTimes(3);
  });

  it("rejects malformed or unsafe relation names", () => {
    const queryFn = jest.fn(async () => ({ rows: [{ present: true }] }));
    expect(() => relationExists("public.tables; DROP TABLE users", queryFn)).toThrow(
      "Invalid relation name",
    );
    expect(queryFn).not.toHaveBeenCalled();
  });

  it("supports custom probe callbacks via memoizeRelationPresent", async () => {
    const probe = jest.fn(async (): Promise<boolean> => true);
    await expect(memoizeRelationPresent("public.follows", probe)).resolves.toBe(true);
    await expect(memoizeRelationPresent("public.follows", probe)).resolves.toBe(true);
    expect(probe).toHaveBeenCalledTimes(1);
  });
});
