"use strict";
// Constants for reference
export const CHAKRAS = {
    root: {
        name: 'Root Chakra',
        sanskritName: 'Muladhara',
        element: 'Earth',
        color: 'Red',
        description: 'Foundation, stability, security',
        governs: ['Basic survival', 'Stability', 'Groundedness'],
        balanceIndicators: ['Security', 'Stability', 'Groundedness'],
        imbalanceIndicators: ['Fear', 'Anxiety', 'Survival issues'],
        planet: 'Saturn',
        primaryEnergyState: 'Matter'
    },
    sacral: {
        name: 'Sacral Chakra',
        sanskritName: 'Swadhisthana',
        element: 'Water',
        color: 'Orange',
        description: 'Creativity, emotion, pleasure',
        governs: ['Creativity', 'Sexuality', 'Emotions'],
        balanceIndicators: ['Passion', 'Joy', 'Healthy boundaries'],
        imbalanceIndicators: ['Emotional issues', 'Addiction', 'Detachment'],
        planet: 'Jupiter',
        primaryEnergyState: 'Essence'
    },
    solarPlexus: {
        name: 'Solar Plexus Chakra',
        sanskritName: 'Manipura',
        element: 'Fire',
        color: 'Yellow',
        description: 'Willpower, confidence, self-esteem',
        governs: ['Personal power', 'Will', 'Assertiveness'],
        balanceIndicators: ['Confidence', 'Motivation', 'Purpose'],
        imbalanceIndicators: ['Control issues', 'Lack of direction', 'Perfectionism'],
        planet: 'Mars',
        primaryEnergyState: 'Essence'
    },
    heart: {
        name: 'Heart Chakra',
        sanskritName: 'Anahata',
        element: 'Air',
        color: 'Green',
        description: 'Love, compassion, harmony',
        governs: ['Love', 'Compassion', 'Forgiveness'],
        balanceIndicators: ['Empathy', 'Openness', 'Connection'],
        imbalanceIndicators: ['Grief', 'Isolation', 'Resentment'],
        planet: 'Venus',
        primaryEnergyState: 'Essence'
    },
    throat: {
        name: 'Throat Chakra',
        sanskritName: 'Vishuddha',
        element: 'ether',
        color: 'Blue',
        description: 'Communication, expression, truth',
        governs: ['Communication', 'Self-expression', 'Truth'],
        balanceIndicators: ['Clear communication', 'Authentic expression', 'Active listening'],
        imbalanceIndicators: ['Communication issues', 'Dishonesty', 'Inability to express'],
        planet: 'Mercury',
        primaryEnergyState: 'Substance'
    },
    brow: {
        name: 'Third Eye Chakra',
        sanskritName: 'Ajna',
        element: 'light',
        color: 'Indigo',
        description: 'Intuition, insight, vision',
        governs: ['Intuition', 'Imagination', 'Vision'],
        balanceIndicators: ['Clear insight', 'Strong intuition', 'Wisdom'],
        imbalanceIndicators: ['Confusion', 'Poor intuition', 'Lack of focus'],
        planet: 'Moon',
        primaryEnergyState: 'Essence'
    },
    crown: {
        name: 'Crown Chakra',
        sanskritName: 'Sahasrara',
        element: 'thought',
        color: 'Violet',
        description: 'Consciousness, spirituality, awareness',
        governs: ['Connection to higher self', 'spirituality', 'Universal consciousness'],
        balanceIndicators: ['Enlightenment', 'spiritual connection', 'Inner wisdom'],
        imbalanceIndicators: ['Closed-mindedness', 'Isolation', 'Over-intellectualization'],
        planet: 'Sun',
        primaryEnergyState: 'Spirit'
    }
};
export const MAJOR_ARCANA_CHAKRAS = [
    {
        cardName: 'The Emperor',
        chakraPosition: 'root',
        planet: 'Saturn',
        description: 'Represents structure, authority, and stability, which align with the Root Chakra\'s focus on security and foundation.'
    },
    {
        cardName: 'The Empress',
        chakraPosition: 'sacral',
        planet: 'Venus',
        description: 'Symbolizes nurturing, creativity, and sensuality, perfectly matching the Sacral Chakra\'s themes.'
    },
    {
        cardName: 'The Tower',
        chakraPosition: 'solarPlexus',
        planet: 'Mars',
        description: 'The Tower\'s transformative energy and Mars\'s action-oriented nature reflect personal power and breakthroughs.'
    },
    {
        cardName: 'The Chariot',
        chakraPosition: 'solarPlexus',
        description: 'Represents willpower, determination, and victory through effort, aligning with the Solar Plexus\'s focus on personal power.'
    },
    {
        cardName: 'The Lovers',
        chakraPosition: 'heart',
        planet: 'Venus',
        description: 'Represent relationships and harmony, aligning with the Heart Chakra\'s focus on love and connection.'
    },
    {
        cardName: 'The Star',
        chakraPosition: 'heart',
        planet: 'Neptune',
        description: 'Offers hope and healing, connecting to the Heart Chakra\'s themes of compassion and healing.'
    },
    {
        cardName: 'The Magician',
        chakraPosition: 'throat',
        planet: 'Mercury',
        description: 'Represents communication, expression, and manifestation, fitting the Throat Chakra\'s focus on voice and truth.'
    },
    {
        cardName: 'The High Priestess',
        chakraPosition: 'brow',
        planet: 'Moon',
        description: 'Symbolizes intuition, mystery, and inner wisdom, matching the Third Eye\'s focus on insight.'
    },
    {
        cardName: 'The Hanged Man',
        chakraPosition: 'brow',
        planet: 'Neptune',
        description: 'Represents surrender, new perspective, and spiritual insight, aligning with the Third Eye Chakra.'
    },
    {
        cardName: 'The World',
        chakraPosition: 'crown',
        planet: 'Saturn',
        description: 'Represents completion, wholeness, and spiritual mastery, aligning with the Crown Chakra\'s connection to higher consciousness.'
    },
    {
        cardName: 'Judgement',
        chakraPosition: 'crown',
        planet: 'Pluto',
        description: 'Symbolizes rebirth, spiritual awakening, and transcendence, connecting to the Crown Chakra\'s theme of spiritual enlightenment.'
    }
];
export const SUIT_CHAKRA_MAPPINGS = [
    {
        suit: 'wands',
        primaryChakra: 'solarPlexus',
        secondaryChakra: 'root',
        element: 'Fire',
        energyState: 'Spirit',
        description: 'Wands are driven by Mars, Jupiter, and the Sun, which emphasize action, confidence, and leadership.'
    },
    {
        suit: 'cups',
        primaryChakra: 'heart',
        secondaryChakra: 'sacral',
        element: 'Water',
        energyState: 'Essence',
        description: 'Cups, influenced by Moon, Mars, Jupiter, Neptune, and Pluto, deal with emotions, relationships, and intuition.'
    },
    {
        suit: 'swords',
        primaryChakra: 'throat',
        secondaryChakra: 'brow',
        element: 'Air',
        energyState: 'Substance',
        description: 'Swords, ruled by Mercury, Venus, Saturn, and Uranus, focus on thought, communication, and truth.'
    },
    {
        suit: 'pentacles',
        primaryChakra: 'root',
        secondaryChakra: 'solarPlexus',
        element: 'Earth',
        energyState: 'Matter',
        description: 'Pentacles, influenced by Saturn, Venus, and Mercury, deal with the material world, practicality, and security.'
    }
];
// Key card to chakra mappings (tarot cards and their planetary/chakra associations)
export const KEY_CARD_CHAKRA_MAPPINGS = [
    {
        cardName: 'The Fool',
        chakraPosition: 'crown',
        planet: 'Uranus',
        description: 'Represents new beginnings, innocence, and spontaneity, connecting to the Crown Chakra\'s spiritual openness.'
    },
    {
        cardName: 'The Magician',
        chakraPosition: 'throat',
        planet: 'Mercury',
        description: 'Represents communication, manifestation, and creative expression, aligning with the Throat Chakra.'
    },
    {
        cardName: 'The High Priestess',
        chakraPosition: 'brow',
        planet: 'Moon',
        description: 'Symbolizes intuition, mystery, and inner wisdom, matching the Third Eye\'s focus on insight.'
    },
    {
        cardName: 'The Empress',
        chakraPosition: 'sacral',
        planet: 'Venus',
        description: 'Symbolizes nurturing, creativity, and sensuality, perfectly matching the Sacral Chakra\'s themes.'
    },
    {
        cardName: 'The Emperor',
        chakraPosition: 'root',
        planet: 'Mars',
        description: 'Represents structure, authority, and stability, which align with the Root Chakra\'s focus on security and foundation.'
    },
    {
        cardName: 'The Hierophant',
        chakraPosition: 'throat',
        planet: 'Jupiter',
        description: 'Represents spiritual wisdom, tradition, and teaching, connecting to the Throat Chakra\'s expression of truth.'
    },
    {
        cardName: 'The Lovers',
        chakraPosition: 'heart',
        planet: 'Venus',
        description: 'Represent relationships and harmony, aligning with the Heart Chakra\'s focus on love and connection.'
    },
    {
        cardName: 'The Chariot',
        chakraPosition: 'solarPlexus',
        planet: 'Moon',
        description: 'Represents willpower, determination, and victory through effort, aligning with the Solar Plexus\'s focus on personal power.'
    },
    {
        cardName: 'Strength',
        chakraPosition: 'solarPlexus',
        planet: 'Sun',
        description: 'Symbolizes courage, inner strength, and mastery of emotions, connecting to the Solar Plexus\'s themes of personal power.'
    },
    {
        cardName: 'The Hermit',
        chakraPosition: 'brow',
        planet: 'Mercury',
        description: 'Represents introspection, inner guidance, and solitude, aligning with the Third Eye Chakra\'s themes of insight and wisdom.'
    },
    {
        cardName: 'Wheel of Fortune',
        chakraPosition: 'crown',
        planet: 'Jupiter',
        description: 'Symbolizes cycles, destiny, and cosmic order, connecting to the Crown Chakra\'s universal consciousness.'
    },
    {
        cardName: 'Justice',
        chakraPosition: 'heart',
        planet: 'Saturn',
        description: 'Represents fAirness, truth, and karmic balance, which relate to the Heart Chakra\'s themes of harmony and balance.'
    },
    {
        cardName: 'The Hanged Man',
        chakraPosition: 'brow',
        planet: 'Neptune',
        description: 'Represents surrender, new perspective, and spiritual insight, aligning with the Third Eye Chakra.'
    },
    {
        cardName: 'Death',
        chakraPosition: 'root',
        planet: 'Pluto',
        description: 'Symbolizes transformation, endings, and rebirth, connecting to the Root Chakra\'s themes of survival and fundamental change.'
    },
    {
        cardName: 'Temperance',
        chakraPosition: 'heart',
        planet: 'Jupiter',
        description: 'Represents balance, moderation, and harmony, aligning with the Heart Chakra\'s integrative nature.'
    },
    {
        cardName: 'The Devil',
        chakraPosition: 'root',
        planet: 'Saturn',
        description: 'Symbolizes materialism, bondage, and shadow aspects, relating to the Root Chakra\'s concerns with basic instincts and security.'
    },
    {
        cardName: 'The Tower',
        chakraPosition: 'root',
        planet: 'Mars',
        description: 'Represents sudden upheaval, revelation, and destruction of false structures, connecting to the Root Chakra\'s foundations.'
    },
    {
        cardName: 'The Star',
        chakraPosition: 'heart',
        planet: 'Venus',
        description: 'Symbolizes hope, inspiration, and divine connection, aligning with the Heart Chakra\'s themes of love and healing.'
    },
    {
        cardName: 'The moon',
        chakraPosition: 'brow',
        planet: 'Moon',
        description: 'Represents intuition, illusion, and the subconscious mind, connecting to the Third Eye Chakra\'s psychic perception.'
    },
    {
        cardName: 'The Sun',
        chakraPosition: 'solarPlexus',
        planet: 'Sun',
        description: 'Symbolizes joy, success, and vitality, aligning with the Solar Plexus Chakra\'s themes of personal power and confidence.'
    },
    {
        cardName: 'Judgement',
        chakraPosition: 'crown',
        planet: 'Pluto',
        description: 'Represents rebirth, awakening, and transcendence, connecting to the Crown Chakra\'s spiritual enlightenment.'
    },
    {
        cardName: 'The World',
        chakraPosition: 'crown',
        planet: 'Saturn',
        description: 'Symbolizes completion, fulfillment, and integration of all elements, connecting to the Crown Chakra\'s wholeness.'
    }
];
export const CHAKRA_MAPPING_SUMMARY = [
    {
        chakra: 'root',
        majorArcana: ['The Emperor'],
        primarySuit: 'pentacles'
    },
    {
        chakra: 'sacral',
        majorArcana: ['The Empress'],
        secondarySuit: 'cups'
    },
    {
        chakra: 'solarPlexus',
        majorArcana: ['The Tower', 'The Chariot'],
        primarySuit: 'wands',
        secondarySuit: 'pentacles'
    },
    {
        chakra: 'heart',
        majorArcana: ['The Lovers', 'The Star'],
        primarySuit: 'cups'
    },
    {
        chakra: 'throat',
        majorArcana: ['The Magician'],
        primarySuit: 'swords'
    },
    {
        chakra: 'brow',
        majorArcana: ['The High Priestess', 'The Hanged Man'],
        secondarySuit: 'swords'
    },
    {
        chakra: 'crown',
        majorArcana: ['The World', 'Judgement'],
        secondarySuit: 'swords'
    }
];
// Type guard for ChakraPosition
export function isChakraPosition(value) {
    if (typeof value !== 'string')
        return false;
    return ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'brow', 'crown'].includes(value);
}
// Type guard for ChakraEnergies
export function isChakraEnergies(value) {
    if (!value || typeof value !== 'object')
        return false;
    const obj = value;
    const requiredProperties = ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'brow', 'crown'];
    return requiredProperties.every(prop => prop in obj && (typeof obj[prop] === 'number' || obj[prop] === undefined));
}
// Helper to create a default ChakraEnergies object
export function createChakraEnergies(defaultValue = 0) {
    return {
        root: defaultValue,
        sacral: defaultValue,
        solarPlexus: defaultValue,
        heart: defaultValue,
        throat: defaultValue,
        brow: defaultValue,
        crown: defaultValue
    };
}
// Helper to safely access chakra energy values
export function getChakraEnergy(chakraEnergies, position) {
    if (!chakraEnergies)
        return 0;
    return chakraEnergies[position] || 0;
}
// Helper to update chakra energy values
export function updateChakraEnergy(chakraEnergies, position, value) {
    return {
        ...chakraEnergies,
        [position]: value
    };
}

// ===== CHAKRA ENTERPRISE INTELLIGENCE SYSTEMS =====

/**
 * CHAKRA_ANALYSIS_INTELLIGENCE - Advanced chakra analysis utilizing all chakra data structures
 */
export const CHAKRA_ANALYSIS_INTELLIGENCE = {
    /**
     * Comprehensive Chakra Profile Analysis
     * Utilizes CHAKRAS constant for detailed chakra system analysis
     */
    analyzeChakraProfile: (chakraEnergies, context = 'unknown') => {
        const analysis = {
            timestamp: Date.now(),
            context: context,
            chakraStates: {},
            energyDistribution: {},
            elementalBalance: { Earth: 0, Water: 0, Fire: 0, Air: 0, ether: 0, light: 0, thought: 0 },
            planetaryInfluences: {},
            overallAssessment: {
                totalEnergy: 0,
                averageEnergy: 0,
                balancedChakras: 0,
                blockedChakras: 0,
                overactiveChakras: 0,
                dominantElement: null,
                primaryPlanet: null,
                energyState: 'unknown'
            },
            recommendations: []
        };

        if (!isChakraEnergies(chakraEnergies)) {
            analysis.recommendations.push('Provide valid chakra energies object');
            return analysis;
        }

        let totalEnergy = 0;
        const chakraNames = Object.keys(CHAKRAS);
        
        // Analyze each chakra
        for (const chakraName of chakraNames) {
            const chakraData = CHAKRAS[chakraName];
            const energy = getChakraEnergy(chakraEnergies, chakraName);
            
            analysis.chakraStates[chakraName] = {
                name: chakraData.name,
                sanskritName: chakraData.sanskritName,
                element: chakraData.element,
                color: chakraData.color,
                planet: chakraData.planet,
                energy: energy,
                energyLevel: energy >= 8 ? 'high' : energy >= 6 ? 'balanced' : energy >= 4 ? 'moderate' : 'low',
                status: energy >= 7 ? 'flowing' : energy >= 5 ? 'stable' : 'blocked',
                balanceIndicators: chakraData.balanceIndicators,
                imbalanceIndicators: chakraData.imbalanceIndicators,
                governs: chakraData.governs,
                needsAttention: energy < 5
            };

            // Track energy distribution
            analysis.energyDistribution[chakraName] = {
                percentage: 0, // Will be calculated after total is known
                energyState: chakraData.primaryEnergyState
            };

            // Accumulate elemental balance
            const element = chakraData.element;
            analysis.elementalBalance[element] = (analysis.elementalBalance[element] || 0) + energy;

            // Track planetary influences
            const planet = chakraData.planet;
            analysis.planetaryInfluences[planet] = (analysis.planetaryInfluences[planet] || 0) + energy;

            totalEnergy += energy;
            
            // Count balance states
            if (energy >= 6 && energy <= 8) {
                analysis.overallAssessment.balancedChakras++;
            } else if (energy < 5) {
                analysis.overallAssessment.blockedChakras++;
            } else if (energy > 8) {
                analysis.overallAssessment.overactiveChakras++;
            }
        }

        analysis.overallAssessment.totalEnergy = totalEnergy;
        analysis.overallAssessment.averageEnergy = totalEnergy / chakraNames.length;

        // Calculate energy distribution percentages
        for (const chakraName of chakraNames) {
            const energy = getChakraEnergy(chakraEnergies, chakraName);
            analysis.energyDistribution[chakraName].percentage = 
                totalEnergy > 0 ? ((energy / totalEnergy) * 100).toFixed(1) + '%' : '0%';
        }

        // Determine dominant element
        analysis.overallAssessment.dominantElement = Object.keys(analysis.elementalBalance)
            .reduce((max, element) => analysis.elementalBalance[element] > analysis.elementalBalance[max] ? element : max);

        // Determine primary planetary influence
        analysis.overallAssessment.primaryPlanet = Object.keys(analysis.planetaryInfluences)
            .reduce((max, planet) => analysis.planetaryInfluences[planet] > analysis.planetaryInfluences[max] ? planet : max);

        // Overall energy state assessment
        if (analysis.overallAssessment.averageEnergy >= 7) {
            analysis.overallAssessment.energyState = 'high';
        } else if (analysis.overallAssessment.averageEnergy >= 5) {
            analysis.overallAssessment.energyState = 'balanced';
        } else if (analysis.overallAssessment.averageEnergy >= 3) {
            analysis.overallAssessment.energyState = 'moderate';
        } else {
            analysis.overallAssessment.energyState = 'low';
        }

        // Generate recommendations
        if (analysis.overallAssessment.blockedChakras > 2) {
            analysis.recommendations.push('Multiple chakras are blocked - consider comprehensive energy healing');
        }

        if (analysis.overallAssessment.overactiveChakras > 1) {
            analysis.recommendations.push('Some chakras are overactive - focus on grounding and balance');
        }

        if (analysis.overallAssessment.averageEnergy < 5) {
            analysis.recommendations.push('Overall energy is low - consider energy enhancement practices');
        }

        // Chakra-specific recommendations
        for (const [chakraName, chakraState] of Object.entries(analysis.chakraStates)) {
            if (chakraState.needsAttention) {
                analysis.recommendations.push(`${chakraState.name} needs attention - focus on ${chakraState.governs.join(', ')}`);
            }
        }

        return analysis;
    },

    /**
     * Chakra Tarot Correlation Analysis
     * Utilizes MAJOR_ARCANA_CHAKRAS for tarot-chakra insights
     */
    analyzeChakraTarotCorrelation: (chakraEnergies, context = 'unknown') => {
        const analysis = {
            timestamp: Date.now(),
            context: context,
            chakraTarotMappings: {},
            tarotInsights: {},
            recommendations: []
        };

        if (!isChakraEnergies(chakraEnergies)) {
            analysis.recommendations.push('Provide valid chakra energies object');
            return analysis;
        }

        // Map each chakra to its tarot associations
        for (const tarotMapping of MAJOR_ARCANA_CHAKRAS) {
            const chakraName = tarotMapping.chakraPosition;
            const energy = getChakraEnergy(chakraEnergies, chakraName);
            
            analysis.chakraTarotMappings[chakraName] = {
                cardName: tarotMapping.cardName,
                planet: tarotMapping.planet,
                description: tarotMapping.description,
                chakraEnergy: energy,
                tarotInfluence: energy > 6 ? 'strong' : energy > 4 ? 'moderate' : 'weak',
                alignment: energy > 6 ? 'aligned' : energy > 4 ? 'neutral' : 'misaligned'
            };

            // Generate tarot insights
            analysis.tarotInsights[tarotMapping.cardName] = {
                chakra: chakraName,
                planet: tarotMapping.planet,
                energyResonance: energy,
                interpretation: energy > 6 ? 
                    'Strong resonance with this archetype' : 
                    energy > 4 ? 
                    'Moderate connection to this energy' : 
                    'Weak alignment - consider strengthening this aspect',
                suggestedFocus: energy < 5 ? 
                    `Work with ${tarotMapping.cardName} energy to strengthen ${chakraName} chakra` : 
                    `${tarotMapping.cardName} energy is supporting your ${chakraName} chakra well`
            };
        }

        // Generate recommendations based on tarot-chakra analysis
        const weakAlignments = Object.entries(analysis.chakraTarotMappings)
            .filter(([_, mapping]) => mapping.alignment === 'misaligned')
            .map(([chakra, mapping]) => ({ chakra, card: mapping.cardName }));

        if (weakAlignments.length > 0) {
            analysis.recommendations.push('Consider tarot meditation on these cards for chakra alignment:');
            weakAlignments.forEach(({ chakra, card }) => {
                analysis.recommendations.push(`- ${card} for ${chakra} chakra strengthening`);
            });
        }

        return analysis;
    },

    /**
     * Chakra Suit Correlation Analysis
     * Utilizes SUIT_CHAKRA_MAPPINGS for suit-chakra insights
     */
    analyzeChakraSuitCorrelation: (chakraEnergies, context = 'unknown') => {
        const analysis = {
            timestamp: Date.now(),
            context: context,
            chakraSuitMappings: {},
            suitInfluences: {},
            recommendations: []
        };

        if (!isChakraEnergies(chakraEnergies)) {
            analysis.recommendations.push('Provide valid chakra energies object');
            return analysis;
        }

        // Map each chakra to its suit associations
        for (const suitMapping of SUIT_CHAKRA_MAPPINGS) {
            const chakraName = suitMapping.primaryChakra;
            const energy = getChakraEnergy(chakraEnergies, chakraName);
            
            analysis.chakraSuitMappings[chakraName] = {
                majorArcana: suitMapping.majorArcana,
                primarySuit: suitMapping.primarySuit || suitMapping.secondarySuit,
                chakraEnergy: energy,
                suitResonance: energy > 6 ? 'strong' : energy > 4 ? 'moderate' : 'weak',
                tarotGuidance: suitMapping.majorArcana
            };

            // Generate suit influence analysis
            const suitName = suitMapping.primarySuit || suitMapping.secondarySuit;
            if (!analysis.suitInfluences[suitName]) {
                analysis.suitInfluences[suitName] = {
                    totalEnergy: 0,
                    chakraCount: 0,
                    associatedChakras: []
                };
            }

            analysis.suitInfluences[suitName].totalEnergy += energy;
            analysis.suitInfluences[suitName].chakraCount++;
            analysis.suitInfluences[suitName].associatedChakras.push({
                chakra: chakraName,
                energy: energy,
                majorArcana: suitMapping.majorArcana
            });
        }

        // Calculate suit influence averages
        for (const [suitName, influence] of Object.entries(analysis.suitInfluences)) {
            influence.averageEnergy = influence.totalEnergy / influence.chakraCount;
            influence.dominance = influence.averageEnergy > 6 ? 'high' : 
                                influence.averageEnergy > 4 ? 'moderate' : 'low';
        }

        // Generate recommendations based on suit analysis
        const weakSuits = Object.entries(analysis.suitInfluences)
            .filter(([_, influence]) => influence.dominance === 'low')
            .map(([suit, influence]) => ({ suit, chakras: influence.associatedChakras }));

        if (weakSuits.length > 0) {
            analysis.recommendations.push('Consider working with these tarot suits for chakra strengthening:');
            weakSuits.forEach(({ suit, chakras }) => {
                analysis.recommendations.push(`- ${suit} suit for chakras: ${chakras.map(c => c.chakra).join(', ')}`);
            });
        }

        return analysis;
    }
};
