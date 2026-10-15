/** @jest-environment node */
import { NextRequest } from "next/server";
import { POST, DELETE } from "../route";

const mockAuth = jest.fn();
const mockQuery = jest.fn();
jest.mock("@/lib/auth/auth", () => ({ auth: () => mockAuth() }));
jest.mock("@/lib/database/connection", () => ({ executeQuery: (...args: unknown[]) => mockQuery(...args) }));
jest.mock("@/services/QuestService", () => ({ questService: { reportEvent: jest.fn() } }));
jest.mock("@/services/userInteractionsService", () => ({ recordInteraction: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue({ user: { id: "authenticated-human" } });
});
it.each([{ source: "saved-adaptation", payload: {} }, { source: "import", payload: { kind: "saved-adaptation" } }])("rejects forged provenance at generic custom creation before a write %#", async body => {
  const response = await POST(new NextRequest("http://localhost/api/users/me/recipes/custom", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Forged version", ...body }) }));
  expect(response.status).toBe(400);
  expect(mockQuery).not.toHaveBeenCalled();
});
it("refuses deletion of an immutable saved adaptation while preserving normal deletion", async () => {
  const request = new NextRequest("http://localhost/api/users/me/recipes/custom?id=33333333-3333-4333-8333-333333333333", { method: "DELETE" });
  mockQuery.mockResolvedValueOnce({ rows: [{ immutable: true }] });
  expect((await DELETE(request)).status).toBe(409);
  expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("COALESCE(payload->>'kind','')<>$3"), [expect.any(String), "authenticated-human", "saved-adaptation"]);
  mockQuery.mockResolvedValueOnce({ rows: [{ immutable: false }] });
  expect((await DELETE(request)).status).toBe(200);
});
