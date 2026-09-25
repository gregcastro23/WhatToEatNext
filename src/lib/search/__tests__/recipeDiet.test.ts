/**
 * A recipe's derived diet (Phase 5): every line and every card it names must
 * be compliant; the worst verdict wins. Cards here are hand-set so each rule
 * is visible on its own.
 */
import { createRecipeDietDeriver } from "../recipeDiet";
import type { DietVerdicts } from "../types";

const PLANT: DietVerdicts = { vegan: "compliant", vegetarian: "compliant" };
const DAIRY: DietVerdicts = { vegan: "non-compliant", vegetarian: "compliant" };

const CARDS: Record<string, DietVerdicts> = { salt: PLANT, pecorino_romano: DAIRY, olive_oil: PLANT, butter: DAIRY, water: PLANT };
const KEYS: Record<string, string> = {
  "salt cod": "salt",
  "pecorino romano": "pecorino_romano",
  "olive oil": "olive_oil",
  butter: "butter",
  water: "water",
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

  it("no lines is no evidence", () => {
    expect(derive([])).toEqual({ vegan: "unknown", vegetarian: "unknown" });
  });
});
