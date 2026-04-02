const fs = require('fs');

const tsFilePath = './src/data/ingredients/ingredientSummaries.ts';
const jsonFilePath = process.argv[2];

const content = fs.readFileSync(tsFilePath, 'utf8');
const newSummaries = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

let insertion = '';
for (const [key, value] of Object.entries(newSummaries)) {
  insertion += `\n  "${key}": \`${value.replace(/`/g, '\\`')}\`,\n`;
}

const lastBraceIndex = content.lastIndexOf('};');
if (lastBraceIndex !== -1) {
  let beforeBrace = content.substring(0, lastBraceIndex).trimEnd();
  if (!beforeBrace.endsWith(',')) {
    beforeBrace += ',';
  }
  
  const newContent = beforeBrace + insertion + '\n};\n' + content.substring(lastBraceIndex + 2);
  fs.writeFileSync(tsFilePath, newContent);
  console.log('Successfully appended summaries from ' + jsonFilePath);
} else {
  console.log('Error: Could not find closing brace.');
}
