import { SignEnergyState, ZodiacSign } from '../constants/signEnergyStates';
import { 
    Chakra, 
    CHAKRAS, 
    calculateChakraEnergies, 
    recommendFoodsForChakraBalance, 
    CHAKRA_PROPERTIES 
} from '../constants/chakraMappings';

export interface ChakraEnergyState {
    chakra: Chakra;
    energyLevel: number;
    properties: {
        sanskritName: string;
        color: string;
        element: string;
        planet: string;
    };
    balanceState: 'balanced' | 'underactive' | 'overactive';
    relatedSigns: ZodiacSign[];
    recommendedFoods: string[];
}

export class ChakraService {
    /**
     * Calculates the energy state of all chakras based on sign energy states
     * @param signEnergyStates Array of sign energy states
     * @returns Array of chakra energy states
     */
    public calculateChakraEnergyStates(signEnergyStates: SignEnergyState[]): ChakraEnergyState[] {
        // Convert sign energy states to a record for easier access
        const signEnergyRecord: Record<ZodiacSign, number> = {
            'aries': 0,
            'taurus': 0,
            'gemini': 0,
            'cancer': 0,
            'leo': 0,
            'virgo': 0,
            'Libra': 0,
            'Scorpio': 0,
            'sagittarius': 0,
            'capricorn': 0,
            'aquarius': 0,
            'pisces': 0
        };
        
        signEnergyStates.forEach(state => {
            if (state.sign && state.sign in signEnergyRecord) {
                signEnergyRecord[state.sign] = state.currentEnergy;
            }
        });
        
        // Calculate raw chakra energy levels
        const chakraEnergies = calculateChakraEnergies(signEnergyRecord);
        
        // Get food recommendations based on energy levels
        const foodRecommendations = recommendFoodsForChakraBalance(chakraEnergies);
        
        // Create detailed chakra energy states
        return CHAKRAS.map(chakra => {
            const energyLevel = chakraEnergies[chakra];
            
            // Determine balance state
            let balanceState: 'balanced' | 'underactive' | 'overactive';
            if (energyLevel < 0.4) {
                balanceState = 'underactive';
            } else if (energyLevel > 0.8) {
                balanceState = 'overactive';
            } else {
                balanceState = 'balanced';
            }
            
            // Get properties
            const properties = CHAKRA_PROPERTIES[chakra];
            
            // Find related signs (signs that influence this chakra)
            const relatedSigns = signEnergyStates
                .filter(state => chakraEnergies[chakra] > 0)
                .map(state => state.sign)
                .slice(0, 3); // Limit to top 3 related signs
            
            return {
                chakra,
                energyLevel,
                properties: {
                    sanskritName: properties.sanskritName,
                    color: properties.color,
                    element: properties.element,
                    planet: properties.planet
                },
                balanceState,
                relatedSigns,
                recommendedFoods: foodRecommendations[chakra] || []
            };
        });
    }
    
    /**
     * Gets food recommendations to balance chakras based on current energy states
     * @param chakraEnergyStates Array of chakra energy states
     * @returns Record of chakra names to food recommendations
     */
    public getFoodRecommendations(chakraEnergyStates: ChakraEnergyState[]): Record<Chakra, string[]> {
        const recommendations: Record<Chakra, string[]> = {} as Record<Chakra, string[]>;
        
        chakraEnergyStates.forEach(state => {
            if (state.balanceState === 'underactive') {
                recommendations[state.chakra] = state.recommendedFoods;
            }
        });
        
        return recommendations;
    }
    
    /**
     * Suggests dietary adjustments based on chakra imbalances
     * @param chakraEnergyStates Array of chakra energy states
     * @returns Dietary suggestions
     */
    public suggestDietaryAdjustments(chakraEnergyStates: ChakraEnergyState[]): string[] {
        const suggestions: string[] = [];
        
        // Check for root chakra imbalance
        const rootState = chakraEnergyStates.find(state => state.chakra === 'Root');
        if (rootState && rootState.balanceState === 'underactive') {
            suggestions.push('Increase grounding foods like root vegetables and proteins');
        } else if (rootState && rootState.balanceState === 'overactive') {
            suggestions.push('Reduce heavy, dense foods and incorporate more light plant foods');
        }
        
        // Check for sacral chakra imbalance
        const sacralState = chakraEnergyStates.find(state => state.chakra === 'Sacral');
        if (sacralState && sacralState.balanceState === 'underactive') {
            suggestions.push('Add orange foods and sweet flavors to stimulate creativity');
        }
        
        // Check for solar plexus imbalance
        const solarPlexusState = chakraEnergyStates.find(state => state.chakra === 'Solar Plexus');
        if (solarPlexusState && solarPlexusState.balanceState === 'underactive') {
            suggestions.push('Include more complex carbohydrates and yellow foods for energy');
        }
        
        // Check for heart chakra imbalance
        const heartState = chakraEnergyStates.find(state => state.chakra === 'Heart');
        if (heartState && heartState.balanceState === 'underactive') {
            suggestions.push('Incorporate more leafy greens and heart-opening foods like rose tea');
        }
        
        // General recommendation based on overall chakra balance
        const underactiveChakras = chakraEnergyStates.filter(state => state.balanceState === 'underactive');
        if (underactiveChakras.length > 3) {
            suggestions.push('Consider a rainbow diet with foods of all colors to balance all chakras');
        }
        
        return suggestions;
    }
} 