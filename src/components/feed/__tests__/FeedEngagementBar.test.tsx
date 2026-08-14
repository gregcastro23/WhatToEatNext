/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { FeedEngagementBar } from "../FeedEngagementBar";

jest.mock("@/components/feed/CommentThread", () => ({
  CommentThread: () => null,
}));

jest.mock("@/lib/economy/practiceClient", () => ({
  revealPracticeReward: jest.fn(),
}));

describe("FeedEngagementBar incoming totals", () => {
  it("refreshes the comment total when the same event receives a new count", () => {
    const { rerender } = render(<FeedEngagementBar eventId="event-1" commentCount={2} />);

    expect(screen.getByRole("button", { name: "Show comments (2)" })).toBeInTheDocument();

    rerender(<FeedEngagementBar eventId="event-1" commentCount={7} />);

    expect(screen.getByRole("button", { name: "Show comments (7)" })).toBeInTheDocument();
  });

  it("refreshes reaction totals when the same event receives new counts", () => {
    const { rerender } = render(
      <FeedEngagementBar eventId="event-1" initialCounts={{ fire: 2 }} />,
    );

    expect(screen.getByRole("button", { name: "React with Fire" })).toHaveTextContent("2");

    rerender(<FeedEngagementBar eventId="event-1" initialCounts={{ fire: 5 }} />);

    expect(screen.getByRole("button", { name: "React with Fire" })).toHaveTextContent("5");
  });
});
