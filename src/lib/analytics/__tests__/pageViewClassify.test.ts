/**
 * The page-view classifier decides what counts as a human visit and what the
 * admin can learn about it. The privacy half matters as much as the counting
 * half: no query strings, no raw IPs, and no identifier that survives a day.
 *
 * @file src/lib/analytics/__tests__/pageViewClassify.test.ts
 */

import {
  classifyUserAgent,
  externalReferrerHost,
  isTrackablePath,
  normalizePath,
  visitorHash,
} from "@/lib/analytics/pageViewClassify";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const MAC_CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const WIN_EDGE =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0";

describe("classifyUserAgent", () => {
  it.each([
    [IPHONE, { deviceType: "mobile", browser: "Safari", os: "iOS", isBot: false }],
    [MAC_CHROME, { deviceType: "desktop", browser: "Chrome", os: "macOS", isBot: false }],
    [WIN_EDGE, { deviceType: "desktop", browser: "Edge", os: "Windows", isBot: false }],
  ])("classifies %s", (ua, expected) => {
    expect(classifyUserAgent(ua)).toEqual(expected);
  });

  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/128.0.0.0 Safari/537.36",
    "facebookexternalhit/1.1",
    "curl/8.4.0",
    "",
  ])("marks %p as a bot", (ua) => {
    expect(classifyUserAgent(ua).isBot).toBe(true);
  });

  it("does not mistake a phone brand containing 'bot' for a crawler", () => {
    const cubot = "Mozilla/5.0 (Linux; Android 10; CUBOT X30) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36";
    expect(classifyUserAgent(cubot).isBot).toBe(false);
  });
});

describe("externalReferrerHost", () => {
  it("keeps other sites and strips www", () => {
    expect(externalReferrerHost("https://www.google.com/search?q=x", "alchm.kitchen")).toBe("google.com");
  });
  it("treats our own host and subdomains as internal", () => {
    expect(externalReferrerHost("https://alchm.kitchen/recipes", "alchm.kitchen")).toBeNull();
    expect(externalReferrerHost("https://agents.alchm.kitchen/", "www.alchm.kitchen")).toBeNull();
  });
  it("returns null for direct traffic and junk", () => {
    expect(externalReferrerHost(null, "alchm.kitchen")).toBeNull();
    expect(externalReferrerHost("not a url", "alchm.kitchen")).toBeNull();
  });
});

describe("normalizePath / isTrackablePath", () => {
  it("drops the query string and fragment (they can carry emails and tokens)", () => {
    expect(normalizePath("/login?email=a@b.com&token=secret#x")).toBe("/login");
  });
  it("collapses trailing slashes but keeps the root", () => {
    expect(normalizePath("/recipes/")).toBe("/recipes");
    expect(normalizePath("/")).toBe("/");
  });
  it("rejects non-paths", () => {
    expect(normalizePath("https://evil.example/")).toBeNull();
  });
  it("never records operator or API paths", () => {
    expect(isTrackablePath("/admin")).toBe(false);
    expect(isTrackablePath("/admin/traffic")).toBe(false);
    expect(isTrackablePath("/api/track/pageview")).toBe(false);
    expect(isTrackablePath("/administrator-guide")).toBe(true);
  });
});

describe("visitorHash", () => {
  const base = { secret: "s3cret", day: "2026-09-22", ip: "203.0.113.7", userAgent: MAC_CHROME };

  it("is stable within a day", () => {
    expect(visitorHash(base)).toBe(visitorHash({ ...base }));
  });
  it("rotates across days, so a visitor cannot be followed day to day", () => {
    expect(visitorHash(base)).not.toBe(visitorHash({ ...base, day: "2026-09-23" }));
  });
  it("depends on the secret and never contains the IP", () => {
    expect(visitorHash(base)).not.toBe(visitorHash({ ...base, secret: "other" }));
    expect(visitorHash(base)).not.toContain("203.0.113.7");
    expect(visitorHash(base)).toMatch(/^[0-9a-f]{24}$/);
  });
});
