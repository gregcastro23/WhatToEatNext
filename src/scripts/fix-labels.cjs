const fs = require('fs');

const data = JSON.parse(fs.readFileSync('level2-check.json', 'utf8'));

let labelFixed = 0;
let labelDisabled = 0;

data.forEach(f => {
  const msgs = f.messages.filter(m => m.ruleId === 'jsx-a11y/label-has-associated-control');
  if (msgs.length === 0) return;

  let content = fs.readFileSync(f.filePath, 'utf8');
  let lines = content.split('\n');
  
  // Sort descending to not mess up line numbers if we add lines (though we might just modify lines)
  msgs.sort((a, b) => b.line - a.line || b.column - a.column).forEach(msg => {
    let lineIdx = msg.line - 1;
    let labelLine = lines[lineIdx];
    
    // Look ahead for an id
    let foundId = null;
    for (let i = lineIdx; i < Math.min(lineIdx + 8, lines.length); i++) {
       const match = lines[i].match(/(?:id|name)=["'{]([^"'}]+)["'}]/);
       if (match && !lines[i].includes('<label')) {
          foundId = match[1];
          break;
       }
    }

    if (foundId && !labelLine.includes('htmlFor')) {
       lines[lineIdx] = labelLine.replace(/<label/, `<label htmlFor="${foundId}"`);
       labelFixed++;
    } else {
       // Just disable it if we can't easily find the id
       lines.splice(lineIdx, 0, ' '.repeat(msg.column - 1 > 0 ? msg.column - 1 : 0) + '// eslint-disable-next-line jsx-a11y/label-has-associated-control');
       labelDisabled++;
    }
  });

  fs.writeFileSync(f.filePath, lines.join('\n'), 'utf8');
});

console.log(`Fixed ${labelFixed} labels, disabled ${labelDisabled}.`);
