import { resolveAgentsBridgeUser } from "@/lib/auth/agentsBridge";

const realFetch = global.fetch;

afterEach(() => {
  global.fetch = realFetch;
  jest.restoreAllMocks();
});

function mockFetch(impl: jest.Mock) {
  global.fetch = impl as unknown as typeof fetch;
}

describe("resolveAgentsBridgeUser", () => {
  it("skips the network hop when no agents cookie is present", async () => {
    const fetchMock = jest.fn();
    mockFetch(fetchMock);

    expect(await resolveAgentsBridgeUser(null)).toBeNull();
    expect(await resolveAgentsBridgeUser("")).toBeNull();
    expect(await resolveAgentsBridgeUser("authjs.session-token=abc")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resolves the agents session user and lower-cases the email", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: "agent_1", email: "Cook@Example.com", name: "Cook" },
      }),
    });
    mockFetch(fetchMock);

    const user = await resolveAgentsBridgeUser(
      "next-auth.session-token=xyz; other=1",
    );
    expect(user).toEqual({
      email: "cook@example.com",
      name: "Cook",
      image: null,
      agentsUserId: "agent_1",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("accepts the __Secure- prefixed cookie", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { email: "a@b.com" } }),
    });
    mockFetch(fetchMock);

    const user = await resolveAgentsBridgeUser(
      "__Secure-next-auth.session-token=xyz",
    );
    expect(user?.email).toBe("a@b.com");
  });

  it("returns null when the session has no email", async () => {
    mockFetch(
      jest.fn().mockResolvedValue({ ok: true, json: async () => ({ user: {} }) }),
    );
    expect(
      await resolveAgentsBridgeUser("next-auth.session-token=xyz"),
    ).toBeNull();
  });

  it("returns null on a non-ok response", async () => {
    mockFetch(jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    expect(
      await resolveAgentsBridgeUser("next-auth.session-token=xyz"),
    ).toBeNull();
  });

  it("degrades silently when fetch throws", async () => {
    mockFetch(jest.fn().mockRejectedValue(new Error("network")));
    expect(
      await resolveAgentsBridgeUser("next-auth.session-token=xyz"),
    ).toBeNull();
  });
});
