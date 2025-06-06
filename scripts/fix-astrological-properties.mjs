import { readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { readdirSync } from 'fs';

// Flag to run in dry mode (no changes)
const DRY_RUN = process.argv.includes('--dry-run');

console.log(`Running in ${DRY_RUN ? 'dry run' : 'write'} mode`);

// Define the missing astrological profile properties
const astrologicalProfileFixes = {
  // Fix missing decanModifiers in aromatic.ts
  'src/data/ingredients/herbs/aromatic.ts': [
    {
      find: `astrologicalProfile: {
      rulingPlanets: ['Mercurymercury', 'Venusvenus'],
      favorableZodiac: ['gemini', 'libra', 'aquarius'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {}
      }
    }`,
      replace: `astrologicalProfile: {
      rulingPlanets: ['Mercurymercury', 'Venusvenus'],
      favorableZodiac: ['gemini', 'libra', 'aquarius'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercurymercury' },
          second: { element: 'Air', planet: 'Venusvenus' },
          third: { element: 'Air', planet: 'Uranusuranus' }
        }
      }
    }`
    },
    {
      find: `astrologicalProfile: {
      rulingPlanets: ['Sun', 'Jupiterjupiter'],
      favorableZodiac: ['leo', 'sagittarius'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {}
      }
    }`,
      replace: `astrologicalProfile: {
      rulingPlanets: ['Sun', 'Jupiterjupiter'],
      favorableZodiac: ['leo', 'sagittarius'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun' },
          second: { element: 'Fire', planet: 'Jupiterjupiter' },
          third: { element: 'Fire', planet: 'Marsmars' }
        }
      }
    }`
    },
    {
      find: `astrologicalProfile: {
      rulingPlanets: ['Jupiterjupiter', 'Mercurymercury'],
      favorableZodiac: ['sagittarius', 'gemini'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {}
      }
    }`,
      replace: `astrologicalProfile: {
      rulingPlanets: ['Jupiterjupiter', 'Mercurymercury'],
      favorableZodiac: ['sagittarius', 'gemini'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercurymercury' },
          second: { element: 'Fire', planet: 'Jupiterjupiter' },
          third: { element: 'Air', planet: 'Venusvenus' }
        }
      }
    }`
    }
  ],
  'src/data/ingredients/herbs/freshHerbs.ts': [
    {
      find: `astrologicalProfile: {
      rulingPlanets: ['Mercurymercury', 'Venusvenus'],
      favorableZodiac: ['gemini', 'libra', 'virgo'],
      elementalAffinity: {
        base: 'Air',
        secondary: 'Fire',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Water', planet: 'Jupiterjupiter' }
        }
      },`,
      replace: `astrologicalProfile: {
      rulingPlanets: ['Mercurymercury', 'Venusvenus'],
      favorableZodiac: ['gemini', 'libra', 'virgo'],
      elementalAffinity: {
        base: 'Air',
        secondary: 'Fire',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercurymercury' },
          second: { element: 'Air', planet: 'Venusvenus' },
          third: { element: 'Water', planet: 'Jupiterjupiter' }
        }
      },`
    }
  ],
  'src/data/ingredients/herbs/medicinalHerbs.ts': [
    {
      find: `astrologicalProfile: {
      planetaryRuler: 'Marsmars',
      zodiacRuler: 'ariesAries',
      element: 'Fire',
      energyType: 'Protective',
      lunarPhaseModifiers: {
        
}`,
      replace: `astrologicalProfile: {
      planetaryRuler: 'Marsmars',
      zodiacRuler: 'ariesAries',
      element: 'Fire',
      energyType: 'Protective',
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: { Fire: 0.2, Earth: 0.1 },
          preparationTips: ['Harvest roots during waning Moonmoon']
        },
        fullmoon: {
          elementalBoost: { Fire: 0.3, Water: 0.1 },
          preparationTips: ['Harvest flowers during full Moonmoon']
        }
      },
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Marsmars' },
          second: { element: 'Fire', planet: 'Sun' },
          third: { element: 'Earth', planet: 'Jupiterjupiter' }
        }
      }`
    }
  ]
};

// Process files with Set iteration issues
const filesToCheck = [
  'src/data/planetaryFlavorProfiles.ts',
  'src/data/foodTypes.ts'
];

for (const filePath of filesToCheck) {
  console.log(`Processing ${filePath} for Set iteration issues...`);
  
  try {
    // Read the file
    const fullPath = resolve(process.cwd(), filePath);
    const content = readFileSync(fullPath, 'utf8');
    
    // Check for actual Set iteration issues in the file
    const hasSetIterationIssue = content.includes('[...') || 
                               (content.includes('new Set(') && content.includes('[...'));
    
    if (!hasSetIterationIssue) {
      console.log(`No Set iteration issues found in ${filePath}, skipping...`);
      continue;
    }
    
    // Apply replacements
    let newContent = content;
    
    // Replace any [...setVar] with Array.from(setVar)
    newContent = newContent.replace(/\[\.\.\.(new Set\([^)]+\)|[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\]/g, 
      (match, setExpr) => `Array.from(${setExpr})`);
    
    // Replace any new Set([...set1, ...set2]) with new Set([...Array.from(set1), ...Array.from(set2)])
    newContent = newContent.replace(/new Set\(\[\.\.\.(new Set\([^)]+\)|[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*), \.\.\.(new Set\([^)]+\)|[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\]\)/g,
      (match, set1, set2) => `new Set([...Array.from(${set1}), ...Array.from(${set2})])`);
    
    // Report changes
    if (newContent !== content) {
      console.log(`Fixed Set iteration issues in ${filePath}`);
      
      if (!DRY_RUN) {
        // Write the updated file
        writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
      } else {
        console.log('Changes would be made (dry run mode)');
      }
    } else {
      console.log(`No Set iteration changes needed in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Process files with missing astrological profile properties
for (const [filePath, replacements] of Object.entries(astrologicalProfileFixes)) {
  console.log(`Processing ${filePath} for missing astrological profile properties...`);
  
  try {
    // Read the file
    const fullPath = resolve(process.cwd(), filePath);
    const content = readFileSync(fullPath, 'utf8');
    
    // Apply replacements
    let newContent = content;
    let replacementCount = 0;
    
    for (const { find, replace } of replacements) {
      if (newContent.includes(find)) {
        newContent = newContent.replace(find, replace);
        replacementCount++;
      }
    }
    
    // Report changes
    if (newContent !== content) {
      console.log(`Made ${replacementCount} replacements in ${filePath}`);
      
      if (!DRY_RUN) {
        // Write the updated file
        writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
      } else {
        console.log('Changes would be made (dry run mode)');
      }
    } else {
      console.log(`No changes made to ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

console.log('Done.'); 