/**
 * Season Selector Component
 * Phase 5: Frontend Integration - Seasonal Selection
 */

import {
    Box,
    HStack,
    Icon,
    Text,
    VStack
} from "@chakra-ui/react";
import React from "react";
import {
    FaLeaf as FaAutumnLeaf,
    FaLeaf,
    FaSnowflake,
    FaSun
} from "react-icons/fa";

interface SeasonSelectorProps {
  value: string;
  onChange: (season: string) => void;
  placeholder?: string;
  showDescription?: boolean;
  size?: "sm" | "md" | "lg";
}

const SEASONS = ["spring", "summer", "autumn", "winter"];

const SEASON_INFO = {
  spring: {
    icon: FaLeaf,
    color: "green",
    description: "Fresh growth, renewal, light flavors",
    ingredients: "Asparagus, peas, strawberries, herbs",
  },
  summer: {
    icon: FaSun,
    color: "yellow",
    description: "Abundance, grilling, vibrant colors",
    ingredients: "Tomatoes, corn, berries, zucchini",
  },
  autumn: {
    icon: FaAutumnLeaf,
    color: "orange",
    description: "Harvest, warmth, hearty flavors",
    ingredients: "Squash, apples, root vegetables, spices",
  },
  winter: {
    icon: FaSnowflake,
    color: "blue",
    description: "Comfort, warmth, preserved ingredients",
    ingredients: "Citrus, root vegetables, preserved foods, spices",
  },
};

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  value,
  onChange,
  placeholder = "Select current season",
  showDescription = true,
  size = "md",
}) => {
  const bgColor = "white";
  const borderColor = "gray.200";

  return (
    <Box>
      <Text mb={2} fontWeight="medium" fontSize="sm">
        Current Season
      </Text>
      <select
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding:
            size === "sm"
              ? "4px 8px"
              : size === "lg"
                ? "12px 16px"
                : "8px 12px",
          backgroundColor: bgColor,
          borderColor,
          borderRadius: "6px",
          borderWidth: "1px",
        }}
      >
        <option value="">{placeholder}</option>
        {SEASONS.map((season) => (
          <option key={season} value={season}>
            {season}
          </option>
        ))}
      </select>

      {value && showDescription && (
        <Box mt={2}>
          <HStack gap={2} alignItems="flex-start">
            <Icon
              as={SEASON_INFO[value as keyof typeof SEASON_INFO].icon}
              color={`${SEASON_INFO[value as keyof typeof SEASON_INFO].color}.500`}
              boxSize={4}
              mt={0.5}
            />
            <VStack alignItems="flex-start" gap={1}>
              <Text fontSize="xs" fontWeight="medium" color="gray.700">
                {SEASON_INFO[value as keyof typeof SEASON_INFO].description}
              </Text>
              <Text fontSize="xs" color="gray.600">
                Featured:{" "}
                {SEASON_INFO[value as keyof typeof SEASON_INFO].ingredients}
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default SeasonSelector;
