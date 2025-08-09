import CookingMethodsSection from './CookingMethodsSection';

const _YourComponent = () => {
  // Your component logic

  const cookingMethods = [
    { id: 'boiling', name: 'Boiling', description: 'Cooking in water at 100°C' },
    { id: 'frying', name: 'Frying', description: 'Cooking in hot oil' },
    // ... other methods
  ];

  return (
    <div>
      {/* Other components */}
      <CookingMethodsSection methods={cookingMethods} />
    </div>
  );
};
