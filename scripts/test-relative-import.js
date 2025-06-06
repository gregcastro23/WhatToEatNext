const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

const SRC_DIR = path.resolve(process.cwd(), 'src')
const TEST_FILES = [
  path.resolve(SRC_DIR, 'App.tsx')
  path.resolve(SRC_DIR, 'services/AstrologicalService.ts')
]

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
    const content = await readFileAsync(filePath, 'utf8')
    
    // Before content for comparison
    console.log(`\n\nTESTING FILE: ${path.relative(process.cwd(), filePath)}`)
    console.log("BEFORE CONVERSION:")
    console.log("-----------------")
    console.log(content.split('\n').slice(0, 15).join('\n'))
    
    // Regex to match imports from '@/...'
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+[a-zA-Z0-9_]+|[a-zA-Z0-9_]+)\s+from\s+['"](@\/[^'"]+)['"]/g
    
    let match
    let updatedContent = content
    let changes = 0
    
    const matches = []
    while ((match = importRegex.exec(content)) !== null) {
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
    
    // Don't write the file, just show the changes
    console.log(`\nWould update ${changes} imports in ${filePath}`)
    
    // After content for comparison
    console.log("\nAFTER CONVERSION:")
    console.log("-----------------")
    console.log(updatedContent.split('\n').slice(0, 15).join('\n'))
    
    return changes
  } catch (error) {
    console.error(`Error processing file ${filePath}, error)
    return 0
  }
}

// Main execution function
async function run() {
  try {
    console.log("Testing relative import conversion on multiple files...")
    
    let totalChanges = 0
    
    for (const testFile of TEST_FILES) {
      const changes = await processFile(testFile)
      totalChanges += changes
    }
    
    console.log(`\nTest completed! Would make ${totalChanges} import changes across ${TEST_FILES.length} files.`)
  } catch (error) {
    console.error('Error running script:', error)
    process.exit(1)
  }
}

// Execute the script
run(); 