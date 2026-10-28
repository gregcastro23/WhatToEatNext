/**
 * Restaurant Menu & Website Extractor Service
 *
 * Reads restaurant websites and online menus to ingest dish names, descriptions,
 * prices, and section hierarchies. Supports Schema.org JSON-LD (the restaurant
 * industry standard used by BentoBox, Squarespace, Toast, Popmenu, OpenTable, Yelp)
 * as well as semantic HTML fallback extraction and raw text parsing.
 *
 * @file src/services/restaurantMenuExtractorService.ts
 */

import { _logger } from "@/lib/logger";

export interface RawExtractedMenuItem {
  id?: string | undefined;
  name: string;
  category?: string | undefined;
  description?: string | undefined;
  price?: string | null | undefined;
}

export interface ExtractedMenuSection {
  name: string;
  items: RawExtractedMenuItem[];
}

export interface ExtractedRestaurantMenu {
  restaurantName?: string | undefined;
  cuisine?: string | undefined;
  websiteUrl?: string | undefined;
  description?: string | undefined;
  sourceType: "schema_jsonld" | "html_semantic" | "text_parsed";
  sections: ExtractedMenuSection[];
  totalItems: number;
}

const PRICE_REGEX = /(?:\$|USD\s*|€|£)?\s*(\d{1,3}(?:\.\d{2})?)\b/i;

/**
 * Fetch HTML from a restaurant website with safety constraints (timeout, headers, size).
 */
async function fetchPageHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 WhatToEatNext-MenuAlchemist/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching restaurant page: ${res.statusText}`);
    }

    const html = await res.text();
    // Cap at 2MB to keep memory strictly bounded per our Apple Silicon constraint profile
    return html.slice(0, 2 * 1024 * 1024);
  } finally {
    clearTimeout(timeoutId);
  }
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

/**
 * Extract JSON-LD scripts containing Schema.org Restaurant, Menu, or MenuItem objects.
 */
function extractSchemaJsonLd(html: string): unknown[] {
  const scripts: unknown[] = [];
  const scriptRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    const content = match[1]?.trim();
    if (!content) continue;
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        scripts.push(...parsed);
      } else if (isRecord(parsed)) {
        if ("@graph" in parsed && Array.isArray(parsed["@graph"])) {
          scripts.push(...parsed["@graph"]);
        } else {
          scripts.push(parsed);
        }
      }
    } catch {
      // Ignore malformed JSON-LD blobs
    }
  }

  return scripts;
}

/**
 * Parses Schema.org JSON-LD objects into normalized menu sections and items.
 */
function parseJsonLdMenu(
  objects: unknown[],
  url: string,
): ExtractedRestaurantMenu | null {
  const sectionsMap = new Map<string, RawExtractedMenuItem[]>();
  let restaurantName: string | undefined;
  let cuisine: string | undefined;
  let description: string | undefined;

  for (const obj of objects) {
    if (!isRecord(obj)) continue;
    const item = obj;
    const type = String(item["@type"] ?? "");

    if (
      type.includes("Restaurant") ||
      type.includes("FoodEstablishment") ||
      type.includes("Bakery") ||
      type.includes("Cafe") ||
      type.includes("BarOrPub")
    ) {
      const { name: iName, servesCuisine: iCuisine, description: iDesc } = item;
      if (typeof iName === "string") restaurantName = iName;
      if (typeof iCuisine === "string") cuisine = iCuisine;
      if (typeof iDesc === "string") description = iDesc;

      // Check for nested hasMenu
      const menuRef = item.hasMenu;
      if (menuRef && typeof menuRef === "object") {
        objects.push(menuRef);
      }
    }

    if (type.includes("MenuSection") || type.includes("Menu")) {
      const sectionName = typeof item.name === "string" ? item.name : "Featured Items";
      const currentList = sectionsMap.get(sectionName) ?? [];

      const menuItems = item.hasMenuItem || item.itemListElement || item.hasMenuSection;
      if (Array.isArray(menuItems)) {
        for (const mi of menuItems) {
          if (!isRecord(mi)) continue;
          const miObj = mi;
          const miName = typeof miObj.name === "string" ? miObj.name.trim() : "";
          if (!miName) continue;

          let priceStr: string | null = null;
          const offers = isRecord(miObj.offers) ? miObj.offers : undefined;
          if (offers && typeof offers.price === "number") {
            priceStr = `$${offers.price.toFixed(2)}`;
          } else if (offers && typeof offers.price === "string") {
            priceStr = offers.price.startsWith("$") ? offers.price : `$${offers.price}`;
          }

          currentList.push({
            name: miName,
            category: sectionName,
            description: typeof miObj.description === "string" ? miObj.description.trim() : undefined,
            price: priceStr,
          });
        }
      }
      if (currentList.length > 0) {
        sectionsMap.set(sectionName, currentList);
      }
    }

    if (type.includes("MenuItem")) {
      const sectionName = "Menu Items";
      const currentList = sectionsMap.get(sectionName) ?? [];
      const miName = typeof item.name === "string" ? item.name.trim() : "";
      if (miName) {
        let priceStr: string | null = null;
        const offers = isRecord(item.offers) ? item.offers : undefined;
        if (offers && typeof offers.price === "number") {
          priceStr = `$${offers.price.toFixed(2)}`;
        } else if (offers && typeof offers.price === "string") {
          priceStr = offers.price.startsWith("$") ? offers.price : `$${offers.price}`;
        }

        currentList.push({
          name: miName,
          category: sectionName,
          description: typeof item.description === "string" ? item.description.trim() : undefined,
          price: priceStr,
        });
        sectionsMap.set(sectionName, currentList);
      }
    }
  }

  const sections: ExtractedMenuSection[] = [];
  let totalItems = 0;
  for (const [name, items] of sectionsMap.entries()) {
    if (items.length > 0) {
      sections.push({ name, items });
      totalItems += items.length;
    }
  }

  if (totalItems === 0) return null;

  return {
    restaurantName,
    cuisine,
    description,
    websiteUrl: url,
    sourceType: "schema_jsonld",
    sections,
    totalItems,
  };
}

/**
 * Fallback heuristic extractor for semantic HTML menus.
 */
function parseHtmlMenu(html: string, url: string): ExtractedRestaurantMenu {
  // Strip head, scripts, styles, svg
  const cleanHtml = html
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "");

  // Extract page title or og:title
  let restaurantName: string | undefined;
  const ogTitleMatch = cleanHtml.match(/<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (ogTitleMatch) {
    restaurantName = ogTitleMatch[1]?.split(/[-|·]/)[0]?.trim();
  } else {
    const titleMatch = cleanHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      restaurantName = titleMatch[1]?.split(/[-|·]/)[0]?.trim();
    }
  }

  // Extract menu blocks
  const sections: ExtractedMenuSection[] = [];
  const lines = cleanHtml
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/div>|<\/li>|<\/tr>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let currentSection = "Signature Dishes";
  let currentItems: RawExtractedMenuItem[] = [];

  const sectionKeywords = [
    "appetizer", "starter", "pasta", "pizza", "main", "entree", "secondi", "primi",
    "salad", "soup", "taco", "ramen", "dessert", "side", "beverage", "cocktail",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    // Heading detection
    const lowerLine = line.toLowerCase();
    if (
      line.length < 40 &&
      sectionKeywords.some((k) => lowerLine.includes(k)) &&
      !line.includes("$")
    ) {
      if (currentItems.length > 0) {
        sections.push({ name: currentSection, items: currentItems });
        currentItems = [];
      }
      currentSection = line;
      continue;
    }

    // Dish item detection: looks for a line with item name and price, or adjacent price
    const priceMatch = line.match(PRICE_REGEX);
    if (priceMatch && line.length < 120 && line.length > 3) {
      const [priceStr] = priceMatch;
      const namePart = line.replace(PRICE_REGEX, "").replace(/[-–—.]+$/, "").trim();

      if (namePart.length >= 3 && namePart.length < 60) {
        // Peek next line for description
        let desc: string | undefined;
        if (i + 1 < lines.length && lines[i + 1]!.length > 10 && lines[i + 1]!.length < 250 && !lines[i + 1]!.includes("$")) {
          desc = lines[i + 1];
          i++; // consume desc
        }

        currentItems.push({
          name: namePart,
          category: currentSection,
          description: desc,
          price: priceStr,
        });
      }
    }
  }

  if (currentItems.length > 0) {
    sections.push({ name: currentSection, items: currentItems });
  }

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);

  return {
    restaurantName: restaurantName || "Restaurant Menu",
    websiteUrl: url,
    sourceType: "html_semantic",
    sections,
    totalItems,
  };
}

/**
 * Parse plain-text menu pasted by user or diner.
 */
export function parseTextMenu(text: string, restaurantName?: string): ExtractedRestaurantMenu {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const sections: ExtractedMenuSection[] = [];
  let currentSection = "Featured Dishes";
  let currentItems: RawExtractedMenuItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.endsWith(":") || (line.length < 35 && line === line.toUpperCase() && line.length > 3)) {
      if (currentItems.length > 0) {
        sections.push({ name: currentSection, items: currentItems });
        currentItems = [];
      }
      currentSection = line.replace(/:$/, "").trim();
      continue;
    }

    const priceMatch = line.match(PRICE_REGEX);
    const priceStr = priceMatch ? priceMatch[0] : null;
    const namePart = priceMatch ? line.replace(PRICE_REGEX, "").trim() : line;

    if (namePart.length >= 2) {
      let desc: string | undefined;
      if (i + 1 < lines.length && lines[i + 1]!.length > 10 && !lines[i + 1]!.match(PRICE_REGEX)) {
        desc = lines[i + 1];
        i++;
      }

      currentItems.push({
        name: namePart,
        category: currentSection,
        description: desc,
        price: priceStr,
      });
    }
  }

  if (currentItems.length > 0) {
    sections.push({ name: currentSection, items: currentItems });
  }

  return {
    restaurantName: restaurantName || "Pasted Menu",
    sourceType: "text_parsed",
    sections,
    totalItems: sections.reduce((sum, s) => sum + s.items.length, 0),
  };
}

/**
 * Main ingestion entrypoint: Fetches and parses a restaurant website or online menu.
 */
export async function extractRestaurantMenu(url: string): Promise<ExtractedRestaurantMenu> {
  _logger.info(`[MenuExtractor] Fetching restaurant menu from: ${url}`);
  const html = await fetchPageHtml(url);

  // 1. First attempt: Schema.org JSON-LD
  const jsonLdObjects = extractSchemaJsonLd(html);
  if (jsonLdObjects.length > 0) {
    const parsed = parseJsonLdMenu(jsonLdObjects, url);
    if (parsed && parsed.totalItems > 0) {
      _logger.info(`[MenuExtractor] Successfully parsed ${parsed.totalItems} items via Schema.org JSON-LD`);
      return parsed;
    }
  }

  // 2. Second attempt: Semantic HTML extraction
  const htmlParsed = parseHtmlMenu(html, url);
  _logger.info(`[MenuExtractor] Parsed ${htmlParsed.totalItems} items via HTML extraction`);
  return htmlParsed;
}
