import type { AnatomicalCut, PrimalSpec } from "@/lib/butcher/types";
import { BEEF_FOREQUARTER_CUTS } from "./beefForequarterCuts";
import { BEEF_HINDQUARTER_CUTS } from "./beefHindquarterCuts";
import { BEEF_PLATE_FLANK_CUTS } from "./beefPlateFlankCuts";
import { BEEF_ROUND_BRISKET_CUTS } from "./beefRoundBrisketCuts";

export const BEEF_PRIMALS: readonly PrimalSpec[] = [
  { id: "chuck", speciesId: "beef", name: "Chuck", restPosition: [-1.15, 0.22, 0], explodeVector: [-0.75, 0.35, 0.15], colorHex: "#8f2d2d" },
  { id: "rib", speciesId: "beef", name: "Rib", restPosition: [-0.35, 0.34, 0], explodeVector: [-0.15, 0.55, 0.22], colorHex: "#b83b3b" },
  { id: "short-loin", speciesId: "beef", name: "Short Loin", restPosition: [0.42, 0.36, 0], explodeVector: [0.22, 0.58, 0.2], colorHex: "#cc4444" },
  { id: "sirloin", speciesId: "beef", name: "Sirloin", restPosition: [1.05, 0.3, 0], explodeVector: [0.65, 0.44, 0.18], colorHex: "#b63a42" },
  { id: "round", speciesId: "beef", name: "Round", restPosition: [1.62, 0.02, 0], explodeVector: [0.95, 0.05, 0.12], colorHex: "#9b2c38" },
  { id: "brisket", speciesId: "beef", name: "Brisket", restPosition: [-1.18, -0.34, 0.04], explodeVector: [-0.75, -0.45, 0.32], colorHex: "#9e4332" },
  { id: "fore-shank", speciesId: "beef", name: "Fore Shank", restPosition: [-1.2, -0.74, 0.08], explodeVector: [-0.78, -0.75, 0.28], colorHex: "#7c2e2e" },
  { id: "short-plate", speciesId: "beef", name: "Short Plate", restPosition: [-0.22, -0.32, 0.06], explodeVector: [-0.1, -0.5, 0.34], colorHex: "#a84438" },
  { id: "flank", speciesId: "beef", name: "Flank", restPosition: [0.65, -0.3, 0.06], explodeVector: [0.45, -0.48, 0.32], colorHex: "#96363d" },
];

export const BEEF_CUTS: readonly AnatomicalCut[] = [
  ...BEEF_FOREQUARTER_CUTS,
  ...BEEF_HINDQUARTER_CUTS,
  ...BEEF_ROUND_BRISKET_CUTS,
  ...BEEF_PLATE_FLANK_CUTS,
];
