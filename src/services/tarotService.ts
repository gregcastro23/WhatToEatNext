const API_URL = 'https://rws-cards-api.herokuapp.com/api/v1/cards';

interface TarotCard {
  name: string,
  name_short: string,
  value: string,
  value_int: number,
  suit: string,
  type: string,
  meaning_up: string,
  meaning_rev: string,
  desc: string,
  image: string,
  image_back: string,
  astrological?: string;
  numerological?: string;
  elemental?: string;
  questions?: string[];
}

export async function getTarotCard(cardName: string): Promise<TarotCard | null> {
  try {
    const response = await fetch(`${API_URL}/${cardName.toLowerCase().replace(/ /g, '-')}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tarot card');
    }
    const data = await response.json();
    return data.card;
  } catch (error) {
    console.error('Error fetching tarot card:', error);
    return null;
  }
}

export async function getRandomTarotCard(): Promise<TarotCard | null> {
  try {
    const response = await fetch(`${API_URL}/random`);
    if (!response.ok) {
      throw new Error('Failed to fetch random tarot card');
    }
    const data = await response.json();
    return data.cards[0];
  } catch (error) {
    console.error('Error fetching random tarot card:', error);
    return null;
  }
}
