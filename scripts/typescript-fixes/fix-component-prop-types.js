#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const targetDir = args.find(arg => !arg.startsWith('--')) || 'src/components/FoodRecommender';

// Helper to log with optional dry run indicator
function logChange(message, isDryRun) {
  console.log(`  ${isDryRun ? '[DRY RUN] Would ' : ''}${message}`);
}

// Find component files in directory
function findComponentFiles(directory) {
  try {
    // Use find command to locate TypeScript/JavaScript component files
    const cmd = `find ${directory} -type f -name "*.tsx" -o -name "*.jsx" | grep -v "node_modules" | grep -v ".next"`;
    const output = execSync(cmd, { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error(`Error finding component files:`, error);
    return [];
  }
}

// Add missing Props interface to a React component
function addPropsInterface(content, componentName) {
  // Skip if component already has a Props interface
  if (content.includes(`interface ${componentName}Props`) || 
      content.includes(`type ${componentName}Props`)) {
    return content;
  }
  
  // Find the component definition
  const funcCompPattern = new RegExp(`(export\\s+)?(?:const|function)\\s+${componentName}\\s*=?\\s*\\(([^)]+)\\)`, 'g');
  const funcCompMatch = funcCompPattern.exec(content);
  
  if (!funcCompMatch) {
    return content;
  }
  
  const paramList = funcCompMatch[2];
  
  // Parse the parameter list to extract potential prop destructuring
  const props = [];
  const propsPattern = /{\s*([^}]+)\s*}(?:\s*:\s*([^)]+))?/;
  const propsMatch = propsPattern.exec(paramList);
  
  if (propsMatch) {
    // Extract destructured props
    const propsList = propsMatch[1]
      .split(',')
      .map(prop => prop.trim())
      .filter(Boolean);
    
    // Create props for each destructured property
    propsList.forEach(prop => {
      // Handle prop with default value
      const [propName, defaultValue] = prop.split('=').map(p => p.trim());
      // Handle prop with type annotation
      const [basePropName, typeName] = propName.split(':').map(p => p.trim());
      
      props.push({
        name: basePropName,
        type: typeName || 'any',
        required: !defaultValue && !propName.includes('?')
      });
    });
  }
  
  // Create the Props interface
  const propsInterface = `
interface ${componentName}Props {
${props.map(prop => `  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};`).join('\n')}
}
`;
  
  // Add the interface before the component definition
  const componentDefIndex = content.indexOf(funcCompMatch[0]);
  if (componentDefIndex === -1) {
    return content;
  }
  
  // Find an appropriate insertion point (after imports and before component)
  const lastImportIndex = content.lastIndexOf('import', componentDefIndex);
  const lastImportEndIndex = lastImportIndex !== -1 ? 
    content.indexOf(';', lastImportIndex) + 1 : 
    0;
  
  // Add an empty line after imports if needed
  const insertionPoint = lastImportEndIndex > 0 ? 
    lastImportEndIndex + (content.charAt(lastImportEndIndex) === '\n' ? 0 : 1) : 
    0;
  
  // Insert the props interface
  const updatedContent = 
    content.slice(0, insertionPoint) + 
    propsInterface + 
    content.slice(insertionPoint);
  
  // Update the component definition to use the Props interface
  const originalDef = funcCompMatch[0];
  const updatedDef = originalDef.replace(
    /\(([^)]+)\)/,
    (_, params) => {
      if (params.includes(':')) {
        // Already has type annotations
        return `(${params})`;
      } else if (params.trim() === '{') {
        // Empty props
        return `(props: ${componentName}Props)`;
      } else if (params.includes('{')) {
        // Destructured props
        return `(${params.replace('{', `{ `)}: ${componentName}Props)`;
      } else {
        // Simple props parameter
        return `(${params}: ${componentName}Props)`;
      }
    }
  );
  
  return updatedContent.replace(originalDef, updatedDef);
}

// Extract component name from file path
function getComponentNameFromPath(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  
  // Handle index files - use parent directory name
  if (fileName === 'index') {
    const dirName = path.basename(path.dirname(filePath));
    return dirName.charAt(0).toUpperCase() + dirName.slice(1);
  }
  
  return fileName;
}

// Process a component file
function processComponentFile(filePath, isDryRun) {
  console.log(`Processing ${filePath}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const componentName = getComponentNameFromPath(filePath);
    
    // Skip if we can't identify a component name
    if (!componentName) {
      console.log('  Could not determine component name, skipping');
      return;
    }
    
    // Add Props interface
    const updatedContent = addPropsInterface(content, componentName);
    
    if (updatedContent !== content) {
      if (isDryRun) {
        logChange(`add ${componentName}Props interface`, isDryRun);
      } else {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        logChange(`added ${componentName}Props interface`, false);
      }
    } else {
      console.log(`  No changes needed for ${componentName}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main execution function
function main() {
  console.log(`Running in ${isDryRun ? 'DRY RUN' : 'LIVE'} mode`);
  console.log(`Looking for component files in ${targetDir}...`);
  
  const componentFiles = findComponentFiles(targetDir);
  console.log(`Found ${componentFiles.length} component files`);
  
  // Process each component file
  componentFiles.forEach(filePath => {
    processComponentFile(filePath, isDryRun);
  });
}

// Run the script
main(); 