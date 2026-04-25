import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const files = globSync('src/data/ingredients/**/*.ts');
const zSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

let count = 0;
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Fix Autumn to fall
    if (content.includes('"autumn"')) {
        content = content.replace(/"autumn"/g, '"fall"');
        changed = true;
    }
    if (content.includes("'autumn'")) {
        content = content.replace(/'autumn'/g, '"fall"');
        changed = true;
    }

    // Fix capitalized Zodiac signs
    for (const sign of zSigns) {
        const re1 = new RegExp(`"${sign}"`, 'g');
        if (re1.test(content)) {
            content = content.replace(re1, `"${sign.toLowerCase()}"`);
            changed = true;
        }
        const re2 = new RegExp(`'${sign}'`, 'g');
        if (re2.test(content)) {
            content = content.replace(re2, `"${sign.toLowerCase()}"`);
            changed = true;
        }
    }

    // Fix "beverages" to "beverage" if beverage is added to category
    if (content.includes('category: "beverages"')) {
        content = content.replace(/category: "beverages"/g, 'category: "beverage"');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        count++;
    }
}
console.log(`Fixed formatting in ${count} files.`);
