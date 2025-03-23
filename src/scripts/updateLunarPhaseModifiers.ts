import * as fs from 'fs';
import * as path from 'path';
import { generateDefaultLunarPhaseModifiers } from '../utils/lunarPhaseUtils';
import type { ElementalProperties, IngredientMapping } from '@/data/ingredients/types';

// Configuration
const INGREDIENTS_BASE_PATH = path.resolve(__dirname, '../data/ingredients');
const CATEGORIES = [
  'fruits',
  'grains',
  'herbs',
  'proteins',
  'seasonings',
  'spices',
  'vegetables'
];

// Regular expressions for parsing
const INGREDIENT_REGEX = /'([a-z_]+)':\s*{([^{}]|{([^{}]|{[^{}]*})*})*}/gs;
const ELEMENTAL_PROPS_REGEX = /elementalProperties:\s*{([^{}]*)}/;
const LUNAR_PHASE_REGEX = /lunarPhaseModifiers:/;
const NAME_REGEX = /name:\s*'([^']+)'/;
const CATEGORY_REGEX = /category:\s*'([^']+)'/;

interface ProcessedFile {
  filePath: string;
  content: string;
  modified: boolean;
  ingredients: {
    name: string;
    updated: boolean;
  }[];
}

/**
 * Main function to update all ingredient files
 */
async function updateAllIngredientFiles() {
  const results: ProcessedFile[] = [];
  let totalProcessed = 0;
  let totalUpdated = 0;

  console.log('Starting update of ingredient files with lunar phase modifiers...');

  // Process each category directory
  for (const category of CATEGORIES) {
    console.log(`\nProcessing ${category} category...`);
    const categoryPath = path.join(INGREDIENTS_BASE_PATH, category);
    
    try {
      // Check if directory exists
      if (!fs.existsSync(categoryPath)) {
        console.warn(`Category directory not found: ${categoryPath}`);
        continue;
      }

      // Get all files in directory and subdirectories
      const files = getAllFiles(categoryPath);
      
      for (const filePath of files) {
        if (!filePath.endsWith('.ts')) continue;
        
        try {
          const result = await processFile(filePath, category);
          results.push(result);
          
          totalProcessed += result.ingredients.length;
          totalUpdated += result.ingredients.filter(i => i.updated).length;
          
          // Log file processing result
          if (result.modified) {
            console.log(`Updated ${result.ingredients.filter(i => i.updated).length}/${result.ingredients.length} ingredients in ${path.basename(filePath)}`);
          } else {
            console.log(`No updates needed in ${path.basename(filePath)}`);
          }
        } catch (err) {
          console.error(`Error processing file ${filePath}:`, err);
        }
      }
    } catch (err) {
      console.error(`Error processing category ${category}:`, err);
    }
  }

  // Print summary
  console.log('\n========== UPDATE SUMMARY ==========');
  console.log(`Total ingredients processed: ${totalProcessed}`);
  console.log(`Total ingredients updated: ${totalUpdated}`);
  console.log(`Files modified: ${results.filter(r => r.modified).length}/${results.length}`);
  
  return results;
}

/**
 * Process a single file to update ingredients without lunar phase modifiers
 */
async function processFile(filePath: string, categoryName: string): Promise<ProcessedFile> {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = fileContent;
  let fileModified = false;
  const processedIngredients = [];

  // Find all ingredient definitions in the file
  const ingredientMatches = [...fileContent.matchAll(INGREDIENT_REGEX)];
  
  for (const match of ingredientMatches) {
    const ingredientText = match[0];
    const ingredientKey = match[1];
    let updated = false;

    // Skip if lunar phase modifiers already exist
    if (LUNAR_PHASE_REGEX.test(ingredientText)) {
      processedIngredients.push({ name: ingredientKey, updated: false });
      continue;
    }

    // Extract elemental properties
    const elementalMatch = ingredientText.match(ELEMENTAL_PROPS_REGEX);
    if (!elementalMatch) {
      processedIngredients.push({ name: ingredientKey, updated: false });
      continue;
    }

    // Parse elemental properties
    const elementalPropsText = elementalMatch[1];
    const elementalProps = parseElementalProperties(elementalPropsText);
    
    // Extract ingredient name
    let ingredientName = ingredientKey.replace(/_/g, ' ');
    const nameMatch = ingredientText.match(NAME_REGEX);
    if (nameMatch) {
      ingredientName = nameMatch[1];
    }
    
    // Extract ingredient category
    let category = categoryName.slice(0, -1); // Remove plural 's'
    const categoryMatch = ingredientText.match(CATEGORY_REGEX);
    if (categoryMatch) {
      category = categoryMatch[1];
    }
    
    // Extract astrological profile if available
    const { rulingPlanets, favorableZodiac } = parseAstrologicalProfile(ingredientText);
    
    // Generate lunar phase modifiers with aspect awareness
    const lunarPhaseModifiers = generateLunarPhaseModifiersWithAspects(
      elementalProps,
      ingredientName,
      category,
      rulingPlanets
    );
    
    // Format lunar phase modifiers as string
    const lunarModifiersStr = formatLunarPhaseModifiers(lunarPhaseModifiers);
    
    // Update ingredient definition with lunar phase modifiers
    // Find where to insert the lunar phase modifiers
    const insertPoint = findInsertPoint(ingredientText);
    if (insertPoint === -1) {
      console.warn(`Could not find insert point for ${ingredientKey}`);
      processedIngredients.push({ name: ingredientKey, updated: false });
      continue;
    }
    
    const updatedIngredientText = 
      ingredientText.slice(0, insertPoint) + 
      lunarModifiersStr + 
      ingredientText.slice(insertPoint);
    
    modifiedContent = modifiedContent.replace(ingredientText, updatedIngredientText);
    fileModified = true;
    updated = true;
    
    processedIngredients.push({ name: ingredientKey, updated });
  }
  
  // Write the updated content back to the file if modified
  if (fileModified) {
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
  }
  
  return {
    filePath,
    content: modifiedContent,
    modified: fileModified,
    ingredients: processedIngredients
  };
}

/**
 * Find the best insertion point for lunar phase modifiers in an ingredient definition
 */
function findInsertPoint(ingredientText: string): number {
  // List of properties to insert after, in order of preference
  const insertAfterProps = [
    'astrologicalProfile: {',
    'elementalAffinity: {',
    'elementalProperties: {',
    'qualities:',
    'name:',
    'category:'
  ];
  
  for (const prop of insertAfterProps) {
    const propIndex = ingredientText.indexOf(prop);
    if (propIndex !== -1) {
      // Find the closing bracket of this property
      const bracketStart = ingredientText.indexOf('{', propIndex);
      if (bracketStart !== -1) {
        let openBrackets = 1;
        let closingIndex = bracketStart + 1;
        
        while (openBrackets > 0 && closingIndex < ingredientText.length) {
          if (ingredientText[closingIndex] === '{') openBrackets++;
          if (ingredientText[closingIndex] === '}') openBrackets--;
          closingIndex++;
        }
        
        if (openBrackets === 0) {
          return closingIndex + 1;
        }
      }
      
      // If can't find clear bracket closure, just find the next comma after the property
      const commaIndex = ingredientText.indexOf(',', propIndex);
      if (commaIndex !== -1) {
        return commaIndex + 1;
      }
    }
  }
  
  // Default insert point: just before the last closing bracket
  const lastBracketIndex = ingredientText.lastIndexOf('}');
  if (lastBracketIndex !== -1) {
    return lastBracketIndex;
  }
  
  return -1;
}

/**
 * Parse elemental properties from a string
 */
function parseElementalProperties(propsText: string): ElementalProperties {
  const props: ElementalProperties = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
  
  const elementRegex = /(Fire|Water|Earth|Air):\s*([\d.]+)/g;
  let match;
  
  while ((match = elementRegex.exec(propsText)) !== null) {
    const element = match[1] as keyof ElementalProperties;
    const value = parseFloat(match[2]);
    props[element] = value;
  }
  
  return props;
}

/**
 * Format lunar phase modifiers as a string to insert into the ingredient definition
 */
function formatLunarPhaseModifiers(modifiers: Record<string, any>): string {
  let result = '\n    lunarPhaseModifiers: {\n';
  
  for (const [phase, modifier] of Object.entries(modifiers)) {
    result += `      ${phase}: {\n`;
    
    if (modifier.elementalBoost) {
      result += '        elementalBoost: { ';
      
      const boosts = Object.entries(modifier.elementalBoost)
        .map(([element, value]) => `${element}: ${value}`)
        .join(', ');
      
      result += boosts + ' },\n';
    }
    
    if (modifier.preparationTips) {
      result += '        preparationTips: [';
      
      const tips = modifier.preparationTips
        .map(tip => `'${tip}'`)
        .join(', ');
      
      result += tips + ']\n';
    }
    
    result += '      },\n';
  }
  
  result += '    },\n';
  return result;
}

/**
 * Get all files in a directory and its subdirectories
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  }
  
  return arrayOfFiles;
}

/**
 * Parse an ingredient definition to extract its astrological profile
 */
function parseAstrologicalProfile(ingredientText: string): {
  rulingPlanets: string[];
  favorableZodiac: string[];
} {
  const rulingPlanetsMatch = ingredientText.match(/rulingPlanets:\s*\[(.*?)\]/);
  const favorableZodiacMatch = ingredientText.match(/favorableZodiac:\s*\[(.*?)\]/);
  
  const rulingPlanets = rulingPlanetsMatch ? 
    rulingPlanetsMatch[1].split(',').map(p => p.trim().replace(/['"]/g, '')) : 
    [];
    
  const favorableZodiac = favorableZodiacMatch ? 
    favorableZodiacMatch[1].split(',').map(z => z.trim().replace(/['"]/g, '')) : 
    [];
    
  return { rulingPlanets, favorableZodiac };
}

/**
 * Generate aspect-aware lunar phase modifiers
 */
function generateLunarPhaseModifiersWithAspects(
  elementalProps: ElementalProperties,
  ingredientName: string,
  category: string,
  rulingPlanets: string[] = []
): Record<string, any> {
  // First get the basic lunar phase modifiers
  const basicModifiers = generateDefaultLunarPhaseModifiers(
    elementalProps,
    ingredientName,
    category
  );
  
  // If there are ruling planets, add extra tips related to planetary alignments
  if (rulingPlanets.length > 0) {
    // For full moon, add specific tips for conjunctions with ruling planets
    if (basicModifiers.fullMoon) {
      const planetTip = `Most potent when ${rulingPlanets.join(' or ')} is prominent`;
      basicModifiers.fullMoon.preparationTips = [
        ...basicModifiers.fullMoon.preparationTips,
        planetTip
      ];
    }
    
    // For first quarter moon, add planetary alignment tips
    if (basicModifiers.firstQuarter) {
      const alignmentTip = `Benefits from ${rulingPlanets[0]} alignments`;
      basicModifiers.firstQuarter.preparationTips = [
        ...basicModifiers.firstQuarter.preparationTips,
        alignmentTip
      ];
    }
  }
  
  return basicModifiers;
}

// Run the script when directly executed
if (require.main === module) {
  updateAllIngredientFiles()
    .then(() => {
      console.log('Lunar phase modifier update completed successfully.');
    })
    .catch(err => {
      console.error('Error during lunar phase modifier update:', err);
      process.exit(1);
    });
}

export { updateAllIngredientFiles }; 