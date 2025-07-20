#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔍 Analyzing unused variables across the codebase...\n');

// Get ESLint output in JSON format
let lintOutput;
try {
  const output = execSync('yarn lint --format=json', { encoding: 'utf8', stdio: 'pipe' });
  lintOutput = JSON.parse(output);
} catch (error) {
  // ESLint returns non-zero exit code when there are errors, but we still get the output
  if (error.stdout) {
    try {
      lintOutput = JSON.parse(error.stdout);
    } catch (parseError) {
      console.error('Failed to parse ESLint output:', parseError.message);
      process.exit(1);
    }
  } else {
    console.error('Failed to run ESLint:', error.message);
    process.exit(1);
  }
}

// Categories for analysis
const categories = {
  unusedImports: [],
  unusedLocalVariables: [],
  unusedFunctionParameters: [],
  unusedReactHooks: [],
  unusedDestructuredVariables: [],
  unusedTypeDefinitions: [],
  astrologicalCalculationVariables: [],
  campaignSystemVariables: [],
  highImpactFiles: []
};

// File impact analysis
const fileImpactMap = new Map();

// Process each file's messages
lintOutput.forEach(file => {
  const filePath = file.filePath;
  const relativePath = filePath.replace(process.cwd(), '');
  
  // Count unused variable warnings per file
  const unusedVarMessages = file.messages.filter(msg => 
    msg.ruleId === '@typescript-eslint/no-unused-vars'
  );
  
  if (unusedVarMessages.length > 0) {
    fileImpactMap.set(relativePath, unusedVarMessages.length);
  }
  
  unusedVarMessages.forEach(message => {
    const entry = {
      file: relativePath,
      line: message.line,
      column: message.column,
      message: message.message,
      severity: message.severity === 1 ? 'warning' : 'error'
    };
    
    // Categorize by message content
    if (message.message.includes('is defined but never used') && message.message.includes('import')) {
      categories.unusedImports.push(entry);
    } else if (message.message.includes('is assigned a value but never used') && 
               (message.message.includes('useState') || message.message.includes('useEffect') || 
                message.message.includes('useMemo') || message.message.includes('useCallback'))) {
      categories.unusedReactHooks.push(entry);
    } else if (message.message.includes('is assigned a value but never used') && 
               message.message.includes('array destructuring')) {
      categories.unusedDestructuredVariables.push(entry);
    } else if (message.message.includes('is defined but never used') && 
               (relativePath.includes('/types/') || message.message.includes('interface') || message.message.includes('type'))) {
      categories.unusedTypeDefinitions.push(entry);
    } else if (message.message.includes('Allowed unused args must match')) {
      categories.unusedFunctionParameters.push(entry);
    } else if (message.message.includes('is assigned a value but never used') || 
               message.message.includes('is defined but never used')) {
      categories.unusedLocalVariables.push(entry);
    }
    
    // Check for astrological calculation files
    if (relativePath.includes('/calculations/') || 
        relativePath.includes('/astro') || 
        relativePath.includes('planetary') || 
        relativePath.includes('elemental') ||
        message.message.toLowerCase().includes('planet') ||
        message.message.toLowerCase().includes('astro') ||
        message.message.toLowerCase().includes('elemental')) {
      categories.astrologicalCalculationVariables.push(entry);
    }
    
    // Check for campaign system files
    if (relativePath.includes('/campaign/') || 
        relativePath.includes('Campaign') ||
        message.message.toLowerCase().includes('campaign')) {
      categories.campaignSystemVariables.push(entry);
    }
  });
});

// Identify high-impact files (>10 unused variables)
const highImpactFiles = Array.from(fileImpactMap.entries())
  .filter(([_, count]) => count >= 10)
  .sort((a, b) => b[1] - a[1]);

categories.highImpactFiles = highImpactFiles.map(([file, count]) => ({
  file,
  count,
  issues: lintOutput.find(f => f.filePath.includes(file))?.messages
    .filter(msg => msg.ruleId === '@typescript-eslint/no-unused-vars') || []
}));

// Generate comprehensive report
const report = {
  summary: {
    totalUnusedVariables: Object.values(categories).flat().length - categories.highImpactFiles.length,
    totalFiles: fileImpactMap.size,
    averagePerFile: Math.round((Object.values(categories).flat().length - categories.highImpactFiles.length) / fileImpactMap.size * 100) / 100
  },
  categories: {
    unusedImports: categories.unusedImports.length,
    unusedLocalVariables: categories.unusedLocalVariables.length,
    unusedFunctionParameters: categories.unusedFunctionParameters.length,
    unusedReactHooks: categories.unusedReactHooks.length,
    unusedDestructuredVariables: categories.unusedDestructuredVariables.length,
    unusedTypeDefinitions: categories.unusedTypeDefinitions.length
  },
  domainSpecific: {
    astrologicalCalculationVariables: categories.astrologicalCalculationVariables.length,
    campaignSystemVariables: categories.campaignSystemVariables.length
  },
  highImpactFiles: categories.highImpactFiles.length,
  detailedAnalysis: categories
};

// Write detailed report
fs.writeFileSync('unused-variables-detailed-analysis.json', JSON.stringify(report, null, 2));

// Console output
console.log('📊 UNUSED VARIABLES ANALYSIS SUMMARY');
console.log('=====================================');
console.log(`Total unused variables: ${report.summary.totalUnusedVariables}`);
console.log(`Files affected: ${report.summary.totalFiles}`);
console.log(`Average per file: ${report.summary.averagePerFile}`);
console.log('');

console.log('📋 CATEGORY BREAKDOWN');
console.log('=====================');
console.log(`Unused imports: ${report.categories.unusedImports}`);
console.log(`Unused local variables: ${report.categories.unusedLocalVariables}`);
console.log(`Unused function parameters: ${report.categories.unusedFunctionParameters}`);
console.log(`Unused React hooks: ${report.categories.unusedReactHooks}`);
console.log(`Unused destructured variables: ${report.categories.unusedDestructuredVariables}`);
console.log(`Unused type definitions: ${report.categories.unusedTypeDefinitions}`);
console.log('');

console.log('🔬 DOMAIN-SPECIFIC ANALYSIS');
console.log('============================');
console.log(`Astrological calculation variables: ${report.domainSpecific.astrologicalCalculationVariables}`);
console.log(`Campaign system variables: ${report.domainSpecific.campaignSystemVariables}`);
console.log('');

console.log('🎯 HIGH-IMPACT FILES (≥10 unused variables)');
console.log('=============================================');
if (categories.highImpactFiles.length > 0) {
  categories.highImpactFiles.slice(0, 10).forEach(({ file, count }) => {
    console.log(`${file}: ${count} unused variables`);
  });
  if (categories.highImpactFiles.length > 10) {
    console.log(`... and ${categories.highImpactFiles.length - 10} more files`);
  }
} else {
  console.log('No files with ≥10 unused variables found.');
}
console.log('');

console.log('🔍 CRITICAL ASTROLOGICAL FILES TO PRESERVE');
console.log('===========================================');
const astroFiles = categories.astrologicalCalculationVariables
  .reduce((acc, item) => {
    if (!acc[item.file]) acc[item.file] = 0;
    acc[item.file]++;
    return acc;
  }, {});

Object.entries(astroFiles).slice(0, 10).forEach(([file, count]) => {
  console.log(`${file}: ${count} variables (PRESERVE CAREFULLY)`);
});
console.log('');

console.log('💾 Detailed analysis saved to: unused-variables-detailed-analysis.json');
console.log('');

console.log('🎯 PRIORITY RECOMMENDATIONS');
console.log('============================');
console.log('1. Start with unused imports (safest to remove)');
console.log('2. Handle unused function parameters (prefix with _)');
console.log('3. Address unused destructured variables');
console.log('4. Carefully review astrological calculation variables');
console.log('5. Focus on high-impact files for maximum reduction');
console.log('');

console.log('✅ Analysis complete!');