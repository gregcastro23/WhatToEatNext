/**
 * Literature & model citations for Sauce Lab Real Physics (`/kitchen-lab/sauces`).
 *
 * Mirrors `src/lib/baking/citations.ts`: every SI quantity and regime bound
 * names its empirical basis and confidence tier (`primary`, `secondary`,
 * `recalled`, or `model`).
 *
 * @file src/lib/sauces/physics/citations.ts
 */

export type SauceCitationConfidence = "primary" | "secondary" | "recalled" | "model";

export interface SauceCitation {
  short: string;
  full: string;
  url: string | null;
  confidence: SauceCitationConfidence;
}

export const SAUCE_CITATIONS = {
  CHOI_OKOS_1986: {
    short: "Choi & Okos 1986 (ASHRAE 1998)",
    full: "Choi Y & Okos MR (1986), Effects of Temperature and Composition on the Thermal Properties of Foods, tabulated in 1998 ASHRAE Refrigeration Handbook Ch. 8 Tables 1–2 (via src/lib/cooking/choiOkos.ts).",
    url: null,
    confidence: "secondary",
  },
  FLEAGLE_ANDREAS: {
    short: "Fleagle & Andreas h_fg",
    full: "Fleagle RG & Businger JA, An Introduction to Atmospheric Physics / Atmospheric Dynamics fit for latent heat of vaporisation of water Δh = 3.121e6 − 2.274e3·T (via src/lib/cooking/latentHeat.ts).",
    url: null,
    confidence: "primary",
  },
  KRIEGER_DOUGHERTY_1959: {
    short: "Krieger & Dougherty 1959",
    full: "Krieger IM & Dougherty TJ (1959) A mechanism for non-Newtonian flow in suspensions of rigid spheres. Trans Soc Rheol 3:137–152 (φ_max = 0.74, intrinsic viscosity [η] = 2.5).",
    url: null,
    confidence: "recalled",
  },
  MCCLEMENTS_2015: {
    short: "McClements 2015",
    full: "McClements DJ (2015) Food Emulsions: Principles, Practices, and Techniques (3rd ed.) — O/W droplet packing, creaming mechanisms, and biopolymer steric/electrostatic stabilisation.",
    url: null,
    confidence: "recalled",
  },
  ALLAN_2020: {
    short: "Allan, Chamberlain & Mauer 2020",
    full: "Allan MC, Chamberlain M & Mauer LJ (2020) Effects of sugars and sugar alcohols on the gelatinization temperatures of wheat, potato, and corn starches. Foods 9(6):757.",
    url: "https://doi.org/10.3390/foods9060757",
    confidence: "primary",
  },
  PJFNS_YOLK: {
    short: "Egg Yolk Calorimetry (PJFNS / Nat Commun)",
    full: "Calorimetry of liquid egg yolk, Pol J Food Nutr Sci 60(4):347–352 & Nature Communications 14 (2023) — native yolk denatures from 69 °C; granular LDL curdling accelerates above 75 °C.",
    url: "https://doi.org/10.1038/s41467-023-41202-z",
    confidence: "secondary",
  },
  STOKES_CREAMING: {
    short: "Stokes' Law (Monodisperse Creaming)",
    full: "Classical low-Reynolds terminal creaming/sedimentation speed v_s = 2·g·|ρ_c − ρ_d|·r² / (9·η_c) for unaggregated spherical droplets in Newtonian continuous aqueous phase.",
    url: null,
    confidence: "recalled",
  },
  FDA_PH: {
    short: "FDA/CFSAN Approximate pH of Foods",
    full: "U.S. FDA/CFSAN (2003; updated 2004) Approximate pH of Foods and Food Products — reference acid ranges for citrus, tomato, and fermented condiments.",
    url: "https://webharvest.gov/peth04/20041014211751/http:/www.cfsan.fda.gov/~comm/lacf-phs.html",
    confidence: "primary",
  },
  EBULLIOSCOPIC: {
    short: "Ebullioscopic Elevation (K_b = 0.512 K·kg/mol)",
    full: "Ideal dilute aqueous boiling-point elevation ΔT_b = K_b · m with K_b = 0.512 K·kg/mol for water at 101.325 kPa.",
    url: null,
    confidence: "recalled",
  },
  MODEL: {
    short: "Declared Sauce Lab Model Choice",
    full: "Stated simplification choices of Sauce Lab: 55% open-saucepan burner transfer efficiency, effective dissolved solute molar mass 0.120 kg/mol, and aqueous viscosity fit η_w(T).",
    url: null,
    confidence: "model",
  },
} satisfies Record<string, SauceCitation>;

export type SauceCitationId = keyof typeof SAUCE_CITATIONS;

export const SAUCE_CITATION_LIST: ReadonlyArray<{ id: SauceCitationId; citation: SauceCitation }> = [
  { id: "CHOI_OKOS_1986", citation: SAUCE_CITATIONS.CHOI_OKOS_1986 },
  { id: "FLEAGLE_ANDREAS", citation: SAUCE_CITATIONS.FLEAGLE_ANDREAS },
  { id: "KRIEGER_DOUGHERTY_1959", citation: SAUCE_CITATIONS.KRIEGER_DOUGHERTY_1959 },
  { id: "MCCLEMENTS_2015", citation: SAUCE_CITATIONS.MCCLEMENTS_2015 },
  { id: "ALLAN_2020", citation: SAUCE_CITATIONS.ALLAN_2020 },
  { id: "PJFNS_YOLK", citation: SAUCE_CITATIONS.PJFNS_YOLK },
  { id: "STOKES_CREAMING", citation: SAUCE_CITATIONS.STOKES_CREAMING },
  { id: "FDA_PH", citation: SAUCE_CITATIONS.FDA_PH },
  { id: "EBULLIOSCOPIC", citation: SAUCE_CITATIONS.EBULLIOSCOPIC },
  { id: "MODEL", citation: SAUCE_CITATIONS.MODEL },
];
