import { compareLintDebt } from "../lintDebt";

describe("compareLintDebt", () => {
  it("allows the tracked total to stay equal to its baseline", () => {
    expect(compareLintDebt(22_614, 22_614)).toEqual({
      exceedsBaseline: false,
      increasedBy: 0,
    });
  });

  it("allows the tracked total to fall freely", () => {
    expect(compareLintDebt(22_000, 22_614)).toEqual({
      exceedsBaseline: false,
      increasedBy: 0,
    });
  });

  it("reports the exact increase when the tracked total grows", () => {
    expect(compareLintDebt(22_615, 22_614)).toEqual({
      exceedsBaseline: true,
      increasedBy: 1,
    });
  });
});
