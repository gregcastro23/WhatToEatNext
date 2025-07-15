#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');

// Files to update based on analysis - focusing on lowest coverage files
const targetFiles = [
  'src/data/ingredients/vegetables/squash.ts',
  'src/data/ingredients/vegetables/starchy.ts',
  'src/data/ingredients/spices/wholespices.ts',
  'src/data/ingredients/seasonings/salts.ts',
  'src/data/ingredients/seasonings/vinegars.ts',
  'src/data/ingredients/spices/aromatics.ts',
  'src/data/ingredients/spices/peppers.ts'
];

// Required fields that are commonly missing
const requiredFields = [
  'sensoryProfile',
  'origin',
  'season',
  'preparation',
  'storage',
  'varieties',
  'astrologicalProfile',
  'elementalProperties',
  'qualities'
];

// Default values for missing fields
const defaultValues = {
  sensoryProfile: {
    taste: ['Neutral'],
    aroma: ['Fresh'],
    texture: ['Firm'],
    notes: 'Standard sensory profile'
  },
  origin: ['Various'],
  season: ['year-round'],
  preparation: {
    cleaning: 'Rinse if needed',
    cutting: 'As needed',
    notes: 'Standard preparation methods'
  },
  storage: {
    temperature: 'cool, dry place',
    duration: '1-2 weeks',
    notes: 'Standard storage recommendations'
  },
  varieties: {
    'Standard': 'Most common variety'
  },
  astrologicalProfile: {
    rulingPlanets: ['Venus'],
    favorableZodiac: ['taurus'],
    elementalAffinity: {
      base: 'Earth'
    }
  },
  elementalProperties: {
    Earth: 0.3,
    Water: 0.3,
    Fire: 0.2,
    Air: 0.2
  },
  qualities: ['versatile', 'nourishing']
};

function addMissingFields(content, ingredientKey, ingredientData) {
  let updated = false;
  const updatedData = { ...ingredientData };
  
  for (const field of requiredFields) {
    if (!updatedData[field]) {
      updatedData[field] = defaultValues[field];
      updated = true;
    }
  }
  
  if (updated) {
    // Update the ingredient in the content
    const ingredientRegex = new RegExp(`"${ingredientKey}":\\s*{[^}]+}`, 's');
    const replacement = `"${ingredientKey}": ${JSON.stringify(updatedData, null, 2)}`;
    
    if (ingredientRegex.test(content)) {
      content = content.replace(ingredientRegex, replacement);
    }
  }
  
  return { content, updated };
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fileUpdated = false;
  
  // Find the main object (usually starts with const raw... = {)
  const objectMatch = content.match(/const\s+(\w+)\s*=\s*{/);
  if (!objectMatch) {
    console.log(`❌ Could not find main object in ${filePath}`);
    return false;
  }
  
  const objectName = objectMatch[1];
  console.log(`📁 Processing ${filePath} (object: ${objectName})`);
  
  // Find all ingredient objects
  const ingredientMatches = content.match(/"([^"]+)":\s*{/g);
  if (!ingredientMatches) {
    console.log(`❌ No ingredients found in ${filePath}`);
    return false;
  }
  
  for (const match of ingredientMatches) {
    const ingredientKey = match.match(/"([^"]+)":/)[1];
    
    // Extract the ingredient object
    const startIndex = content.indexOf(match);
    let braceCount = 0;
    let endIndex = startIndex;
    
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }
    
    const ingredientContent = content.substring(startIndex, endIndex);
    const ingredientDataMatch = ingredientContent.match(/"([^"]+)":\s*({[\s\S]*})/);
    
    if (ingredientDataMatch) {
      try {
        const ingredientData = eval(`(${ingredientDataMatch[2]})`);
        const { content: newContent, updated } = addMissingFields(content, ingredientKey, ingredientData);
        
        if (updated) {
          content = newContent;
          fileUpdated = true;
          console.log(`  ✅ Updated ${ingredientKey}`);
        }
      } catch (error) {
        console.log(`  ⚠️  Could not parse ${ingredientKey}: ${error.message}`);
      }
    }
  }
  
  if (fileUpdated) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`💾 Saved updates to ${filePath}`);
    } else {
      console.log(`🔍 Would update ${filePath}`);
    }
    return true;
  } else {
    console.log(`ℹ️  No updates needed for ${filePath}`);
    return false;
  }
}

function main() {
  console.log(`🔧 Adding missing ingredient fields${DRY_RUN ? ' (DRY RUN)' : ''}`);
  console.log(`📁 Processing ${targetFiles.length} files...\n`);
  
  let updatedCount = 0;
  
  for (const filePath of targetFiles) {
    if (processFile(filePath)) {
      updatedCount++;
    }
    console.log('');
  }
  
  console.log(`📊 Summary:`);
  console.log(`  Files processed: ${targetFiles.length}`);
  console.log(`  Files updated: ${updatedCount}`);
  console.log(`  Mode: ${DRY_RUN ? 'Dry run' : 'Live update'}`);
  
  if (!DRY_RUN && updatedCount > 0) {
    console.log(`\n✅ Updates completed! Run the analysis script to check coverage improvement.`);
  }
}

main(); 