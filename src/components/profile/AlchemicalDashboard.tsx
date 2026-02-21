import React from 'react';

interface AlchemicalDashboardProps {
  data: any; // Using any for speed, but should ideally be typed
}

const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="mb-2">
    <div className="flex justify-between text-sm font-medium mb-1">
      <span>{label}</span>
      <span>{(value * 100).toFixed(1)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${color}`}
        style={{ width: `${Math.min(value * 100, 100)}%` }}
      ></div>
    </div>
  </div>
);

export const AlchemicalDashboard: React.FC<AlchemicalDashboardProps> = ({ data }) => {
  const { alchemical_quantities, natal_chart } = data;
  const { spirit, essence, matter, substance, elemental_balance } = alchemical_quantities;

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Alchemical Quantities Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-purple-500">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Alchemical Constitution</h3>
          <div className="space-y-4">
            <StatBar label="Spirit (Fire/Air)" value={spirit} color="bg-red-500" />
            <StatBar label="Essence (Water/Air)" value={essence} color="bg-blue-400" />
            <StatBar label="Matter (Earth/Water)" value={matter} color="bg-green-600" />
            <StatBar label="Substance (Earth/Fire)" value={substance} color="bg-orange-600" />
          </div>
        </div>

        {/* Elemental Balance Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Elemental Balance</h3>
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
