/**
 * The page-view classifier decides what counts as a human visit and what the
 * admin can learn about it. The privacy half matters as much as the counting
 * half: no query strings, no raw IPs, and no identifier that survives a day.
 *
 * @file src/lib/analytics/__tests__/pageViewClassify.test.ts
 */

import {
  clampDurationMs,
  classifyInteractionTag,
  classifyUserAgent,
  cleanInteractions,
  cleanRefTag,
  externalReferrerHost,
  extractUiQueryParamTags,
  extractVariantTags,
  isTrackablePath,
  normalizeInteractionTag,
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

  it("classifies in-app human webviews and browser technology previews as human, not bots", () => {
    const whatsappWebview =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F79 [FBAN/FBIOS;WhatsApp/2.24.12]";
    const safariPreview =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15 Technology Preview";
    expect(classifyUserAgent(whatsappWebview).isBot).toBe(false);
    expect(classifyUserAgent(safariPreview).isBot).toBe(false);
    expect(classifyUserAgent("WhatsApp/2.23.10.76 A").isBot).toBe(true);
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

describe("cleanRefTag / cleanInteractions / clampDurationMs", () => {
  it("keeps clean referral tags and rejects emails or long hex secrets", () => {
    expect(cleanRefTag("  Alex-Review_1 ")).toBe("alex-review_1");
    expect(cleanRefTag("user@example.com")).toBeNull();
    expect(cleanRefTag("0123456789abcdef0123456789abcdef")).toBeNull();
  });

  it("deduplicates and sanitizes interaction tags", () => {
    expect(
      cleanInteractions([
        "planner:fast-start",
        "planner:fast-start",
        "recipe:open:ramen",
        "bad tag with spaces",
      ]),
    ).toEqual(["planner:fast-start", "recipe:open:ramen"]);
  });

  it("clamps dwell time to 30 minutes max", () => {
    expect(clampDurationMs(-50)).toBe(0);
    expect(clampDurationMs(45_200)).toBe(45_200);
    expect(clampDurationMs(9_999_999)).toBe(1_800_000);
  });

  it("classifies structured interaction tags into semantic tones", () => {
    expect(classifyInteractionTag("conversion:cart_handoff")).toMatchObject({
      category: "conversion",
      action: "cart_handoff",
      tone: "conversion",
    });
    expect(classifyInteractionTag("search:zero_results:matcha")).toMatchObject({
      category: "search",
      action: "zero_results",
      meta: "matcha",
      tone: "friction",
    });
    expect(classifyInteractionTag("error:api_500:amazon_search")).toMatchObject({
      category: "error",
      action: "api_500",
      meta: "amazon_search",
      tone: "error",
    });
    expect(classifyInteractionTag("plan:fill_week")).toMatchObject({
      category: "plan",
      action: "fill_week",
      tone: "feature",
    });
  });

  it("rejects polluted UI state values from ref_tag while preserving genuine attribution tags", () => {
    expect(cleanRefTag("prep")).toBeNull();
    expect(cleanRefTag("mediterranean")).toBeNull();
    expect(cleanRefTag("tab=cosmic")).toBeNull();
    expect(cleanRefTag("cuisine:italian")).toBeNull();
    expect(cleanRefTag("qa-walkthrough")).toBe("qa-walkthrough");
  });

  it("converts UI query params into structured filter:param interactions and normalizes IDs", () => {
    expect(extractUiQueryParamTags("?tab=prep&cuisine=mediterranean&ref=qa-walkthrough")).toEqual([
      "filter:param:tab=prep",
      "filter:param:cuisine=mediterranean",
    ]);
    expect(
      normalizeInteractionTag("ui:click:/recipes/550e8400-e29b-41d4-a716-446655440000:save_987654"),
    ).toBe("ui:click:/recipes/:id:save:id");
  });

  it("classifies behavioral frustration signals and slow CWV frames with human-readable labels", () => {
    expect(classifyInteractionTag("friction:rage_click:/menu-planner:generate")).toMatchObject({
      category: "friction",
      action: "rage_click",
      meta: "/menu-planner:generate",
      tone: "friction",
      label: "Rage Click",
    });
    expect(classifyInteractionTag("friction:dead_click:/:hero_badge")).toMatchObject({
      category: "friction",
      action: "dead_click",
      meta: "/:hero_badge",
      tone: "friction",
      label: "Dead Click",
    });
    expect(classifyInteractionTag("friction:quick_back:/baking-lab->/")).toMatchObject({
      category: "friction",
      action: "quick_back",
      meta: "/baking-lab->/",
      tone: "friction",
      label: "Quick Back",
    });
    expect(classifyInteractionTag("perf:slow_inp:/menu-planner:gt500ms")).toMatchObject({
      category: "perf",
      action: "slow_inp",
      meta: "/menu-planner:gt500ms",
      tone: "friction",
      label: "Slow INP",
    });
    expect(classifyInteractionTag("perf:slow_lcp:/:gt2500ms")).toMatchObject({
      category: "perf",
      action: "slow_lcp",
      meta: "/:gt2500ms",
      tone: "friction",
      label: "Slow LCP",
    });
    expect(
      cleanInteractions([
        "friction:quick_back:/baking-lab->/",
        "perf:slow_inp:/menu-planner:gt500ms",
      ]),
    ).toEqual([
      "friction:quick_back:/baking-lab->/",
      "perf:slow_inp:/menu-planner:gt500ms",
    ]);
  });

  it("extracts and classifies lightweight UI experiment variant tags", () => {
    expect(extractVariantTags("?variant=planner:compact")).toEqual(["variant:planner=compact"]);
    expect(extractVariantTags("?ab=dark_cards")).toEqual(["variant:ui=dark_cards"]);
    expect(extractVariantTags("", "planner=expanded")).toEqual(["variant:planner=expanded"]);
    expect(classifyInteractionTag("variant:planner=compact")).toMatchObject({
      category: "variant",
      action: "planner=compact",
      tone: "feature",
      label: "UI Variant",
    });
  });
});
