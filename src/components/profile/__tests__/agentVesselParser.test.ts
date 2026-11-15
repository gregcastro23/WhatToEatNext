/**
 * @jest-environment node
 *
 * (node, not jsdom: the real `resolveAgentAppearance` calls `structuredClone`,
 * which jsdom's global does not expose.)
 *
 * The vessel block, from the REAL producers. `routeVessel` repeats the route's
 * projection (users/[userId]/route.ts:213-227 and :484-498) over the real
 * `computeAgentProgression` and `resolveAgentAppearance`, then the body goes
 * through JSON so it is wire-shaped (a NaN would become null, as it would leave
 * the route). The corpus is every agent id in the appearance manifest.
 *
 * What the real corpus reaches, MEASURED 2026-11-14 with `now` fixed: all 75
 * agents come back `progressionStatus: "estimated"` with a numeric
 * `xpToNextLevel`, `statDeltas` present, and no non-finite number anywhere. The
 * `live` and `unavailable` statuses and the capped `xpToNextLevel: null` are NOT
 * reached by this data; they are pinned with synthetic bodies in
 * agentVesselParser.guards.test.ts.
 */
import { computeAgentProgression } from "@/lib/agents/levelingService";
import {
  VESSEL_APPEARANCE_MANIFEST,
  resolveAgentAppearance,
} from "@/lib/agents/vessel-appearance-manifest";
import { parseAgentVessel } from "../agentVesselParser";

const NOW = Date.parse("2026-11-12T09:30:00.000Z");
const ELEMENTS = { spirit: 5000, essence: 4200, matter: 3800, substance: 3500 };

function routeVessel(id: string, withElements: boolean): Record<string, unknown> {
  const progression = computeAgentProgression(
    { id, name: id, consciousness: withElements ? { alchemicalElements: ELEMENTS } : {} },
    { now: NOW },
  );
  return {
    level: progression.vesselLevel,
    totalXp: progression.totalXp,
    xpToNextLevel: progression.xpToNextLevel,
    levelBoost: progression.levelBoost,
    baseOverall: progression.baseOverall,
    trainedOverall: progression.trainedOverall,
    currentOverall: progression.currentOverall,
    transitDelta: progression.transitDelta,
    progressionStatus: progression.progressionStatus,
    archetype: progression.archetype,
    stats: progression.stats,
    statDeltas: progression.statDeltas,
    appearance: resolveAgentAppearance(id),
  };
}

function onTheWire(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

/** Key-order-insensitive serialisation: the parser need not emit keys in the producer's order. */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, entry: unknown) =>
    typeof entry === "object" && entry !== null && !Array.isArray(entry)
      ? Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b)))
      : entry,
  );
}

const IDS = Object.keys(VESSEL_APPEARANCE_MANIFEST);

describe("parseAgentVessel over the real producers", () => {
  it("the corpus is not vacuous", () => {
    expect(IDS.length).toBeGreaterThan(20);
  });

  it.each([[false], [true]])(
    "reproduces every manifest agent's vessel exactly, with no issues (alchemicalElements: %s)",
    (withElements): void => {
      const mismatched: string[] = [];
      const reported: string[] = [];
      for (const id of IDS) {
        const wire = onTheWire(routeVessel(id, withElements));
        const issues: string[] = [];
        const parsed = parseAgentVessel(wire, issues);
        if (canonical(parsed) !== canonical(wire)) mismatched.push(id);
        reported.push(...issues.map((issue) => `${id}: ${issue}`));
      }
      expect(mismatched).toEqual([]);
      expect(reported).toEqual([]);
    },
  );

  it("a human has no vessel: null is a normal answer and reports nothing", () => {
    const issues: string[] = [];
    expect(parseAgentVessel(null, issues)).toBeNull();
    expect(parseAgentVessel(undefined, issues)).toBeNull();
    expect(issues).toEqual([]);
  });
});
