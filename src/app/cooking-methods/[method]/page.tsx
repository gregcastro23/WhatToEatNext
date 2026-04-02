"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { 
  FaClock, 
  FaUtensils, 
  FaFire, 
  FaFlask, 
  FaThermometerHalf, 
  FaExclamationTriangle,
  FaBolt,
  FaArrowLeft
} from "react-icons/fa";
import { allCookingMethods } from "@/data/cooking/methods";
import type { CookingMethodInfo } from "@/types/cooking";

// Fallback placeholders for missing components to keep page functional
const MethodImage = ({ method }: { method: string }) => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
    <span className="text-gray-400">Image for {method}</span>
  </div>
);

const ZodiacSignType = ({
  sign,
  size = "medium",
}: {
  sign: string;
  size?: "small" | "medium" | "large";
}) => {
  const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    medium: "px-3 py-1 text-sm",
    large: "px-4 py-2 text-base"
  };
  
  return (
    <span className={`inline-block bg-purple-100 text-purple-700 rounded-full font-medium ${sizeClasses[size]}`}>
      {sign}
    </span>
  );
};

export default function CookingMethodPage() {
  const params = useParams();
  const [method, setMethod] = useState<CookingMethodInfo | null>(null);
  const [methodKey, setMethodKey] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.method) {
      const methodId = Array.isArray(params.method)
        ? params.method[0]
        : params.method;

      // Find the method in allCookingMethods
      let foundMethod: CookingMethodInfo | null = null;
      let foundKey = "";
      Object.entries(allCookingMethods).forEach(([key, data]) => {
        if (key.toLowerCase() === methodId.toLowerCase()) {
          foundMethod = data as CookingMethodInfo;
          foundKey = key;
        }
      });

      setMethod(foundMethod);
      setMethodKey(foundKey);
      setLoading(false);
    }
  }, [params]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center">Loading cooking method...</h1>
      </div>
    );
  }

  if (!method) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Cooking method not found</h1>
        <Link href="/cooking-methods" className="text-blue-600 hover:underline flex items-center justify-center gap-2">
          <FaArrowLeft /> Return to cooking methods
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/cooking-methods" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6 transition-colors">
        <FaArrowLeft /> Back to Cooking Methods
      </Link>

      <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 mb-8 bg-gradient-to-b from-white to-gray-50 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 capitalize text-gray-900">
              {methodKey}
            </h1>

            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {method && typeof method === "object" && "description" in method
                ? String((method as unknown as { description?: string }).description)
                : "No description available"}
            </p>

            <div className="flex items-center gap-3 text-gray-700 font-medium">
              <FaClock className="text-blue-500 text-xl" />
              <span>
                {method && typeof method === "object" && "duration" in method
                  ? String((method as unknown as { duration?: string }).duration)
                  : "Duration not specified"}
              </span>
            </div>
          </div>

          <div className="h-64 md:h-80 w-full shadow-inner rounded-xl overflow-hidden border border-gray-200">
            <MethodImage method={methodKey} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-8">
          <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Benefits</h2>
            <ul className="space-y-3">
              {method && typeof method === "object" && "benefits" in method ? (
                Array.isArray((method as unknown as { benefits?: string[] }).benefits) ? (
                  (method as unknown as { benefits: string[] }).benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-700">
                    {String((method as unknown as { benefits?: string | string[] }).benefits)}
                  </p>
                )
              ) : (
                <p className="text-gray-500 italic">No benefits information available</p>
              )}
            </ul>

            <div className="my-8 border-t border-gray-100" />

            <h2 className="text-2xl font-bold mb-4 text-gray-800">Suitable Foods</h2>
            <div className="flex flex-wrap gap-2">
              {method &&
                typeof method === "object" &&
                "suitable_for" in method &&
                Array.isArray((method as unknown as { suitable_for?: string[] }).suitable_for) &&
                (method as unknown as { suitable_for: string[] }).suitable_for.map((food: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-medium"
                  >
                    {food}
                  </span>
                ))}
            </div>

            {method &&
              typeof method === "object" &&
              "variations" in method &&
              (method as unknown as { variations?: string[] }).variations && (
                <>
                  <div className="my-8 border-t border-gray-100" />
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Variations</h2>
                  <ul className="space-y-2">
                    {Array.isArray((method as unknown as { variations?: string[] }).variations) &&
                      (method as unknown as { variations: string[] }).variations.map((variation: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                          <span className="text-blue-400 mt-1">•</span>
                          {variation}
                        </li>
                      ))}
                  </ul>
                </>
              )}

            {method.commonMistakes && (
              <>
                <div className="my-8 border-t border-gray-100" />
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Common Mistakes</h2>
                <ul className="space-y-2">
                  {Array.isArray(method.commonMistakes) ? (
                    method.commonMistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <span className="text-red-400 mt-1">•</span>
                        {mistake}
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-700">{method.commonMistakes}</p>
                  )}
                </ul>
              </>
            )}

            {method.pairingSuggestions && (
              <>
                <div className="my-8 border-t border-gray-100" />
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Pairing Suggestions</h2>
                <ul className="space-y-2">
                  {Array.isArray(method.pairingSuggestions) ? (
                    method.pairingSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <span className="text-purple-400 mt-1">•</span>
                        {suggestion}
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-700">{method.pairingSuggestions}</p>
                  )}
                </ul>
              </>
            )}

            {method.scientificPrinciples && (
              <>
                <div className="my-8 border-t border-gray-100" />
                <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <FaFlask className="text-indigo-500" /> Scientific Principles
                </h2>
                <ul className="space-y-2">
                  {Array.isArray(method.scientificPrinciples) ? (
                    method.scientificPrinciples.map((principle, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <span className="text-indigo-400 mt-1">•</span>
                        {principle}
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-700">{method.scientificPrinciples}</p>
                  )}
                </ul>
              </>
            )}

            {method.history && (
              <>
                <div className="my-8 border-t border-gray-100" />
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Historical Context</h2>
                <p className="text-gray-700 leading-relaxed">{method.history}</p>
              </>
            )}

            {method.science && (
              <>
                <div className="my-8 border-t border-gray-100" />
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Science Behind It</h2>
                <p className="text-gray-700 leading-relaxed">{method.science}</p>
              </>
            )}
          </section>

          <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Technical Details</h2>
            <div className="space-y-6">
              {method.optimalTemperature && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-50 rounded-lg text-red-500 mt-1">
                    <FaThermometerHalf />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Optimal Temperature</h3>
                    <p className="text-gray-700">{method.optimalTemperature}</p>
                  </div>
                </div>
              )}

              {method.nutrientRetention && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-50 rounded-lg text-green-500 mt-1">
                    <FaUtensils />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Nutrient Retention</h3>
                    <p className="text-gray-700">{method.nutrientRetention}</p>
                  </div>
                </div>
              )}

              {method.thermodynamicProperties && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-500 mt-1">
                    <FaFire />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Thermodynamic Properties</h3>
                    <p className="text-gray-700">{method.thermodynamicProperties}</p>
                  </div>
                </div>
              )}

              {method.chemicalChanges && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500 mt-1">
                    <FaFlask />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Chemical Changes</h3>
                    <p className="text-gray-700">{method.chemicalChanges}</p>
                  </div>
                </div>
              )}

              {method.safetyFeatures && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-yellow-50 rounded-lg text-yellow-500 mt-1">
                    <FaExclamationTriangle />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Safety Features</h3>
                    <p className="text-gray-700">{method.safetyFeatures}</p>
                  </div>
                </div>
              )}

              {method.equipmentComplexity && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-500 mt-1">
                    <FaBolt />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Equipment Complexity</h3>
                    <p className="text-gray-700">{method.equipmentComplexity}</p>
                  </div>
                </div>
              )}

              {method.regionalVariations && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Regional Variations</h3>
                  <p className="text-gray-700 leading-relaxed">{method.regionalVariations}</p>
                </div>
              )}

              {method.modernVariations && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Modern Variations</h3>
                  <p className="text-gray-700 leading-relaxed">{method.modernVariations}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="md:col-span-4 space-y-8">
          <aside className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Method Details</h2>
            
            <div className="space-y-6">
              {method &&
                typeof method === "object" &&
                "time_range" in method &&
                (method as unknown as { time_range?: { min?: number; max?: number } }).time_range && (
                  <div className="flex items-center gap-4">
                    <FaClock className="text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Time Range</p>
                      <p className="font-semibold">
                        {(method as unknown as { time_range?: { min?: number; max?: number } }).time_range?.min || "N/A"}
                        -
                        {(method as unknown as { time_range?: { min?: number; max?: number } }).time_range?.max || "N/A"}{" "}
                        minutes
                      </p>
                    </div>
                  </div>
                )}

              {method.temperature_range && (
                <div className="flex items-center gap-4">
                  <FaThermometerHalf className="text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500">Temperature Range</p>
                    <p className="font-semibold">
                      {typeof method.temperature_range === "object" && "min" in method.temperature_range
                        ? `${method.temperature_range.min}°C - ${method.temperature_range.max}°C`
                        : JSON.stringify(method.temperature_range)}
                    </p>
                  </div>
                </div>
              )}

              {method.alchemical_properties && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Alchemical Properties</h3>
                  <div className="space-y-3 text-sm">
                    {!!method.alchemical_properties.element && (
                      <p className="text-gray-700">
                        <strong className="text-gray-900">Element:</strong>{" "}
                        {String(method.alchemical_properties.element)}
                      </p>
                    )}
                    {!!method.alchemical_properties.planetary_influence && (
                      <p className="text-gray-700">
                        <strong className="text-gray-900">Planetary Influence:</strong>{" "}
                        {String(method.alchemical_properties.planetary_influence)}
                      </p>
                    )}
                    {!!method.alchemical_properties.effect_on_ingredients && (
                      <p className="text-gray-700 leading-snug">
                        <strong className="text-gray-900">Effect on Ingredients:</strong>{" "}
                        {String(method.alchemical_properties.effect_on_ingredients)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {method.tools && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Tools Needed</h3>
                  <ul className="grid grid-cols-1 gap-2">
                    {Array.isArray(method.tools) &&
                      method.tools.map((tool, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          {tool}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {method.famous_dishes && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Famous Dishes</h3>
                  <ul className="grid grid-cols-1 gap-2">
                    {Array.isArray(method.famous_dishes) &&
                      method.famous_dishes.map((dish, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          {dish}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {method.health_benefits && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                    <FaUtensils className="text-green-500" /> Health Benefits
                  </h3>
                  <ul className="space-y-2">
                    {Array.isArray(method.health_benefits) &&
                      method.health_benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-400 mt-1">•</span>
                          {benefit}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {method.health_considerations && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-500" /> Health Considerations
                  </h3>
                  <ul className="space-y-2">
                    {Array.isArray(method.health_considerations) &&
                      method.health_considerations.map((consideration, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-red-400 mt-1">•</span>
                          {consideration}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          {(method.astrologicalInfluence ||
            method.zodiacResonance ||
            method.planetaryInfluences) && (
            <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Astrological Influences</h2>
              <div className="space-y-6">
                {method.astrologicalInfluence && (
                  <p className="text-gray-700 leading-relaxed italic border-l-4 border-purple-200 pl-4">
                    &quot;{method.astrologicalInfluence}&quot;
                  </p>
                )}

                {method.zodiacResonance && method.zodiacResonance.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Zodiac Resonance</h3>
                    <div className="flex flex-wrap gap-2">
                      {method.zodiacResonance.map((sign, index) => (
                        <ZodiacSignType key={index} sign={sign} size="medium" />
                      ))}
                    </div>
                  </div>
                )}

                {method.planetaryInfluences && method.planetaryInfluences.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Planetary Influences</h3>
                    <div className="flex flex-wrap gap-2">
                      {method.planetaryInfluences.map((planet, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold uppercase"
                        >
                          {planet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
