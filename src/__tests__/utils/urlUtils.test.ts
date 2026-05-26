/**
 * Tests for `getSelfBaseUrl` — guards the resolution order that prevents
 * server-side self-fetches from hitting Vercel's Deployment Protection
 * gate on the deployment URL.
 */
import { getSelfBaseUrl } from "@/utils/urlUtils";

describe("getSelfBaseUrl", () => {
  const ENV_KEYS = [
    "NEXT_PUBLIC_SITE_URL",
    "SITE_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
    "VERCEL_URL",
    "PORT",
  ] as const;

  let saved: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>;

  beforeEach(() => {
    saved = {};
    for (const k of ENV_KEYS) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      const v = saved[k];
      if (v === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = v;
      }
    }
  });

  it("prefers NEXT_PUBLIC_SITE_URL when set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://alchm.kitchen";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "alchm.kitchen";
    process.env.VERCEL_URL = "deploy-abc.vercel.app";
    expect(getSelfBaseUrl()).toBe("https://alchm.kitchen");
  });

  it("prefers SITE_URL if NEXT_PUBLIC_SITE_URL is absent", () => {
    process.env.SITE_URL = "https://example.com/";
    process.env.VERCEL_URL = "deploy-abc.vercel.app";
    expect(getSelfBaseUrl()).toBe("https://example.com");
  });

  it("uses VERCEL_PROJECT_PRODUCTION_URL when no explicit override", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "alchm.kitchen";
    process.env.VERCEL_URL = "alchm-kitchen-abc.vercel.app";
    expect(getSelfBaseUrl()).toBe("https://alchm.kitchen");
  });

  it("strips an accidental scheme from VERCEL_PROJECT_PRODUCTION_URL", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "https://alchm.kitchen";
    expect(getSelfBaseUrl()).toBe("https://alchm.kitchen");
  });

  it("falls back to VERCEL_URL only as last resort on Vercel", () => {
    process.env.VERCEL_URL = "alchm-kitchen-abc.vercel.app";
    expect(getSelfBaseUrl()).toBe("https://alchm-kitchen-abc.vercel.app");
  });

  it("falls back to localhost when nothing is set", () => {
    expect(getSelfBaseUrl()).toBe("http://localhost:3000");
  });

  it("honors PORT in localhost fallback", () => {
    process.env.PORT = "4001";
    expect(getSelfBaseUrl()).toBe("http://localhost:4001");
  });
});
