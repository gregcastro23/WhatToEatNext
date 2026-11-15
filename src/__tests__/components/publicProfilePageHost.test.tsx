/**
 * The public profile PAGE's own load() flow: what it does with each kind of
 * answer from GET /api/users/[userId] now that the body goes through
 * `readJson(res, parsePublicProfileResponse)`. Children are stubbed so the page's
 * decisions are what is under test (a refusal shows the producer's message; a
 * profile renders; malformed sections are LOGGED, not shown; an unreadable body
 * is "Network error"); the wires are literals because producer fidelity is the
 * job of src/components/profile/__tests__/publicProfileParser.test.ts, which
 * drives the real route handler.
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Page from "@/app/(alchm)/profile/[userId]/page";

const mockLogged: unknown[][] = [];

jest.mock("framer-motion", () => ({
  motion: { div: ({ children }: { children?: React.ReactNode }): React.ReactElement => React.createElement("div", null, children) },
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children?: React.ReactNode }): React.ReactElement => React.createElement("a", { href }, children),
}));
jest.mock("next/navigation", () => ({ useParams: (): { userId: string } => ({ userId: "ada" }) }));
jest.mock("next-auth/react", () => ({ useSession: (): { data: { user: { id: string } } } => ({ data: { user: { id: "someone-else" } } }) }));
jest.mock("@/lib/logger", () => ({
  _logger: { info: (): void => undefined, warn: (): void => undefined, error: (...args: unknown[]): void => { mockLogged.push(args); } },
}));
jest.mock("@/components/Header", () => ({ __esModule: true, default: (): null => null }));
jest.mock("@/components/menu-planner/redesign/AgentProfileWeekCard", () => ({ __esModule: true, default: (): null => null }));
jest.mock("@/components/profile/CustomizeDrawer", () => ({ CustomizeDrawer: (): null => null }));
jest.mock("@/components/profile/LiveAgentFeed", () => ({ LiveAgentFeed: (): null => null }));
jest.mock("@/components/profile/ProfileBlockRegistry", () => ({ PROFILE_BLOCKS: {} }));
jest.mock("@/components/profile/tables/FollowListSheet", () => ({ FollowListSheet: (): null => null }));
jest.mock("@/components/profile/tables/TableMemoriesGallery", () => ({ TableMemoriesGallery: (): null => null }));
jest.mock("@/components/profile/tables/CosmicIdentityPanel", () => ({
  CosmicIdentityPanel: ({ elementalAffinities }: { elementalAffinities?: Record<string, number> }): React.ReactElement =>
    React.createElement("p", null, `AFFINITIES:${JSON.stringify(elementalAffinities ?? null)}`),
}));
jest.mock("@/components/profile/tables/ProfileStatsPanel", () => ({
  ProfileStatsPanel: ({ social }: { social: { followers: number } }): React.ReactElement =>
    React.createElement("p", null, `FOLLOWERS:${social.followers}`),
}));
jest.mock("@/components/profile/tables/ProfileIdentityPanel", () => ({
  ProfileIdentityPanel: (props: { name: string; bio: string | null; natalPositions: unknown[] }): React.ReactElement =>
    React.createElement("p", null, `IDENTITY:${props.name}|${props.bio ?? "no bio"}|${props.natalPositions.length} placements`),
}));
jest.mock("@/app/(alchm)/profile/[userId]/AgentProfile", () => ({
  __esModule: true,
  default: (props: { agent: { name: string }; interactions?: unknown[]; vessel?: { level: number } | null }): React.ReactElement =>
    React.createElement("p", null, `AGENT:${props.agent.name}|${props.interactions?.length ?? "none"} interactions|vessel ${props.vessel?.level ?? "none"}`),
}));

const originalFetch = globalThis.fetch;

function wireProfile(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    userId: "u-1", handle: null, name: "Ada", isAgent: false, avatarUrl: null,
    social: { followers: 5, following: 3, commensals: 7, tablesHosted: 4, tablesJoined: 18, viewer: null },
    agentSlug: null, agentProfile: null, vessel: null, agentInteractions: [], agentActions: [], agentArtifacts: [],
    bio: "Cooks.", dominantElement: "Water", natalPositions: [{ planet: "Sun", sign: "scorpio", degree: 21.4 }],
    dietary_preferences: {}, profile_layout: ["natalChart"], tasteGraph: { elementalAffinities: { Fire: 0.3, Water: 0.7 } },
    createdAt: "2025-03-01T12:00:00.000Z", balances: { spirit: 1, essence: 2, matter: 3, substance: 4 }, recentActivity: [],
    ...overrides,
  };
}

function answerWith(body: string, status = 200): void {
  globalThis.fetch = (): Promise<Response> => Promise.resolve(new Response(body, { status, headers: { "Content-Type": "application/json" } }));
}

function answerProfile(overrides: Record<string, unknown> = {}, status = 200): void {
  answerWith(JSON.stringify({ success: true, profile: wireProfile(overrides) }), status);
}

async function shown(text: string): Promise<void> {
  await waitFor(() => expect(screen.getByText(text)).not.toBeNull());
}

beforeEach(() => {
  mockLogged.length = 0;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("PublicProfilePage load() over the parsed response", () => {
  it("a profile renders through the identity, stats and cosmic panels, and logs nothing", async () => {
    answerProfile();
    render(<Page />);
    await shown("IDENTITY:Ada|Cooks.|1 placements");
    expect(screen.getByText("FOLLOWERS:5")).not.toBeNull();
    expect(screen.getByText('AFFINITIES:{"Fire":0.3,"Water":0.7}')).not.toBeNull();
    expect(mockLogged).toEqual([]);
  });

  it("an enriched agent renders AgentProfile with the parsed feeds and vessel", async () => {
    answerProfile({
      isAgent: true, agentSlug: "ada", handle: "ada@agentic.alchm.kitchen",
      agentProfile: { name: "Ada Lovelace" },
      agentInteractions: [{ id: "i1", kind: "agent_to_user", counterparty: { name: "x" }, topic: "t", messagePreview: "p", messageCount: 1, startedAt: "s", lastTurnAt: "l", chatThread: "c" }],
    });
    render(<Page />);
    await shown("AGENT:Ada Lovelace|1 interactions|vessel none");
  });

  it.each([
    ["the producer's 404 message", JSON.stringify({ success: false, message: "Profile not found" }), 404, "Profile not found"],
    ["a refusal without a message", JSON.stringify({ success: false }), 500, "Profile unavailable"],
    ["a refusal with a non-string message", JSON.stringify({ success: false, message: 404 }), 500, "Profile unavailable"],
    ["success true but no profile object", JSON.stringify({ success: true }), 200, "Profile unavailable"],
  ])("%s is shown as the error", async (_name, body, status, expected): Promise<void> => {
    answerWith(body, status);
    render(<Page />);
    await shown(expected);
  });

  it("a valid profile that arrives with a non-2xx status is NOT rendered: the page shows 'Profile unavailable'", async () => {
    answerProfile({}, 502);
    render(<Page />);
    await shown("Profile unavailable");
    expect(screen.queryByText(/IDENTITY:/)).toBeNull();
  });

  it.each([
    ["a body that is not JSON", "<html>502</html>"],
    ["a JSON null body", "null"],
    ["a profile whose identity is unreadable", JSON.stringify({ success: true, profile: wireProfile({ userId: 5 }) })],
    ["a profile without balances", JSON.stringify({ success: true, profile: wireProfile({ balances: null }) })],
  ])("%s is 'Network error'", async (_name, body): Promise<void> => {
    answerWith(body);
    render(<Page />);
    await shown("Network error");
  });

  it("a rejected fetch is 'Network error'", async () => {
    globalThis.fetch = (): Promise<Response> => Promise.reject(new TypeError("Failed to fetch"));
    render(<Page />);
    await shown("Network error");
  });

  it("malformed sections are LOGGED once with their reasons while the profile still renders", async () => {
    answerProfile({ natalPositions: { Sun: { sign: "scorpio" } }, recentActivity: "none" });
    render(<Page />);
    await shown("IDENTITY:Ada|Cooks.|0 placements");
    expect(mockLogged).toHaveLength(1);
    expect(mockLogged[0]?.[0]).toBe("Profile page: dropped malformed parts of the profile response:");
    expect(mockLogged[0]?.[1]).toEqual(["natalPositions: not an array, ignored", "recentActivity: not an array, treated as empty"]);
  });
});
