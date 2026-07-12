/**
 * @jest-environment node
 *
 * Send-pipeline orchestration (docs/plans/pr3-messaging-plan.md §3): the
 * pipeline gathers facts, runs enforcement, stores the photo, inserts
 * idempotently. Every collaborator is mocked so this asserts ORCHESTRATION
 * (order, gating, the DM-only relationship lookups).
 */

const mockGetConversationById = jest.fn();
const mockGetMembership = jest.fn();
const mockIsBlockedBetween = jest.fn();
const mockHasAccepted = jest.fn();
const mockGetMessageConversationId = jest.fn();
const mockInsertMessage = jest.fn();
const mockStoreChatPhoto = jest.fn();

jest.mock("@/services/chatDatabaseService", () => ({
  chatDatabase: {
    getConversationById: (...a: unknown[]) => mockGetConversationById(...a),
    getMembership: (...a: unknown[]) => mockGetMembership(...a),
    isBlockedBetween: (...a: unknown[]) => mockIsBlockedBetween(...a),
    hasAcceptedCommensalship: (...a: unknown[]) => mockHasAccepted(...a),
    getMessageConversationId: (...a: unknown[]) => mockGetMessageConversationId(...a),
    insertMessage: (...a: unknown[]) => mockInsertMessage(...a),
    getNotifiableRecipients: jest.fn().mockResolvedValue([]),
    countDistinctSenders: jest.fn().mockResolvedValue(1),
  },
}));

jest.mock("@/lib/feed/cookPhotoStorage", () => ({
  storeChatPhoto: (...a: unknown[]) => mockStoreChatPhoto(...a),
}));

// Post-insert hooks (practices + notifications) are covered in
// chatPractices.test.ts / chatNotificationDedup.test.ts; stub them here so the
// send-orchestration assertions don't reach a real DB.
jest.mock("@/services/practiceRewardService", () => ({
  practiceRewardService: { recognize: jest.fn().mockResolvedValue({ rewarded: false }) },
}));
jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: { createOrBumpEventNotification: jest.fn().mockResolvedValue(null) },
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const flagState = { dms: false, circles: false };
jest.mock("@/lib/chat/flags", () => ({
  isDmsEnabledServer: () => flagState.dms,
  isCirclesEnabledServer: () => flagState.circles,
}));

import { sendChatMessage } from "@/lib/chat/sendMessage";

const CURIE = "11111111-1111-1111-1111-111111111111";
const TESLA = "22222222-2222-2222-2222-222222222222";
const CONV = "55555555-5555-5555-5555-555555555555";

const activeMember = { leftAt: null, banned: false, mutedByHostUntil: null, role: "member" };

function tableConversation() {
  return { id: CONV, kind: "table", archivedAt: null };
}

function dmConversation() {
  return { id: CONV, kind: "dm", dmUserLo: CURIE, dmUserHi: TESLA, archivedAt: null };
}

function insertedMessage(replay = false) {
  return {
    replay,
    message: { id: "msg-1", conversationId: CONV, senderId: CURIE, body: "hi", attachments: [] },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  flagState.dms = false;
  flagState.circles = false;
  mockGetMembership.mockResolvedValue(activeMember);
  mockIsBlockedBetween.mockResolvedValue(false);
  mockHasAccepted.mockResolvedValue(false);
  mockInsertMessage.mockResolvedValue(insertedMessage());
});

describe("table sends", () => {
  it("inserts a table message without any relationship lookups", async () => {
    mockGetConversationById.mockResolvedValue(tableConversation());

    const outcome = await sendChatMessage({
      conversationId: CONV,
      senderId: CURIE,
      body: "The stew is ready",
    });

    expect(outcome.ok).toBe(true);
    expect(mockInsertMessage).toHaveBeenCalledTimes(1);
    // Table sends never consult block / accepted-commensalship.
    expect(mockIsBlockedBetween).not.toHaveBeenCalled();
    expect(mockHasAccepted).not.toHaveBeenCalled();
  });

  it("404s when the conversation is missing", async () => {
    mockGetConversationById.mockResolvedValue(null);
    const outcome = await sendChatMessage({ conversationId: CONV, senderId: CURIE, body: "x" });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.status).toBe(404);
    expect(mockInsertMessage).not.toHaveBeenCalled();
  });

  it("denies a non-member with 403 before inserting", async () => {
    mockGetConversationById.mockResolvedValue(tableConversation());
    mockGetMembership.mockResolvedValue(null);
    const outcome = await sendChatMessage({ conversationId: CONV, senderId: CURIE, body: "x" });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.status).toBe(403);
    expect(mockInsertMessage).not.toHaveBeenCalled();
  });
});

describe("DM relationship gating", () => {
  it("blocks a DM in either direction (403, neutral) and never inserts", async () => {
    flagState.dms = true;
    mockGetConversationById.mockResolvedValue(dmConversation());
    mockIsBlockedBetween.mockResolvedValue(true);
    mockHasAccepted.mockResolvedValue(true);

    const outcome = await sendChatMessage({ conversationId: CONV, senderId: CURIE, body: "hi" });

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.status).toBe(403);
    expect(mockIsBlockedBetween).toHaveBeenCalledWith(CURIE, TESLA);
    expect(mockInsertMessage).not.toHaveBeenCalled();
  });

  it("gates a DM to accepted commensals (403) even with the flag on", async () => {
    flagState.dms = true;
    mockGetConversationById.mockResolvedValue(dmConversation());
    mockHasAccepted.mockResolvedValue(false);

    const outcome = await sendChatMessage({ conversationId: CONV, senderId: CURIE, body: "hi" });

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.status).toBe(403);
  });

  it("denies a DM when the flag is OFF (default) regardless of relationship", async () => {
    flagState.dms = false;
    mockGetConversationById.mockResolvedValue(dmConversation());
    mockHasAccepted.mockResolvedValue(true);

    const outcome = await sendChatMessage({ conversationId: CONV, senderId: CURIE, body: "hi" });

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.status).toBe(403);
  });

  it("allows a DM with flag on + accepted + unblocked", async () => {
    flagState.dms = true;
    mockGetConversationById.mockResolvedValue(dmConversation());
    mockHasAccepted.mockResolvedValue(true);
    mockIsBlockedBetween.mockResolvedValue(false);

    const outcome = await sendChatMessage({ conversationId: CONV, senderId: CURIE, body: "hi" });

    expect(outcome.ok).toBe(true);
    expect(mockInsertMessage).toHaveBeenCalledTimes(1);
  });
});

describe("photo attachment", () => {
  it("validates shape/size then persists to chat-photos/<userId>/ before inserting", async () => {
    mockGetConversationById.mockResolvedValue(tableConversation());
    mockStoreChatPhoto.mockResolvedValue("https://assets.alchm.kitchen/chat-photos/x/abc.jpg");

    const outcome = await sendChatMessage({
      conversationId: CONV,
      senderId: CURIE,
      body: "",
      attachmentDataUrl: `data:image/jpeg;base64,${"A".repeat(400)}`,
    });

    expect(outcome.ok).toBe(true);
    expect(mockStoreChatPhoto).toHaveBeenCalledWith(CURIE, expect.stringContaining("data:image/jpeg"));
    const insertArg = mockInsertMessage.mock.calls[0][0];
    expect(insertArg.attachments).toEqual([
      { type: "photo", url: "https://assets.alchm.kitchen/chat-photos/x/abc.jpg" },
    ]);
  });

  it("rejects a malformed / oversized photo (400) without storing", async () => {
    mockGetConversationById.mockResolvedValue(tableConversation());
    const outcome = await sendChatMessage({
      conversationId: CONV,
      senderId: CURIE,
      body: "",
      attachmentDataUrl: "data:text/html;base64,PGI+",
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.status).toBe(400);
    expect(mockStoreChatPhoto).not.toHaveBeenCalled();
  });
});

describe("idempotent replay", () => {
  it("returns the original message and reports replay=true", async () => {
    mockGetConversationById.mockResolvedValue(tableConversation());
    mockInsertMessage.mockResolvedValue(insertedMessage(true));

    const outcome = await sendChatMessage({
      conversationId: CONV,
      senderId: CURIE,
      body: "hi",
      clientKey: "ck-1",
    });

    expect(outcome.ok).toBe(true);
    if (outcome.ok) expect(outcome.replay).toBe(true);
  });
});
