/**
 * Minimal Kinetics Power Level Indicator
 * Shows current cosmic power level with simple visual feedback
 */

import React from 'react';

export interface KineticsPowerIndicatorProps {
  powerLevel: number; // 0-1 range
  className?: string;
}

export function KineticsPowerIndicator({ powerLevel, className = '' }: KineticsPowerIndicatorProps) {
  const category = powerLevel > 0.7 ? 'High Energy' :
                  powerLevel < 0.4 ? 'Grounding' : 'Balanced';

  const color = powerLevel > 0.7 ? 'text-orange-500 bg-orange-500' :
                powerLevel < 0.4 ? 'text-blue-500 bg-blue-500' : 'text-green-500 bg-green-500';

  const percentage = Math.round(powerLevel * 100);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${color.split(' ')[1]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-sm font-medium ${color.split(' ')[0]}`}>
        {category}
      </span>
      <span className="text-xs text-gray-500">
        {percentage}%
      </span>
    </div>
  );
}