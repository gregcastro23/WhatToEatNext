/** @jest-environment jsdom */

/**
 * The Transmutation Circle view: it reads the Circle, puts offers made to you
 * first, guides the maker to fair terms, and sends each act to the one door.
 */

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { TransmutationCircle } from "../TransmutationCircle";

const revealPracticeReward = jest.fn();
jest.mock("@/lib/economy/practiceClient", () => ({
  revealPracticeReward: (...a: unknown[]) => revealPracticeReward(...a),
}));

const PRICES = { Spirit: 1, Essence: 1.25, Matter: 0.8, Substance: 1.6 };

function offer(overrides: Record<string, unknown>) {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    giveToken: "Spirit",
    giveAmount: 4,
    wantToken: "Essence",
    wantAmount: 2.9091,
    message: null,
    status: "open",
    directed: false,
    replyToOfferId: null,
    createdAt: "2026-09-30T12:00:00.000Z",
    expiresAt: "2026-10-03T12:00:00.000Z",
    closedAt: null,
    market: { parityWantAmount: 3.2, takerEdgePct: 10, withinCorridor: true },
    maker: { name: "Ada", isAgent: false },
    directedToYou: false,
    youCanFill: true,
    complementsYou: true,
    ...overrides,
  };
}

const SNAPSHOT = {
  success: true,
  board: [
    offer({ id: "00000000-0000-4000-8000-00000000000d", directed: true, directedToYou: true, maker: { name: "Mercury", isAgent: true }, giveToken: "Matter", giveAmount: 2, wantToken: "Spirit", wantAmount: 1.6, complementsYou: false, market: { parityWantAmount: 1.6, takerEdgePct: 0, withinCorridor: true } }),
    offer({ message: "Need Essence for a stew" }),
  ],
  mine: [
    {
      ...offer({ id: "00000000-0000-4000-8000-0000000000aa" }),
      funded: false,
      counterparty: null,
      taker: null,
    },
  ],
  needs: { lacking: ["Spirit", "Matter", "Substance"], surplus: ["Essence"] },
  suggestion: { giveToken: "Essence", giveAmount: 2.4, wantToken: "Spirit", wantAmount: 3 },
  stats: { trades: 3, partners: 2, lastTradeAt: null },
  pulse: { trades24h: 7, openOffers: 12 },
  market: { live: true, prices: PRICES, priceBucketStartUtc: "2026-09-30T12:00:00.000Z", corridorPct: 25 },
  bonus: { tokenType: "Essence", baseAmount: 1, minTradeValue: 1, perPartnerPerDay: 1 },
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

let fetchMock: jest.Mock;

beforeEach(() => {
  revealPracticeReward.mockReset();
  fetchMock = jest.fn((_url: string, init?: RequestInit) =>
    Promise.resolve(init?.method === "POST" ? json({ success: true, message: "Done." }) : json(SNAPSHOT)),
  );
  global.fetch = fetchMock;
});

function postedBodies(): Array<Record<string, unknown>> {
  return fetchMock.mock.calls
    .filter(([, init]) => init?.method === "POST")
    .map(([, init]) => JSON.parse(String(init?.body)));
}

describe("TransmutationCircle", () => {
  it("shows the pulse, your record, the bonus, and your needs", async () => {
    render(<TransmutationCircle />);
    expect(await screen.findByText("7 trades today")).toBeInTheDocument();
    expect(screen.getByText("12 open offers")).toBeInTheDocument();
    expect(screen.getByText("you: 3 trades · 2 partners")).toBeInTheDocument();
    expect(screen.getByText(/You're short on/)).toHaveTextContent("Spirit, 🝙 Matter, 🝉 Substance");
  });

  it("puts offers made to you in their own list, above the open board", async () => {
    render(<TransmutationCircle />);
    const madeToYou = (await screen.findByText("Made to you")).closest("div");
    const board = screen.getByText("Open in the Circle").closest("div");
    if (!madeToYou || !board) throw new Error("lists not rendered");
    expect(within(madeToYou).getByText("Mercury")).toBeInTheDocument();
    expect(within(madeToYou).getByRole("button", { name: "Decline" })).toBeInTheDocument();
    expect(within(board).getByText("Ada")).toBeInTheDocument();
    expect(within(board).getByText("+10.0% vs swap")).toBeInTheDocument();
    expect(within(board).getByText("what you need")).toBeInTheDocument();
    expect(within(board).getByText("“Need Essence for a stew”")).toBeInTheDocument();
  });

  it("accepting posts {action: accept} and reveals the Circle bonus", async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      Promise.resolve(
        init?.method === "POST"
          ? json({ success: true, message: "⚗️ Transmuted.", bonus: { tokenType: "Essence", amount: 1, hint: "The Circle turns" } })
          : json(SNAPSHOT),
      ),
    );
    render(<TransmutationCircle />);
    const board = (await screen.findByText("Open in the Circle")).closest("div");
    if (!board) throw new Error("board not rendered");
    fireEvent.click(within(board).getByRole("button", { name: "Accept" }));
    await waitFor(() => expect(postedBodies()).toEqual([{ action: "accept", offerId: "00000000-0000-4000-8000-000000000001" }]));
    await waitFor(() => expect(revealPracticeReward).toHaveBeenCalledWith({ tokenType: "Essence", amount: 1, hint: "The Circle turns" }));
    expect(await screen.findByText("⚗️ Transmuted.")).toBeInTheDocument();
  });

  it("shows the fair ask while composing, and blocks terms outside the corridor", async () => {
    render(<TransmutationCircle />);
    const give = await screen.findByLabelText("You give");
    const want = screen.getByLabelText("You want");
    fireEvent.change(give, { target: { value: "4" } });
    expect(screen.getByText(/Fair ask at the index/)).toHaveTextContent("3.2 Essence");

    fireEvent.change(want, { target: { value: "8" } });
    expect(screen.getByText(/Outside the fair corridor/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Post to the Circle" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "use it" }));
    expect(screen.getByText("Right at the index.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Post to the Circle" })).toBeEnabled();
  });

  it("countering prefills the reverse trade at fair value, addressed to the maker", async () => {
    render(<TransmutationCircle />);
    const board = (await screen.findByText("Open in the Circle")).closest("div");
    if (!board) throw new Error("board not rendered");
    fireEvent.click(within(board).getByRole("button", { name: "Counter" }));
    expect(screen.getByText("Counter Ada")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send counter-offer" }));
    await waitFor(() =>
      expect(postedBodies()[0]).toMatchObject({
        action: "offer",
        giveToken: "Essence",
        giveAmount: 3.2,
        wantToken: "Spirit",
        wantAmount: 4,
        replyToOfferId: "00000000-0000-4000-8000-000000000001",
      }),
    );
    expect(postedBodies()[0]?.idempotencyKey).toEqual(expect.any(String));
  });

  it("tells a maker when their own open offer is no longer covered, and lets them withdraw it", async () => {
    render(<TransmutationCircle />);
    expect(await screen.findByText("your balance no longer covers it")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Withdraw" }));
    await waitFor(() => expect(postedBodies()).toEqual([{ action: "cancel", offerId: "00000000-0000-4000-8000-0000000000aa" }]));
  });

  it("invites a signed-out visitor to sign in instead of showing an empty board", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json({ success: false }, 401)));
    render(<TransmutationCircle />);
    expect(await screen.findByRole("link", { name: "Sign in to trade" })).toHaveAttribute("href", "/login");
  });

  it("pauses posting and says why when the index is not live", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(json({ ...SNAPSHOT, market: { live: false, prices: null, priceBucketStartUtc: null, corridorPct: 25 } })),
    );
    render(<TransmutationCircle />);
    expect(await screen.findByText(/posting and filling are paused/)).toBeInTheDocument();
    for (const accept of screen.getAllByRole("button", { name: "Accept" })) expect(accept).toBeDisabled();
  });
});
