/**
 * A recipe's derived diet (Phase 5): every line and every card it names must
 * be compliant; the worst verdict wins. Cards here are hand-set so each rule
 * is visible on its own.
 */
import { createRecipeDietDeriver } from "../recipeDiet";
import type { IngredientKeyResolver } from "../recipeIngredientIndex";
import type { DietVerdicts } from "../types";

const PLANT: DietVerdicts = { vegan: "compliant", vegetarian: "compliant" };
const DAIRY: DietVerdicts = { vegan: "non-compliant", vegetarian: "compliant" };
const SEAFOOD: DietVerdicts = { vegan: "non-compliant", vegetarian: "non-compliant" };

const CARDS: Record<string, DietVerdicts> = {
  salt: PLANT,
  pecorino_romano: DAIRY,
  olive_oil: PLANT,
  butter: DAIRY,
  water: PLANT,
  peanuts: PLANT,
  soy_sauce: PLANT,
  dashi: SEAFOOD,
  shrimp: SEAFOOD,
};
const KEYS: Record<string, ReturnType<IngredientKeyResolver>> = {
  "salt cod": "salt",
  "pecorino romano": "pecorino_romano",
  "olive oil": "olive_oil",
  butter: "butter",
  water: "water",
  "peanut butter": { key: "peanuts", derived: true },
  "dashi-soy sauce": [
    { key: "dashi", derived: true },
    { key: "soy_sauce", derived: false },
  ],
  "umami paste": { key: "shrimp", derived: true },
};

const derive = createRecipeDietDeriver(
  (text) => KEYS[text] ?? null,
  (key) => CARDS[key],
);

describe("recipe diet", () => {
  it("the line catches what its card misses: salt cod resolves to Salt", () => {
    expect(derive(["salt cod"])).toEqual({ vegan: "non-compliant", vegetarian: "non-compliant" });
  });

  it("the card catches what the line misses: Pecorino Romano is dairy", () => {
    expect(derive(["pecorino romano"])).toEqual(DAIRY);
  });

  it("each side of an X or Y line counts", () => {
    expect(derive(["olive oil or butter"]).vegan).toBe("non-compliant");
    expect(derive(["water or stock"])).toEqual({ vegan: "unknown", vegetarian: "unknown" });
  });

  it("the worst verdict of all lines wins", () => {
    expect(derive(["olive oil", "water", "salt cod"]).vegetarian).toBe("non-compliant");
    expect(derive(["olive oil", "water"])).toEqual(PLANT);
    expect(derive(["vegetable stock", "olive oil"])).toEqual(PLANT);
  });

  it("derived attribution positive & negative controls: plant butter stays vegan; animal derived blocks both", () => {
    // Positive control: peanut butter → peanuts (derived, plant) stays vegan,
    // unlike a broken resolver that files peanut butter under dairy butter.
    expect(derive(["peanut butter"])).toEqual(PLANT);
    const brokenButter = createRecipeDietDeriver(
      (text) => (text === "peanut butter" ? "butter" : null),
      (key) => CARDS[key],
    );
    expect(brokenButter(["peanut butter"]).vegan).toBe("non-compliant");

    // Negative control: derived attribution to an animal card (even when raw text
    // has no meat keyword, or via hyphenated dashi-soy sauce) rejects both diets.
    expect(derive(["umami paste"])).toEqual(SEAFOOD);
    expect(derive(["dashi-soy sauce"])).toEqual(SEAFOOD);
  });

  it("no lines is no evidence", () => {
    expect(derive([])).toEqual({ vegan: "unknown", vegetarian: "unknown" });
  });
});
