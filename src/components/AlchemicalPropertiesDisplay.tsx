'use client';

import React from 'react';

interface AlchemicalPropertiesDisplayProps {
  values: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  isDaytime?: boolean;
  className?: string;
  showDebug?: boolean;
}

export default function AlchemicalPropertiesDisplay({ 
  values, 
  isDaytime = true, 
  className = '', 
  showDebug = false 
}: AlchemicalPropertiesDisplayProps) {
  
  const properties = [
    { name: 'Spirit', value: values.Spirit, color: 'bg-indigo-500', barColor: 'from-indigo-400 to-indigo-600', icon: '⦿' },
    { name: 'Essence', value: values.Essence, color: 'bg-red-400', barColor: 'from-red-300 to-red-500', icon: '◈' },
    { name: 'Matter', value: values.Matter, color: 'bg-amber-600', barColor: 'from-amber-500 to-amber-700', icon: '⬟' },
    { name: 'Substance', value: values.Substance, color: 'bg-emerald-500', barColor: 'from-emerald-400 to-emerald-600', icon: '⬢' },
  ];

  const formatValue = (value: number = 0) => value.toFixed(4);

  return (
    <div className={`p-6 rounded-xl shadow-sm border ${isDaytime ? 'bg-white/80 border-amber-100' : 'bg-white/90 border-indigo-100'} ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-xl font-bold ${isDaytime ? 'text-amber-900' : 'text-indigo-900'}`}>Alchemical Potency</h3>
        <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-300 opacity-60">Quantum Metrics</div>
      </div>
      
      {showDebug && (
        <div className="mb-4 p-2 bg-gray-100 rounded text-[10px] font-mono">
          <p>Values defined: {values ? 'Yes' : 'No'}</p>
          <p>Theme: {isDaytime ? 'Diurnal' : 'Nocturnal'}</p>
        </div>
      )}
      
      <div className="space-y-6">
        {properties.map((prop) => (
          <div key={prop.name} className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className={`mr-2 text-lg ${prop.color.replace('bg-', 'text-')}`}>{prop.icon}</span>
                <span className="text-sm font-bold text-indigo-900 tracking-tight">{prop.name}</span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-500">{formatValue(prop.value)}</span>
            </div>
            
            <div className="w-full h-2 bg-indigo-50 rounded-full overflow-hidden border border-indigo-100/50">
              <div 
                className={`h-full bg-gradient-to-r ${prop.barColor} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(prop.value * 200, 100)}%` }}
              />
            </div>
            
            {/* Subtle glow effect for high values */}
            {prop.value > 0.4 && (
              <div 
                className={`absolute top-0 left-0 w-full h-2 blur-md opacity-20 pointer-events-none bg-gradient-to-r ${prop.barColor}`} 
                style={{ width: `${Math.min(prop.value * 200, 100)}%` }}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-4 border-t border-indigo-50 flex justify-between items-center">
        <div className="text-[10px] text-indigo-300 font-medium italic">
          Values represent probability densities of current transits.
        </div>
        <div className={`w-2 h-2 rounded-full animate-pulse ${isDaytime ? 'bg-amber-400' : 'bg-indigo-400'}`} />
      </div>
    </div>
  );
}