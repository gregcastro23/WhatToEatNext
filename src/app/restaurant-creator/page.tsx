/**
 * Restaurant Creator — Premium Feature
 *
 * Design a full cosmic restaurant: name, menu, ambiance, signature drink.
 * Reuses existing alchemical calculation infrastructure and restaurant types.
 *
 * @file src/app/restaurant-creator/page.tsx
 */

"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import React, { useState, useCallback } from "react";
import { usePremium } from "@/contexts/PremiumContext";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import type {
  SavedRestaurant as _SavedRestaurant,
  MenuItem,
  MenuCategory,
  DietaryTag,
} from "@/types/restaurant";
import { MENU_CATEGORIES, DIETARY_TAGS } from "@/types/restaurant";

// Cosmic restaurant concept templates
const AMBIANCE_STYLES = [
  { id: "celestial-lounge", label: "Celestial Lounge", icon: "\u2728", desc: "Moody starlit interior with constellation projections" },
  { id: "solar-garden", label: "Solar Garden", icon: "\u2600\uFE0F", desc: "Sun-drenched open-air dining with living herb walls" },
  { id: "lunar-grotto", label: "Lunar Grotto", icon: "\uD83C\uDF19", desc: "Intimate cave-like space with silver and moonstone accents" },
  { id: "elemental-forge", label: "Elemental Forge", icon: "\uD83D\uDD25", desc: "Open kitchen theater with live fire, steam, and earth elements" },
  { id: "cosmic-market", label: "Cosmic Market", icon: "\uD83C\uDF0C", desc: "Vibrant bazaar style with spice stations and cosmic tapestries" },
];

const SIGNATURE_DRINK_BASES = [
  "Nebula Negroni", "Starfire Spritz", "Moonlit Mojito", "Eclipse Elixir",
  "Saturn Ring Sangria", "Mercury Mule", "Venus Velvet", "Jupiter Julep",
  "Mars Margarita", "Neptune Nectar", "Solar Flare Sour", "Cosmic Old Fashioned",
];

const CUISINE_FUSIONS = [
  "Italian-Japanese", "Mexican-Korean", "French-Thai", "Indian-Mediterranean",
  "Middle-Eastern-Peruvian", "Chinese-Italian", "Greek-Vietnamese",
  "African-French", "Japanese-Mexican", "Thai-Mediterranean",
];

interface RestaurantConcept {
  name: string;
  tagline: string;
  cuisineFusion: string;
  ambianceStyle: string;
  signatureDrink: string;
  menu: MenuItem[];
  cosmicAlignment: string;
}

export default function RestaurantCreatorPage() {
  const { data: _session } = useSession();
  const { tier: _tier, hasFeature, openCheckout } = usePremium();
  const astroState = useAstrologicalState();

  const [concept, setConcept] = useState<RestaurantConcept>({
    name: "",
    tagline: "",
    cuisineFusion: CUISINE_FUSIONS[0],
    ambianceStyle: "celestial-lounge",
    signatureDrink: "",
    menu: [],
    cosmicAlignment: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // New menu item state
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "Mains" as MenuCategory,
    tags: [] as DietaryTag[],
  });

  const canAccess = hasFeature("restaurantCreator");

  const generateCosmicConcept = useCallback(() => {
    setIsGenerating(true);

    // Use current planetary data to generate a thematic restaurant name
    const planetaryDay = astroState?.currentPlanetaryHour || "Sun";
    const zodiacRaw = astroState?.currentZodiac;
    const zodiac = (typeof zodiacRaw === "string" ? zodiacRaw : zodiacRaw?.sign) || "Aries";

    const namePrefix = {
      Sun: "Solaris", Moon: "Lunara", Mercury: "Mercurio", Venus: "Venusia",
      Mars: "Martian", Jupiter: "Jovian", Saturn: "Saturnine",
    }[planetaryDay] || "Cosmic";

    const nameSuffix = {
      aries: "Flame", taurus: "Garden", gemini: "Mirror", cancer: "Tide",
      leo: "Crown", virgo: "Harvest", libra: "Balance", scorpio: "Depth",
      sagittarius: "Arrow", capricorn: "Summit", aquarius: "Stream", pisces: "Dream",
    }[zodiac?.toLowerCase()] || "Table";

    const randomFusion =
      CUISINE_FUSIONS[Math.floor(Math.random() * CUISINE_FUSIONS.length)];
    const randomDrink =
      SIGNATURE_DRINK_BASES[Math.floor(Math.random() * SIGNATURE_DRINK_BASES.length)];
    const randomAmbiance =
      AMBIANCE_STYLES[Math.floor(Math.random() * AMBIANCE_STYLES.length)];

    setTimeout(() => {
      setConcept({
        name: `${namePrefix} ${nameSuffix}`,
        tagline: `Where ${randomFusion.split("-")[0]} meets ${randomFusion.split("-")[1]} under the ${zodiac} sky`,
        cuisineFusion: randomFusion,
        ambianceStyle: randomAmbiance.id,
        signatureDrink: randomDrink,
        menu: [],
        cosmicAlignment: `${planetaryDay} day, ${zodiac} season - ${randomAmbiance.label} ambiance`,
      });
      setIsGenerating(false);
    }, 1500);
  }, [astroState]);

  const addMenuItem = useCallback(() => {
    if (!newItem.name.trim()) return;

    const item: MenuItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: newItem.name.trim(),
      description: newItem.description.trim() || undefined,
      price: newItem.price ? parseFloat(newItem.price) : undefined,
      category: newItem.category,
      dietaryTags: [...newItem.tags],
    };

    setConcept((prev) => ({ ...prev, menu: [...prev.menu, item] }));
    setNewItem({ name: "", description: "", price: "", category: "Mains", tags: [] });
  }, [newItem]);

  const removeMenuItem = useCallback((id: string) => {
    setConcept((prev) => ({
      ...prev,
      menu: prev.menu.filter((i) => i.id !== id),
    }));
  }, []);

  // Premium gate
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white rounded-2xl shadow-xl border border-slate-200 p-10">
          <div className="text-6xl mb-6">{"\uD83C\uDF1F"}</div>
          <h1 className="text-3xl font-black mb-3 text-slate-900">
            Premium Feature
          </h1>
          <p className="text-slate-600 mb-6">
            The Cosmic Restaurant Creator is available to Premium and Cosmic
            subscribers. Design your dream restaurant aligned with the stars.
          </p>
          <button
            onClick={() => { void openCheckout("premium"); }}
            className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md"
          >
            Upgrade to Premium
          </button>
          <Link
            href="/premium"
            className="block mt-4 text-purple-600 font-medium hover:underline"
          >
            Compare all plans
          </Link>
        </div>
      </div>
    );
  }

  const selectedAmbiance = AMBIANCE_STYLES.find(
    (a) => a.id === concept.ambianceStyle,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-amber-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-rose-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
            Cosmic Restaurant Creator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Design a celestially-aligned restaurant concept. Name, menu, ambiance,
            and signature drink - all guided by the cosmic moment.
          </p>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-10">
          <button
            onClick={generateCosmicConcept}
            disabled={isGenerating}
            className="px-10 py-4 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-rose-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 flex items-center gap-3 mx-auto"
          >
            {isGenerating ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Consulting the Stars...
              </>
            ) : (
              <>
                {"\u2728"} Generate Cosmic Concept
              </>
            )}
          </button>
        </div>

        {/* Concept Display */}
        {concept.name && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Restaurant Identity */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1">
                  <input
                    type="text"
                    value={concept.name}
                    onChange={(e) =>
                      setConcept((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="text-4xl font-black text-slate-900 bg-transparent border-none outline-none w-full placeholder-slate-300"
                    placeholder="Restaurant Name"
                  />
                  <input
                    type="text"
                    value={concept.tagline}
                    onChange={(e) =>
                      setConcept((prev) => ({
                        ...prev,
                        tagline: e.target.value,
                      }))
                    }
                    className="text-lg text-slate-500 italic bg-transparent border-none outline-none w-full mt-2 placeholder-slate-300"
                    placeholder="Your cosmic tagline..."
                  />
                </div>
                <div className="text-right text-sm text-slate-400">
                  <p className="font-medium">{concept.cosmicAlignment}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                {/* Cuisine Fusion */}
                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Cuisine Fusion
                  </p>
                  <select
                    value={concept.cuisineFusion}
                    onChange={(e) =>
                      setConcept((prev) => ({
                        ...prev,
                        cuisineFusion: e.target.value,
                      }))
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    {CUISINE_FUSIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ambiance */}
                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Ambiance Style
                  </p>
                  <select
                    value={concept.ambianceStyle}
                    onChange={(e) =>
                      setConcept((prev) => ({
                        ...prev,
                        ambianceStyle: e.target.value,
                      }))
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    {AMBIANCE_STYLES.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.icon} {a.label}
                      </option>
                    ))}
                  </select>
                  {selectedAmbiance && (
                    <p className="text-xs text-slate-400 mt-2">
                      {selectedAmbiance.desc}
                    </p>
                  )}
                </div>

                {/* Signature Drink */}
                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Signature Drink
                  </p>
                  <input
                    type="text"
                    value={concept.signatureDrink}
                    onChange={(e) =>
                      setConcept((prev) => ({
                        ...prev,
                        signatureDrink: e.target.value,
                      }))
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium"
                    placeholder="e.g., Nebula Negroni"
                  />
                </div>
              </div>
            </div>

            {/* Menu Builder */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">Menu</h2>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-sm font-medium text-purple-600 hover:underline"
                >
                  {showMenu ? "Hide form" : "+ Add items"}
                </button>
              </div>

              {showMenu && (
                <div className="bg-slate-50 rounded-xl p-6 mb-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Dish name"
                      className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                    />
                    <input
                      type="text"
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Short description"
                      className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                    />
                    <input
                      type="number"
                      value={newItem.price}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      placeholder="Price"
                      step="0.01"
                      className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                    />
                    <select
                      value={newItem.category}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          category: e.target.value as MenuCategory,
                        }))
                      }
                      className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                    >
                      {MENU_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dietary Tags */}
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_TAGS.map((tag) => (
                      <button
                        key={tag.key}
                        onClick={() =>
                          setNewItem((prev) => ({
                            ...prev,
                            tags: prev.tags.includes(tag.key)
                              ? prev.tags.filter((t) => t !== tag.key)
                              : [...prev.tags, tag.key],
                          }))
                        }
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          newItem.tags.includes(tag.key)
                            ? `${tag.color  } border-current`
                            : "bg-white text-slate-400 border-slate-200"
                        }`}
                      >
                        {tag.icon} {tag.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={addMenuItem}
                    disabled={!newItem.name.trim()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 disabled:opacity-50 transition-all"
                  >
                    Add to Menu
                  </button>
                </div>
              )}

              {/* Menu Items by Category */}
              {MENU_CATEGORIES.filter((cat) =>
                concept.menu.some((item) => item.category === cat),
              ).map((cat) => (
                <div key={cat} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">
                    {cat}
                  </h3>
                  <div className="space-y-2">
                    {concept.menu
                      .filter((item) => item.category === cat)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">
                                {item.name}
                              </span>
                              {item.dietaryTags.map((tag) => {
                                const tagData = DIETARY_TAGS.find(
                                  (t) => t.key === tag,
                                );
                                return (
                                  <span
                                    key={tag}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tagData?.color || ""}`}
                                  >
                                    {tagData?.icon}
                                  </span>
                                );
                              })}
                            </div>
                            {item.description && (
                              <p className="text-sm text-slate-500">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {item.price && (
                              <span className="font-bold text-slate-700">
                                ${item.price.toFixed(2)}
                              </span>
                            )}
                            <button
                              onClick={() => removeMenuItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all text-sm"
                            >
                              {"\u2715"}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}

              {concept.menu.length === 0 && (
                <p className="text-center text-slate-400 py-8">
                  No menu items yet. Click &quot;+ Add items&quot; to start building your
                  cosmic menu.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!concept.name && (
          <div className="text-center py-20 text-slate-400">
            <div className="text-6xl mb-4">{"\uD83C\uDF1F"}</div>
            <p className="text-xl font-medium">
              Click &quot;Generate Cosmic Concept&quot; to start designing your restaurant
            </p>
            <p className="text-sm mt-2">
              The concept will be aligned with the current planetary positions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
