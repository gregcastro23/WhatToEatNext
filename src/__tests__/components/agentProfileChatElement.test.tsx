/**
 * The agent chat and the hero badge are given the agent's classical ELEMENT.
 * AgentProfile used to special-case the string "Spirit" in the chat props, but
 * Spirit is an ESMS quantity, not an element (src/lib/agents/consciousnessAxes.ts,
 * CONTEXT.md). With no consciousness block the page's own element default, Fire,
 * is what both get.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import AgentProfile from "@/app/(alchm)/profile/[userId]/AgentProfile";
import type { CraftedAgentProfile, Element } from "@/lib/agents/craftedAgentTypes";

jest.mock("@/components/time-laboratory/planetary-agent-chat", () => {
  return function MockPlanetaryAgentChat({
    agent,
  }: {
    agent: { element: string; planetaryRuler: string };
  }) {
    return (
      <div
        data-testid="mock-agent-chat"
        data-element={agent.element}
        data-ruler={agent.planetaryRuler}
      >
        Planetary Chat Modal
      </div>
    );
  };
});

const BALANCES = { spirit: 15, essence: 25, matter: 10, substance: 8 };

function openChatPropsFor(agent: CraftedAgentProfile): {
  element: string | null;
  planetaryRuler: string | null;
} {
  render(<AgentProfile agent={agent} balances={BALANCES} handle="leonardo@agentic.alchm.kitchen" recentActivity={[]} userId="leonardo-uid" />);
  const buttons = screen.getAllByRole("button", { name: /Commune with Leonardo/i });
  const last = buttons[buttons.length - 1];
  if (last === undefined) throw new Error("no commune button");
  fireEvent.click(last);
  const el = screen.getByTestId("mock-agent-chat");
  return {
    element: el.getAttribute("data-element"),
    planetaryRuler: el.getAttribute("data-ruler"),
  };
}

function chatElementFor(agent: CraftedAgentProfile): string | null {
  return openChatPropsFor(agent).element;
}

const ELEMENTS: Array<[Element]> = [["Fire"], ["Water"], ["Earth"], ["Air"]];

const BADGE: Array<[Element, string]> = [["Fire", "text-red-400"], ["Water", "text-blue-400"], ["Earth", "text-purple-400"], ["Air", "text-emerald-400"]];

describe("the hero badge", () => {
  afterEach(cleanup);

  it.each(BADGE)("names %s and wears its colour (%s)", (element, colour) => {
    render(<AgentProfile agent={{ name: "Leonardo da Vinci", consciousness: { dominantElement: element } }} balances={BALANCES} handle="leonardo@agentic.alchm.kitchen" recentActivity={[]} userId="leonardo-uid" />);
    expect(screen.getAllByText(element).some((node) => node.className.includes(colour))).toBe(true);
  });
});

describe("the element AgentProfile gives the chat", () => {
  afterEach(cleanup);

  it.each(ELEMENTS)("%s is passed through as it is", (element) => {
    const agent: CraftedAgentProfile = { name: "Leonardo da Vinci", consciousness: { dominantElement: element } };
    expect(chatElementFor(agent)).toBe(element);
  });

  it("an agent with no consciousness block gets the page's own default, Fire", () => {
    expect(chatElementFor({ name: "Leonardo da Vinci" })).toBe("Fire");
  });

  it.each(ELEMENTS)(
    "passes planetaryRuler='Sun' rather than dominantElement (%s) to the chat",
    (element) => {
      const agent: CraftedAgentProfile = {
        name: "Leonardo da Vinci",
        consciousness: { dominantElement: element },
      };
      expect(openChatPropsFor(agent)).toEqual({
        element,
        planetaryRuler: "Sun",
      });
    },
  );
});
