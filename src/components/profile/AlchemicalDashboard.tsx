import React from 'react';

interface AlchemicalDashboardProps {
  data: any; // Using any for speed, but should ideally be typed
}

const StatBar = ({ label, value, color, description }: { label: string; value: number; color: string; description?: string }) => (
  <div className="mb-4" title={description}>
    <div className="flex justify-between text-sm font-medium mb-1 text-gray-700">
      <span>{label}</span>
      <span>{(value * 100).toFixed(1)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${color}`}
        style={{ width: `${Math.min(value * 100, 100)}%` }}
      ></div>
    </div>
    {description && <p className="text-xs text-gray-500 mt-1 italic">{description}</p>}
  </div>
);

export const AlchemicalDashboard: React.FC<AlchemicalDashboardProps> = ({ data }) => {
  const { alchemical_quantities, natal_chart, birth_data } = data;
  const { spirit, essence, matter, substance, elemental_balance } = alchemical_quantities;
  
  const dominantElement = Object.entries(elemental_balance as Record<string, number>).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const userLocation = birth_data?.city_name || birth_data?.state_country 
    ? `${birth_data?.city_name || 'Unknown City'}, ${birth_data?.state_country || ''}`
    : null;

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {userLocation && (
         <div className="text-center text-sm font-medium text-purple-600 bg-purple-50 py-2 rounded shadow-sm">
           Calculated for: {userLocation}
         </div>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Alchemical Quantities Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-purple-500">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Alchemical Constitution</h3>
          <div className="space-y-4">
            <StatBar label="Spirit (Fire/Air)" value={spirit} color="bg-red-500" description="The spark of action and thought" />
            <StatBar label="Essence (Water/Air)" value={essence} color="bg-blue-400" description="The flow of feeling and connection" />
            <StatBar label="Matter (Earth/Water)" value={matter} color="bg-green-600" description="The physical form and nourishment" />
            <StatBar label="Substance (Earth/Fire)" value={substance} color="bg-orange-600" description="The building blocks and fuel" />
          </div>
        </div>

        {/* Elemental Balance Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Elemental Balance</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">
              Dominant: {dominantElement}
            </span>
          </div>
          <div className="space-y-4">
            <StatBar label="Fire" value={elemental_balance.Fire} color="bg-red-500" />
            <StatBar label="Earth" value={elemental_balance.Earth} color="bg-green-600" />
            <StatBar label="Air" value={elemental_balance.Air} color="bg-yellow-400" />
            <StatBar label="Water" value={elemental_balance.Water} color="bg-blue-500" />
          </div>
        </div>
      </div>

      {/* Natal Chart Summary */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Natal Chart Positions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(natal_chart).map(([planet, details]: [string, any]) => (
            <div key={planet} className="p-3 bg-gray-50 rounded border border-gray-100">
              <div className="text-xs text-gray-500 uppercase font-semibold">{planet}</div>
              <div className="text-lg font-medium text-purple-900 capitalize">
                {details.sign}
              </div>
              <div className="text-xs text-gray-600">
                {details.degree}° {details.minute}' {details.isRetrograde ? '℞' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
