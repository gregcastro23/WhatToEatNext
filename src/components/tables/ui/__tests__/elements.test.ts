import { apportionPercentages } from "@/components/tables/ui/elements";

const sum = (record: Record<string, number>) =>
  Object.values(record).reduce((total, value) => total + value, 0);

describe("apportionPercentages", () => {
  it("sums to exactly 100 when thirds would round to 99", () => {
    const result = apportionPercentages({
      Fire: 1,
      Water: 1,
      Earth: 1,
      Air: 0,
    });
    expect(sum(result)).toBe(100);
    // Leftover point goes to the largest remainder; three-way tie breaks
    // deterministically by ELEMENTS order (Fire first).
    expect(result).toEqual({ Fire: 34, Water: 33, Earth: 33, Air: 0 });
  });

  it("sums to exactly 100 when independent rounding would give 101", () => {
    const result = apportionPercentages({
      Fire: 0.335,
      Water: 0.335,
      Earth: 0.33,
      Air: 0,
    });
    expect(sum(result)).toBe(100);
    // Exact shares 33.5/33.5/33: one leftover point, Fire wins the .5 tie.
    expect(result).toEqual({ Fire: 34, Water: 33, Earth: 33, Air: 0 });
  });

  it("returns all zeros for an all-zero vector", () => {
    const result = apportionPercentages({});
    expect(result).toEqual({ Fire: 0, Water: 0, Earth: 0, Air: 0 });
    expect(sum(result)).toBe(0);
  });

  it("keeps exact splits untouched", () => {
    expect(apportionPercentages({ Fire: 3, Water: 1, Earth: 0, Air: 0 }))
      .toEqual({ Fire: 75, Water: 25, Earth: 0, Air: 0 });
  });

  it("treats negative values as zero", () => {
    const result = apportionPercentages({ Fire: 1, Water: -5 });
    expect(result).toEqual({ Fire: 100, Water: 0, Earth: 0, Air: 0 });
  });
});
