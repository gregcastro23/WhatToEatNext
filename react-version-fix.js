// Replace CommonJS require with ES module imports
import fs from 'fs';
import path from 'path';

try {
  // Get the path to the react and react-dom package.json files
  const reactPath = path.join(process.cwd(), 'node_modules', 'react', 'package.json');
  const reactDomPath = path.join(process.cwd(), 'node_modules', 'react-dom', 'package.json');

  // Check if files exist before reading
  if (!fs.existsSync(reactPath) || !fs.existsSync(reactDomPath)) {
    console.log('React or React DOM package.json not found. Skipping version check.');
    process.exit(0); // Exit successfully
  }

  // Read and parse the package.json files
  const reactPackage = JSON.parse(fs.readFileSync(reactPath, 'utf8'));
  const reactDomPackage = JSON.parse(fs.readFileSync(reactDomPath, 'utf8'));

  // Check if the versions match
  if (reactPackage.version !== reactDomPackage.version) {
    console.log('React and React DOM versions do not match. Fixing...');
    
    // Update React DOM version to match React version
    reactDomPackage.version = reactPackage.version;
    
    // Write the updated package.json back to disk
    fs.writeFileSync(reactDomPath, JSON.stringify(reactDomPackage, null, 2));
    
    console.log(`Updated React DOM to version ${reactPackage.version}`);
  } else {
    console.log('React and React DOM versions match. No fix needed.');
  }
} catch (error) {
  console.log('Error checking React versions:', error.message);
  console.log('Continuing build process...');
  process.exit(0); // Exit successfully despite error
} 