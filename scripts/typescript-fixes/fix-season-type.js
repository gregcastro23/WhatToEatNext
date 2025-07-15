/**
 * Fix Season Type Script
 * 
 * This script updates the Season type in src/types/alchemy.ts to include both 'autumn' and 'fall'.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');

// Log helper
function log(message, type = 'info') {
  const prefix = type === 'info' ? '📝' : type === 'warn' ? '⚠️' : '❌';
  console.log(`${prefix} ${message}`);
}

// Main function
async function main() {
  log(`Starting Season type fix ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  try {
    const filePath = path.resolve(process.cwd(), 'src/types/alchemy.ts');
    
    if (!fs.existsSync(filePath)) {
      log(`File not found: src/types/alchemy.ts`, 'error');
      process.exit(1);
    }
    
    log(`Processing src/types/alchemy.ts...`);
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Check for Season type
    if (content.includes('export type Season =')) {
      // More robust regex to find the Season type definition
      const seasonRegex = /export\s+type\s+Season\s*=\s*'[^']*'(?:\s*\|\s*'[^']*')*\s*;/;
      const seasonMatch = content.match(seasonRegex);
      
      if (seasonMatch) {
        const currentDefinition = seasonMatch[0];
        const hasAutumn = currentDefinition.includes("'autumn'");
        const hasFall = currentDefinition.includes("'fall'");
        
        // Only update if one of them is missing
        if (hasAutumn && !hasFall) {
          log('  - Season type has autumn but not fall, adding fall');
          const updatedDefinition = currentDefinition.replace(
            /(export\s+type\s+Season\s*=\s*(?:.*?))(;)/,
            "$1 | 'fall'$2"
          );
          content = content.replace(currentDefinition, updatedDefinition);
          updated = true;
        } else if (!hasAutumn && hasFall) {
          log('  - Season type has fall but not autumn, adding autumn');
          const updatedDefinition = currentDefinition.replace(
            /(export\s+type\s+Season\s*=\s*(?:.*?))(;)/,
            "$1 | 'autumn'$2"
          );
          content = content.replace(currentDefinition, updatedDefinition);
          updated = true;
        } else if (!hasAutumn && !hasFall) {
          log('  - Season type is missing both autumn and fall, adding both');
          const updatedDefinition = currentDefinition.replace(
            /(export\s+type\s+Season\s*=\s*(?:.*?))(;)/,
            "$1 | 'autumn' | 'fall'$2"
          );
          content = content.replace(currentDefinition, updatedDefinition);
          updated = true;
        } else {
          log('  - Season type already has both autumn and fall');
        }
        
        // Alternative fix: replace the entire type with a standardized version
        if (!updated) {
          log('  - Trying alternative approach with standard Season type');
          const standardSeason = `export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all';`;
          content = content.replace(currentDefinition, standardSeason);
          updated = true;
        }
      } else {
        log('  - Could not find Season type using regex pattern', 'warn');
      }
    } else {
      log('  - Season type not found in file', 'warn');
    }
    
    // Save the updated file
    if (updated) {
      log(`  - Changes found for src/types/alchemy.ts`);
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, 'utf8');
        log(`  - Updated src/types/alchemy.ts`);
      } else {
        log(`  - Would update src/types/alchemy.ts (dry run)`);
      }
    } else {
      log(`  - No changes needed for src/types/alchemy.ts`);
    }
    
    log('Season type fix completed successfully!');
  } catch (error) {
    log(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
  }
}

// Run the script
main(); 