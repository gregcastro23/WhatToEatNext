'use client';

import React from 'react';
import { useAlchmWebSocket } from '@/hooks/useAlchmWebSocket';
import { logger } from '@/lib/logger';

interface EnergyVisualizationProps {
  showDetails?: boolean;
  showHistory?: boolean;
  className?: string;
}

interface EnergyReading {
  timestamp: number;
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

const ELEMENT_COLORS = {
  Fire: '#FF4500',
  Water: '#1E90FF',
  Air: '#87CEEB',
  Earth: '#8B4513',
} as const;

const ELEMENT_SYMBOLS = {
  Fire: '🔥',
  Water: '💧',
  Air: '💨',
  Earth: '🌍',
} as const;

export function EnergyVisualization({
  showDetails = true,
  showHistory = false,
  className = ''
}: EnergyVisualizationProps) {
  const { isConnected, lastEnergyUpdate } = useAlchmWebSocket()
  const [energyHistory, setEnergyHistory] = React.useState<EnergyReading[]>([])
  const [maxHistoryLength] = React.useState(20)

  React.useEffect(() => {
    if (lastEnergyUpdate) {
      const newReading: EnergyReading = {
        timestamp: Date.now(),
        ...lastEnergyUpdate
      };

      setEnergyHistory(prev => {
        const updated = [...prev, newReading];
        return updated.slice(-maxHistoryLength)
      })

      logger.debug('EnergyVisualization received update', lastEnergyUpdate)
    }
  }, [lastEnergyUpdate, maxHistoryLength])

  const currentEnergy = lastEnergyUpdate || { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 };
  const totalEnergy = Object.values(currentEnergy).reduce((sum, val) => sum + val, 0)

  const renderEnergyBar = (element: keyof typeof ELEMENT_COLORS, value: number) => {
    const percentage = totalEnergy > 0 ? (value / totalEnergy) * 100 : 25;
    const color = ELEMENT_COLORS[element];

    return (
      <div key={element} style={{ marginBottom: '12px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: color,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {ELEMENT_SYMBOLS[element]} {element}
          </span>
          <span style={{
            fontSize: '12px',
            color: '#666',
            fontFamily: 'monospace'
          }}>
            {value.toFixed(3)} ({percentage.toFixed(1)}%)
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s ease',
            background: `linear-gradient(90deg, ${color}88, ${color})`
          }} />
        </div>
      </div>
    )
  };

  const renderCircularVisualization = () => {
    const radius = 60;
    const centerX = 80;
    const centerY = 80;
    const strokeWidth = 12;

    let currentAngle = -90; // Start at top

    return (
      <svg width="160" height="160" style={{ margin: '0 auto', display: 'block' }}>
        {Object.entries(currentEnergy).map(([element, value]) => {
          const percentage = totalEnergy > 0 ? (value / totalEnergy) * 100 : 25;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
          const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
          const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
          const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

          const largeArcFlag = angle > 180 ? 1 : 0;

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            'Z'
          ].join(' ')

          currentAngle += angle;

          return (
            <path
              key={element}
              d={pathData}
              fill={ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS]}
              stroke="#fff"
              strokeWidth="1"
              opacity="0.8"
            />
          )
        })}

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="25"
          fill="#fff"
          stroke="#ddd"
          strokeWidth="2"
        />

        {/* Status indicator */}
        <circle
          cx={centerX}
          cy={centerY}
          r="6"
          fill={isConnected ? '#28a745' : '#dc3545'}
        />
      </svg>
    )
  };

  const renderMiniChart = () => {
    if (energyHistory.length < 2) return null;

    const chartHeight = 60;
    const chartWidth = 200;
    const maxValue = Math.max(
      ...energyHistory.flatMap(reading => [reading.Fire, reading.Water, reading.Air, reading.Earth])
    )

    return (
      <div style={{ marginTop: '16px' }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: '#666'
        }}>
          Energy History (Last {energyHistory.length} readings)
        </h4>
        <svg width={chartWidth} height={chartHeight} style={{
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          backgroundColor: '#f8f9fa'
        }}>
          {Object.keys(ELEMENT_COLORS).map(element => {
            const points = energyHistory.map((reading, index) => {
              const x = (index / (energyHistory.length - 1)) * (chartWidth - 20) + 10;
              const y = chartHeight - 10 - ((reading[element as keyof EnergyReading] as number / maxValue) * (chartHeight - 20))
              return `${x},${y}`;
            }).join(' ')

            return (
              <polyline
                key={element}
                points={points}
                fill="none"
                stroke={ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS]}
                strokeWidth="2"
                opacity="0.8"
              />
            )
          })}
        </svg>
      </div>
    )
  };

  return (
    <div className={`energy-visualization ${className}`}
         style={{
           border: '1px solid #ddd',
           borderRadius: '8px',
           padding: '20px',
           backgroundColor: '#fff',
           minWidth: '300px'
         }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          color: '#333'
        }}>
          ⚡ Elemental Energy
        </h3>
        <div style={{
          fontSize: '12px',
          color: isConnected ? '#28a745' : '#dc3545',
          fontWeight: '500'
        }}>
          {isConnected ? '● Live' : '● Offline'}
        </div>
      </div>

      {/* Circular visualization */}
      <div style={{ marginBottom: '20px' }}>
        {renderCircularVisualization()}
      </div>

      {/* Energy bars */}
      {showDetails && (
        <div style={{ marginBottom: '16px' }}>
          {Object.entries(currentEnergy).map(([element, value]) =>
            renderEnergyBar(element as keyof typeof ELEMENT_COLORS, value)
          )}
        </div>
      )}

      {/* Total energy display */}
      <div style={{
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '4px'
        }}>
          Total Energy
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#333',
          fontFamily: 'monospace'
        }}>
          {totalEnergy.toFixed(3)}
        </div>
      </div>

      {/* History chart */}
      {showHistory && renderMiniChart()}

      {/* Status message */}
      {!lastEnergyUpdate && (
        <div style={{
          fontSize: '14px',
          color: '#999',
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          {isConnected ? 'Waiting for energy data...' : 'WebSocket disconnected'}
        </div>
      )}
    </div>
  )
}