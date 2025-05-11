/**
 * Cooking Method Tips
 * 
 * This file contains tips and best practices for different cooking methods
 */

export type CookingMethodTip = {
  methodName: string;
  generalTips: string[];
  ingredientSpecificTips: Record<string, string[]>;
  timingTips: string[];
  equipmentTips: string[];
  flavorEnhancementTips: string[];
};

export const cookingMethodTips: Record<string, CookingMethodTip> = {
  'baking': {
    methodName: 'Baking',
    generalTips: [
      'Preheat your oven thoroughly before baking',
      'Use an oven thermometer for accuracy',
      'Position racks in the center of the oven for even heat distribution',
      'Don\'t open the oven door frequently during baking'
    ],
    ingredientSpecificTips: {
      'vegetables': [
        'Toss root vegetables with oil for better caramelization',
        'Add aromatics like garlic and herbs before baking'
      ],
      'proteins': [
        'Let meats rest after baking before slicing',
        'Use a meat thermometer to ensure proper doneness'
      ],
      'grains': [
        'Toast grains before baking for enhanced flavor',
        'Use the correct liquid-to-grain ratio'
      ]
    },
    timingTips: [
      'Baking times can vary by oven - check food before the recipe\'s stated end time',
      'Factor in carryover cooking - food continues to cook after removal from oven'
    ],
    equipmentTips: [
      'Use light-colored pans for more gentle baking',
      'Dark pans will create more browning on the bottom',
      'Consider silicone mats or parchment paper for easy cleanup'
    ],
    flavorEnhancementTips: [
      'Add a water bath when baking custards for gentle heat',
      'Brush with egg wash for a shiny appearance on pastries',
      'Consider adding herbs in the last 10-15 minutes to prevent burning'
    ]
  },
  'roasting': {
    methodName: 'Roasting',
    generalTips: [
      'Use high heat (400°F/200°C and above) for best results',
      'Pat ingredients dry before roasting for better browning',
      'Allow space between items on the pan to avoid steaming',
      'Toss ingredients in oil and seasonings before roasting'
    ],
    ingredientSpecificTips: {
      'vegetables': [
        'Cut vegetables into uniform sizes for even cooking',
        'Harder vegetables like root vegetables benefit from longer roasting times'
      ],
      'proteins': [
        'Bring proteins to room temperature before roasting',
        'Consider brining or marinating before roasting'
      ],
      'fruits': [
        'Roasting concentrates natural sugars in fruits',
        'Add a touch of honey or maple syrup to enhance caramelization'
      ]
    },
    timingTips: [
      'Rotate pans halfway through cooking time for even browning',
      'Check for doneness by looking for caramelization and fork tenderness'
    ],
    equipmentTips: [
      'Use heavy-duty, rimmed baking sheets',
      'Consider a roasting rack for meats to allow air circulation'
    ],
    flavorEnhancementTips: [
      'Add woody herbs like rosemary and thyme before roasting',
      'Finish with fresh herbs, acid (lemon juice, vinegar), or spices after roasting',
      'Deglaze the pan with stock or wine for a flavorful sauce'
    ]
  },
  'grilling': {
    methodName: 'Grilling',
    generalTips: [
      'Preheat the grill thoroughly before cooking',
      'Clean and oil grates before each use',
      'Create temperature zones for direct and indirect heat',
      'Close the lid when appropriate to create convection heat'
    ],
    ingredientSpecificTips: {
      'vegetables': [
        'Cut vegetables into sizes that won\'t fall through the grates',
        'Consider using a grill basket for smaller pieces'
      ],
      'proteins': [
        'Let proteins rest after grilling before cutting',
        'Use the "touch test" to gauge doneness'
      ],
      'fruits': [
        'Grill fruits on lower heat to prevent burning',
        'Firmer fruits like pineapple and peaches work best'
      ]
    },
    timingTips: [
      'Use a timer to avoid overcooking',
      'Only flip food once if possible for better grill marks'
    ],
    equipmentTips: [
      'Long-handled tools prevent burns',
      'A spray bottle of water helps control flare-ups'
    ],
    flavorEnhancementTips: [
      'Marinate proteins before grilling for flavor and moisture',
      'Add wood chips for smoky flavor',
      'Brush with glazes toward the end of cooking to prevent burning'
    ]
  },
  'sautéing': {
    methodName: 'Sautéing',
    generalTips: [
      'Use a pan large enough to avoid overcrowding',
      'Heat the pan before adding oil',
      'Keep ingredients moving in the pan'
    ],
    ingredientSpecificTips: {
      'vegetables': [
        'Add harder vegetables first, then more tender ones',
        'Cut into uniform sizes for even cooking'
      ],
      'proteins': [
        'Pat dry before sautéing for better browning',
        'Don\'t move proteins too soon to allow proper searing'
      ],
      'aromatics': [
        'Cook garlic and ginger briefly to avoid burning',
        'Sweat onions slowly for sweetness'
      ]
    },
    timingTips: [
      'Have all ingredients prepped and ready (mise en place)',
      'Sautéing is quick - stay attentive throughout the process'
    ],
    equipmentTips: [
      'Use a heavy-bottomed pan for even heat distribution',
      'A pan with sloped sides makes tossing ingredients easier'
    ],
    flavorEnhancementTips: [
      'Deglaze the pan with wine, vinegar, or stock after sautéing',
      'Add butter at the end for richness (mounting with butter)',
      'Finish with fresh herbs just before serving'
    ]
  },
  'steaming': {
    methodName: 'Steaming',
    generalTips: [
      'Make sure water doesn\'t touch the food',
      'Keep the lid on to trap steam',
      'Check water levels during longer steaming sessions'
    ],
    ingredientSpecificTips: {
      'vegetables': [
        'Arrange larger, denser pieces toward the outside of the steamer',
        'Cut vegetables into uniform sizes for even cooking'
      ],
      'proteins': [
        'Season proteins well before steaming',
        'Consider adding aromatics to the steaming liquid'
      ],
      'grains': [
        'Rinse grains thoroughly before steaming',
        'Follow proper water-to-grain ratios'
      ]
    },
    timingTips: [
      'Steaming times are generally shorter than other methods',
      'Vegetables should remain vibrant in color when done'
    ],
    equipmentTips: [
      'Bamboo steamers impart subtle flavor',
      'Metal steamers heat up quickly',
      'Line steamers with parchment, cabbage leaves, or banana leaves to prevent sticking'
    ],
    flavorEnhancementTips: [
      'Add herbs, citrus peels, or spices to the steaming water',
      'Finish with sauces, oils, or fresh herbs for flavor',
      'Steaming preserves natural flavors, so high-quality ingredients shine'
    ]
  }
};

/**
 * Get cooking tips for a specific method
 * 
 * @param methodName The cooking method name
 * @returns Array of tips for the specified cooking method
 */
export function getTipsForMethod(methodName: string): string[] {
  const normalizedMethodName = methodName.toLowerCase();
  
  // Try direct lookup first
  if (cookingMethodTips[normalizedMethodName]) {
    return [
      ...cookingMethodTips[normalizedMethodName].generalTips,
      ...cookingMethodTips[normalizedMethodName].timingTips,
      ...cookingMethodTips[normalizedMethodName].equipmentTips,
      ...cookingMethodTips[normalizedMethodName].flavorEnhancementTips
    ];
  }
  
  // Try to find a partial match
  const keys = Object.keys(cookingMethodTips);
  const matchingKey = keys.find(key => 
    key.includes(normalizedMethodName) || normalizedMethodName.includes(key)
  );
  
  if (matchingKey) {
    return [
      ...cookingMethodTips[matchingKey].generalTips,
      ...cookingMethodTips[matchingKey].timingTips,
      ...cookingMethodTips[matchingKey].equipmentTips,
      ...cookingMethodTips[matchingKey].flavorEnhancementTips
    ];
  }
  
  // Return generic tips if no matching method is found
  return [
    'Ensure proper preparation of ingredients before cooking',
    'Monitor the cooking process regularly for best results',
    'Adjust cooking time based on ingredient size and quantity',
    'Control heat levels throughout the cooking process',
    'Let food rest appropriately after cooking before serving',
    'Consider the interaction between ingredients when using this method',
    'Properly clean and maintain your cooking equipment for best results',
    'Research specific techniques for your particular ingredients'
  ];
}

export default cookingMethodTips; 