/**
 * The companions contract, run through the REAL guards over rows shaped exactly
 * like production's on 2026-10-12.
 *
 * That day `/commensal` showed "Unable to retrieve planetary companions" on every
 * tab. The route returned 10 active, 30 historical and 2,924 roster agents and
 * the all-or-nothing guard rejected 10/10, 30/30 and 2,923/2,924 of them — each
 * on BOTH `birthData` and `natalChart` — so one malformed row blanked the panel.
 *
 * Every negative below is read against a positive control built by hand: a guard
 * that rejects everything would "reproduce" the outage too, and prove nothing.
 */

import {
  isBirthData,
  isCompanionSuggestion,
  isCompanionsResponse,
  parseCompanionsResponse,
} from "@/types/apiResponses";
import {
  adamSmithAgenticRow,
  adamSmithLegacyRow,
  avicennaRow,
  degreeAgentRow,
  freudRow,
  homerRow,
  legacyWireRow,
  moonPhaseRow,
  placeholderAgentRow,
  socratesLegacyRow,
  socratesRow,
  validCompanion,
  validNatalChart,
  yearOnlyRow,
  type AgentDbRow,
} from "../helpers/companionFixtures";

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

/** The rows production could not display, as the replaced route put them on the wire. */
const REJECTED: ReadonlyArray<readonly [string, () => AgentDbRow]> = [
  ["a degree agent ({} / {})", () => degreeAgentRow()],
  ["a moon-phase agent ({} / {})", moonPhaseRow],
  ["a historical agent ({date,time,location-string} + legacy chart)", freudRow],
  ["a year-980 historical agent", avicennaRow],
  ["an @agentic twin", adamSmithAgenticRow],
  ["an @agents legacy twin (ISO date, object location)", adamSmithLegacyRow],
  ["a year-1 / (0,0) placeholder", homerRow],
  ["a year-1 row with a real place", socratesRow],
  ["a 470 BC row (ISO expanded year)", socratesLegacyRow],
  ["a year-only birth filed at (0, 0)", yearOnlyRow],
];

describe("positive control: a hand-built valid companion", () => {
  it("passes the item guard and the strict response guard", () => {
    const companion = validCompanion();
    expect(isCompanionSuggestion(companion)).toBe(true);
    expect(isCompanionsResponse(envelope({ cosmicRoster: [companion] }))).toBe(true);
  });

  it("passes with a complete chart, and with an unknown element", () => {
    const { birthData } = validCompanion();
    if (birthData === null) throw new Error("fixture must carry a birth");
    expect(
      isCompanionSuggestion(validCompanion({ natalChart: validNatalChart(birthData) })),
    ).toBe(true);
    expect(isCompanionSuggestion(validCompanion({ dominantElement: null }))).toBe(true);
  });

  it("passes a flagged companion that has no birth data and therefore no chart", () => {
    expect(
      isCompanionSuggestion(validCompanion({ birthData: null, natalChart: null })),
    ).toBe(true);
  });
});

describe("negative control: birthData {} must fail", () => {
  it("isBirthData stays strict — {} is a malformed record, not an absent one", () => {
    expect(isBirthData({})).toBe(false);
    expect(isBirthData(null)).toBe(false);
    expect(isBirthData({ date: "1856-05-06", time: "18:30", location: "{}" })).toBe(false);
  });

  it("rejects the same companion once its birthData is {}", () => {
    expect(isCompanionSuggestion({ ...validCompanion(), birthData: {} })).toBe(false);
  });

  it("a flagged (null) birth cannot carry a chart", () => {
    const { birthData } = validCompanion();
    if (birthData === null) throw new Error("fixture must carry a birth");
    const chart = validNatalChart(birthData);
    expect(isCompanionSuggestion(validCompanion({ birthData: null, natalChart: chart }))).toBe(
      false,
    );
  });
});

describe("rows as production held them", () => {
  it.each(REJECTED)("rejects %s", (_label, build) => {
    expect(isCompanionSuggestion(legacyWireRow(build()))).toBe(false);
  });

  it.each(REJECTED)("rejects %s on BOTH fields, independently", (_label, build) => {
    const wire = legacyWireRow(build());
    const { birthData } = validCompanion();
    // Repair one field at a time: the other must still fail on its own.
    expect(isCompanionSuggestion({ ...wire, birthData })).toBe(false);
    expect(isCompanionSuggestion({ ...wire, natalChart: null })).toBe(false);
  });

  it("passes the ONE row that did: the agent placeholder, valid in shape and not a birth", () => {
    expect(isCompanionSuggestion(legacyWireRow(placeholderAgentRow()))).toBe(true);
  });

  it("is all-or-nothing in the strict guard: one valid row among the rest changes nothing", () => {
    const rows = [placeholderAgentRow(), ...REJECTED.map(([, build]) => build())].map(
      legacyWireRow,
    );
    expect(isCompanionsResponse(envelope({ cosmicRoster: rows }))).toBe(false);
  });
});

describe("parseCompanionsResponse: failure is per row", () => {
  it("keeps the rows that satisfy the contract and counts the rest, across all four lists", () => {
    const good = validCompanion();
    const bad = legacyWireRow(degreeAgentRow());
    const parsed = parseCompanionsResponse(
      envelope({
        activeAgents: [bad, good],
        historicalAgents: [good, bad, bad],
        cosmicRoster: [bad, good, good],
        savedCompanions: [bad],
      }),
    );
    expect(parsed).not.toBeNull();
    expect(parsed?.dropped).toBe(5);
    const { response } = parsed ?? {};
    if (response === undefined || response.success !== true) throw new Error("expected success");
    expect(response.activeAgents).toEqual([good]);
    expect(response.historicalAgents).toEqual([good]);
    expect(response.cosmicRoster).toEqual([good, good]);
    expect(response.savedCompanions).toEqual([]);
  });

  it("survives the entire 2026-10-12 roster: only the placeholder is kept, the other 8 classes are counted", () => {
    const rows = [placeholderAgentRow(), ...REJECTED.map(([, build]) => build())].map(
      legacyWireRow,
    );
    const parsed = parseCompanionsResponse(envelope({ cosmicRoster: rows }));
    expect(parsed?.dropped).toBe(REJECTED.length);
    expect(
      parsed?.response.success === true ? parsed.response.cosmicRoster.length : -1,
    ).toBe(1);
  });

  it("agrees with the strict guard: strict is exactly 'nothing dropped'", () => {
    const inputs: unknown[] = [
      envelope(),
      envelope({ cosmicRoster: [validCompanion()] }),
      envelope({ cosmicRoster: [legacyWireRow(freudRow())] }),
      envelope({ degraded: true }),
      { success: false },
      { success: false, message: "nope" },
    ];
    for (const input of inputs) {
      expect(isCompanionsResponse(input)).toBe(parseCompanionsResponse(input)?.dropped === 0);
    }
  });

  it("returns null only for a broken ENVELOPE", () => {
    const broken: unknown[] = [
      null,
      undefined,
      "success",
      [],
      envelope({ activeAgents: "none" }),
      envelope({ cosmicRoster: undefined }),
      envelope({ savedCompanions: { 0: validCompanion() } }),
      envelope({ degraded: "yes" }),
      { success: "yes" },
      { success: false, message: 5 },
    ];
    for (const input of broken) {
      expect(parseCompanionsResponse(input)).toBeNull();
      expect(isCompanionsResponse(input)).toBe(false);
    }
  });

  it("reads a failure response as a failure, with its message", () => {
    expect(parseCompanionsResponse({ success: false, message: "down" })).toEqual({
      response: { success: false, message: "down" },
      dropped: 0,
    });
    expect(parseCompanionsResponse({})).toEqual({ response: { success: false }, dropped: 0 });
  });
});

describe("element contract", () => {
  it("accepts unknown, never an invented value", () => {
    expect(isCompanionSuggestion(validCompanion({ dominantElement: null }))).toBe(true);
    expect(isCompanionSuggestion({ ...validCompanion(), dominantElement: "Spirit" })).toBe(false);
    expect(isCompanionSuggestion({ ...validCompanion(), dominantElement: undefined })).toBe(false);
  });

  it("treats an activation's element the same way", () => {
    const activation = {
      strength: 0.71,
      dignity: "peregrine",
      planetaryRuler: "Mars",
      description: "Mars at 8 Leo",
    };
    expect(
      isCompanionSuggestion({ ...validCompanion(), activation: { ...activation, element: "Fire" } }),
    ).toBe(true);
    expect(
      isCompanionSuggestion({ ...validCompanion(), activation: { ...activation, element: null } }),
    ).toBe(true);
    expect(
      isCompanionSuggestion({ ...validCompanion(), activation: { ...activation, element: "Spirit" } }),
    ).toBe(false);
  });
});
