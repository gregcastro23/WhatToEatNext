/**
 * Unit tests for the `?tab=` and `?sauce=` URL contracts of `/kitchen-lab/sauces`.
 */
import {
  DEFAULT_SAUCE_TAB,
  sauceLabHref,
  sauceTabFromParam,
  systemForTab,
  urlForSaucePreset,
  urlForSauceTab,
} from "../sauceTabs";

describe("/kitchen-lab/sauces URL & tab contract", () => {
  it("resolves valid tabs, defaults unknown/null to emulsion, and separates real vs alchm systems", () => {
    expect(sauceTabFromParam(null)).toBe(DEFAULT_SAUCE_TAB);
    expect(sauceTabFromParam("invalid")).toBe(DEFAULT_SAUCE_TAB);
    expect(sauceTabFromParam("reduction")).toBe("reduction");
    expect(sauceTabFromParam("pairing")).toBe("pairing");
    expect(sauceTabFromParam("lineage")).toBe("lineage");

    expect(systemForTab("emulsion")).toBe("real");
    expect(systemForTab("reduction")).toBe("real");
    expect(systemForTab("sources")).toBe("real");
    expect(systemForTab("pairing")).toBe("alchm");
    expect(systemForTab("lineage")).toBe("alchm");
  });

  it("preserves unrelated query parameters when switching tabs or bench sauces", () => {
    expect(urlForSauceTab("https://x.test/kitchen-lab/sauces?cuisine=Japanese&sauce=teriyaki", "pairing")).toBe(
      "https://x.test/kitchen-lab/sauces?cuisine=Japanese&sauce=teriyaki&tab=pairing",
    );
    expect(urlForSauceTab("https://x.test/kitchen-lab/sauces?tab=pairing&sauce=marinara", DEFAULT_SAUCE_TAB)).toBe(
      "https://x.test/kitchen-lab/sauces?sauce=marinara",
    );
    expect(urlForSaucePreset("https://x.test/kitchen-lab/sauces?tab=reduction", "bechamel")).toBe(
      "https://x.test/kitchen-lab/sauces?tab=reduction",
    );
    expect(urlForSaucePreset("https://x.test/kitchen-lab/sauces?tab=reduction", "hollandaise")).toBe(
      "https://x.test/kitchen-lab/sauces?tab=reduction&sauce=hollandaise",
    );
  });

  it("builds canonical relative links omitting default query params", () => {
    expect(sauceLabHref("emulsion", "bechamel")).toBe("/kitchen-lab/sauces");
    expect(sauceLabHref("pairing", "bechamel")).toBe("/kitchen-lab/sauces?tab=pairing");
    expect(sauceLabHref("reduction", "marinara")).toBe("/kitchen-lab/sauces?sauce=marinara&tab=reduction");
  });
});
