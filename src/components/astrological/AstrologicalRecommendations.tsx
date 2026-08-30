"use client";

/**
 * Astrological Recommendations Component
 * Phase 5: Frontend Integration - Astrological UI Components
 *
 * Displays personalized cooking recommendations based on zodiac signs and seasons
 */

import {
    AlertIndicator, AlertRoot, Badge,
    Box,
    Button,
    ChakraProvider,
    defaultSystem,
    Flex, Heading, HStack, Icon,
    SimpleGrid,
    Spinner,
    Text,
    VStack
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import {
    FaLeaf,
    FaSnowflake,
    FaStar,
    FaSun,
    FaUtensils
} from "react-icons/fa";
import { z } from "zod";

type CardProps = React.ComponentProps<typeof Box>;

function Card({ children, ...props }: CardProps): React.JSX.Element {
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" {...props}>
      {children}
    </Box>
  );
}

function CardHeader({ children, ...props }: CardProps): React.JSX.Element {
  return <Box px={6} pt={6} {...props}>{children}</Box>;
}

function CardBody({ children, ...props }: CardProps): React.JSX.Element {
  return <Box px={6} pb={6} {...props}>{children}</Box>;
}

function Tooltip({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}): React.JSX.Element {
  return <span title={label}>{children}</span>;
}

const recommendationSchema = z.object({
  recipe_id: z.string(),
  name: z.string(),
  description: z.string(),
  cuisine: z.string(),
  zodiac_affinity_score: z.number().finite().optional(),
  seasonal_score: z.number().finite().optional(),
  matching_ingredients: z.number().finite().optional(),
  seasonal_ingredients: z.number().finite().optional(),
  reason: z.string(),
  type: z.string().optional(),
  priority: z.string().optional(),
});

const cookingPlanSchema = z.object({
  zodiac_sign: z.string().optional(),
  season: z.string().optional(),
  preferences: z.string().optional(),
  recommendations: z.array(recommendationSchema),
  insights: z.array(z.string()),
});

type CookingPlan = z.infer<typeof cookingPlanSchema>;

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

const SEASONS = ["spring", "summer", "autumn", "winter"] as const;

const ZODIAC_ELEMENTS: Record<(typeof ZODIAC_SIGNS)[number], string> = {
  Aries: "Fire",
  Taurus: "Earth",
  Gemini: "Air",
  Cancer: "Water",
  Leo: "Fire",
  Virgo: "Earth",
  Libra: "Air",
  Scorpio: "Water",
  Sagittarius: "Fire",
  Capricorn: "Earth",
  Aquarius: "Air",
  Pisces: "Water",
};

const SEASON_ICONS: Partial<Record<string, typeof FaLeaf>> = {
  spring: FaLeaf,
  summer: FaSun,
  autumn: FaLeaf,
  winter: FaSnowflake,
};

export const AstrologicalRecommendations: React.FC = () => {
  const [zodiacSign, setZodiacSignType] = useState<string>("");
  const [season, setSeason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [cookingPlan, setCookingPlan] = useState<CookingPlan | null>(null);
  const [error, setError] = useState<string>("");

  const bgColor = "gray.50";
  const cardBg = "white";

  const fetchCookingPlan = useCallback(async () => {
    if (!zodiacSign && !season) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (zodiacSign) params.append("zodiac_sign", zodiacSign);
      if (season) params.append("season", season);

      const response = await fetch(
        `http://localhost:8101/astrological/personalized-cooking?${params}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cooking recommendations");
      }

      const payload: unknown = await response.json();
      const parsed = cookingPlanSchema.safeParse(payload);
      if (!parsed.success) {
        throw new Error("Invalid cooking recommendation response");
      }
      setCookingPlan(parsed.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load recommendations",
      );
    } finally {
      setLoading(false);
    }
  }, [zodiacSign, season]);

  useEffect(() => {
    void fetchCookingPlan();
  }, [fetchCookingPlan]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "blue";
    }
  };

  return (
    <ChakraProvider value={defaultSystem}>
      <Box maxW="1200px" mx="auto" p={6}>
        <VStack gap={6} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="lg" mb={2} color="purple.600">
              🌟 Astrological Cooking Guide
            </Heading>
            <Text fontSize="md" color="gray.600">
              Discover recipes aligned with your zodiac energy and seasonal
              harmony
            </Text>
          </Box>

          {/* Selection Controls */}
          <Card bg={cardBg} shadow="md">
            <CardHeader>
              <Heading size="md">Personalize Your Recommendations</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Your Zodiac Sign
                  </Text>
                  <select
                    aria-label="Select your zodiac sign"
                    value={zodiacSign}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setZodiacSignType(e.target.value)
                    }
                  >
                    <option value="">Select your zodiac sign</option>
                    {ZODIAC_SIGNS.map((sign) => (
                      <option key={sign} value={sign}>
                        {sign} ({ZODIAC_ELEMENTS[sign]})
                      </option>
                    ))}
                  </select>
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Current Season
                  </Text>
                  <select
                    aria-label="Select current season"
                    value={season}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSeason(e.target.value)
                    }
                  >
                    <option value="">Select current season</option>
                    {SEASONS.map((seasonName) => (
                      <option key={seasonName} value={seasonName}>
                        {seasonName}
                      </option>
                    ))}
                  </select>
                </Box>
              </SimpleGrid>

              <Button
                mt={4}
                colorScheme="purple"
                onClick={() => {
                  void fetchCookingPlan();
                }}
                loading={loading}
                loadingText="Finding your perfect recipes..."
                disabled={!zodiacSign && !season}
              >
                Get Astrological Recommendations
              </Button>
            </CardBody>
          </Card>

          {/* Error Display */}
          {error && (
            <AlertRoot status="error">
              <AlertIndicator />
              {error}
            </AlertRoot>
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
            <VStack gap={6} align="stretch">
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
                    <VStack align="start" gap={2}>
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
                  <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
                    {cookingPlan.recommendations.map((rec, index) => (
                      <Card
                        key={rec.recipe_id || index}
                        bg={cardBg}
                        shadow="md"
                        _hover={{ shadow: "lg" }}
                      >
                        <CardHeader pb={2}>
                          <Flex justify="space-between" align="start">
                            <Box>
                              <Heading size="sm">{rec.name}</Heading>
                              <Text fontSize="sm" color="gray.600" mt={1}>
                                {rec.cuisine} Cuisine
                              </Text>
                            </Box>
                            <Badge colorScheme={getPriorityColor(rec.priority)}>
                              {rec.priority ?? "recommended"}
                            </Badge>
                          </Flex>
                        </CardHeader>

                        <CardBody pt={0}>
                          <VStack align="start" gap={3}>
                            <Text fontSize="sm" color="gray.700">
                              {rec.description}
                            </Text>

                            {/* Score Display */}
                            <HStack gap={4}>
                              {rec.zodiac_affinity_score !== undefined && (
                                <Tooltip
                                  label={`Zodiac affinity: ${(rec.zodiac_affinity_score * 100).toFixed(0)}%`}
                                >
                                  <HStack>
                                    <Icon as={FaStar} color="yellow.500" />
                                    <Text fontSize="sm" fontWeight="medium">
                                      {rec.zodiac_affinity_score.toFixed(2)}
                                    </Text>
                                  </HStack>
                                </Tooltip>
                              )}

                              {rec.seasonal_score !== undefined && (
                                <Tooltip
                                  label={`Seasonal compatibility: ${(rec.seasonal_score * 100).toFixed(0)}%`}
                                >
                                  <HStack>
                                    <Icon
                                      as={
                                        SEASON_ICONS[season] ?? FaLeaf
                                      }
                                      color="green.500"
                                    />
                                    <Text fontSize="sm" fontWeight="medium">
                                      {rec.seasonal_score.toFixed(2)}
                                    </Text>
                                  </HStack>
                                </Tooltip>
                              )}
                            </HStack>

                            {/* Ingredient Match Info */}
                            {(rec.matching_ingredients !== undefined ||
                              rec.seasonal_ingredients !== undefined) && (
                              <HStack gap={2}>
                                <Icon as={FaUtensils} color="blue.500" />
                                <Text fontSize="sm" color="gray.600">
                                  {rec.matching_ingredients !== undefined
                                    ? `${rec.matching_ingredients} zodiac-aligned ingredients`
                                    : rec.seasonal_ingredients !== undefined
                                      ? `${rec.seasonal_ingredients} seasonal ingredients`
                                      : ""}
                                </Text>
                              </HStack>
                            )}

                            {/* Reason */}
                            <Text
                              fontSize="sm"
                              fontStyle="italic"
                              color="purple.600"
                              bg="purple.50"
                              p={2}
                              borderRadius="md"
                            >
                              {rec.reason}
                            </Text>

                            {/* Action Button */}
                            <Button
                              size="sm"
                              colorScheme="purple"
                              variant="outline"
                              w="full"
                            >
                              View Recipe Details
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>
              ) : (
                <Card bg={cardBg} shadow="md">
                  <CardBody textAlign="center" py={8}>
                    <Icon as={FaStar} boxSize={12} color="gray.400" mb={4} />
                    <Text fontSize="lg" color="gray.600">
                      No recipes found for your current selections. Try
                      adjusting your zodiac sign or season preferences.
                    </Text>
                  </CardBody>
                </Card>
              )}
            </VStack>
          )}

          {/* Instructions for new users */}
          {!cookingPlan && !loading && (
            <Card bg={bgColor} border="2px dashed" borderColor="purple.200">
              <CardBody textAlign="center" py={8}>
                <VStack gap={4}>
                  <Icon as={FaStar} boxSize={16} color="purple.300" />
                  <Box>
                    <Heading size="md" mb={2}>
                      Welcome to Astrological Cooking
                    </Heading>
                    <Text color="gray.600" mb={4}>
                      Discover recipes that resonate with your zodiac energy and
                      seasonal harmony. Select your zodiac sign and current season
                      to get personalized recommendations.
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      💫 Each recommendation is calculated based on planetary
                      influences and elemental compatibility
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

export default AstrologicalRecommendations;
