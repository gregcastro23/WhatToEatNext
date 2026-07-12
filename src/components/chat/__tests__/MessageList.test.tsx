import { render, screen } from "@testing-library/react";
import { MessageList } from "@/components/chat/MessageList";
import { linkify } from "@/components/chat/linkify";
import type { ChatMessage } from "@/types/chat";

// Real historical-agent identities only in fixtures (design-spec §4.8).
const CURIE = "11111111-1111-1111-1111-111111111111";
const TESLA = "22222222-2222-2222-2222-222222222222";

function message(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: "m1",
    conversationId: "c1",
    senderId: TESLA,
    body: "Alternating currents in the broth",
    attachments: [],
    createdAt: "2026-07-11T18:00:00Z",
    editedAt: null,
    deletedAt: null,
    senderName: "Nikola Tesla",
    ...overrides,
  };
}

describe("MessageList", () => {
  it("renders an empty state when there are no messages", () => {
    render(<MessageList messages={[]} viewerId={CURIE} emptyLabel="Say the first word." />);
    expect(screen.getByText("Say the first word.")).toBeInTheDocument();
  });

  it("shows another member's name and body on an 'other' bubble", () => {
    render(<MessageList messages={[message({})]} viewerId={CURIE} />);
    expect(screen.getByText("Nikola Tesla")).toBeInTheDocument();
    expect(screen.getByText("Alternating currents in the broth")).toBeInTheDocument();
  });

  it("renders a deleted message as a tombstone, never its body", () => {
    render(
      <MessageList
        messages={[message({ body: "secret", deletedAt: "2026-07-11T19:00:00Z" })]}
        viewerId={CURIE}
      />,
    );
    expect(screen.getByText("Message removed")).toBeInTheDocument();
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("shows a load-earlier control only when hasMore is set", () => {
    const { rerender } = render(
      <MessageList messages={[message({})]} viewerId={CURIE} onLoadEarlier={() => {}} hasMore />,
    );
    expect(screen.getByRole("button", { name: "Load earlier" })).toBeInTheDocument();

    rerender(<MessageList messages={[message({})]} viewerId={CURIE} onLoadEarlier={() => {}} hasMore={false} />);
    expect(screen.queryByRole("button", { name: "Load earlier" })).not.toBeInTheDocument();
  });
});

describe("linkify — only http(s) links, safe rel", () => {
  it("linkifies an https URL with rel noopener noreferrer nofollow ugc", () => {
    render(<p>{linkify("see https://alchm.kitchen/recipes here")}</p>);
    const link = screen.getByRole("link", { name: "https://alchm.kitchen/recipes" });
    expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow ugc");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("does not linkify non-http schemes", () => {
    render(<p>{linkify("javascript:alert(1) and ftp://x.y")}</p>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
