const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

const SRC_DIR = path.resolve(process.cwd(), 'src')
const TARGET_FILE = path.resolve(SRC_DIR, 'services/ElementalCalculator.ts')

// Helper to compute relative path between files
function calculateRelativePath(fromFilePath, toModulePath) {
  // Remove the @/ prefix and add src/ to get the actual file path
  const actualModulePath = path.join(SRC_DIR, toModulePath.replace(/^@\//, '))
  
  // Get the directory of the importing file
  const fromFileDir = path.dirname(fromFilePath)
  
  // Calculate the relative path from the importing file to the module
  let relativePath = path.relative(fromFileDir, actualModulePath)
  
  // Ensure it starts with ./ or ../ 
  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`
  }
  
  // Remove file extension if present
  const moduleDir = path.dirname(actualModulePath)
  const moduleBasename = path.basename(actualModulePath, path.extname(actualModulePath))
  
  // Check if the import is for a directory or a file
  if (fs.existsSync(actualModulePath)) {
    // It's a file - keep the path as is
    return relativePath
  } else if (fs.existsSync(path.join(moduleDir, moduleBasename, 'index.ts')) || 
             fs.existsSync(path.join(moduleDir, moduleBasename, 'index.tsx')) ||
             fs.existsSync(path.join(moduleDir, moduleBasename, 'index.js')) ||
             fs.existsSync(path.join(moduleDir, moduleBasename, 'index.jsx'))) {
    // It's a directory with an index file
    return relativePath
  } else if (fs.existsSync(moduleDir)) {
    // It's a directory without an index file
    return relativePath
  }
  
  // Module doesn't exist, keep the original import
  console.warn(`Warning: Could not resolve module ${toModulePath}`)
  return null
}

// Process a single file
async function processFile(filePath) {
  try {
    // Create a backup of the original file
    const originalContent = await readFileAsync(filePath, 'utf8')
    const backupPath = `${filePath}.bak`
    await writeFileAsync(backupPath, originalContent, 'utf8')
    console.log(`Created backup at ${backupPath}`)
    
    // Show original content for before/after comparison
    console.log("\nBEFORE CONVERSION:")
    console.log("-----------------")
    console.log(originalContent.split('\n').slice(0, 10).join('\n'))
    
    // Regex to match imports from '@/...'
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+[a-zA-Z0-9_]+|[a-zA-Z0-9_]+)\s+from\s+['"](@\/[^'"]+)['"]/g
    
    let match
    let updatedContent = originalContent
    let changes = 0
    
    const matches = []
    while ((match = importRegex.exec(originalContent)) !== null) {
      matches.push({
        fullMatch: match[0]
        modulePath: match[1]
      })
    }
    
    console.log("\nCONVERSIONS:")
    console.log("------------")
    
    for (const { fullMatch, modulePath } of matches) {
      const relativePath = calculateRelativePath(filePath, modulePath)
      
      if (relativePath) {
        const updatedImport = fullMatch.replace(modulePath, relativePath)
        updatedContent = updatedContent.replace(fullMatch, updatedImport)
        changes++
        console.log(`${modulePath} -> ${relativePath}`)
      }
    }
    
    // Write the updated file
    await writeFileAsync(filePath, updatedContent, 'utf8')
    console.log(`\nUpdated ${changes} imports in ${filePath}`)
    
    // Show updated content for comparison
    console.log("\nAFTER CONVERSION:")
    console.log("-----------------")
    console.log(updatedContent.split('\n').slice(0, 10).join('\n'))
    
    console.log("\nTo revert changes if needed: cp", backupPath, filePath)
    
    return changes
  } catch (error) {
    console.error(`Error processing file ${filePath}, error)
    return 0
  }
}

// Main execution function
async function run() {
  try {
    console.log(`Converting imports in: ${TARGET_FILE}`)
    
    const changes = await processFile(TARGET_FILE)
    
    console.log(`\nConversion completed! Made ${changes} import changes.`)
  } catch (error) {
    console.error('Error running script:', error)
    process.exit(1)
  }
}

// Execute the script
run(); 