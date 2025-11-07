/**
 * Zodiac Selector Component
 * Phase 5: Frontend Integration - Reusable Zodiac Selection
 */

import { Box, HStack, Icon, Select as _Select, Text } from "@chakra-ui/react";
const Select = _Select as any;
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
  const borderColor = "gray.200";

  return (
    <Box>
      <Text mb={2} fontWeight="medium" fontSize="sm">
        Zodiac Sign
      </Text>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        size={size}
        bg={bgColor}
        borderColor={borderColor}
        _hover={{ borderColor: "purple.300" }}
        _focus={{
          borderColor: "purple.500",
          boxShadow: "0 0 0 1px purple.500",
        }}
      >
        {ZODIAC_SIGNS.map((sign) => {
          const element = ZODIAC_ELEMENTS[sign as keyof typeof ZODIAC_ELEMENTS];
          const ElementIcon =
            ELEMENT_ICONS[element as keyof typeof ELEMENT_ICONS];
          const elementColor =
            ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS];

          return (
            <option key={sign} value={sign}>
              {sign} {showElement && `(${element})`}
            </option>
          );
        })}
      </Select>

      {value && showElement && (
        <Box mt={2}>
          {(HStack as any)({ spacing: 2, children: [
            (Icon as any)({
              as: ELEMENT_ICONS[
                ZODIAC_ELEMENTS[
                  value as keyof typeof ZODIAC_ELEMENTS
                ] as keyof typeof ELEMENT_ICONS
              ],
              color: `${ELEMENT_COLORS[ZODIAC_ELEMENTS[value as keyof typeof ZODIAC_ELEMENTS] as keyof typeof ELEMENT_COLORS]}.500`,
              boxSize: 4,
            }),
            (Text as any)({ fontSize: "xs", color: "gray.600", children: [
              `${value} is a `,
              ZODIAC_ELEMENTS[value as keyof typeof ZODIAC_ELEMENTS],
              " sign"
            ]}),
          ]})}
        </Box>
      )}
    </Box>
  );
};

export default ZodiacSelector;
