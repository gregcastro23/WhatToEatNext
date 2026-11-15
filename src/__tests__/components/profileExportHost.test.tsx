/**
 * The owner's "Export JSON" button over the REAL profile page, the REAL block
 * registry and the REAL DataPrivacyBlock.
 *
 * The button downloads `JSON.stringify(data)` where `data` is the page's profile
 * state. Before the wire parser that state was the raw API object, so the download
 * held everything the route served (the natal chart, the birth data, every taste
 * graph key, every key of a natal placement...). The state is now the PARSED
 * profile; this pins that the download still carries all of it. The wire is a
 * literal shaped like the route's DB-path answer (route.ts:501-545);
 * src/components/profile/__tests__/publicProfileParser.test.ts drives the real
 * handler for the same property.
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Page from "@/app/(alchm)/profile/[userId]/page";
import { isJsonRecord } from "@/lib/api/json";

jest.mock("framer-motion", () => ({
  motion: { div: ({ children }: { children?: React.ReactNode }): React.ReactElement => React.createElement("div", null, children) },
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children?: React.ReactNode }): React.ReactElement => React.createElement("a", { href }, children),
}));
jest.mock("next/navigation", () => ({ useParams: (): { userId: string } => ({ userId: "ada" }) }));
// The session user IS the profile's user: the page treats the viewer as the owner.
jest.mock("next-auth/react", () => ({ useSession: (): { data: { user: { id: string } } } => ({ data: { user: { id: "u-1" } } }) }));
jest.mock("@/lib/logger", () => ({ _logger: { info: (): void => undefined, warn: (): void => undefined, error: (): void => undefined } }));
jest.mock("@/components/Header", () => ({ __esModule: true, default: (): null => null }));
jest.mock("@/components/menu-planner/redesign/AgentProfileWeekCard", () => ({ __esModule: true, default: (): null => null }));
jest.mock("@/components/profile/CustomizeDrawer", () => ({ CustomizeDrawer: (): null => null }));
jest.mock("@/components/profile/LiveAgentFeed", () => ({ LiveAgentFeed: (): null => null }));
jest.mock("@/components/profile/tables/FollowListSheet", () => ({ FollowListSheet: (): null => null }));
jest.mock("@/components/profile/tables/TableMemoriesGallery", () => ({ TableMemoriesGallery: (): null => null }));
jest.mock("@/components/profile/tables/CosmicIdentityPanel", () => ({ CosmicIdentityPanel: (): null => null }));
jest.mock("@/components/profile/tables/ProfileStatsPanel", () => ({ ProfileStatsPanel: (): null => null }));
jest.mock("@/components/profile/tables/ProfileIdentityPanel", () => ({ ProfileIdentityPanel: (): null => null }));
jest.mock("@/app/(alchm)/profile/[userId]/AgentProfile", () => ({ __esModule: true, default: (): null => null }));

const DOWNLOAD_PREFIX = "data:text/json;charset=utf-8,";
const originalFetch = globalThis.fetch;
let downloads: string[] = [];
let clickSpy: jest.SpyInstance | null = null;

/** The owner's DB-path profile, with extras at every level the parser narrows. */
function servedProfile(): Record<string, unknown> {
  return {
    userId: "u-1",
    handle: null,
    name: "Ada",
    isAgent: false,
    avatarUrl: null,
    social: { followers: 5, following: 3, commensals: 7, tablesHosted: 4, tablesJoined: 18, viewer: null },
    shareIdentity: true,
    agentSlug: null,
    agentProfile: null,
    vessel: null,
    agentInteractions: [],
    agentActions: [],
    agentArtifacts: [],
    bio: "Cooks by the Moon.",
    dominantElement: "Water",
    natalChart: { planets: { Sun: { sign: "scorpio", house: 8 } }, ascendant: "leo" },
    natalPositions: [{ planet: "Sun", sign: "scorpio", degree: 21.4, minutes: 24, house: 8, retrograde: false }],
    birthData: { date: "1990-11-14", time: "08:30", location: "Lisbon" },
    dietary_preferences: { restrictions: ["vegetarian"], allergies: ["peanut"] },
    profile_layout: ["dataPrivacy"],
    tasteGraph: {
      cuisines: [{ name: "Italian", score: 0.8 }],
      elementalAffinities: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
      complexityPreference: "moderate",
      confidence: 0.4,
      totalInteractions: 12,
    },
    createdAt: "2025-03-01T12:00:00.000Z",
    balances: { spirit: 12.5, essence: 3, matter: 0, substance: 7.25 },
    recentActivity: [{ id: "e1", eventType: "recipe_review", metadataPayload: { rating: 5 }, createdAt: "2025-11-01T08:00:00.000Z" }],
  };
}

beforeEach(() => {
  downloads = [];
  // jsdom cannot navigate to a data: URL; capture what the button asked the browser to download.
  clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement): void {
    downloads.push(this.getAttribute("href") ?? "");
  });
});

afterEach(() => {
  clickSpy?.mockRestore();
  globalThis.fetch = originalFetch;
});

async function exportAsOwner(wire: Record<string, unknown>): Promise<unknown> {
  globalThis.fetch = (): Promise<Response> =>
    Promise.resolve(new Response(JSON.stringify({ success: true, profile: wire }), { status: 200, headers: { "Content-Type": "application/json" } }));
  render(<Page />);
  fireEvent.click(await screen.findByText("Practice"));
  fireEvent.click(await screen.findByText("Export JSON"));
  await waitFor(() => expect(downloads).toHaveLength(1));
  const href = downloads[0] ?? "";
  expect(href.startsWith(DOWNLOAD_PREFIX)).toBe(true);
  const exported: unknown = JSON.parse(decodeURIComponent(href.slice(DOWNLOAD_PREFIX.length)));
  return exported;
}

describe("the owner's profile export over the parsed profile", () => {
  it("downloads everything the route served: the natal chart, the birth data and every nested key survive", async () => {
    const wire = servedProfile();
    const exported = await exportAsOwner(wire);
    if (!isJsonRecord(exported)) throw new Error("the download was not a JSON object");
    expect(exported).toHaveProperty("natalChart.ascendant", "leo");
    expect(exported).toHaveProperty("birthData.location", "Lisbon");
    expect(exported).toHaveProperty("tasteGraph.cuisines.0.score", 0.8);
    expect(exported).toHaveProperty("tasteGraph.totalInteractions", 12);
    expect(exported).toHaveProperty("natalPositions.0.house", 8);
    expect(exported).toHaveProperty("dietary_preferences.allergies.0", "peanut");
    // The one documented difference: a human's wire `vessel: null` (the route always sends it) is no key in the state.
    const { vessel, ...served } = wire;
    expect(vessel).toBeNull();
    expect(exported).not.toHaveProperty("vessel");
    expect(exported).toMatchObject(served);
    // ...and nothing else was added: the download has exactly the other served keys.
    expect(Object.keys(exported).sort()).toEqual(Object.keys(served).sort());
  });
});
