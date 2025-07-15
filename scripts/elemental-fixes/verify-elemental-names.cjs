// Verify elemental names script
// This script checks for inconsistent usage of elemental names (fire, water, earth, Air)
// and helps verify that previous find/replace operations didn't cause issues

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the current directory
const rootDir = path.resolve(__dirname, '../..');

// Function to check for inconsistent elemental names
function checkElementalConsistency(content) {
  const issues = [];
  
  // Check for capitalized element names that should be lowercase
  const capitalizedElements = [
    { pattern: /\bFire\b(?!Brand)/g, correct: 'fire' }, // Avoid matching FireBrand
    { pattern: /\bWater\b/g, correct: 'water' },
    { pattern: /\bearth\b/g, correct: 'earth' },
    { pattern: /\bAir\b/g, correct: 'Air' }
  ];
  
  // Check for instances where capitalized element names still exist
  for (const { pattern, correct } of capitalizedElements) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      // Exclude matches in comments and strings
      const contextStart = Math.max(0, match.index - 50);
      const contextEnd = Math.min(content.length, match.index + 50);
      const context = content.substring(contextStart, contextEnd);
      
      // Skip if it's clearly in a comment or a non-element context
      if (context.includes('//') && context.indexOf('//', context.lastIndexOf('\n', match.index - contextStart)) < (match.index - contextStart)) {
        continue;
      }
      
      issues.push({
        found: match[0],
        correct,
        position: match.index,
        context
      });
    }
  }
  
  // Look for inconsistent usage in type definitions
  const typeDefinition = /type\s+Element\s*=\s*(['"].*?['"])/g;
  let typeMatch;
  while ((typeMatch = typeDefinition.exec(content)) !== null) {
    const typeDef = typeMatch[1];
    // Check for mix of capitalized and lowercase elements
    if ((typeDef.includes('fire') && typeDef.includes('Fire')) ||
        (typeDef.includes('water') && typeDef.includes('Water')) ||
        (typeDef.includes('earth') && typeDef.includes('earth')) ||
        (typeDef.includes('Air') && typeDef.includes('Air'))) {
      issues.push({
        found: typeDef,
        correct: 'Inconsistent element case in type definition',
        position: typeMatch.index,
        context: content.substring(
          Math.max(0, typeMatch.index - 50),
          Math.min(content.length, typeMatch.index + 150)
        )
      });
    }
  }
  
  // Look for inconsistent element object property usage
  const elementalProps = /(\{\s*[^{}]*?(?:fire|water|earth|Air|Fire|Water|earth|Air)\s*:[^{}]*?\})/g;
  let propsMatch;
  while ((propsMatch = elementalProps.exec(content)) !== null) {
    const props = propsMatch[1];
    
    // Check for mix of capitalized and lowercase elements
    const hasLowerFire = /\bfire\s*:/.test(props);
    const hasUpperFire = /\bFire\s*:/.test(props);
    const hasLowerWater = /\bwater\s*:/.test(props);
    const hasUpperWater = /\bWater\s*:/.test(props);
    const hasLowerearth = /\bearth\s*:/.test(props);
    const hasUpperearth = /\bearth\s*:/.test(props);
    const hasLowerAir = /\bAir\s*:/.test(props);
    const hasUpperAir = /\bAir\s*:/.test(props);
    
    if ((hasLowerFire && hasUpperFire) ||
        (hasLowerWater && hasUpperWater) ||
        (hasLowerearth && hasUpperearth) ||
        (hasLowerAir && hasUpperAir)) {
      issues.push({
        found: props,
        correct: 'Inconsistent element case in properties',
        position: propsMatch.index,
        context: content.substring(
          Math.max(0, propsMatch.index - 50),
          Math.min(content.length, propsMatch.index + 150)
        )
      });
    }
  }
  
  return issues;
}

// Get a list of files to process
function getFilesToProcess() {
  // Find all TypeScript and JavaScript files
  try {
    console.log('Finding files in src directory...');
    const output = execSync('find src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"').toString();
    const files = output.split('\n').filter(file => file.trim() !== '');
    console.log(`Found ${files.length} files to process`);
    return files;
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
}

// Main function
function main() {
  console.log('Starting elemental name verification...');
  const files = getFilesToProcess();

  let totalIssues = 0;
  const filesWithIssues = [];
  let processedFiles = 0;

  for (const file of files) {
    try {
      const filePath = path.join(rootDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = checkElementalConsistency(content);
      processedFiles++;

      if (processedFiles % 50 === 0) {
        console.log(`Processed ${processedFiles} files so far...`);
      }

      if (issues.length > 0) {
        totalIssues += issues.length;
        filesWithIssues.push({ file, issues });
        
        console.log(`\nIssues in ${file}:`);
        issues.forEach((issue, i) => {
          console.log(`  ${i + 1}. Found "${issue.found}" at position ${issue.position}`);
          console.log(`     Should be "${issue.correct}"`);
          console.log(`     Context: "${issue.context.replace(/\n/g, ' ')}"`);
        });
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error.message);
    }
  }

  console.log(`\nAnalysis completed. Processed ${processedFiles} files.`);
  console.log(`Found ${totalIssues} issues in ${filesWithIssues.length} files.`);
  
  if (totalIssues === 0) {
    console.log('Great! No inconsistencies found in elemental names.');
  } else {
    console.log('Please address the inconsistencies found in the elemental names.');
  }
}

main(); 