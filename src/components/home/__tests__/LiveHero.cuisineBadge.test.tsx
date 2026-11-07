/** @jest-environment jsdom */

/**
 * The home hero's "TONIGHT: X ↑" badge follows whichever engine answered.
 *
 * GET /api/cuisines/recommend has two engines. The local one answers with plain
 * names under `recommendations.cuisines`. The Railway backend's body has no
 * `recommendations` key, so the route forwards its list as `cuisineRecommendations`
 * (scored objects). The hero used to read only the first shape, so with the backend
 * answering there would be no badge. Today the backend's database layer is down and
 * the route serves the local engine, which is why the badge shows at all.
 *
 * Real here: LiveHero, the route handler with its zod validation, and the shared
 * parser. Faked: the Railway backend (answering from a verbatim trim of a real
 * capture) and the hero's other two fetches; next-auth's session, the alchemical
 * context, and the elemental-bias hook (written like the real one, unhydrated on its
 * first render, with the ?bias= value each test sets); the three quiz wrappers; the
 * recipe corpus; the rate limiter and observability wrapper; and the planetary
 * positions (every planet in a Fire sign, which pins the local engine to Fire).
 */
import { act, render, screen, waitFor } from "@testing-library/react";
import { installFetchMock } from "../../../__tests__/helpers/fetchMock";
import {
  RAILWAY_CUISINES_RECOMMEND,
  withoutSky,
} from "../../../__tests__/helpers/railwayCuisinesFixture";
import { LiveHero } from "../LiveHero";

let mockBias: string | null = null;

jest.mock("next-auth/react", () => ({ useSession: () => ({ status: "unauthenticated", data: null }) }));
jest.mock("@/contexts/AlchemicalContext/hooks", () => ({ useAlchemicalSafe: () => null }));
jest.mock("@/hooks/useUserElementalBias", () => {
  const { useEffect, useState } = jest.requireActual<typeof import("react")>("react");
  return {
    biasQueryParam: () => mockBias,
    // Not hydrated on the first render, as the real hook: the hero's teaser effect
    // exists to react to that flip.
    useUserElementalBias: () => {
      const [hydrated, setHydrated] = useState(false);
      useEffect(() => setHydrated(true), []);
      return {
        hydrated,
        table: [],
        chartOn: false,
        chartSunGlyph: null,
        composite: null,
        bias: null,
        source: null,
        tableSize: 0,
      };
    },
  };
});
// The quiz is another feature; its wrappers must still render the hero's tile grid.
jest.mock("@/components/home/quiz/QuizBar", () => ({ QuizBar: () => null }));
jest.mock("@/components/home/quiz/QuizSurface", () => ({
  QuizSurface: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@/components/home/quiz/QuizProvider", () => ({
  QuizProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// The route, with only its collaborators faked.
jest.mock("@/data/recipes/index", () => ({ getAllRecipes: async () => [] }));
jest.mock("@/lib/rateLimit", () => ({ rateLimit: async () => ({ allowed: true }) }));
jest.mock("@/lib/observability/withObservability", () => ({
  withObservability: (_options: unknown, handler: unknown): unknown => handler,
}));
jest.mock("@/utils/astrology/positions", () => ({
  getAccuratePlanetaryPositions: () => ({
    Sun: { sign: "aries" },
    Moon: { sign: "leo" },
    Mars: { sign: "sagittarius" },
    Mercury: { sign: "aries" },
  }),
}));

const BACKEND = "http://backend.test";
const BIAS = "0.7000,0.1000,0.1000,0.2000";

type BackendMode = "answers" | "no-sky" | "fails";
let backendMode: BackendMode = "answers";
let routeOverride: Record<string, unknown> | null = null;
let requested: string[] = [];
let route: typeof import("@/app/api/cuisines/recommend/route");

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function backendCalls(): number {
  return requested.filter((url) => url.startsWith(BACKEND)).length;
}

async function routedFetch(input: RequestInfo | URL): Promise<Response> {
  const url = String(input);
  requested.push(url);
  if (url.startsWith(BACKEND)) {
    // Only the endpoint the backend serves, with the query the route is meant to send.
    const { pathname, searchParams } = new URL(url);
    if (pathname !== "/cuisines/recommend" || searchParams.get("limit") !== "14") {
      return jsonResponse({ detail: "Not Found" }, 404);
    }
    if (backendMode === "fails") return jsonResponse({ detail: "no database" }, 500);
    return jsonResponse(backendMode === "no-sky" ? withoutSky(RAILWAY_CUISINES_RECOMMEND) : RAILWAY_CUISINES_RECOMMEND);
  }
  if (url.startsWith("/api/cuisines/recommend")) {
    return routeOverride ? jsonResponse(routeOverride) : route.GET(new Request(`http://localhost${url}`));
  }
  return jsonResponse({}); // /api/alchm-quantities and the hero image: nothing to show
}

/** The first cuisine of the local engine's own answer, read without the parser under test. */
async function localFirstCuisine(query = ""): Promise<string | undefined> {
  const previous = backendMode;
  backendMode = "fails";
  const response = await route.GET(new Request(`http://localhost/api/cuisines/recommend${query}`));
  backendMode = previous;
  requested = [];
  const body: unknown = await response.json();
  if (typeof body !== "object" || body === null || !("recommendations" in body)) return undefined;
  const { recommendations } = body;
  if (typeof recommendations !== "object" || recommendations === null || !("cuisines" in recommendations)) {
    return undefined;
  }
  const { cuisines } = recommendations;
  return Array.isArray(cuisines) && typeof cuisines[0] === "string" ? cuisines[0] : undefined;
}

/** Let the hero's fetch chain run to its end, for tests that expect NO badge. */
async function settled(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
}

beforeEach(async () => {
  // jsdom has no prefers-reduced-motion; say it is set so the hero skips its canvas.
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: true,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  });
  process.env.BACKEND_URL = BACKEND; // read once, when the route module loads
  route = await import("@/app/api/cuisines/recommend/route");
  backendMode = "answers";
  routeOverride = null;
  requested = [];
  mockBias = null;
  installFetchMock(jest.fn(routedFetch));
});

afterEach(() => {
  delete process.env.BACKEND_URL;
});

describe("LiveHero TONIGHT badge", () => {
  it("names the Railway backend's best match when the backend answers", async () => {
    render(<LiveHero />);

    expect(await screen.findByText("TONIGHT: VIETNAMESE ↑")).toBeInTheDocument();
    expect(backendCalls()).toBe(1); // it was the backend branch, not a fallback
  });

  it("falls back to the local engine's first cuisine when the backend returns 500", async () => {
    backendMode = "fails";
    const errors = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const expected = await localFirstCuisine();
    errors.mockClear(); // keep only what the hero's own request logs

    render(<LiveHero />);

    expect(expected).toBeDefined();
    expect(await screen.findByText(`TONIGHT: ${expected?.toUpperCase()} ↑`)).toBeInTheDocument();
    expect(backendCalls()).toBe(1); // the backend was tried and failed
    expect(errors.mock.calls.some(([message]) => String(message).includes("error: 500"))).toBe(true);
  });

  it("shows no badge when the backend had no sky to rank by", async () => {
    backendMode = "no-sky"; // 200, every score null, cuisines in alphabetical order

    render(<LiveHero />);
    await waitFor(() => expect(backendCalls()).toBe(1));
    await settled();

    // Not "TONIGHT: CHINESE": alphabetical is not a pick, and the badge is labelled live.
    expect(screen.queryByText(/^TONIGHT: /)).not.toBeInTheDocument();
  });

  it("asks the local engine, not the backend, for a visitor with a table", async () => {
    mockBias = BIAS;
    const expected = await localFirstCuisine(`?bias=${encodeURIComponent(BIAS)}`);

    render(<LiveHero />);

    expect(expected).toBeDefined();
    expect(await screen.findByText(`TONIGHT: ${expected?.toUpperCase()} ↑`)).toBeInTheDocument();
    expect(requested.some((url) => url.startsWith("/api/cuisines/recommend?bias="))).toBe(true);
    expect(backendCalls()).toBe(0);
  });

  it("takes only a success:true answer", async () => {
    routeOverride = { success: false, cuisineRecommendations: RAILWAY_CUISINES_RECOMMEND.cuisine_recommendations };

    render(<LiveHero />);
    await waitFor(() => expect(requested).toContain("/api/cuisines/recommend"));
    await settled();

    expect(screen.queryByText(/^TONIGHT: /)).not.toBeInTheDocument();
  });
});
