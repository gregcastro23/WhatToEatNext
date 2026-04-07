/**
 * Tests for the commensals API route.
 * Verifies fetching of pending requests and unified companions listing.
 */
// Mock next/server before anything else
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
  NextRequest: class MockNextRequest {
    url: string;
    method?: string;
    body?: any;
    constructor(url: string, init?: any) {
      this.url = url;
      this.method = init?.method;
      this.body = init?.body;
    }
    async json() {
      return JSON.parse(this.body);
    }
  },
}));

import { GET } from "../route";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { commensalDatabase } from "@/services/commensalDatabaseService";

// Mock auth and database
jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/services/commensalDatabaseService", () => ({
  commensalDatabase: {
    getCommensalshipsForUser: jest.fn(),
    getLinkedCommensalsForUser: jest.fn(),
    getManualCompanionsForUser: jest.fn(),
  },
}));

describe("Commensals API (/api/commensals)", () => {
  const mockUserId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a 401 when unauthenticated", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);

    const req = new (jest.requireMock("next/server").NextRequest)("http://localhost:3000/api/commensals");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Authentication required");
  });

  it("should return a unified companions list containing both manual and linked companions", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(mockUserId);

    // Mock data
    (commensalDatabase.getCommensalshipsForUser as jest.Mock).mockResolvedValue([
      { status: "pending", requesterId: mockUserId, addresseeId: "user-456" }, // pendingSent
      { status: "accepted", requesterId: mockUserId, addresseeId: "user-789" }, // accepted
    ]);

    (commensalDatabase.getLinkedCommensalsForUser as jest.Mock).mockResolvedValue([
      { userId: "user-789", name: "Linked Friend", email: "friend@test.com", birthData: {}, natalChart: {} },
    ]);

    (commensalDatabase.getManualCompanionsForUser as jest.Mock).mockResolvedValue([
      { id: "manual-001", name: "Manual Friend", relationship: "Sister", birthData: {}, natalChart: {} },
    ]);

    const req = new (jest.requireMock("next/server").NextRequest)("http://localhost:3000/api/commensals");
    const response = await GET(req);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.pendingSent).toHaveLength(1);
    expect(data.accepted).toHaveLength(1);
    
    // Unified companions verification
    expect(data.companions).toHaveLength(2);
    expect(data.totalCompanions).toBe(2);
    expect(data.companions[0].type).toBe("manual");
    expect(data.companions[1].type).toBe("linked");
    expect(data.companions[1].id).toBe("user-789");
  });

  it("should return 500 when database throws an error", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(mockUserId);
    (commensalDatabase.getCommensalshipsForUser as jest.Mock).mockRejectedValue(new Error("DB_FAIL"));

    const req = new (jest.requireMock("next/server").NextRequest)("http://localhost:3000/api/commensals");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
