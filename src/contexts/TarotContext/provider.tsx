'use client';

import { useState } from 'react';
import { _TarotContext } from './context';
import type { TarotCard, TarotElementalInfluences } from './types';
import type { ReactNode} from 'react';

export const _TarotProvider = ({ children }: { children: ReactNode }) => {
  const [tarotCard, setTarotCard] = useState<TarotCard | null>(null);
  const [tarotElementalInfluences, setTarotElementalInfluences] =
    useState<TarotElementalInfluences>({
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    });

  return (
    <_TarotContext.Provider
      value={{
        tarotCard,
        tarotElementalInfluences,
        setTarotCard,
        setTarotElementalInfluences
      }}
    >
      {children}
    </_TarotContext.Provider>
  );
};
