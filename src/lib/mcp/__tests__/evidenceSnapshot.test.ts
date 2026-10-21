jest.mock("@/lib/database/connection", () => ({ executeQuery: jest.fn() }));
jest.mock("@/lib/economy/triplicatePricing", () => ({ evaluateTriplicateSynastry: jest.fn() }));
jest.mock("@/lib/mcp/auth", () => ({ resolveCaller: jest.fn(), debitForTool: jest.fn() }));
jest.mock("@/lib/mcp/invocationLog", () => ({ recordInvocation: jest.fn() }));
jest.mock("@/lib/mcp/rateLimit", () => ({ checkMcpRateLimit: jest.fn() }));
jest.mock("@/lib/mcp/synastryTools", () => ({ computeSynastryOverlay: jest.fn(), getTransitNatalOverlay: jest.fn() }));
jest.mock("@/services/feedDatabaseService", () => ({ feedDatabase: {} }));
jest.mock("@/services/recipeReflectionsService", () => ({ recipeReflectionsService: {} }));
jest.mock("@/services/AlchemicalService", () => ({
  alchemicalService: {
    analyzeAlchemicalHarmony: jest.fn().mockReturnValue({
      overallHarmony: 0.8,
      dominantElement: "Fire",
      recommendations: [],
    }),
    calculateThermodynamicProperties: jest.fn().mockReturnValue({ heat: 0.6 }),
  },
}));
jest.mock("@/services/IngredientService", () => ({
  ingredientService: {
    getIngredientByName: jest.fn().mockReturnValue({
      name: "Tomato",
      category: "vegetable",
      elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
    }),
  },
}));
jest.mock("@/services/natalChartService", () => ({
  calculateNatalChart: jest.fn().mockResolvedValue({
    elementalBalance: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
    planetaryPositions: { Sun: "leo", Moon: "scorpio" },
  }),
}));
jest.mock("@/services/RecipeService", () => ({
  recipeService: {
    searchRecipes: jest.fn().mockResolvedValue([{
      id: "r1",
      name: "Tomato Soup",
      elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
      ingredients: [{ amount: 2, unit: "cups", name: "tomato" }],
      instructions: ["Simmer"],
    }]),
  },
}));

import { buildEvidenceSnapshot } from "@/lib/mcp/evidenceSnapshot";
import { createEvidenceSnapshot, getLiveSkyTransits } from "@/lib/mcp/tools";
import { alchemicalService } from "@/services/AlchemicalService";
import { ingredientService } from "@/services/IngredientService";
import { calculateNatalChart } from "@/services/natalChartService";
import { recipeService } from "@/services/RecipeService";

const capturedAt = "2026-10-17T12:00:00.000Z";
const mockedChart = jest.mocked(calculateNatalChart);
const mockedSearch = jest.mocked(recipeService.searchRecipes);

function successful(data: unknown) {
  return { status: "fulfilled" as const, value: { ok: true, data } };
}

describe("evidence snapshots", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(capturedAt));
    jest.clearAllMocks();
  });

  afterEach(() => jest.useRealTimers());

  it("uses one captured instant even if independent sources finish later", async () => {
    const chart = await calculateNatalChart({ dateTime: capturedAt, latitude: 40, longitude: -73 });
    mockedChart.mockClear();
    const deferred: { release?: () => void } = {};
    mockedChart.mockImplementationOnce(async () => {
      await new Promise<void>((resolve) => { deferred.release = resolve; });
      return chart;
    });

    const pending = createEvidenceSnapshot({ latitude: 40, longitude: -73 });
    // Recipe discovery starts before the sky source settles.
    expect(mockedSearch).toHaveBeenCalledTimes(1);
    jest.setSystemTime(new Date("2026-10-17T12:01:00.000Z"));
    deferred.release?.();
    const result = await pending;

    expect(mockedChart).toHaveBeenCalledTimes(1);
    expect(mockedChart.mock.calls[0]?.[0]).toEqual({
      dateTime: capturedAt, latitude: 40, longitude: -73, timezone: "UTC",
    });
    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({
      timestamp: capturedAt,
      createdAt: capturedAt,
      generatedAt: capturedAt,
      liveSky: { timestamp: capturedAt },
      provenance: { generatedAt: capturedAt },
    });
  });

  it("uses the calculation instant for a standalone live sky response", async () => {
    const chart = await calculateNatalChart({ dateTime: capturedAt, latitude: 40, longitude: -73 });
    mockedChart.mockClear();
    mockedChart.mockImplementationOnce(async () => {
      jest.setSystemTime(new Date("2026-10-17T12:01:00.000Z"));
      return chart;
    });

    const result = await getLiveSkyTransits({});
    expect(result.data).toMatchObject({ timestamp: capturedAt });
    expect(mockedChart.mock.calls[0]?.[0]).toMatchObject({ dateTime: capturedAt });
  });

  it("skips ingredient analysis explicitly when no ingredients were supplied", async () => {
    const result = await createEvidenceSnapshot({});

    expect(result.ok).toBe(true);
    expect(result.data?.status).toBe("complete");
    expect(result.data?.alchemicalScan).toBeNull();
    expect(result.data?.provenance.components.alchemicalScan).toMatchObject({
      status: "skipped", required: false, reason: "ingredients-not-provided", error: null,
    });
    expect(ingredientService.getIngredientByName).not.toHaveBeenCalled();
    expect(alchemicalService.analyzeAlchemicalHarmony).not.toHaveBeenCalled();
  });

  it("retains usable recipes and ingredient data when the sky source fails", async () => {
    mockedChart.mockRejectedValueOnce(new Error("private connection details"));
    const result = await createEvidenceSnapshot({ ingredients: ["tomato"] });

    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("INTERNAL");
    expect(result.data).toMatchObject({
      status: "partial",
      liveSky: null,
      alchemicalScan: { ingredientCount: 1 },
      candidateRecipes: { returnedCount: 1 },
      provenance: { components: {
        liveSky: { status: "failed", required: true, error: { code: "COMPONENT_FAILED" } },
        alchemicalScan: { status: "success" },
        candidateRecipes: { status: "success" },
      } },
    });
    expect(JSON.stringify(result.data)).not.toContain("private connection details");
  });

  it("reports an ingredient scan failure when ingredients were requested", async () => {
    jest.mocked(ingredientService.getIngredientByName).mockImplementationOnce(() => {
      throw new Error("catalog unavailable");
    });
    const result = await createEvidenceSnapshot({ ingredients: ["tomato"] });

    expect(result.ok).toBe(false);
    expect(result.data?.status).toBe("partial");
    expect(result.data?.alchemicalScan).toBeNull();
    expect(result.data?.provenance.components.alchemicalScan).toMatchObject({ status: "failed", required: true });
    expect(result.data?.provenance.components.liveSky.status).toBe("success");
    expect(result.data?.provenance.components.candidateRecipes.status).toBe("success");
  });

  it("treats incomplete sky data as failure rather than a successful source", async () => {
    const chart = await calculateNatalChart({ dateTime: capturedAt, latitude: 40, longitude: -73 });
    mockedChart.mockResolvedValueOnce({
      ...chart,
      elementalBalance: { Fire: Number.NaN, Water: 0.3, Earth: 0.2, Air: 0.1 },
    });
    const result = await createEvidenceSnapshot({});

    expect(result.ok).toBe(false);
    expect(result.data?.status).toBe("partial");
    expect(result.data?.liveSky).toBeNull();
    expect(result.data?.provenance.components.liveSky).toMatchObject({
      status: "failed", error: { code: "INTERNAL", message: "Sky calculation returned incomplete evidence" },
    });
    expect(result.data?.provenance.components.candidateRecipes.status).toBe("success");
  });

  it("reports total failure when both required sources fail", async () => {
    mockedChart.mockRejectedValueOnce(new Error("sky offline"));
    mockedSearch.mockRejectedValueOnce(new Error("recipe catalog offline"));
    const result = await createEvidenceSnapshot({});

    expect(result.ok).toBe(false);
    expect(result.data?.status).toBe("failed");
    expect(result.data?.provenance.components.liveSky.status).toBe("failed");
    expect(result.data?.provenance.components.candidateRecipes.status).toBe("failed");
    expect(result.data?.provenance.components.alchemicalScan.status).toBe("skipped");
  });

  it("produces serializable detached frozen data and PA-compatible aliases", async () => {
    const result = await createEvidenceSnapshot({ ingredients: ["tomato"] });
    const snapshot = result.data;
    if (!snapshot) throw new Error("Expected evidence snapshot");
    const serialized = JSON.stringify(snapshot);
    const chart = await calculateNatalChart({ dateTime: capturedAt, latitude: 40, longitude: -73 });
    chart.elementalBalance.Fire = 0.9;
    try {
      expect(JSON.stringify(snapshot)).toBe(serialized);
      expect(snapshot.skyTransits).toBe(snapshot.liveSky);
      expect(snapshot.recipeCandidates).toBe(snapshot.candidateRecipes);
      expect(Object.isFrozen(snapshot)).toBe(true);
      expect(Object.isFrozen(snapshot.liveSky)).toBe(true);
      expect(Object.isFrozen(snapshot.provenance.components.liveSky)).toBe(true);
      expect(snapshot.contentHash).toMatch(/^[a-f0-9]{64}$/);
      expect(snapshot.snapshotId).toMatch(/^[a-f0-9-]{36}$/);
    } finally {
      chart.elementalBalance.Fire = 0.4;
    }
  });

  it("hashes equivalent evidence deterministically while keeping unique invocation identities", () => {
    const first = buildEvidenceSnapshot(capturedAt, {
      liveSky: successful({ timestamp: capturedAt, elementalBalance: { Fire: 0.4, Water: 0.6 } }),
      alchemicalScan: successful(null),
      candidateRecipes: successful({ recipes: [{ id: "r1", name: "Soup" }] }),
    }, false);
    const second = buildEvidenceSnapshot(capturedAt, {
      liveSky: successful({ elementalBalance: { Water: 0.6, Fire: 0.4 }, timestamp: capturedAt }),
      alchemicalScan: successful(null),
      candidateRecipes: successful({ recipes: [{ name: "Soup", id: "r1" }] }),
    }, false);

    expect(first.contentHash).toBe(second.contentHash);
    expect(first.snapshotId).not.toBe(second.snapshotId);
  });

  it("never marks absent or non-JSON required evidence as a complete capture", () => {
    const snapshot = buildEvidenceSnapshot(capturedAt, {
      liveSky: successful(null),
      alchemicalScan: successful(null),
      candidateRecipes: successful({ score: Number.NaN }),
    }, false);

    expect(snapshot.status).toBe("failed");
    expect(snapshot.provenance.components.liveSky.error?.code).toBe("EMPTY_EVIDENCE");
    expect(snapshot.provenance.components.candidateRecipes.error?.code).toBe("INVALID_EVIDENCE");
    expect(snapshot.liveSky).toBeNull();
    expect(snapshot.candidateRecipes).toBeNull();
    expect(() => JSON.stringify(snapshot)).not.toThrow();
  });
});
