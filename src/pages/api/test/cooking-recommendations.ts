import { NextApiRequest, NextApiResponse } from 'next';
import { testCookingMethodRecommendations } from '../../../utils/testRecommendations';

// Import the enhanced cooking method functions
import { calculateEnhancedThermodynamicScore, getEnhancedMethodThermodynamics } from '../../../utils/cookingMethodRecommender';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Run our test function
    const testResults = testCookingMethodRecommendations();

    // Test Monica constant calculations for some example methods
    const testMethods = [
      {
        name: 'Roasting',
        alchemicalProperties: { Spirit: 0.7, Essence: 0.4, Matter: 0.3, Substance: 0.2 },
        elementalEffect: { Fire: 0.8, Air: 0.5, Earth: 0.3, Water: 0.1 }
      },
      {
        name: 'Steaming', 
        alchemicalProperties: { Spirit: 0.2, Essence: 0.8, Matter: 0.5, Substance: 0.3 },
        elementalEffect: { Water: 0.9, Air: 0.4, Earth: 0.2, Fire: 0.1 }
      },
      {
        name: 'Fermenting',
        alchemicalProperties: { Spirit: 0.3, Essence: 0.7, Matter: 0.9, Substance: 0.6 },
        elementalEffect: { Water: 0.6, Earth: 0.7, Air: 0.4, Fire: 0.1 }
      }
    ];

    const monicaTestResults = testMethods.map(method => {
      // Calculate enhanced thermodynamics for each method using the new functions
      const enhancedScore = calculateEnhancedThermodynamicScore(method as any);
      const enhancedProps = getEnhancedMethodThermodynamics(method as any);
      
      // Calculate Monica constants manually for verification using exact user formulas
      const { Spirit, Essence, Matter, Substance } = method.alchemicalProperties;
      const { Fire, Water, Earth, Air } = method.elementalEffect;
      
      // Monica calculation formulas from user's notepad
      const heat = (Math.pow(Spirit, 2) + Math.pow(Fire, 2)) /
                   Math.pow(Substance + Essence + Matter + Water + Air + Earth, 2);
      
      const entropy = (Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2)) /
                      Math.pow(Essence + Matter + Earth + Water, 2);
      
      const reactivity = (Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Essence, 2) + 
                         Math.pow(Fire, 2) + Math.pow(Air, 2) + Math.pow(Water, 2)) /
                         Math.pow(Matter + Earth, 2);
      
      const gregsEnergy = heat - (entropy * reactivity);
      
      const kalchm = (Math.pow(Math.max(0.001, Spirit), Spirit) * Math.pow(Math.max(0.001, Essence), Essence)) /
                     (Math.pow(Math.max(0.001, Matter), Matter) * Math.pow(Math.max(0.001, Substance), Substance));
      
      const monicaConstant = kalchm > 0 && reactivity !== 0 && Math.log(kalchm) !== 0 ? 
                            -gregsEnergy / (reactivity * Math.log(kalchm)) : 0;

      let monicaClassification = 'Stable';
      if (!isNaN(monicaConstant) && isFinite(monicaConstant)) {
        if (Math.abs(monicaConstant) > 10) monicaClassification = 'Highly Transformative';
        else if (Math.abs(monicaConstant) > 5) monicaClassification = 'Transformative';
        else if (Math.abs(monicaConstant) > 1) monicaClassification = 'Moderately Active';
      }

      return {
        method: method.name,
        enhancedScore: enhancedScore,
        percentageScore: `${Math.round(enhancedScore * 100)}%`,
        manualCalculation: {
          heat: heat.toFixed(4),
          entropy: entropy.toFixed(4),
          reactivity: reactivity.toFixed(4),
          gregsEnergy: gregsEnergy.toFixed(4),
          kalchm: kalchm.toFixed(6),
          monicaConstant: isNaN(monicaConstant) ? 'Stable (NaN)' : monicaConstant.toFixed(6),
          monicaClassification
        },
        enhancedPropsFromFunction: {
          heat: enhancedProps.heat.toFixed(4),
          entropy: enhancedProps.entropy.toFixed(4),
          reactivity: enhancedProps.reactivity.toFixed(4),
          gregsEnergy: enhancedProps.gregsEnergy.toFixed(4),
          kalchm: enhancedProps.kalchm.toFixed(6),
          monicaConstant: isNaN(enhancedProps.monicaConstant) ? 'Stable (NaN)' : enhancedProps.monicaConstant.toFixed(6),
          monicaClassification: enhancedProps.monicaClassification,
          efficiency: enhancedProps.efficiency.toFixed(4)
        }
      };
    });

    // Return the results
    res.status(200).json({
      success: true,
      data: {
        originalTests: testResults,
        monicaEnhancedTests: monicaTestResults,
        notes: [
          'Monica constants calculated using exact formulas from user notepad',
          'Enhanced score incorporates Monica constants (15% weight) and Kalchm (5% weight)',
          'Score ranges: Excellent ≥85%, Good ≥70%, Fair ≥55%, Poor ≥35%',
          'Classification: >10=Highly Transformative, >5=Transformative, >1=Moderately Active, else=Stable'
        ]
      },
      message: 'Monica-enhanced cooking method tests completed successfully',
    });
  } catch (error) {
    // console.error('Error in test endpoint:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Test failed',
    });
  }
}
