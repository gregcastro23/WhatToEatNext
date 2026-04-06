"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import { Box, Icon } from "@chakra-ui/react";
import { FaFlask } from "react-icons/fa";

interface MethodImageProps {
  method: string;
  size?: number;
}

export default function MethodImage({
  method,
  size = 300,
}: MethodImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imagePath, setImagePath] = useState(
    `/images/methods/${method.toLowerCase()}.jpg`,
  );

  useEffect(() => {
    setImageError(false);
    setImagePath(`/images/methods/${method.toLowerCase()}.jpg`);
  }, [method]);

  const handleImageError = () => {
    if (imagePath.endsWith(".jpg")) {
      setImagePath(`/images/methods/${method.toLowerCase()}.png`);
      return;
    }

    if (imagePath.endsWith(".png")) {
      setImagePath("/images/methods/generic-cooking-method.jpg");
      return;
    }

    setImageError(true);
  };

  if (imageError) {
    return (
      <Box
        width={`${size}px`}
        height={`${size}px`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="blackAlpha.50"
        borderRadius="lg"
        color="gray.500"
      >
        <Icon as={FaFlask} boxSize={`${size / 4}px`} />
      </Box>
    );
  }

  return (
    <Box
      width={`${size}px`}
      height={`${size}px`}
      overflow="hidden"
      borderRadius="lg"
      position="relative"
    >
      <NextImage
        src={imagePath}
        alt={`${method} cooking method`}
        fill
        style={{ objectFit: "cover" }}
        onError={handleImageError}
        priority
      />
    </Box>
  );
}
