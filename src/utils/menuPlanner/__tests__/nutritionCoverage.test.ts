import {
  coverageNote,
  coverageOf,
  coverageState,
  formatCoveredShare,
  formatCoveredTotal,
  NO_MEALS,
  publishesCalories,
  sumCoverage,
} from "@/utils/menuPlanner/nutritionCoverage";

describe("publishesCalories", () => {
  it("accepts only a finite number of calories", () => {
    expect(publishesCalories({ calories: 0 })).toBe(true);
    expect(publishesCalories({ calories: 412.5, protein: 20 })).toBe(true);
    expect(publishesCalories({ calories: Number.NaN })).toBe(false);
    expect(publishesCalories({ calories: "412" })).toBe(false);
    expect(publishesCalories({ protein: 20 })).toBe(false);
    expect(publishesCalories(null)).toBe(false);
    expect(publishesCalories(undefined)).toBe(false);
  });
});

describe("coverage of a day and a week", () => {
  it("counts the meals that entered the total", () => {
    expect(coverageOf([true, true, false])).toEqual({ planned: 3, withNutrition: 2 });
    expect(coverageOf([])).toEqual(NO_MEALS);
  });

  it("sums days into a week", () => {
    expect(
      sumCoverage([
        { planned: 3, withNutrition: 2 },
        { planned: 2, withNutrition: 2 },
        NO_MEALS,
      ]),
    ).toEqual({ planned: 5, withNutrition: 4 });
  });

  it("names the state: whole, partial, or none", () => {
    expect(coverageState({ planned: 3, withNutrition: 3 })).toBe("complete");
    expect(coverageState(NO_MEALS)).toBe("complete");
    expect(coverageState({ planned: 3, withNutrition: 2 })).toBe("partial");
    expect(coverageState({ planned: 3, withNutrition: 0 })).toBe("none");
  });
});

describe("what a total shows", () => {
  it("a whole total is unmarked", () => {
    expect(coverageNote({ planned: 3, withNutrition: 3 })).toBeNull();
    expect(formatCoveredTotal(1311.4, { planned: 3, withNutrition: 3 })).toBe("1311");
    expect(formatCoveredShare(0.735, { planned: 3, withNutrition: 3 })).toBe("74%");
  });

  it("a partial total is a lower bound and says how many meals it covers", () => {
    const partial = { planned: 3, withNutrition: 2 };
    expect(formatCoveredTotal(1311.4, partial)).toBe("≥1311");
    expect(formatCoveredTotal(52.2, partial, "g")).toBe("≥52g");
    expect(coverageNote(partial)).toBe("partial: 2 of 3 meals have nutrition");
    expect(coverageNote({ planned: 3, withNutrition: 1 })).toBe("partial: 1 of 3 meals has nutrition");
    // Derived shares are kept from the partial sum; the note labels them.
    expect(formatCoveredShare(0.25, partial)).toBe("25%");
  });

  it("no meal with nutrition means no total, not 0", () => {
    expect(formatCoveredTotal(0, { planned: 1, withNutrition: 0 }, " kcal")).toBe("—");
    expect(formatCoveredShare(0, { planned: 2, withNutrition: 0 })).toBe("—");
    expect(coverageNote({ planned: 1, withNutrition: 0 })).toBe("no nutrition published for this meal");
    expect(coverageNote({ planned: 2, withNutrition: 0 })).toBe("no nutrition published for these 2 meals");
  });
});
