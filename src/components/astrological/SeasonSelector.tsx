/**
 * Season Selector Component
 * Phase 5: Frontend Integration - Seasonal Selection
 */

import {
    Box,
    HStack,
    Icon,
    Select,
    Text,
    VStack,
    useColorModeValue
} from '@chakra-ui/react';
import React from 'react';
import {
    FaLeaf as FaAutumnLeaf,
    FaLeaf,
    FaSnowflake,
    FaSun
} from 'react-icons/fa';

interface SeasonSelectorProps {
  value: string,
  onChange: (season: string) => void,
  placeholder?: string,
  showDescription?: boolean,
  size?: 'sm' | 'md' | 'lg'
}

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];

const SEASON_INFO = {
  Spring: {
    icon: FaLeaf,
    color: 'green',
    description: 'Fresh growth, renewal, light flavors',
    ingredients: 'Asparagus, peas, strawberries, herbs',
  },
  Summer: {
    icon: FaSun,
    color: 'yellow',
    description: 'Abundance, grilling, vibrant colors',
    ingredients: 'Tomatoes, corn, berries, zucchini',
  },
  Autumn: {
    icon: FaAutumnLeaf,
    color: 'orange',
    description: 'Harvest, warmth, hearty flavors',
    ingredients: 'Squash, apples, root vegetables, spices',
  },
  Winter: {
    icon: FaSnowflake,
    color: 'blue',
    description: 'Comfort, warmth, preserved ingredients',
    ingredients: 'Citrus, root vegetables, preserved foods, spices',
  }
};

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  value,
  onChange,
  placeholder = "Select current season",
  showDescription = true,
  size = 'md'
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box>
      <Text mb={2} fontWeight="medium" fontSize="sm">
        Current Season
      </Text>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        size={size}
        bg={bgColor}
        borderColor={borderColor}
        _hover={{ borderColor: 'green.300' }}
        _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px green.500' }}
      >
        {SEASONS.map(season => (
          <option key={season} value={season}>
            {season}
          </option>
        ))}
      </Select>

      {value && showDescription && (
        <Box mt={2}>
          <HStack spacing={2} align="start">
            <Icon
              as={SEASON_INFO[value as keyof typeof SEASON_INFO].icon}
              color={`${SEASON_INFO[value as keyof typeof SEASON_INFO].color}.500`}
              boxSize={4}
              mt={0.5}
            />
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" fontWeight="medium" color="gray.700">
                {SEASON_INFO[value as keyof typeof SEASON_INFO].description}
              </Text>
              <Text fontSize="xs" color="gray.600">
                Featured: {SEASON_INFO[value as keyof typeof SEASON_INFO].ingredients}
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default SeasonSelector;
