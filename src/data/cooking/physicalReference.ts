export interface ProteinClassBreakdown {
    poultry?: { temp: number; note: string };
    redMeat?: { temp: number; note: string };
    seafood?: { temp: number; note: string };
    vegetable?: { temp: number; note: string };
}

export interface MethodPhysicalReference {
    temperatureF: {
        low: number;
        high: number;
        ideal: number;
        note: string;
        proteins?: ProteinClassBreakdown;
    };
    pressure: {
        mode: "ambient" | "pressurized" | "vacuum" | "variable";
        gaugePsi: string;
        absoluteKPa: string;
        note: string;
    };
}

/**
 * Utility to calculate boiling capabilities given altitude.
 * Standard sea level is ~101.3 kPa, boiling at 212°F.
 * Pressure drops by ~1.2 kPa per 100 meters. 
 * Boiling point drops by ~1°F per 500 feet (152.4 meters).
 */
export function getAltitudeAdjustedBoiling(altitudeMeters: number) {
    const baseKPa = 101.325;
    const kPa = Math.max(0, baseKPa - (altitudeMeters * 0.012));

    const baseTempF = 212;
    const tempDrop = (altitudeMeters / 152.4) * 1.0;
    const boilingTempF = baseTempF - tempDrop;

    return {
        absoluteKPa: kPa.toFixed(1),
        boilingTempF: Math.max(32, boilingTempF).toFixed(1),
    };
}

export const METHOD_PHYSICAL_REFERENCE: Record<string, MethodPhysicalReference> = {
    roasting: {
        temperatureF: { low: 300, high: 475, ideal: 375, note: "Dry radiant/convective oven heat; surface browning peaks above ~300°F." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Open or vented oven; atmospheric pressure." },
    },
    frying: {
        temperatureF: { low: 325, high: 375, ideal: 350, note: "Oil-mediated heat transfer; crispness and Maillard usually optimized in this zone." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Standard deep/pan frying at atmospheric pressure." },
    },
    stir_frying: {
        temperatureF: { low: 350, high: 450, ideal: 400, note: "High pan-wall temperatures with rapid tossing and short dwell time." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Open wok/pan operation." },
    },
    grilling: {
        temperatureF: { low: 400, high: 650, ideal: 500, note: "Direct radiant heat from flame/coals for fast char and crust formation." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Open-air atmospheric grilling." },
    },
    broiling: {
        temperatureF: { low: 500, high: 550, ideal: 525, note: "Top-down radiant heat; short-distance, high-intensity finishing/cooking." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Broiler cavity vented to atmosphere." },
    },
    sous_vide: {
        temperatureF: {
            low: 120, high: 190, ideal: 145,
            note: "Precision water bath controls protein denaturation bands tightly.",
            proteins: {
                poultry: { temp: 150, note: "Pasteurization targeted for safety without stringiness." },
                redMeat: { temp: 131, note: "Medium-rare breakdown of precise myosin bands." },
                seafood: { temp: 122, note: "Delicate protein stability without chalkiness." },
                vegetable: { temp: 185, note: "High heat required to break down hemicellulose and pectin." }
            }
        },
        pressure: { mode: "vacuum", gaugePsi: "-3 to -12", absoluteKPa: "~60-95", note: "Cooking medium is ambient water; food is in low-oxygen reduced-pressure packaging." },
    },
    boiling: {
        temperatureF: { low: 206, high: 212, ideal: 212, note: "Rolling boil at sea level; point shifts with altitude/pressure." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Atmospheric boiling point conditions. Pressure shifts via altitude." },
    },
    steaming: {
        temperatureF: { low: 200, high: 212, ideal: 212, note: "Steam condensation drives latent-heat transfer without full immersion." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Conventional steaming basket/chamber." },
    },
    braising: {
        temperatureF: { low: 275, high: 350, ideal: 325, note: "Two-stage sear then covered moist cook near simmer range." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Covered vessel, but not pressure-sealed." },
    },
    poaching: {
        temperatureF: { low: 160, high: 180, ideal: 170, note: "Gentle sub-simmer range to protect delicate proteins/textures." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Open or lightly covered at atmospheric pressure." },
    },
    simmering: {
        temperatureF: { low: 185, high: 205, ideal: 195, note: "Below full boil for controlled extraction/reduction and tenderization." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Atmospheric simmer environment." },
    },
    pressure_cooking: {
        temperatureF: { low: 225, high: 250, ideal: 242, note: "Elevated boiling point from sealed steam pressure; rapid collagen/starch conversion." },
        pressure: { mode: "pressurized", gaugePsi: "5-15", absoluteKPa: "~136-205", note: "Typical household range (low/high pressure settings)." },
    },
    spherification: {
        temperatureF: { low: 36, high: 77, ideal: 68, note: "Hydrocolloid/calcium membrane formation works best in cool-to-room conditions." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Gel membrane formation at atmospheric pressure." },
    },
    gelification: {
        temperatureF: { low: 40, high: 185, ideal: 140, note: "Hydration, setting, and service windows vary by hydrocolloid system (agar/gelatin/gellan)." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Most culinary gels are formed and set at atmospheric pressure." },
    },
    emulsification: {
        temperatureF: { low: 40, high: 180, ideal: 120, note: "Emulsion stability is shear + temperature dependent; many systems break when overheated." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Shear-driven phase dispersion at atmospheric pressure." },
    },
    cryo_cooking: {
        temperatureF: { low: -321, high: 32, ideal: -196, note: "Cryogenic flash-freezing typically uses liquid nitrogen (-196°C / -321°F)." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Cryogen boils at atmospheric pressure in culinary service." },
    },
    fermentation: {
        temperatureF: { low: 55, high: 95, ideal: 72, note: "Microbial activity bands vary by culture; many food ferments target cool room ranges." },
        pressure: { mode: "variable", gaugePsi: "0-2 (container dependent)", absoluteKPa: "~101-115", note: "Gas-producing ferments may build slight overpressure in sealed vessels." },
    },
    pickling: {
        temperatureF: { low: 35, high: 75, ideal: 68, note: "Acid/salt diffusion and microbial suppression are strongest in controlled cool storage." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Standard brine/vinegar pickling is atmospheric." },
    },
    smoking: {
        temperatureF: { low: 68, high: 285, ideal: 225, note: "Cold smoke (~68-90°F) for flavor/preservation; hot smoke (~165-285°F) for cooking." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Smoker chambers are generally vented and near atmospheric pressure." },
    },
    curing: {
        temperatureF: { low: 34, high: 60, ideal: 40, note: "Salt/nitrite/sugar curing is primarily time + water-activity control at cool temperatures." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "No intentional pressure elevation in standard curing workflows." },
    },
    dehydrating: {
        temperatureF: { low: 95, high: 165, ideal: 135, note: "Low convective heat removes water while preserving structure/nutrients." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Conventional airflow dehydration." },
    },
    infusing: {
        temperatureF: { low: 34, high: 212, ideal: 140, note: "Cold, warm, and hot infusions extract different volatile/nonvolatile compounds." },
        pressure: { mode: "variable", gaugePsi: "0-5", absoluteKPa: "~101-136", note: "Pressure-assisted infusion exists, but most culinary infusion is atmospheric." },
    },
    distilling: {
        temperatureF: { low: 95, high: 212, ideal: 173, note: "Component-specific boiling/condensation windows; ethanol-water systems center around 173°F+." },
        pressure: { mode: "variable", gaugePsi: "-12 to 0", absoluteKPa: "~20-101", note: "Atmospheric and vacuum distillation are both used in culinary aroma work." },
    },
    marinating: {
        temperatureF: { low: 34, high: 70, ideal: 40, note: "Refrigerated diffusion and acid/salt-driven denaturation for safety + controlled uptake." },
        pressure: { mode: "ambient", gaugePsi: "0", absoluteKPa: "~101", note: "Typically atmospheric unless vacuum tumbling/compression is used." },
    },
};
