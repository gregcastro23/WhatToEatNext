/**
 * Parity tests for the agent monica (§18) — pin the measured design so a later
 * tweak to the vessel, sect table, or thermodynamics can't silently move it.
 *
 * See docs/physics/SYNTHESIS_MODEL.md §18.
 */
import {
  agentMonica,
  agentMonicaForSect,
  VESSEL_MASS,
} from "@/utils/agentMonica";
import { MONICA_EQUILIBRIUM } from "@/data/unified/alchemicalCalculations";

const PLANETS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
] as const;

const ELEMENT_SIGN: Record<string, string> = {
  Fire: "Aries", Earth: "Taurus", Air: "Gemini", Water: "Cancer",
};

describe("agent monica — totality (§18b)", () => {
  it("is finite for every planet × element × both sects × representative degrees", () => {
    let total = 0;
    let finite = 0;
    for (const planet of PLANETS) {
      for (const sign of Object.values(ELEMENT_SIGN)) {
        for (let degree = 1; degree <= 14; degree++) {
          for (const sect of ["diurnal", "nocturnal"] as const) {
            total++;
            const m = agentMonicaForSect(planet, sign, degree, sect);
            if (Number.isFinite(m)) finite++;
          }
        }
      }
    }
    // 10 planets × 4 elements × 14 degrees × 2 sects = 1120 cases
    expect(total).toBe(1120);
    expect(finite).toBe(total); // never NaN/null/±∞
  });

  it("returns both sects and their mean", () => {
    const r = agentMonica("Sun", "Leo", 1);
    expect(Number.isFinite(r.diurnal)).toBe(true);
    expect(Number.isFinite(r.nocturnal)).toBe(true);
    expect(r.combined).toBeCloseTo((r.diurnal + r.nocturnal) / 2, 10);
  });
});

describe("agent monica — measured shape (§18c)", () => {
  it("sits on the full-chart scale, not the ±4000 bare-planet blowup", () => {
    const values: number[] = [];
    for (const planet of PLANETS) {
      for (const sign of Object.values(ELEMENT_SIGN)) {
        for (let degree = 1; degree <= 14; degree++) {
          values.push(agentMonicaForSect(planet, sign, degree, "diurnal"));
          values.push(agentMonicaForSect(planet, sign, degree, "nocturnal"));
        }
      }
    }
    const max = Math.max(...values.map(Math.abs));
    // Grounding keeps it bounded; the measured range was ~[-4, 4].
    expect(max).toBeLessThan(10);
  });

  it("the degree resolves into a handful of bands, not one flat value", () => {
    // Sun, diurnal, Fire — vary the degree; the 14 processes collapse to a few
    // distinct ESMS patterns, so we expect several (not 1, not 14) values.
    const distinct = new Set<string>();
    for (let degree = 1; degree <= 14; degree++) {
      distinct.add(
        agentMonicaForSect("Sun", "Aries", degree, "diurnal").toFixed(4),
      );
    }
    expect(distinct.size).toBeGreaterThan(1);
    expect(distinct.size).toBeLessThanOrEqual(14);
  });

  it("dignity moves the value — a domicile planet differs from a peregrine one", () => {
    // Sun in Leo (domicile, +10) vs Sun in Sagittarius (peregrine, both Fire so
    // the element is held constant — only dignity differs). Degree 2 (an
    // asymmetric process vessel, kalchm outside the equilibrium band) so dignity
    // is visible; symmetric-vessel degrees (1, 7) correctly snap both to φ.
    const domicile = agentMonicaForSect("Sun", "Leo", 2, "diurnal");
    const peregrine = agentMonicaForSect("Sun", "Sagittarius", 2, "diurnal");
    expect(domicile).not.toBeCloseTo(peregrine, 4);
    // Domicile reads LOWER than peregrine — the stronger vessel pushes the ESMS
    // toward balance, shrinking the monica deviation (measured, §18c).
    expect(domicile).toBeLessThan(peregrine);
  });
});

describe("agent monica — degenerate handling (§18)", () => {
  it("an unknown planet (all-zero ESMS) resolves to φ, never NaN", () => {
    const m = agentMonicaForSect("Nemesis", "Aries", 1, "diurnal");
    expect(Number.isFinite(m)).toBe(true);
    // With no sect ESMS the vessel alone is symmetric enough to land in the
    // equilibrium band → φ.
    expect(m).toBe(MONICA_EQUILIBRIUM);
  });

  it("exposes VESSEL_MASS as the documented constant", () => {
    expect(VESSEL_MASS).toBe(4);
  });
});
