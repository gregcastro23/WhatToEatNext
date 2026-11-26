import { toChartZodiacSign } from "../chartRendering";

describe("toChartZodiacSign", () => {
  it("normalizes mixed-case valid signs to canonical lowercase ZodiacSignType", () => {
    expect(toChartZodiacSign("Leo")).toBe("leo");
    expect(toChartZodiacSign("SCORPIO")).toBe("scorpio");
    expect(toChartZodiacSign("pisces")).toBe("pisces");
  });

  it("falls back to aries for missing or unknown values", () => {
    expect(toChartZodiacSign(undefined)).toBe("aries");
    expect(toChartZodiacSign(null)).toBe("aries");
    expect(toChartZodiacSign(42)).toBe("aries");
    expect(toChartZodiacSign("ophiuchus")).toBe("aries");
  });
});
