/**
 * Every source a Baking Lab value can name, keyed for {@link Basis.source}.
 *
 * `confidence` says how the number was seen, so a reader knows how hard to lean
 * on it:
 * - `primary`    — read in the source itself (or fetched from the dataset by script);
 * - `secondary`  — read in a reputable table or review that cites the primary;
 * - `recalled`   — a widely cited figure attributed to the source but NOT re-read
 *                  when this file was written (2026-11-15). Verify before relying on it.
 * - `model`      — not a literature claim at all: a stated modelling choice.
 *
 * @file src/lib/baking/citations.ts
 */

export type CitationConfidence = "primary" | "secondary" | "recalled" | "model";

export interface Citation {
  short: string;
  full: string;
  url: string | null;
  confidence: CitationConfidence;
}

export const CITATIONS = {
  USDA_FDC: { short: "USDA FoodData Central", full: "USDA Agricultural Research Service, FoodData Central (SR Legacy 2019; Foundation Foods), API v1, retrieved 2026-11-15 by scripts/fetch-usda-baking.mjs.", url: "https://fdc.nal.usda.gov/", confidence: "primary" },
  CIAAW_2021: { short: "CIAAW standard atomic weights", full: "IUPAC Commission on Isotopic Abundances and Atomic Weights, abridged standard atomic weights (conventional values).", url: "https://www.ciaaw.org/atomic-weights.htm", confidence: "recalled" },
  NORRISH_1966: { short: "Norrish 1966", full: "Norrish RS (1966) An equation for the activity coefficients and equilibrium relative humidities of water in confectionery syrups. J Food Technol 1:25–39.", url: null, confidence: "recalled" },
  CHIRIFE_1980: { short: "Chirife et al. 1980 (via Ergun 2010)", full: "Chirife J, Ferro Fontán C, Benmergui EA (1980) J Food Technol 15:59–70, natural-log Norrish K as tabulated in Ergun, Lietha & Hartel (2010) Crit Rev Food Sci Nutr 50:162–192, Table 5.", url: "https://doi.org/10.1080/10408390802248833", confidence: "secondary" },
  ERGUN_2010: { short: "Ergun, Lietha & Hartel 2010", full: "Ergun R, Lietha R, Hartel RW (2010) Moisture and shelf life in sugar confections. Crit Rev Food Sci Nutr 50:162–192 (Table 6: saturated solutions at 25 °C).", url: "https://doi.org/10.1080/10408390802248833", confidence: "secondary" },
  ZUORRO_2021: { short: "Zuorro 2021", full: "Zuorro A (2021) Int J Mol Sci 22(20):11044, Table 1 — fructose Norrish k_N = −2.351 on a different data basis.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8540113/", confidence: "secondary" },
  ROSS_1975: { short: "Ross 1975", full: "Ross KD (1975) Estimation of water activity in intermediate moisture foods. Food Technology 29(3):26–34 — a_w of a mixture as the product of each solute's a_w.", url: null, confidence: "recalled" },
  OPENSTAX_SWEETNESS: { short: "McMurry, Organic Chemistry (OpenStax)", full: "McMurry J, Organic Chemistry (OpenStax), 'Chemistry Matters: Sweetness' relative-sweetness table (sucrose = 1.00).", url: "https://openstax.org/books/organic-chemistry/pages/25-chemistry-matters-sweetness", confidence: "secondary" },
  FDA_ALLULOSE_2019: { short: "FDA allulose guidance 2019 (trade press)", full: "FDA draft guidance on allulose labeling (2019), as reported by FoodNavigator-USA 2019-04-17 and Food Dive: about 70 % as sweet as sucrose.", url: "https://www.foodnavigator-usa.com/Article/2019/04/17/FDA-guidance-could-prompt-surge-of-interest-in-low-cal-tooth-friendly-rare-sugar-allulose", confidence: "secondary" },
  FDA_PH: { short: "FDA/CFSAN, Approximate pH of Foods", full: "U.S. FDA/CFSAN (2003; updated 2004) Approximate pH of Foods and Food Products. Value = midpoint of the listed range.", url: "https://webharvest.gov/peth04/20041014211751/http:/www.cfsan.fda.gov/~comm/lacf-phs.html", confidence: "primary" },
  CLEMSON_PH: { short: "Clemson Extension pH table", full: "Clemson University Cooperative Extension, pH Values of Common Foods and Ingredients (compiled table). Value = midpoint of the listed range.", url: "https://www.clemson.edu/extension/food/_files/ph-of-common-foods-table.pdf", confidence: "secondary" },
  MILLER_2008: { short: "Miller et al. 2008", full: "Miller KB et al. (2008) Impact of alkalization on the antioxidant and flavanol content of commercial cocoa powders. J Agric Food Chem 56(18):8527–8533.", url: "https://pubmed.ncbi.nlm.nih.gov/18710243/", confidence: "primary" },
  IUPAC_PH_2002: { short: "IUPAC pH standards 2002", full: "Buck RP et al. (2002) Measurement of pH (IUPAC Recommendations 2002). Pure Appl Chem 74:2169–2200 — saturated potassium hydrogen tartrate, pH 3.557 at 25 °C.", url: "https://list.iupac.org/reports/provisional/abstract01/rondinini_310102.html", confidence: "secondary" },
  SIGMA_NAHCO3: { short: "Sigma-Aldrich NaHCO₃ data", full: "Sigma-Aldrich USP sodium bicarbonate reference standard product data — 0.1 M solution pH 8.3 at 25 °C.", url: "https://b2b.sigmaaldrich.com/US/en/product/usp/1613655", confidence: "secondary" },
  ALLAN_2020: { short: "Allan, Chamberlain & Mauer 2020", full: "Allan MC, Chamberlain M, Mauer LJ (2020) Effects of sugars and sugar alcohols on the gelatinization temperatures of wheat, potato, and corn starches. Foods 9(6):757 — DSC onsets, starch:liquid 1:2, 10 °C/min.", url: "https://doi.org/10.3390/foods9060757", confidence: "primary" },
  CASSAVA_DSC_2019: { short: "Cassava starch DSC 2019", full: "DSC study of cassava variety starches, AIMS Agriculture and Food 4(4):939 (2019): To 56.33–63.00, Tp 62.00–71.29, Tc 69.10–77.12 °C across varieties.", url: "https://aimspress.com/aimspress-data/aimsagri/2019/4/PDF/agrfood-04-04-939.pdf", confidence: "secondary" },
  DONOVAN_1975: { short: "Donovan et al. 1975", full: "Donovan JW, Mapes CJ, Davis JG, Garibaldi JA (1975) A differential scanning calorimetric study of the stability of egg white to heat denaturation. J Sci Food Agric 26:73–83 — conalbumin ~65 °C, ovalbumin ~84 °C at pH 7.", url: "https://doi.org/10.1002/jsfa.2740260109", confidence: "secondary" },
  PJFNS_YOLK: { short: "Calorimetry of liquid egg yolk (PJFNS)", full: "A calorimetric study of liquid egg yolk, Pol J Food Nutr Sci 60(4):347–352 — native yolk denatures from 69 °C; Nature Communications 14 (2023): grainy LDL gel above 75 °C.", url: "https://doi.org/10.1038/s41467-023-41202-z", confidence: "secondary" },
  ROMBOUTS_2012: { short: "Rombouts et al. 2012", full: "Review of gluten cross-linking chemistry, Cereal Foods World 57(5):203 (2012) — fully hydrated gluten: gliadin and glutenin are in the network above 75 °C.", url: "https://www.cerealsgrains.org/publications/plexus/cfw/pastissues/2012/documents/CFW-57-5-0203.pdf", confidence: "secondary" },
  WIESER_2007: { short: "Wieser 2007", full: "Wieser H (2007) Chemistry of gluten proteins. Food Microbiology 24:115–119 — gluten proteins are roughly 80–85 % of wheat flour protein.", url: "https://doi.org/10.1016/j.fm.2006.07.004", confidence: "recalled" },
  ASB_BAKING: { short: "American Society of Baking", full: "American Society of Baking technical articles ('Oven temperature', 'Baking'): yeast killed at 50–60 °C in dough; pan-bread bake loss 8–12 %.", url: "https://asbe.org/article/baking/", confidence: "secondary" },
  ASB_DOUBLE_ACTING: { short: "ASB / Bakers Journal on baking powder", full: "American Society of Baking 'Double-acting baking powder' and Bakers Journal 'Technical Talk': MCP releases 60–70 % of its CO₂ in mixing; SAS barely reacts at room temperature.", url: "https://asbe.org/article/double-acting-baking-powder/", confidence: "secondary" },
  BAKERPEDIA_THERMAL: { short: "BAKERpedia thermal profiling", full: "BAKERpedia, Thermal Profiling for Bread Products (white paper): bake-out begins once the core passes 93 °C.", url: "https://bakerpedia.com/wp-content/uploads/simple-file-list/WP-Thermal_Profiling_for_Bread_Products_BAKERpaper.pdf", confidence: "secondary" },
  CID_A_A_20094: { short: "US CID A-A-20094", full: "US Federal Commercial Item Description A-A-20094, Baking Powder — minimum 12 % available CO₂ by weight (Canada C.R.C. c. 870 B.03.002: not less than 10 %).", url: "https://condimentsrelatedproducts.emilspec.com/A-A-20094/index.html", confidence: "secondary" },
  SANDER_2023: { short: "Sander 2023", full: "Sander R (2023) Compilation of Henry's law constants (version 5.0.0) for water as solvent. Atmos Chem Phys 23:10901–12440 — CO₂: Hcp 3.3×10⁻⁴ mol m⁻³ Pa⁻¹ at 298.15 K, d ln H/d(1/T) = 2400 K.", url: "https://doi.org/10.5194/acp-23-10901-2023", confidence: "primary" },
  ZANONI_1995: { short: "Zanoni, Peri & Bruno 1995", full: "Zanoni B, Peri C, Bruno D (1995) Modelling of browning kinetics of bread crust during baking. LWT 28(6):604–609 — first-order ΔE kinetics, Ea = 64 151 J/mol over 140–250 °C.", url: null, confidence: "secondary" },
  PURLIS_2009: { short: "Purlis & Salvadori 2009", full: "Purlis E, Salvadori VO (2009) Modelling the browning of bread during baking. Food Res Int 42(7):865–870 — colour develops only above 120 °C and below a_w 0.6.", url: null, confidence: "secondary" },
  SHIM_2018: { short: "Shim et al. 2018", full: "Shim YY, Mustafa R, Shen J, Ratanapariyanuch K, Reaney MJT (2018) Composition and properties of aquafaba. J Vis Exp 132:56305 — dry matter 4.88–7.02 %, protein 22.65–26.83 % of solids across 10 brands.", url: "https://doi.org/10.3791/56305", confidence: "primary" },
  BELORIO_2020: { short: "Belorio & Gómez 2020", full: "Belorio M, Gómez M (2020) Foods 9(11):1548 — water-holding capacities of psyllium and xanthan as summarised by citing papers; units and method NOT confirmed.", url: "https://www.mdpi.com/2304-8158/9/11/1548/htm", confidence: "secondary" },
  CARSON_2005: { short: "Carson et al. 2005", full: "Carson JK, Lovatt SJ, Tanner DJ, Cleland AC (2005) Thermal conductivity bounds for isotropic, porous materials. Int J Heat Mass Transfer 48:2150–2158.", url: null, confidence: "recalled" },
  PHILIP_DEVRIES_1957: { short: "Philip & de Vries 1957", full: "Philip JR, de Vries DA (1957) Moisture movement in porous materials under temperature gradients. Trans Am Geophys Union 38:222–232 — vapour-enhanced thermal conductivity.", url: null, confidence: "recalled" },
  DEVRIES_1989: { short: "de Vries, Sluimer & Bloksma 1989", full: "de Vries U, Sluimer P, Bloksma AH (1989) A quantitative model for heat transport in dough and crumb during baking. In: Cereal Science and Technology in Sweden — evaporation–condensation as the dominant heat-transport mechanism in baking crumb.", url: null, confidence: "recalled" },
  PENNISTON_2008: { short: "Penniston et al. 2008", full: "Penniston KL, Nakada SY, Holmes RP, Assimos DG (2008) Quantitative assessment of citric acid in lemon juice. J Endourol 22:567–570 — about 1.44 g citric acid per oz of juice.", url: null, confidence: "recalled" },
  CFR_131_112: { short: "21 CFR 131.112", full: "US 21 CFR 131.112, Cultured milk — titratable acidity not less than 0.5 % as lactic acid.", url: "https://www.ecfr.gov/current/title-21/section-131.112", confidence: "recalled" },
  CODEX_HONEY: { short: "Codex Standard for Honey", full: "Codex Alimentarius CXS 12-1981, Standard for Honey — free acidity not more than 50 meq/kg.", url: null, confidence: "recalled" },
  CFR_131_160: { short: "21 CFR 131.160", full: "US 21 CFR 131.160, Sour cream — titratable acidity not less than 0.5 %, calculated as lactic acid; not less than 18 % milkfat (read 2026-11-16 at law.cornell.edu/cfr/text/21/131.160).", url: "https://www.law.cornell.edu/cfr/text/21/131.160", confidence: "primary" },
  CFR_131_200: { short: "21 CFR 131.200", full: "US 21 CFR 131.200, Yogurt — pH 4.6 or lower on the finished product within 24 h of filling; not less than 3.25 % milkfat. No titratable-acidity figure (read 2026-11-16 at law.cornell.edu/cfr/text/21/131.200).", url: "https://www.law.cornell.edu/cfr/text/21/131.200", confidence: "primary" },
  WANG_2018: { short: "Wang et al. 2018", full: "Wang S, Chao C, Xiang F, Zhang X, Wang S, Copeland L (2018) New insights into gelatinization mechanisms of cereal endosperm starches. Sci Rep 8:3011, Table 1 — native rice starch DSC onset 59.2 ± 0.1 °C at water:starch 2.0 (v/w), 10 °C/min (read 2026-11-16 via Europe PMC, PMC5813053).", url: "https://doi.org/10.1038/s41598-018-21451-5", confidence: "primary" },
  NIST_HB44: { short: "NIST Handbook 44, Appendix C", full: "NIST Handbook 44, Appendix C (General Tables of Units of Measurement): avoirdupois pound = 453.59237 g exactly, ounce = 1/16 lb; US cup = 8 fl oz = 16 tbsp = 48 tsp; 1 US gallon = 231 in³.", url: "https://www.nist.gov/pml/owm/nist-handbook-44-current-edition", confidence: "recalled" },
  WILLE_LUTTON_1966: { short: "Wille & Lutton 1966", full: "Wille RL, Lutton ES (1966) Polymorphism of cocoa butter. J Am Oil Chem Soc 43:491–496 — form V melts at about 33.8 °C.", url: null, confidence: "recalled" },
  REPO_KERNELS: { short: "alchm.kitchen thermal kernels", full: "src/lib/cooking: Choi & Okos (ASHRAE 1998) properties, Incropera Tables A.4/A.6, Churchill & Chu / McAdams / flat-plate correlations, Chilton–Colburn evaporation, Fleagle & Andreas h_fg, ISA + Antoine boiling point.", url: null, confidence: "primary" },
  REPO_REGIMES: { short: "alchm.kitchen cooking regimes", full: "src/lib/cooking/cookingRegimes.ts — Maillard at culinary rate from 120 °C on a dried surface (EFSA); sucrose caramelisation from 442 K (Magon et al. 2014).", url: null, confidence: "primary" },
  BRIEF: { short: "Baking Lab brief", full: "The Baking Lab product brief's five thermal zones — display bands, not physical constants.", url: null, confidence: "model" },
  MODEL: { short: "Model choice", full: "A stated modelling choice of this lab — not a measurement. Listed on the Sources tab with its reason.", url: null, confidence: "model" },
} satisfies Record<string, Citation>;

export type CitationId = keyof typeof CITATIONS;

const BY_ID: ReadonlyMap<string, Citation> = new Map<string, Citation>(Object.entries(CITATIONS));

export function citation(id: string): Citation | null {
  return BY_ID.get(id) ?? null;
}
