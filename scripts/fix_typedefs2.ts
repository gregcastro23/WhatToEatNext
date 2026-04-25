import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('src/data/ingredients/**/*.ts');

let count = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('"all"')) {
    content = content.replace(/"all"/g, '"fall"');
    changed = true;
  }
  if (content.includes("'all'")) {
    content = content.replace(/'all'/g, '"fall"');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    count++;
  }
}
console.log(`Fixed formatting in ${count} files.`);
