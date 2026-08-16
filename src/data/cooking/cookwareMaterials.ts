/**
 * Thermophysical properties of cookware materials.
 *
 * Answers the question "why does this pan cook differently" with the three
 * numbers that actually decide it, rather than with brand folklore:
 *
 *   effusivity  e  = √(kρc)     how far the surface temperature falls the
 *                               INSTANT cold food lands on it
 *   areal heat  C" = ρ·c·t      how much energy the pan can give back before
 *   capacity                    it needs the burner again
 *   spreading   k·t             how well it erases the burner's hot ring
 *
 * A cook feels all three as one sensation — "this pan holds heat" — but they
 * are independent, and the pans that win on one usually lose on another.
 * Copper spreads ~25× better than stainless and still has less than half the
 * recovery of cast iron at typical gauges.
 *
 * BASIS: bulk material properties are the conventional engineering values for
 * each alloy class (Incropera & DeWitt, *Fundamentals of Heat and Mass
 * Transfer*, Table A.1; MatWeb alloy datasheets). Thicknesses are the typical
 * retail gauge for that class of pan, stated per entry — they are the part a
 * reader should treat as a representative example rather than a constant.
 *
 * Derived quantities are computed here, never transcribed, so they cannot
 * drift from the inputs they claim to come from.
 *
 * @file src/data/cooking/cookwareMaterials.ts
 */

export interface CookwareMaterial {
  id: string;
  name: string;
  /** Thermal conductivity, W·m⁻¹·K⁻¹. */
  kWmK: number;
  /** Density, kg·m⁻³. */
  rhoKgM3: number;
  /** Specific heat capacity, J·kg⁻¹·K⁻¹. */
  cJkgK: number;
  /** Typical retail wall/base thickness for this class of pan, mm. */
  typicalThicknessMm: number;
  /** What this material is actually good at, in one line. */
  characterNote: string;
  /** Where it lets you down. */
  limitationNote: string;
  /** Methods this material is the strongest choice for. */
  bestFor: string[];
}

/**
 * `[BASIS]` Bulk properties per the alloy class; see file header.
 * Gray cast iron, plain carbon steel (1010), stainless 304, aluminium 1100,
 * copper C11000, borosilicate glass, cordierite/stoneware.
 */
export const COOKWARE_MATERIALS: CookwareMaterial[] = [
  {
    id: "cast_iron",
    name: "Cast iron",
    kWmK: 52,
    rhoKgM3: 7200,
    cJkgK: 460,
    typicalThicknessMm: 5,
    characterNote:
      "The highest recovery of any common pan — a cold steak barely dents the surface temperature, so the sear never stalls.",
    limitationNote:
      "Slow to change its mind in either direction. Poor for anything needing a fast temperature drop, and it takes minutes to preheat evenly.",
    bestFor: ["frying", "roasting", "grilling"],
  },
  {
    id: "carbon_steel",
    name: "Carbon steel (wok / skillet)",
    kWmK: 50,
    rhoKgM3: 7850,
    cJkgK: 490,
    typicalThicknessMm: 2,
    characterNote:
      "Nearly cast iron's conductivity at a fraction of the mass — it responds to the burner in seconds, which is the whole basis of wok technique.",
    limitationNote:
      "Low areal heat capacity. Overload a wok with cold ingredients and the temperature collapses; that is the physics behind 'do not crowd the pan'.",
    bestFor: ["stir_frying", "frying"],
  },
  {
    id: "stainless_304",
    name: "Stainless steel (single-ply)",
    kWmK: 16.2,
    rhoKgM3: 8000,
    cJkgK: 500,
    typicalThicknessMm: 2,
    characterNote: "Inert, non-reactive, and takes acid and abuse without complaint.",
    limitationNote:
      "Conducts about 1/13 as well as aluminium, so it reproduces the burner's flame pattern as scorch marks. Rarely used un-clad for this reason.",
    bestFor: ["boiling", "simmering"],
  },
  {
    id: "aluminium",
    name: "Aluminium (disc or clad core)",
    kWmK: 205,
    rhoKgM3: 2700,
    cJkgK: 900,
    typicalThicknessMm: 3,
    characterNote:
      "Excellent spreading at low mass — why almost every clad pan hides an aluminium core between two stainless skins.",
    limitationNote:
      "Reactive with acid when bare, and light enough that recovery still suffers against iron at the same thickness.",
    bestFor: ["boiling", "poaching", "braising"],
  },
  {
    id: "copper",
    name: "Copper",
    kWmK: 398,
    rhoKgM3: 8933,
    cJkgK: 385,
    typicalThicknessMm: 2.5,
    characterNote:
      "The most responsive material in the kitchen — highest conductivity, so it tracks a burner change almost immediately and spreads it perfectly.",
    limitationNote:
      "Needs a tin or stainless lining, and the responsiveness cuts both ways: it cools as fast as it heats.",
    bestFor: ["emulsification", "poaching", "infusing"],
  },
  {
    id: "enamelled_cast_iron",
    name: "Enamelled cast iron",
    kWmK: 52,
    rhoKgM3: 7200,
    cJkgK: 460,
    typicalThicknessMm: 5,
    characterNote:
      "Cast iron's thermal mass with a non-reactive glass surface — the standard braising vessel because it survives hours of acidic liquid.",
    limitationNote:
      "The enamel is glassy and chips under thermal shock. Never take one from a hot oven to a cold sink.",
    bestFor: ["braising", "stewing", "simmering"],
  },
  {
    id: "borosilicate_glass",
    name: "Borosilicate glass",
    kWmK: 1.1,
    rhoKgM3: 2230,
    cJkgK: 750,
    typicalThicknessMm: 4,
    characterNote:
      "Transparent and chemically inert — you can watch a custard set and the vessel contributes nothing to flavour.",
    limitationNote:
      "Conducts ~50× worse than cast iron. It insulates rather than transfers, which is why glass bakeware browns bases so poorly.",
    bestFor: ["gelification", "marinating"],
  },
  {
    id: "stoneware",
    name: "Stoneware / earthenware",
    kWmK: 1.5,
    rhoKgM3: 2300,
    cJkgK: 900,
    typicalThicknessMm: 8,
    characterNote:
      "Low conductivity plus real thickness gives a slow, gentle, very even heat — the classic vessel for long covered cooking.",
    limitationNote: "Cannot sear. It will never deliver a flux high enough for crust formation.",
    bestFor: ["stewing", "braising", "fermentation"],
  },
];

export interface CookwareDerived extends CookwareMaterial {
  /** Thermal effusivity √(kρc), J·m⁻²·K⁻¹·s⁻¹ᐟ². Governs instantaneous contact temperature. */
  effusivity: number;
  /** Areal heat capacity ρ·c·thickness, J·m⁻²·K⁻¹. Governs sustained recovery. */
  arealHeatCapacity: number;
  /** Lateral spreading conductance k·thickness, W·K⁻¹. Governs hot-spot smoothing. */
  spreading: number;
  /** Thermal diffusivity k/(ρc), m²·s⁻¹. */
  alphaM2s: number;
}

export function deriveCookware(material: CookwareMaterial): CookwareDerived {
  const { kWmK, rhoKgM3, cJkgK, typicalThicknessMm } = material;
  const thicknessM = typicalThicknessMm / 1000;
  return {
    ...material,
    effusivity: Math.sqrt(kWmK * rhoKgM3 * cJkgK),
    arealHeatCapacity: rhoKgM3 * cJkgK * thicknessM,
    spreading: kWmK * thicknessM,
    alphaM2s: kWmK / (rhoKgM3 * cJkgK),
  };
}

export const COOKWARE_DERIVED: CookwareDerived[] = COOKWARE_MATERIALS.map(deriveCookware);

export function getCookware(id: string): CookwareDerived | null {
  return COOKWARE_DERIVED.find((m) => m.id === id) ?? null;
}

/**
 * Effusivity of lean food, J·m⁻²·K⁻¹·s⁻¹ᐟ².
 *
 * BASIS: √(k·ρ·c) with k = 0.45 W·m⁻¹·K⁻¹, ρ = 1050 kg·m⁻³, c = 3500 J·kg⁻¹·K⁻¹
 * for lean muscle. Cross-checks against the diffusivity used in
 * `src/lib/cooking/thermo.ts`: k/(ρc) = 1.22e-7 m²·s⁻¹ against the 1.3e-7 stated
 * there, i.e. the two property sets agree to 6 %.
 */
export const FOOD_EFFUSIVITY = Math.sqrt(0.45 * 1050 * 3500);

/**
 * Interface temperature at the instant cold food contacts a hot pan, °C.
 *
 * Two semi-infinite bodies brought into perfect contact settle immediately at
 * the effusivity-weighted mean of their temperatures:
 *
 *     T_contact = (e₁·T₁ + e₂·T₂) / (e₁ + e₂)
 *
 * This is the moment that decides whether you get a sear or a grey steam bath,
 * and it happens before any of the pan's stored energy has had time to matter.
 * `[MEASURED 2026-08-16]` a 230 °C pan meeting 5 °C meat holds the interface at
 * 210 °C in cast iron but only 199 °C in single-ply stainless — an 11 °C gap
 * that lands squarely on the Maillard threshold.
 *
 * Idealised: assumes perfect contact and ignores the oil film, surface
 * roughness and the food's own moisture. Directionally right, not a prediction.
 */
export function contactTemperatureC(
  panC: number,
  foodC: number,
  panEffusivity: number,
  foodEffusivity: number = FOOD_EFFUSIVITY,
): number {
  return (panEffusivity * panC + foodEffusivity * foodC) / (panEffusivity + foodEffusivity);
}

/**
 * Temperature drop when a mass of cold food lands in a pan, °C.
 *
 * The sustained counterpart to {@link contactTemperatureC}: once the interface
 * transient has passed, what matters is whether the pan carries enough stored
 * energy to reheat the load without the burner. Energy balance, burner
 * contribution ignored (a worst case, and close to true for the first seconds).
 *
 * @param arealHeatCapacity Pan areal heat capacity, J·m⁻²·K⁻¹.
 * @param foodMassKg Mass of food added.
 * @param foodCJkgK Specific heat of the food, J·kg⁻¹·K⁻¹.
 * @param deltaTC Temperature gap the food has to close, K.
 * @param panAreaM2 Contact area of the pan base.
 */
export function panTemperatureDropC(
  arealHeatCapacity: number,
  foodMassKg: number,
  foodCJkgK: number,
  deltaTC: number,
  panAreaM2: number,
): number {
  const panCapacity = arealHeatCapacity * panAreaM2;
  const energyDemanded = foodMassKg * foodCJkgK * deltaTC;
  return energyDemanded / panCapacity;
}
