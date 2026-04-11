const fs = require('fs');
const path = require('path');

const files = [
  'src/app/recipes/page.tsx',
  'src/app/recipes/[recipeId]/page.tsx',
  'src/app/premium/page.tsx',
  'src/app/sauces/page.tsx',
  'src/app/page.tsx',
  'src/app/restaurant-creator/page.tsx',
  'src/app/cosmic-recipe/page.tsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - not found`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Main container replacements
  content = content.replace(/min-h-screen bg-slate-(50|100|900|950) text-slate-(100|800|900)/g, 'min-h-screen bg-[#08080e] text-white');
  content = content.replace(/min-h-screen bg-slate-(50|100|900|950)/g, 'min-h-screen bg-[#08080e] text-white');
  content = content.replace(/min-h-screen bg-gradient-to-br from-slate-[^\s]+/g, 'min-h-screen bg-[#08080e] text-white');
  
  // Specific gradient replacements
  content = content.replace(/bg-gradient-to-br from-slate-50 to-purple-50/g, 'bg-gradient-to-br from-[#08080e] to-[#0f0b1a]');
  content = content.replace(/bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50/g, 'bg-gradient-to-br from-[#08080e] via-[#0b0814] to-[#0f0b1a]');
  content = content.replace(/bg-gradient-to-br from-slate-50 to-rose-50/g, 'bg-gradient-to-br from-[#08080e] to-[#14080b]');
  content = content.replace(/bg-gradient-to-br from-slate-50 via-rose-50 to-amber-50/g, 'bg-gradient-to-br from-[#08080e] via-[#14080b] to-[#1a1105]');

  // Cosmic recipe page
  content = content.replace(/bg-slate-100 dark:bg-slate-950/g, 'bg-[#08080e]');
  content = content.replace(/dark:bg-slate-[89]00/g, 'glass-card-premium');
  content = content.replace(/dark:text-slate-[123]00/g, 'text-white/80');

  // Cards and inner elements
  content = content.replace(/bg-slate-[89]00(\/[0-9]+)? backdrop-blur-sm border border-slate-[78]00(\/[0-9]+)? rounded-(xl|2xl)/g, 'glass-card-premium rounded-2xl border border-white/8');
  content = content.replace(/bg-slate-[89]00(\/[0-9]+)? rounded-(xl|2xl) border border-slate-[78]00(\/[0-9]+)?/g, 'glass-card-premium rounded-2xl border border-white/8');
  content = content.replace(/bg-white rounded-2xl shadow-sm border border-slate-200/g, 'glass-card-premium rounded-2xl border border-white/8');
  content = content.replace(/bg-slate-900 rounded-xl/g, 'glass-card-premium rounded-2xl border border-white/8');
  content = content.replace(/bg-slate-800\/80 border border-slate-700\/50 rounded-xl/g, 'glass-card-premium rounded-xl border border-white/8');
  content = content.replace(/bg-slate-800\/80 border border-slate-700\/50 rounded-full/g, 'glass-card-premium rounded-full border border-white/8');
  content = content.replace(/bg-slate-800\/50 rounded-xl/g, 'glass-card-premium rounded-xl border border-white/8');
  content = content.replace(/bg-slate-800\/50 rounded-lg/g, 'glass-card-premium rounded-lg border border-white/8');
  content = content.replace(/bg-slate-[58]00 rounded/g, 'bg-white/5 rounded');
  content = content.replace(/bg-slate-[5678]00/g, 'bg-white/10');
  content = content.replace(/bg-slate-50\/50/g, 'bg-white/5');
  content = content.replace(/bg-slate-50/g, 'bg-white/5');
  
  // Specific backgrounds in recipes/[recipeId]
  content = content.replace(/bg-slate-900/g, 'glass-card-premium border border-white/8');

  // Text colors
  content = content.replace(/text-slate-900/g, 'text-white');
  content = content.replace(/text-slate-800/g, 'text-white');
  content = content.replace(/text-slate-700/g, 'text-white/80');
  content = content.replace(/text-slate-600/g, 'text-white/60');
  content = content.replace(/text-slate-500/g, 'text-white/60');
  content = content.replace(/text-slate-400/g, 'text-white/60');
  content = content.replace(/text-slate-300/g, 'text-white/80');
  content = content.replace(/text-slate-200/g, 'text-white');
  content = content.replace(/text-slate-100/g, 'text-white');
  
  // Border colors
  content = content.replace(/border-slate-800/g, 'border-white/10');
  content = content.replace(/border-slate-700/g, 'border-white/10');
  content = content.replace(/border-slate-600/g, 'border-white/10');
  content = content.replace(/border-slate-[123]00/g, 'border-white/10');
  
  // Specific strings
  content = content.replace(/from-slate-100 to-slate-200/g, 'from-white/10 to-white/5');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
