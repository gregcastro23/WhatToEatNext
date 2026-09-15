import { checkAllowedOrigin, assertAllowedOrigin } from "../originCheck";

describe("originCheck", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("rejects request with missing Origin header", () => {
    const req = new Request("https://alchm.kitchen/api/auth/sessions/123", {
      method: "DELETE",
    });

    const result = checkAllowedOrigin(req);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toBe("Missing Origin header");

    const res = assertAllowedOrigin(req);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(403);
  });

  it("rejects request with malformed Origin header", () => {
    const req = new Request("https://alchm.kitchen/api/auth/sessions/123", {
      method: "DELETE",
      headers: { origin: "not-a-valid-url" },
    });

    const result = checkAllowedOrigin(req);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toBe("Invalid Origin header");
  });

  it("allows canonical production origins", () => {
    const kitchenReq = new Request("https://alchm.kitchen/api/auth/sessions/123", {
      method: "DELETE",
      headers: { origin: "https://alchm.kitchen" },
    });
    expect(checkAllowedOrigin(kitchenReq)).toEqual({ allowed: true, status: 200 });
    expect(assertAllowedOrigin(kitchenReq)).toBeNull();

    const wwwReq = new Request("https://alchm.kitchen/api/auth/sessions/123", {
      method: "DELETE",
      headers: { origin: "https://www.alchm.kitchen" },
    });
    expect(checkAllowedOrigin(wwwReq)).toEqual({ allowed: true, status: 200 });
    expect(assertAllowedOrigin(wwwReq)).toBeNull();
  });

  it("rejects sibling subdomains (e.g. agents.alchm.kitchen)", () => {
    const agentsReq = new Request("https://alchm.kitchen/api/auth/sessions/123", {
      method: "DELETE",
      headers: { origin: "https://agents.alchm.kitchen" },
    });

    const result = checkAllowedOrigin(agentsReq);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toBe("Forbidden origin");

    const apiAgentsReq = new Request("https://alchm.kitchen/api/auth/sessions/123", {
      method: "DELETE",
      headers: { origin: "https://api.agents.alchm.kitchen" },
    });
    expect(checkAllowedOrigin(apiAgentsReq).allowed).toBe(false);
  });

  it("rejects foreign untrusted origins", () => {
    const evilReq = new Request("https://alchm.kitchen/api/auth/sessions/123", {
      method: "DELETE",
      headers: { origin: "https://evil.com" },
    });

    const result = checkAllowedOrigin(evilReq);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toBe("Forbidden origin");
  });

  it("handles localhost strictly by environment", () => {
    const localReq = new Request("http://localhost:3000/api/auth/sessions/123", {
      method: "DELETE",
      headers: { origin: "http://localhost:3000" },
    });

    process.env.NODE_ENV = "test";
    expect(checkAllowedOrigin(localReq).allowed).toBe(true);

    process.env.NODE_ENV = "development";
    expect(checkAllowedOrigin(localReq).allowed).toBe(true);

    process.env.NODE_ENV = "production";
    const prodResult = checkAllowedOrigin(localReq);
    expect(prodResult.allowed).toBe(false);
    expect(prodResult.status).toBe(403);
    expect(prodResult.error).toBe("Localhost origin forbidden in production");
  });

  it("handles Vercel preview environments appropriately", () => {
    const previewReq = new Request("https://preview.vercel.app/api/auth/sessions/123", {
      method: "DELETE",
      headers: { origin: "https://whattoeatnext-git-preview-alchm.vercel.app" },
    });

    process.env.NODE_ENV = "production";
    process.env.VERCEL_ENV = "preview";
    // When preview env vars are unset, reject to prevent accepting arbitrary *.vercel.app origins
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_BRANCH_URL;
    const unpinnedReject = checkAllowedOrigin(previewReq);
    expect(unpinnedReject.allowed).toBe(false);
    expect(unpinnedReject.status).toBe(403);
    expect(unpinnedReject.error).toBe("Forbidden preview origin");

    // When VERCEL_URL is set, pin to that preview deployment
    process.env.VERCEL_URL = "whattoeatnext-git-preview-alchm.vercel.app";
    expect(checkAllowedOrigin(previewReq).allowed).toBe(true);

    const attackerPreviewReq = new Request("https://preview.vercel.app/api/auth/sessions/123", {
      method: "DELETE",
      headers: { origin: "https://attacker-app.vercel.app" },
    });
    const pinnedReject = checkAllowedOrigin(attackerPreviewReq);
    expect(pinnedReject.allowed).toBe(false);
    expect(pinnedReject.status).toBe(403);
    expect(pinnedReject.error).toBe("Forbidden preview origin");

    process.env.VERCEL_ENV = "production";
    const prodResult = checkAllowedOrigin(previewReq);
    expect(prodResult.allowed).toBe(false);
    expect(prodResult.status).toBe(403);
    expect(prodResult.error).toBe("Preview origin forbidden in production");
  });
});
