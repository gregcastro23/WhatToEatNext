/**
 * Lint Error Analysis Script
 * 
 * This script safely analyzes ESLint errors in the codebase without modifying any files.
 * It categorizes errors by type and generates a detailed report to guide the fixing process.
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory equivalent to __dirname in CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const REPORT_DIR = path.join(__dirname, '..', 'lint-reports');
const REPORT_FILE = path.join(REPORT_DIR, `lint-analysis-${new Date().toISOString().replace(/:/g, '-')}.txt`);

// Ensure the report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

/**
 * Runs ESLint and captures the output
 * @returns {string} Raw ESLint output
 */
function runESLint() {
  console.log('Running ESLint to gather errors...');
  try {
    // Use --quiet to only show errors (not warnings)
    const eslintProcess = spawnSync('npx', ['eslint', 'src', '--quiet'], { 
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large output
    });
    
    if (eslintProcess.error) {
      console.error('Error running ESLint:', eslintProcess.error);
      return '';
    }
    
    return eslintProcess.stdout || eslintProcess.stderr || '';
  } catch (error) {
    console.error('Error executing ESLint:', error);
    return '';
  }
}

/**
 * Process ESLint output and categorize errors
 * @param {string} eslintOutput - Raw ESLint output
 */
function processOutput(eslintOutput) {
  console.log('Processing ESLint output...');
  
  // Categories to track
  const errors = {
    total: 0,
    byCategory: {
      parsing: { count: 0, files: {} },
      constAssign: { count: 0, files: {} },
      importDuplicates: { count: 0, files: {} },
      mergeConflict: { count: 0, files: {} },
      other: { count: 0, files: {} }
    },
    filesList: {}
  };

  let currentFile = null;
  const lines = eslintOutput.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this is a file path line
    if (line.startsWith('/')) {
      currentFile = line;
      errors.filesList[currentFile] = { count: 0, categories: {} };
      continue;
    }
    
    // Skip lines that don't contain errors
    if (!currentFile || !line.includes('error')) continue;
    
    // Increase error counts
    errors.total++;
    errors.filesList[currentFile].count = (errors.filesList[currentFile].count || 0) + 1;
    
    // Parse the error line to extract details
    // Format is typically: "   123:45  error  Error message  rule-id"
    const errorMatch = line.match(/^\s*(\d+):(\d+)\s+error\s+(.*?)\s+([a-z\/-]+)$/);
    
    if (errorMatch) {
      const [_, lineNum, colNum, message, ruleId] = errorMatch;
      
      // Determine error category based on rule ID or message content
      let category = 'other';
      
      if (ruleId === 'no-const-assign') {
        category = 'constAssign';
      } else if (ruleId === 'import/no-duplicates') {
        category = 'importDuplicates';
      } else if (message.includes('Parsing error')) {
        category = 'parsing';
      } else if (message.includes('Merge conflict marker encountered')) {
        category = 'mergeConflict';
      }
      
      // Add to category counts
      errors.byCategory[category].count++;
      
      // Initialize category in file if needed
      if (!errors.filesList[currentFile].categories[category]) {
        errors.filesList[currentFile].categories[category] = 0;
      }
      errors.filesList[currentFile].categories[category]++;
      
      // Initialize file in category tracking if needed
      if (!errors.byCategory[category].files[currentFile]) {
        errors.byCategory[category].files[currentFile] = [];
      }
      
      // Add error details
      errors.byCategory[category].files[currentFile].push({
        line: lineNum,
        column: colNum,
        message,
        ruleId
      });
    }
  }
  
  return errors;
}

/**
 * Generate a comprehensive report from the error analysis
 */
function generateReport(errors) {
  const report = [];
  
  // Header
  report.push('===============================================');
  report.push('            LINT ERROR ANALYSIS REPORT        ');
  report.push('===============================================');
  report.push('');
  
  // Summary statistics
  report.push(`Total errors: ${errors.total}`);
  report.push(`Total files with errors: ${Object.keys(errors.filesList).length}`);
  report.push('');
  
  // Breakdown by category
  report.push('ERROR BREAKDOWN BY CATEGORY:');
  report.push(`Parsing errors: ${errors.byCategory.parsing.count}`);
  report.push(`Constant reassignment errors: ${errors.byCategory.constAssign.count}`);
  report.push(`Import duplication errors: ${errors.byCategory.importDuplicates.count}`);
  report.push(`Merge conflict errors: ${errors.byCategory.mergeConflict.count}`);
  report.push(`Other errors: ${errors.byCategory.other.count}`);
  report.push('');
  
  // Files with merge conflicts (highest priority)
  if (errors.byCategory.mergeConflict.count > 0) {
    report.push('FILES WITH MERGE CONFLICTS:');
    Object.keys(errors.byCategory.mergeConflict.files).forEach((file, index) => {
      report.push(`${index + 1}. ${file}`);
    });
    report.push('');
  }
  
  // Files with parsing errors (next priority)
  if (errors.byCategory.parsing.count > 0) {
    report.push('FILES WITH PARSING ERRORS:');
    Object.keys(errors.byCategory.parsing.files).forEach((file, index) => {
      const errorCount = errors.byCategory.parsing.files[file].length;
      report.push(`${index + 1}. ${file} (${errorCount} errors)`);
    });
    report.push('');
  }
  
  // Files with constant reassignment errors
  if (errors.byCategory.constAssign.count > 0) {
    report.push('FILES WITH CONSTANT REASSIGNMENT ERRORS:');
    Object.keys(errors.byCategory.constAssign.files).forEach((file, index) => {
      const errorCount = errors.byCategory.constAssign.files[file].length;
      report.push(`${index + 1}. ${file} (${errorCount} errors)`);
    });
    report.push('');
  }

  // Files with import duplication errors
  if (errors.byCategory.importDuplicates.count > 0) {
    report.push('FILES WITH IMPORT DUPLICATION ERRORS:');
    Object.keys(errors.byCategory.importDuplicates.files).forEach((file, index) => {
      const errorCount = errors.byCategory.importDuplicates.files[file].length;
      report.push(`${index + 1}. ${file} (${errorCount} errors)`);
    });
    report.push('');
  }
  
  // Top files by number of errors
  report.push('TOP 20 FILES BY ERROR COUNT:');
  const sortedFiles = Object.entries(errors.filesList)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20);
  
  sortedFiles.forEach(([file, fileInfo], index) => {
    report.push(`${index + 1}. ${file} (${fileInfo.count} errors)`);
    
    // Add category breakdown for each file
    Object.entries(fileInfo.categories || {}).forEach(([category, count]) => {
      const categoryName = 
        category === 'parsing' ? 'Parsing errors' :
        category === 'constAssign' ? 'Const assign errors' :
        category === 'importDuplicates' ? 'Import duplicate errors' :
        category === 'mergeConflict' ? 'Merge conflict errors' :
        'Other errors';
      
      report.push(`   - ${categoryName}: ${count}`);
    });
  });
  
  return report.join('\n');
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Starting lint error analysis...');
    
    // Run ESLint and get output
    const output = runESLint();
    if (!output) {
      console.error('No output from ESLint.');
      return { success: false, error: 'No output from ESLint' };
    }
    
    // Process the output
    const errors = processOutput(output);
    
    // Generate the report
    const report = generateReport(errors);
    
    // Save the report
    fs.writeFileSync(REPORT_FILE, report);
    
    console.log(`Analysis complete! Report saved to: ${REPORT_FILE}`);
    console.log('\nReport Summary:');
    console.log(`Total errors: ${errors.total}`);
    console.log(`Parsing errors: ${errors.byCategory.parsing.count}`);
    console.log(`Constant reassignment errors: ${errors.byCategory.constAssign.count}`);
    console.log(`Import duplication errors: ${errors.byCategory.importDuplicates.count}`);
    console.log(`Merge conflict errors: ${errors.byCategory.mergeConflict.count}`);
    
    // If there are critical errors, highlight them
    if (errors.byCategory.mergeConflict.count > 0) {
      console.log('\nWARNING: Found merge conflicts that need to be resolved:');
      Object.keys(errors.byCategory.mergeConflict.files).forEach(file => {
        console.log(`- ${file}`);
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error during analysis:', error);
    return { success: false, error: error.message };
  }
}

// Execute main function
main(); 