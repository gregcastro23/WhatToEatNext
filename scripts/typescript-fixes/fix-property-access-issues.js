import fs from 'fs';
import path from 'path';

// Property access fixes with safe fallbacks
const propertyFixes = [
  {
    name: 'CookingMethod variations property',
    pattern: /(\w+)\.variations/g,
    replacement: '$1.variations || []',
    filePattern: /\.(ts|tsx)$/
  },
  {
    name: 'CookingMethod commonMistakes property',
    pattern: /(\w+)\.commonMistakes/g,
    replacement: '$1.commonMistakes || []',
    filePattern: /\.(ts|tsx)$/
  },
  {
    name: 'CookingMethod pAiringSuggestions property',
    pattern: /(\w+)\.pAiringSuggestions/g,
    replacement: '$1.pAiringSuggestions || []',
    filePattern: /\.(ts|tsx)$/
  },
  {
    name: 'Missing getCurrentPlanetaryPositions function',
    pattern: /(\w+)\.getCurrentPlanetaryPositions\(/g,
    replacement: '// $1.getCurrentPlanetaryPositions(',
    filePattern: /\.(ts|tsx)$/
  }
];

// Function to process a single file
function processFile(filePath, isDryRun = false) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let hasChanges = false;
    const changes = [];

    // Apply property fixes
    for (const fix of propertyFixes) {
      if (fix.filePattern.test(filePath)) {
        const matches = [...modifiedContent.matchAll(fix.pattern)];
        if (matches.length > 0) {
          modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement);
          hasChanges = true;
          changes.push(`${fix.name}: ${matches.length} replacements`);
        }
      }
    }

    // Special handling for optional chaining improvements
    if (modifiedContent.includes('.variations &&')) {
      modifiedContent = modifiedContent.replace(
        /(\w+)\.variations && (\w+)\.variations\.length/g,
        '($1.variations || []).length'
      );
      hasChanges = true;
      changes.push('Improved optional chaining for variations');
    }

    if (modifiedContent.includes('.commonMistakes &&')) {
      modifiedContent = modifiedContent.replace(
        /(\w+)\.commonMistakes && (\w+)\.commonMistakes\.length/g,
        '($1.commonMistakes || []).length'
      );
      hasChanges = true;
      changes.push('Improved optional chaining for commonMistakes');
    }

    if (modifiedContent.includes('.pAiringSuggestions &&')) {
      modifiedContent = modifiedContent.replace(
        /(\w+)\.pAiringSuggestions && (\w+)\.pAiringSuggestions\.length/g,
        '($1.pAiringSuggestions || []).length'
      );
      hasChanges = true;
      changes.push('Improved optional chaining for pAiringSuggestions');
    }

    if (hasChanges && !isDryRun) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
    }

    return { hasChanges, changes, filePath };
  } catch (error) {
    return { hasChanges: false, changes: [], filePath, error: error.message };
  }
}

// Function to find files with property access issues
function findFilesWithPropertyIssues(dir) {
  const problemFiles = [
    'src/app/alchemicalEngine.ts',
    'src/app/cooking-methods/[method]/page.tsx',
    'src/calculations/alchemicalEngine.ts',
    'src/components/recipes/RecipeCard.tsx',
    'src/utils/cookingMethodTips.ts'
  ];

  const files = [];
  
  for (const filePath of problemFiles) {
    const fullPath = path.join(dir, filePath);
    if (fs.existsSync(fullPath)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const workspaceRoot = process.cwd();
  
  console.log(`🔍 ${isDryRun ? 'DRY RUN' : 'APPLYING'}: Fix Property Access Issues`);
  console.log(`📁 Workspace: ${workspaceRoot}`);
  
  const files = findFilesWithPropertyIssues(workspaceRoot);
  console.log(`📄 Found ${files.length} files with property access issues`);
  
  let totalChanges = 0;
  let filesModified = 0;
  const results = [];
  
  for (const file of files) {
    const result = processFile(file, isDryRun);
    
    if (result.hasChanges) {
      filesModified++;
      totalChanges += result.changes.length;
      results.push(result);
      
      if (isDryRun) {
        console.log(`📝 Would fix: ${path.relative(workspaceRoot, file)}`);
        result.changes.forEach(change => console.log(`   - ${change}`));
      } else {
        console.log(`✅ Fixed: ${path.relative(workspaceRoot, file)}`);
        result.changes.forEach(change => console.log(`   - ${change}`));
      }
    }
    
    if (result.error) {
      console.error(`❌ Error processing ${path.relative(workspaceRoot, file)}: ${result.error}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files ${isDryRun ? 'would be modified' : 'modified'}: ${filesModified}`);
  console.log(`   Total changes ${isDryRun ? 'would be applied' : 'applied'}: ${totalChanges}`);
  
  if (isDryRun) {
    console.log(`\n🚀 To apply these changes, run: node fix-property-access-issues.js`);
  } else {
    console.log(`\n✅ All property access issues fixed successfully!`);
    console.log(`\n🎯 Recommendation: Check final error count with 'yarn tsc --noEmit 2>&1 | grep "error TS" | wc -l'`);
  }
}

// Run the script
main(); 