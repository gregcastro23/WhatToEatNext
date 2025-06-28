import { oils } from './oils';
import { enhanceOilProperties } from '@/utils/elementalUtils';

export { oils };

// Process oils to add enhanced properties
export let processedOils = enhanceOilProperties(oils);

// Export enhanced oils as default
export default processedOils;

// Export specific oil categories
export let cookingOils = Object.entries(processedOils)
  .filter(([_, value]) => value.subCategory === 'cooking')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export let finishingOils = Object.entries(processedOils)
  .filter(([_, value]) => value.subCategory === 'finishing')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export let supplementOils = Object.entries(processedOils)
  .filter(([_, value]) => value.subCategory === 'supplement')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export let specialtyOils = Object.entries(processedOils)
  .filter(([_, value]) => 
    !value.subCategory || 
    (value.subCategory !== 'cooking' && 
     value.subCategory !== 'finishing' && 
     value.subCategory !== 'supplement'))
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

// Export by elemental properties
export let fireOils = Object.entries(processedOils)
  .filter(([_, value]) => 
    value.elementalProperties.Fire >= 0.4 || 
    value.astrologicalProfile?.elementalAffinity?.base === 'Fire')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export let waterOils = Object.entries(processedOils)
  .filter(([_, value]) => 
    value.elementalProperties.Water >= 0.4 || 
    value.astrologicalProfile?.elementalAffinity?.base === 'Water')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export let earthOils = Object.entries(processedOils)
  .filter(([_, value]) => 
    value.elementalProperties.Earth >= 0.4 || 
    value.astrologicalProfile?.elementalAffinity?.base === 'Earth')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export let airOils = Object.entries(processedOils)
  .filter(([_, value]) => 
    value.elementalProperties.Air >= 0.4 || 
    value.astrologicalProfile?.elementalAffinity?.base === 'Air')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

// Export by culinary applications
export let highHeatOils = Object.entries(processedOils)
  .filter(([_, value]) => 
    (value.smokePoint?.fahrenheit >= 400) || 
    (value.culinaryApplications?.frying || value.culinaryApplications?.deepfrying))
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export let bakingOils = Object.entries(processedOils)
  .filter(([_, value]) => value.culinaryApplications?.baking)
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export let dressingOils = Object.entries(processedOils)
  .filter(([_, value]) => value.culinaryApplications?.dressings)
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export let nutOils = Object.entries(processedOils)
  .filter(([key, _]) => 
    key.includes('walnut') || 
    key.includes('almond') || 
    key.includes('macadamia') || 
    key.includes('peanut'))
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

// For backward compatibility
export let allOils = processedOils; 