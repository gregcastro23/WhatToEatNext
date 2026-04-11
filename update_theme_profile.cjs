const fs = require('fs');
const path = require('path');

const files = [
  'src/app/profile/budget/page.tsx',
  'src/app/profile/day-night-effects/page.tsx',
  'src/app/profile/birthchart/page.tsx',
  'src/app/premium/page.tsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - not found`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Specific for day-night-effects
  content = content.replace(/min-h-screen transition-colors duration-700 \$\{viewDiurnal \? 'bg-slate-50' : 'bg-slate-900'\} py-8/g, "min-h-screen bg-[#08080e] text-white py-8 transition-colors duration-700");
  content = content.replace(/viewDiurnal \? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'/g, "'text-white/60 hover:text-white'");
  content = content.replace(/viewDiurnal \? 'bg-white shadow-sm border border-slate-200' : 'bg-slate-800\/50 border border-slate-700 backdrop-blur-sm'/g, "'glass-card-premium rounded-2xl border border-white/8'");
  content = content.replace(/viewDiurnal \? 'text-slate-800' : 'text-white'/g, "'text-white'");
  content = content.replace(/viewDiurnal \? 'bg-slate-50 border border-slate-100' : 'bg-slate-900\/50 border border-slate-800'/g, "'glass-card-premium border border-white/8'");
  content = content.replace(/viewDiurnal \? 'text-slate-400' : 'text-slate-500'/g, "'text-white/60'");
  content = content.replace(/viewDiurnal \? 'bg-white shadow-sm border border-slate-200 hover:shadow-xl hover:border-amber-200' : 'bg-slate-800\/60 border border-slate-700 backdrop-blur-md hover:bg-slate-800 hover:border-indigo-500\/50'/g, "'glass-card-premium border border-white/8 hover:border-white/20'");
  content = content.replace(/viewDiurnal \? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-white\/10 text-slate-300 border border-white\/20'/g, "'bg-white/10 text-white/80 border border-white/20'");
  content = content.replace(/viewDiurnal \? 'text-slate-700' : 'text-indigo-200'/g, "'text-white'");
  content = content.replace(/bg-slate-900 text-white hover:bg-slate-800 border-slate-700 shadow-slate-900\/20/g, 'bg-[#08080e] text-white hover:bg-white/5 border-white/10 shadow-black/20');
  content = content.replace(/bg-white text-slate-900 hover:bg-slate-50 border-white\/80 shadow-white\/10/g, 'bg-white/10 text-white hover:bg-white/20 border-white/20 shadow-white/5');

  // Specific complex classes from budget & birthchart
  content = content.replace(/bg-white rounded-3xl shadow-sm p-8 md:p-12 border border-slate-100/g, 'glass-card-premium rounded-3xl p-8 md:p-12 border border-white/8');
  content = content.replace(/bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 shadow-slate-900\/20/g, 'bg-[#08080e] border border-white/10 text-white hover:bg-white/5 shadow-black/20');
  content = content.replace(/bg-white rounded-\[2\.5rem\] shadow-sm p-8 border border-slate-100/g, 'glass-card-premium rounded-[2.5rem] p-8 border border-white/8');
  content = content.replace(/bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/g, 'glass-card-premium rounded-2xl border border-white/8 hover:bg-white/5');
  content = content.replace(/border-4 border-slate-200 border-t-slate-800/g, 'border-4 border-white/10 border-t-white');
  content = content.replace(/bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950/g, 'bg-gradient-to-br from-[#08080e] via-[#0b0814] to-[#0f0b1a]');
  content = content.replace(/bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900/g, 'bg-gradient-to-br from-[#08080e] via-[#0b0814] to-[#0f0b1a]');
  content = content.replace(/bg-slate-50 border border-slate-200/g, 'glass-card-premium border border-white/8');

  // Basic container and gradient replacements
  content = content.replace(/min-h-screen bg-slate-(50|100|900|950) text-slate-(100|800|900)/g, 'min-h-screen bg-[#08080e] text-white');
  content = content.replace(/min-h-screen bg-slate-(50|100|900|950)/g, 'min-h-screen bg-[#08080e] text-white');
  content = content.replace(/min-h-screen bg-gradient-to-br from-slate-[^\s]+/g, 'min-h-screen bg-[#08080e] text-white');
  
  // Specific bg colors
  content = content.replace(/bg-slate-950/g, 'bg-[#08080e]');
  content = content.replace(/bg-slate-900/g, 'bg-[#08080e]');
  content = content.replace(/bg-slate-800/g, 'bg-[#0f0b1a]');
  content = content.replace(/bg-slate-400/g, 'bg-white/20');
  content = content.replace(/bg-slate-200/g, 'bg-white/10');
  content = content.replace(/bg-slate-100/g, 'bg-white/5');
  content = content.replace(/bg-slate-50/g, 'bg-white/5');

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
  content = content.replace(/border-slate-800\/50/g, 'border-white/10');
  content = content.replace(/border-slate-800/g, 'border-white/10');
  content = content.replace(/border-slate-700/g, 'border-white/10');
  content = content.replace(/border-slate-600/g, 'border-white/10');
  content = content.replace(/border-slate-[123]00/g, 'border-white/10');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
