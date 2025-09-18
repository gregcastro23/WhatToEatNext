'use client';

import React, { useState, ReactNode } from 'react';

import { TarotContext } from './context';
import { TarotCard, TarotElementalInfluences } from './types';

export const _TarotProvider = ({ children }: { children: ReactNode }) => {
  const [tarotCard, setTarotCard] = useState<TarotCard | null>(null);
  const [tarotElementalInfluences, setTarotElementalInfluences] =
    useState<TarotElementalInfluences>({
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
    });

  return (
    <TarotContext.Provider
      value={{
        tarotCard,
        tarotElementalInfluences,
        setTarotCard,
        setTarotElementalInfluences,
      }}
    >
      {children}
    </TarotContext.Provider>
  );
};
