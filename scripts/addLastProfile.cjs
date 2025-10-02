const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src/data/ingredients/spices/spiceBlends.ts');
let content = fs.readFileSync(file, 'utf-8');

const pattern = /(chinese_five_spice:\s*{\s*name:[\s\S]*?elementalProperties:\s*{[^}]+})(,?)([\s\S]*?)(\n\s{2}\w+:)/m;
const match = content.match(pattern);

if (!match) {
  console.log('Could not find chinese_five_spice');
  process.exit(1);
}

if (match[3].includes('astrologicalProfile:')) {
  console.log('Already has profile');
  process.exit(0);
}

const profile = `,
    astrologicalProfile: {
      rulingPlanets: ['Jupiter', 'Mars'],
      favorableZodiac: ['Sagittarius', 'Aries', 'Leo'],
      seasonalAffinity: ['all']
    }`;

const updated = match[1] + profile + match[3] + match[4];
content = content.replace(pattern, updated);

fs.writeFileSync(file, content, 'utf-8');
console.log('✅ Added astrologicalProfile to chinese_five_spice');
