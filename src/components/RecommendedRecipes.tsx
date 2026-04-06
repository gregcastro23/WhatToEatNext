// @ts-nocheck
import {
  Box,
  Flex,
  Heading,
  HStack,
  Image,
  Separator,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FaClock, FaSun, FaUtensils } from "react-icons/fa";
import { getTimeFactors } from "../types/time";
import {
  explainRecommendation,
  getRecommendedRecipes,
} from "../utils/recommendationEngine";
import type { AstrologicalState } from "../types/alchemy";
import type { Recipe } from "../types/recipe";

interface RecommendedRecipesProps {
  recipes: Recipe[];
  astrologicalState: AstrologicalState;
  count?: number;
}

const chipStyles = {
  px: "2.5",
  py: "1",
  borderRadius: "full",
  bg: "orange.100",
  color: "orange.800",
  fontSize: "xs",
  fontWeight: "semibold",
};

const RecommendedRecipes: React.FC<RecommendedRecipesProps> = ({
  recipes,
  astrologicalState,
  count = 3,
}) => {
  const [recommendations, setRecommendations] = useState<Recipe[]>([]);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const timeFactors = getTimeFactors();

  useEffect(() => {
    if (recipes.length > 0 && astrologicalState) {
      const recommendedRecipes = getRecommendedRecipes(
        recipes,
        astrologicalState,
        count,
        timeFactors,
      );
      setRecommendations(recommendedRecipes);

      const newExplanations: Record<string, string> = {};
      recommendedRecipes.forEach((recipe) => {
        newExplanations[recipe.id] = explainRecommendation(
          recipe,
          astrologicalState,
          timeFactors,
        );
      });
      setExplanations(newExplanations);
    }
  }, [recipes, astrologicalState, count, timeFactors]);

  if (recommendations.length === 0) {
    return (
      <Box my="6">
        <Heading size="lg" mb="3">
          Cosmic Recommendations
        </Heading>
        <Text color="gray.600">
          Loading personalized recommendations for{" "}
          {timeFactors.timeOfDay.toLowerCase()}...
        </Text>
      </Box>
    );
  }

  return (
    <Box my="6">
      <HStack gap="3" mb="3">
        <FaSun />
        <Heading size="lg">
          Cosmic Recommendations for {timeFactors.timeOfDay}
        </Heading>
      </HStack>

      <Text mb="5" color="gray.600">
        Based on {timeFactors.planetaryDay.day}&apos;s{" "}
        {timeFactors.planetaryDay.planet} influence and the{" "}
        {timeFactors.season} season
      </Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
        {recommendations.map((recipe) => {
          const prepTime = Number(recipe.prepTime || 0);
          const cookTime = Number(recipe.cookTime || 0);

          return (
            <Box
              key={recipe.id}
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="2xl"
              overflow="hidden"
              bg="white"
              boxShadow="sm"
            >
              {recipe.image ? (
                <Image
                  src={recipe.image}
                  alt={recipe.name}
                  objectFit="cover"
                  width="100%"
                  height="140px"
                />
              ) : null}

              <Stack p="5" gap="4" height="100%">
                <Heading size="md">{recipe.name}</Heading>

                <Flex wrap="wrap" gap="4" color="gray.600" fontSize="sm">
                  <HStack gap="1.5">
                    <FaClock />
                    <Text>{prepTime + cookTime} mins</Text>
                  </HStack>
                  <HStack gap="1.5">
                    <FaUtensils />
                    <Text>{recipe.mealType}</Text>
                  </HStack>
                </Flex>

                <Flex wrap="wrap" gap="2">
                  {(recipe.tags || []).slice(0, 3).map((tag) => (
                    <Box key={tag} {...chipStyles}>
                      {tag}
                    </Box>
                  ))}
                </Flex>

                <Separator />

                <Text fontSize="sm" color="gray.600">
                  {explanations[recipe.id]}
                </Text>
              </Stack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default RecommendedRecipes;
