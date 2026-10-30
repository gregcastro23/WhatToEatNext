/**
 * @jest-environment jsdom
 *
 * The Recipe Builder's request to /api/recommendations/generate: the free
 * retry inside the server's timeout window, the status → outcome mapping, and
 * the validated body (a malformed recommendation is dropped, never asserted).
 */
import {
  isRecommendedMeal,
  openFailureRemedy,
  requestRecommendations,
  toRequestAstroState,
  toUserContext,
  type GenerationRequest,
} from "../generateRecommendations";

const REQUEST: GenerationRequest = {
  dayOfWeek: 5,
  astroState: {
    currentZodiac: "libra",
    lunarPhase: "full moon",
    activePlanets: [],
    domElements: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  },
  options: { mealTypes: ["dinner"], requiredIngredients: ["garlic"] },
};

const MEAL = {
  mealType: "dinner",
  recipe: { id: "r1", name: "Garlic Soup", ingredients: [], instructions: [] },
  score: 0.8,
  reasons: ["Venus day"],
  dayAlignment: 0.7,
  planetaryAlignment: 0.6,
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const originalFetch = global.fetch;
let fetchMock: jest.Mock;

function postedBodies(): unknown[] {
  return fetchMock.mock.calls.map(([, init]: [string, RequestInit]) => JSON.parse(String(init.body)));
}

beforeEach(() => {
  fetchMock = jest.fn();
  global.fetch = fetchMock;
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("requestRecommendations", () => {
  it("returns the recommendations and drops entries missing a field the carousel reads", async () => {
    fetchMock.mockResolvedValueOnce(json({ success: true, recommendations: [MEAL, { recipe: { name: "No score" } }] }));

    await expect(requestRecommendations(REQUEST)).resolves.toEqual({ ok: true, recommendations: [MEAL] });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/recommendations/generate",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(postedBodies()).toEqual([REQUEST]);
  });

  it("retries a timeout once with the server's retry token", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ success: false, reason: "timeout", retry: { token: "tok-1" } }, 504))
      .mockResolvedValueOnce(json({ success: true, recommendations: [MEAL] }));

    await expect(requestRecommendations(REQUEST)).resolves.toEqual({ ok: true, recommendations: [MEAL] });
    expect(postedBodies()).toEqual([REQUEST, { ...REQUEST, retryToken: "tok-1" }]);
  });

  it("does not retry a timeout that carries no token", async () => {
    fetchMock.mockResolvedValueOnce(json({ success: false, reason: "timeout" }, 504));

    await expect(requestRecommendations(REQUEST)).resolves.toMatchObject({ ok: false, reason: "timeout" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    [402, "tokens", "Insufficient tokens. Each generation costs 5 Spirit + 5 Essence."],
    [401, "auth", "Please sign in to generate recipes."],
    [500, "failed", "Could not generate recipes right now. Please try again."],
  ])("maps HTTP %i to the %s outcome", async (status, reason, message) => {
    fetchMock.mockResolvedValueOnce(json({ success: false }, status));
    await expect(requestRecommendations(REQUEST)).resolves.toEqual({ ok: false, reason, message });
  });

  it("treats a 200 without success, an unreadable body, or a network error as a failure", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ success: false }))
      .mockResolvedValueOnce(new Response("<html>Bad gateway</html>", { status: 502 }))
      .mockRejectedValueOnce(new TypeError("fetch failed"));

    for (let i = 0; i < 3; i++) {
      await expect(requestRecommendations(REQUEST)).resolves.toMatchObject({ ok: false, reason: "failed" });
    }
  });
});

describe("openFailureRemedy", () => {
  it("opens the token shop for 402 and sign-in for 401, and nothing otherwise", () => {
    const seen: string[] = [];
    const record = (event: Event): void => {
      seen.push(event.type);
    };
    window.addEventListener("open-token-shop", record);
    window.addEventListener("open-signin-modal", record);

    openFailureRemedy({ ok: false, reason: "tokens", message: "" });
    openFailureRemedy({ ok: false, reason: "auth", message: "" });
    openFailureRemedy({ ok: false, reason: "timeout", message: "" });
    openFailureRemedy({ ok: true, recommendations: [] });

    expect(seen).toEqual(["open-token-shop", "open-signin-modal"]);
    window.removeEventListener("open-token-shop", record);
    window.removeEventListener("open-signin-modal", record);
  });
});

describe("isRecommendedMeal / toUserContext", () => {
  it("accepts a meal with the carousel's fields and rejects anything short of them", () => {
    expect(isRecommendedMeal(MEAL)).toBe(true);
    expect(isRecommendedMeal({ ...MEAL, reasons: "Venus day" })).toBe(false);
    expect(isRecommendedMeal({ ...MEAL, recipe: null })).toBe(false);
    expect(isRecommendedMeal("Garlic Soup")).toBe(false);
  });

  it("personalizes only with a natal chart", () => {
    expect(toUserContext(null)).toBeUndefined();
    expect(toUserContext({})).toBeUndefined();
  });

  describe("toRequestAstroState", () => {
    it("passes through live non-zero domElements", () => {
      const live = {
        currentZodiac: "aries",
        lunarPhase: "waxing crescent" as const,
        activePlanets: ["Mars"],
        domElements: { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 },
        currentPlanetaryHour: "Mars",
      };
      const res = toRequestAstroState(live);
      expect(res.domElements).toEqual({ Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 });
      expect(res.currentPlanetaryHour).toBe("Mars");
    });

    it("falls back to even 0.25 split when domElements is all zeros", () => {
      const cold = {
        currentZodiac: "aries",
        lunarPhase: "waxing crescent" as const,
        activePlanets: [],
        domElements: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
        currentPlanetaryHour: null,
      };
      const res = toRequestAstroState(cold);
      expect(res.domElements).toEqual({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
      expect(res.currentPlanetaryHour).toBeUndefined();
    });
  });
});
