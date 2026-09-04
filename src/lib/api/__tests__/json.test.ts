/**
 * The JSON trust boundary — behaviour of the single place the repo converts an
 * unknown payload into a typed value.
 */
import { readJson, safeReadJson, fetchJson, HttpError } from "@/lib/api/json";

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
