const fs = require('fs');
const path = require('path');

function scanForUnusedVariables(dir, report = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        scanForUnusedVariables(filePath, report);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const unusedVars = findUnusedVariables(content, filePath);
        if (unusedVars.length > 0) {
          report.push({ file: filePath, unused: unusedVars.length, variables: unusedVars });
        }
      } catch (e) {
        // Skip files with read errors
      }
    }
  }
  return report;
}

function findUnusedVariables(content, filePath) {
  const lines = content.split('\n');
  const unusedVars = [];
  
  lines.forEach((line, index) => {
    const exportMatch = line.match(/^export\s+const\s+([A-Z_][A-Z0-9_]*)\s*=/);
    if (exportMatch) {
      const varName = exportMatch[1];
      // Simple heuristic: if variable is only mentioned once (in its declaration), it's likely unused
      const occurrences = (content.match(new RegExp(varName, 'g')) || []).length;
      if (occurrences === 1) {
        unusedVars.push({ name: varName, line: index + 1 });
      }
    }
  });
  
  return unusedVars;
}

const report = scanForUnusedVariables('src');
const sortedReport = report.sort((a, b) => b.unused - a.unused);

console.log(JSON.stringify({
  totalFiles: report.length,
  totalUnused: report.reduce((sum, item) => sum + item.unused, 0),
  topTargets: sortedReport.slice(0, 10)
}, null, 2));