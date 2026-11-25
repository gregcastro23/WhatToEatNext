import { AspectsService } from "../AspectsService";

describe("AspectsService.toMinimal", () => {
  it("normalizes complete, partial, and undefined planetary positions", () => {
    const minimal = AspectsService.toMinimal({
      Sun: { sign: "leo", degree: 12.5 },
      Moon: { degree: 4 },
      Mars: { sign: "aries" },
      Pluto: undefined,
    });

    expect(minimal).toEqual({
      Sun: { sign: "leo", degree: 12.5 },
      Moon: { sign: "", degree: 4 },
      Mars: { sign: "aries", degree: 0 },
      Pluto: { sign: "", degree: 0 },
    });
  });
});
