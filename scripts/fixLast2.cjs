#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function addProfile(filePath, ingredientKey, profile) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const pattern = new RegExp(`(\\s{2}${ingredientKey}:\\s*{[\\s\\S]*?elementalProperties:\\s*{[^}]+})(,?)([\\s\\S]*?)(\\n\\s{2}\\w+:|\\n};)`, 'm');
  const match = content.match(pattern);
  if (!match || match[3].includes('astrologicalProfile:')) return false;
  const code = `
    astrologicalProfile: {
      rulingPlanets: [${profile.rulingPlanets.map(p => `'${p}'`).join(', ')}],
      favorableZodiac: [${profile.favorableZodiac.map(z => `'${z}'`).join(', ')}],
      seasonalAffinity: [${profile.seasonalAffinity.map(s => `'${s}'`).join(', ')}]
    },`;
  content = content.replace(pattern, match[1] + ',' + code + match[3] + match[4]);
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

const file = path.join(__dirname, '..', 'src/data/ingredients/vinegars/vinegars.ts');

addProfile(file, 'black_vinegar', {
  rulingPlanets: ['Saturn', 'Pluto'],
  favorableZodiac: ['Capricorn', 'Scorpio'],
  seasonalAffinity: ['all']
});

addProfile(file, 'date_vinegar', {
  rulingPlanets: ['Sun', 'Jupiter'],
  favorableZodiac: ['Leo', 'Sagittarius'],
  seasonalAffinity: ['all']
});

console.log('✅ Fixed last 2 ingredients');
