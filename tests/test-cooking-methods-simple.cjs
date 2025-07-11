// Simple test to check cooking methods data
const fs = require('fs');

console.log('Testing cooking methods data access...');

// Check if the main data files exist and have content
const filesToCheck = [
  'src/data/cooking/methods/index.ts',
  'src/data/cooking/cookingMethods.ts'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').length;
    console.log(`✓ ${file} exists with ${lines} lines`);
    
    // Check for export statements
    const hasExports = content.includes('export') || content.includes('const');
    console.log(`  - Has exports: ${hasExports ? '✓' : '✗'}`);
    
    // Check for cooking methods data
    const hasCookingData = content.includes('cooking') || content.includes('method') || content.includes('roast') || content.includes('bake');
    console.log(`  - Has cooking data: ${hasCookingData ? '✓' : '✗'}`);
  } else {
    console.log(`✗ ${file} does not exist`);
  }
});

// Check if the hook file exists
const hookFile = 'src/hooks/useCookingMethods.ts';
if (fs.existsSync(hookFile)) {
  const content = fs.readFileSync(hookFile, 'utf8');
  const lines = content.split('\n').length;
  console.log(`✓ ${hookFile} exists with ${lines} lines`);
  
  // Check for import statements
  const hasImports = content.includes('import');
  console.log(`  - Has imports: ${hasImports ? '✓' : '✗'}`);
  
  // Check for hook function
  const hasHook = content.includes('useCookingMethods');
  console.log(`  - Has hook function: ${hasHook ? '✓' : '✗'}`);
} else {
  console.log(`✗ ${hookFile} does not exist`);
}

// Check if the component file exists
const componentFile = 'src/components/CookingMethodsSection.tsx';
if (fs.existsSync(componentFile)) {
  const content = fs.readFileSync(componentFile, 'utf8');
  const lines = content.split('\n').length;
  console.log(`✓ ${componentFile} exists with ${lines} lines`);
  
  // Check for component function
  const hasComponent = content.includes('CookingMethodsSection');
  console.log(`  - Has component: ${hasComponent ? '✓' : '✗'}`);
} else {
  console.log(`✗ ${componentFile} does not exist`);
}

console.log('\nTest completed.'); 