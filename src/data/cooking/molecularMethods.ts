import type { BasicThermodynamicProperties } from "@/types/alchemy";

/**
 * Molecular gastronomy cooking methods and their details
 */
export const molecularCookingMethods: Record<
  string,
  {
    name: string;
    description: string;
    chemicalProcess: string;
    precisionRequirements: string;
    commonErrors: string[];
    advancedEquipment: string[];
    texturalOutcomes: string[];
    thermodynamicProperties: BasicThermodynamicProperties;
  }
> = {
  spherification: {
    name: "Spherification",
    description:
      "A technique that encapsulates liquids in a thin gel membrane, creating caviar-like spheres that burst in the mouth.",
    chemicalProcess:
      "Sodium alginate and calcium chloride reaction creates a gel membrane around liquid droplets.",
    precisionRequirements:
      "Precise measurement of chemicals, careful pH control, and controlled dropping technique.",
    commonErrors: [
      "Incorrect chemical ratios causing improper gelation",
      "pH imbalance preventing proper spherification",
      "Improper dropping height affecting sphere shape",
    ],
    advancedEquipment: [
      "Pipettes",
      "Digital scale (0.01g precision)",
      "pH meter",
      "Calcium bath containers",
    ],
    texturalOutcomes: [
      "Liquid-filled spheres with thin membranes",
      "Caviar-like pearls",
      "Controlled-burst sensation",
    ],
    thermodynamicProperties: {
      heat: 0.2,
      entropy: 0.4,
      reactivity: 0.8,
      gregsEnergy: 0.2 - 0.4 * 0.2,
    },
  },
  gelification: {
    name: "Gelification",
    description:
      "The process of transforming liquids into gels or jellies using various hydrocolloids.",
    chemicalProcess:
      "Hydrocolloids (agar, gelatin, carrageenan) trap water molecules in a network structure.",
    precisionRequirements:
      "Exact temperature control, precise hydrocolloid measurement, and careful cooling procedure.",
    commonErrors: [
      "Overheating causing hydrocolloid degradation",
      "Improper hydration of gelling agents",
      "Using gelling agents with incompatible ingredients",
    ],
    advancedEquipment: [
      "Water bath with precise temperature control",
      "Digital thermometer",
      "Silicon molds",
      "Blast chiller",
    ],
    texturalOutcomes: [
      "Elastic gels",
      "Firm jellies",
      "Soft gel sheets",
      "Flexible noodles",
    ],
    thermodynamicProperties: {
      heat: 0.5,
      entropy: 0.3,
      reactivity: 0.6,
      gregsEnergy: 0.5 - 0.3 * 0.2,
    },
  },
  emulsification: {
    name: "Emulsification",
    description:
      "Creating stable mixtures of typically immiscible liquids through advanced stabilization techniques.",
    chemicalProcess:
      "Lecithin or other emulsifiers reduce surface tension between oil and water molecules.",
    precisionRequirements:
      "Specific emulsifier ratios, controlled blending speeds, and temperature management.",
    commonErrors: [
      "Insufficient emulsifier causing separation",
      "Overblending breaking emulsion",
      "Temperature fluctuations destabilizing the mixture",
    ],
    advancedEquipment: [
      "High-speed blender",
      "Immersion blender",
      "Homogenizer",
      "Vacuum chamber",
    ],
    texturalOutcomes: [
      "Light foams",
      "Airy mousses",
      "Stable sauces",
      "Creamy textures with no visible separation",
    ],
    thermodynamicProperties: {
      heat: 0.3,
      entropy: 0.7,
      reactivity: 0.5,
      gregsEnergy: 0.3 - 0.7 * 0.2,
    },
  },
  cryo_cooking: {
    name: "Cryo-Cooking",
    description:
      "Using extreme cold (typically liquid nitrogen) to flash-freeze ingredients, creating unique textures.",
    chemicalProcess:
      "Rapid freezing forms microcrystals that minimize cellular damage while creating unusual textures.",
    precisionRequirements:
      "Safety protocols, appropriate dipping time, and controlled liquid nitrogen handling.",
    commonErrors: [
      "Overexposure causing excessive freezing and texture damage",
      "Safety hazards from improper handling",
      "Uneven application creating inconsistent results",
    ],
    advancedEquipment: [
      "Liquid nitrogen container",
      "Insulated gloves",
      "Safety goggles",
      "Special tongs and dipping tools",
    ],
    texturalOutcomes: [
      "Shatter-crisp exteriors",
      "Ultra-smooth ice creams",
      "Frozen powders that melt instantly",
      "Crisp shells with soft interiors",
    ],
    thermodynamicProperties: {
      heat: 0.1,
      entropy: 0.6,
      reactivity: 0.3,
      gregsEnergy: 0.1 - 0.6 * 0.2,
    },
  },
};

export default molecularCookingMethods;
