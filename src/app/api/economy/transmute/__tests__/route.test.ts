/**
 * @jest-environment node
 *
 * /api/economy/transmute — the Transmutation Circle's human door.
 *
 * The service's rules are tested in transmutationService.test.ts; this pins
 * the door: auth, shape validation, dispatch by action, how each refusal reads
 * over HTTP, and the retired 3:1 shape pointing people to /api/economy/swap.
 */

import { NextRequest } from "next/server";

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ allowed: true }),
}));

const mockGetUserId = jest.fn();
jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: (...args: unknown[]) => mockGetUserId(...args),
}));

const getCircle = jest.fn();
const createOffer = jest.fn();
const acceptOffer = jest.fn();
const cancelOffer = jest.fn();
const declineOffer = jest.fn();
jest.mock("@/services/transmutationService", () => {
  const actual = jest.requireActual("@/services/transmutationService");
  return {
    TRANSMUTATION_FAILURE_STATUS: actual.TRANSMUTATION_FAILURE_STATUS,
    transmutationService: {
      getCircle: (...a: unknown[]) => getCircle(...a),
      createOffer: (...a: unknown[]) => createOffer(...a),
      acceptOffer: (...a: unknown[]) => acceptOffer(...a),
      cancelOffer: (...a: unknown[]) => cancelOffer(...a),
      declineOffer: (...a: unknown[]) => declineOffer(...a),
    },
  };
});

import { GET, POST } from "../route";

const USER = "11111111-1111-4111-8111-111111111111";
const OFFER = "00000000-0000-4000-8000-000000000001";

function postBody(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/economy/transmute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const OFFER_BODY = { action: "offer", giveToken: "Spirit", giveAmount: 4, wantToken: "Essence", wantAmount: 3.2 };

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUserId.mockResolvedValue(USER);
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => jest.restoreAllMocks());

describe("auth and shape", () => {
  it("401s both reads and writes without a session", async () => {
    mockGetUserId.mockResolvedValue(null);
    expect((await GET(new NextRequest("http://localhost/api/economy/transmute"))).status).toBe(401);
    expect((await POST(postBody(OFFER_BODY))).status).toBe(401);
    expect(createOffer).not.toHaveBeenCalled();
  });

  it("400s malformed JSON and unknown actions", async () => {
    expect((await POST(postBody("{nope"))).status).toBe(400);
    expect((await POST(postBody({ action: "gift", offerId: OFFER }))).status).toBe(400);
  });

  it("400s a coin traded for itself, a non-uuid offer, and naming two counterparties", async () => {
    expect((await POST(postBody({ ...OFFER_BODY, wantToken: "Spirit" }))).status).toBe(400);
    expect((await POST(postBody({ action: "accept", offerId: "42" }))).status).toBe(400);
    const both = await POST(postBody({ ...OFFER_BODY, counterpartyId: USER, replyToOfferId: OFFER }));
    expect(both.status).toBe(400);
    expect(createOffer).not.toHaveBeenCalled();
  });

  it("410s the retired 3:1 shape and points to /api/economy/swap", async () => {
    const res = await POST(postBody({ fromToken: "Spirit", toToken: "Essence", amount: 1 }));
    expect(res.status).toBe(410);
    expect(await res.json()).toMatchObject({ reason: "retired", message: expect.stringContaining("/api/economy/swap") });
  });
});

describe("GET — the Circle", () => {
  it("serves the viewer's Circle snapshot", async () => {
    getCircle.mockResolvedValue({ board: [], mine: [], stats: { trades: 3, partners: 2, lastTradeAt: null } });
    const res = await GET(new NextRequest("http://localhost/api/economy/transmute"));
    expect(res.status).toBe(200);
    expect(getCircle).toHaveBeenCalledWith(USER);
    expect(await res.json()).toMatchObject({ success: true, stats: { trades: 3, partners: 2 } });
  });

  it("500s honestly when the Circle cannot be read", async () => {
    getCircle.mockRejectedValue(new Error("db down"));
    expect((await GET(new NextRequest("http://localhost/api/economy/transmute"))).status).toBe(500);
  });
});

describe("POST — the four acts", () => {
  it("offer: passes the terms through and answers 201 (200 on a replay)", async () => {
    createOffer.mockResolvedValue({ ok: true, offer: { id: OFFER, directed: false }, replayed: false });
    const res = await POST(postBody({ ...OFFER_BODY, message: "for a stew", counterpartyId: USER.replace("1111", "2222") }));
    expect(res.status).toBe(201);
    expect(createOffer).toHaveBeenCalledWith(USER, expect.objectContaining({
      giveToken: "Spirit", giveAmount: 4, wantToken: "Essence", wantAmount: 3.2,
      message: "for a stew", counterparty: { id: USER.replace("1111", "2222") },
    }));

    createOffer.mockResolvedValue({ ok: true, offer: { id: OFFER, directed: false }, replayed: true });
    expect((await POST(postBody(OFFER_BODY))).status).toBe(200);
  });

  it("accept: returns the trade, balances and any bonus", async () => {
    acceptOffer.mockResolvedValue({
      ok: true,
      offer: { id: OFFER, status: "filled" },
      trade: { gave: { tokenType: "Essence", amount: 3.2 }, received: { tokenType: "Spirit", amount: 4 }, transactionGroupId: "g" },
      balances: null,
      bonus: { tokenType: "Essence", amount: 1, hint: "The Circle turns" },
    });
    const res = await POST(postBody({ action: "accept", offerId: OFFER }));
    expect(res.status).toBe(200);
    expect(acceptOffer).toHaveBeenCalledWith(USER, OFFER);
    expect(await res.json()).toMatchObject({
      success: true,
      bonus: { amount: 1 },
      message: "⚗️ Transmuted: you gave 3.2 Essence and received 4 Spirit.",
    });
  });

  it("cancel and decline route to their own service calls", async () => {
    cancelOffer.mockResolvedValue({ ok: true, offer: { id: OFFER, status: "cancelled" } });
    declineOffer.mockResolvedValue({ ok: true, offer: { id: OFFER, status: "declined" } });
    expect((await POST(postBody({ action: "cancel", offerId: OFFER }))).status).toBe(200);
    expect((await POST(postBody({ action: "decline", offerId: OFFER }))).status).toBe(200);
    expect(cancelOffer).toHaveBeenCalledWith(USER, OFFER);
    expect(declineOffer).toHaveBeenCalledWith(USER, OFFER);
  });

  it.each([
    ["insufficient_funds", 402],
    ["offer_not_found", 404],
    ["offer_closed", 409],
    ["maker_cannot_cover", 409],
    ["offer_expired", 410],
    ["off_market", 422],
    ["too_many_open_offers", 429],
    ["rates_unavailable", 503],
  ])("a %s refusal answers %i with the service's message", async (reason, status) => {
    acceptOffer.mockResolvedValue({ ok: false, reason, message: `because ${reason}` });
    const res = await POST(postBody({ action: "accept", offerId: OFFER }));
    expect(res.status).toBe(status);
    expect(await res.json()).toEqual({ success: false, reason, message: `because ${reason}` });
  });

  it("a thrown fill (rolled back) answers 500 and says nothing was exchanged", async () => {
    acceptOffer.mockRejectedValue(new Error("transmutation: a fill leg moved no balance; rolling back"));
    const res = await POST(postBody({ action: "accept", offerId: OFFER }));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ reason: "failed", message: expect.stringContaining("nothing was exchanged") });
  });
});
