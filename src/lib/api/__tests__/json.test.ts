/**
 * The JSON trust boundary — behaviour of the single place the repo converts an
 * unknown payload into a typed value.
 */
import { readJson, safeReadJson, fetchJson, parseEach, HttpError } from "@/lib/api/json";

/**
 * A real `Response`, not a hand-rolled stand-in. Using the platform object
 * keeps this test free of the `as unknown as Response` shim a fake would need
 * — which would itself have added to the cast ratchet these helpers exist to
 * bring down.
 */
function jsonResponse(
  body: unknown,
  init?: { status?: number; statusText?: string },
): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    statusText: init?.statusText ?? "OK",
    headers: { "Content-Type": "application/json" },
  });
}

describe("readJson", () => {
  it("returns the parsed body", async () => {
    await expect(readJson(jsonResponse({ a: 1 }))).resolves.toEqual({ a: 1 });
  });

  it("preserves a literal null body rather than coercing it away", async () => {
    // `null` is valid JSON. A boundary that swallowed it would let callers
    // annotate a non-nullable T and be quietly wrong.
    await expect(readJson(jsonResponse(null))).resolves.toBeNull();
  });

  it("routes the body through `parse` when one is supplied", async () => {
    // Narrowed with `in`, not asserted — this file must not spend assertions
    // to test the helper whose purpose is to stop spending them.
    const parse = (value: unknown): { n: number } => {
      if (typeof value !== "object" || value === null || !("n" in value)) {
        throw new Error("bad payload");
      }
      return { n: Number(value.n) };
    };
    await expect(readJson(jsonResponse({ n: "7" }), parse)).resolves.toEqual({
      n: 7,
    });
  });

  it("routes the body through { parse } options object", async () => {
    const parse = (value: unknown): { n: number } => {
      if (typeof value !== "object" || value === null || !("n" in value)) {
        throw new Error("bad payload");
      }
      return { n: Number(value.n) };
    };
    await expect(
      readJson(jsonResponse({ n: "9" }), { parse }),
    ).resolves.toEqual({ n: 9 });
  });

  it("lets a parse rejection surface instead of returning a bad value", async () => {
    const parse = (): never => {
      throw new Error("bad payload");
    };
    await expect(readJson(jsonResponse({}), parse)).rejects.toThrow(
      "bad payload",
    );
  });
});

describe("safeReadJson", () => {
  it("returns the parsed body on valid JSON", async () => {
    await expect(safeReadJson(jsonResponse({ a: 1 }), { a: 0 })).resolves.toEqual({
      a: 1,
    });
  });

  it("returns the fallback when response body is not valid JSON", async () => {
    const invalidResponse = new Response("not-json", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
    await expect(safeReadJson(invalidResponse, { fallback: true })).resolves.toEqual({
      fallback: true,
    });
  });

  it("returns the fallback when response body is empty (200 OK)", async () => {
    const emptyResponse = new Response("", {
      status: 200,
    });
    await expect(safeReadJson(emptyResponse, { empty: true })).resolves.toEqual({
      empty: true,
    });
  });

  it("returns the fallback when response body is empty (204 No Content)", async () => {
    const noContentResponse = new Response(null, {
      status: 204,
    });
    await expect(safeReadJson(noContentResponse, { empty: true })).resolves.toEqual({
      empty: true,
    });
  });

  it("preserves literal null body when valid JSON", async () => {
    await expect(safeReadJson(jsonResponse(null), { fallback: true })).resolves.toBeNull();
  });

  it("routes through parse when supplied", async () => {
    const parse = (value: unknown): { n: number } => {
      if (typeof value !== "object" || value === null || !("n" in value)) {
        throw new Error("bad");
      }
      return { n: Number(value.n) };
    };
    await expect(
      safeReadJson(jsonResponse({ n: "42" }), { n: 0 }, parse),
    ).resolves.toEqual({ n: 42 });
  });

  it("routes through { parse } option object", async () => {
    const parse = (value: unknown): { n: number } => {
      if (typeof value !== "object" || value === null || !("n" in value)) {
        throw new Error("bad");
      }
      return { n: Number(value.n) };
    };
    await expect(
      safeReadJson(jsonResponse({ n: "42" }), { n: 0 }, { parse }),
    ).resolves.toEqual({ n: 42 });
  });

  it("returns fallback if parse throws", async () => {
    const parse = (): never => {
      throw new Error("bad");
    };
    await expect(
      safeReadJson(jsonResponse({ n: "42" }), { n: -1 }, parse),
    ).resolves.toEqual({ n: -1 });
  });
});

describe("fetchJson", () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it("returns the body on a 2xx", async () => {
    const mockFetch: typeof fetch = () =>
      Promise.resolve(jsonResponse({ ok: true }));
    global.fetch = mockFetch;
    await expect(fetchJson("/api/x")).resolves.toEqual({ ok: true });
  });

  it("routes through { parse } option object on fetchJson", async () => {
    const mockFetch: typeof fetch = () =>
      Promise.resolve(jsonResponse({ n: "55" }));
    global.fetch = mockFetch;
    const parse = (val: unknown): { n: number } => {
      const rec = val as { n: string };
      return { n: Number(rec.n) };
    };
    await expect(fetchJson("/api/x", undefined, { parse })).resolves.toEqual({
      n: 55,
    });
  });

  it("throws HttpError carrying the status on a non-2xx", async () => {
    const mockFetch: typeof fetch = () =>
      Promise.resolve(
        jsonResponse(null, { status: 503, statusText: "Service Unavailable" }),
      );
    global.fetch = mockFetch;

    await expect(fetchJson("/api/x")).rejects.toBeInstanceOf(HttpError);
    await expect(fetchJson("/api/x")).rejects.toMatchObject({
      status: 503,
      url: "/api/x",
    });
  });
});

describe("parseEach", () => {
  it("handles non-array inputs safely by returning empty result", () => {
    expect(parseEach(null, (x) => x)).toEqual({
      items: [],
      kept: 0,
      dropped: 0,
      total: 0,
    });
    expect(parseEach(undefined, (x) => x)).toEqual({
      items: [],
      kept: 0,
      dropped: 0,
      total: 0,
    });
    expect(parseEach({ not: "an array" }, (x) => x)).toEqual({
      items: [],
      kept: 0,
      dropped: 0,
      total: 0,
    });
  });

  it("parses an all-valid array, returning kept === total and dropped === 0", () => {
    const raw = [1, 2, 3];
    const res = parseEach(raw, (n) => String(n));
    expect(res).toEqual({
      items: ["1", "2", "3"],
      kept: 3,
      dropped: 0,
      total: 3,
    });
  });

  it("tolerates corrupted items, collecting survivors and counting dropped", () => {
    const raw = [10, "bad", 30, "also bad", 50];
    const errors: Array<{ err: unknown; item: unknown; idx: number }> = [];
    const parse = (x: unknown): number => {
      if (typeof x !== "number") throw new Error(`Not a number: ${String(x)}`);
      return x * 2;
    };
    const res = parseEach(raw, parse, {
      onError: (err, item, idx) => errors.push({ err, item, idx }),
    });

    expect(res.items).toEqual([20, 60, 100]);
    expect(res.kept).toBe(3);
    expect(res.dropped).toBe(2);
    expect(res.total).toBe(5);
    expect(errors).toHaveLength(2);
    expect(errors[0].idx).toBe(1);
    expect(errors[0].item).toBe("bad");
    expect(errors[1].idx).toBe(3);
    expect(errors[1].item).toBe("also bad");
  });

  it("handles all-items-dropped cleanly without throwing", () => {
    const raw = ["a", "b", "c"];
    const res = parseEach(raw, () => {
      throw new Error("fail");
    });
    expect(res).toEqual({
      items: [],
      kept: 0,
      dropped: 3,
      total: 3,
    });
  });
});

