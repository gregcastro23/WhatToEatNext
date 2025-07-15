import fs from 'fs';
import path from 'path';

// Path to the file with syntax errors
const targetFile = path.resolve(process.cwd(), 'src/calculations/alchemicalEngine.ts');

// Function to run the script with a dry run option
function fixSpecificErrors(dryRun = true) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing specific syntax errors in alchemicalEngine.ts`);
  
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
  
  // Fix the specific errors identified by the TypeScript compiler
  
  // 1. Fix line 877 - incorrect parentheses structure
  content = content.replace(
    /if \(!horoscopeDict \|\| typeof horoscopeDict !== ['"]object['"]\) \|\| !horoscopeDict\.tropical\) \{/g,
    'if (!horoscopeDict || typeof horoscopeDict !== \'object\' || !horoscopeDict.tropical) {'
  );
  
  // 2. Fix line 1985 - error TS1109: Expression expected
  content = content.replace(
    /error\.message\.includes\(['"]invalid assignment['"]\)\)\) \{/g,
    'error.message.includes(\'invalid assignment\'))) {'
  );
  
  // 3. Fix the object structure issues in lines 2041-2056
  const problematicObject = /\s+alchemicalValues: \{(\s+Spirit: 0\.25,\s+Essence: 0\.25,\s+Matter: 0\.25,\s+Substance: 0\.25\s+)\},\s+calculationProps: \{(\s+heat: 0\.5,\s+entropy: 0\.5,\s+reactivity: 0\.5,\s+energy: 0\s+)\},\s+metadata: \{(\s+name: ".*",\s+description: ".*",\s+attributes: \[\]\s+)\}/g;
  
  const correctedObject = 
    '      alchemicalValues: {\n' +
    '        Spirit: 0.25,\n' +
    '        Essence: 0.25,\n' +
    '        Matter: 0.25,\n' +
    '        Substance: 0.25\n' +
    '      },\n' +
    '      calculationProps: {\n' +
    '        heat: 0.5,\n' +
    '        entropy: 0.5,\n' +
    '        reactivity: 0.5,\n' +
    '        energy: 0\n' +
    '      },\n' +
    '      metadata: {\n' +
    '        name: "Alchm NFT",\n' +
    '        description: "Fallback result due to deep cloning error.",\n' +
    '        attributes: []\n' +
    '      }';
  
  content = content.replace(problematicObject, correctedObject);
  
  // Fix any potential issues with elementalBalance objects
  const elementalBalancePattern = /Water: 0\.25, Earth: 0\.25, Air: 0\.25(\s+)\}/g;
  content = content.replace(elementalBalancePattern, 'Water: 0.25, Earth: 0.25, Air: 0.25 }');
  
  // Check if content has changed
  const hasChanges = content !== originalContent;
  
  if (hasChanges) {
    if (dryRun) {
      console.log('[DRY RUN] Specific changes detected. Run without --dry-run to apply fixes.');
    } else {
      // Write back to the file
      try {
        fs.writeFileSync(targetFile, content, 'utf8');
        console.log('Specific syntax errors fixed successfully!');
      } catch (error) {
        console.error(`Error writing file: ${error.message}`);
        process.exit(1);
      }
    }
  } else {
    console.log('No specific syntax errors detected or fixed.');
  }
}

// Parse command line arguments
const isDryRun = !process.argv.includes('--apply');

// Run the script
fixSpecificErrors(isDryRun);

console.log('Done!'); 