const { execSync } = require('child_process');
const path = require('path');

try {
  // Find the Next.js executable or entry point
  const nextPath = path.resolve(__dirname, 'node_modules', 'next');
  console.log('Next.js path:', nextPath);
  
  // Run the build command
  console.log('Building with Next.js...');
  execSync(`node ${nextPath}/dist/bin/next build`, { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Error during build:', error);
  process.exit(1);
} 