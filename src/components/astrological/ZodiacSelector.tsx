/**
 * Zodiac Selector Component
 * Phase 5: Frontend Integration - Reusable Zodiac Selection
 */

import { Box, HStack, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { FaFire, FaLeaf, FaSnowflake, FaSun } from "react-icons/fa";

interface ZodiacSelectorProps {
  value: string;
  onChange: (zodiacSign: string) => void;
  placeholder?: string;
  showElement?: boolean;
  size?: "sm" | "md" | "lg";
}

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
];

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

const ELEMENT_ICONS = {
  Fire: FaFire,
  Water: FaSnowflake,
  Earth: FaLeaf,
  Air: FaSun,
};

const ELEMENT_COLORS = {
  Fire: "red",
  Water: "blue",
  Earth: "green",
  Air: "yellow",
};

export const ZodiacSelector: React.FC<ZodiacSelectorProps> = ({
  value,
  onChange,
  placeholder = "Select your zodiac sign",
  showElement = true,
  size = "md",
}) => {
  const bgColor = "white";
  const borderColor = "#E2E8F0";

  return (
    <Box>
      <Text mb={2} fontWeight="medium" fontSize="sm">
        Zodiac Sign
      </Text>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
        {ZODIAC_SIGNS.map((sign) => {
          const element = ZODIAC_ELEMENTS[sign as keyof typeof ZODIAC_ELEMENTS];
          return (
            <option key={sign} value={sign}>
              {sign} {showElement && `(${element})`}
            </option>
          );
        })}
      </select>

      {value && showElement && (
        <Box mt={2}>
          <HStack gap={2}>
            <Icon
              as={
                ELEMENT_ICONS[
                  ZODIAC_ELEMENTS[
                    value as keyof typeof ZODIAC_ELEMENTS
                  ] as keyof typeof ELEMENT_ICONS
                ]
              }
              color={`${ELEMENT_COLORS[ZODIAC_ELEMENTS[value as keyof typeof ZODIAC_ELEMENTS] as keyof typeof ELEMENT_COLORS]}.500`}
              boxSize={4}
            />
            <Text fontSize="xs" color="gray.600">
              {value} is a{" "}
              {ZODIAC_ELEMENTS[value as keyof typeof ZODIAC_ELEMENTS]} sign
            </Text>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default ZodiacSelector;
