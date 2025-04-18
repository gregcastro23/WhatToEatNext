// Helper file for path resolution in development or tests

const path = require('path');
const fs = require('fs');

// Get the absolute path to the project root
const projectRoot = __dirname;

// Map of aliases to their actual paths
const pathMap = {
  '@': path.resolve(projectRoot, 'src'),
  '@components': path.resolve(projectRoot, 'src/components'),
  '@styles': path.resolve(projectRoot, 'src/styles'),
  '@utils': path.resolve(projectRoot, 'src/utils'),
  '@types': path.resolve(projectRoot, 'src/types'),
  '@providers': path.resolve(projectRoot, 'src/providers'),
  '@constants': path.resolve(projectRoot, 'src/constants'),
  '@data': path.resolve(projectRoot, 'src/data'),
  '@lib': path.resolve(projectRoot, 'src/lib')
};

// Function to resolve a path with aliases
function resolvePath(pathWithAlias) {
  for (const [alias, actualPath] of Object.entries(pathMap)) {
    if (pathWithAlias.startsWith(alias)) {
      return pathWithAlias.replace(alias, actualPath);
    }
  }
  return pathWithAlias;
}

module.exports = {
  pathMap,
  resolvePath
}; 