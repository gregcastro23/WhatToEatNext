/**
 * Utility for generating Amazon Associate links.
 * 
 * If an ASIN is provided, it generates a direct product link.
 * If no ASIN is available, it generates a search fallback link to ensure
 * an affiliate cookie is still placed when the user clicks through.
 */

const AMAZON_PARTNER_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || "cookingwi03f1-20";

export function getAmazonLink(query: string, asin?: string | null): string {
  const encodedQuery = encodeURIComponent(query);
  
  if (asin) {
    return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_PARTNER_TAG}`;
  }
  
  return `https://www.amazon.com/s?k=${encodedQuery}&tag=${AMAZON_PARTNER_TAG}`;
}

export function getAmazonButtonText(asin?: string | null): string {
  return asin ? "Buy on Amazon" : "Find on Amazon";
}
