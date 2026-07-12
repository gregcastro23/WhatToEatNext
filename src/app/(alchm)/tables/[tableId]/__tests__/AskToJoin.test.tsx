/**
 * @jest-environment jsdom
 *
 * /tables/[tableId] — "Ask to Join" affordance (PR 6 adversarial-review
 * finding 3): POST /api/tables/[tableId]/join-request had no UI entry point.
 * Guards that a signed-in NON-member sees the button on a public planned/live
 * table, that it flips to "Requested" after a successful POST, and that
 * hosts/members/non-public tables never show it.
 *
 * Heavy child panels (composite/members/invite/photo/comment/live-room) are
 * stubbed — this test is about the container's own gating logic, not those
 * components' internals.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TableDetailPage from "../page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ tableId: "tbl-1" }),
}));

jest.mock("@/components/tables/CommentList", () => ({ CommentList: () => null }));
jest.mock("@/components/tables/InvitePanel", () => ({ InvitePanel: () => null }));
jest.mock("@/components/tables/LifecycleControls", () => ({ LifecycleControls: () => null }));
jest.mock("@/components/tables/LiveTableRoom", () => ({ LiveTableRoom: () => null }));
jest.mock("@/components/tables/MembersPanel", () => ({ MembersPanel: () => null }));
jest.mock("@/components/tables/PhotoGrid", () => ({ PhotoGrid: () => null }));
jest.mock("@/components/tables/TableCompositePanel", () => ({ TableCompositePanel: () => null }));

const HOST_ID = "10000000-0000-0000-0000-000000000001"; // da Vinci
const VIEWER_ID = "20000000-0000-0000-0000-000000000002"; // Curie

function tableFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: "tbl-1",
    hostId: HOST_ID,
    title: "Open Feast",
    scheduledAt: new Date().toISOString(),
    venue: { type: "restaurant", name: "Some Place" },
    status: "planned",
    visibility: "public",
    compositeSnapshot: null,
    compositeUpdatedAt: null,
    menu: [],
    memory: null,
    wentLiveAt: null,
    closedAt: null,
    feedEventId: null,
    seatCap: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [
      {
        id: "m-host",
        tableId: "tbl-1",
        userId: HOST_ID,
        role: "host",
        rsvpStatus: "joined",
        createdAt: "",
        updatedAt: "",
        name: "Leonardo da Vinci",
      },
    ],
    photos: [],
    invites: undefined,
    ...overrides,
  };
}

function mockFetchSequence(detailResponse: unknown, viewerId: string | null) {
  global.fetch = jest.fn((url: unknown, init?: RequestInit) => {
    const u = String(url);
    if (u.includes("/join-request") && init?.method === "POST") {
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, message: "Your request has been sent" }),
      }) as unknown as Promise<Response>;
    }
    if (u.startsWith("/api/tables/")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, table: detailResponse, viewerId }),
      }) as unknown as Promise<Response>;
    }
    return Promise.reject(new Error(`Unexpected fetch: ${u}`));
  }) as unknown as typeof fetch;
}

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
  jest.clearAllMocks();
});

describe("/tables/[tableId] — Ask to Join", () => {
  it("shows Ask to Join for a signed-in non-member on a public planned table, and flips to Requested on click", async () => {
    mockFetchSequence(tableFixture(), VIEWER_ID);
    render(<TableDetailPage />);

    const button = await screen.findByRole("button", { name: "Ask to Join" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Requested" })).toBeDisabled();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tables/tbl-1/join-request",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("does not show Ask to Join for the host", async () => {
    mockFetchSequence(tableFixture(), HOST_ID);
    render(<TableDetailPage />);
    await screen.findByText("Open Feast");
    expect(screen.queryByRole("button", { name: "Ask to Join" })).not.toBeInTheDocument();
  });

  it("does not show Ask to Join for an already-joined member", async () => {
    mockFetchSequence(
      tableFixture({
        members: [
          { id: "m-host", tableId: "tbl-1", userId: HOST_ID, role: "host", rsvpStatus: "joined", createdAt: "", updatedAt: "" },
          { id: "m-viewer", tableId: "tbl-1", userId: VIEWER_ID, role: "guest", rsvpStatus: "joined", createdAt: "", updatedAt: "" },
        ],
      }),
      VIEWER_ID,
    );
    render(<TableDetailPage />);
    await screen.findByText("Open Feast");
    expect(screen.queryByRole("button", { name: "Ask to Join" })).not.toBeInTheDocument();
  });

  it("does not show Ask to Join on a commensals-visibility table", async () => {
    mockFetchSequence(tableFixture({ visibility: "commensals" }), VIEWER_ID);
    render(<TableDetailPage />);
    await screen.findByText("Open Feast");
    expect(screen.queryByRole("button", { name: "Ask to Join" })).not.toBeInTheDocument();
  });

  it("does not show Ask to Join on a cancelled table", async () => {
    mockFetchSequence(tableFixture({ status: "cancelled" }), VIEWER_ID);
    render(<TableDetailPage />);
    await screen.findByText("This table was cancelled by the host.");
    expect(screen.queryByRole("button", { name: "Ask to Join" })).not.toBeInTheDocument();
  });
});
