/**
 * Fix AlchemicalProperties Interface Script
 * 
 * This script updates the AlchemicalProperties interface in src/types/alchemy.ts to use lowercase property names
 * (Spirit, Essence, Matter, Substance) as required by the codebase.
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
  log(`Starting AlchemicalProperties interface fix ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  try {
    const filePath = path.resolve(process.cwd(), 'src/types/alchemy.ts');
    
    if (!fs.existsSync(filePath)) {
      log(`File not found: src/types/alchemy.ts`, 'error');
      process.exit(1);
    }
    
    log(`Processing src/types/alchemy.ts...`);
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Check for AlchemicalProperties interface
    if (content.includes('export interface AlchemicalProperties')) {
      // Find the interface definition
      const alchemicalRegex = /export\s+interface\s+AlchemicalProperties\s*\{[^}]*\}/s;
      const alchemicalMatch = content.match(alchemicalRegex);
      
      if (alchemicalMatch) {
        const currentDefinition = alchemicalMatch[0];
        
        // Check if it's using lowercase property names
        const hasLowercaseProperties = 
          currentDefinition.includes('Spirit:') && 
          currentDefinition.includes('Essence:') && 
          currentDefinition.includes('Matter:') && 
          currentDefinition.includes('Substance:');
          
        // Check if it's using uppercase property names or elementalProfile
        const hasUppercaseProperties = 
          currentDefinition.includes('Spirit:') || 
          currentDefinition.includes('Essence:') || 
          currentDefinition.includes('Matter:') || 
          currentDefinition.includes('Substance:');
          
        const hasElementalProfile = currentDefinition.includes('elementalProfile:');
        
        if (!hasLowercaseProperties && (hasUppercaseProperties || hasElementalProfile)) {
          log('  - AlchemicalProperties needs to be updated to use lowercase property names');
          
          // Replace with the correct interface
          const updatedInterface = `export interface AlchemicalProperties {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}`;
          
          content = content.replace(currentDefinition, updatedInterface);
          updated = true;
        } else if (hasLowercaseProperties) {
          log('  - AlchemicalProperties already has lowercase property names');
        } else {
          log('  - AlchemicalProperties interface structure is different than expected', 'warn');
        }
      } else {
        log('  - Could not find AlchemicalProperties interface using regex pattern', 'warn');
      }
    } else {
      log('  - AlchemicalProperties interface not found in file', 'warn');
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
    
    log('AlchemicalProperties interface fix completed successfully!');
  } catch (error) {
    log(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
  }
}

// Run the script
main(); 