/**
 * @jest-environment node
 *
 * Tilt Skillet is a formerly premium feature, now chart-priced (5 ESMS base,
 * owner ruling 2026-09-28). It used to check the four-axis total but debit all
 * 5 from Spirit, unchecked, BEFORE calling the agents backend, so a failed
 * plan was still paid for. Now the price is checked before the call and
 * collected only once a valid plan comes back.
 */

const mockQuote = jest.fn();
const mockRefuse = jest.fn();
const mockCollect = jest.fn();
const mockGetUserById = jest.fn();

import { NextResponse, NextRequest } from "next/server";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";

jest.mock("@/lib/economy/featureCharge", () => ({
  quoteFeature: (...a: unknown[]) => mockQuote(...a),
  refuseIfUnaffordable: (...a: unknown[]) => mockRefuse(...a),
  collectOrRefuse: (...a: unknown[]) => mockCollect(...a),
}));

jest.mock("@/lib/auth/demoAccess", () => ({
  gateDemoOrAuth: async () => ({ mode: "auth", userId: "user-1" }),
}));

jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: { getUserById: (...a: unknown[]) => mockGetUserById(...a) },
}));

// Validation and the circuit engine are incidental here; the order of the
// charge relative to the agents call is what is under test.
jest.mock("@/types/tiltSkilletSchema", () => {
  const { z } = jest.requireActual<typeof import("zod")>("zod");
  return {
    tiltSkilletBodySchema: z.object({ stages: z.array(z.object({ ingredients: z.array(z.string()) })) }).passthrough(),
    tiltSkilletBatchSchema: z.object({ title: z.string() }).passthrough(),
  };
});

jest.mock("@/utils/tiltSkilletCircuit", () => ({ computeBatchCircuit: () => ({}) }));

const QUOTE = { feature: "tiltSkillet", exempt: false, cost: { spirit: 1, essence: 1, matter: 1, substance: 1 }, pricing: null };

async function plan(): Promise<Response> {
  const mod = await import("@/app/api/generate-tilt-skillet-plan/route");
  return await mod.POST(
    new NextRequest("https://alchm.kitchen/api/generate-tilt-skillet-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stages: [{ ingredients: ["onion"] }] }),
    }),
  );
}

function upstream(status: number, body: unknown): jest.Mock {
  const fetchMock = jest.fn().mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
  );
  installFetchMock(fetchMock);
  return fetchMock;
}

describe("tilt skillet charges on delivery", () => {
  beforeEach(() => {
    jest.resetModules();
    for (const fn of [mockQuote, mockRefuse, mockCollect, mockGetUserById]) fn.mockReset();
    mockGetUserById.mockResolvedValue({ id: "user-1", roles: ["user"], email: "a@example.com", profile: {} });
    mockQuote.mockResolvedValue(QUOTE);
    mockRefuse.mockResolvedValue(null);
    mockCollect.mockResolvedValue(null);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it("refuses before calling the agents backend when the caller cannot pay", async () => {
    mockRefuse.mockResolvedValue(NextResponse.json({ success: false, reason: "insufficient_tokens" }, { status: 402 }));
    const fetchMock = upstream(200, { title: "Braise" });

    const res = await plan();

    expect(res.status).toBe(402);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockCollect).not.toHaveBeenCalled();
  });

  it("charges nothing when the agents backend fails", async () => {
    upstream(500, { detail: "boom" });

    const res = await plan();

    expect(res.status).toBe(500);
    expect(mockCollect).not.toHaveBeenCalled();
  });

  it("collects the quoted price once a valid plan comes back", async () => {
    upstream(200, { title: "Braise" });

    const res = await plan();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(expect.objectContaining({ title: "Braise" }));
    expect(mockCollect).toHaveBeenCalledTimes(1);
    expect(mockCollect).toHaveBeenCalledWith("user-1", QUOTE);
  });

  it("withholds the plan when the charge is refused at delivery", async () => {
    upstream(200, { title: "Braise" });
    mockCollect.mockResolvedValue(NextResponse.json({ success: false, reason: "insufficient_tokens" }, { status: 402 }));

    const res = await plan();

    expect(res.status).toBe(402);
    expect(await res.json()).not.toHaveProperty("title");
  });
});
