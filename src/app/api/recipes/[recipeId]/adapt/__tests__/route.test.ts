/** @jest-environment node */
import { NextRequest } from "next/server";
import { POST } from "../route";
import { AdaptationConflict, AdaptationUnavailable } from "@/lib/recipes/adaptationAgentBasis";
import { REQUEST, SOURCE_ID, savedFixture } from "@/lib/recipes/__tests__/helpers/adaptationFixtures";

const mockAuth = jest.fn();
const mockLimit = jest.fn();
const mockCreate = jest.fn();
jest.mock("@/lib/auth/validateRequest", () => ({ getUserIdFromRequest: (...args: unknown[]) => mockAuth(...args) }));
jest.mock("@/lib/rateLimit", () => ({ rateLimit: (...args: unknown[]) => mockLimit(...args) }));
jest.mock("@/lib/recipes/savedAdaptationService", () => ({ createSavedAdaptation: (...args: unknown[]) => mockCreate(...args) }));

function request(body: unknown = REQUEST): NextRequest {
  return new NextRequest(`http://localhost/api/recipes/${SOURCE_ID}/adapt`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
async function post(body?: unknown): Promise<Response> {
  return POST(request(body), { params: Promise.resolve({ recipeId: SOURCE_ID }) });
}
beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue("authenticated-requester");
  mockLimit.mockResolvedValue({ allowed: true, resetMs: 60000 });
  mockCreate.mockResolvedValue({ success: true, version: savedFixture(), publication: "not-published" });
});

it("requires authenticated identity and enforces its actor rate limit", async () => {
  mockAuth.mockResolvedValueOnce(null);
  expect((await post()).status).toBe(401);
  expect(mockCreate).not.toHaveBeenCalled();
  mockLimit.mockResolvedValueOnce({ allowed: false, resetMs: 2500 });
  const limited = await post();
  expect(limited.status).toBe(429);
  expect(limited.headers.get("Retry-After")).toBe("3");
  expect(mockLimit).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ identifier: "authenticated-requester" }));
});

it.each([{}, { ...REQUEST, clientRequestId: "bad" }, { ...REQUEST, agentSlug: "unconfigured-agent" }, { ...REQUEST, mode: "vegan" }])("rejects malformed request before any saved replay %#", async body => {
  expect((await post(body)).status).toBe(400);
  expect(mockCreate).not.toHaveBeenCalled();
});

it("rejects invalid JSON and ignores client supplied identity/chart/preferences", async () => {
  const bad = new NextRequest("http://localhost/api/recipes/x/adapt", { method: "POST", body: "not JSON" });
  expect((await POST(bad, { params: Promise.resolve({ recipeId: SOURCE_ID }) })).status).toBe(400);
  const result = await post({ ...REQUEST, requesterId: "attacker", actorId: "attacker", chart: PLANTED_CHART, preferences: { favoriteFoods: ["invented"] } });
  expect(result.status).toBe(200);
  expect(mockCreate).toHaveBeenCalledWith("authenticated-requester", SOURCE_ID, REQUEST);
});
const PLANTED_CHART = { planets: [{ name: "Sun", sign: "invented", degree: 999 }] };

it.each([[new AdaptationConflict("changed request"), 409], [new AdaptationUnavailable("Live reasoning unavailable"), 422], [new Error("storage connection lost"), 503]])("reports an explicit failure status and no invented success %#", async (error, status) => {
  mockCreate.mockRejectedValueOnce(error);
  const result = await post();
  expect(result.status).toBe(status);
  expect(await result.json()).toMatchObject({ success: false, error: expect.any(String) });
});

it("validates consumed success fields before sending a 2xx", async () => {
  mockCreate.mockResolvedValueOnce({ success: true, version: { recipe: {} }, publication: "published" });
  const result = await post();
  expect(result.status).toBe(502);
  expect(await result.json()).toMatchObject({ success: false });
});
