import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

const DailyFoodAlchemy: React.FC = () => {
  const { state } = useAlchemical();

  // Use the alchemical state for recommendations
  return (
    <div>
      {/* Your existing DailyFoodAlchemy UI */}
      <div className='text-sm text-gray-600'>
        Current Elemental Balance:
        {Object.entries(state.elementalPreference || {}).map(([element, value]) => (
          <span key={element} className='ml-2'>
            {element}: {(value * 100).toFixed(1)}%
          </span>
        ))}
      </div>
    </div>
  );
};

export default DailyFoodAlchemy;
