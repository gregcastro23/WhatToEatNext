"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Box } from '@mui/material';
import { Science } from '@mui/icons-material';

interface MethodImageProps {
  method: string;
  size?: number;
}

export default function MethodImage({ method, size = 300 }: MethodImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imagePath, setImagePath] = useState(`/images/methods/${method.toLowerCase()}.jpg`);
  
  // Reset error state if method changes
  useEffect(() => {
    setImageError(false);
    setImagePath(`/images/methods/${method.toLowerCase()}.jpg`);
  }, [method]);

  const handleImageError = () => {
    // Try png if jpg fails
    if (imagePath.endsWith('.jpg')) {
      setImagePath(`/images/methods/${method.toLowerCase()}.png`);
    } else if (imagePath.endsWith('.png')) {
      // If both jpg and png fail, show generic image
      setImagePath('/images/methods/generic-cooking-method.jpg');
    } else {
      // If even the generic image fails, set error to true to show fallback
      setImageError(true);
    }
  };

  if (imageError) {
    return (
      <Box 
        sx={{ 
          width: size, 
          height: size,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: 2,
          color: 'text.secondary'
        }}
      >
        <Science sx={{ fontSize: size / 4 }} />
      </Box>
    );
  }

  return (
    <Image
      src={imagePath}
      alt={`${method} cooking method`}
      width={size}
      height={size}
      style={{
        objectFit: 'cover',
        borderRadius: 8,
      }}
      onError={handleImageError}
      priority
    />
  );
} 