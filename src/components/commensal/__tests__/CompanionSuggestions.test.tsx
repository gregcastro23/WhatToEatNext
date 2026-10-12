/** @jest-environment jsdom */

/**
 * The Cosmic Dining Companions panel: failure is per row.
 *
 * On 2026-10-12 `/commensal` showed "Unable to retrieve planetary companions" on
 * every tab, because one all-or-nothing guard rejected the response when any
 * companion — in production, nearly all of them — was malformed.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { CompanionSuggestion } from "@/types/apiResponses";
import {
  degreeAgentRow,
  freudRow,
  homerRow,
  legacyWireRow,
  placeholderAgentRow,
  validCompanion,
} from "../../../__tests__/helpers/companionFixtures";
import { installFetchMock } from "../../../__tests__/helpers/fetchMock";
import { CompanionSuggestions } from "../CompanionSuggestions";

jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const ERROR_TEXT = "Unable to retrieve planetary companions. Check back shortly.";

function respondWith(body: unknown, ok = true): void {
  installFetchMock(
    jest.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) }),
  );
}

function envelope(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    success: true,
    activeAgents: [],
    historicalAgents: [],
    cosmicRoster: [],
    savedCompanions: [],
    degraded: false,
    ...overrides,
  };
}

/** What the new route emits for an active degree agent: listed, with no chart. */
function activeDegreeAgent(slug: string, name: string, element: "Fire" | "Water"): CompanionSuggestion {
  return validCompanion({
    userId: `id-${slug}`,
    email: `${slug}@agentic.alchm.kitchen`,
    name,
    dominantElement: element,
    birthData: null,
    natalChart: null,
    activation: {
      strength: 0.71,
      dignity: "peregrine",
      element,
      planetaryRuler: name.split(" ")[0] ?? "Sun",
      description: `${name} is active.`,
    },
  });
}

function renderPanel(onInvite = jest.fn()) {
  render(<CompanionSuggestions onInvite={onInvite} activeGuests={[]} />);
  return onInvite;
}

describe("the pre-fix production payload", () => {
  it("no longer blanks the panel: the error box is gone and the loss is stated", async () => {
    // Every class production held, put on the wire the way the replaced route did.
    respondWith(
      envelope({
        activeAgents: [degreeAgentRow("mars-leo-8", "Mars Leo 8")].map(legacyWireRow),
        historicalAgents: [freudRow()].map(legacyWireRow),
        cosmicRoster: [placeholderAgentRow(), freudRow(), homerRow()].map(legacyWireRow),
      }),
    );
    renderPanel();

    // 1 active + 1 historical + 2 of 3 roster rows are malformed; the placeholder is valid in shape.
    expect(await screen.findByText(/4 companions couldn't be shown/)).toBeInTheDocument();
    expect(screen.queryByText(ERROR_TEXT)).not.toBeInTheDocument();
    expect(screen.getByText("No Companions Aligned")).toBeInTheDocument();
  });
});

describe("one bad row among good ones", () => {
  const mars = activeDegreeAgent("mars-leo-8", "Mars Leo 8", "Fire");
  const mercury = activeDegreeAgent("mercury-scorpio-14", "Mercury Scorpio 14", "Water");
  const freud = validCompanion();
  const kepler = validCompanion({ userId: "kepler", name: "Johannes Kepler 1571" });
  const malformed = { ...validCompanion({ userId: "bad", name: "Malformed" }), birthData: {} };

  beforeEach(() => {
    respondWith(
      envelope({
        activeAgents: [mars, mercury, malformed],
        cosmicRoster: [freud, malformed, kepler],
      }),
    );
  });

  it("lists the active agents on the Planetary tab, each with the element it really has", async () => {
    renderPanel();
    expect(await screen.findByText("Mars Leo 8")).toBeInTheDocument();
    expect(screen.getByText("Mercury Scorpio 14")).toBeInTheDocument();
    expect(screen.getByText("Fire")).toBeInTheDocument();
    expect(screen.getByText("Water")).toBeInTheDocument();
    expect(screen.queryByText(ERROR_TEXT)).not.toBeInTheDocument();
    expect(screen.getByText(/2 companions couldn't be shown/)).toBeInTheDocument();
  });

  it("offers no seat to an agent with no chart", async () => {
    const onInvite = renderPanel();
    await screen.findByText("Mars Leo 8");
    const buttons = screen.getAllByRole("button", { name: "No natal chart" });
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("title", expect.stringContaining("cannot be seated"));
      fireEvent.click(button);
    }
    expect(onInvite).not.toHaveBeenCalled();
  });

  it("seats a charted companion on the Cosmic tab, with the birth the server sent", async () => {
    const onInvite = renderPanel();
    await screen.findByText("Mars Leo 8");
    fireEvent.click(screen.getByRole("button", { name: "Cosmic" }));

    expect(screen.getByText("Sigmund Freud 1856")).toBeInTheDocument();
    expect(screen.getByText("Johannes Kepler 1571")).toBeInTheDocument();
    expect(screen.queryByText("Malformed")).not.toBeInTheDocument();

    const invites = screen.getAllByRole("button", { name: "Invite to Table" });
    expect(invites).toHaveLength(2);
    const [first] = invites;
    if (first === undefined) throw new Error("expected an invite button");
    fireEvent.click(first);
    expect(onInvite).toHaveBeenCalledTimes(1);
    expect(onInvite).toHaveBeenCalledWith(freud.userId, freud.name, freud.birthData, null);
  });

  it("says nothing when nothing was lost", async () => {
    respondWith(envelope({ activeAgents: [mars] }));
    renderPanel();
    await screen.findByText("Mars Leo 8");
    expect(screen.queryByText(/couldn't be shown/)).not.toBeInTheDocument();
  });
});

describe("a response that is genuinely broken", () => {
  it.each([
    ["a list that is not a list", envelope({ activeAgents: "none" })],
    ["a non-boolean degraded flag", envelope({ degraded: "yes" })],
    ["no object at all", null],
  ])("still shows the error box for %s", async (_label, body) => {
    respondWith(body);
    renderPanel();
    expect(await screen.findByText(ERROR_TEXT)).toBeInTheDocument();
  });

  it("shows the error box when the server says it failed", async () => {
    respondWith({ success: false, message: "down" }, false);
    renderPanel();
    expect(await screen.findByText(ERROR_TEXT)).toBeInTheDocument();
  });

  it("still warns when a source is down, alongside whatever loaded", async () => {
    respondWith(envelope({ degraded: true, cosmicRoster: [validCompanion()] }));
    renderPanel();
    await waitFor(() =>
      expect(screen.getByText(/Some companion sources are temporarily unavailable/)).toBeInTheDocument(),
    );
  });
});
