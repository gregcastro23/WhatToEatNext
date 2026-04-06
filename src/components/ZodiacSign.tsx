import { Box, Text } from "@chakra-ui/react";
import React from "react";
import type { ZodiacSign as ZodiacSignType } from "@/types/alchemy";

interface ZodiacSignProps {
  sign: ZodiacSignType | string;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

const zodiacEmoji: Record<string, string> = {
  aries: "♈",
  taurus: "♉",
  gemini: "♊",
  cancer: "♋",
  leo: "♌",
  virgo: "♍",
  libra: "♎",
  scorpio: "♏",
  sagittarius: "♐",
  capricorn: "♑",
  aquarius: "♒",
  pisces: "♓",
};

const zodiacElement: Record<string, string> = {
  aries: "Fire",
  taurus: "Earth",
  gemini: "Air",
  cancer: "Water",
  leo: "Fire",
  virgo: "Earth",
  libra: "Air",
  scorpio: "Water",
  sagittarius: "Fire",
  capricorn: "Earth",
  aquarius: "Air",
  pisces: "Water",
};

const elementColor: Record<string, string> = {
  Fire: "#FF5722",
  Earth: "#8D6E63",
  Air: "#03A9F4",
  Water: "#0288D1",
};

const sizeMap = {
  small: { box: "1.75rem", fontSize: "1.1rem", label: "2xs", padding: "0.2rem" },
  medium: { box: "2.5rem", fontSize: "1.5rem", label: "xs", padding: "0.4rem" },
  large: { box: "3.5rem", fontSize: "2.2rem", label: "sm", padding: "0.7rem" },
} as const;

export const ZodiacSign: React.FC<ZodiacSignProps> = ({
  sign,
  size = "medium",
  showLabel = false,
}) => {
  const signName = sign.toLowerCase() as ZodiacSignType;
  const element = zodiacElement[signName] || "Unknown";
  const emoji = zodiacEmoji[signName] || "?";
  const formattedName = signName.charAt(0).toUpperCase() + signName.slice(1);
  const palette = elementColor[element] || "#718096";
  const dimensions = sizeMap[size];

  return (
    <Box
      as="span"
      title={`${formattedName} (${element})`}
      display="inline-flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      borderRadius="full"
      bg={`${palette}22`}
      border="2px solid"
      borderColor={palette}
      color={palette}
      width={dimensions.box}
      minWidth={dimensions.box}
      height={showLabel ? "auto" : dimensions.box}
      minHeight={dimensions.box}
      px={dimensions.padding}
      py={showLabel ? "0.45rem" : dimensions.padding}
      lineHeight={1}
    >
      <Text fontSize={dimensions.fontSize} lineHeight={1}>
        {emoji}
      </Text>
      {showLabel ? (
        <Text mt="1" fontSize={dimensions.label} fontWeight="medium">
          {formattedName}
        </Text>
      ) : null}
    </Box>
  );
};

export default ZodiacSign;
