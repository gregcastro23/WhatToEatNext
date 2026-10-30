import { applyAdaptationProposal, prepareAdaptationSource } from "../adaptationCandidates";
import { readSavedChart, contentHash } from "../adaptationAgentBasis";
import { PLACEMENTS, PREFERENCES, PROPOSAL, ACTOR_ID, sourceRecipe } from "./helpers/adaptationFixtures";

const basis = { actor: { id: ACTOR_ID, slug: "leonardo-da-vinci", name: "Leonardo" }, chart: readSavedChart(PLACEMENTS, null), preferences: { source: "user_profiles.dietary_preferences" as const, digest: contentHash(PREFERENCES), values: PREFERENCES } };

it.each(["chicken breast", "chicken breasts", "skin-on chicken", "boneless skinless chicken thighs"])("supports bounded full/core references for %s", name => {
  const source = prepareAdaptationSource({ ...sourceRecipe(), ingredients: [{ name, amount: 250, unit: "g" }], instructions: [`Slice the ${name}, then sear the CHICKEN.`] });
  const edited = "Slice the firm tofu, then sear the firm tofu.";
  expect(applyAdaptationProposal(JSON.stringify({ ...PROPOSAL, instructions: [edited] }), source, basis).recipe.instructions).toEqual([edited]);
});

it.each([
  "Sauté firm tofu in olive oil until its internal temperature reaches 165°F, then cook chicken in the same pan.",
  "Sauté firm tofu in olive oil until its internal temperature reaches 165°F. Add bacon.",
  "Sauté firm tofu in olive oil until its internal temperature reaches 165°F. Add cream.",
  "Sauté firm tofu in peanut sauce until heated.",
  "Deep-fry firm tofu in olive oil until its internal temperature reaches 165°F.",
])("rejects unprovable free-form instructions %s", instruction => {
  const source = prepareAdaptationSource(sourceRecipe());
  expect(() => applyAdaptationProposal(JSON.stringify({ ...PROPOSAL, instructions: [instruction] }), source, basis)).toThrow("beyond the supported ingredient substitution");
});

it.each(["mock chicken", "vegan chicken", "plant-based sausage", "graham flour", "champignon", "crab apples", "coconut milk", "almond butter", "eggplant", "butternut squash"])("does not replace plant compound or substring %s", name => {
  expect(() => prepareAdaptationSource({ ...sourceRecipe(), ingredients: [{ name, amount: 10, unit: "g" }] })).toThrow("No supported vegetarian");
});

it("reads the actual historical seed sign/degree shape and never fabricates absent degrees", () => {
  const rows = PLACEMENTS.map(row => ({ planet: row.planet, sign: row.sign, degree: row.position % 30, longitude: 0 }));
  expect(readSavedChart(rows, null).placements).toEqual(PLACEMENTS);
  expect(() => readSavedChart(rows.map(row => ({ ...row, degree: undefined })), null)).toThrow("no usable saved chart");
  expect(() => readSavedChart(Array(5).fill(PLACEMENTS[0]), null)).toThrow("no usable saved chart");
});
