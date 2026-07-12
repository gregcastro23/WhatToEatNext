/**
 * Tests for the lifecycle-transition routes (go-live, cancel, close):
 * non-host callers get 403, wrong-state races get 409.
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/services/tableDatabaseService", () => ({
  tableDatabase: {
    getTableHostAndStatus: jest.fn(),
    goLive: jest.fn(),
    cancelTable: jest.fn(),
    closeTable: jest.fn(),
    getTableDetail: jest.fn(),
  },
}));

jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: {
    createNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { tableDatabase } from "@/services/tableDatabaseService";
import { POST as goLive } from "../go-live/route";
import { POST as cancel } from "../cancel/route";
import { POST as close } from "../close/route";

const HOST = "host-1";
const OTHER = "other-1";
const TABLE_ID = "table-1";

function makeRequest(): any {
  return {
    url: `http://localhost/api/tables/${TABLE_ID}/go-live`,
    method: "POST",
    json: async () => ({}),
    headers: { get: () => null },
  };
}

function makeParams() {
  return { params: Promise.resolve({ tableId: TABLE_ID }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  (getUserIdFromRequest as jest.Mock).mockResolvedValue(OTHER);
  (tableDatabase.getTableDetail as jest.Mock).mockResolvedValue({
    id: TABLE_ID,
    hostId: HOST,
    title: "Test Table",
    members: [],
  });
});

describe.each([
  ["go-live", goLive, "goLive"],
  ["cancel", cancel, "cancelTable"],
  ["close", close, "closeTable"],
] as const)("POST /api/tables/[tableId]/%s", (_name, handler, serviceMethod) => {
  it("returns 401 when unauthenticated", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);

    const res = await handler(makeRequest(), makeParams());

    expect(res.status).toBe(401);
    expect(tableDatabase.getTableHostAndStatus).not.toHaveBeenCalled();
  });

  it("returns 404 when the table does not exist", async () => {
    (tableDatabase.getTableHostAndStatus as jest.Mock).mockResolvedValue(null);

    const res = await handler(makeRequest(), makeParams());

    expect(res.status).toBe(404);
    expect((tableDatabase as any)[serviceMethod]).not.toHaveBeenCalled();
  });

  it("returns 403 when the caller is not the host", async () => {
    (tableDatabase.getTableHostAndStatus as jest.Mock).mockResolvedValue({
      hostId: HOST,
      status: "planned",
    });

    const res = await handler(makeRequest(), makeParams());
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
    // The guarded service transition is never even attempted for a non-host caller.
    expect((tableDatabase as any)[serviceMethod]).not.toHaveBeenCalled();
  });

  it("returns 409 when the host calls it but the guarded transition fails (wrong state / race)", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(HOST);
    (tableDatabase.getTableHostAndStatus as jest.Mock).mockResolvedValue({
      hostId: HOST,
      status: "planned",
    });
    (tableDatabase as any)[serviceMethod].mockResolvedValue(null);

    const res = await handler(makeRequest(), makeParams());

    expect(res.status).toBe(409);
    expect((tableDatabase as any)[serviceMethod]).toHaveBeenCalledWith(TABLE_ID, HOST);
  });

  it("succeeds (200) when the host calls it and the guarded transition returns a record", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(HOST);
    (tableDatabase.getTableHostAndStatus as jest.Mock).mockResolvedValue({
      hostId: HOST,
      status: "planned",
    });
    (tableDatabase as any)[serviceMethod].mockResolvedValue({
      id: TABLE_ID,
      hostId: HOST,
      title: "Test Table",
      status: "live",
    });

    const res = await handler(makeRequest(), makeParams());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.table.id).toBe(TABLE_ID);
  });
});
