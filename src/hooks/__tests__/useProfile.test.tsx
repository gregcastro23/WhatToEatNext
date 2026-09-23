import { renderHook, waitFor } from "@testing-library/react";
import { useProfile } from "../useProfile";

const mockUseSession = jest.fn();
jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

jest.mock("@/lib/logger", () => ({
  _logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe("useProfile privacy and cache isolation", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("does not adopt foreign user's cached profile from localStorage and purges it", async () => {
    // User A left their profile in localStorage on a shared browser
    const foreignProfile = {
      userId: "user_A",
      name: "Alice A",
      email: "alice@example.com",
      natalChart: {
        dominantElement: "Fire",
        dominantModality: "Cardinal",
        ascendant: "aries",
        birthData: { dateTime: "1990-01-01T00:00:00Z", latitude: 10, longitude: 20 },
      },
    };
    localStorage.setItem("userProfile", JSON.stringify(foreignProfile));

    // User B is now logged in
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "user_B", name: "Bob B", email: "bob@example.com" },
      },
      status: "authenticated",
    });

    // Server returns user B's profile without a natal chart
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        profile: {
          userId: "user_B",
          name: "Bob B",
          email: "bob@example.com",
        },
      }),
    });

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // User B must NOT inherit User A's identity or natal chart
    expect(result.current.profileData?.userId).toBe("user_B");
    expect(result.current.profileData?.name).toBe("Bob B");
    expect(result.current.profileData?.email).toBe("bob@example.com");
    expect(result.current.profileData?.natalChart).toBeUndefined();

    // The foreign profile cache was purged from localStorage
    expect(localStorage.getItem("userProfile")).toBeNull();
  });

  it("restores cached natal chart when userId matches current session", async () => {
    const ownProfile = {
      userId: "user_B",
      name: "Bob B",
      email: "bob@example.com",
      natalChart: {
        dominantElement: "Water",
        dominantModality: "Fixed",
        ascendant: "scorpio",
        birthData: { dateTime: "1992-05-15T12:00:00Z", latitude: 40, longitude: -74 },
      },
    };
    localStorage.setItem("userProfile", JSON.stringify(ownProfile));

    mockUseSession.mockReturnValue({
      data: {
        user: { id: "user_B", name: "Bob B", email: "bob@example.com" },
      },
      status: "authenticated",
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        profile: {
          userId: "user_B",
          name: "Bob B",
          email: "bob@example.com",
        },
      }),
    });

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profileData?.userId).toBe("user_B");
    expect(result.current.profileData?.natalChart?.dominantElement).toBe("Water");
    expect(result.current.profileData?.natalChart?.ascendant).toBe("scorpio");
  });
});
