import { CookingMethodsSection } from './CookingMethodsSection';

const YourComponent = () => {
  // Your component logic
  
  const cookingMethods = [
    { 
      id: 'boiling', 
      name: 'Boiling', 
      description: 'Cooking in water at 100°C',
      elementalEffect: {
        Fire: 0.2,
        Water: 0.8,
        Earth: 0.0,
        Air: 0.0
      }
    },
    { 
      id: 'frying', 
      name: 'Frying', 
      description: 'Cooking in hot oil',
      elementalEffect: {
        Fire: 0.8,
        Water: 0.1,
        Earth: 0.1,
        Air: 0.0
      }
    }
    // ... other methods
  ];
  
  return (
    <div>
      {/* Other components */}
      <CookingMethodsSection methods={cookingMethods} />
    </div>
  );
};

export default YourComponent; 