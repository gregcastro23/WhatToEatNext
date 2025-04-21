/**
 * Search Configuration
 * This file contains configuration for various search and recommendation tools
 */

import Fuse from 'fuse.js';
import levenshtein from 'fast-levenshtein';
// Remove the natural.js import as it requires Node.js modules
// import { natural } from 'natural';

// Avoid importing content-based-recommender directly
// Instead, we'll dynamically import it only in the browser
let ContentBasedRecommender = null;

// Dynamically load in browser only
if (typeof window !== 'undefined') {
  // Use dynamic import to load the module only on the client side
  import('content-based-recommender').then(module => {
    ContentBasedRecommender = module.default;
  }).catch(err => {
    console.warn('Failed to load content-based-recommender:', err);
  });
}

// Fuzzy search options using Fuse.js
export const fuseOptions = {
  includeScore: true,
  threshold: 0.3,
  keys: [
    'name',
    'attributes.elements',
    'attributes.keywords',
    'description'
  ]
};

/**
 * Create a new Fuse instance for fuzzy searching
 * @param {Array} collection - The collection to search through
 * @returns {Fuse} A configured Fuse instance
 */
export const createFuseInstance = (collection) => {
  return new Fuse(collection, fuseOptions);
};

/**
 * Gets similarity between two strings using Levenshtein distance
 * @param {string} str1 - First string to compare
 * @param {string} str2 - Second string to compare
 * @returns {number} Similarity score (0-1, where 1 is exact match)
 */
export const getStringSimilarity = (str1, str2) => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1; // If both strings are empty, they're identical
  
  const distance = levenshtein.get(str1.toLowerCase(), str2.toLowerCase());
  return 1 - (distance / maxLength);
};

/**
 * Simple tokenizer that splits text into words and removes stopwords
 * @param {string} text - Text to tokenize
 * @returns {string[]} Array of tokens
 */
export const tokenize = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  // Common English stopwords
  const stopwords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'of', 'from'
  ];
  
  // Remove special characters and convert to lowercase
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Split by whitespace and filter out stopwords and empty strings
  return cleanText.split(/\s+/)
    .filter(word => word && !stopwords.includes(word));
};

/**
 * Creates and trains a content-based recommender system
 * @param {Array} items - Array of items for training the recommender
 * @returns {Object} Trained recommender instance or fallback
 */
export const createRecommender = (items) => {
  // Check if ContentBasedRecommender is available
  if (!ContentBasedRecommender) {
    console.warn('ContentBasedRecommender is not available, using fallback');
    // Return a fallback implementation
    return {
      train: () => {},
      getSimilarDocuments: (id) => {
        // Simple similarity based on matching keywords
        const item = items.find(i => i.id === id || i.name === id);
        if (!item) return [];
        
        const keywords = tokenize((item.description || '') + ' ' + (item.keywords || ''));
        
        return items
          .filter(i => i.id !== id && i.name !== id)
          .map(otherItem => {
            const otherKeywords = tokenize((otherItem.description || '') + ' ' + (otherItem.keywords || ''));
            const matches = keywords.filter(word => otherKeywords.includes(word)).length;
            const score = matches / Math.max(keywords.length, 1);
            
            return {
              id: otherItem.id || otherItem.name,
              score
            };
          })
          .filter(result => result.score > 0.1)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
      }
    };
  }
  
  try {
    // Format documents for the recommender
    const documents = items.map(item => ({
      id: item.id || item.name,
      content: `${item.name} ${item.description || ''} ${item.keywords || ''}`
    }));
    
    const recommender = new ContentBasedRecommender({
      minScore: 0.1,
      maxSimilarDocuments: 10
    });
    
    recommender.train(documents);
    return recommender;
  } catch (error) {
    console.error('Error creating recommender:', error);
    return {
      train: () => {},
      getSimilarDocuments: () => []
    };
  }
};

export default {
  createFuseInstance,
  getStringSimilarity,
  createRecommender,
  tokenize
}; 