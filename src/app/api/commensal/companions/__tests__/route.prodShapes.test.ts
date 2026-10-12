/**
 * /api/commensal/companions over database rows shaped exactly like production's
 * on 2026-10-12, when every companion failed the client guard and the panel
 * showed "Unable to retrieve planetary companions" on every tab.
 *
 * The assertion that matters is the first: whatever the route emits for those
 * rows satisfies the REAL strict `isCompanionsResponse`. It is read against a
 * control — the same rows put on the wire the way the replaced code did — so it
 * is known to be able to fail.
 */

jest.mock("next/server", () => {
  class MockNextRequest extends Request {}
  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      json: jest.fn((body, init) => ({
        status: init?.status ?? 200,
        json: async () => body,
        headers: init?.headers ?? {},
      })),
    },
  };
});

jest.mock("@/lib/redis", () => ({
  getRedisClient: () => null,
}));

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/lib/planetaryAgentsClient", () => ({
  fetchAgentsForDate: jest.fn(),
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("@/services/commensalDatabaseService", () => ({
  commensalDatabase: {
    getManualCompanionsForUser: jest.fn(() => Promise.resolve([])),
    getLinkedCommensalsForUser: jest.fn(() => Promise.resolve([])),
  },
}));

import { NextRequest } from "next/server";
import { executeQuery } from "@/lib/database";
import { fetchAgentsForDate } from "@/lib/planetaryAgentsClient";
import { isCompanionsResponse, isCompanionSuggestion } from "@/types/apiResponses";
import {
  adamSmithAgenticRow,
  adamSmithLegacyRow,
  avicennaRow,
  degreeAgentRow,
  freudRow,
  homerRow,
  legacyWireRow,
  moonPhaseRow,
  placeholderAgentRow,
  socratesRow,
  validNatalChart,
  type AgentDbRow,
} from "../../../../../__tests__/helpers/companionFixtures";
import { GET } from "../route";

let ipCounter = 0;
function makeRequest(): NextRequest {
  const addr = `10.9.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;
  return new NextRequest("http://localhost/api/commensal/companions", {
    method: "GET",
    headers: { "x-forwarded-for": addr },
  });
}

const MARS = degreeAgentRow("mars-leo-8", "Mars Leo 8");
const MERCURY = degreeAgentRow("mercury-scorpio-14", "Mercury Scorpio 14");

/** The roster as production held it: every class, once. */
function productionRoster(): AgentDbRow[] {
  return [
    MARS,
    MERCURY,
    moonPhaseRow(),
    freudRow(),
    avicennaRow(),
    adamSmithAgenticRow(),
    adamSmithLegacyRow(),
    homerRow(),
    socratesRow(),
    placeholderAgentRow(),
  ];
}

/** ASOL's gateway ids carry the `planetary-` prefix; the elements are the gateway's own. */
const ACTIVATIONS = [
  {
    id: "planetary-mars-leo-8",
    strength: 0.71,
    dignity: "peregrine",
    element: "Fire",
    planetaryRuler: "Mars",
  },
  {
    id: "planetary-mercury-scorpio-14",
    strength: 0.68,
    dignity: "peregrine",
    element: "Water",
    planetaryRuler: "Mercury",
  },
];

const FEED = [
  { actor_id: freudRow().user_id, last_action_at: "2026-10-12T17:14:30.879Z" },
  { actor_id: MERCURY.user_id, last_action_at: "2026-10-12T16:00:00.000Z" },
  { actor_id: placeholderAgentRow().user_id, last_action_at: "2026-10-11T09:00:00.000Z" },
];

function serve(rows: AgentDbRow[], feed = FEED): void {
  jest.mocked(executeQuery).mockImplementation((query: string) =>
    Promise.resolve(query.includes("feed_events") ? { rows: feed } : { rows }),
  );
}

async function fetchCompanions() {
  const res = await GET(makeRequest());
  expect(res.status).toBe(200);
  return res.json();
}

describe("GET /api/commensal/companions over production-shaped rows", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
    serve(productionRoster());
    jest.mocked(fetchAgentsForDate).mockResolvedValue(ACTIVATIONS);
  });

  afterEach(() => consoleError.mockRestore());

  it("emits a response that satisfies the strict client contract", async () => {
    const data = await fetchCompanions();
    expect(isCompanionsResponse(data)).toBe(true);
  });

  it("control: the same rows on the wire the OLD way do not", async () => {
    const wire = {
      success: true,
      activeAgents: [MARS, MERCURY].map(legacyWireRow),
      historicalAgents: [freudRow(), MERCURY].map(legacyWireRow),
      cosmicRoster: productionRoster().map(legacyWireRow),
      savedCompanions: [],
      degraded: false,
    };
    expect(isCompanionsResponse(wire)).toBe(false);
    // …and every class but the placeholder fails on its own, so no one row is carrying the verdict.
    const failing = wire.cosmicRoster.filter((row) => !isCompanionSuggestion(row));
    expect(failing).toHaveLength(productionRoster().length - 1);
  });

  it("never puts the column's {} default on the wire", async () => {
    const text = JSON.stringify(await fetchCompanions());
    expect(text).not.toContain('"birthData":{}');
    expect(text).not.toContain('"natalChart":{}');
  });

  describe("Planetary: the active degree agents are listed, and honest about having no chart", () => {
    it("lists both, flagged by a null birth and a null chart", async () => {
      const { activeAgents } = await fetchCompanions();
      expect(activeAgents.map((a: { email: string }) => a.email)).toEqual([
        "mars-leo-8@agentic.alchm.kitchen",
        "mercury-scorpio-14@agentic.alchm.kitchen",
      ]);
      for (const agent of activeAgents) {
        expect(agent.birthData).toBeNull();
        expect(agent.natalChart).toBeNull();
      }
    });

    it("takes the element from the gateway instead of inventing Fire (Mercury in Scorpio is Water)", async () => {
      const { activeAgents } = await fetchCompanions();
      expect(activeAgents.map((a: { dominantElement: string }) => a.dominantElement)).toEqual([
        "Fire",
        "Water",
      ]);
      expect(
        activeAgents.map((a: { activation: { element: string } }) => a.activation.element),
      ).toEqual(["Fire", "Water"]);
    });

    it("prefers a stored element over the gateway's", async () => {
      serve([{ ...MERCURY, dominant_element: "Air" }]);
      const { activeAgents } = await fetchCompanions();
      expect(activeAgents[0].dominantElement).toBe("Air");
      expect(activeAgents[0].activation.element).toBe("Water");
    });

    it("leaves an element unknown when neither the row nor the gateway has one", async () => {
      serve([MERCURY]);
      jest.mocked(fetchAgentsForDate).mockResolvedValue([{ id: "mercury-scorpio-14", strength: 0.5 }]);
      const data = await fetchCompanions();
      expect(data.activeAgents[0].dominantElement).toBeNull();
      expect(data.activeAgents[0].activation.element).toBeNull();
      expect(isCompanionsResponse(data)).toBe(true);
    });
  });

  describe("Cosmic: only agents with a birth we can stand behind", () => {
    it("lists the historical figures — and none of the placements or placeholders", async () => {
      const { cosmicRoster } = await fetchCompanions();
      expect(cosmicRoster.map((a: { email: string }) => a.email)).toEqual([
        // Not de-duplicated: the @agents rows are separate accounts (a data-cleanup
        // question, not a read-path one), so both Adam Smiths are listed.
        "adam-smith-1723@agentic.alchm.kitchen",
        "adam-smith-1723@agents.alchm.kitchen",
        "ibn-sina-avicenna@agentic.alchm.kitchen",
        "sigmund-freud-1856@agentic.alchm.kitchen",
      ]);
    });

    it("converts the stored birth through the temporal pipeline", async () => {
      const { cosmicRoster } = await fetchCompanions();
      const freud = cosmicRoster.find((a: { email: string }) => a.email.startsWith("sigmund"));
      expect(freud.birthData).toEqual({
        dateTime: "1856-05-06T18:30:00.000Z",
        latitude: 49.6116,
        longitude: 17.2381,
        utcInstant: "1856-05-06T17:32:00.000Z",
        timezone: "Europe/Prague",
        timezoneBasis: "DERIVED_FROM_COORDINATES",
      });
    });

    it("leaves the chart to be computed: the legacy hand-authored one is not converted", async () => {
      const { cosmicRoster } = await fetchCompanions();
      for (const agent of cosmicRoster) expect(agent.natalChart).toBeNull();
    });

    it("keeps the stored element of a charted agent", async () => {
      const { cosmicRoster } = await fetchCompanions();
      const freud = cosmicRoster.find((a: { email: string }) => a.email.startsWith("sigmund"));
      expect(freud.dominantElement).toBe("Earth");
    });
  });

  describe("From Feed: every recent actor, flagged when it has no chart", () => {
    it("lists charted and chartless actors, newest first", async () => {
      const { historicalAgents } = await fetchCompanions();
      expect(historicalAgents.map((a: { email: string }) => a.email)).toEqual([
        "sigmund-freud-1856@agentic.alchm.kitchen",
        "mercury-scorpio-14@agentic.alchm.kitchen",
        "tesla@agentic.alchm.kitchen",
      ]);
      const births = historicalAgents.map((a: { birthData: unknown }) => a.birthData !== null);
      expect(births).toEqual([true, false, false]);
    });

    it("drops the chart stored beside a placeholder birth — it describes a moment nobody was born in", async () => {
      const { historicalAgents } = await fetchCompanions();
      const tesla = historicalAgents.find((a: { email: string }) => a.email.startsWith("tesla"));
      expect(tesla.birthData).toBeNull();
      expect(tesla.natalChart).toBeNull();
    });
  });

  describe("the sources an empty {} used to shadow", () => {
    const real = {
      dateTime: "1856-05-06T18:30:00.000Z",
      latitude: 49.6116,
      longitude: 17.2381,
    };

    it("reads users.profile.birthData when user_profiles.birth_data is {}", async () => {
      serve([{ ...freudRow(), birth_data: {}, profile: { birthData: real } }], []);
      const { cosmicRoster } = await fetchCompanions();
      expect(cosmicRoster).toHaveLength(1);
      expect(cosmicRoster[0].birthData).toEqual(real);
    });

    it("reads a valid chart from the profile when natal_chart is {}, and carries it", async () => {
      const chart = validNatalChart(real);
      serve([{ ...freudRow(), birth_data: real, natal_chart: {}, profile: { natalChart: chart } }], []);
      const data = await fetchCompanions();
      expect(data.cosmicRoster[0].natalChart).toEqual(chart);
      expect(isCompanionsResponse(data)).toBe(true);
    });
  });

  describe("an unreadable record", () => {
    const unreadable: AgentDbRow = {
      ...avicennaRow(),
      birth_data: { date: "sometime in the tenth century", time: "dawn", location: "Bukhara" },
    };

    it("is listed without a chart and counted for the operator", async () => {
      serve([unreadable, freudRow()], []);
      const data = await fetchCompanions();
      expect(data.cosmicRoster.map((a: { name: string }) => a.name)).toEqual(["Sigmund Freud 1856"]);
      expect(isCompanionsResponse(data)).toBe(true);
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError.mock.calls[0]?.[0]).toContain("cannot be read");
      expect(consoleError.mock.calls[0]?.[1]).toBe(1);
    });

    it("is silent when every record is either readable or knowingly not a birth", async () => {
      await fetchCompanions();
      expect(consoleError).not.toHaveBeenCalled();
    });
  });
});
