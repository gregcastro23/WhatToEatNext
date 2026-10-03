/**
 * @jest-environment node
 *
 * /api/economy/sync-transmute — the Transmutation Circle's door for agents.
 *
 * Pins what makes an S2S money door safe: the secret is required (and
 * compared in constant time — secureCompare.test.ts scans this route), the
 * acting account must be an AGENT so the engine's secret can never move a
 * human's coins, and counterparties are named by email.
 */

import { NextRequest } from "next/server";

jest.mock("@/lib/observability/withObservability", () => ({
  withObservability: (_opts: unknown, handler: unknown) => handler,
}));

const findParticipantIdByEmail = jest.fn();
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
      findParticipantIdByEmail: (...a: unknown[]) => findParticipantIdByEmail(...a),
      getCircle: (...a: unknown[]) => getCircle(...a),
      createOffer: (...a: unknown[]) => createOffer(...a),
      acceptOffer: (...a: unknown[]) => acceptOffer(...a),
      cancelOffer: (...a: unknown[]) => cancelOffer(...a),
      declineOffer: (...a: unknown[]) => declineOffer(...a),
    },
  };
});

import { POST } from "../route";

const SECRET = "test-sync-secret";
const AGENT_ID = "44444444-4444-4444-8444-444444444444";
const OFFER = "00000000-0000-4000-8000-000000000001";
const AGENT_EMAIL = "mercury@agentic.alchm.kitchen";

function call(body: unknown, secret: string | null = SECRET): Promise<Response> {
  return Promise.resolve(
    POST(
      new NextRequest("http://localhost/api/economy/sync-transmute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret === null ? {} : { "X-Sync-Secret": secret }),
        },
        body: JSON.stringify(body),
      }),
    ),
  );
}

const original = process.env.ALCHM_KITCHEN_SYNC_SECRET;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.ALCHM_KITCHEN_SYNC_SECRET = SECRET;
  findParticipantIdByEmail.mockResolvedValue({ id: AGENT_ID, isAgent: true });
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => jest.restoreAllMocks());

afterAll(() => {
  if (original === undefined) delete process.env.ALCHM_KITCHEN_SYNC_SECRET;
  else process.env.ALCHM_KITCHEN_SYNC_SECRET = original;
});

describe("the door", () => {
  it("401s without the secret or with the wrong one", async () => {
    expect((await call({ action: "board", agentEmail: AGENT_EMAIL }, null)).status).toBe(401);
    expect((await call({ action: "board", agentEmail: AGENT_EMAIL }, "wrong")).status).toBe(401);
    expect(findParticipantIdByEmail).not.toHaveBeenCalled();
  });

  it("404s an unknown agent", async () => {
    findParticipantIdByEmail.mockResolvedValue(null);
    expect((await call({ action: "board", agentEmail: AGENT_EMAIL })).status).toBe(404);
  });

  it("403s a HUMAN account — the engine's secret never moves a human's coins", async () => {
    findParticipantIdByEmail.mockResolvedValue({ id: AGENT_ID, isAgent: false });
    const res = await call({ action: "accept", agentEmail: "ada@example.com", offerId: OFFER });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ reason: "not_an_agent" });
    expect(acceptOffer).not.toHaveBeenCalled();
  });

  it("400s a malformed body and more than one named counterparty", async () => {
    expect((await call({ action: "offer", agentEmail: "not-an-email" })).status).toBe(400);
    const res = await call({
      action: "offer", agentEmail: AGENT_EMAIL, giveToken: "Matter", giveAmount: 2, wantToken: "Spirit", wantAmount: 1.6,
      counterpartyEmail: "bo@example.com", replyToOfferId: OFFER,
    });
    expect(res.status).toBe(400);
  });
});

describe("the acts", () => {
  it("board reads the Circle as the agent sees it", async () => {
    getCircle.mockResolvedValue({ board: [{ id: OFFER }], mine: [] });
    const res = await call({ action: "board", agentEmail: AGENT_EMAIL });
    expect(res.status).toBe(200);
    expect(getCircle).toHaveBeenCalledWith(AGENT_ID);
    expect(await res.json()).toMatchObject({ ok: true, agentId: AGENT_ID, board: [{ id: OFFER }] });
  });

  it("offer names the counterparty by email", async () => {
    createOffer.mockResolvedValue({ ok: true, offer: { id: OFFER }, replayed: false });
    const res = await call({
      action: "offer", agentEmail: AGENT_EMAIL, giveToken: "Matter", giveAmount: 2, wantToken: "Spirit", wantAmount: 1.6,
      counterpartyEmail: "Bo@Example.com",
    });
    expect(res.status).toBe(201);
    expect(createOffer).toHaveBeenCalledWith(AGENT_ID, expect.objectContaining({
      giveToken: "Matter", counterparty: { email: "bo@example.com" },
    }));
  });

  it("accept fills as the agent; refusals keep the Circle's statuses", async () => {
    acceptOffer.mockResolvedValue({ ok: true, offer: { id: OFFER }, trade: { transactionGroupId: "g" }, balances: null, bonus: null });
    expect((await call({ action: "accept", agentEmail: AGENT_EMAIL, offerId: OFFER })).status).toBe(200);
    expect(acceptOffer).toHaveBeenCalledWith(AGENT_ID, OFFER);

    acceptOffer.mockResolvedValue({ ok: false, reason: "off_market", message: "moved" });
    const refused = await call({ action: "accept", agentEmail: AGENT_EMAIL, offerId: OFFER });
    expect(refused.status).toBe(422);
    expect(await refused.json()).toEqual({ ok: false, reason: "off_market", message: "moved" });
  });

  it("cancel and decline act as the agent", async () => {
    cancelOffer.mockResolvedValue({ ok: true, offer: { id: OFFER } });
    declineOffer.mockResolvedValue({ ok: true, offer: { id: OFFER } });
    await call({ action: "cancel", agentEmail: AGENT_EMAIL, offerId: OFFER });
    await call({ action: "decline", agentEmail: AGENT_EMAIL, offerId: OFFER });
    expect(cancelOffer).toHaveBeenCalledWith(AGENT_ID, OFFER);
    expect(declineOffer).toHaveBeenCalledWith(AGENT_ID, OFFER);
  });

  it("500s a thrown fill and says nothing was exchanged", async () => {
    acceptOffer.mockRejectedValue(new Error("rolled back"));
    const res = await call({ action: "accept", agentEmail: AGENT_EMAIL, offerId: OFFER });
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ reason: "internal_error" });
  });
});
