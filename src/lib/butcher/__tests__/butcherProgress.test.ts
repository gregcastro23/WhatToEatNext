/**
 * @jest-environment jsdom
 *
 * Species Mastery persistence: v2 schema, backward-compatible migration from
 * `alchm.butcher.progress.v1`, and rank thresholds.
 */
import {
  BUTCHER_PROGRESS_STORAGE_KEY,
  BUTCHER_PROGRESS_STORAGE_KEY_V1,
  defaultButcherProgress,
  masteryRank,
  migrateProgressV1,
  readButcherProgress,
  recordButcherResult,
} from "@/lib/butcher/science/butcherProgress";
import type { ButcherOrderScore } from "@/lib/butcher/types";

const V1_RECORD = {
  completedOrders: 7, currentStreak: 2, bestStreak: 4, bestScore: 91.5,
  tierCompleted: { apprentice: 4, journeyman: 2, master: 1 },
};

function score(passed: boolean, totalScore: number): ButcherOrderScore {
  return {
    cutAccuracyScore: 100, grainAngleScore: 100, portionPrecisionScore: 100, thermalPairingScore: 0,
    totalScore, grade: passed ? "A" : "D", passed, feedback: [], stepScores: [], yields: [],
  };
}

describe("butcher progress v2 + species mastery", () => {
  beforeEach(() => window.localStorage.clear());

  it("migrates a v1 record: totals kept, mastery zeroed, v2 written, v1 left untouched", () => {
    const v1Raw = JSON.stringify(V1_RECORD);
    window.localStorage.setItem(BUTCHER_PROGRESS_STORAGE_KEY_V1, v1Raw);
    const progress = readButcherProgress();
    expect(progress.completedOrders).toBe(7);
    expect(progress.tierCompleted).toEqual(V1_RECORD.tierCompleted);
    expect(progress.speciesMastery.beef).toEqual({ passed: 0, masterPassed: 0, bestScore: 0 });
    expect(window.localStorage.getItem(BUTCHER_PROGRESS_STORAGE_KEY_V1)).toBe(v1Raw);
    const stored: unknown = JSON.parse(window.localStorage.getItem(BUTCHER_PROGRESS_STORAGE_KEY) ?? "null");
    expect(stored).toMatchObject({ version: 2, completedOrders: 7 });
    expect(readButcherProgress()).toEqual(progress);
  });

  it("prefers a valid v2 record over v1", () => {
    window.localStorage.setItem(BUTCHER_PROGRESS_STORAGE_KEY_V1, JSON.stringify(V1_RECORD));
    const next = recordButcherResult(defaultButcherProgress(), score(true, 88), "apprentice", "pork");
    expect(readButcherProgress()).toEqual(next);
    expect(readButcherProgress().completedOrders).toBe(1);
  });

  it("falls back to defaults on corrupt or invalid storage", () => {
    window.localStorage.setItem(BUTCHER_PROGRESS_STORAGE_KEY, "{not json");
    window.localStorage.setItem(BUTCHER_PROGRESS_STORAGE_KEY_V1, JSON.stringify({ ...V1_RECORD, bestScore: 140 }));
    expect(readButcherProgress()).toEqual(defaultButcherProgress());
    expect(migrateProgressV1({ completedOrders: -1 })).toBeNull();
  });

  it("credits the ticket's species and counts master passes separately", () => {
    let p = defaultButcherProgress();
    p = recordButcherResult(p, score(true, 80), "journeyman", "lamb");
    p = recordButcherResult(p, score(false, 40), "journeyman", "lamb");
    p = recordButcherResult(p, score(true, 96), "master", "lamb");
    expect(p.speciesMastery.lamb).toEqual({ passed: 2, masterPassed: 1, bestScore: 96 });
    expect(p.speciesMastery.beef.passed).toBe(0);
    expect(p.currentStreak).toBe(1);
  });

  it("ranks Unranked → Initiate → Journeyman → Master (master needs a Master-tier pass)", () => {
    expect(masteryRank({ passed: 0, masterPassed: 0, bestScore: 0 })).toBe("Unranked");
    expect(masteryRank({ passed: 1, masterPassed: 0, bestScore: 70 })).toBe("Initiate");
    expect(masteryRank({ passed: 3, masterPassed: 0, bestScore: 70 })).toBe("Journeyman");
    expect(masteryRank({ passed: 9, masterPassed: 0, bestScore: 99 })).toBe("Journeyman");
    expect(masteryRank({ passed: 6, masterPassed: 1, bestScore: 99 })).toBe("Master");
  });
});
