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
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
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

      const response = await fetch("http://localhost:8101/cuisines/recommend");
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

  const renderRecipeCard = (recipe: NestedRecipe) => (
    <Card key={recipe.recipe_id} size="sm" bg={cardBg} shadow="sm">
      <CardHeader pb={2}>
        <Flex justify="space-between" align="start">
          <Box>
            <Heading size="sm">{recipe.name}</Heading>
            <Text fontSize="sm" color="gray.600" mt={1}>
              {recipe.description}
            </Text>
          </Box>
          <Badge colorScheme="green" size="sm">
            {recipe.seasonal_fit}
          </Badge>
        </Flex>
      </CardHeader>

      <CardBody pt={0}>
        <VStack {...({ align: "start", spacing: 3 } as any)}>
          {/* Recipe Meta */}
          <HStack {...({ spacing: 4, wrap: "wrap" } as any)}>
            {recipe.prep_time && (
              <HStack {...({ spacing: 1 } as any)}>
                <Icon as={FaClock} color="blue.500" boxSize={3} />
                <Text fontSize="xs">{recipe.prep_time} prep</Text>
              </HStack>
            )}
            {recipe.cook_time && (
              <HStack {...({ spacing: 1 } as any)}>
                <Icon as={FaFire} color="orange.500" boxSize={3} />
                <Text fontSize="xs">{recipe.cook_time} cook</Text>
              </HStack>
            )}
            {recipe.servings && (
              <HStack {...({ spacing: 1 } as any)}>
                <Icon as={FaUsers} color="purple.500" boxSize={3} />
                <Text fontSize="xs">{recipe.servings} servings</Text>
              </HStack>
            )}
            {recipe.difficulty && (
              <Badge size="sm" colorScheme="yellow">
                {recipe.difficulty}
              </Badge>
            )}
          </HStack>

          {/* Ingredients */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Ingredients:
            </Text>
            <ListRoot {...({ spacing: 1 } as any)}>
              {recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
                <ListItem key={idx} fontSize="xs">
                  <ListIndicator asChild>
                    <FaAppleAlt color="green.500" size={8} />
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
    <Card key={sauce.sauce_name} size="sm" bg={cardBg} shadow="sm">
      <CardBody>
        <VStack {...({ align: "start", spacing: 2 } as any)}>
          <Flex justify="space-between" width="100%" align="start">
            <Heading size="sm">{sauce.sauce_name}</Heading>
            <Badge colorScheme="purple" size="sm">
              {(sauce.compatibility_score * 100).toFixed(0)}%
            </Badge>
          </Flex>

          <Text fontSize="xs" color="gray.600">
            {sauce.description}
          </Text>

          {sauce.key_ingredients && sauce.key_ingredients.length > 0 && (
            <Wrap {...({ spacing: 1 } as any)}>
              {sauce.key_ingredients.slice(0, 3).map((ingredient, idx) => (
                <WrapItem key={idx}>
                  <TagRoot size="sm" variant="subtle" colorScheme="orange">
                    <FaPepperHot size={8} />
                    <TagLabel>{ingredient}</TagLabel>
                  </TagRoot>
                </WrapItem>
              ))}
            </Wrap>
          )}

          {sauce.elemental_properties && (
            <Box width="100%">
              <Text fontSize="xs" fontWeight="medium" mb={1}>
                Elemental Balance:
              </Text>
              {renderElementalProperties(sauce.elemental_properties)}
            </Box>
          )}

          <Text fontSize="xs" fontStyle="italic" color="purple.600">
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
          <Heading size="lg" mb={6} textAlign="center">
            Your Astrologically Aligned Cuisines
          </Heading>

          <VStack {...({ spacing: 8 } as any)}>
            {data.cuisine_recommendations.map((cuisine) => (
              <Card
                key={cuisine.cuisine_id}
                {...({ bg: cardBg, shadow: "lg", size: "lg" } as any)}
              >
                <CardHeader>
                  <Flex justify="space-between" align="start" wrap="wrap">
                    <Box>
                      <Heading size="md">{cuisine.name}</Heading>
                      <Text color="gray.600" mt={1}>
                        {cuisine.description}
                      </Text>
                      <Text
                        fontSize="sm"
                        color="purple.600"
                        mt={2}
                        fontStyle="italic"
                      >
                        {cuisine.compatibility_reason}
                      </Text>
                    </Box>

                    <VStack {...({ align: "end", spacing: 2 } as any)}>
                      <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                        Score: {(cuisine.astrological_score * 100).toFixed(0)}%
                      </Badge>
                      <Text fontSize="sm" color="gray.500">
                        {cuisine.seasonal_context}
                      </Text>
                    </VStack>
                  </Flex>
                </CardHeader>

                <CardBody>
                  <VStack {...({ spacing: 6, align: "stretch" } as any)}>
                    {/* Elemental Properties */}
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Elemental Balance:
                      </Text>
                      {renderElementalProperties(cuisine.elemental_properties)}
                    </Box>

                    {/* Accordion for Recipes and Sauces */}
                    <AccordionRoot collapsible multiple>
                      {/* Nested Recipes */}
                      <AccordionItem value="recipes">
                        <AccordionItemTrigger>
                          <Box flex="1" textAlign="left">
                            <HStack>
                              <Icon as={FaUtensils} color="green.500" />
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
                            {cuisine.nested_recipes.map(renderRecipeCard)}
                          </SimpleGrid>
                        </AccordionItemContent>
                      </AccordionItem>

                      {/* Recommended Sauces */}
                      <AccordionItem value="sauces">
                        <AccordionItemTrigger>
                          <Box flex="1" textAlign="left">
                            <HStack>
                              <Icon as={FaPepperHot} color="red.500" />
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
                            {cuisine.recommended_sauces.map(renderSauceCard)}
                          </SimpleGrid>
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
