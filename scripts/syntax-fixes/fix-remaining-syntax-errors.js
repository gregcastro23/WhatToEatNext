import fs from 'fs';
import path from 'path';

// Path to the file with syntax errors
const targetFile = path.resolve(process.cwd(), 'src/calculations/alchemicalEngine.ts');

// Function to run the script with a dry run option
function fixRemainingErrors(dryRun = true) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing remaining complex syntax errors in alchemicalEngine.ts`);
  
  // Read the file content
  let content;
  try {
    content = fs.readFileSync(targetFile, 'utf8');
    console.log(`File read successfully (${content.length} bytes)`);
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
  }

  // Store the original content for comparison
  const originalContent = content;
  
  // Fix JSON.parse errors by adding missing constants
  // Add planetInfo, signInfo, and signs constants if they don't exist
  if (!content.includes('const planetInfo =') && content.includes('planetInfo: JSON.parse(JSON.stringify(planetInfo))')) {
    // Add the constants from the workspace rules before the safePower function
    let constantsToAdd = `
// Adding planetary constants required for alchemize functions
const planetInfo = {
  Sun: {
    'Dignity Effect': { leoLeo: 1, ariesAries: 2, aquariusAquarius: -1, libraLibra: -2 },
    Elements: ['Fire', 'Fire'],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Fire'
  },
  Moon: {
    'Dignity Effect': { cancerCancer: 1, taurusTaurus: 2, capricornCapricorn: -1, scorpioScorpio: -2 },
    Elements: ['Water', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water'
  },
  Mercury: {
    'Dignity Effect': { geminiGemini: 1, virgoVirgo: 3, sagittariusSagittarius: 1, piscesPisces: -3 },
    Elements: ['Air', 'Earth'],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth'
  }
};

const signInfo = {
  ariesAries: { Element: 'Fire' },
  taurusTaurus: { Element: 'Earth' },
  geminiGemini: { Element: 'Air' },
  cancerCancer: { Element: 'Water' },
  leoLeo: { Element: 'Fire' },
  virgoVirgo: { Element: 'Earth' },
  libraLibra: { Element: 'Air' },
  scorpioScorpio: { Element: 'Water' },
  sagittariusSagittarius: { Element: 'Fire' },
  capricornCapricorn: { Element: 'Earth' },
  aquariusAquarius: { Element: 'Air' },
  piscesPisces: { Element: 'Water' }
};

const signs = {
  0: 'ariesAries', 1: 'taurusTaurus', 2: 'geminiGemini', 3: 'cancerCancer',
  4: 'leoLeo', 5: 'virgoVirgo', 6: 'libraLibra', 7: 'scorpioScorpio',
  8: 'sagittariusSagittarius', 9: 'capricornCapricorn', 10: 'aquariusAquarius', 11: 'piscesPisces'
};
`;
    
    // Insert the constants before the safePower function
    const safePowerIndex = content.indexOf('function safePower');
    if (safePowerIndex !== -1) {
      content = content.slice(0, safePowerIndex) + constantsToAdd + content.slice(safePowerIndex);
    } else {
      // If safePower is not found, add at the end of the file
      content += constantsToAdd;
    }
  }
  
  // Fix missing function declarations (getAbsoluteElementValue is defined twice)
  // Remove the duplicate function
  const absoluteElementValueFunctionPattern = /function getAbsoluteElementValue\(elementObject: Record<string, number>\): number \{[\s\S]*?return sum;\s*\}/g;
  const matches = content.match(absoluteElementValueFunctionPattern);
  
  if (matches && matches.length > 1) {
    // Keep the first occurrence and remove the second
    const firstOccurrence = content.indexOf(matches[0]);
    const secondOccurrence = content.indexOf(matches[1]);
    
    if (firstOccurrence !== -1 && secondOccurrence !== -1) {
      content = content.slice(0, secondOccurrence) + content.slice(secondOccurrence + matches[1].length);
    }
  }
  
  // Fix functions that aren't properly closed with braces
  // This is a simplistic approach - for complex functions might need manual fixes
  const functionStartPattern = /function [a-zA-Z0-9_]+\([^)]*\):\s*[a-zA-Z<>[\]|]*\s*\{/g;
  const functionStarts = [...content.matchAll(functionStartPattern)];
  
  functionStarts.forEach((match, index) => {
    const functionStart = match.index;
    const nextFunctionStart = index < functionStarts.length - 1 ? functionStarts[index + 1].index : content.length;
    
    // Check if there's a balanced number of braces in the function
    const functionCode = content.substring(functionStart, nextFunctionStart);
    const openBraces = (functionCode.match(/\{/g) || []).length;
    const closeBraces = (functionCode.match(/\}/g) || []).length;
    
    if (openBraces > closeBraces) {
      // Add missing closing braces
      const missingBraces = openBraces - closeBraces;
      const newContent = content.substring(0, nextFunctionStart) + '}' + content.substring(nextFunctionStart);
      content = newContent;
    }
  });
  
  // Check if content has changed
  const hasChanges = content !== originalContent;
  
  if (hasChanges) {
    if (dryRun) {
      console.log('[DRY RUN] Complex changes detected. Run without --dry-run to apply fixes.');
    } else {
      // Write back to the file
      try {
        fs.writeFileSync(targetFile, content, 'utf8');
        console.log('Complex syntax errors fixed successfully!');
      } catch (error) {
        console.error(`Error writing file: ${error.message}`);
        process.exit(1);
      }
    }
  } else {
    console.log('No complex syntax errors detected or fixed.');
  }
}

// Parse command line arguments
const isDryRun = !process.argv.includes('--apply');

// Run the script
fixRemainingErrors(isDryRun);

console.log('Done!'); 