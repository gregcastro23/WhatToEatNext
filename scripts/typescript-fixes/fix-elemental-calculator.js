import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src/services/ElementalCalculator.ts');
const dryRun = process.argv.includes('--dry-run');

function fixElementalCalculator() {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalCalculator singleton pattern...`);

  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix inconsistent constructor visibility and singleton pattern
  const constructorRegex = /public\s+constructor\(.*?\)/s;
  const hasPublicConstructor = constructorRegex.test(content);

  if (hasPublicConstructor) {
    console.log('Found public constructor in ElementalCalculator');
    
    // Change public constructor to private for singleton pattern
    content = content.replace(
      constructorRegex,
      'private constructor($1)'
    );
    
    // Check if getInstance method exists and is correctly implemented
    const getInstanceRegex = /static\s+getInstance\(\)[\s\S]*?{[\s\S]*?return[\s\S]*?}/;
    const hasGetInstanceMethod = getInstanceRegex.test(content);
    
    if (!hasGetInstanceMethod) {
      console.log('getInstance method is missing or incorrect, adding proper implementation');
      
      // Add proper getInstance method after class declaration
      const classStartRegex = /export\s+class\s+ElementalCalculator\s*{/;
      const instanceVarDeclaration = '  private static instance: ElementalCalculator;\n';
      
      const getInstanceMethod = `
  /**
   * Get the singleton instance
   */
  static getInstance(): ElementalCalculator {
    if (!ElementalCalculator.instance) {
      ElementalCalculator.instance = new ElementalCalculator();
    }
    return ElementalCalculator.instance;
  }
`;
      
      // Add instance variable if it doesn't exist
      if (!content.includes('private static instance:')) {
        content = content.replace(
          classStartRegex,
          `$&\n${instanceVarDeclaration}`
        );
      }
      
      // Add getInstance method if it doesn't exist
      if (!content.includes('static getInstance()')) {
        // Find a good place to insert the method
        const insertAfter = content.indexOf('{') + 1;
        content = content.slice(0, insertAfter) + getInstanceMethod + content.slice(insertAfter);
      }
    }
    
    // Fix initialization methods to use singleton pattern consistently
    content = content.replace(
      /static\s+initialize\(.*?\)[\s\S]*?{/,
      `static initialize(initialState?: ElementalProperties): void {
    let instance = ElementalCalculator.getInstance();`
    );
    
    // Fix updateElementalState to use singleton pattern consistently
    content = content.replace(
      /static\s+updateElementalState\(.*?\)[\s\S]*?{/,
      `static updateElementalState(newState: ElementalProperties): void {
    let instance = ElementalCalculator.getInstance();`
    );
    
    // Fix getCurrentElementalState to use singleton pattern consistently
    content = content.replace(
      /static\s+getCurrentElementalState\(\)[\s\S]*?{/,
      `static getCurrentElementalState(): ElementalProperties {
    let instance = ElementalCalculator.getInstance();`
    );
    
    // Write changes to file if not a dry run
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed ElementalCalculator singleton pattern');
    } else {
      console.log('[DRY RUN] Would fix ElementalCalculator singleton pattern');
    }
  } else {
    console.log('Constructor is already private in ElementalCalculator');
  }
}

// Run the fix function
try {
  fixElementalCalculator();
} catch (error) {
  console.error('Error fixing ElementalCalculator:', error);
  process.exit(1);
} 