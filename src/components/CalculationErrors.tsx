import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

const CalculationErrors = () => {
  const { state } = useAlchemical();

  // Show component only when there are errors or the main error flag is true
  if ((!state.errors || state.errors.length === 0) && !state.error) return null;

  return (
    <div className='mb-4 rounded-lg border border-red-500/50 bg-red-900/20 p-4'>
      <h3 className='mb-2 flex items-center font-medium text-red-300'>
        <ExclamationTriangleIcon className='mr-2 h-5 w-5' />
        Calculation Warnings
      </h3>

      {/* Show individual errors if available */}
      {state.errors && state.errors.length > 0 && (
        <ul className='space-y-1 text-sm text-red-300/80'>
          {state.errors.map((error, index) => (
            <li key={index}>⚠️ {error}</li>
          ))}
        </ul>
      )}

      {/* Show the main error message if available */}
      {state.error && <p className='mt-1 text-sm text-red-300/80'>⚠️ {state.errorMessage}</p>}
    </div>
  );
};

export default CalculationErrors;
