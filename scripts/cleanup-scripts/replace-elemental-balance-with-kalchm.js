#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../..');

console.log('🔬 Replacing elementalBalance with proper alchemical quantities...');

// Configuration
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified');
}

const replacements = [
  {
    file: 'src/calculations/alchemicalCalculations.ts',
    fix: (content) => {
      // Remove elementalBalance completely from return statement
      content = content.replace(
        /elementalBalance,[\s\n]*dominantElement,/g,
        'dominantElement,'
      );
      
      // Remove any remaining elementalBalance assignments and calculations
      content = content.replace(
        /elementalBalance\[elem[^\]]*\][^;]*;/g,
        '// Element tracking removed - using kalchm instead'
      );
      
      // Replace elementalBalance variable with kalchm calculation
      content = content.replace(
        /const elementalBalance[^=]*=[^;]*;/g,
        '// Calculate kalchm for alchemical recommendation\n  const kalchm = (Spirit ** Spirit * Essence ** Essence) / (Matter ** Matter * Substance ** Substance);'
      );
      
      // Replace references to elementalBalance in loops
      content = content.replace(
        /for \(const \[element, value\] of Object\.entries\(elementalBalance\)\)/g,
        'for (const [element, value] of Object.entries({ Fire: Spirit, Water: Essence, Earth: Matter, Air: Substance }))'
      );
      
      // Update the generateRecommendation function call
      content = content.replace(
        /generateRecommendation\(dominantElement, elementalBalance\)/g,
        'generateRecommendation(dominantElement, { kalchm })'
      );
      
      // Update totalEffectValue to use proper elemental calculations
      content = content.replace(
        /Fire: elementalBalance\.Fire,[\s\n]*Water: elementalBalance\.Water,[\s\n]*Earth: elementalBalance\.Earth,[\s\n]*Air: elementalBalance\.Air/g,
        'Fire: Spirit,\n    Water: Essence,\n    Earth: Matter,\n    Air: Substance'
      );
      
      return content;
    }
  },
  {
    file: 'src/calculations/alchemicalCalculations.ts',
    fix: (content) => {
      // Update the generateRecommendation function signature
      content = content.replace(
        /function generateRecommendation\(dominantElement: string, elementalBalance: Record<string, number>\): string/g,
        'function generateRecommendation(dominantElement: string, alchemicalData: { kalchm: number }): string'
      );
      
      // Update recommendations to be more aligned with alchemical principles
      content = content.replace(
        /case 'Fire':\s*return "Foods that cool and ground[^"]*";/g,
        'case \'Fire\':\n      return "Fire-dominant: Enhance with foods that support spiritual transformation and energetic expansion.";'
      );
      
      content = content.replace(
        /case 'Earth':\s*return "Foods that lighten and elevate[^"]*";/g,
        'case \'Earth\':\n      return "Earth-dominant: Enhance with foods that support grounding and material manifestation.";'
      );
      
      content = content.replace(
        /case 'Air':\s*return "Foods that nourish and stabilize[^"]*";/g,
        'case \'Air\':\n      return "Air-dominant: Enhance with foods that support mental clarity and communication.";'
      );
      
      content = content.replace(
        /case 'Water':\s*return "Foods that invigorate and enliven[^"]*";/g,
        'case \'Water\':\n      return "Water-dominant: Enhance with foods that support emotional flow and intuitive connection.";'
      );
      
      return content;
    }
  },
  {
    file: 'src/data/integrations/elementalBalance.ts',
    fix: (content) => {
      // Replace the entire file with a kalchm-based approach
      return `import type { ElementalProperties, Element } from '@/types/alchemy';
import { 
  DEFAULT_ELEMENTAL_PROPERTIES,
} from '@/constants/elementalConstants';

/**
 * Alchemical Harmony Calculator
 * Uses kalchm (K_alchm) and monica constant for proper alchemical calculations
 * Following the principle that elements are additive, not balanced
 */
export const alchemicalHarmony = {

  /**
   * Calculate kalchm for ingredient or cuisine properties
   */
  calculateKalchm(properties: ElementalProperties): number {
    const { Fire, Water, Earth, Air } = properties;
    
    // Map elements to alchemical principles
    const Spirit = Fire || 0.001; // Avoid division by zero
    const Essence = Water || 0.001;
    const Matter = Earth || 0.001;
    const Substance = Air || 0.001;
    
    // Calculate kalchm: K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
    const kalchm = (Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence)) / 
                   (Math.pow(Matter, Matter) * Math.pow(Substance, Substance));
    
    return isFinite(kalchm) ? kalchm : 1.0;
  },

  /**
   * Calculate monica constant for cooking methods
   */
  calculateMonica(elementalProperties: ElementalProperties, gregsEnergy: number, reactivity: number): number {
    const kalchm = this.calculateKalchm(elementalProperties);
    
    if (kalchm <= 0) return NaN;
    
    const lnK = Math.log(kalchm);
    if (lnK === 0) return NaN;
    
    // Monica constant: monica = -ΔG / (R * T * ln(K))
    // Here we use gregsEnergy as ΔG and reactivity as temperature factor
    const monica = -gregsEnergy / (reactivity * lnK);
    
    return isFinite(monica) ? monica : NaN;
  },

  /**
   * Calculate harmony between two sets of properties using kalchm
   */
  calculateHarmonyBetween(first: ElementalProperties, second: ElementalProperties): number {
    const kalchm1 = this.calculateKalchm(first);
    const kalchm2 = this.calculateKalchm(second);
    
    // Higher kalchm values indicate better alchemical potential
    // Calculate harmony as the geometric mean, scaled to 0-1
    const harmony = Math.sqrt(kalchm1 * kalchm2);
    
    // Scale to reasonable range (0.5-1.0 for good harmony)
    return Math.min(1.0, Math.max(0.1, harmony / 10));
  },

  /**
   * Get dominant element (highest value, since elements are additive)
   */
  getDominantElement(properties: ElementalProperties): Element {
    const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
    return elements.reduce((dominant, element) => 
      (properties[element] || 0) > (properties[dominant] || 0) ? element : dominant
    ) as Element;
  },

  /**
   * Validate elemental properties
   */
  validateProperties(properties: ElementalProperties): boolean {
    if (!properties) return false;
    
    const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
    return elements.every(element => 
      typeof properties[element] === 'number' && 
      properties[element] >= 0
    );
  }
};

export default alchemicalHarmony;
`;
    }
  }
];

function applyReplacement(filePath, fixFunction) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${path.relative(projectRoot, filePath)}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = fixFunction(content);
    
    if (content !== newContent) {
      if (!isDryRun) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Updated: ${path.relative(projectRoot, filePath)}`);
      } else {
        console.log(`🔍 Would update: ${path.relative(projectRoot, filePath)}`);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

let updatedFiles = 0;

for (const { file, fix } of replacements) {
  const fullPath = path.join(projectRoot, file);
  if (applyReplacement(fullPath, fix)) {
    updatedFiles++;
  }
}

console.log(`\n📊 Summary: ${updatedFiles} files ${isDryRun ? 'would be' : 'were'} updated with alchemical calculations`);

if (isDryRun) {
  console.log('\n💡 Run without --dry-run to apply changes');
} else {
  console.log('\n✅ Alchemical calculation replacement completed!');
  console.log('\n🔬 Now using:');
  console.log('  • kalchm for ingredients and cuisines');
  console.log('  • monica constant for cooking methods');
  console.log('  • Additive elemental properties (no balancing)');
} 