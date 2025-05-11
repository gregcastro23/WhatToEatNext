'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the tarot context
export interface TarotContextType {
  tarotCard: string | null;
  tarotElementalInfluences: Record<string, number>;
  setTarotCard: (card: string) => void;
  selectedCard: string | null;
  cardMeaning: string | null;
}

// Default tarot elemental influences
export const DEFAULT_TAROT_DATA = {
  tarotCard: 'The Fool',
  tarotElementalInfluences: {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  }
};

// Create the context with a default value
const TarotContext = createContext<TarotContextType>({
  tarotCard: null,
  tarotElementalInfluences: {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  },
  setTarotCard: () => {},
  selectedCard: null,
  cardMeaning: null
});

// Create a provider component
export function TarotProvider({ children }: { children: ReactNode }) {
  const [tarotCard, setTarotCardState] = useState<string | null>(DEFAULT_TAROT_DATA.tarotCard);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [cardMeaning, setCardMeaning] = useState<string | null>(null);
  
  // Map of tarot cards to elemental influences
  const cardElementalMap: Record<string, Record<string, number>> = {
    'The Fool': { Air: 0.4, Fire: 0.3, Water: 0.2, Earth: 0.1 },
    'The Magician': { Air: 0.3, Fire: 0.4, Earth: 0.2, Water: 0.1 },
    'The High Priestess': { Water: 0.5, Air: 0.3, Earth: 0.1, Fire: 0.1 },
    'The Empress': { Earth: 0.5, Water: 0.3, Air: 0.1, Fire: 0.1 },
    'The Emperor': { Fire: 0.5, Earth: 0.3, Air: 0.1, Water: 0.1 },
    // Add more cards as needed
  };
  
  // Function to set the tarot card and update elemental influences
  const setTarotCard = (card: string) => {
    setTarotCardState(card);
    setSelectedCard(card);
    setCardMeaning(`The ${card} represents transformation and new beginnings.`);
  };
  
  // Get the elemental influences for the current card
  const tarotElementalInfluences = tarotCard && cardElementalMap[tarotCard] 
    ? cardElementalMap[tarotCard] 
    : DEFAULT_TAROT_DATA.tarotElementalInfluences;
  
  return (
    <TarotContext.Provider 
      value={{ 
        tarotCard, 
        tarotElementalInfluences, 
        setTarotCard,
        selectedCard,
        cardMeaning
      }}
    >
      {children}
    </TarotContext.Provider>
  );
}

// Create a hook to use the tarot context
export function useTarotContext() {
  return useContext(TarotContext);
}

// Export the context for direct use if needed
export default TarotContext; 