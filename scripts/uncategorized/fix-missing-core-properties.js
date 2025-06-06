#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const DRY_RUN = process.argv.includes('--dry-run');

console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Fix Missing Core Properties`);
console.log('='.repeat(50));

const fixes = [];

// Fix 1: Add currentSeason to TimeFactors type
async function fixTimeFactorsType() {
  const typeFiles = await glob('src/types/**/*.ts');
  
  for (const file of typeFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      
      // Look for TimeFactors interface
      if (content.includes('interface TimeFactors') || content.includes('type TimeFactors')) {
        const updatedContent = content.replace(
          /(interface|type)\s+TimeFactors\s*[=]?\s*\{([^}]+)\}/g,
          (match, interfaceOrType, body) => {
            if (!body.includes('currentSeason')) {
              // Add currentSeason property
              const newBody = body.trim() + '\n  currentSeason?: string;';
              return `${interfaceOrType} TimeFactors ${interfaceOrType === 'type' ? '= ' : ''}{${newBody}\n}`;
            }
            return match;
          }
        );
        
        if (updatedContent !== content) {
          fixes.push({
            file,
            description: 'Added currentSeason property to TimeFactors type',
            preview: 'currentSeason?: string; added to TimeFactors'
          });
          
          if (!DRY_RUN) {
            writeFileSync(file, updatedContent);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Fix 2: Add exactLongitude to CelestialPosition type
async function fixCelestialPositionType() {
  const typeFiles = await glob('src/types/**/*.ts');
  
  for (const file of typeFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      
      if (content.includes('interface CelestialPosition') || content.includes('type CelestialPosition')) {
        const updatedContent = content.replace(
          /(interface|type)\s+CelestialPosition\s*[=]?\s*\{([^}]+)\}/g,
          (match, interfaceOrType, body) => {
            if (!body.includes('exactLongitude')) {
              const newBody = body.trim() + '\n  exactLongitude?: number;';
              return `${interfaceOrType} CelestialPosition ${interfaceOrType === 'type' ? '= ' : ''}{${newBody}\n}`;
            }
            return match;
          }
        );
        
        if (updatedContent !== content) {
          fixes.push({
            file,
            description: 'Added exactLongitude property to CelestialPosition type',
            preview: 'exactLongitude?: number; added to CelestialPosition'
          });
          
          if (!DRY_RUN) {
            writeFileSync(file, updatedContent);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Fix 3: Fix PlanetaryPosition minute/minutes inconsistency
async function fixPlanetaryPositionMinutes() {
  const files = await glob('src/**/*.{ts,tsx}');
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      let updatedContent = content;
      
      // Replace .minute with .minutes in property access
      updatedContent = updatedContent.replace(
        /(\w+)\.minute(?!\w)/g,
        '$1.minutes'
      );
      
      // Fix object literal minute: to minutes:
      updatedContent = updatedContent.replace(
        /(\s+)minute:\s*(\w+),?/g,
        '$1minutes: $2,'
      );
      
      if (updatedContent !== content) {
        fixes.push({
          file,
          description: 'Fixed minute to minutes property name consistency',
          preview: 'Changed .minute to .minutes for PlanetaryPosition'
        });
        
        if (!DRY_RUN) {
          writeFileSync(file, updatedContent);
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Fix 4: Fix createElementalProperties function signature
async function fixCreateElementalPropertiesSignature() {
  const files = await glob('src/**/*.{ts,tsx}');
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      let updatedContent = content;
      
      // Fix calls to createElementalProperties() with no arguments
      updatedContent = updatedContent.replace(
        /createElementalProperties\(\s*\)/g,
        'createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0 })'
      );
      
      // Fix function definition to have a default parameter
      updatedContent = updatedContent.replace(
        /function createElementalProperties\(props: \{ Fire: number; Water: number; Earth: number; Air: number \}\): ElementalProperties/g,
        'function createElementalProperties(props: { Fire: number; Water: number; Earth: number; Air: number } = { Fire: 0, Water: 0, Earth: 0, Air: 0 }): ElementalProperties'
      );
      
      if (updatedContent !== content) {
        fixes.push({
          file,
          description: 'Fixed createElementalProperties function calls and signature',
          preview: 'Added default arguments and fixed function calls'
        });
        
        if (!DRY_RUN) {
          writeFileSync(file, updatedContent);
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Fix 5: Add Season type where missing
async function fixSeasonType() {
  const files = await glob('src/**/*.{ts,tsx}');
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      
      // Check if file uses Season type but doesn't import/define it
      if (content.includes('as Season') && !content.includes('type Season') && !content.includes('import.*Season')) {
        let updatedContent = content;
        
        // Add Season type definition at the top
        const typeDefinition = `\ntype Season = 'spring' | 'summer' | 'autumn' | 'winter';\n`;
        
        // Find a good place to insert (after imports, before first type usage)
        const importEndIndex = updatedContent.lastIndexOf('import');
        if (importEndIndex !== -1) {
          const nextLineIndex = updatedContent.indexOf('\n', importEndIndex);
          updatedContent = updatedContent.slice(0, nextLineIndex) + typeDefinition + updatedContent.slice(nextLineIndex);
        } else {
          updatedContent = typeDefinition + updatedContent;
        }
        
        fixes.push({
          file,
          description: 'Added Season type definition',
          preview: "type Season = 'spring' | 'summer' | 'autumn' | 'winter';"
        });
        
        if (!DRY_RUN) {
          writeFileSync(file, updatedContent);
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Execute all fixes
async function runAllFixes() {
  await fixTimeFactorsType();
  await fixCelestialPositionType();
  await fixPlanetaryPositionMinutes();
  await fixCreateElementalPropertiesSignature();
  await fixSeasonType();
}

// Main execution
runAllFixes().then(() => {
  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Results:`);
  console.log(`Found ${fixes.length} fixes`);
  
  if (fixes.length > 0) {
    console.log('\nFixes applied:');
    fixes.forEach((fix, index) => {
      console.log(`${index + 1}. ${fix.file}`);
      console.log(`   ${fix.description}`);
      console.log(`   Preview: ${fix.preview}`);
      console.log('');
    });
  }
  
  if (DRY_RUN) {
    console.log('\nRun without --dry-run to apply these fixes.');
  } else {
    console.log('\nFixes applied successfully!');
    console.log('Run yarn build to verify fixes.');
  }
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 