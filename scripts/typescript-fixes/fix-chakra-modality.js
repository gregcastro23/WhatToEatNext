import fs from 'fs';
import path from 'path';

const dryRun = process.argv.includes('--dry-run');

const files = [
  path.resolve(process.cwd(), 'src/types/chakra.ts'),
  path.resolve(process.cwd(), 'src/types/alchemy.ts'),
  path.resolve(process.cwd(), 'src/types/zodiac.ts'),
  path.resolve(process.cwd(), 'src/types/ingredient.ts')
];

function fixChakraModality() {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing chakra and modality related interfaces...`);

  // First, read and analyze the chakra.ts file which should be the source of truth
  const chakraFilePath = path.resolve(process.cwd(), 'src/types/chakra.ts');
  let chakraContent = '';
  
  if (fs.existsSync(chakraFilePath)) {
    chakraContent = fs.readFileSync(chakraFilePath, 'utf8');
  } else {
    console.error('Could not find the chakra.ts file');
    return;
  }
  
  // Extract the ChakraPosition type definition from chakra.ts
  const chakraPositionTypeMatch = chakraContent.match(/export\s+type\s+ChakraPosition\s*=\s*([^;]+);/);
  const chakraPositionType = chakraPositionTypeMatch ? chakraPositionTypeMatch[1].trim() : null;
  
  if (!chakraPositionType) {
    console.error('Could not find ChakraPosition type definition in chakra.ts');
    return;
  }
  
  // Process each file
  files.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`File does not exist: ${filePath}`);
      return;
    }

    console.log(`Processing ${path.basename(filePath)}...`);
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the file based on its name
    if (filePath.includes('chakra.ts')) {
      content = fixChakraFile(content);
    } else if (filePath.includes('alchemy.ts')) {
      content = fixAlchemyFile(content, chakraPositionType);
    } else if (filePath.includes('zodiac.ts')) {
      content = fixZodiacFile(content);
    } else if (filePath.includes('ingredient.ts')) {
      content = fixIngredientFile(content);
    }
    
    // Write the changes if not a dry run
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${path.basename(filePath)}`);
    } else {
      console.log(`[DRY RUN] Would fix ${path.basename(filePath)}`);
    }
  });
  
  // Look for other files that might use chakra or modality types
  fixRelatedFiles(chakraPositionType);
}

function fixChakraFile(content) {
  // Ensure all interfaces have export keyword
  content = content.replace(
    /^\s*interface\s+(\w+)\s*\{/gm,
    'export interface $1 {'
  );
  
  // Ensure consistent naming for chakra positions
  // Make sure 'solarPlexus' is used consistently (not 'solar plexus')
  if (content.includes("'solar plexus'")) {
    content = content.replace(
      /'solar plexus'/g,
      "'solarPlexus'"
    );
    
    // Update the string literal comment to match
    content = content.replace(
      /name: 'Solar Plexus Chakra',/,
      "name: 'Solar Plexus Chakra', // Maps to solarPlexus in ChakraPosition type"
    );
  }
  
  return content;
}

function fixAlchemyFile(content, chakraPositionType) {
  // Replace any existing ChakraPosition type with the one from chakra.ts
  const existingChakraPositionMatch = content.match(/export\s+type\s+ChakraPosition\s*=\s*[^;]+;/);
  
  if (existingChakraPositionMatch) {
    content = content.replace(
      existingChakraPositionMatch[0],
      `export type ChakraPosition = ${chakraPositionType};`
    );
  }
  
  // Fix ChakraEnergies interface if it exists
  const chakraEnergiesMatch = content.match(/export\s+interface\s+ChakraEnergies\s*\{[^}]*\}/);
  
  if (chakraEnergiesMatch) {
    content = content.replace(
      chakraEnergiesMatch[0],
      `export interface ChakraEnergies {
  root: number;
  sacral: number;
  solarPlexus: number;
  heart: number;
  throat: number;
  brow: number;
  crown: number;
}`
    );
  }
  
  return content;
}

function fixZodiacFile(content) {
  // Ensure Modality type is exported and consistent
  if (!content.includes('export type Modality')) {
    // Look for a non-exported Modality type
    const modalityMatch = content.match(/type\s+Modality\s*=\s*[^;]+;/);
    
    if (modalityMatch) {
      content = content.replace(
        modalityMatch[0],
        'export ' + modalityMatch[0]
      );
    } else {
      // Add Modality type if it doesn't exist
      const lastImportIndex = content.lastIndexOf('import');
      const insertPoint = content.indexOf(';', lastImportIndex) + 1;
      
      content = content.slice(0, insertPoint) + 
               '\n\n// Zodiac modality type\nexport type Modality = \'cardinal\' | \'fixed\' | \'mutable\';\n' + 
               content.slice(insertPoint);
    }
  }
  
  // Fix ZODIAC_MODALITIES if needed
  if (content.includes('export const ZODIAC_MODALITIES')) {
    // Check if it's correctly typed
    if (!content.includes('Record<ZodiacSign, Modality>')) {
      content = content.replace(
        /export const ZODIAC_MODALITIES[^=]+=\s*/,
        'export const ZODIAC_MODALITIES: Record<ZodiacSign, Modality> = '
      );
    }
  }
  
  return content;
}

function fixIngredientFile(content) {
  // Check if the file imports Modality
  if (content.includes('Modality') && !content.includes('import { Modality }') && !content.includes('import type { Modality }')) {
    // Add the import for Modality from zodiac.ts
    const lastImportIndex = content.lastIndexOf('import');
    const insertPoint = content.indexOf(';', lastImportIndex) + 1;
    
    content = content.slice(0, insertPoint) + 
             '\nimport type { Modality } from \'./zodiac\';\n' + 
             content.slice(insertPoint);
  }
  
  return content;
}

function fixRelatedFiles(chakraPositionType) {
  // Look for utils related to chakra
  const chakraUtilsPath = path.resolve(process.cwd(), 'src/utils/chakraFoodUtils.ts');
  
  if (fs.existsSync(chakraUtilsPath)) {
    console.log(`Processing related file: chakraFoodUtils.ts...`);
    
    let content = fs.readFileSync(chakraUtilsPath, 'utf8');
    
    // Ensure it imports ChakraPosition type correctly
    if (content.includes('ChakraPosition') && !content.includes('import { ChakraPosition }') && !content.includes('import type { ChakraPosition }')) {
      const lastImportIndex = content.lastIndexOf('import');
      const insertPoint = content.indexOf(';', lastImportIndex) + 1;
      
      content = content.slice(0, insertPoint) + 
               '\nimport type { ChakraPosition } from \'@/types/chakra\';\n' + 
               content.slice(insertPoint);
    }
    
    // Write the changes if not a dry run
    if (!dryRun) {
      fs.writeFileSync(chakraUtilsPath, content, 'utf8');
      console.log(`Fixed related file: chakraFoodUtils.ts`);
    } else {
      console.log(`[DRY RUN] Would fix related file: chakraFoodUtils.ts`);
    }
  }
  
  // Create missing utils/chakraMappings.ts if it doesn't exist
  const chakraMappingsPath = path.resolve(process.cwd(), 'src/utils/chakraMappings.ts');
  
  if (!fs.existsSync(chakraMappingsPath)) {
    console.log(`Creating missing file: chakraMappings.ts...`);
    
    const content = `// Chakra Mappings - Provides utility functions for chakra-related operations
import type { ChakraPosition, ChakraEnergies } from '@/types/chakra';
import type { ZodiacSign } from '@/types/zodiac';

// Map zodiac signs to their primary chakra position
export const ZODIAC_TO_CHAKRA: Record<ZodiacSign, ChakraPosition> = {
  aries: 'crown',
  taurus: 'throat',
  gemini: 'throat',
  cancer: 'heart',
  leo: 'solarPlexus',
  virgo: 'sacral',
  libra: 'heart',
  scorpio: 'root',
  sagittarius: 'sacral',
  capricorn: 'root',
  aquarius: 'crown',
  pisces: 'brow'
};

// Default chakra energy state (balanced)
export const DEFAULT_CHAKRA_ENERGIES: ChakraEnergies = {
  root: 0.5,
  sacral: 0.5,
  solarPlexus: 0.5,
  heart: 0.5,
  throat: 0.5,
  brow: 0.5,
  crown: 0.5
};

/**
 * Determines which chakras are underactive based on the chakra energy state
 * @param chakraEnergies The current chakra energy state
 * @param threshold The threshold below which a chakra is considered underactive (default 0.4)
 * @returns Array of underactive chakra positions
 */
export function getUnderactiveCkakras(
  chakraEnergies: ChakraEnergies,
  threshold = 0.4
): ChakraPosition[] {
  return Object.entries(chakraEnergies)
    .filter(([_, value]) => value < threshold)
    .map(([chakra]) => chakra as ChakraPosition);
}

/**
 * Determines which chakras are overactive based on the chakra energy state
 * @param chakraEnergies The current chakra energy state
 * @param threshold The threshold above which a chakra is considered overactive (default 0.7)
 * @returns Array of overactive chakra positions
 */
export function getOveractiveCkakras(
  chakraEnergies: ChakraEnergies,
  threshold = 0.7
): ChakraPosition[] {
  return Object.entries(chakraEnergies)
    .filter(([_, value]) => value > threshold)
    .map(([chakra]) => chakra as ChakraPosition);
}

/**
 * Gets the primary chakra for a zodiac sign
 * @param sign The zodiac sign
 * @returns The primary chakra position associated with the sign
 */
export function getPrimaryChakraForSign(sign: ZodiacSign): ChakraPosition {
  return ZODIAC_TO_CHAKRA[sign];
}

/**
 * Calculates the chakra energy state based on various inputs
 * @param zodiacSign The current zodiac sign
 * @param baseCkakraEnergies Optional base chakra energies to modify
 * @returns Updated chakra energies
 */
export function calculateChakraEnergies(
  zodiacSign: ZodiacSign,
  baseChakraEnergies: ChakraEnergies = DEFAULT_CHAKRA_ENERGIES
): ChakraEnergies {
  const primaryChakra = ZODIAC_TO_CHAKRA[zodiacSign];
  
  // Create a copy of the base energies
  const result: ChakraEnergies = { ...baseChakraEnergies };
  
  // Enhance the primary chakra for this sign
  result[primaryChakra] += 0.2;
  
  // Normalize values to ensure they stay in the 0-1 range
  Object.keys(result).forEach(chakra => {
    result[chakra as ChakraPosition] = Math.min(Math.max(result[chakra as ChakraPosition], 0), 1);
  });
  
  return result;
}
`;
    
    // Write the file if not a dry run
    if (!dryRun) {
      fs.writeFileSync(chakraMappingsPath, content, 'utf8');
      console.log(`Created missing file: chakraMappings.ts`);
    } else {
      console.log(`[DRY RUN] Would create missing file: chakraMappings.ts`);
    }
  }
}

// Run the fix function
try {
  fixChakraModality();
} catch (error) {
  console.error('Error fixing chakra and modality interfaces:', error);
  process.exit(1);
} 