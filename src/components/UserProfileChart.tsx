import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { ChartService } from '../services/ChartService';
import { BirthChart } from '../types/astrology';
import { ElementalProperties } from '../types/alchemy';
import { calculateElementalProperties, getDefaultPlanetaryPositions, calculateAlchemicalValues, calculateEnergeticProperties, getDominantElement } from '../utils/componentInitializer';

// Define zodiac and planet symbols for the chart
const zodiacSymbols: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓'
};

const planetSymbols: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  northNode: '☊',
  southNode: '☋'
};

// Colors for the chart elements
const signColors: Record<string, string> = {
  aries: '#FF5733',
  taurus: '#8B4513',
  gemini: '#FFD700',
  cancer: '#87CEEB',
  leo: '#FFA500',
  virgo: '#228B22',
  libra: '#6A0DAD',
  scorpio: '#8B0000',
  sagittarius: '#FF4500',
  capricorn: '#2F4F4F',
  aquarius: '#00BFFF',
  pisces: '#9932CC'
};

const planetColors: Record<string, string> = {
  sun: '#FFA500',
  moon: '#C0C0C0',
  mercury: '#9966CC',
  venus: '#FF69B4',
  mars: '#FF0000',
  jupiter: '#4B0082',
  saturn: '#708090',
  uranus: '#00FFFF',
  neptune: '#0000FF',
  pluto: '#800000',
  northNode: '#006400',
  southNode: '#8B0000'
};

interface UserProfileChartProps {
  className?: string;
}

export const UserProfileChart: React.FC<UserProfileChartProps> = ({ className }) => {
  const { currentUser } = useUser();
  const [birthChart, setBirthChart] = useState<BirthChart | null>(null);
  const [chartSvg, setChartSvg] = useState<string>('');
  const [elementalBalance, setElementalBalance] = useState<ElementalProperties>({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  });
  const [alchemicalValues, setAlchemicalValues] = useState({
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0
  });
  const [energeticProperties, setEnergeticProperties] = useState({
    Heat: 0,
    Entropy: 0,
    Reactivity: 0,
    Energy: 0
  });
  const [dominantElement, setDominantElement] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load the birth chart when the component mounts or when the user changes
    const loadBirthChart = async () => {
      if (!currentUser || !currentUser.birthDate) {
        setError('User profile or birth date not available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const chartService = ChartService.getInstance();
        
        // Create birth info from user profile
        const birthInfo = {
          birthDate: currentUser.birthDate,
          birthTime: currentUser.birthTime,
          birthLocation: currentUser.birthLocation
        };
        
        // Calculate birth chart
        const chart = await chartService.createBirthChart(birthInfo);
        setBirthChart(chart);
        
        // Calculate additional properties
        const elemental = calculateElementalProperties(birthInfo, chart.planetaryPositions);
        setElementalBalance(elemental);
        
        const alchemical = calculateAlchemicalValues(birthInfo, chart.planetaryPositions);
        setAlchemicalValues(alchemical);
        
        const energetic = calculateEnergeticProperties(alchemical);
        setEnergeticProperties(energetic);
        
        const dominant = getDominantElement(elemental);
        setDominantElement(dominant);
        
        // Create chart visualization
        createChartSvg(chart);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading birth chart:', err);
        setError('Failed to load birth chart');
        setIsLoading(false);
      }
    };

    loadBirthChart();
  }, [currentUser]);

  const createChartSvg = (chart: BirthChart) => {
    try {
      // Format planetary data for display
      const formattedPlanets: Record<string, unknown> = {};
      Object.entries(chart.planetaryPositions).forEach(([planet, longitude]) => {
        const lowerPlanet = planet.toLowerCase();
        const sign = getSignFromLongitude(longitude);
        const degree = getSignDegree(longitude);
        
        formattedPlanets[lowerPlanet] = {
          sign,
          degree,
          exactLongitude: longitude,
          isRetrograde: false // Add retrograde detection if data is available
        };
      });
      
      // Calculate positions for planets in the chart
      const planetPositions = Object.entries(formattedPlanets).map(([planet, data]) => {
        const exactLong = data.exactLongitude || 0;
        const angle = (exactLong * Math.PI) / 180; // Convert to radians
        return {
          planet,
          symbol: planetSymbols[planet] || planet,
          sign: data.sign,
          signSymbol: zodiacSymbols[data.sign] || data.sign,
          degree: data.degree,
          isRetrograde: data.isRetrograde,
          angle,
          x: 150 + 100 * Math.sin(angle), // Use sine for x
          y: 150 - 100 * Math.cos(angle), // Use negative cosine for y
          color: planetColors[planet] || '#555555'
        };
      });

      // Create SVG content
      const svgContent = `
      <svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <!-- Background -->
        <circle cx="160" cy="160" r="150" fill="#f9f9f9" stroke="#ddd" stroke-width="1" />
        
        <!-- Zodiac wheel -->
        <g class="zodiac-wheel">
          ${Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * Math.PI / 180; // Start from top (270 deg or -90 deg)
            const sign = Object.keys(zodiacSymbols)[i];
            const color = signColors[sign] || '#999';
            const startAngle = (i * 30 - 90) * Math.PI / 180;
            const endAngle = ((i + 1) * 30 - 90) * Math.PI / 180;
            
            const startX = 160 + 145 * Math.cos(startAngle);
            const startY = 160 + 145 * Math.sin(startAngle);
            const endX = 160 + 145 * Math.cos(endAngle);
            const endY = 160 + 145 * Math.sin(endAngle);
            
            // Use arc paths for the zodiac segments
            const largeArcFlag = 0; // 0 for arcs less than 180 degrees
            
            return `
              <path d="M 160 160 L ${startX} ${startY} A 145 145 0 ${largeArcFlag} 1 ${endX} ${endY} Z" 
                    fill="${color}" fill-opacity="0.1" stroke="${color}" stroke-width="0.5" />
              <text x="${160 + 135 * Math.cos((i * 30 + 15 - 90) * Math.PI / 180)}" 
                    y="${160 + 135 * Math.sin((i * 30 + 15 - 90) * Math.PI / 180)}" 
                    text-anchor="middle" dominant-baseline="middle" 
                    fill="${color}" font-size="14" font-weight="bold">
                ${zodiacSymbols[Object.keys(zodiacSymbols)[i]]}
              </text>
            `;
          }).join('')}
        </g>
        
        <!-- Degree circles -->
        <circle cx="160" cy="160" r="120" fill="none" stroke="#ccc" stroke-width="0.5" stroke-dasharray="2,2"/>
        <circle cx="160" cy="160" r="80" fill="none" stroke="#ccc" stroke-width="0.5" stroke-dasharray="2,2"/>
        <circle cx="160" cy="160" r="40" fill="none" stroke="#ccc" stroke-width="0.5" stroke-dasharray="2,2"/>
        
        <!-- Ascendant marker -->
        ${chart.ascendant ? (() => {
          const ascendantSign = chart.ascendant.toLowerCase();
          const ascendantDegree = chart.ascendantDegree || 0;
          const ascendantLongitude = getSignIndex(ascendantSign) * 30 + ascendantDegree;
          const ascendantAngle = (ascendantLongitude - 90) * Math.PI / 180;
          
          return `
            <line 
              x1="160" 
              y1="160" 
              x2="${160 + 150 * Math.cos(ascendantAngle)}" 
              y2="${160 + 150 * Math.sin(ascendantAngle)}" 
              stroke="#FF0000" 
              stroke-width="2" 
              stroke-dasharray="5,3" 
            />
            <text 
              x="${160 + 160 * Math.cos(ascendantAngle)}" 
              y="${160 + 160 * Math.sin(ascendantAngle)}" 
              text-anchor="middle" 
              dominant-baseline="middle" 
              fill="#FF0000" 
              font-size="12" 
              font-weight="bold"
            >
              ASC
            </text>
          `;
        })() : ''}
        
        <!-- Planets -->
        <g class="planets">
          ${planetPositions.map(p => {
            // Skip the North and South Nodes as they're now drawn separately
            if (p.planet === 'northNode' || p.planet === 'southNode') return '';
            
            return `
              <g class="planet" filter="url(#glow)">
                <circle cx="${p.x}" cy="${p.y}" r="12" 
                        fill="${p.color}" fill-opacity="0.2" stroke="${p.color}" stroke-width="0.5" />
                <text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" 
                      fill="${p.color}" font-size="10" font-weight="bold">
                  ${p.symbol}
                </text>
                <text x="${p.x}" y="${p.y + 18}" text-anchor="middle" dominant-baseline="middle" 
                      fill="${p.color}" font-size="7">
                  ${p.degree.toFixed(0)}° ${p.isRetrograde ? '℞' : ''}
                </text>
              </g>
            `;
          }).join('')}
        </g>
        
        <!-- Chart title and info -->
        <text x="160" y="20" text-anchor="middle" fill="#333" font-size="14" font-weight="bold">
          Birth Chart
        </text>
      </svg>
      `;

      setChartSvg(svgContent);
    } catch (err) {
      console.error('Error creating chart SVG:', err);
      setError('Failed to create chart visualization');
    }
  };

  // Helper function to convert longitude to zodiac sign
  const getSignFromLongitude = (longitude: number): string => {
    const signIndex = Math.floor((longitude % 360) / 30);
    const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                   'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    return signs[signIndex];
  };

  // Helper function to get the degree within the sign (0-29)
  const getSignDegree = (longitude: number): number => {
    return Math.floor(longitude % 30);
  };

  // Helper function to get sign index (0-11)
  const getSignIndex = (sign: string): number => {
    const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                   'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    return signs.indexOf(sign.toLowerCase());
  };

  if (isLoading) {
    return <div className={`user-chart-loading ${className || ''}`}>Loading birth chart...</div>;
  }

  if (error) {
    return <div className={`user-chart-error ${className || ''}`}>Error: {error}</div>;
  }

  if (!birthChart) {
    return <div className={`user-chart-missing ${className || ''}`}>Birth chart not available. Please check your profile settings.</div>;
  }

  return (
    <div className={`user-chart-container ${className || ''}`}>
      <h3>Your Birth Chart</h3>
      
      {/* Chart SVG */}
      <div 
        className="chart-svg" 
        dangerouslySetInnerHTML={{ __html: chartSvg }}
        style={{ maxWidth: '320px', margin: '0 auto' }}
      />
      
      {/* Elemental Balance */}
      <div className="elemental-balance">
        <h4>Elemental Balance</h4>
        <div className="element-bars">
          {Object.entries(elementalBalance).map(([element, value]) => (
            <div key={element} className="element-bar">
              <div className="element-label">{element}</div>
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{ 
                    width: `${(value * 100).toFixed(0)}%`,
                    backgroundColor: getElementColor(element)
                  }}
                ></div>
              </div>
              <div className="element-value">{(value * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
        <div className="dominant-element">
          Dominant Element: <strong>{dominantElement}</strong>
        </div>
      </div>
      
      {/* Alchemical Properties */}
      <div className="alchemical-properties">
        <h4>Alchemical Properties</h4>
        <div className="properties-grid">
          {Object.entries(alchemicalValues).map(([property, value]) => (
            <div key={property} className="property">
              <div className="property-label">{property}</div>
              <div className="property-value">{value.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Energetic Properties */}
      <div className="energetic-properties">
        <h4>Energetic Properties</h4>
        <div className="properties-grid">
          {Object.entries(energeticProperties).map(([property, value]) => (
            <div key={property} className="property">
              <div className="property-label">{property}</div>
              <div className="property-value">{value.toFixed(2)}</div>
            </div>
          ))}
        </div>
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

export default UserProfileChart; 