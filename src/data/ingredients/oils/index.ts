import { oils } from './oils';

export { oils };
export default oils;

// Export specific oil categories
export const cookingOils = Object.entries(oils)
  .filter(([_, value]) => value.subCategory === 'cooking')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const finishingOils = Object.entries(oils)
  .filter(([_, value]) => value.subCategory === 'finishing')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const supplementOils = Object.entries(oils)
  .filter(([_, value]) => value.subCategory === 'supplement')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const specialtyOils = Object.entries(oils)
  .filter(([_, value]) => 
    !value.subCategory || 
    (value.subCategory !== 'cooking' && 
     value.subCategory !== 'finishing' && 
     value.subCategory !== 'supplement'))
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}); 