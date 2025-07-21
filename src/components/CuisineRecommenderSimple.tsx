'use client';

import React from 'react';

import styles from './CuisineRecommender.module.css';

// Keep the interface exports for any code that depends on them
export interface Cuisine {
  id: string;
  name: string;
  description: string;
  elementalProperties: Record<string, number>;
  astrologicalInfluences: string[];
  zodiacInfluences?: string[];
  lunarPhaseInfluences?: string[];
}

export default function CuisineRecommender() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Cuisine Recommender</h2>
      <p className={styles.description}>
        This component is temporarily unavailable.
      </p>
    </div>
  );
} 