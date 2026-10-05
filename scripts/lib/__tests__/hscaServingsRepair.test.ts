import { planServings, readModelWithServings, scaleProfile } from "../hscaServingsRepair";

describe("scaleProfile", () => {
  const profile = { calories: 400, protein: 12.5, carbs: 50, fat: 10, fiber: 6, sugar: 3.33, dailyValue: { vitaminC: 0.2, iron: 0.08 } };

  it("multiplies every number: 4 servings to 8 halves a serving", () => {
    expect(scaleProfile(profile, 4 / 8)).toEqual({
      calories: 200,
      protein: 6.25,
      carbs: 25,
      fat: 5,
      fiber: 3,
      sugar: 1.67,
      dailyValue: { vitaminC: 0.1, iron: 0.04 },
    });
  });

  it("4 servings to 2 doubles a serving", () => {
    expect(scaleProfile({ calories: 150, protein: 5 }, 2)).toEqual({ calories: 300, protein: 10 });
  });

  it("rounds top-level numbers to two places and leaves nested ones exact", () => {
    const scaled = scaleProfile({ calories: 100, dailyValue: { iron: 0.1 } }, 1 / 3);
    expect(scaled).toEqual({ calories: 33.33, dailyValue: { iron: 0.1 / 3 } });
  });

  it("leaves what is not a profile alone: the honest-empty {} and null", () => {
    expect(scaleProfile({}, 0.5)).toEqual({});
    expect(scaleProfile(null, 0.5)).toBeNull();
    expect(scaleProfile({ calories: 0, protein: 0 }, 0.5)).toEqual({ calories: 0, protein: 0 });
  });

  it("keeps strings and other non-numbers", () => {
    expect(scaleProfile({ calories: 100, basis: "per serving" }, 2)).toEqual({ calories: 200, basis: "per serving" });
  });
});

describe("planServings", () => {
  const placeholder = { servings: 4, readModel: { servings: 4 } };

  it("a row with the placeholder and a stated yield is repaired", () => {
    expect(planServings(placeholder, [6])).toEqual({ kind: "repair", from: 4, to: 6 });
  });

  it("a record that states nothing leaves the row alone", () => {
    expect(planServings(placeholder, [undefined])).toEqual({ kind: "none" });
    expect(planServings(placeholder, [])).toEqual({ kind: "none" });
  });

  it("a row that already has the stated servings is clean", () => {
    expect(planServings({ servings: 6, readModel: { servings: 6 } }, [6])).toEqual({ kind: "clean" });
  });

  it("a row whose servings someone changed is not the placeholder, and is skipped", () => {
    expect(planServings({ servings: 5, readModel: { servings: 5 } }, [6]).kind).toBe("skip");
    expect(planServings({ servings: 4, readModel: { servings: 5 } }, [6]).kind).toBe("skip");
    expect(planServings({ servings: 4, readModel: null }, [6]).kind).toBe("skip");
  });

  it("two fitting records that disagree leave the row alone; one that states nothing does not matter", () => {
    expect(planServings(placeholder, [6, 8]).kind).toBe("skip");
    expect(planServings(placeholder, [6, undefined, 6])).toEqual({ kind: "repair", from: 4, to: 6 });
  });

  it("a row already at 4 whose yield says 4 is clean", () => {
    expect(planServings(placeholder, [4])).toEqual({ kind: "clean" });
  });
});

describe("readModelWithServings", () => {
  it("sets servings and rescales a stored profile, nothing else", () => {
    const readModel = { name: "X", servings: 4, nutritional_profile: { calories: 400, protein: 8 }, ingredients: [1] };
    expect(readModelWithServings(readModel, 4, 8)).toEqual({
      name: "X",
      servings: 8,
      nutritional_profile: { calories: 200, protein: 4 },
      ingredients: [1],
    });
  });

  it("a row with no profile key gets no profile key", () => {
    expect("nutritional_profile" in readModelWithServings({ servings: 4 }, 4, 6)).toBe(false);
  });

  it("an empty profile stays empty", () => {
    expect(readModelWithServings({ servings: 4, nutritional_profile: {} }, 4, 6).nutritional_profile).toEqual({});
  });
});
