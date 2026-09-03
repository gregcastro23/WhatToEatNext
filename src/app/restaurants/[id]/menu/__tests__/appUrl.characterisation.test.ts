import { appUrl } from "../helpers";

describe("appUrl characterisation", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.AUTH_URL;
    delete process.env.VERCEL_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("prefers NEXT_PUBLIC_APP_URL when defined", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://custom.app.kitchen";
    process.env.AUTH_URL = "https://auth.kitchen";
    process.env.VERCEL_URL = "vercel.app";
    expect(appUrl()).toBe("https://custom.app.kitchen");
  });

  it("falls back to AUTH_URL when NEXT_PUBLIC_APP_URL is empty or undefined", () => {
    process.env.NEXT_PUBLIC_APP_URL = "";
    process.env.AUTH_URL = "https://auth.kitchen";
    expect(appUrl()).toBe("https://auth.kitchen");
  });

  it("falls back to VERCEL_URL when earlier variables are missing", () => {
    process.env.VERCEL_URL = "my-deployment.vercel.app";
    expect(appUrl()).toBe("https://my-deployment.vercel.app");
  });

  it("prepends https:// when configured string lacks protocol", () => {
    process.env.NEXT_PUBLIC_APP_URL = "subdomain.domain.com";
    expect(appUrl()).toBe("https://subdomain.domain.com");
  });

  it("preserves http:// if explicitly specified", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    expect(appUrl()).toBe("http://localhost:3000");
  });

  it("falls back to default https://alchm.kitchen when all env vars are unset", () => {
    expect(appUrl()).toBe("https://alchm.kitchen");
  });
});
