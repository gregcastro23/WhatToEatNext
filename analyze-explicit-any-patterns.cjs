#!/usr/bin/env node

/**
 * Comprehensive Explicit-Any Pattern Analysis
 *
 * Analyzes all explicit-any usage to understand patterns and identify safe fixes
 */

const fs = require('fs');
const { execSync } = require('child_process');

function analyzeExplicitAnyPatterns() {
  try {
    const output = execSync('yarn lint --format=unix 2>/dev/null | grep "@typescript-eslint/no-explicit-any"', { encoding: 'utf8' });
    const lines = output.trim().split('\n').filter(line => line);

    const analysis = {
      totalIssues: lines.length,
      fileStats: {},
      patternStats: {},
      contextStats: {},
      safetyAnalysis: {
        testFiles: 0,
        mockFunctions: 0,
        recordTypes: 0,
        functionParams: 0,
        variableAssignments: 0,
        returnTypes: 0,
        arrayTypes: 0
      }
    };

    lines.forEach(line => {
      const match = line.match(/^([^:]+):(\d+):(\d+):\s*(.+)$/);
      if (match) {
        const [, filePath, lineNum, colNum, message] = match;
        const fileName = filePath.split('/').pop();
        const isTestFile = fileName.includes('test') || fileName.includes('Test') || filePath.includes('__tests__');

        // File statistics
        analysis.fileStats[fileName] = (analysis.fileStats[fileName] || 0) + 1;

        // Context analysis
        if (isTestFile) {
          analysis.safetyAnalysis.testFiles++;
          analysis.contextStats['Test Files'] = (analysis.contextStats['Test Files'] || 0) + 1;
        } else if (filePath.includes('types/')) {
          analysis.contextStats['Type Definitions'] = (analysis.contextStats['Type Definitions'] || 0) + 1;
        } else if (filePath.includes('services/')) {
          analysis.contextStats['Services'] = (analysis.contextStats['Services'] || 0) + 1;
        } else if (filePath.includes('components/')) {
          analysis.contextStats['Components'] = (analysis.contextStats['Components'] || 0) + 1;
        } else if (filePath.includes('hooks/')) {
          analysis.contextStats['Hooks'] = (analysis.contextStats['Hooks'] || 0) + 1;
        } else {
          analysis.contextStats['Other'] = (analysis.contextStats['Other'] || 0) + 1;
        }

        // Try to read the actual line to understand the pattern
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const fileLines = fileContent.split('\n');
          const actualLine = fileLines[parseInt(lineNum) - 1];

          if (actualLine) {
            // Pattern analysis
            if (actualLine.includes('jest.MockedFunction<any>')) {
              analysis.safetyAnalysis.mockFunctions++;
              analysis.patternStats['Jest Mock Functions'] = (analysis.patternStats['Jest Mock Functions'] || 0) + 1;
            } else if (actualLine.includes('Record<string, any>')) {
              analysis.safetyAnalysis.recordTypes++;
              analysis.patternStats['Record<string, any>'] = (analysis.patternStats['Record<string, any>'] || 0) + 1;
            } else if (actualLine.match(/\([^)]*:\s*any\s*\)/)) {
              analysis.safetyAnalysis.functionParams++;
              analysis.patternStats['Function Parameters'] = (analysis.patternStats['Function Parameters'] || 0) + 1;
            } else if (actualLine.match(/:\s*any\s*=/)) {
              analysis.safetyAnalysis.variableAssignments++;
              analysis.patternStats['Variable Assignments'] = (analysis.patternStats['Variable Assignments'] || 0) + 1;
            } else if (actualLine.match(/\):\s*any/)) {
              analysis.safetyAnalysis.returnTypes++;
              analysis.patternStats['Return Types'] = (analysis.patternStats['Return Types'] || 0) + 1;
            } else if (actualLine.includes('any[]') || actualLine.includes('Array<any>')) {
              analysis.safetyAnalysis.arrayTypes++;
              analysis.patternStats['Array Types'] = (analysis.patternStats['Array Types'] || 0) + 1;
            } else {
              analysis.patternStats['Other Patterns'] = (analysis.patternStats['Other Patterns'] || 0) + 1;
            }
          }
        } catch (error) {
          // Skip files we can't read
        }
      }
    });

    return analysis;
  } catch (error) {
    console.log('Error analyzing patterns:', error.message);
    return null;
  }
}

function generateRecommendations(analysis) {
  const recommendations = [];

  // Calculate percentages
  const testFilePercentage = (analysis.safetyAnalysis.testFiles / analysis.totalIssues * 100).toFixed(1);
  const mockFunctionPercentage = (analysis.safetyAnalysis.mockFunctions / analysis.totalIssues * 100).toFixed(1);

  if (analysis.safetyAnalysis.testFiles > analysis.totalIssues * 0.3) {
    recommendations.push(`🧪 ${testFilePercentage}% of issues are in test files - these may be intentionally flexible`);
  }

  if (analysis.safetyAnalysis.mockFunctions > 50) {
    recommendations.push(`🎭 ${analysis.safetyAnalysis.mockFunctions} Jest mock functions could use more specific typing`);
  }

  if (analysis.safetyAnalysis.recordTypes > 20) {
    recommendations.push(`📝 ${analysis.safetyAnalysis.recordTypes} Record<string, any> types - many may be correct for dynamic data`);
  }

  if (analysis.safetyAnalysis.arrayTypes > 10) {
    recommendations.push(`📋 ${analysis.safetyAnalysis.arrayTypes} array types could potentially be changed to unknown[]`);
  }

  // Strategic recommendations
  const nonTestIssues = analysis.totalIssues - analysis.safetyAnalysis.testFiles;
  if (nonTestIssues < analysis.totalIssues * 0.5) {
    recommendations.push(`🎯 Focus on non-test files (${nonTestIssues} issues) for maximum impact`);
  }

  return recommendations;
}

console.log('🔍 Comprehensive Explicit-Any Pattern Analysis');
console.log('===============================================');

const analysis = analyzeExplicitAnyPatterns();

if (analysis) {
  console.log(`\n📊 Overall Statistics:`);
  console.log(`   Total explicit-any issues: ${analysis.totalIssues}`);
  console.log(`   Files affected: ${Object.keys(analysis.fileStats).length}`);

  console.log(`\n🏆 Top 10 Files with Issues:`);
  Object.entries(analysis.fileStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([file, count]) => {
      const percentage = (count / analysis.totalIssues * 100).toFixed(1);
      console.log(`   ${file}: ${count} issues (${percentage}%)`);
    });

  console.log(`\n🔍 Pattern Breakdown:`);
  Object.entries(analysis.patternStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([pattern, count]) => {
      const percentage = (count / analysis.totalIssues * 100).toFixed(1);
      console.log(`   ${pattern}: ${count} issues (${percentage}%)`);
    });

  console.log(`\n📁 Context Distribution:`);
  Object.entries(analysis.contextStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([context, count]) => {
      const percentage = (count / analysis.totalIssues * 100).toFixed(1);
      console.log(`   ${context}: ${count} issues (${percentage}%)`);
    });

  console.log(`\n🛡️ Safety Analysis:`);
  console.log(`   Test files: ${analysis.safetyAnalysis.testFiles} issues (${(analysis.safetyAnalysis.testFiles / analysis.totalIssues * 100).toFixed(1)}%)`);
  console.log(`   Mock functions: ${analysis.safetyAnalysis.mockFunctions} issues`);
  console.log(`   Record types: ${analysis.safetyAnalysis.recordTypes} issues`);
  console.log(`   Function parameters: ${analysis.safetyAnalysis.functionParams} issues`);
  console.log(`   Variable assignments: ${analysis.safetyAnalysis.variableAssignments} issues`);
  console.log(`   Return types: ${analysis.safetyAnalysis.returnTypes} issues`);
  console.log(`   Array types: ${analysis.safetyAnalysis.arrayTypes} issues`);

  const recommendations = generateRecommendations(analysis);
  console.log(`\n💡 Strategic Recommendations:`);
  recommendations.forEach(rec => console.log(`   ${rec}`));

  // Calculate realistic reduction target
  const potentialReduction = analysis.safetyAnalysis.arrayTypes +
                           Math.floor(analysis.safetyAnalysis.recordTypes * 0.3) +
                           Math.floor(analysis.safetyAnalysis.variableAssignments * 0.2);

  console.log(`\n🎯 Realistic Reduction Target:`);
  console.log(`   Conservative estimate: ${potentialReduction} issues (${(potentialReduction / analysis.totalIssues * 100).toFixed(1)}%)`);
  console.log(`   This would reduce from ${analysis.totalIssues} to ${analysis.totalIssues - potentialReduction} issues`);

  console.log(`\n📋 Next Steps:`);
  console.log(`   1. Focus on array types (safest to change)`);
  console.log(`   2. Review Record<string, any> usage case by case`);
  console.log(`   3. Consider if test file any types are acceptable`);
  console.log(`   4. Create specific type interfaces for service layers`);
  console.log(`   5. Document intentional any usage with comments`);
}
