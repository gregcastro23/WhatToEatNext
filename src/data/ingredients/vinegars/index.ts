import { vinegars } from './vinegars';

export { vinegars };
export default vinegars;

// Export specific vinegar categories
// Don't re-import vinegars - use the one already imported
export let wineVinegars = Object.entries(vinegars)
  .filter(([_, value]) => value.subCategory === 'wine')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export let fruitVinegars = Object.entries(vinegars)
  .filter(([_, value]) => value.subCategory === 'fruit')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export let grainVinegars = Object.entries(vinegars)
  .filter(([_, value]) => value.subCategory === 'grain')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export let specialtyVinegars = Object.entries(vinegars)
  .filter(([_, value]) => value.subCategory === 'specialty' || 
    (value.subCategory !== 'wine' && value.subCategory !== 'fruit' && value.subCategory !== 'grain'))
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}); 