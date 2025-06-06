import { Chakra } from './chakraMappings';

// Order of chakras from crown to root
export const CHAKRA_ORDER = ['crown', 'brow', 'throat', 'heart', 'solarPlexus', 'sacral', 'root'];

// Map of chakra positions to their symbols
export const CHAKRA_SYMBOLS: Record<string, string> = {
  root: '▼',       // Downward-pointing triangle
  sacral: '○',      // Circle
  solarPlexus: '△', // Upward-pointing triangle
  heart: '✦',       // Star
  throat: '◯',      // Circle
  brow: '◎',        // Circle with dot
  crown: '☼',       // Sun
};

// Sanskrit bija (seed) mantras for each chakra
export const CHAKRA_BIJA_MANTRAS: Record<string, string> = {
  root: 'लं',       // LAM
  sacral: 'वं',      // VAM
  solarPlexus: 'रं', // RAM
  heart: 'यं',       // YAM
  throat: 'हं',      // HAM
  brow: 'ॐ',        // OM
  crown: '✧',       // Silent
};

// Chakra colors for Tailwind background classes
export const CHAKRA_BG_COLORS: Record<string, string> = {
  root: 'bg-red-500',
  sacral: 'bg-orange-400',
  solarPlexus: 'bg-yellow-300',
  heart: 'bg-green-400',
  throat: 'bg-blue-400',
  brow: 'bg-indigo-500',
  crown: 'bg-purple-400',
};

// Chakra colors for Tailwind text classes
export const CHAKRA_TEXT_COLORS: Record<string, string> = {
  root: 'text-red-500',
  sacral: 'text-orange-400',
  solarPlexus: 'text-yellow-500',
  heart: 'text-green-500',
  throat: 'text-blue-500',
  brow: 'text-indigo-500',
  crown: 'text-purple-500',
};

// Sanskrit names for each chakra
export const CHAKRA_SANSKRIT_NAMES: Record<string, string> = {
  root: 'Muladhara',
  sacral: 'Svadhisthana',
  solarPlexus: 'Manipura',
  heart: 'Anahata',
  throat: 'Vishuddha',
  brow: 'Ajna',
  crown: 'Sahasrara',
};

// Nutritional correlations for each chakra
export const CHAKRA_NUTRITIONAL_CORRELATIONS: Record<string, string[]> = {
  root: ['Root vegetables', 'Protein-rich foods', 'Red foods', 'Grounding spices'],
  sacral: ['Orange foods', 'Sweet fruits', 'Nuts', 'Seeds', 'Honey'],
  solarPlexus: ['Whole grains', 'Yellow foods', 'Spices', 'Fermented foods'],
  heart: ['Green leafy vegetables', 'Herbal teas', 'Sprouts', 'Cruciferous vegetables'],
  throat: ['Blue and purple fruits', 'Tart fruits', 'Liquids', 'Sea vegetables'],
  brow: ['Purple foods', 'Omega-3 rich foods', 'Antioxidants', 'Dark chocolate'],
  crown: ['Pure water', 'Fasting', 'Detoxifying herbs', 'Light foods'],
};

// Medicinal herb correlations for each chakra
export const CHAKRA_HERBS: Record<string, string[]> = {
  root: ['Dandelion root', 'Ashwagandha', 'Ginger', 'Turmeric'],
  sacral: ['Damiana', 'Vanilla', 'Cinnamon', 'Orange peel'],
  solarPlexus: ['Chamomile', 'Fennel', 'Yellow dock', 'Lemon balm'],
  heart: ['Rose', 'Hawthorn', 'Motherwort', 'Green tea'],
  throat: ['Slippery elm', 'Sage', 'Lemon', 'Peppermint'],
  brow: ['Mugwort', 'Star anise', 'Passionflower', 'Lavender'],
  crown: ['Lotus', 'Frankincense', 'White sage', 'Gotu kola'],
};

// Helper function to convert from capitalized chakra name to key format
export function normalizeChakraKey(chakraName: string | undefined | null): string {
  if (!chakraName) return '';
  if (chakraName.toLowerCase() === 'solar plexus') return 'solarPlexus';
  if (chakraName.toLowerCase() === 'third eye') return 'brow';
  return chakraName.toLowerCase();
}

// Helper function to convert from key format to display name
export function getChakraDisplayName(chakraKey: string): string {
  if (chakraKey === 'solarPlexus') return 'Solar Plexus';
  if (chakraKey === 'brow') return 'Third Eye';
  return chakraKey.charAt(0).toUpperCase() + chakraKey.slice(1);
}

// Mapping between alchemical energy states and chakras
export const ENERGY_STATE_CHAKRA_MAPPING: Record<string, string[]> = {
  'Spirit': ['crown'],
  'Substance': ['throat'],
  'Essence': ['brow', 'solarPlexus', 'sacral'],
  'Matter': ['root']
}; 