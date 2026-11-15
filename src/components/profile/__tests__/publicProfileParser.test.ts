/**
 * @jest-environment node
 *
 * The REAL GET /api/users/[userId] handler is the producer; only its I/O edges are
 * faked: the DB client (rows carry the driver's types: `Date` timestamps and
 * `NUMERIC::text` strings, not the route's declared `string`s), the auth lookup,
 * the follow and taste-graph services, and the four ASOL fetchers (the real
 * `agentSlugFromEmail` is kept). `computeAgentProgression` and
 * `resolveAgentAppearance` run for real. The Response body is read with
 * `res.json()` and handed to the parser, as `readJson` does in the page.
 */
import { NextRequest } from "next/server";
import { GET } from "@/app/api/users/[userId]/route";
import type { CraftedAgentProfile } from "@/lib/agents/craftedAgentTypes";
import type { AgentAction, AgentArtifact, AgentInteraction } from "@/lib/agents/fetchAgentProfile";
import { isJsonRecord } from "@/lib/api/json";
import type { TasteGraph } from "@/services/userInteractionsService";
import { parsePublicProfileResponse, type PublicProfileResponse } from "../publicProfileParser";

let mockProfileRows: unknown[] = [];
let mockFeedRows: unknown[] = [];
let mockBalanceRows: unknown[] = [];
let mockProfileFails = false;
let mockFeedFails = false;
let mockViewer: string | null = null;
let mockTaste: unknown = null;
let mockTasteFails = false;
let mockAsolProfile: unknown = null;
let mockInteractions: unknown[] = [];
let mockActions: unknown[] = [];
let mockArtifacts: unknown[] = [];

jest.mock("@/lib/database", () => ({
  executeQuery: async (sql: string): Promise<{ rows: unknown[] }> => {
    if (/FROM users u/.test(sql)) {
      if (mockProfileFails) throw new Error("db down");
      return { rows: mockProfileRows };
    }
    if (/FROM feed_events/.test(sql)) {
      if (mockFeedFails) throw new Error("feed table missing");
      return { rows: mockFeedRows };
    }
    if (/FROM token_balances/.test(sql)) return { rows: mockBalanceRows };
    if (/COUNT\(\*\)::int AS n/.test(sql)) return { rows: [{ n: "7" }] };
    if (/to_regclass/.test(sql)) return { rows: [{ present: true }] };
    if (/FROM tables t/.test(sql)) return { rows: [{ hosted: "4", joined: "18" }] };
    return { rows: [] };
  },
}));
jest.mock("@/lib/auth/validateRequest", () => ({ getUserIdFromRequest: async (): Promise<string | null> => mockViewer }));
jest.mock("@/services/followDatabaseService", () => ({
  followDatabase: {
    getFollowCounts: async (): Promise<{ followers: number; following: number }> => ({ followers: 5, following: 3 }),
    getFollowState: async (): Promise<{ follows: boolean; followedBy: boolean }> => ({ follows: true, followedBy: false }),
  },
}));
jest.mock("@/services/userInteractionsService", () => ({
  computeTasteGraph: async (): Promise<unknown> => {
    if (mockTasteFails) throw new Error("taste graph down");
    return mockTaste;
  },
}));
jest.mock("@/lib/agents/fetchAgentProfile", () => ({
  ...jest.requireActual("@/lib/agents/fetchAgentProfile"),
  fetchAgentProfile: async (): Promise<unknown> => mockAsolProfile,
  fetchAgentInteractions: async (): Promise<unknown[]> => mockInteractions,
  fetchAgentActions: async (): Promise<unknown[]> => mockActions,
  fetchAgentArtifacts: async (): Promise<unknown[]> => mockArtifacts,
}));

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const TASTE: TasteGraph = {
  cuisines: [{ name: "Italian", score: 0.8 }],
  cookingMethods: [],
  favoriteIngredients: [],
  dislikedIngredients: [],
  elementalAffinities: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
  planetaryPreferences: [],
  mealTimePatterns: [],
  complexityPreference: "moderate",
  confidence: 0.4,
  totalInteractions: 12,
  lastActivity: null,
  corrections: {},
};
const ASOL: CraftedAgentProfile = {
  name: "Leonardo da Vinci",
  title: "Polymath",
  era: "Renaissance",
  consciousness: { dominantElement: "Air", level: "Master" },
  historicalDiet: { staples: ["bread"] },
};

const INTERACTION: AgentInteraction = {
  id: "i1",
  kind: "agent_to_user",
  counterparty: { name: "Ada" },
  topic: "Saffron",
  messagePreview: "Hello",
  messageCount: 3,
  startedAt: "2025-11-01T08:00:00Z",
  lastTurnAt: "2025-11-01T09:00:00Z",
  chatThread: "t1",
};
const ACTION: AgentAction = { id: "a1", type: "recipe_created", createdAt: "2025-11-01T08:00:00Z", metadata: {}, links: {} };
const ARTIFACT: AgentArtifact = { id: "r1", kind: "recipe", title: "Risotto", createdAt: "2025-11-01T08:00:00Z", summary: "Creamy." };

function humanRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    user_id: OWNER_ID,
    email: "ada@example.com",
    is_agent: false,
    name: "Ada",
    bio: "Cooks by the Moon.",
    natal_chart: { planets: {} },
    natal_positions: [{ planet: "Sun", sign: "scorpio", degree: 21.4, minutes: 24 }, { planet: "Moon", sign: "virgo", degree: 3 }],
    dominant_element: "Water",
    birth_data: {},
    dietary_preferences: { restrictions: ["vegetarian"] },
    profile_layout: ["natalChart", "tasteGraph"],
    avatar_url: null,
    share_identity: null,
    created_at: new Date("2025-03-01T12:00:00Z"),
    ...overrides,
  };
}

async function fetchProfile(userId: string): Promise<{ status: number; wire: unknown; parsed: PublicProfileResponse }> {
  const res = await GET(new NextRequest(`http://localhost/api/users/${userId}`), { params: Promise.resolve({ userId }) });
  const wire: unknown = await res.json();
  return { status: res.status, wire, parsed: parsePublicProfileResponse(wire) };
}

function profileOf(parsed: PublicProfileResponse): Extract<PublicProfileResponse, { kind: "profile" }> {
  if (parsed.kind !== "profile") throw new Error("expected a profile, got a refusal");
  return parsed;
}

beforeEach(() => {
  mockProfileRows = [humanRow()];
  mockFeedRows = [
    { id: "e1", event_type: "recipe_review", metadata_payload: { rating: 5 }, created_at: new Date("2025-11-01T08:00:00Z") },
    { id: "e2", event_type: "made_it", metadata_payload: null, created_at: new Date("2025-11-02T08:00:00Z") },
  ];
  mockBalanceRows = [{ spirit: "12.5", essence: "3", matter: "0", substance: "7.25" }];
  mockProfileFails = false;
  mockFeedFails = false;
  mockViewer = "viewer-9";
  mockTaste = TASTE;
  mockTasteFails = false;
  mockAsolProfile = null;
  mockInteractions = [];
  mockActions = [];
  mockArtifacts = [];
});

describe("parsePublicProfileResponse over the real /api/users/[userId] handler", () => {
  it("a human, DB path, seen by another viewer: everything the page reads arrives, with no issues", async () => {
    const { status, wire, parsed } = await fetchProfile(OWNER_ID);
    expect(status).toBe(200);
    const { profile, issues } = profileOf(parsed);
    expect(issues).toEqual([]);
    // Tripwire: `social` and its `viewer` are closed levels (no pass-through). A non-owner sees a non-null viewer,
    // and the parsed block must equal what the route served, so a key the route adds later fails here.
    const servedSocial = isJsonRecord(wire) && isJsonRecord(wire.profile) ? wire.profile.social : undefined;
    expect(isJsonRecord(servedSocial) && isJsonRecord(servedSocial.viewer)).toBe(true);
    expect(profile.social).toEqual(servedSocial);
    expect(profile).toMatchObject({ userId: OWNER_ID, name: "Ada", handle: null, isAgent: false, agentSlug: null, bio: "Cooks by the Moon.", dominantElement: "Water", avatarUrl: null });
    expect(profile.createdAt).toBe("2025-03-01T12:00:00.000Z");
    expect(profile.balances).toEqual({ spirit: 12.5, essence: 3, matter: 0, substance: 7.25 });
    expect(profile.natalPositions).toEqual([{ planet: "Sun", sign: "scorpio", degree: 21.4, minutes: 24 }, { planet: "Moon", sign: "virgo", degree: 3 }]);
    expect(profile.recentActivity.map((row) => row.id)).toEqual(["e1", "e2"]);
    expect(profile.recentActivity[1]?.metadataPayload).toBeNull();
    expect(profile.social).toEqual({ followers: 5, following: 3, commensals: 7, tablesHosted: 4, tablesJoined: 18, viewer: { follows: true, followedBy: false, isCommensal: false } });
    expect(profile.tasteGraph?.cuisines).toEqual([{ name: "Italian", score: 0.8 }]);
    expect(profile.dietary_preferences).toEqual({ restrictions: ["vegetarian"] });
    expect(profile.profile_layout).toEqual(["natalChart", "tasteGraph"]);
    expect(profile).not.toHaveProperty("shareIdentity");
    expect(profile).not.toHaveProperty("vessel");
    expect(profile.agentProfile).toBeNull();
  });

  it("the owner sees the identity toggle and no viewer block", async () => {
    mockViewer = OWNER_ID;
    const owner = profileOf((await fetchProfile(OWNER_ID)).parsed).profile;
    expect(owner.shareIdentity).toBe(true);
    expect(owner.social.viewer).toBeNull();
    mockProfileRows = [humanRow({ share_identity: false })];
    expect(profileOf((await fetchProfile(OWNER_ID)).parsed).profile.shareIdentity).toBe(false);
  });

  it("the owner's profile arrives WHOLE: 'Export JSON' serialises this object, so nothing the route served may be cut", async () => {
    mockViewer = OWNER_ID;
    mockProfileRows = [
      humanRow({
        natal_chart: { planets: { Sun: { sign: "scorpio", house: 8 } }, ascendant: "leo" },
        birth_data: { date: "1990-11-14", time: "08:30", location: "Lisbon" },
        natal_positions: [{ planet: "Sun", sign: "scorpio", degree: 21.4, minutes: 24, house: 8, retrograde: false }],
        dietary_preferences: { restrictions: ["vegetarian"], allergies: ["peanut"] },
      }),
    ];
    const { wire, parsed } = await fetchProfile(OWNER_ID);
    const served = isJsonRecord(wire) ? wire.profile : undefined;
    if (!isJsonRecord(served)) throw new Error("the route did not serve a profile");
    // The fixture really reached the wire, so the match below is not vacuous.
    expect(served).toHaveProperty("natalChart.ascendant", "leo");
    expect(served).toHaveProperty("birthData.location", "Lisbon");
    expect(served).toHaveProperty("tasteGraph.cuisines.0.score", 0.8);
    expect(served).toHaveProperty("tasteGraph.totalInteractions", 12);
    expect(served).toHaveProperty("natalPositions.0.house", 8);
    expect(served).toHaveProperty("dietary_preferences.allergies.0", "peanut");
    const { profile, issues } = profileOf(parsed);
    expect(issues).toEqual([]);
    // The one normalisation: a human's `vessel: null` becomes no key (the declared type has no null).
    const { vessel, ...rest } = served;
    expect(vessel).toBeNull();
    expect(profile).toMatchObject(rest);
    expect(profile).not.toHaveProperty("vessel");
  });

  it("tasteGraph is null on the wire when the computation fails: the declared client type had no null, the parsed profile has no key", async () => {
    mockTasteFails = true;
    const { wire, parsed } = await fetchProfile(OWNER_ID);
    expect(wire).toHaveProperty("profile.tasteGraph", null);
    expect(profileOf(parsed).profile).not.toHaveProperty("tasteGraph");
    expect(profileOf(parsed).issues).toEqual([]);
  });

  it("per-source isolation: a failed feed query and a missing balance row still give a whole profile", async () => {
    mockFeedFails = true;
    mockBalanceRows = [];
    const { profile, issues } = profileOf((await fetchProfile(OWNER_ID)).parsed);
    expect(profile.recentActivity).toEqual([]);
    expect(profile.balances).toEqual({ spirit: 0, essence: 0, matter: 0, substance: 0 });
    expect(issues).toEqual([]);
  });

  it("an agent from the DB with ASOL data: the vessel, the ASOL profile and the feeds survive", async () => {
    mockProfileRows = [humanRow({ email: "leonardo-da-vinci@agentic.alchm.kitchen", is_agent: true, name: "Leonardo", dominant_element: "Air" })];
    mockAsolProfile = ASOL;
    mockInteractions = [INTERACTION];
    mockActions = [ACTION];
    mockArtifacts = [ARTIFACT];
    const { profile, issues } = profileOf((await fetchProfile("leonardo-da-vinci")).parsed);
    expect(issues).toEqual([]);
    expect(profile.agentInteractions).toEqual([INTERACTION]);
    expect(profile.agentActions).toEqual([ACTION]);
    expect(profile.agentArtifacts).toEqual([ARTIFACT]);
    expect(profile).toMatchObject({ isAgent: true, handle: "leonardo-da-vinci@agentic.alchm.kitchen", agentSlug: "leonardo-da-vinci" });
    expect(profile.agentProfile).toEqual({ ...ASOL, consciousness: { ...ASOL.consciousness, dominantAlchemicalQuantity: "Spirit" } });
    expect(typeof profile.vessel?.level).toBe("number");
    expect(profile.vessel?.progressionStatus).toBe("estimated");
  });

  it("an agent the ASOL service does not know: the route SYNTHESISES a profile (route.ts:418-446) and it parses clean", async () => {
    mockProfileRows = [humanRow({ email: "ada-agent@agentic.alchm.kitchen", is_agent: true, name: "Ada Agent", bio: "Alchemist (Early Modern)", dominant_element: "Fire" })];
    const { profile, issues } = profileOf((await fetchProfile("ada-agent")).parsed);
    expect(issues).toEqual([]);
    expect(profile.agentProfile).toMatchObject({ name: "Ada Agent", title: "Alchemist", era: "Early Modern" });
    expect(profile.agentProfile?.consciousness?.dominantElement).toBe("Fire");
  });

  it("an external ASOL agent with no DB row: hard-coded social block, tasteGraph null on the wire, empty feeds", async () => {
    mockProfileRows = [];
    mockAsolProfile = { ...ASOL, name: "Hildegard of Bingen" };
    const { wire, parsed } = await fetchProfile("hildegard-of-bingen");
    expect(wire).toHaveProperty("profile.tasteGraph", null);
    const { profile, issues } = profileOf(parsed);
    expect(issues).toEqual([]);
    expect(profile.name).toBe("Hildegard of Bingen");
    expect(profile.social).toMatchObject({ followers: 108, following: 12, commensals: 7, viewer: null });
    expect(profile.agentInteractions).toEqual([]);
    expect(profile.vessel).toBeDefined();
  });

  it("an external ASOL agent whose consciousness omits dominantElement: the route sends Fire (never Spirit); the parse keeps the natal chart and the level", async () => {
    mockProfileRows = [];
    const natalChart = { planets: { Sun: { sign: "virgo" } } };
    mockAsolProfile = { name: "Hildegard of Bingen", consciousness: { level: "Master", natalChart } };
    const { wire, parsed } = await fetchProfile("hildegard-of-bingen");
    expect(wire).toHaveProperty("profile.dominantElement", "Fire");
    const { profile, issues } = profileOf(parsed);
    expect(profile.dominantElement).toBe("Fire");
    expect(profile.agentProfile?.consciousness).toStrictEqual({ dominantElement: "Fire", dominantAlchemicalQuantity: "Spirit", level: "Master", natalChart });
    expect(issues).toEqual(["agentProfile.consciousness.dominantElement: missing, defaulted to Fire"]);
  });

  it.each(["Spirit", "Essence"])(
    "an ASOL agent that sends the QUANTITY %s as its dominantElement: the route's top-level value and the parse answer Fire (the forwarded agentProfile still carries what the service sent), and nothing is mapped (Essence is not Water)",
    async (quantity) => {
      mockProfileRows = [];
      mockAsolProfile = { name: "Hildegard of Bingen", consciousness: { dominantElement: quantity, level: "Master" } };
      const { wire, parsed } = await fetchProfile("hildegard-of-bingen");
      expect(wire).toHaveProperty("profile.dominantElement", "Fire");
      // the route forwards the service's consciousness as it came; only the parse repairs it
      expect(wire).toHaveProperty("profile.agentProfile.consciousness.dominantElement", quantity);
      const { profile, issues } = profileOf(parsed);
      expect(profile.dominantElement).toBe("Fire");
      expect(profile.agentProfile?.consciousness).toStrictEqual({ dominantElement: "Fire", dominantAlchemicalQuantity: "Spirit", level: "Master" });
      expect(issues).toEqual(["agentProfile.consciousness.dominantElement: not Fire, Water, Earth or Air, defaulted to Fire"]);
    },
  );

  it("an ASOL agent that sends both readings keeps both: Water and Essence stay Water and Essence", async () => {
    mockProfileRows = [];
    mockAsolProfile = { name: "Hildegard of Bingen", consciousness: { dominantElement: "Water", dominantAlchemicalQuantity: "Essence" } };
    const { wire, parsed } = await fetchProfile("hildegard-of-bingen");
    expect(wire).toHaveProperty("profile.dominantElement", "Water");
    const { profile, issues } = profileOf(parsed);
    expect(profile.agentProfile?.consciousness).toStrictEqual({ dominantElement: "Water", dominantAlchemicalQuantity: "Essence" });
    expect(issues).toEqual([]);
  });

  it.each([["Spirit", "Fire"], ["Water", "Water"], [null, "Fire"]])(
    "an agent the ASOL service does not know, whose dominant_element column holds %j: the synthesised consciousness says %s (a quantity is never an element)",
    async (column, element) => {
      mockProfileRows = [humanRow({ email: "ada-agent@agentic.alchm.kitchen", is_agent: true, name: "Ada Agent", bio: "Alchemist (Early Modern)", dominant_element: column })];
      const { wire, parsed } = await fetchProfile("ada-agent");
      // the ROUTE synthesises it, so the wire itself must already say the element (the parse would repair a quantity)
      expect(wire).toHaveProperty("profile.agentProfile.consciousness.dominantElement", element);
      const { profile, issues } = profileOf(parsed);
      expect(issues).toEqual([]);
      expect(profile.agentProfile?.consciousness?.dominantElement).toBe(element);
      expect(profile.agentProfile?.consciousness?.dominantAlchemicalQuantity).toBe("Spirit");
    },
  );

  it.each([
    ["an unknown user", "ghost", async (): Promise<void> => { mockProfileRows = []; }, "Profile not found"],
    ["a database failure", OWNER_ID, async (): Promise<void> => { mockProfileFails = true; }, "Failed to load profile"],
  ])("%s: the route's refusal parses as a refusal carrying its own message", async (_name, userId, arrange, message): Promise<void> => {
    await arrange();
    const { status, parsed } = await fetchProfile(userId);
    expect(status).not.toBe(200);
    expect(parsed).toEqual({ kind: "refused", message });
  });
});
