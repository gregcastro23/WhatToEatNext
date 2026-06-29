import { planetSignsFromNatal } from "../agentDailyYield";

describe("planetSignsFromNatal", () => {
  it("maps an array of {planet, sign} entries into a planet→sign map", () => {
    expect(
      planetSignsFromNatal([
        { planet: "Sun", sign: "Aries", degree: 0 },
        { planet: "Moon", sign: "Sagittarius", degree: 27 },
      ]),
    ).toEqual({ Sun: "Aries", Moon: "Sagittarius" });
  });

  it("parses a JSON string and ignores malformed entries", () => {
    expect(
      planetSignsFromNatal('[{"planet":"Mars","sign":"Scorpio"},{"x":1},{"planet":"Venus"}]'),
    ).toEqual({ Mars: "Scorpio" });
  });

  it("returns {} for empty arrays, non-arrays, and unparseable strings", () => {
    expect(planetSignsFromNatal([])).toEqual({});
    expect(planetSignsFromNatal(null)).toEqual({});
    expect(planetSignsFromNatal({})).toEqual({});
    expect(planetSignsFromNatal("not json")).toEqual({});
  });

  it("keeps the last sign when a planet repeats", () => {
    expect(
      planetSignsFromNatal([
        { planet: "Sun", sign: "Aries" },
        { planet: "Sun", sign: "Taurus" },
      ]),
    ).toEqual({ Sun: "Taurus" });
  });
});
