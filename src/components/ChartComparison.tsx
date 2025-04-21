import React from 'react';
import { UserProfileChart } from './UserProfileChart';
import useCurrentChart from '../hooks/useCurrentChart';
import { useUser } from '../contexts/UserContext';

interface ChartComparisonProps {
  className?: string;
}

export const ChartComparison: React.FC<ChartComparisonProps> = ({ className }) => {
  const { currentUser } = useUser();
  const { createChartSvg, chartData, isLoading: currentChartLoading } = useCurrentChart();
  
  // Get the current chart visualization
  const { svgContent: currentChartSvg } = createChartSvg();
  
  if (!currentUser) {
    return (
      <div className={`chart-comparison-container no-user ${className || ''}`}>
        <div className="chart-error">
          No user profile is available. Please create a profile with your birth information first.
        </div>
      </div>
    );
  }
  
  return (
    <div className={`chart-comparison-container ${className || ''}`}>
      <h2>Chart Comparison</h2>
      <p>Compare your birth chart with the current astrological chart to see how current planetary energies are influencing you.</p>
      
      <div className="charts-grid">
        <div className="birth-chart">
          <UserProfileChart />
        </div>
        
        <div className="current-chart">
          <h3>Current Astrological Chart</h3>
          {currentChartLoading ? (
            <div className="loading">Loading current chart...</div>
          ) : (
            <>
              <div 
                className="chart-svg" 
                dangerouslySetInnerHTML={{ __html: currentChartSvg }} 
                style={{ maxWidth: '320px', margin: '0 auto' }}
              />
              
              {/* Current Elemental Balance */}
              <div className="elemental-balance">
                <h4>Current Elemental Balance</h4>
                <div className="element-bars">
                  {chartData && (chartData as any).elements && Object.entries((chartData as any).elements).map(([element, value]) => (
                    <div key={element} className="element-bar">
                      <div className="element-label">{element}</div>
                      <div className="bar-container">
                        <div className={`bar-fill ${element.toLowerCase()}`} style={{ width: `${Number(value) * 100}%` }}></div>
                      </div>
                      <div className="percentage">{Math.round(Number(value) * 100)}%</div>
                    </div>
                  ))}
                </div>
                {chartData && (chartData as any).dominantElement && (
                  <div className="dominant-element">
                    Dominant Element: <strong>{(chartData as any).dominantElement}</strong>
                  </div>
                )}
                
                {chartData && (chartData as any).dominantModality && (
                  <div className="dominant-modality">
                    Dominant Modality: <strong>{(chartData as any).dominantModality}</strong>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="chart-synthesis">
        <h3>Chart Synthesis</h3>
        <p>
          Your birth chart represents your core astrological blueprint, while the current chart shows 
          the present cosmic energies. The combination of these charts creates your unique astrological 
          profile for the current moment.
        </p>
        <p>
          <strong>Coming Soon:</strong> Detailed synthesis analysis showing how current transits are
          affecting your natal planets and houses.
        </p>
      </div>
    </div>
  );
};

// Helper function to get color for element display
const getElementColor = (element: string): string => {
  const colorMap: Record<string, string> = {
    Fire: '#FF5733',
    Water: '#0074D9',
    Earth: '#3D9970',
    Air: '#FFDC00'
  };
  return colorMap[element] || '#777777';
};

export default ChartComparison; 