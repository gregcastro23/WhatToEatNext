/**
 * @jest-environment jsdom
 *
 * useConversation (docs/plans/pr3-messaging-plan.md §5): loads newest-first
 * and stores oldest-first, resolves viewerId from the response, sends
 * optimistically with a clientKey, and paginates by keyset.
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useConversation } from "@/hooks/useConversation";
import type { ChatMessage } from "@/types/chat";

const CURIE = "11111111-1111-4111-8111-111111111111";
const TESLA = "22222222-2222-4222-8222-222222222222";
const CONV = "55555555-5555-4555-8555-555555555555";

function msg(id: string, createdAt: string, senderId = TESLA): ChatMessage {
  return {
    id,
    conversationId: CONV,
    senderId,
    body: `body-${id}`,
    attachments: [],
    createdAt,
    editedAt: null,
    deletedAt: null,
  };
}

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  (global as any).fetch = fetchMock;
});

function jsonResponse(body: unknown, ok = true, statusCode = 200) {
  return { ok, status: statusCode, json: async () => body };
}

describe("useConversation", () => {
  it("loads newest-first from the API and exposes it oldest-first with viewerId", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        // API returns newest-first
        messages: [msg("m2", "2026-07-11T02:00:00Z"), msg("m1", "2026-07-11T01:00:00Z")],
        nextCursor: null,
        viewerId: CURIE,
      }),
    );

    const { result } = renderHook(() => useConversation(CONV));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.messages.map((m) => m.id)).toEqual(["m1", "m2"]); // oldest-first
    expect(result.current.viewerId).toBe(CURIE);
    expect(result.current.hasMore).toBe(false);
  });

  it("optimistically appends a sent message and posts a clientKey", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ messages: [], nextCursor: null, viewerId: CURIE }));

    const { result } = renderHook(() => useConversation(CONV));
    await waitFor(() => expect(result.current.loading).toBe(false));

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: msg("m9", "2026-07-11T03:00:00Z", CURIE) }, true, 201),
    );

    await act(async () => {
      const ok = await result.current.send("Radium risotto");
      expect(ok).toBe(true);
    });

    expect(result.current.messages.map((m) => m.id)).toEqual(["m9"]);
    const sendCall = fetchMock.mock.calls.find(([url, init]) =>
      String(url).endsWith(`/messages`) && (init as RequestInit)?.method === "POST",
    );
    expect(sendCall).toBeTruthy();
    const sentBody = JSON.parse((sendCall![1] as RequestInit).body as string);
    expect(sentBody.body).toBe("Radium risotto");
    expect(typeof sentBody.clientKey).toBe("string");
  });

  it("surfaces a 403 as an unavailable-conversation error", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 403));

    const { result } = renderHook(() => useConversation(CONV));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/not available/i);
  });
});
