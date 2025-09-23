'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TarotElementalInfluences {
  Fire: number,
  Water: number,
  Earth: number,
  Air: number
}

export interface TarotCard {
  name: string,
  suit?: string,
  majorArcana?: boolean,
  description?: string
  planetaryInfluences?: Record<string, number>,
}

interface TarotContextType {
  tarotCard: TarotCard | null,
  tarotElementalInfluences: TarotElementalInfluences,
  setTarotCard: (card: TarotCard | null) => void,
  setTarotElementalInfluences: (influences: TarotElementalInfluences) => void
}

const defaultContext: TarotContextType = {
  tarotCard: null,
  tarotElementalInfluences: {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  },
  setTarotCard: () => {}
  setTarotElementalInfluences: () => {}
}

const TarotContext = createContext<TarotContextType>(defaultContext)
;
export const _TarotProvider = ({ children }: { children: ReactNode }) => {,
  const [tarotCard, setTarotCard] = useState<TarotCard | null>(null)
  const [tarotElementalInfluences, setTarotElementalInfluences] =
    useState<TarotElementalInfluences>({
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
    })

  return (<TarotContext.Provider
      value={{,
        tarotCard,
        tarotElementalInfluences,
        setTarotCard,
        setTarotElementalInfluences
      }}
    >
      {children}
    </TarotContext.Provider>
  )
}

export const _useTarotContext = () => useContext(TarotContext)
;