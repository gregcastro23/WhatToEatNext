import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { TableLiveCollaborativePlanner } from "@/components/tables/TableLiveCollaborativePlanner";
import type { UseSpacetimeTableResult } from "@/hooks/useSpacetimeTable";

const mockVoteMeal = jest.fn().mockResolvedValue(true);
const mockSetCursor = jest.fn().mockResolvedValue(true);
const mockClearCursor = jest.fn().mockResolvedValue(true);


let mockHookReturn: UseSpacetimeTableResult = {
  live: true,
  session: null,
  presence: [],
  votes: [],
  cursors: [],
  votesByRecipeRef: {
    "rec-1": {
      recipeRef: "rec-1",
      recipeName: "Grilled Artichoke with Saffron Aioli",
      totalScore: 2,
      upvotes: 2,
      downvotes: 0,
      voters: [{ name: "Alex", score: 1, memberHex: "hex-alex" }, { name: "Sam", score: 1, memberHex: "hex-sam" }],
      viewerVote: 1,
    },
  },
  cursorsBySlotRef: {
    "rec-1": {
      slotRef: "rec-1",
      activeGuests: [
        { memberHex: "hex-sam", displayName: "Sam", colorHex: "#3B82F6", updatedAtMs: Date.now() },
      ],
    },
  },
  viewerHex: "hex-viewer",
  voteMeal: mockVoteMeal,
  setCursor: mockSetCursor,
  clearCursor: mockClearCursor,
};

jest.mock("@/hooks/useSpacetimeTable", () => ({
  useSpacetimeTable: () => mockHookReturn,
}));

describe("TableLiveCollaborativePlanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleMenu = [
    { name: "Grilled Artichoke with Saffron Aioli", course: "Appetizer", recipeRef: "rec-1" },
    { name: "Braised Fennel with Star Anise", course: "Main", recipeRef: "rec-2" },
  ];

  it("renders menu items with courses and consensus score indicator", () => {
    render(
      <TableLiveCollaborativePlanner
        tableId="tbl-123"
        menu={sampleMenu}
        canVote={true}
        viewerId="usr-1"
      />,
    );

    expect(screen.getByText("Grilled Artichoke with Saffron Aioli")).toBeInTheDocument();
    expect(screen.getByText("Braised Fennel with Star Anise")).toBeInTheDocument();
    expect(screen.getByText("Appetizer")).toBeInTheDocument();
    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.getByText("Live Consensus")).toBeInTheDocument();
  });

  it("displays active guest presence badge on active course slot", () => {
    render(
      <TableLiveCollaborativePlanner
        tableId="tbl-123"
        menu={sampleMenu}
        canVote={true}
        viewerId="usr-1"
      />,
    );

    expect(screen.getByText("Sam")).toBeInTheDocument();
  });

  it("invokes voteMeal when a voting button is clicked", async () => {
    render(
      <TableLiveCollaborativePlanner
        tableId="tbl-123"
        menu={sampleMenu}
        canVote={true}
        viewerId="usr-1"
      />,
    );

    const dislikeButtons = screen.getAllByLabelText(/Vote restriction or dislike/i);
    expect(dislikeButtons.length).toBe(2);

    await act(async () => {
      fireEvent.click(dislikeButtons[0]);
    });

    expect(mockVoteMeal).toHaveBeenCalledWith(
      "rec-1",
      "Grilled Artichoke with Saffron Aioli",
      -1,
    );
  });


  it("invokes setCursor and clearCursor on mouse hover and leave", () => {
    render(
      <TableLiveCollaborativePlanner
        tableId="tbl-123"
        menu={sampleMenu}
        canVote={true}
        viewerId="usr-1"
      />,
    );

    const loveButtons = screen.getAllByLabelText(/Vote love for/i);
    fireEvent.mouseEnter(loveButtons[0]);
    expect(mockSetCursor).toHaveBeenCalledWith("rec-1");

    fireEvent.mouseLeave(loveButtons[0]);
    expect(mockClearCursor).toHaveBeenCalled();
  });

  it("renders course progression badges and advances stage on host click", () => {
    const handleStatusUpdate = jest.fn();
    render(
      <TableLiveCollaborativePlanner
        tableId="tbl-123"
        menu={sampleMenu}
        canVote={true}
        viewerId="usr-1"
        isHost={true}
        onUpdateCourseStatus={handleStatusUpdate}
      />,
    );

    const upNextBadges = screen.getAllByText("Up Next");
    expect(upNextBadges.length).toBe(2);

    // Host clicks to advance course stage
    fireEvent.click(upNextBadges[0]);
    expect(handleStatusUpdate).toHaveBeenCalledWith("rec-1", "prep");
    expect(screen.getByText("Prepping")).toBeInTheDocument();
  });
});

