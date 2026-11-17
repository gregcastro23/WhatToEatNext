/**
 * LivePriceTicker end to end: the REAL price-index handler produces the Response
 * body that the component's own `poll()` fetches, parses with
 * `parsePriceIndexResponse` and renders. This is the host-wiring evidence the
 * parser suites cannot give: that `poll()` hands the parsed payload to the store,
 * that the narrowed `LiveTickerPayload` renders the same quotes, and that each
 * refusal path lands in the state the old res.ok/success/live gate produced (the old poll() was read, not executed).
 *
 * Only the route's I/O edges are faked (database down or answering with
 * node-postgres-shaped strings; Redis pass-through). The component keeps its
 * state in a MODULE-level store, so every test imports a fresh copy of it (the
 * jest config resets the module registry before each test) together with RTL, so
 * both share one React instance.
 */
import React from "react";
import { isJsonRecord } from "@/lib/api/json";

// RTL registers its auto-cleanup hooks when it is imported, and jest forbids defining
// hooks inside a test; each test imports its own RTL (see the header), so cleanup is manual.
process.env.RTL_SKIP_AUTO_CLEANUP = "true";
const pendingCleanups: Array<() => void> = [];
const mockLoggerError = jest.fn();

let mockDbRows: unknown[] | null = null;

jest.mock("@/lib/logger", () => ({
  _logger: { error: (...args: unknown[]): void => { mockLoggerError(...args); } },
}));
jest.mock("@/lib/database", () => ({
  executeQuery: async (): Promise<{ rows: unknown[] }> => {
    if (mockDbRows === null) throw new Error("connect ECONNREFUSED");
    return { rows: mockDbRows };
  },
}));
jest.mock("@/lib/redis", () => ({
  redisCached: (_key: string, _ttl: number, loader: () => Promise<unknown>): Promise<unknown> => loader(),
}));

const originalFetch = globalThis.fetch;
const REFUSAL = { success: false, live: false, message: "Price oracle unavailable — the position engine failed" };
const PG_ROW = { spirit: "1234.5", essence: "10", matter: "0", substance: "7" };

interface Mounted {
  container: HTMLElement;
  rtl: typeof import("@testing-library/react");
  wire: () => Record<string, unknown>;
}

function recordOf(value: unknown): Record<string, unknown> {
  if (!isJsonRecord(value)) throw new Error("expected a JSON object");
  return value;
}

/** Mount a fresh ticker whose fetch is answered by `answer`; `wire()` is the last live body the real route served. */
async function mount(variant: "cards" | "ribbon", answer: (route: () => Promise<Response>) => Promise<Response>): Promise<Mounted> {
  const { GET } = await import("@/app/api/economy/price-index/route");
  let served: unknown = null;
  const route = async (): Promise<Response> => {
    const response = await GET();
    served = await response.clone().json();
    return response;
  };
  globalThis.fetch = (): Promise<Response> => answer(route);
  const rtl = await import("@testing-library/react");
  pendingCleanups.push(() => rtl.cleanup());
  const { default: LivePriceTicker } = await import("../LivePriceTicker");
  const { container } = rtl.render(<LivePriceTicker variant={variant} />);
  return { container, rtl, wire: () => recordOf(served) };
}

function withoutKey(body: Record<string, unknown>, key: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(body).filter(([name]) => name !== key));
}

function asResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

beforeEach(() => {
  mockDbRows = null;
  mockLoggerError.mockReset();
  // jest.config sets pretendToBeVisual: false, so jsdom reports document.hidden === true,
  // and the ticker (deliberately) never polls a hidden tab. Make the document visible.
  Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
});

afterEach(() => {
  for (const cleanup of pendingCleanups.splice(0)) cleanup();
  globalThis.fetch = originalFetch;
  Reflect.deleteProperty(document, "hidden");
});

describe("LivePriceTicker over the real /api/economy/price-index handler", () => {
  it("cards: the live body renders four quotes, the composite and a LIVE chip; a down ledger shows no supply line", async () => {
    const { container, rtl, wire } = await mount("cards", (route) => route());
    await rtl.waitFor(() => expect(container.textContent).toContain("Composite"));
    const body = wire();
    expect(container.textContent).toContain(`Composite ${Number(body.compositeIndex).toFixed(4)}`);
    expect(container.textContent).toContain("LIVE");
    for (const token of ["Spirit", "Essence", "Matter", "Substance"]) {
      expect(container.querySelector(`article[aria-label="${token} index quote"]`)).not.toBeNull();
    }
    expect(container.textContent).not.toContain("ledger supply");
    expect(container.textContent).toContain(String(recordOf(body.basis).model));
  });

  it("cards: a live ledger shows the supply line with the amounts the route coerced from node-postgres strings", async () => {
    mockDbRows = [PG_ROW];
    const { container, rtl } = await mount("cards", (route) => route());
    await rtl.waitFor(() => expect(container.textContent).toContain("ledger supply"));
    expect(container.textContent).toContain("1,235");
  });

  it("cards: a payload cached from before `supply` existed renders without the supply line and without crashing", async () => {
    const { container, rtl } = await mount("cards", async (route) => asResponse(withoutKey(recordOf(await (await route()).json()), "supply")));
    await rtl.waitFor(() => expect(container.textContent).toContain("Composite"));
    expect(container.textContent).not.toContain("ledger supply");
    expect(container.textContent).toContain("LIVE");
  });

  it("ribbon: the live body renders the lead cell and an uppercase symbol per quote", async () => {
    const { container, rtl } = await mount("ribbon", (route) => route());
    await rtl.waitFor(() => expect(container.textContent).toContain("ELEMENTAL EXCHANGE"));
    for (const symbol of ["SPIRIT", "ESSENCE", "MATTER", "SUBSTANCE"]) expect(container.textContent).toContain(symbol);
  });

  it("the route's 503 refusal lands on the OFFLINE panel, and Retry recovers once the oracle answers", async () => {
    let healthy = false;
    const { container, rtl } = await mount("cards", (route) => (healthy ? route() : Promise.resolve(asResponse(REFUSAL, 503))));
    await rtl.waitFor(() => expect(container.textContent).toContain("The price oracle is offline"));
    expect(container.textContent).toContain("OFFLINE");
    healthy = true;
    rtl.fireEvent.click(rtl.screen.getByText("Retry"));
    await rtl.waitFor(() => expect(container.textContent).toContain("Composite"));
    expect(container.textContent).toContain("LIVE");
    expect(container.textContent).not.toContain("The price oracle is offline");
  });

  it("a live body that does not hold up (the parser throws) is OFFLINE, never a render-time crash, and logs the parser's message", async () => {
    const { container, rtl } = await mount("cards", async (route) => asResponse(withoutKey(recordOf(await (await route()).json()), "aNumber")));
    await rtl.waitFor(() => expect(container.textContent).toContain("The price oracle is offline"));
    expect(container.textContent).not.toContain("Composite");
    expect(mockLoggerError).toHaveBeenCalledWith(
      "[LivePriceTicker]",
      "Invalid price-index response: aNumber must be a finite number",
    );
  });

  it("logs partial drift when unreadable quote rows or a malformed supply block are dropped while rendering valid quotes", async () => {
    const { container, rtl } = await mount("cards", async (route) => {
      const body = recordOf(await (await route()).json());
      const tokens = Array.isArray(body.tokens) ? [{ token: "Aether" }, ...body.tokens] : [];
      return asResponse({ ...body, tokens, supply: "broken" });
    });
    await rtl.waitFor(() => expect(container.textContent).toContain("Composite"));
    expect(container.textContent).toContain("LIVE");
    expect(mockLoggerError).toHaveBeenCalledWith(
      "[LivePriceTicker] Dropped malformed parts of price-index response:",
      ["tokens: dropped 1 unreadable quote row(s)", "supply: malformed supply block dropped"],
    );
  });

  it("a perfectly valid live body that arrives with a non-2xx status is NOT shown as live (the res.ok gate)", async () => {
    const { container, rtl } = await mount("cards", async (route) => asResponse(await (await route()).json(), 502));
    await rtl.waitFor(() => expect(container.textContent).toContain("The price oracle is offline"));
    expect(container.textContent).not.toContain("Composite");
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it("a non-JSON body (a CDN error page) is OFFLINE too", async () => {
    const { container, rtl } = await mount("cards", () => Promise.resolve(new Response("<html>502</html>", { status: 502 })));
    await rtl.waitFor(() => expect(container.textContent).toContain("The price oracle is offline"));
    expect(mockLoggerError).not.toHaveBeenCalled();
  });
});
