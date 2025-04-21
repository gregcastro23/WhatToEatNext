/**
 * Utility functions for the AlchemicalContext
 */

/**
 * Creates an SVG representation of an astrological chart
 * @param normalizedPositions Normalized planetary positions
 * @param elementalState Elemental state values
 * @param lunarPhase Current lunar phase
 * @param dominantElement The dominant element
 * @returns SVG string representation of the chart
 */
export function createChartSvg(
  normalizedPositions: Record<string, unknown>,
  elementalState: Record<string, number>,
  lunarPhase: string,
  dominantElement: string
): string | null {
  try {
    // Simple SVG chart representation
    const width = 500;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 50;
    
    // Create the base SVG
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Add background
    svg += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#f8f9fa" stroke="#333" stroke-width="1" />`;
    
    // Add zodiac wheel
    const signs = [
      { name: 'aries', color: '#ff5722', textColor: '#fff' },
      { name: 'taurus', color: '#4caf50', textColor: '#fff' },
      { name: 'gemini', color: '#ffeb3b', textColor: '#333' },
      { name: 'cancer', color: '#2196f3', textColor: '#fff' },
      { name: 'leo', color: '#ff5722', textColor: '#fff' },
      { name: 'virgo', color: '#4caf50', textColor: '#fff' },
      { name: 'libra', color: '#ffeb3b', textColor: '#333' },
      { name: 'scorpio', color: '#2196f3', textColor: '#fff' },
      { name: 'sagittarius', color: '#ff5722', textColor: '#fff' },
      { name: 'capricorn', color: '#4caf50', textColor: '#fff' },
      { name: 'aquarius', color: '#ffeb3b', textColor: '#333' },
      { name: 'pisces', color: '#2196f3', textColor: '#fff' }
    ];
    
    // Draw zodiac segments
    for (let i = 0; i < 12; i++) {
      const startAngle = i * 30 * Math.PI / 180;
      const endAngle = (i + 1) * 30 * Math.PI / 180;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      // Create the path for the segment
      const largeArcFlag = 0; // Small arc (less than 180 degrees)
      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      svg += `<path d="${path}" fill="${signs[i].color}" fill-opacity="0.3" stroke="#333" stroke-width="1" />`;
      
      // Add sign label
      const labelAngle = (i * 30 + 15) * Math.PI / 180;
      const labelX = centerX + (radius - 25) * Math.cos(labelAngle);
      const labelY = centerY + (radius - 25) * Math.sin(labelAngle);
      
      svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" 
              fill="${signs[i].textColor}" font-size="12" transform="rotate(${i * 30 + 15}, ${labelX}, ${labelY})">
              ${signs[i].name.charAt(0).toUpperCase()}
              </text>`;
    }
    
    // Add elemental quadrants indicators
    const elementColors: Record<string, string> = {
      'Fire': '#ff5722',
      'Earth': '#4caf50',
      'Air': '#ffeb3b',
      'Water': '#2196f3'
    };
    
    // Draw elemental indicators
    Object.entries(elementalState).forEach(([element, value], index) => {
      const barHeight = value * 80; // Scale the bar height
      const barWidth = 20;
      const barX = 20 + index * 30;
      const barY = height - 20 - barHeight;
      
      // Use proper typing instead of @ts-ignore
      const color = elementColors[element as keyof typeof elementColors] || '#999';
      
      svg += `<rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" 
              fill="${color}" stroke="#333" stroke-width="1" />`;
      
      svg += `<text x="${barX + barWidth/2}" y="${barY - 10}" text-anchor="middle" 
              fill="#333" font-size="12">${element}</text>`;
    });
    
    // Add planets based on normalized positions
    Object.entries(normalizedPositions).forEach(([planet, data]) => {
      if (!data?.absoluteDegree) return;
      
      const angle = data.absoluteDegree * Math.PI / 180;
      const distance = radius * 0.7; // Position planets inside the wheel
      
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      
      // Draw planet symbol
      svg += `<circle cx="${x}" cy="${y}" r="5" fill="#333" />`;
      
      // Add planet label
      svg += `<text x="${x}" y="${y - 10}" text-anchor="middle" fill="#333" font-size="10">
              ${planet.charAt(0).toUpperCase()}
              </text>`;
    });
    
    // Add dominant element indicator
    svg += `<text x="${centerX}" y="${centerY + radius + 30}" text-anchor="middle" 
            fill="#333" font-size="14" font-weight="bold">
            Dominant: ${dominantElement}
            </text>`;
    
    // Close SVG
    svg += `</svg>`;
    
    return svg;
  } catch (error) {
    console.error('Error creating chart SVG:', error);
    return null;
  }
} 