/**
 * The JSON trust boundary — behaviour of the single place the repo converts an
 * unknown payload into a typed value.
 */
import { readJson, fetchJson, HttpError } from "@/lib/api/json";

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
