'use client';

import React from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import type { NatalChart } from '@/types/natalChart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ElementalWheelProps {
  natalChart: NatalChart;
}

const COLORS: Record<string, string> = {
  Fire: '#ef4444',
  Air: '#eab308',
  Water: '#3b82f6',
  Earth: '#22c55e',
};

export const ElementalWheel: React.FC<ElementalWheelProps> = ({ natalChart }) => {
  const { getDominantElement } = useAlchemical();
  const natal = natalChart.elementalBalance || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  const dominantElement = natalChart.dominantElement || getDominantElement();

  const data = [
    { subject: 'Fire', A: Math.round((natal.Fire ?? 0) * 100), fullMark: 100 },
    { subject: 'Water', A: Math.round((natal.Water ?? 0) * 100), fullMark: 100 },
    { subject: 'Earth', A: Math.round((natal.Earth ?? 0) * 100), fullMark: 100 },
    { subject: 'Air', A: Math.round((natal.Air ?? 0) * 100), fullMark: 100 },
  ];

  const CustomTick = (props: any) => {
    const { payload, x, y, textAnchor, stroke, radius } = props;
    return (
      <text
        radius={radius}
        stroke={stroke}
        x={x}
        y={y}
        className="text-[12px] font-bold"
        textAnchor={textAnchor}
        fill={COLORS[payload.value] || '#666'}
      >
        {payload.value}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-gray-800">Elemental Balance</h3>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
          Dominant: {dominantElement}
        </span>
      </div>

      <div className="flex-1 w-full min-h-[250px] relative mt-2 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={<CustomTick />} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip 
              itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Radar
              name="Alignment %"
              dataKey="A"
              stroke="#6366f1"
              fill="#818cf8"
              fillOpacity={0.5}
              animationDuration={1500}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
