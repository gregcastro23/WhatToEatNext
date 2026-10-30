/** @jest-environment node */
import { ACTOR_ID, SOURCE_ID, REQUEST, PLACEMENTS, PREFERENCES, PROPOSAL, sourceRecipe, savedFixture } from "./helpers/adaptationFixtures";
import { adaptationVersionId } from "../savedAdaptationPersistence";
import { createSavedAdaptation } from "../savedAdaptationService";
import { SavedAdaptationSchema } from "../savedAdaptationSchemas";

const mockQuery = jest.fn();
const mockChat = jest.fn();
const mockPublish = jest.fn();
const mockRecipe = jest.fn();
const mockDegraded = jest.fn();
jest.mock("@/lib/database/connection", () => ({ executeQuery: (...args: unknown[]) => mockQuery(...args) }));
jest.mock("@/lib/agents/planetaryAgentsGateway", () => ({ planetaryAgentsGateway: { chatWithAgent: (...args: unknown[]) => mockChat(...args) } }));
jest.mock("@/services/feedDatabaseService", () => ({ feedDatabase: { createEvent: (...args: unknown[]) => mockPublish(...args) } }));
jest.mock("@/services/LocalRecipeService", () => ({ LocalRecipeService: { getRecipeById: (...args: unknown[]) => mockRecipe(...args), isCatalogDegraded: () => mockDegraded() } }));

const requester = "authenticated-requester";
let basisRow: Record<string, unknown>;
let saved: ReturnType<typeof savedFixture> | null;
const live = { status: "live", metadata: { aiGenerated: true }, providerAgentId: "leonardo-da-vinci" };

beforeEach(() => {
  jest.clearAllMocks();
  basisRow = { id: ACTOR_ID, name: "Leonardo", natal_positions: PLACEMENTS, natal_chart: null, dietary_preferences: PREFERENCES };
  saved = null;
  mockRecipe.mockResolvedValue(sourceRecipe());
  mockDegraded.mockReturnValue(false);
  mockChat.mockResolvedValue({ ...live, content: JSON.stringify(PROPOSAL) });
  mockPublish.mockResolvedValue(true);
  mockQuery.mockImplementation((sql: string, args: unknown[]) => {
    if (sql.includes("FROM users u")) return Promise.resolve({ rows: [basisRow] });
    if (sql.includes("INSERT INTO user_custom_recipes")) {
      saved = SavedAdaptationSchema.parse(JSON.parse(String(args[6])));
      return Promise.resolve({ rows: [{ id: args[0], user_id: args[1], source_recipe_id: args[5], payload: saved }] });
    }
    if (sql.includes("SELECT EXISTS")) return Promise.resolve({ rows: [{ present: true }] });
    if (sql.includes("FROM user_custom_recipes")) return Promise.resolve({ rows: saved ? [{ id: saved.id, user_id: ACTOR_ID, source_recipe_id: SOURCE_ID, payload: saved }] : [] });
    throw new Error(`Unexpected SQL: ${sql}`);
  });
});

it("saves real ingredient and instruction edits using stored chart/preferences, verified edited content, and no fabricated scores/cooking/rating", async () => {
  const original = sourceRecipe();
  const result = await createSavedAdaptation(requester, SOURCE_ID, REQUEST);
  expect(result.version.recipe.ingredients[0]).toEqual({ name: "firm tofu", amount: 250, unit: "g" });
  expect(result.version.recipe.instructions).toEqual(PROPOSAL.instructions);
  expect(result.version.recipe.adaptedFrom).toEqual(original.adaptedFrom);
  expect(result.version.receipt.basis.chart.placements).toEqual(PLACEMENTS);
  expect(result.version.receipt.basis.preferences.values).toEqual(PREFERENCES);
  expect(result.version.receipt.changes.ingredients).toHaveLength(1);
  expect(result.version.receipt.changes.instructions).toHaveLength(1);
  expect(result.version.receipt.verification.evaluatedRestrictions).toContain("vegetarian");
  expect(result.version.receipt.verification.notChecked).toContain("nutrition");
  expect(result.version.receipt.verification.verified).toBe(false);
  expect(mockChat.mock.calls[0][0].userMessage).toContain(JSON.stringify(PLACEMENTS));
  expect(mockChat.mock.calls[0][0].userMessage).toContain("Prefer plant foods.");
  expect(result.publication).toBe("published");
  const metadata = mockPublish.mock.calls[0][2];
  expect(metadata).toMatchObject({ versionId: result.version.id, recipeId: SOURCE_ID, action: "adapted" });
  expect(metadata).not.toHaveProperty("rating");
  expect(metadata).not.toHaveProperty("madeIt");
  expect(metadata).not.toHaveProperty("made_it");
  expect(metadata).not.toHaveProperty("review");
  expect(sourceRecipe()).toEqual(original);
});

it.each([
  { natal_positions: [], natal_chart: null },
  { dietary_preferences: {} },
  { natal_positions: PLACEMENTS.map(p => ({ ...p, position: null })), natal_chart: { planets: { Sun: { sign: "aries", degree: null } } } },
])("does not infer or save when the actual saved basis is unavailable %#", async missing => {
  basisRow = { ...basisRow, ...missing };
  await expect(createSavedAdaptation(requester, SOURCE_ID, REQUEST)).rejects.toThrow(/saved|usable/);
  expect(mockChat).not.toHaveBeenCalled();
  expect(saved).toBeNull();
});

it.each(["degraded", "dormant"])("does not save %s gateway fallback content", async status => {
  mockChat.mockResolvedValue({ status, content: JSON.stringify(PROPOSAL) });
  await expect(createSavedAdaptation(requester, SOURCE_ID, REQUEST)).rejects.toThrow("Live adaptation reasoning is unavailable");
  expect(saved).toBeNull();
  expect(mockPublish).not.toHaveBeenCalled();
});

it.each([
  { ...PROPOSAL, selectedSwapIndices: [] },
  { ...PROPOSAL, selectedSwapIndices: [999] },
  { ...PROPOSAL, instructions: sourceRecipe().instructions },
  { ...PROPOSAL, usedPlacementIndices: [999] },
  { ...PROPOSAL, usedPreferenceKeys: ["avoidedFoods"] },
  { ...PROPOSAL, instructions: ["Sauté chicken and firm tofu together."] },
])("rejects no-op, inconsistent or unsupported model edits %#", async proposal => {
  mockChat.mockResolvedValue({ ...live, content: JSON.stringify(proposal) });
  await expect(createSavedAdaptation(requester, SOURCE_ID, REQUEST)).rejects.toThrow();
  expect(saved).toBeNull();
  expect(mockPublish).not.toHaveBeenCalled();
});

it("screens the actual edited instructions including retained authoritative temperatures", async () => {
  mockRecipe.mockResolvedValue({ ...sourceRecipe(), instructions: ["Boil chicken in liquid water at 280°F."] });
  mockChat.mockResolvedValue({ ...live, content: JSON.stringify({ ...PROPOSAL, instructions: ["Boil firm tofu in liquid water at 280°F."] }) });
  await expect(createSavedAdaptation(requester, SOURCE_ID, REQUEST)).rejects.toThrow("text screening");
  expect(saved).toBeNull();
});

it.each([
  { ...live, metadata: { aiGenerated: false } },
  { ...live, metadata: {} },
  { ...live, isDormant: true },
  { ...live, providerAgentId: undefined },
  { ...live, providerAgentId: "wrong-agent" },
])("rejects unconfirmed live inference or wrong provider actor %#", async response => {
  mockChat.mockResolvedValue({ ...response, content: JSON.stringify(PROPOSAL) });
  await expect(createSavedAdaptation(requester, SOURCE_ID, REQUEST)).rejects.toThrow("Live adaptation reasoning is unavailable");
  expect(saved).toBeNull();
  expect(mockPublish).not.toHaveBeenCalled();
});

it("does not publish when saving fails and reports a saved-but-unpublished result when feed persistence fails", async () => {
  mockQuery.mockRejectedValueOnce(new Error("Database unavailable"));
  await expect(createSavedAdaptation(requester, SOURCE_ID, REQUEST)).rejects.toThrow();
  expect(mockPublish).not.toHaveBeenCalled();
  mockPublish.mockResolvedValueOnce(false);
  const result = await createSavedAdaptation(requester, SOURCE_ID, REQUEST);
  expect(result.version.id).toBeTruthy();
  expect(result.publication).toBe("not-published");
});

it("replays a lost response without inference, new writes or new publication and preserves unknown publication on read failure", async () => {
  const first = await createSavedAdaptation(requester, SOURCE_ID, REQUEST);
  jest.clearAllMocks();
  const replay = await createSavedAdaptation(requester, SOURCE_ID, REQUEST);
  expect(replay.version).toEqual(first.version);
  expect(mockChat).not.toHaveBeenCalled();
  expect(mockRecipe).not.toHaveBeenCalled();
  expect(mockPublish).not.toHaveBeenCalled();
  mockQuery.mockImplementationOnce(() => Promise.resolve({ rows: [{ id: first.version.id, user_id: ACTOR_ID, source_recipe_id: SOURCE_ID, payload: first.version }] })).mockRejectedValueOnce(new Error("Feed unreadable"));
  expect((await createSavedAdaptation(requester, SOURCE_ID, REQUEST)).publication).toBe("unknown");
});

it("scopes request identities to the authenticated requester and rejects changed request details", async () => {
  expect(adaptationVersionId("other-requester", REQUEST.clientRequestId)).not.toBe(adaptationVersionId(requester, REQUEST.clientRequestId));
  await createSavedAdaptation(requester, SOURCE_ID, REQUEST);
  await expect(createSavedAdaptation(requester, "different-recipe", REQUEST)).rejects.toThrow("different adaptation details");
});
