/**
 * @jest-environment node
 *
 * Safety routes (docs/plans/pr3-messaging-plan.md §4): message DELETE
 * authorization, report filing, and the host-gated moderate route. The real
 * route handlers run against a mocked chatDatabaseService + auth.
 */

const mockChat = {
  softDeleteMessage: jest.fn(),
  reportMessage: jest.fn(),
  getMembership: jest.fn(),
  kickMember: jest.fn(),
  setHostMute: jest.fn(),
  archiveConversation: jest.fn(),
};

jest.mock("@/services/chatDatabaseService", () => ({ chatDatabase: mockChat }));

jest.mock("@/lib/redis", () => ({ getRedisClient: () => null }));

const mockGetUser = jest.fn();
const mockIsAdminEmail = jest.fn(() => false);
jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: (...a: unknown[]) => mockGetUser(...a),
}));
jest.mock("@/lib/auth/adminEmails", () => ({
  isAdminEmail: (...a: unknown[]) => mockIsAdminEmail(...a),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ status: init?.status ?? 200, json: async () => body })),
  },
}));

import { DELETE as deleteMessage } from "../messages/[id]/route";
import { POST as reportMessage } from "../messages/[id]/report/route";
import { POST as moderate } from "../conversations/[id]/moderate/route";

// Valid v4-shaped UUIDs (version nibble 4, variant nibble 8) so the routes'
// strict zod `.uuid()` accepts them.
const CURIE = "11111111-1111-4111-8111-111111111111";
const TESLA = "22222222-2222-4222-8222-222222222222";
const MSG = "66666666-6666-4666-8666-666666666666";
const CONV = "55555555-5555-4555-8555-555555555555";

function req(body: unknown = {}): any {
  return {
    url: "http://localhost/api/chat",
    method: "POST",
    json: async () => body,
    headers: { get: () => null },
    nextUrl: { pathname: "/api/chat" },
  };
}

const idParams = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ id: CURIE, email: "curie@example.com" });
  mockIsAdminEmail.mockReturnValue(false);
});

describe("DELETE /api/chat/messages/[id]", () => {
  it("401s an anonymous caller", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await deleteMessage(req(), idParams(MSG));
    expect(res.status).toBe(401);
    expect(mockChat.softDeleteMessage).not.toHaveBeenCalled();
  });

  it("403s when the service says forbidden (not sender/host/admin)", async () => {
    mockChat.softDeleteMessage.mockResolvedValue({ ok: false, reason: "forbidden" });
    const res = await deleteMessage(req(), idParams(MSG));
    expect(res.status).toBe(403);
  });

  it("passes isAdmin through for an admin caller", async () => {
    mockIsAdminEmail.mockReturnValue(true);
    mockChat.softDeleteMessage.mockResolvedValue({ ok: true });
    const res = await deleteMessage(req(), idParams(MSG));
    expect(res.status).toBe(200);
    expect(mockChat.softDeleteMessage).toHaveBeenCalledWith(MSG, CURIE, { isAdmin: true });
  });
});

describe("POST /api/chat/messages/[id]/report", () => {
  it("files a report and returns a NEUTRAL success (no hide state leaked)", async () => {
    mockChat.reportMessage.mockResolvedValue({ ok: true, alreadyReported: false, hidden: true });
    const res = await reportMessage(req({ reason: "harassment" }), idParams(MSG));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(data).not.toHaveProperty("hidden");
    expect(mockChat.reportMessage).toHaveBeenCalledWith(MSG, CURIE, "harassment", undefined);
  });

  it("rejects an invalid reason", async () => {
    const res = await reportMessage(req({ reason: "not-a-reason" }), idParams(MSG));
    expect(res.status).toBe(400);
    expect(mockChat.reportMessage).not.toHaveBeenCalled();
  });
});

describe("POST /api/chat/conversations/[id]/moderate — host-gated", () => {
  it("403s a non-host caller before any mutation", async () => {
    mockChat.getMembership.mockResolvedValue({ role: "member", leftAt: null, banned: false });
    const res = await moderate(req({ action: "kick", userId: TESLA }), idParams(CONV));
    expect(res.status).toBe(403);
    expect(mockChat.kickMember).not.toHaveBeenCalled();
  });

  it("lets the host kick a member", async () => {
    mockChat.getMembership.mockResolvedValue({ role: "host", leftAt: null, banned: false });
    mockChat.kickMember.mockResolvedValue(true);
    const res = await moderate(req({ action: "kick", userId: TESLA }), idParams(CONV));
    expect(res.status).toBe(200);
    expect(mockChat.kickMember).toHaveBeenCalledWith(CONV, TESLA);
  });

  it("computes a mute window from minutes", async () => {
    mockChat.getMembership.mockResolvedValue({ role: "host", leftAt: null, banned: false });
    mockChat.setHostMute.mockResolvedValue(true);
    const res = await moderate(req({ action: "mute", userId: TESLA, minutes: 30 }), idParams(CONV));
    expect(res.status).toBe(200);
    const [, target, until] = mockChat.setHostMute.mock.calls[0];
    expect(target).toBe(TESLA);
    expect(typeof until).toBe("string");
    expect(new Date(until as string).getTime()).toBeGreaterThan(Date.now());
  });

  it("refuses a host moderating themselves", async () => {
    mockChat.getMembership.mockResolvedValue({ role: "host", leftAt: null, banned: false });
    const res = await moderate(req({ action: "kick", userId: CURIE }), idParams(CONV));
    expect(res.status).toBe(400);
    expect(mockChat.kickMember).not.toHaveBeenCalled();
  });

  it("archives on the archive action", async () => {
    mockChat.getMembership.mockResolvedValue({ role: "host", leftAt: null, banned: false });
    mockChat.archiveConversation.mockResolvedValue(true);
    const res = await moderate(req({ action: "archive" }), idParams(CONV));
    expect(res.status).toBe(200);
    expect(mockChat.archiveConversation).toHaveBeenCalledWith(CONV);
  });
});
