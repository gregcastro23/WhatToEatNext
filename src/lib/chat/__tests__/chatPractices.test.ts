/**
 * @jest-environment node
 *
 * Chat economy practices (docs/plans/pr3-messaging-plan.md §7): a table send
 * recognizes table_toasted for the sender; a DM send recognizes
 * dm_thread_started for BOTH parties only once the thread is two-way. Both are
 * SERVER_ONLY and ambient.
 */

import { SERVER_ONLY_PRACTICES } from "@/lib/economy/practices";

const mockRecognize = jest.fn().mockResolvedValue({ rewarded: false });
const mockCountDistinctSenders = jest.fn();

const mockChat = {
  getConversationById: jest.fn(),
  getMembership: jest.fn().mockResolvedValue({ leftAt: null, banned: false, mutedByHostUntil: null, role: "member" }),
  isBlockedBetween: jest.fn().mockResolvedValue(false),
  hasAcceptedCommensalship: jest.fn().mockResolvedValue(true),
  getMessageConversationId: jest.fn(),
  insertMessage: jest.fn(),
  getNotifiableRecipients: jest.fn().mockResolvedValue([]),
  countDistinctSenders: (...a: unknown[]) => mockCountDistinctSenders(...a),
};

jest.mock("@/services/chatDatabaseService", () => ({ chatDatabase: mockChat }));
jest.mock("@/services/practiceRewardService", () => ({
  practiceRewardService: { recognize: (...a: unknown[]) => mockRecognize(...a) },
}));
jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: { createOrBumpConversationNotification: jest.fn().mockResolvedValue(null) },
}));
jest.mock("@/lib/feed/cookPhotoStorage", () => ({ storeChatPhoto: jest.fn() }));
jest.mock("@/lib/chat/flags", () => ({
  isDmsEnabledServer: () => true,
  isCirclesEnabledServer: () => true,
}));
jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { sendChatMessage } from "@/lib/chat/sendMessage";

const CURIE = "11111111-1111-4111-8111-111111111111";
const TESLA = "22222222-2222-4222-8222-222222222222";
const CONV = "55555555-5555-4555-8555-555555555555";

beforeEach(() => {
  jest.clearAllMocks();
  mockChat.getMembership.mockResolvedValue({ leftAt: null, banned: false, mutedByHostUntil: null, role: "member" });
  mockChat.hasAcceptedCommensalship.mockResolvedValue(true);
  mockChat.isBlockedBetween.mockResolvedValue(false);
  mockChat.getNotifiableRecipients.mockResolvedValue([]);
  mockChat.insertMessage.mockResolvedValue({
    replay: false,
    message: { id: "m1", conversationId: CONV, senderId: CURIE, body: "hi", attachments: [] },
  });
});

const flush = () => new Promise((r) => setTimeout(r, 0));

it("registers both chat practices as SERVER_ONLY", () => {
  expect(SERVER_ONLY_PRACTICES.has("table_toasted")).toBe(true);
  expect(SERVER_ONLY_PRACTICES.has("dm_thread_started")).toBe(true);
});

it("recognizes table_toasted for the sender on a table send (target=conversationId)", async () => {
  mockChat.getConversationById.mockResolvedValue({ id: CONV, kind: "table", archivedAt: null });

  const outcome = await sendChatMessage({ conversationId: CONV, senderId: CURIE, body: "A toast!" });
  await flush();

  expect(outcome.ok).toBe(true);
  expect(mockRecognize).toHaveBeenCalledWith(CURIE, "table_toasted", CONV);
  // A table send never checks distinct senders.
  expect(mockCountDistinctSenders).not.toHaveBeenCalled();
});

it("rewards BOTH DM parties dm_thread_started once the thread is two-way", async () => {
  mockChat.getConversationById.mockResolvedValue({
    id: CONV,
    kind: "dm",
    dmUserLo: CURIE,
    dmUserHi: TESLA,
    archivedAt: null,
  });
  mockCountDistinctSenders.mockResolvedValue(2);

  const outcome = await sendChatMessage({ conversationId: CONV, senderId: TESLA, body: "replying" });
  await flush();

  expect(outcome.ok).toBe(true);
  expect(mockRecognize).toHaveBeenCalledWith(CURIE, "dm_thread_started", CONV);
  expect(mockRecognize).toHaveBeenCalledWith(TESLA, "dm_thread_started", CONV);
});

it("does NOT reward dm_thread_started while the opener is unanswered (one distinct sender)", async () => {
  mockChat.getConversationById.mockResolvedValue({
    id: CONV,
    kind: "dm",
    dmUserLo: CURIE,
    dmUserHi: TESLA,
    archivedAt: null,
  });
  mockCountDistinctSenders.mockResolvedValue(1);

  await sendChatMessage({ conversationId: CONV, senderId: CURIE, body: "opener" });
  await flush();

  expect(mockRecognize).not.toHaveBeenCalledWith(expect.anything(), "dm_thread_started", expect.anything());
});

it("does not run practices for a clientKey replay", async () => {
  mockChat.getConversationById.mockResolvedValue({ id: CONV, kind: "table", archivedAt: null });
  mockChat.insertMessage.mockResolvedValue({
    replay: true,
    message: { id: "m1", conversationId: CONV, senderId: CURIE, body: "hi", attachments: [] },
  });

  await sendChatMessage({ conversationId: CONV, senderId: CURIE, body: "hi", clientKey: "ck" });
  await flush();

  expect(mockRecognize).not.toHaveBeenCalled();
});
