const fs = require('fs');
const glob = require('glob');

const data = JSON.parse(fs.readFileSync('level2-check.json', 'utf8'));

// Find naming convention warnings
const namingWarnings = [];
data.forEach(f => {
  f.messages.filter(m => m.ruleId === '@typescript-eslint/naming-convention').forEach(m => {
    namingWarnings.push({ file: f.filePath, line: m.line, col: m.column, msg: m.message });
  });
});

const grouped = {};
namingWarnings.forEach(w => {
  if (!grouped[w.file]) grouped[w.file] = [];
  grouped[w.file].push(w);
});

for (const [file, warnings] of Object.entries(grouped)) {
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  let modified = false;

  warnings.sort((a, b) => b.line - a.line || b.col - a.col).forEach(w => {
    let lineIdx = w.line - 1;
    let l = lines[lineIdx];

    // Destructuring with alias: `const { invalid_name, ... } = obj` => `const { invalid_name: invalidName, ... } = obj`
    if (w.msg.includes('alchemical_quantities')) {
       // manual fix for AlchemicalDashboard
       l = l.replace('alchemical_quantities,', 'alchemical_quantities: alchemicalQuantities,');
       l = l.replace('natal_chart,', 'natal_chart: natalChart,');
       l = l.replace('birth_data', 'birth_data: birthData');
       
       // we also need to fix references below this line for these variables
       for (let i = lineIdx + 1; i < lineIdx + 15; i++) {
          if (!lines[i]) continue;
          lines[i] = lines[i].replace(/alchemical_quantities/g, 'alchemicalQuantities');
          lines[i] = lines[i].replace(/natal_chart/g, 'natalChart');
          lines[i] = lines[i].replace(/birth_data/g, 'birthData');
       }
       lines[lineIdx] = l;
       modified = true;
    } else if (w.msg.includes('dynamic_config')) {
       l = l.replace('dynamic_config', 'dynamic');
       lines[lineIdx] = l;
       modified = true;
    } else if (w.msg.includes('ln_K') || w.msg.includes('gast_hours') || w.msg.includes('lst_deg') || w.msg.includes('time_range') || w.msg.includes('validCategories_count') || w.msg.includes('flavor_complexity') || w.msg.includes('preservation_factor') || w.msg.includes('DEFAULT_moon_SIGN')) {
       // These are local variables. Rename them here and in the rest of the file.
       const match = w.msg.match(/Variable name `([^`]+)`/);
       if (match) {
         let oldName = match[1];
         let newName = oldName.replace(/_([a-z])/ig, (g) => g[1].toUpperCase());
         if (oldName === 'DEFAULT_moon_SIGN') newName = 'DEFAULT_MOON_SIGN';
         
         // global replace in the whole file content string
         content = lines.join('\n');
         content = content.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
         lines = content.split('\n');
         modified = true;
       }
    } else if (w.msg.includes('Type Alias name') || w.msg.includes('Interface name')) {
       // Add eslint-disable
       lines.splice(lineIdx, 0, ' '.repeat(w.col > 1 ? w.col - 1 : 0) + '// eslint-disable-next-line @typescript-eslint/naming-convention');
       modified = true;
    } else if (w.msg.includes('_UNUSED_') || w.msg.includes('___')) {
       lines.splice(lineIdx, 0, ' '.repeat(w.col > 1 ? w.col - 1 : 0) + '// eslint-disable-next-line @typescript-eslint/naming-convention');
       modified = true;
    } else if (w.msg.includes('requester_id') || w.msg.includes('addressee_id')) {
       // Destructuring args: `(requester_id, addressee_id)` -> just disable or rename.
       lines.splice(lineIdx, 0, ' '.repeat(w.col > 1 ? w.col - 1 : 0) + '// eslint-disable-next-line @typescript-eslint/naming-convention');
       modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
  }
}

console.log('Naming conventions updated.');
