import type { ButcherOrderTicket } from "@/lib/butcher/types";

/**
 * Curated multi-tier Butcher's Block chef and culinary-physics order tickets.
 *
 * @file src/lib/butcher/science/butcherTickets.ts
 */
export const ORDER_TICKETS: readonly ButcherOrderTicket[] = [
  // Apprentice — Primal & Sub-Primal Identification
  {
    id: "app-beef-nystrip",
    tier: "apprentice",
    title: "Bistro Strip Order",
    prompt:
      "Locate and break down the Beef Short Loin into a 350 g New York Strip ready for a cast-iron sear.",
    speciesId: "beef",
    expectedCutId: "ny-strip",
    targetMassG: 350,
    targetAngleDeg: 90,
    targetMethod: "high-heat-sear",
    targetCoreTempC: 55,
    physicsConstraint: null,
  },
  {
    id: "app-pork-belly",
    tier: "apprentice",
    title: "Ramen Tare & Chashu Prep",
    prompt:
      "Break out the Pork Belly from the Belly & Ribs primal and portion a 400 g slab for braising.",
    speciesId: "pork",
    expectedCutId: "pork-belly",
    targetMassG: 400,
    targetAngleDeg: 90,
    targetMethod: "collagen-braise",
    targetCoreTempC: 92,
    physicsConstraint: null,
  },
  {
    id: "app-salmon-center",
    tier: "apprentice",
    title: "Crisp-Skin Dinner Service",
    prompt:
      "Select the Atlantic Salmon Center-Cut Fillet and trim a uniform 190 g portion.",
    speciesId: "finfish",
    expectedCutId: "center-fillet",
    targetMassG: 190,
    targetAngleDeg: 90,
    targetMethod: "high-heat-sear",
    targetCoreTempC: 50,
    physicsConstraint: null,
  },
  {
    id: "app-poultry-thigh",
    tier: "apprentice",
    title: "Braised Dark Quarter",
    prompt:
      "Isolate the Chicken Thigh from the Leg Quarter primal and trim to a 180 g portion.",
    speciesId: "poultry",
    expectedCutId: "chicken-thigh",
    targetMassG: 180,
    targetAngleDeg: 90,
    targetMethod: "collagen-braise",
    targetCoreTempC: 82,
    physicsConstraint: null,
  },

  // Journeyman — Grain Vector & Knife Plane Alignment
  {
    id: "jrn-outside-skirt",
    tier: "journeyman",
    title: "Carne Asada Across the Grain",
    prompt:
      "Carve an Outside Skirt Steak from Beef Short Plate — align the 3D slicing plane at 90° across the transverse grain and trim to a 225 g portion.",
    speciesId: "beef",
    expectedCutId: "outside-skirt",
    targetMassG: 225,
    targetAngleDeg: 90,
    targetMethod: "high-heat-sear",
    targetCoreTempC: 55,
    physicsConstraint: null,
  },
  {
    id: "jrn-flank-bavette",
    tier: "journeyman",
    title: "Steak Frites Bias Carve",
    prompt:
      "Select the Beef Flank Steak (Bavette), align the knife plane perpendicular (90°) to its long fibers, and cut a 260 g portion.",
    speciesId: "beef",
    expectedCutId: "flank-steak",
    targetMassG: 260,
    targetAngleDeg: 90,
    targetMethod: "high-heat-sear",
    targetCoreTempC: 54,
    physicsConstraint: null,
  },
  {
    id: "jrn-brisket-flat",
    tier: "journeyman",
    title: "Smokehouse Brisket Service",
    prompt:
      "Select the Beef Brisket Flat, set the carving plane perpendicular (90°) to the pectoral grain, and slice a 300 g service portion.",
    speciesId: "beef",
    expectedCutId: "brisket-flat",
    targetMassG: 300,
    targetAngleDeg: 90,
    targetMethod: "low-and-slow-smoke",
    targetCoreTempC: 93,
    physicsConstraint: null,
  },
  {
    id: "jrn-tri-tip",
    tier: "journeyman",
    title: "Santa Maria Tri-Tip",
    prompt:
      "Find the Beef Tri-Tip Roast in Sirloin, slice across the diagonal grain at 90°, and trim to 280 g.",
    speciesId: "beef",
    expectedCutId: "tri-tip",
    targetMassG: 280,
    targetAngleDeg: 90,
    targetMethod: "reverse-sear",
    targetCoreTempC: 56,
    physicsConstraint: null,
  },

  // Master Butcher — Culinary Biophysics Match
  {
    id: "mst-collagen-braise",
    tier: "master",
    title: "3.5-Hour Dutch-Oven Collagen Challenge",
    prompt:
      "A chef needs a Beef cut with high collagen (≥2.2 g/100g) that melts into rich gelatin during a 3.5-hour braise. Pick a qualifying cut, slice 90° across grain, and dial target temp near 93 °C.",
    speciesId: "beef",
    expectedCutId: "osso-buco-shank",
    targetMassG: 450,
    targetAngleDeg: 90,
    targetMethod: "collagen-braise",
    targetCoreTempC: 93,
    physicsConstraint: {
      speciesId: "beef",
      minCollagenG: 2.2,
      requiredMethod: "collagen-braise",
    },
  },
  {
    id: "mst-high-marbling-sear",
    tier: "master",
    title: "High-Marbling Reverse Sear",
    prompt:
      "Select a Beef cut with ≥16 g/100g intramuscular fat and low collagen (<1.2 g/100g) suited for a reverse-sear steak finished to 55–56 °C, sliced across grain.",
    speciesId: "beef",
    expectedCutId: "ribeye",
    targetMassG: 340,
    targetAngleDeg: 90,
    targetMethod: "reverse-sear",
    targetCoreTempC: 56,
    physicsConstraint: {
      speciesId: "beef",
      minFatG: 16,
      maxCollagenG: 1.2,
      requiredMethod: "reverse-sear",
    },
  },
  {
    id: "mst-lamb-collagen",
    tier: "master",
    title: "Braised Lamb Gelatin Gloss",
    prompt:
      "Pick a Lamb cut with ≥2.2 g/100g collagen for slow braising, slice across grain, and set core target temp to 92–93 °C.",
    speciesId: "lamb",
    expectedCutId: "lamb-shank",
    targetMassG: 380,
    targetAngleDeg: 90,
    targetMethod: "collagen-braise",
    targetCoreTempC: 93,
    physicsConstraint: {
      speciesId: "lamb",
      minCollagenG: 2.2,
      requiredMethod: "collagen-braise",
    },
  },
  {
    id: "mst-poultry-sous-vide",
    tier: "master",
    title: "Precision White-Meat Pasteurization",
    prompt:
      "Select a lean Poultry cut with ≤0.6 g/100g collagen, dial gentle sous-vide or poach heat near 65 °C to prevent actin dryness, and slice 90° across grain.",
    speciesId: "poultry",
    expectedCutId: "breast-supreme",
    targetMassG: 210,
    targetAngleDeg: 90,
    targetMethod: "sous-vide",
    targetCoreTempC: 65,
    physicsConstraint: {
      speciesId: "poultry",
      maxCollagenG: 0.6,
    },
  },
];
