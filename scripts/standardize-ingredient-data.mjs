#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Define the uniform ingredient data structure
const UNIFORM_STRUCTURE = {
  // Basic required fields
  name: 'string',
  category: 'string',
  subCategory: 'string',
  elementalProperties: 'object',
  qualities: 'array',
  
  // Astrological profile
  astrologicalProfile: {
    rulingPlanets: 'array',
    favorableZodiac: 'array',
    elementalAffinity: 'object',
    lunarPhaseModifiers: 'object'
  },
  
  // Nutritional profile
  nutritionalProfile: {
    serving_size: 'string',
    calories: 'number',
    macros: 'object',
    vitamins: 'object',
    minerals: 'object',
    source: 'string'
  },
  
  // Culinary profile
  culinaryProfile: {
    flavorProfile: 'array',
    texture: 'array',
    bestCookingMethods: 'array',
    cuisineAffinity: 'array',
    classicPairings: 'array',
    culinaryUses: 'array',
    seasonality: 'array',
    shelfLife: 'string',
    substitutions: 'array',
    notes: 'string',
    intensity: 'string',
    allergenInfo: 'array',
    regionalVarieties: 'object',
    preparationTips: 'array',
    umamiScore: 'number'
  },
  
  // Storage information
  storage: {
    temperature: 'string',
    duration: 'string',
    container: 'string',
    humidity: 'string',
    tips: 'array',
    frozen: 'object'
  },
  
  // Preparation information
  preparation: {
    washing: 'boolean',
    methods: 'array',
    processing: 'object',
    notes: 'string'
  },
  
  // Sensory profile
  sensoryProfile: {
    taste: 'object',
    aroma: 'object',
    texture: 'object'
  },
  
  // Additional fields
  origin: 'array',
  season: 'array',
  varieties: 'object',
  description: 'string'
};

// Default values for missing fields
const DEFAULT_VALUES = {
  name: (key) => key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
  category: (key, filePath) => {
    if (filePath.includes('/proteins/')) return 'protein';
    if (filePath.includes('/fruits/')) return 'fruit';
    if (filePath.includes('/vegetables/')) return 'vegetable';
    if (filePath.includes('/herbs/')) return 'culinary_herb';
    if (filePath.includes('/spices/')) return 'spice';
    if (filePath.includes('/oils/')) return 'oil';
    if (filePath.includes('/vinegars/')) return 'vinegar';
    if (filePath.includes('/grains/')) return 'grain';
    if (filePath.includes('/seasonings/')) return 'seasoning';
    return 'culinary_herb';
  },
  subCategory: (key, filePath) => {
    const fileName = path.basename(filePath, '.ts');
    return fileName.charAt(0).toUpperCase() + fileName.slice(1);
  },
  elementalProperties: {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  },
  qualities: ['versatile', 'balanced'],
  astrologicalProfile: {
    rulingPlanets: ['Mercury'],
    favorableZodiac: ['virgo'],
    elementalAffinity: {
      base: 'Earth',
      secondary: 'Air'
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Earth: 0.05, Water: 0.05 },
        preparationTips: ['Best for subtle preparation methods']
      },
      fullMoon: {
        elementalBoost: { Water: 0.1, Air: 0.05 },
        preparationTips: ['Enhanced flavor extraction']
      }
    }
  },
  nutritionalProfile: {
    serving_size: "1 serving",
    calories: 0,
    macros: {
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    },
    vitamins: {},
    minerals: {},
    source: "USDA FoodData Central"
  },
  culinaryProfile: {
    flavorProfile: ['neutral'],
    texture: ['firm'],
    bestCookingMethods: ['Raw'],
    cuisineAffinity: ['Global'],
    classicPairings: [],
    culinaryUses: ['seasoning'],
    seasonality: ['Year-round'],
    shelfLife: '1-2 weeks',
    substitutions: [],
    notes: 'Versatile ingredient',
    intensity: 'mild',
    allergenInfo: ['gluten-free'],
    regionalVarieties: {},
    preparationTips: ['Wash before use'],
    umamiScore: 0.1
  },
  storage: {
    temperature: 'room temperature',
    duration: '1-2 weeks',
    container: 'sealed container',
    humidity: 'moderate',
    tips: ['Store in cool, dry place'],
    frozen: {
      method: 'blanch if needed',
      duration: '6 months'
    }
  },
  preparation: {
    washing: true,
    methods: ['raw'],
    processing: {
      cleaning: 'wash thoroughly',
      cutting: 'as needed'
    },
    notes: 'Prepare according to recipe requirements'
  },
  sensoryProfile: {
    taste: {
      sweet: 0.1,
      salty: 0.1,
      sour: 0.1,
      bitter: 0.1,
      umami: 0.1,
      spicy: 0.0
    },
    aroma: {
      floral: 0.1,
      fruity: 0.1,
      herbal: 0.1,
      spicy: 0.1,
      earthy: 0.1,
      woody: 0.1
    },
    texture: {
      crisp: 0.1,
      tender: 0.1,
      creamy: 0.1,
      chewy: 0.1,
      crunchy: 0.1,
      silky: 0.1
    }
  },
  origin: ['Global'],
  season: ['Year-round'],
  varieties: {},
  description: 'A versatile ingredient with balanced properties'
};

// Function to standardize a single ingredient
function standardizeIngredient(ingredient, key, filePath) {
  const standardized = { ...ingredient };
  
  // Add missing required fields
  if (!standardized.name) {
    standardized.name = typeof DEFAULT_VALUES.name === 'function' 
      ? DEFAULT_VALUES.name(key) 
      : DEFAULT_VALUES.name;
  }
  
  if (!standardized.category) {
    standardized.category = typeof DEFAULT_VALUES.category === 'function'
      ? DEFAULT_VALUES.category(key, filePath)
      : DEFAULT_VALUES.category;
  }
  
  if (!standardized.subCategory) {
    standardized.subCategory = typeof DEFAULT_VALUES.subCategory === 'function'
      ? DEFAULT_VALUES.subCategory(key, filePath)
      : DEFAULT_VALUES.subCategory;
  }
  
  if (!standardized.elementalProperties) {
    standardized.elementalProperties = { ...DEFAULT_VALUES.elementalProperties };
  }
  
  if (!standardized.qualities || !Array.isArray(standardized.qualities)) {
    standardized.qualities = [...DEFAULT_VALUES.qualities];
  }
  
  // Add missing astrological profile
  if (!standardized.astrologicalProfile) {
    standardized.astrologicalProfile = { ...DEFAULT_VALUES.astrologicalProfile };
  } else {
    // Ensure all astrological profile fields exist
    Object.entries(DEFAULT_VALUES.astrologicalProfile).forEach(([field, defaultValue]) => {
      if (!standardized.astrologicalProfile[field]) {
        standardized.astrologicalProfile[field] = defaultValue;
      }
    });
  }
  
  // Add missing nutritional profile
  if (!standardized.nutritionalProfile) {
    standardized.nutritionalProfile = { ...DEFAULT_VALUES.nutritionalProfile };
  } else {
    // Ensure all nutritional profile fields exist
    Object.entries(DEFAULT_VALUES.nutritionalProfile).forEach(([field, defaultValue]) => {
      if (!standardized.nutritionalProfile[field]) {
        standardized.nutritionalProfile[field] = defaultValue;
      }
    });
  }
  
  // Add missing culinary profile
  if (!standardized.culinaryProfile) {
    standardized.culinaryProfile = { ...DEFAULT_VALUES.culinaryProfile };
  } else {
    // Ensure all culinary profile fields exist
    Object.entries(DEFAULT_VALUES.culinaryProfile).forEach(([field, defaultValue]) => {
      if (!standardized.culinaryProfile[field]) {
        standardized.culinaryProfile[field] = defaultValue;
      }
    });
  }
  
  // Add missing storage information
  if (!standardized.storage) {
    standardized.storage = { ...DEFAULT_VALUES.storage };
  } else {
    // Ensure all storage fields exist
    Object.entries(DEFAULT_VALUES.storage).forEach(([field, defaultValue]) => {
      if (!standardized.storage[field]) {
        standardized.storage[field] = defaultValue;
      }
    });
  }
  
  // Add missing preparation information
  if (!standardized.preparation) {
    standardized.preparation = { ...DEFAULT_VALUES.preparation };
  } else {
    // Ensure all preparation fields exist
    Object.entries(DEFAULT_VALUES.preparation).forEach(([field, defaultValue]) => {
      if (!standardized.preparation[field]) {
        standardized.preparation[field] = defaultValue;
      }
    });
  }
  
  // Add missing sensory profile
  if (!standardized.sensoryProfile) {
    standardized.sensoryProfile = { ...DEFAULT_VALUES.sensoryProfile };
  } else {
    // Ensure all sensory profile fields exist
    Object.entries(DEFAULT_VALUES.sensoryProfile).forEach(([field, defaultValue]) => {
      if (!standardized.sensoryProfile[field]) {
        standardized.sensoryProfile[field] = defaultValue;
      }
    });
  }
  
  // Add missing additional fields
  if (!standardized.origin) {
    standardized.origin = [...DEFAULT_VALUES.origin];
  }
  
  if (!standardized.season) {
    standardized.season = [...DEFAULT_VALUES.season];
  }
  
  if (!standardized.varieties) {
    standardized.varieties = { ...DEFAULT_VALUES.varieties };
  }
  
  if (!standardized.description) {
    standardized.description = DEFAULT_VALUES.description;
  }
  
  return standardized;
}

// Function to process a single ingredient file
function processIngredientFile(filePath, dryRun = false) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.ts');
    
    console.log(`Processing ${fileName}...`);
    
    // Find ingredient objects in the file
    const ingredientPattern = /const\s+(raw)?(\w+)\s*=\s*{([^}]+)}/g;
    let match;
    let modifiedContent = content;
    let changes = 0;
    
    while ((match = ingredientPattern.exec(content)) !== null) {
      const [fullMatch, rawPrefix, varName, objectContent] = match;
      
      // Skip if this is not an ingredient object
      if (!objectContent.includes("'") && !objectContent.includes('"')) continue;
      
      // Extract ingredient keys and their objects
      const ingredientKeyPattern = /'([^']+)':\s*{([^}]+)}/g;
      let ingredientMatch;
      
      while ((ingredientMatch = ingredientKeyPattern.exec(objectContent)) !== null) {
        const [ingredientFullMatch, ingredientKey, ingredientContent] = ingredientMatch;
        
        // Parse the ingredient object (simplified parsing)
        const ingredient = {};
        const propertyPattern = /(\w+):\s*([^,}]+)/g;
        let propertyMatch;
        
        while ((propertyMatch = propertyPattern.exec(ingredientContent)) !== null) {
          const [, property, value] = propertyMatch;
          try {
            // Try to parse the value as JSON
            ingredient[property] = JSON.parse(value.trim());
          } catch {
            // If parsing fails, store as string
            ingredient[property] = value.trim();
          }
        }
        
        // Standardize the ingredient
        const standardized = standardizeIngredient(ingredient, ingredientKey, filePath);
        
        // Convert back to string representation
        const standardizedString = JSON.stringify(standardized, null, 2)
          .replace(/"/g, "'")
          .replace(/'/g, '"')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        
        // Replace in the content
        const replacement = `'${ingredientKey}': ${standardizedString}`;
        modifiedContent = modifiedContent.replace(ingredientFullMatch, replacement);
        changes++;
      }
    }
    
    if (changes > 0) {
      if (dryRun) {
        console.log(`  Would make ${changes} changes to ${fileName}`);
      } else {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        console.log(`  Made ${changes} changes to ${fileName}`);
      }
    } else {
      console.log(`  No changes needed for ${fileName}`);
    }
    
    return changes;
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Function to process all ingredient files
function processAllIngredientFiles(dryRun = false) {
  const ingredientDirs = [
    'src/data/ingredients/proteins',
    'src/data/ingredients/fruits',
    'src/data/ingredients/vegetables',
    'src/data/ingredients/herbs',
    'src/data/ingredients/spices',
    'src/data/ingredients/oils',
    'src/data/ingredients/vinegars',
    'src/data/ingredients/grains',
    'src/data/ingredients/seasonings'
  ];
  
  let totalChanges = 0;
  let totalFiles = 0;
  
  ingredientDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Directory ${dir} does not exist, skipping...`);
      return;
    }
    
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.ts'));
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const changes = processIngredientFile(filePath, dryRun);
      totalChanges += changes;
      totalFiles++;
    });
  });
  
  return { totalChanges, totalFiles };
}

// Main execution
function main() {
  const dryRun = process.argv.includes('--dry-run');
  
  console.log('🔧 Standardizing ingredient data...\n');
  
  if (dryRun) {
    console.log('DRY RUN MODE - No files will be modified\n');
  }
  
  const { totalChanges, totalFiles } = processAllIngredientFiles(dryRun);
  
  console.log('\n📊 SUMMARY:');
  console.log(`Files processed: ${totalFiles}`);
  console.log(`Total changes: ${totalChanges}`);
  
  if (dryRun) {
    console.log('\nTo apply changes, run without --dry-run flag');
  } else {
    console.log('\n✅ Standardization complete!');
    console.log('Run the analysis script again to verify improvements.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 