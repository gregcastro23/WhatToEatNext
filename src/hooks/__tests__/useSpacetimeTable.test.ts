import { renderHook, act } from "@testing-library/react";
import { useSpacetimeTable } from "@/hooks/useSpacetimeTable";

// Mock Spacetime config
let mockLiveEnabled = true;
jest.mock("@/lib/spacetime/config", () => ({
  isLiveTablesEnabled: () => mockLiveEnabled,
}));

// Mock Spacetime Context
const mockSubscription = {
  unsubscribe: jest.fn(),
};

const mockTableSession = {
  iter: jest.fn().mockReturnValue([
    { wtenTableId: "tbl-1", host: { toHexString: () => "hex-host" }, status: "live" },
  ]),
  onInsert: jest.fn(),
  onUpdate: jest.fn(),
  onDelete: jest.fn(),
  removeOnInsert: jest.fn(),
  removeOnUpdate: jest.fn(),
  removeOnDelete: jest.fn(),
};

const mockTablePresence = {
  iter: jest.fn().mockReturnValue([
    { wtenTableId: "tbl-1", member: { toHexString: () => "hex-guest" }, status: "active" },
  ]),
  onInsert: jest.fn(),
  onUpdate: jest.fn(),
  onDelete: jest.fn(),
  removeOnInsert: jest.fn(),
  removeOnUpdate: jest.fn(),
  removeOnDelete: jest.fn(),
};

const mockTableMealVote = {
  iter: jest.fn().mockReturnValue([
    {
      wtenTableId: "tbl-1",
      voter: { toHexString: () => "hex-viewer" },
      voterName: "Alex",
      recipeRef: "rec-1",
      recipeName: "Artichoke",
      voteScore: 1,
    },
  ]),
  onInsert: jest.fn(),
  onUpdate: jest.fn(),
  onDelete: jest.fn(),
  removeOnInsert: jest.fn(),
  removeOnUpdate: jest.fn(),
  removeOnDelete: jest.fn(),
};

const mockTableCursorPresence = {
  iter: jest.fn().mockReturnValue([
    {
      wtenTableId: "tbl-1",
      member: { toHexString: () => "hex-sam" },
      displayName: "Sam",
      currentSlotRef: "rec-1",
      colorHex: "#3B82F6",
      updatedAt: { toDate: () => new Date() },
    },
  ]),
  onInsert: jest.fn(),
  onUpdate: jest.fn(),
  onDelete: jest.fn(),
  removeOnInsert: jest.fn(),
  removeOnUpdate: jest.fn(),
  removeOnDelete: jest.fn(),
};

const mockReducers = {
  voteTableMeal: jest.fn().mockResolvedValue(undefined),
  updateTableCursor: jest.fn().mockResolvedValue(undefined),
  clearTableCursor: jest.fn().mockResolvedValue(undefined),
};

const mockDbConnection = {
  db: {
    table_session: mockTableSession,
    table_presence: mockTablePresence,
    table_meal_vote: mockTableMealVote,
    table_cursor_presence: mockTableCursorPresence,
  },
  reducers: mockReducers,
  subscriptionBuilder: () => ({
    onApplied: (cb: () => void) => {
      setTimeout(cb, 0);
      return {
        subscribe: () => mockSubscription,
      };
    },
  }),
};

let mockStatus: "connected" | "disconnected" = "connected";

jest.mock("@/contexts/SpacetimeContext", () => ({
  useSpacetime: () => ({
    connection: mockStatus === "connected" ? mockDbConnection : null,
    status: mockStatus,
    identityHex: "hex-viewer",
  }),
}));

describe("useSpacetimeTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLiveEnabled = true;
    mockStatus = "connected";
  });

  it("subscribes to SpacetimeDB table sessions, presence, votes, and cursors", async () => {
    const { result } = renderHook(() => useSpacetimeTable("tbl-1"));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current.live).toBe(true);
    expect(result.current.votesByRecipeRef["rec-1"]).toBeDefined();
    expect(result.current.votesByRecipeRef["rec-1"].totalScore).toBe(1);
    expect(result.current.votesByRecipeRef["rec-1"].viewerVote).toBe(1);
    expect(result.current.cursorsBySlotRef["rec-1"]).toBeDefined();
    expect(result.current.cursorsBySlotRef["rec-1"].activeGuests[0].displayName).toBe("Sam");
  });

  it("calls voteTableMeal reducer via voteMeal action", async () => {
    const { result } = renderHook(() => useSpacetimeTable("tbl-1"));

    let ok = false;
    await act(async () => {
      ok = await result.current.voteMeal("rec-2", "Fennel", 1);
    });

    expect(ok).toBe(true);
    expect(mockReducers.voteTableMeal).toHaveBeenCalledWith({
      wtenTableId: "tbl-1",
      recipeRef: "rec-2",
      recipeName: "Fennel",
      voteScore: 1,
    });
  });

  it("calls updateTableCursor and clearTableCursor reducers", async () => {
    const { result } = renderHook(() => useSpacetimeTable("tbl-1"));

    await act(async () => {
      await result.current.setCursor("rec-2", "#10B981");
    });

    expect(mockReducers.updateTableCursor).toHaveBeenCalledWith({
      wtenTableId: "tbl-1",
      currentSlotRef: "rec-2",
      colorHex: "#10B981",
    });

    await act(async () => {
      await result.current.clearCursor();
    });

    expect(mockReducers.clearTableCursor).toHaveBeenCalledWith({
      wtenTableId: "tbl-1",
    });
  });
});
