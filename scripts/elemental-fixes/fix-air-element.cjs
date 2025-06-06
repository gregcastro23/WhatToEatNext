// Fix Air to Air script
// This script finds and replaces the element name "Air" with "Air"
// while being careful to only target the elemental usage

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the current directory
const rootDir = path.resolve(__dirname, '../..');

// Function to safely replace Air with Air when it's used as an element
function replaceAirElement(content) {
  // Regex patterns to match Air as an element
  const patterns = [
    // Type definitions
    /(type\s+Element\s*=\s*['"][^'"]*['"]|['"][^'"]*['"]|['"]Air['"])/g,
    // In object properties with other elements
    /(\{\s*[^{}]*)(Air)(\s*:)/g,
    // Element assignments
    /(element\s*:\s*['"])Air(['"])/g,
    // Air as a key in property access
    /(\.\s*)Air(\s*[^\w])/g,
    // Replacing 'Air' in any context related to elements when pAired with other elements
    /(fire|water|earth|earth|['"]fire['"]|['"]water['"]|['"]earth['"]|['"]earth['"])[^.]{0,30}['"]Air['"]/g,
    // Diurnal and nocturnal elements
    /(diurnal|nocturnal)\s*:\s*['"]Air['"]/g,
    // In arrays of elements
    /(\[[^\]]*['"])(Air)(['"][^\]]*\])/g
  ];

  let modifiedContent = content;
  
  // Replace each pattern
  for (const pattern of patterns) {
    modifiedContent = modifiedContent.replace(pattern, (match, p1, p2, p3) => {
      // If we have Air in the middle, replace it
      if (p2 === 'Air') {
        return `${p1}Air${p3 || ''}`;
      }
      // For type definitions and other patterns
      return match.replace(/['"]Air['"]/g, '"Air"');
    });
  }

  // Edge cases we need to handle manually
  modifiedContent = modifiedContent
    // Fix property access
    .replace(/\bAir\s*>/g, 'Air >')
    .replace(/\bAir\s*</g, 'Air <')
    // Fix warning messages
    .replace(/High Air energy/g, 'High Air energy')
    // Fix comments that refer to the element
    .replace(/\/\/\s*.*Air-aligned/g, match => match.replace('Air', 'Air'))
    .replace(/\/\*\*\s*Air-aligned/g, match => match.replace('Air', 'Air'));

  return modifiedContent;
}

// Get a list of files to process
function getFilesToProcess() {
  // Find all files containing 'Air' in the src directory
  try {
    const output = execSync('grep -l "Air" $(find src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx")').toString();
    return output.split('\n').filter(file => file.trim() !== '');
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
}

// Main function
function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(isDryRun ? 'Running in dry-run mode' : 'Running in actual mode');

  const files = getFilesToProcess();
  console.log(`Found ${files.length} files to process`);

  let changedFiles = 0;

  for (const file of files) {
    try {
      const filePath = path.join(rootDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const modifiedContent = replaceAirElement(content);

      if (content !== modifiedContent) {
        changedFiles++;
        console.log(`Changes needed in: ${file}`);
        
        if (!isDryRun) {
          fs.writeFileSync(filePath, modifiedContent, 'utf8');
          console.log(`Updated: ${file}`);
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error.message);
    }
  }

  console.log(`Process completed. ${changedFiles} files needed changes.`);
  
  if (isDryRun) {
    console.log('This was a dry run. No files were modified. Run without --dry-run to apply changes.');
  } else {
    console.log('All changes have been applied.');
  }
}

main(); 