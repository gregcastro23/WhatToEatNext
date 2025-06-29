
import type { ElementalProperties } from '@/types/alchemy';
import { _Element , AlchemicalProperties } from "@/types/alchemy";


export interface AlchemicalState {
  elementalProperties: ElementalProperties;
  isCalculating: boolean;
  lastUpdated: Date | null;
  elementalState?: ElementalProperties;
  currentSeason?: string;
}

export interface AlchemicalContextType {
  state: AlchemicalState;
  updateElementalProperties: (properties: Partial<ElementalProperties>) => void;
  resetState: () => void;
  elementalState?: ElementalProperties;
  alchemicalValues?: AlchemicalProperties;
}
