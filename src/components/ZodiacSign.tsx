import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { ZodiacSign as ZodiacSignType } from '@/types/alchemy';

interface ZodiacSignProps {
  sign: ZodiacSignType;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showTooltip?: boolean;
}

const zodiacEmoji: Record<string, string> = {
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

const zodiacElement: Record<string, string> = {
  aries: 'Fire',
  taurus: 'Earth',
  gemini: 'Air',
  cancer: 'Water',
  leo: 'Fire',
  virgo: 'Earth',
  libra: 'Air',
  scorpio: 'Water',
  sagittarius: 'Fire',
  capricorn: 'Earth',
  aquarius: 'Air',
  pisces: 'Water'
};

const elementColor: Record<string, string> = {
  Fire: '#FF5722',
  Earth: '#8D6E63',
  Air: '#03A9F4',
  Water: '#0288D1'
};

export const ZodiacSign: React.FC<ZodiacSignProps> = ({ 
  sign, 
  size = 'medium',
  showLabel = false,
  showTooltip = true
}) => {
  const signName = sign.toLowerCase() as ZodiacSignType;
  const element = zodiacElement[signName] || 'Unknown';
  const emoji = zodiacEmoji[signName] || '?';
  
  const sizeMap = {
    small: { fontSize: '1.5rem', padding: '0.2rem' },
    medium: { fontSize: '2rem', padding: '0.5rem' },
    large: { fontSize: '3rem', padding: '0.8rem' }
  };
  
  const formattedName = signName.charAt(0).toUpperCase() + signName.slice(1);
  
  return (
    <Tooltip title={`${formattedName} (${element})`}>
      <Box 
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: '50%',
          backgroundColor: `${elementColor[element]}22`,
          border: `2px solid ${elementColor[element]}`,
          ...sizeMap[size],
          width: sizeMap[size].fontSize,
          height: sizeMap[size].fontSize,
          justifyContent: 'center',
          lineHeight: 1,
          color: elementColor[element]
        }}
      >
        {emoji}
        {showLabel && (
          <Box sx={{ fontSize: '0.7em', mt: 0.5 }}>
            {formattedName}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default ZodiacSign; 