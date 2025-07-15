import { oils } from './oils.js';
import { enhanceOilProperties } from '../../../utils/elementalUtils.js';

// Export the raw oils
export { oils };
// Process oils to add enhanced properties
export const processedOils = enhanceOilProperties(oils);
// Export enhanced oils as default
export default processedOils;
// Export specific oil categories
export const cookingOils = Object.entries(processedOils)
    .filter(([, value]) => value.subCategory === 'cooking')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
export const finishingOils = Object.entries(processedOils)
    .filter(([, value]) => value.subCategory === 'finishing')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
export const supplementOils = Object.entries(processedOils)
    .filter(([, value]) => value.subCategory === 'supplement')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
export const specialtyOils = Object.entries(processedOils)
    .filter(([, value]) => !value.subCategory ||
    (value.subCategory !== 'cooking' &&
        value.subCategory !== 'finishing' &&
        value.subCategory !== 'supplement'))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
// Export by elemental properties
export const fireOils = Object.entries(processedOils)
    .filter(([, value]) => value.elementalProperties.Fire >= 0.4 ||
    value.astrologicalProfile?.elementalAffinity?.base === 'Fire')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
export const waterOils = Object.entries(processedOils)
    .filter(([, value]) => value.elementalProperties.Water >= 0.4 ||
    value.astrologicalProfile?.elementalAffinity?.base === 'Water')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
export const earthOils = Object.entries(processedOils)
    .filter(([, value]) => value.elementalProperties.Earth >= 0.4 ||
    value.astrologicalProfile?.elementalAffinity?.base === 'Earth')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
export const AirOils = Object.entries(processedOils)
    .filter(([, value]) => value.elementalProperties.Air >= 0.4 ||
    value.astrologicalProfile?.elementalAffinity?.base === 'Air')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
// Export by culinary applications
export const highHeatOils = Object.entries(processedOils)
    .filter(([, value]) => (value.smokePoint?.fahrenheit >= 400) ||
    (value.culinaryApplications?.frying || value.culinaryApplications?.deepfrying))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
export const bakingOils = Object.entries(processedOils)
    .filter(([, value]) => value.culinaryApplications?.baking)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
export const dressingOils = Object.entries(processedOils)
    .filter(([, value]) => value.culinaryApplications?.dressings)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
export const nutOils = Object.entries(processedOils)
    .filter(([key]) => key.includes('walnut') ||
    key.includes('almond') ||
    key.includes('macadamia') ||
    key.includes('peanut'))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
// For backward compatibility
export const allOils = processedOils;
