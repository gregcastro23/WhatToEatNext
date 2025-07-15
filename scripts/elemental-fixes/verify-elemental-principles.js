// Elemental Principles Verification Script
// This script checks if the codebase follows the elemental principles correctly:
// - No opposing elements
// - Elements reinforce themselves
// - All element combinations can work together
// - No elemental "balancing"

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');

// Problematic patterns to look for
const PROBLEMATIC_PATTERNS = [
  // Opposing elements
  { 
    pattern: /(?:Fire\s+(?:opposes|opposite|versus|vs\.?|against)\s+Water)|(?:Water\s+(?:opposes|opposite|versus|vs\.?|against)\s+Fire)/gi,
    issue: 'Fire and Water being treated as opposites',
    principle: 'No Opposing Elements'
  },
  { 
    pattern: /(?:earth\s+(?:opposes|opposite|versus|vs\.?|against)\s+Air)|(?:Air\s+(?:opposes|opposite|versus|vs\.?|against)\s+earth)/gi,
    issue: 'earth and Air being treated as opposites',
    principle: 'No Opposing Elements'
  },
  // Balancing elements
  {
    pattern: /balance(?:d|s|ing)?\s+(?:Fire\s+with\s+Water|Water\s+with\s+Fire)/gi,
    issue: 'Attempting to balance Fire with Water',
    principle: 'No Elemental Balancing'
  },
  {
    pattern: /balance(?:d|s|ing)?\s+(?:earth\s+with\s+Air|Air\s+with\s+earth)/gi,
    issue: 'Attempting to balance earth with Air',
    principle: 'No Elemental Balancing'
  },
  // Compatibility scores below threshold
  {
    pattern: /compatibility(?:\s*=\s*|\s*:\s*|\s*>\s*|\s*<\s*)(?:0\.[0-6]\d*|\d\.\d\d*e-\d+|[0-5]\.?\d*e-\d+)/g,
    issue: 'Element compatibility score below 0.7',
    principle: 'All Element Combinations Can Work Together'
  },
  // Objects/maps with opposing elements
  {
    pattern: /(?:const|let|var)\s+(?:\w+)?\s*(?:opposite|opposing|contrary)(?:Element)?s?\s*=\s*{/g,
    issue: 'Creation of opposite/opposing elements object/map',
    principle: 'No Opposing Elements'
  },
  // Functions getting opposing elements
  {
    pattern: /(?:function|const)\s+(?:get|find|calculate|determine)(?:Opposite|Opposing|Contrary)(?:Element)?/g,
    issue: 'Function to get opposite/opposing elements',
    principle: 'No Opposing Elements'
  },
];

// Directories to scan
const DIRS_TO_SCAN = [
  'src/calculations',
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/data/unified',
  'src/components/recommendations',
  'src/components/FoodRecommender',
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  /\.test\./,
  /\.spec\./,
  /__tests__/,
  /node_modules/,
  /\.d\.ts$/,
];

// Get all relevant files
console.log(`Finding files in: ${DIRS_TO_SCAN.join(', ')}`);
const files = DIRS_TO_SCAN.flatMap(dir => 
  globSync(`${dir}/**/*.{ts,tsx,js,jsx}`, { ignore: ['**/node_modules/**'] })
);

console.log(`\nVerifying elemental principles in ${files.length} files...`);

// Track issues
const issuesFound = [];
let totalIssues = 0;

// Process each file
files.forEach(filePath => {
  // Skip excluded files
  if (EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath))) {
    if (isVerbose) {
      console.log(`Skipping excluded file: ${filePath}`);
    }
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileIssues = [];

    // Check for each problematic pattern
    PROBLEMATIC_PATTERNS.forEach(({ pattern, issue, principle }) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        totalIssues += matches.length;
        
        // Find line numbers for each match
        let line = 1;
        const lines = content.split('\n');
        const matchLocations = [];
        
        for (let i = 0; i < lines.length; i++) {
          if (pattern.test(lines[i])) {
            matchLocations.push({
              line: i + 1,
              text: lines[i].trim()
            });
          }
        }
        
        fileIssues.push({
          issue,
          principle,
          count: matches.length,
          locations: matchLocations
        });
      }
    });

    if (fileIssues.length > 0) {
      issuesFound.push({
        file: filePath,
        issues: fileIssues
      });
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
});

// Print results
console.log('\n===== ELEMENTAL PRINCIPLES VERIFICATION REPORT =====');
console.log(`Total files checked: ${files.length}`);
console.log(`Files with issues: ${issuesFound.length}`);
console.log(`Total issues found: ${totalIssues}`);

if (issuesFound.length > 0) {
  console.log('\nIssues by file:');
  issuesFound.forEach(({ file, issues }) => {
    console.log(`\nFile: ${file}`);
    issues.forEach(({ issue, principle, count, locations }) => {
      console.log(`  - Issue: ${issue} (Violates: ${principle})`);
      console.log(`    Found ${count} occurrence${count > 1 ? 's' : ''}`);
      
      if (isVerbose) {
        console.log('    Locations:');
        locations.forEach(({ line, text }) => {
          console.log(`      Line ${line}: ${text}`);
        });
      }
    });
  });
}

// Save report to file
const reportData = {
  timestamp: new Date().toISOString(),
  totalFilesChecked: files.length,
  filesWithIssues: issuesFound.length,
  totalIssues,
  details: issuesFound
};

const reportPath = path.join(process.cwd(), 'elemental-principles-report.json');
fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
console.log(`\nDetailed report saved to: ${reportPath}`);

if (issuesFound.length > 0) {
  console.log('\nRecommendation:');
  console.log('1. Review the issues in the report');
  console.log('2. Fix the violations manually or use the fix script:');
  console.log('   node scripts/elemental-fixes/fix-elemental-principles.js');
} else {
  console.log('\n✅ No elemental principles violations found!');
}

console.log('\nDone!'); 