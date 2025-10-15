/**
 * Astrological Recommendations Component
 * Phase 5: Frontend Integration - Astrological UI Components
 *
 * Displays personalized cooking recommendations based on zodiac signs and seasons
 */

import {
    Alert,
    AlertIcon,
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    HStack,
    Heading,
    Icon,
    Select,
    SimpleGrid,
    Spinner,
    Text,
    Tooltip,
    VStack,
    useColorModeValue
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FaFire,
    FaLeaf,
    FaSnowflake,
    FaStar,
    FaSun,
    FaUtensils
} from 'react-icons/fa';

interface AstrologicalRecommendation {
  recipe_id: string,
  name: string,
  description: string,
  cuisine: string,
  zodiac_affinity_score?: number,
  seasonal_score?: number,
  matching_ingredients?: number,
  seasonal_ingredients?: number,
  reason: string,
  type?: string,
  priority?: string;
}

interface CookingPlan {
  zodiac_sign?: string,
  season?: string,
  preferences?: string,
  recommendations: AstrologicalRecommendation[],
  insights: string[];
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];

const ZODIAC_ELEMENTS = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water'
};

const SEASON_ICONS = {
  Spring: FaLeaf,
  Summer: FaSun,
  Autumn: FaLeaf,
  Winter: FaSnowflake
};

export const AstrologicalRecommendations: React.FC = () => {
  const [zodiacSign, setZodiacSign] = useState<string>('');
  const [season, setSeason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [cookingPlan, setCookingPlan] = useState<CookingPlan | null>(null);
  const [error, setError] = useState<string>('');

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');

  const fetchCookingPlan = useCallback(async () => {
    if (!zodiacSign && !season) return;

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (zodiacSign) params.append('zodiac_sign', zodiacSign);
      if (season) params.append('season', season);

      const response = await fetch(`http: //localhost:8101/astrological/personalized-cooking?${params}`),
      if (!response.ok) {
        throw new Error('Failed to fetch cooking recommendations');
      }

      const data = await response.json();
      setCookingPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [zodiacSign, season]);

  useEffect(() => {
    if (zodiacSign || season) {
      fetchCookingPlan();
    }
  }, [fetchCookingPlan]);

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire':
        return FaFire;
      case 'Water':
        return FaSnowflake;
      case 'Earth':
        return FaLeaf;
      case 'Air':
        return FaSun;
      default:
        return FaStar;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'red',
      case 'medium': return 'orange',
      case 'low': return 'green',
      default: return 'blue';
    }
  };

  return (
    <Box maxW="1200px" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="lg" mb={2} color="purple.600">
            🌟 Astrological Cooking Guide
          </Heading>
          <Text fontSize="md" color="gray.600">
            Discover recipes aligned with your zodiac energy and seasonal harmony
          </Text>
        </Box>

        {/* Selection Controls */}
        <Card bg={cardBg} shadow="md">
          <CardHeader>
            <Heading size="md">Personalize Your Recommendations</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box>
                <Text mb={2} fontWeight="medium">Your Zodiac Sign</Text>
                <Select
                  placeholder="Select your zodiac sign"
                  value={zodiacSign}
                  onChange={(e) => setZodiacSign(e.target.value)}
                >
                  {ZODIAC_SIGNS.map(sign => (
                    <option key={sign} value={sign}>
                      {sign} ({ZODIAC_ELEMENTS[sign as keyof typeof ZODIAC_ELEMENTS]})
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text mb={2} fontWeight="medium">Current Season</Text>
                <Select
                  placeholder="Select current season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                >
                  {SEASONS.map(seasonName => (
                    <option key={seasonName} value={seasonName}>
                      {seasonName}
                    </option>
                  ))}
                </Select>
              </Box>
            </SimpleGrid>

            <Button
              mt={4}
              colorScheme="purple"
              onClick={fetchCookingPlan}
              isLoading={loading}
              loadingText="Finding your perfect recipes..."
              isDisabled={!zodiacSign && !season}
            >
              Get Astrological Recommendations
            </Button>
          </CardBody>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" color="purple.500" />
            <Text mt={4}>Consulting the stars for your perfect recipes...</Text>
          </Box>
        )}

        {/* Cooking Plan Results */}
        {cookingPlan && !loading && (
          <VStack spacing={6} align="stretch">
            {/* Insights */}
            {cookingPlan.insights.length > 0 && (
              <Card bg={cardBg} shadow="md">
                <CardHeader>
                  <Heading size="md" display="flex" alignItems="center">
                    <Icon as={FaStar} mr={2} color="yellow.500" />
                    Astrological Insights
                  </Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    {cookingPlan.insights.map((insight, index) => (
                      <Text key={index} fontStyle="italic" color="purple.600">
                        ✨ {insight}
                      </Text>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Recommendations */}
            {cookingPlan.recommendations.length > 0 ? (
              <Box>
                <Heading size="md" mb={4}>
                  Your Personalized Recipe Recommendations
                </Heading>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                  {cookingPlan.recommendations.map((rec, index) => (
                    <Card key={rec.recipe_id || index} bg={cardBg} shadow="md" _hover={{ shadow: 'lg' }}>
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="start">
                          <Box>
                            <Heading size="sm">{rec.name}</Heading>
                            <Text fontSize="sm" color="gray.600" mt={1}>
                              {rec.cuisine} Cuisine
                            </Text>
                          </Box>
                          <Badge colorScheme={getPriorityColor(rec.priority)}>
                            {rec.priority || 'recommended'}
                          </Badge>
                        </Flex>
                      </CardHeader>

                      <CardBody pt={0}>
                        <VStack align="start" spacing={3}>
                          <Text fontSize="sm" color="gray.700">
                            {rec.description}
                          </Text>

                          {/* Score Display */}
                          <HStack spacing={4}>
                            {rec.zodiac_affinity_score && (
                              <Tooltip label={`Zodiac affinity: ${(rec.zodiac_affinity_score * 100).toFixed(0)}%`}>
                                <HStack>
                                  <Icon as={FaStar} color="yellow.500" />
                                  <Text fontSize="sm" fontWeight="medium">
                                    {rec.zodiac_affinity_score.toFixed(2)}
                                  </Text>
                                </HStack>
                              </Tooltip>
                            )}

                            {rec.seasonal_score && (
                              <Tooltip label={`Seasonal compatibility: ${(rec.seasonal_score * 100).toFixed(0)}%`}>
                                <HStack>
                                  <Icon as={SEASON_ICONS[season as keyof typeof SEASON_ICONS] || FaLeaf} color="green.500" />
                                  <Text fontSize="sm" fontWeight="medium">
                                    {rec.seasonal_score.toFixed(2)}
                                  </Text>
                                </HStack>
                              </Tooltip>
                            )}
                          </HStack>

                          {/* Ingredient Match Info */}
                          {(rec.matching_ingredients || rec.seasonal_ingredients) && (
                            <HStack spacing={2}>
                              <Icon as={FaUtensils} color="blue.500" />
                              <Text fontSize="sm" color="gray.600">
                                {rec.matching_ingredients ? `${rec.matching_ingredients} zodiac-aligned ingredients` :
                                 rec.seasonal_ingredients ? `${rec.seasonal_ingredients} seasonal ingredients` : ''}
                              </Text>
                            </HStack>
                          )}

                          {/* Reason */}
                          <Text fontSize="sm" fontStyle="italic" color="purple.600" bg="purple.50" p={2} borderRadius="md">
                            {rec.reason}
                          </Text>

                          {/* Action Button */}
                          <Button size="sm" colorScheme="purple" variant="outline" w="full">
                            View Recipe Details
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </Box>
            ) : (
              cookingPlan && (
                <Card bg={cardBg} shadow="md">
                  <CardBody textAlign="center" py={8}>
                    <Icon as={FaStar} boxSize={12} color="gray.400" mb={4} />
                    <Text fontSize="lg" color="gray.600">
                      No recipes found for your current selections.
                      Try adjusting your zodiac sign or season preferences.
                    </Text>
                  </CardBody>
                </Card>
              )
            )}
          </VStack>
        )}

        {/* Instructions for new users */}
        {!cookingPlan && !loading && (
          <Card bg={bgColor} border="2px dashed" borderColor="purple.200">
            <CardBody textAlign="center" py={8}>
              <VStack spacing={4}>
                <Icon as={FaStar} boxSize={16} color="purple.300" />
                <Box>
                  <Heading size="md" mb={2}>Welcome to Astrological Cooking</Heading>
                  <Text color="gray.600" mb={4}>
                    Discover recipes that resonate with your zodiac energy and seasonal harmony.
                    Select your zodiac sign and current season to get personalized recommendations.
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    💫 Each recommendation is calculated based on planetary influences and elemental compatibility
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default AstrologicalRecommendations;
