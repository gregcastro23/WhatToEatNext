// @ts-nocheck
import CookingMethodsSection from './CookingMethodsSection';

const YourComponent = () => {
  // Your component logic
  
  const cookingMethods = [
    { name: 'Boiling', description: 'Cooking in water at 100°C' },
    { name: 'Frying', description: 'Cooking in hot oil' },
    // ... other methods
  ];
  
  return (
    <div>
      {/* Other components */}
      // @ts-expect-error - Auto-fixed by script
      <CookingMethodsSection methods={cookingMethods} />
    </div>
  );
}; 