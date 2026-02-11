"use client";

/**
 * Current Moment Cuisine Recommendations Component
 * Phase 6: Complete Astrological Cuisine Integration
 *
 * Displays cuisine recommendations based on current astrological moment
 * with nested recipes and sauce recommendations
 */

import {
  AccordionRoot,
  AccordionItem as _AccordionItem,
  AccordionItemTrigger as _AccordionItemTrigger,
  AccordionItemContent as _AccordionItemContent,
  AccordionItemIndicator,
  AlertRoot,
  AlertIndicator,
  AlertContent,
  Badge,
  Box,
  Button,
  Card as _Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  HStack,
  Heading,
  Icon,
  ListRoot,
  ListItem,
  ListIndicator,
  Progress as _Progress,
  SimpleGrid,
  Spinner,
  TagRoot,
  TagLabel,
  Text,
  Tooltip as _Tooltip,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

const Card = _Card as any;
const Tooltip = _Tooltip as any;
const Progress = _Progress as any;
const AccordionItem = _AccordionItem as any;
const AccordionItemTrigger = _AccordionItemTrigger as any;
const AccordionItemContent = _AccordionItemContent as any;

import React, { useCallback, useEffect, useState } from "react";
import {
  FaAppleAlt,
  FaClock,
  FaFire,
  FaLeaf,
  FaMagic,
  FaPepperHot,
  FaSeedling,
  FaSnowflake,
  FaStar,
  FaSun,
  FaUsers,
  FaUtensils,
  FaWater,
  FaWind,
} from "react-icons/fa";

interface CurrentMoment {
  zodiac_sign: string;
  season: string;
  meal_type?: string;
  timestamp: string;
}

interface NestedRecipe {
  recipe_id: string;
  name: string;
  description: string;
  prep_time?: string;
  cook_time?: string;
  servings?: number;
  difficulty?: string;
  ingredients: Array<{
    name: string;
    amount?: string;
    unit?: string;
    notes?: string;
  }>;
  instructions: string[];
  meal_type: string;
  seasonal_fit: string;
}

interface SauceRecommendation {
  sauce_name: string;
  description: string;
  key_ingredients?: string[];
  elemental_properties?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  compatibility_score: number;
  reason: string;
}

interface ThermodynamicMetrics {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
}

interface KineticMetrics {
  velocity: Record<string, number>;
  momentum: Record<string, number>;
  charge: number;
  potentialDifference: number;
  currentFlow: number;
  power: number;
  inertia: number;
  forceMagnitude: number;
  forceClassification: string;
}

interface FlavorProfile {
  sweet: number;
  sour: number;
  salty: number;
  bitter: number;
  umami: number;
  spicy: number;
}

interface CuisineSignature {
  property: string;
  value: number;
  zScore: number;
  significance: "high" | "medium" | "low";
}

interface FusionPairing {
  cuisine_id: string;
  name: string;
  compatibility_score: number;
  blend_ratio: number;
  shared_elements: string[];
  thermodynamic_harmony: number;
  reason: string;
}

interface CuisineRecommendation {
  cuisine_id: string;
  name: string;
  description: string;
  elemental_properties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  alchemical_properties?: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  thermodynamic_metrics?: ThermodynamicMetrics;
  kinetic_properties?: KineticMetrics;
  flavor_profile?: FlavorProfile;
  cultural_signatures?: CuisineSignature[];
  fusion_pairings?: FusionPairing[];
  nested_recipes: NestedRecipe[];
  recommended_sauces: SauceRecommendation[];
  seasonal_context: string;
  astrological_score: number;
  compatibility_reason: string;
}

interface CuisineResponse {
  current_moment: CurrentMoment;
  cuisine_recommendations: CuisineRecommendation[];
  total_recommendations: number;
}

const ZODIAC_ELEMENTS = {
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

const SEASON_ICONS = {
  Spring: FaSeedling,
  Summer: FaSun,
  Autumn: FaLeaf,
  Winter: FaSnowflake,
};

const ELEMENT_ICONS = {
  Fire: FaFire,
  Water: FaWater,
  Earth: FaSeedling,
  Air: FaWind,
};

const ELEMENT_COLORS = {
  Fire: "red",
  Water: "blue",
  Earth: "green",
  Air: "cyan",
};

export const CurrentMomentCuisineRecommendations: React.FC = () => {
  const [data, setData] = useState<CuisineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const bgColor = "gray.50";
  const cardBg = "white";

  const fetchCuisineRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/cuisines/recommend");
      if (!response.ok) {
        throw new Error("Failed to fetch cuisine recommendations");
      }

      const cuisineData = await response.json();
      setData(cuisineData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load cuisine recommendations",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCuisineRecommendations();
  }, [fetchCuisineRecommendations]);

  const getElementIcon = (element: string) =>
    ELEMENT_ICONS[element as keyof typeof ELEMENT_ICONS] || FaStar;
  const getElementColor = (element: string) =>
    ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS] || "gray";

  // Get top flavors from flavor profile
  const getTopFlavors = (flavorProfile?: FlavorProfile, count = 3) => {
    if (!flavorProfile) return [];
    return Object.entries(flavorProfile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .filter(([, value]) => value > 0.1); // Only include flavors > 10%
  };

  // Get score color based on match percentage
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "green";
    if (score >= 0.6) return "purple";
    if (score >= 0.4) return "orange";
    return "red";
  };

  // Categorize cuisines into tiers based on compatibility score
  const categorizeCuisines = (cuisines: CuisineRecommendation[]) => {
    const topMatches = cuisines.filter((c) => c.astrological_score >= 0.7);
    const goodMatches = cuisines.filter(
      (c) => c.astrological_score >= 0.5 && c.astrological_score < 0.7,
    );
    const otherOptions = cuisines.filter((c) => c.astrological_score < 0.5);
    return { topMatches, goodMatches, otherOptions };
  };

  // Get tier label with appropriate styling
  const getTierInfo = (tier: "top" | "good" | "other") => {
    switch (tier) {
      case "top":
        return {
          label: "Top Matches",
          color: "green",
          icon: FaStar,
          description: "Excellent astrological alignment (70%+)",
        };
      case "good":
        return {
          label: "Good Matches",
          color: "purple",
          icon: FaMagic,
          description: "Favorable compatibility (50-70%)",
        };
      case "other":
        return {
          label: "Other Options",
          color: "orange",
          icon: FaUtensils,
          description: "Available alternatives",
        };
    }
  };

  const renderElementalProperties = (properties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  }) => (
    <HStack {...({ spacing: 2, wrap: "wrap" } as any)}>
      {Object.entries(properties).map(([element, value]) => (
        <Tooltip
          key={element}
          label={`${element}: ${(value * 100).toFixed(0)}%`}
        >
          <HStack {...({ spacing: 1 } as any)}>
            <Icon
              as={getElementIcon(element)}
              color={`${getElementColor(element)}.500`}
              boxSize={3}
            />
            <Progress
              value={value * 100}
              size="sm"
              width="40px"
              colorScheme={getElementColor(element)}
            />
            <Text fontSize="xs" fontWeight="medium">
              {(value * 100).toFixed(0)}%
            </Text>
          </HStack>
        </Tooltip>
      ))}
    </HStack>
  );

  // Render compact flavor profile display
  const renderFlavorProfileCompact = (flavorProfile?: FlavorProfile) => {
    if (!flavorProfile) return null;
    const topFlavors = getTopFlavors(flavorProfile, 3);
    if (topFlavors.length === 0) return null;

    return (
      <HStack {...({ spacing: 2, wrap: "wrap" } as any)}>
        <Text fontSize="xs" color="gray.600" fontWeight="medium">
          Flavors:
        </Text>
        {topFlavors.map(([flavor, value]) => (
          <Badge
            key={flavor}
            colorScheme={
              flavor === "sweet"
                ? "pink"
                : flavor === "sour"
                  ? "yellow"
                  : flavor === "salty"
                    ? "blue"
                    : flavor === "bitter"
                      ? "purple"
                      : flavor === "umami"
                        ? "green"
                        : "red"
            }
            fontSize="xs"
          >
            {flavor} {(value * 100).toFixed(0)}%
          </Badge>
        ))}
      </HStack>
    );
  };

  const renderRecipeCard = (recipe: NestedRecipe) => (
    <Card
      key={recipe.recipe_id}
      size="sm"
      bg={cardBg}
      shadow="md"
      borderWidth="2px"
      borderColor="purple.100"
    >
      <CardHeader pb={2}>
        <Flex justify="space-between" align="start">
          <Box>
            <Heading size="md" color="purple.700">
              {recipe.name}
            </Heading>
            <Text fontSize="sm" color="gray.700" mt={2} fontWeight="medium">
              {recipe.description}
            </Text>
          </Box>
          <Badge colorScheme="green" size="sm" fontSize="xs">
            {recipe.seasonal_fit}
          </Badge>
        </Flex>
      </CardHeader>

      <CardBody pt={0}>
        <VStack {...({ align: "start", spacing: 4 } as any)}>
          {/* Recipe Meta - Enhanced */}
          <Wrap {...({ spacing: 2 } as any)}>
            {recipe.prep_time && (
              <Badge colorScheme="blue" size="sm">
                <HStack {...({ spacing: 1 } as any)}>
                  <Icon as={FaClock} boxSize={3} />
                  <Text fontSize="xs">{recipe.prep_time}</Text>
                </HStack>
              </Badge>
            )}
            {recipe.cook_time && (
              <Badge colorScheme="orange" size="sm">
                <HStack {...({ spacing: 1 } as any)}>
                  <Icon as={FaFire} boxSize={3} />
                  <Text fontSize="xs">{recipe.cook_time}</Text>
                </HStack>
              </Badge>
            )}
            {recipe.servings && (
              <Badge colorScheme="purple" size="sm">
                <HStack {...({ spacing: 1 } as any)}>
                  <Icon as={FaUsers} boxSize={3} />
                  <Text fontSize="xs">{recipe.servings} servings</Text>
                </HStack>
              </Badge>
            )}
            {recipe.difficulty && (
              <Badge size="sm" colorScheme="yellow">
                {recipe.difficulty}
              </Badge>
            )}
            {recipe.meal_type && (
              <Badge size="sm" colorScheme="cyan">
                {recipe.meal_type}
              </Badge>
            )}
          </Wrap>

          {/* Ingredients */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Ingredients:
            </Text>
            <ListRoot {...({ spacing: 1 } as any)}>
              {recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
                <ListItem key={idx} fontSize="xs">
                  <ListIndicator>
                    <Icon as={FaAppleAlt} color="green.500" boxSize={3} />
                  </ListIndicator>
                  {ingredient.amount && ingredient.unit
                    ? `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
                    : ingredient.name}
                  {ingredient.notes && (
                    <Text as="span" color="gray.500">
                      {" "}
                      ({ingredient.notes})
                    </Text>
                  )}
                </ListItem>
              ))}
              {recipe.ingredients.length > 5 && (
                <ListItem fontSize="xs" color="gray.500">
                  ...and {recipe.ingredients.length - 5} more ingredients
                </ListItem>
              )}
            </ListRoot>
          </Box>

          {/* Instructions Preview */}
          {recipe.instructions.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>
                Quick Steps:
              </Text>
              <ListRoot {...({ as: "ol", spacing: 1 } as any)}>
                {recipe.instructions.slice(0, 3).map((step, idx) => (
                  <ListItem key={idx} fontSize="xs" pl={4}>
                    {step.length > 60 ? `${step.substring(0, 60)}...` : step}
                  </ListItem>
                ))}
              </ListRoot>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  const renderSauceCard = (sauce: SauceRecommendation) => (
    <Card
      key={sauce.sauce_name}
      size="sm"
      bg={cardBg}
      shadow="md"
      borderWidth="1px"
      borderColor="orange.100"
    >
      <CardBody>
        <VStack {...({ align: "start", spacing: 3 } as any)}>
          <Flex justify="space-between" width="100%" align="start">
            <Heading size="sm" color="orange.700">
              {sauce.sauce_name}
            </Heading>
            <Badge colorScheme="purple" size="sm" fontSize="xs">
              {(sauce.compatibility_score * 100).toFixed(0)}%
            </Badge>
          </Flex>

          <Text fontSize="sm" color="gray.700" fontWeight="medium">
            {sauce.description}
          </Text>

          {sauce.key_ingredients && sauce.key_ingredients.length > 0 && (
            <Box width="100%">
              <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>
                🥘 Key Ingredients:
              </Text>
              <Wrap {...({ spacing: 1 } as any)}>
                {sauce.key_ingredients.map((ingredient, idx) => (
                  <WrapItem key={idx}>
                    <TagRoot size="sm" variant="subtle" colorScheme="orange">
                      <TagLabel fontSize="xs">{ingredient}</TagLabel>
                    </TagRoot>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}

          <Text
            fontSize="sm"
            fontStyle="italic"
            color="purple.700"
            borderLeftWidth="3px"
            borderLeftColor="purple.300"
            pl={3}
          >
            {sauce.reason}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <Box textAlign="center" py={12}>
        <Spinner size="xl" color="purple.500" mb={4} />
        <Heading size="md" mb={2}>
          Consulting the Culinary Cosmos
        </Heading>
        <Text color="gray.600">
          Analyzing current astrological influences to find your perfect
          cuisines...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <AlertRoot status="error" maxW="600px" mx="auto" mt={8}>
        <AlertIndicator />
        <AlertContent>
          <Box>
            <Text fontWeight="bold">
              Failed to load cuisine recommendations
            </Text>
            <Text fontSize="sm">{error}</Text>
            <Button
              size="sm"
              mt={2}
              onClick={() => {
                void fetchCuisineRecommendations();
              }}
            >
              Try Again
            </Button>
          </Box>
        </AlertContent>
      </AlertRoot>
    );
  }

  if (!data) return null;

  return (
    <Box maxW="1400px" mx="auto" p={6}>
      <VStack {...({ spacing: 8, align: "stretch" } as any)}>
        {/* Header */}
        <Box textAlign="center">
          <Heading size="xl" mb={2} color="purple.600">
            🍽️ Current Moment Cuisine Guide
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={4}>
            Personalized cuisine recommendations aligned with the cosmos
          </Text>

          {/* Current Moment Display */}
          <Card bg={cardBg} shadow="md" maxW="800px" mx="auto">
            <CardBody>
              <SimpleGrid
                {...({
                  columns: { base: 1, md: 3 },
                  spacing: 4,
                  textAlign: "center",
                } as any)}
              >
                <VStack>
                  <Icon as={FaMagic} boxSize={8} color="purple.500" />
                  <Text fontSize="sm" color="gray.600">
                    Zodiac Sign
                  </Text>
                  <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                    {data.current_moment.zodiac_sign}
                  </Badge>
                  <Text fontSize="xs" color="gray.500">
                    {
                      ZODIAC_ELEMENTS[
                        data.current_moment
                          .zodiac_sign as keyof typeof ZODIAC_ELEMENTS
                      ]
                    }{" "}
                    Element
                  </Text>
                </VStack>

                <VStack>
                  <Icon
                    as={
                      SEASON_ICONS[
                        data.current_moment.season as keyof typeof SEASON_ICONS
                      ] || FaLeaf
                    }
                    boxSize={8}
                    color="green.500"
                  />
                  <Text fontSize="sm" color="gray.600">
                    Current Season
                  </Text>
                  <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                    {data.current_moment.season}
                  </Badge>
                  <Text fontSize="xs" color="gray.500">
                    Seasonal Energy Flow
                  </Text>
                </VStack>

                <VStack>
                  <Icon as={FaClock} boxSize={8} color="blue.500" />
                  <Text fontSize="sm" color="gray.600">
                    Analysis Time
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {new Date(
                      data.current_moment.timestamp,
                    ).toLocaleTimeString()}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Live Astrological Data
                  </Text>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        </Box>

        {/* Cuisine Recommendations */}
        <Box>
          <VStack {...({ spacing: 2, mb: 6 } as any)}>
            <Heading size="lg" textAlign="center">
              Your Astrologically Aligned Cuisines
            </Heading>
            <Text fontSize="md" color="gray.600" textAlign="center">
              Showing all {data.cuisine_recommendations.length} cuisines ranked
              by compatibility
            </Text>
          </VStack>

          {/* Tier-based display of all cuisines */}
          {(() => {
            // Ensure data.cuisine_recommendations is an array before processing
            const validCuisines = Array.isArray(data?.cuisine_recommendations)
              ? data.cuisine_recommendations.filter(Boolean) // Filter out any null/undefined items
              : [];

            const { topMatches, goodMatches, otherOptions } =
              categorizeCuisines(validCuisines);
            const topTier = getTierInfo("top");
            const goodTier = getTierInfo("good");
            const otherTier = getTierInfo("other");

            return (
              <VStack {...({ spacing: 8 } as any)}>
                {/* Top Matches Tier */}
                {topMatches.length > 0 && (
                  <Box width="100%">
                    <Flex align="center" gap={2} mb={4}>
                      <Icon
                        as={topTier.icon}
                        color={`${topTier.color}.500`}
                        boxSize={5}
                      />
                      <Heading size="md" color={`${topTier.color}.600`}>
                        {topTier.label} ({topMatches.length})
                      </Heading>
                      <Text fontSize="sm" color="gray.500" ml={2}>
                        {topTier.description}
                      </Text>
                    </Flex>
                    <VStack {...({ spacing: 6 } as any)}>
                      {topMatches.map((cuisine) => (
                        <Card
                          key={cuisine.cuisine_id}
                          {...({ bg: cardBg, shadow: "lg", size: "lg" } as any)}
                        >
                          <CardHeader>
                            <Flex
                              justify="space-between"
                              align="start"
                              wrap="wrap"
                              gap={4}
                            >
                              <Box flex="1" minW="0">
                                <Flex align="center" gap={3} mb={2}>
                                  <Heading size="md">{cuisine.name}</Heading>
                                  <Badge
                                    colorScheme={getScoreColor(
                                      cuisine.astrological_score,
                                    )}
                                    fontSize="lg"
                                    px={3}
                                    py={1}
                                  >
                                    {(cuisine.astrological_score * 100).toFixed(
                                      0,
                                    )}
                                    %
                                  </Badge>
                                </Flex>
                                <Text color="gray.600" mt={1}>
                                  {cuisine.description}
                                </Text>
                                {renderFlavorProfileCompact(
                                  cuisine.flavor_profile,
                                )}
                                <Text
                                  fontSize="sm"
                                  color="purple.600"
                                  mt={2}
                                  fontStyle="italic"
                                >
                                  {cuisine.compatibility_reason}
                                </Text>
                              </Box>

                              <VStack
                                {...({
                                  align: "end",
                                  spacing: 2,
                                  minW: "120px",
                                } as any)}
                              >
                                <Box textAlign="center">
                                  <Progress
                                    value={cuisine.astrological_score * 100}
                                    size="md"
                                    colorScheme={getScoreColor(
                                      cuisine.astrological_score,
                                    )}
                                    borderRadius="full"
                                    mb={1}
                                  />
                                  <Text fontSize="xs" color="gray.500">
                                    Match Quality
                                  </Text>
                                </Box>
                                <Text
                                  fontSize="sm"
                                  color="gray.500"
                                  textAlign="right"
                                >
                                  {cuisine.seasonal_context}
                                </Text>
                              </VStack>
                            </Flex>
                          </CardHeader>

                          <CardBody>
                            <VStack
                              {...({ spacing: 6, align: "stretch" } as any)}
                            >
                              {/* Accordion for Recipes and Sauces - PRIMARY FOCUS */}
                              <AccordionRoot
                                collapsible
                                multiple
                                defaultValue={["recipes"]}
                              >
                                {/* Nested Recipes */}
                                <AccordionItem value="recipes">
                                  <AccordionItemTrigger>
                                    <Box flex="1" textAlign="left">
                                      <HStack>
                                        <Icon
                                          as={FaUtensils}
                                          color="green.500"
                                        />
                                        <Text fontWeight="medium">
                                          Featured Recipes (
                                          {cuisine.nested_recipes.length})
                                        </Text>
                                      </HStack>
                                    </Box>
                                    <AccordionItemIndicator />
                                  </AccordionItemTrigger>
                                  <AccordionItemContent pb={4}>
                                    <SimpleGrid
                                      {...({
                                        columns: { base: 1, lg: 2 },
                                        spacing: 4,
                                      } as any)}
                                    >
                                      {cuisine.nested_recipes.map((recipe) =>
                                        recipe
                                          ? renderRecipeCard(recipe)
                                          : null,
                                      )}
                                    </SimpleGrid>
                                  </AccordionItemContent>
                                </AccordionItem>

                                {/* Recommended Sauces */}
                                <AccordionItem value="sauces">
                                  <AccordionItemTrigger>
                                    <Box flex="1" textAlign="left">
                                      <HStack>
                                        <Icon
                                          as={FaPepperHot}
                                          color="red.500"
                                        />
                                        <Text fontWeight="medium">
                                          Recommended Sauces (
                                          {cuisine.recommended_sauces.length})
                                        </Text>
                                      </HStack>
                                    </Box>
                                    <AccordionItemIndicator />
                                  </AccordionItemTrigger>
                                  <AccordionItemContent pb={4}>
                                    <SimpleGrid
                                      {...({
                                        columns: { base: 1, md: 2, lg: 3 },
                                        spacing: 4,
                                      } as any)}
                                    >
                                      {cuisine.recommended_sauces.map(
                                        (sauce) =>
                                          sauce ? renderSauceCard(sauce) : null,
                                      )}
                                    </SimpleGrid>
                                  </AccordionItemContent>
                                </AccordionItem>

                                {/* Thermodynamic Metrics - NEW */}
                                {cuisine.thermodynamic_metrics && (
                                  <AccordionItem value="thermodynamics">
                                    <AccordionItemTrigger>
                                      <Box flex="1" textAlign="left">
                                        <HStack>
                                          <Icon
                                            as={FaFire}
                                            color="orange.500"
                                          />
                                          <Text fontWeight="medium">
                                            Thermodynamic Profile
                                          </Text>
                                        </HStack>
                                      </Box>
                                      <AccordionItemIndicator />
                                    </AccordionItemTrigger>
                                    <AccordionItemContent pb={4}>
                                      <SimpleGrid
                                        {...({
                                          columns: { base: 2, md: 3 },
                                          spacing: 3,
                                        } as any)}
                                      >
                                        <Box
                                          bg="orange.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Heat
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color="orange.700"
                                          >
                                            {cuisine.thermodynamic_metrics?.heat?.toFixed(
                                              3,
                                            ) ?? "N/A"}
                                          </Text>
                                        </Box>
                                        <Box
                                          bg="purple.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Entropy
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color="purple.700"
                                          >
                                            {cuisine.thermodynamic_metrics?.entropy?.toFixed(
                                              3,
                                            ) ?? "N/A"}
                                          </Text>
                                        </Box>
                                        <Box
                                          bg="red.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Reactivity
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color="red.700"
                                          >
                                            {cuisine.thermodynamic_metrics?.reactivity?.toFixed(
                                              3,
                                            ) ?? "N/A"}
                                          </Text>
                                        </Box>
                                        <Box
                                          bg="green.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Greg's Energy
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color="green.700"
                                          >
                                            {cuisine.thermodynamic_metrics?.gregsEnergy?.toFixed(
                                              4,
                                            ) ?? "N/A"}
                                          </Text>
                                        </Box>
                                        <Box
                                          bg="blue.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Kalchm
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color="blue.700"
                                          >
                                            {cuisine.thermodynamic_metrics?.kalchm?.toFixed(
                                              3,
                                            ) ?? "N/A"}
                                          </Text>
                                        </Box>
                                        <Box
                                          bg="pink.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Monica Constant
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color="pink.700"
                                          >
                                            {cuisine.thermodynamic_metrics?.monica?.toFixed(
                                              3,
                                            ) ?? "N/A"}
                                          </Text>
                                        </Box>
                                      </SimpleGrid>
                                    </AccordionItemContent>
                                  </AccordionItem>
                                )}

                                {/* Kinetic Properties - NEW */}
                                {cuisine.kinetic_properties && (
                                  <AccordionItem value="kinetics">
                                    <AccordionItemTrigger>
                                      <Box flex="1" textAlign="left">
                                        <HStack>
                                          <Icon as={FaStar} color="cyan.500" />
                                          <Text fontWeight="medium">
                                            Kinetic Properties (P=IV Model)
                                          </Text>
                                        </HStack>
                                      </Box>
                                      <AccordionItemIndicator />
                                    </AccordionItemTrigger>
                                    <AccordionItemContent pb={4}>
                                      <SimpleGrid
                                        {...({
                                          columns: { base: 2, md: 4 },
                                          spacing: 3,
                                        } as any)}
                                      >
                                        <Box
                                          bg="cyan.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Charge (Q)
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color="cyan.700"
                                          >
                                            {cuisine.kinetic_properties?.charge?.toFixed(
                                              2,
                                            ) ?? "N/A"}
                                          </Text>
                                        </Box>
                                        <Box
                                          bg="blue.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Potential (V)
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color="blue.700"
                                          >
                                            {cuisine.kinetic_properties?.potentialDifference?.toFixed(
                                              4,
                                            ) ?? "N/A"}
                                          </Text>
                                        </Box>
                                        <Box
                                          bg="purple.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Current (I)
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color="purple.700"
                                          >
                                            {cuisine.kinetic_properties?.currentFlow?.toFixed(
                                              4,
                                            ) ?? "N/A"}
                                          </Text>
                                        </Box>
                                        <Box
                                          bg="pink.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Power (P)
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color="pink.700"
                                          >
                                            {cuisine.kinetic_properties?.power?.toFixed(
                                              6,
                                            ) ?? "N/A"}
                                          </Text>
                                        </Box>
                                        <Box
                                          bg="orange.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Force Magnitude
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color="orange.700"
                                          >
                                            {cuisine.kinetic_properties?.forceMagnitude?.toFixed(
                                              4,
                                            ) ?? "N/A"}
                                          </Text>
                                        </Box>
                                        <Box
                                          bg="green.50"
                                          p={3}
                                          borderRadius="md"
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Inertia
                                          </Text>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color="green.700"
                                          >
                                            {cuisine.kinetic_properties?.inertia?.toFixed(
                                              2,
                                            ) ?? "N/A"}
                                          </Text>
                                        </Box>
                                        <Box
                                          bg="gray.100"
                                          p={3}
                                          borderRadius="md"
                                          {...({
                                            gridColumn: {
                                              base: "span 2",
                                              md: "span 2",
                                            },
                                          } as any)}
                                        >
                                          <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            mb={1}
                                          >
                                            Force Classification
                                          </Text>
                                          <Badge
                                            colorScheme={
                                              cuisine.kinetic_properties
                                                ?.forceClassification ===
                                              "accelerating"
                                                ? "green"
                                                : cuisine.kinetic_properties
                                                      ?.forceClassification ===
                                                    "decelerating"
                                                  ? "red"
                                                  : "yellow"
                                            }
                                            fontSize="md"
                                          >
                                            {cuisine.kinetic_properties
                                              ?.forceClassification ??
                                              "balanced"}
                                          </Badge>
                                        </Box>
                                      </SimpleGrid>
                                    </AccordionItemContent>
                                  </AccordionItem>
                                )}

                                {/* Flavor Profile - NEW */}
                                {cuisine.flavor_profile && (
                                  <AccordionItem value="flavor">
                                    <AccordionItemTrigger>
                                      <Box flex="1" textAlign="left">
                                        <HStack>
                                          <Icon
                                            as={FaPepperHot}
                                            color="orange.500"
                                          />
                                          <Text fontWeight="medium">
                                            Flavor Profile
                                          </Text>
                                        </HStack>
                                      </Box>
                                      <AccordionItemIndicator />
                                    </AccordionItemTrigger>
                                    <AccordionItemContent pb={4}>
                                      <VStack
                                        {...({
                                          align: "stretch",
                                          spacing: 2,
                                        } as any)}
                                      >
                                        {Object.entries(
                                          cuisine.flavor_profile,
                                        ).map(([flavor, value]) => (
                                          <Box key={flavor}>
                                            <Flex
                                              justify="space-between"
                                              mb={1}
                                            >
                                              <Text
                                                fontSize="sm"
                                                fontWeight="medium"
                                                textTransform="capitalize"
                                              >
                                                {flavor}
                                              </Text>
                                              <Text
                                                fontSize="sm"
                                                color="gray.600"
                                              >
                                                {(value * 100).toFixed(0)}%
                                              </Text>
                                            </Flex>
                                            <Progress
                                              value={value * 100}
                                              size="sm"
                                              colorScheme={
                                                flavor === "sweet"
                                                  ? "pink"
                                                  : flavor === "sour"
                                                    ? "yellow"
                                                    : flavor === "salty"
                                                      ? "blue"
                                                      : flavor === "bitter"
                                                        ? "purple"
                                                        : flavor === "umami"
                                                          ? "green"
                                                          : "red"
                                              }
                                            />
                                          </Box>
                                        ))}
                                      </VStack>
                                    </AccordionItemContent>
                                  </AccordionItem>
                                )}

                                {/* Cultural Signatures - NEW */}
                                {cuisine.cultural_signatures &&
                                  cuisine.cultural_signatures.length > 0 && (
                                    <AccordionItem value="signatures">
                                      <AccordionItemTrigger>
                                        <Box flex="1" textAlign="left">
                                          <HStack>
                                            <Icon
                                              as={FaStar}
                                              color="yellow.500"
                                            />
                                            <Text fontWeight="medium">
                                              Cultural Signatures (
                                              {
                                                cuisine.cultural_signatures
                                                  .length
                                              }
                                              )
                                            </Text>
                                          </HStack>
                                        </Box>
                                        <AccordionItemIndicator />
                                      </AccordionItemTrigger>
                                      <AccordionItemContent pb={4}>
                                        <VStack
                                          {...({
                                            align: "stretch",
                                            spacing: 2,
                                          } as any)}
                                        >
                                          {cuisine.cultural_signatures.map(
                                            (sig, idx) => (
                                              <Box
                                                key={idx}
                                                bg={
                                                  sig.significance === "high"
                                                    ? "yellow.50"
                                                    : "gray.50"
                                                }
                                                p={3}
                                                borderRadius="md"
                                                borderLeft="4px solid"
                                                borderLeftColor={
                                                  sig.significance === "high"
                                                    ? "yellow.400"
                                                    : "gray.300"
                                                }
                                              >
                                                <Flex
                                                  justify="space-between"
                                                  align="start"
                                                >
                                                  <Box>
                                                    <Text
                                                      fontSize="sm"
                                                      fontWeight="bold"
                                                    >
                                                      {sig.property}
                                                    </Text>
                                                    <Text
                                                      fontSize="xs"
                                                      color="gray.600"
                                                    >
                                                      Z-score:{" "}
                                                      {sig.zScore.toFixed(2)} •
                                                      Value:{" "}
                                                      {sig.value.toFixed(2)}
                                                    </Text>
                                                  </Box>
                                                  <Badge
                                                    colorScheme={
                                                      sig.significance ===
                                                      "high"
                                                        ? "yellow"
                                                        : "gray"
                                                    }
                                                  >
                                                    {sig.significance}
                                                  </Badge>
                                                </Flex>
                                              </Box>
                                            ),
                                          )}
                                        </VStack>
                                      </AccordionItemContent>
                                    </AccordionItem>
                                  )}

                                {/* Fusion Pairings - NEW */}
                                {cuisine.fusion_pairings &&
                                  cuisine.fusion_pairings.length > 0 && (
                                    <AccordionItem value="fusion">
                                      <AccordionItemTrigger>
                                        <Box flex="1" textAlign="left">
                                          <HStack>
                                            <Icon
                                              as={FaMagic}
                                              color="purple.500"
                                            />
                                            <Text fontWeight="medium">
                                              Fusion Pairing Recommendations (
                                              {cuisine.fusion_pairings.length})
                                            </Text>
                                          </HStack>
                                        </Box>
                                        <AccordionItemIndicator />
                                      </AccordionItemTrigger>
                                      <AccordionItemContent pb={4}>
                                        <VStack
                                          {...({
                                            align: "stretch",
                                            spacing: 3,
                                          } as any)}
                                        >
                                          {cuisine.fusion_pairings.map(
                                            (pairing, idx) => (
                                              <Card
                                                key={idx}
                                                size="sm"
                                                bg="purple.50"
                                                borderWidth="1px"
                                                borderColor="purple.200"
                                              >
                                                <CardBody>
                                                  <Flex
                                                    justify="space-between"
                                                    align="start"
                                                    mb={2}
                                                  >
                                                    <Heading
                                                      size="sm"
                                                      color="purple.800"
                                                    >
                                                      {cuisine.name} +{" "}
                                                      {pairing.name}
                                                    </Heading>
                                                    <Badge
                                                      colorScheme="purple"
                                                      fontSize="sm"
                                                    >
                                                      {(
                                                        pairing.compatibility_score *
                                                        100
                                                      ).toFixed(0)}
                                                      %
                                                    </Badge>
                                                  </Flex>
                                                  <Text
                                                    fontSize="sm"
                                                    color="gray.700"
                                                    mb={2}
                                                  >
                                                    {pairing.reason}
                                                  </Text>
                                                  <SimpleGrid
                                                    {...({
                                                      columns: 3,
                                                      spacing: 2,
                                                      fontSize: "xs",
                                                    } as any)}
                                                  >
                                                    <Box>
                                                      <Text color="gray.600">
                                                        Blend Ratio
                                                      </Text>
                                                      <Text fontWeight="bold">
                                                        {(
                                                          pairing.blend_ratio *
                                                          100
                                                        ).toFixed(0)}
                                                        %
                                                      </Text>
                                                    </Box>
                                                    <Box>
                                                      <Text color="gray.600">
                                                        Harmony
                                                      </Text>
                                                      <Text fontWeight="bold">
                                                        {(
                                                          pairing.thermodynamic_harmony *
                                                          100
                                                        ).toFixed(0)}
                                                        %
                                                      </Text>
                                                    </Box>
                                                    <Box>
                                                      <Text color="gray.600">
                                                        Shared Elements
                                                      </Text>
                                                      <Wrap
                                                        {...({
                                                          spacing: 1,
                                                        } as any)}
                                                      >
                                                        {pairing.shared_elements.map(
                                                          (el, i) => (
                                                            <WrapItem key={i}>
                                                              <TagRoot
                                                                size="sm"
                                                                variant="subtle"
                                                                colorScheme="purple"
                                                              >
                                                                <TagLabel fontSize="xs">
                                                                  {el}
                                                                </TagLabel>
                                                              </TagRoot>
                                                            </WrapItem>
                                                          ),
                                                        )}
                                                      </Wrap>
                                                    </Box>
                                                  </SimpleGrid>
                                                </CardBody>
                                              </Card>
                                            ),
                                          )}
                                        </VStack>
                                      </AccordionItemContent>
                                    </AccordionItem>
                                  )}

                                {/* Elemental Properties - De-emphasized, collapsible */}
                                <AccordionItem value="elemental">
                                  <AccordionItemTrigger>
                                    <Box flex="1" textAlign="left">
                                      <HStack>
                                        <Icon as={FaMagic} color="purple.500" />
                                        <Text
                                          fontWeight="medium"
                                          fontSize="sm"
                                          color="gray.600"
                                        >
                                          Elemental Balance
                                        </Text>
                                      </HStack>
                                    </Box>
                                    <AccordionItemIndicator />
                                  </AccordionItemTrigger>
                                  <AccordionItemContent pb={4}>
                                    <Box>
                                      <Text
                                        fontSize="xs"
                                        color="gray.500"
                                        mb={3}
                                      >
                                        Traditional alchemical properties
                                      </Text>
                                      {renderElementalProperties(
                                        cuisine.elemental_properties,
                                      )}
                                    </Box>
                                  </AccordionItemContent>
                                </AccordionItem>
                              </AccordionRoot>
                            </VStack>
                          </CardBody>

                          <CardFooter>
                            <Button colorScheme="purple" size="sm">
                              Explore {cuisine.name} Recipes →
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Good Matches Tier */}
                {goodMatches.length > 0 && (
                  <Box width="100%">
                    <Flex align="center" gap={2} mb={4}>
                      <Icon
                        as={goodTier.icon}
                        color={`${goodTier.color}.500`}
                        boxSize={5}
                      />
                      <Heading size="md" color={`${goodTier.color}.600`}>
                        {goodTier.label} ({goodMatches.length})
                      </Heading>
                      <Text fontSize="sm" color="gray.500" ml={2}>
                        {goodTier.description}
                      </Text>
                    </Flex>
                    <VStack {...({ spacing: 4 } as any)}>
                      {goodMatches.map((cuisine) => (
                        <Card
                          key={cuisine.cuisine_id}
                          bg={cardBg}
                          shadow="md"
                          size="md"
                          width="100%"
                          borderWidth="2px"
                          borderColor="purple.100"
                        >
                          <CardBody>
                            <Flex
                              justify="space-between"
                              align="start"
                              gap={4}
                              wrap="wrap"
                            >
                              {/* Left side - Main info */}
                              <Box flex="1" minW="300px">
                                <Flex align="center" gap={2} mb={2}>
                                  <Heading size="sm">{cuisine.name}</Heading>
                                  <Badge
                                    colorScheme={getScoreColor(
                                      cuisine.astrological_score,
                                    )}
                                    fontSize="md"
                                    px={2}
                                    py={1}
                                  >
                                    {(cuisine.astrological_score * 100).toFixed(
                                      0,
                                    )}
                                    %
                                  </Badge>
                                </Flex>
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                  {cuisine.description}
                                </Text>
                                {renderFlavorProfileCompact(
                                  cuisine.flavor_profile,
                                )}
                              </Box>

                              {/* Right side - Quick stats */}
                              <VStack
                                {...({
                                  align: "stretch",
                                  spacing: 2,
                                  minW: "200px",
                                } as any)}
                              >
                                <Box>
                                  <Text fontSize="xs" color="gray.600" mb={1}>
                                    Match Quality
                                  </Text>
                                  <Progress
                                    value={cuisine.astrological_score * 100}
                                    size="sm"
                                    colorScheme={getScoreColor(
                                      cuisine.astrological_score,
                                    )}
                                    borderRadius="full"
                                  />
                                </Box>
                                <HStack
                                  {...({ spacing: 2, fontSize: "xs" } as any)}
                                >
                                  <Icon
                                    as={FaUtensils}
                                    color="green.500"
                                    boxSize={3}
                                  />
                                  <Text>
                                    {cuisine.nested_recipes.length} recipes
                                  </Text>
                                </HStack>
                                <HStack
                                  {...({ spacing: 2, fontSize: "xs" } as any)}
                                >
                                  <Icon
                                    as={FaPepperHot}
                                    color="red.500"
                                    boxSize={3}
                                  />
                                  <Text>
                                    {cuisine.recommended_sauces.length} sauces
                                  </Text>
                                </HStack>
                              </VStack>
                            </Flex>

                            {/* Expandable details */}
                            <AccordionRoot collapsible mt={4}>
                              <AccordionItem value="details">
                                <AccordionItemTrigger>
                                  <Box flex="1" textAlign="left">
                                    <Text fontSize="sm" fontWeight="medium">
                                      View Full Details
                                    </Text>
                                  </Box>
                                  <AccordionItemIndicator />
                                </AccordionItemTrigger>
                                <AccordionItemContent pb={4}>
                                  <VStack
                                    {...({
                                      spacing: 4,
                                      align: "stretch",
                                    } as any)}
                                  >
                                    <Text
                                      fontSize="sm"
                                      color="purple.600"
                                      fontStyle="italic"
                                      borderLeftWidth="3px"
                                      borderLeftColor="purple.300"
                                      pl={3}
                                    >
                                      {cuisine.compatibility_reason}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                      {cuisine.seasonal_context}
                                    </Text>

                                    {/* Nested accordions for all details */}
                                    <AccordionRoot collapsible multiple>
                                      {/* Recipes */}
                                      <AccordionItem value="recipes">
                                        <AccordionItemTrigger>
                                          <Box flex="1" textAlign="left">
                                            <HStack
                                              {...({ spacing: 2 } as any)}
                                            >
                                              <Icon
                                                as={FaUtensils}
                                                color="green.500"
                                                boxSize={4}
                                              />
                                              <Text fontSize="sm">
                                                Featured Recipes (
                                                {cuisine.nested_recipes.length})
                                              </Text>
                                            </HStack>
                                          </Box>
                                          <AccordionItemIndicator />
                                        </AccordionItemTrigger>
                                        <AccordionItemContent pb={4}>
                                          <SimpleGrid
                                            {...({
                                              columns: { base: 1, lg: 2 },
                                              spacing: 3,
                                            } as any)}
                                          >
                                            {cuisine.nested_recipes.map(
                                              (recipe) =>
                                                recipe
                                                  ? renderRecipeCard(recipe)
                                                  : null,
                                            )}
                                          </SimpleGrid>
                                        </AccordionItemContent>
                                      </AccordionItem>

                                      {/* Sauces */}
                                      <AccordionItem value="sauces">
                                        <AccordionItemTrigger>
                                          <Box flex="1" textAlign="left">
                                            <HStack
                                              {...({ spacing: 2 } as any)}
                                            >
                                              <Icon
                                                as={FaPepperHot}
                                                color="red.500"
                                                boxSize={4}
                                              />
                                              <Text fontSize="sm">
                                                Recommended Sauces (
                                                {
                                                  cuisine.recommended_sauces
                                                    .length
                                                }
                                                )
                                              </Text>
                                            </HStack>
                                          </Box>
                                          <AccordionItemIndicator />
                                        </AccordionItemTrigger>
                                        <AccordionItemContent pb={4}>
                                          <SimpleGrid
                                            {...({
                                              columns: { base: 1, md: 2 },
                                              spacing: 3,
                                            } as any)}
                                          >
                                            {cuisine.recommended_sauces.map(
                                              (sauce) =>
                                                sauce
                                                  ? renderSauceCard(sauce)
                                                  : null,
                                            )}
                                          </SimpleGrid>
                                        </AccordionItemContent>
                                      </AccordionItem>

                                      {/* Flavor Profile - Full Detail */}
                                      {cuisine.flavor_profile && (
                                        <AccordionItem value="flavor-detail">
                                          <AccordionItemTrigger>
                                            <Box flex="1" textAlign="left">
                                              <HStack
                                                {...({ spacing: 2 } as any)}
                                              >
                                                <Icon
                                                  as={FaPepperHot}
                                                  color="orange.500"
                                                  boxSize={4}
                                                />
                                                <Text fontSize="sm">
                                                  Full Flavor Profile
                                                </Text>
                                              </HStack>
                                            </Box>
                                            <AccordionItemIndicator />
                                          </AccordionItemTrigger>
                                          <AccordionItemContent pb={4}>
                                            <VStack
                                              {...({
                                                align: "stretch",
                                                spacing: 2,
                                              } as any)}
                                            >
                                              {Object.entries(
                                                cuisine.flavor_profile,
                                              ).map(([flavor, value]) => (
                                                <Box key={flavor}>
                                                  <Flex
                                                    justify="space-between"
                                                    mb={1}
                                                  >
                                                    <Text
                                                      fontSize="sm"
                                                      fontWeight="medium"
                                                      textTransform="capitalize"
                                                    >
                                                      {flavor}
                                                    </Text>
                                                    <Text
                                                      fontSize="sm"
                                                      color="gray.600"
                                                    >
                                                      {(value * 100).toFixed(0)}
                                                      %
                                                    </Text>
                                                  </Flex>
                                                  <Progress
                                                    value={value * 100}
                                                    size="sm"
                                                    colorScheme={
                                                      flavor === "sweet"
                                                        ? "pink"
                                                        : flavor === "sour"
                                                          ? "yellow"
                                                          : flavor === "salty"
                                                            ? "blue"
                                                            : flavor ===
                                                                "bitter"
                                                              ? "purple"
                                                              : flavor ===
                                                                  "umami"
                                                                ? "green"
                                                                : "red"
                                                    }
                                                  />
                                                </Box>
                                              ))}
                                            </VStack>
                                          </AccordionItemContent>
                                        </AccordionItem>
                                      )}
                                    </AccordionRoot>
                                  </VStack>
                                </AccordionItemContent>
                              </AccordionItem>
                            </AccordionRoot>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Other Options Tier */}
                {otherOptions.length > 0 && (
                  <Box width="100%">
                    <Flex align="center" gap={2} mb={4}>
                      <Icon
                        as={otherTier.icon}
                        color={`${otherTier.color}.500`}
                        boxSize={5}
                      />
                      <Heading size="md" color={`${otherTier.color}.600`}>
                        {otherTier.label} ({otherOptions.length})
                      </Heading>
                      <Text fontSize="sm" color="gray.500" ml={2}>
                        {otherTier.description}
                      </Text>
                    </Flex>
                    <VStack {...({ spacing: 4 } as any)}>
                      {otherOptions.map((cuisine) => (
                        <Card
                          key={cuisine.cuisine_id}
                          bg={cardBg}
                          shadow="sm"
                          size="md"
                          width="100%"
                          borderWidth="1px"
                          borderColor="orange.100"
                          opacity={0.9}
                        >
                          <CardBody>
                            <Flex
                              justify="space-between"
                              align="start"
                              gap={4}
                              wrap="wrap"
                            >
                              <Box flex="1" minW="300px">
                                <Flex align="center" gap={2} mb={2}>
                                  <Heading size="sm">{cuisine.name}</Heading>
                                  <Badge
                                    colorScheme={getScoreColor(
                                      cuisine.astrological_score,
                                    )}
                                    fontSize="md"
                                    px={2}
                                    py={1}
                                  >
                                    {(cuisine.astrological_score * 100).toFixed(
                                      0,
                                    )}
                                    %
                                  </Badge>
                                </Flex>
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                  {cuisine.description}
                                </Text>
                                {renderFlavorProfileCompact(
                                  cuisine.flavor_profile,
                                )}
                              </Box>
                              <VStack
                                {...({
                                  align: "stretch",
                                  spacing: 2,
                                  minW: "200px",
                                } as any)}
                              >
                                <Box>
                                  <Text fontSize="xs" color="gray.600" mb={1}>
                                    Match Quality
                                  </Text>
                                  <Progress
                                    value={cuisine.astrological_score * 100}
                                    size="sm"
                                    colorScheme={getScoreColor(
                                      cuisine.astrological_score,
                                    )}
                                    borderRadius="full"
                                  />
                                </Box>
                                <HStack
                                  {...({ spacing: 2, fontSize: "xs" } as any)}
                                >
                                  <Icon
                                    as={FaUtensils}
                                    color="green.500"
                                    boxSize={3}
                                  />
                                  <Text>
                                    {cuisine.nested_recipes.length} recipes
                                  </Text>
                                </HStack>
                                <HStack
                                  {...({ spacing: 2, fontSize: "xs" } as any)}
                                >
                                  <Icon
                                    as={FaPepperHot}
                                    color="red.500"
                                    boxSize={3}
                                  />
                                  <Text>
                                    {cuisine.recommended_sauces.length} sauces
                                  </Text>
                                </HStack>
                              </VStack>
                            </Flex>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            );
          })()}
        </Box>

        {/* Refresh Button */}
        <Box textAlign="center">
          <Button
            colorScheme="purple"
            variant="outline"
            onClick={() => {
              void fetchCuisineRecommendations();
            }}
            loading={loading}
            loadingText="Refreshing cosmic alignment..."
          >
            🔄 Refresh Current Moment Analysis
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default CurrentMomentCuisineRecommendations;
