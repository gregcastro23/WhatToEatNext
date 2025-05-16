'use client';

import { useEffect, useState } from 'react';
import @/lib  from 'tarotCalculations ';
import styles from './TarotCardDisplay.module.css';

interface TarotTokenValues {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

interface TarotCards {
  minorCard: {
    name: string;
    suit: string;
    number: number;
    keywords: string[];
    element?: string;
    quantum?: number;
    associatedRecipes?: string[];
  };
  majorCard: {
    name: string;
    planet: string;
    keywords: string[];
    element?: string;
  };
}

export default function TarotCardDisplay() {
  const [tarotCards, setTarotCards] = useState<TarotCards | null>(null);
  const [tokenValues, setTokenValues] = useState<TarotTokenValues>({
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const currentDate = new Date();
      const cards = getTarotCardsForDate(currentDate);
      setTarotCards(cards as unknown as TarotCards);

      // Calculate token values directly in useEffect
      if (cards) {
        const newValues = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
        const suitMap: Record<string, keyof TarotTokenValues> = {
          Wands: 'Spirit',
          Cups: 'Essence',
          Pentacles: 'Matter',
          Swords: 'Substance',
        };

        const suit = cards.minorCard.suit;
        const tokenType = suitMap[suit];
        const value = cards.minorCard.number;

        if (tokenType) {
          newValues[tokenType] = value;
          setTokenValues(newValues);
        }
      }
    } catch (err) {
      setError('Failed to load tarot cards');
      // console.error(err);
    }
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!tarotCards) return <div>Loading tarot cards...</div>;

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardPair}>
        <div className={styles.card}>
          <h3>Decan Card</h3>
          <h4>{tarotCards.minorCard.name}</h4>
          <div className={styles.tokenComposition}>
            {Object.entries(tokenValues).map(([token, value]) => (
              <div key={token}>
                {token}: <span className={styles.tokenValue}>{value}</span>
              </div>
            ))}
          </div>
          <div className={styles.keywords}>
            Keywords: {tarotCards.minorCard.keywords.join(', ')}
          </div>
        </div>
        <div className={styles.card}>
          <h3>Ruling Planet</h3>
          <h4>{tarotCards.majorCard.planet}</h4>
          <div className={styles.arcanaName}>{tarotCards.majorCard.name}</div>
          <div className={styles.keywords}>
            Planetary Influence: {tarotCards.majorCard.keywords.join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
}
