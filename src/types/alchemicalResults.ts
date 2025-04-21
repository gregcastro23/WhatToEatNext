import { ElementalProperties, Element, ZodiacSign } from './alchemy';

/**
 * Standardized result format for alchemical calculations
 * Used by enhanced alchemical matching algorithms
 */
export interface StandardizedAlchemicalResult {
  // Core elemental balance (lowercase keys for API compatibility)
  elementalBalance: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  
  // Core alchemical properties
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  
  // Elemental properties (can use either format)
  elements?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  
  // Result summary
  dominantElement?: string;
  dominant?: {
    element: Element;
    modality: 'Cardinal' | 'Fixed' | 'Mutable';
    quality: 'Hot' | 'Cold' | 'Wet' | 'Dry';
  };
  
  // Optional modalities
  modalities?: {
    Cardinal: number;
    Fixed: number;
    Mutable: number;
  };
  
  // Optional qualities
  qualities?: {
    Hot: number;
    Cold: number;
    Wet: number;
    Dry: number;
  };
  
  // Recommendation output
  recommendation?: string;
  cuisine?: string;
  
  // Harmony measures
  harmonyScore: number;
  reciprocality: number;
  
  // Optional thermodynamic properties
  heat?: number;
  entropy?: number;
  reactivity?: number;
  energy?: number;
  
  // Allow other properties
  [key: string]: unknown;
} 