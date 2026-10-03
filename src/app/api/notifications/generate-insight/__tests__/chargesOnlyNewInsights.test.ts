/**
 * @jest-environment node
 *
 * The manual "generate daily insight" button costs ESMS (2 base, owner ruling
 * 2026-09-28); the insight made automatically at sign-in stays free. Most
 * presses find that sign-in insight already made, so the charge must follow
 * creation: no new insight, no charge.
 */

const mockQuote = jest.fn();
const mockRefuse = jest.fn();
const mockCollect = jest.fn();
const mockGenerate = jest.fn();

import { NextResponse, NextRequest } from "next/server";

jest.mock("@/lib/economy/featureCharge", () => ({
  quoteFeature: (...a: unknown[]) => mockQuote(...a),
  refuseIfUnaffordable: (...a: unknown[]) => mockRefuse(...a),
  collect: (...a: unknown[]) => mockCollect(...a),
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: async () => ({
    id: "user-1",
    roles: ["user"],
    email: "a@example.com",
    profile: { natalChart: { planetaryPositions: { Sun: { sign: "aries" } } } },
  }),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: async () => ({ allowed: true }),
}));

jest.mock("@/services/dailyInsightService", () => ({
  generateDailyInsightNotification: (...a: unknown[]) => mockGenerate(...a),
}));

const QUOTE = { feature: "dailyInsight", exempt: false, cost: { spirit: 0.5, essence: 0.5, matter: 0.5, substance: 0.5 }, pricing: null };

async function press(): Promise<Response> {
  const mod = await import("@/app/api/notifications/generate-insight/route");
  return await mod.POST(
    new NextRequest("https://alchm.kitchen/api/notifications/generate-insight", { method: "POST" }),
  );
}

describe("manual daily insight charges only for a new insight", () => {
  beforeEach(() => {
    jest.resetModules();
    for (const fn of [mockQuote, mockRefuse, mockCollect, mockGenerate]) fn.mockReset();
    mockQuote.mockResolvedValue(QUOTE);
    mockRefuse.mockResolvedValue(null);
    mockCollect.mockResolvedValue({ paid: true, transactionGroupId: "grp-1" });
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it("charges once, keyed on the insight, when a new one is created", async () => {
    mockGenerate.mockResolvedValue({ id: "notif-7", title: "Today" });

    const res = await press();

    expect(res.status).toBe(201);
    expect(mockCollect).toHaveBeenCalledWith("user-1", QUOTE, "daily_insight:notif-7");
  });

  it("charges nothing when today's insight already exists (e.g. the free sign-in one)", async () => {
    mockGenerate.mockResolvedValue(null);

    const res = await press();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(expect.objectContaining({ alreadyGenerated: true }));
    expect(mockCollect).not.toHaveBeenCalled();
  });

  it("refuses before generating when the caller cannot pay", async () => {
    mockRefuse.mockResolvedValue(NextResponse.json({ success: false, reason: "insufficient_tokens" }, { status: 402 }));

    const res = await press();

    expect(res.status).toBe(402);
    expect(mockGenerate).not.toHaveBeenCalled();
    expect(mockCollect).not.toHaveBeenCalled();
  });
});
