'use client';

import React, { createContext } from 'react';
import { TarotContextType, TarotElementalInfluences } from './types';

const defaultContext: TarotContextType = {
  tarotCard: null,
  tarotElementalInfluences: {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
  },
  setTarotCard: () => { /* Default context - no-op */ },
  setTarotElementalInfluences: () => { /* Default context - no-op */ }
};

export const TarotContext = createContext<TarotContextType>(defaultContext); 