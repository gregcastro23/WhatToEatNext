"use client";

import { experimental_useObject as useObject } from '@ai-sdk/react';
import Image from 'next/image';
import { useState } from 'react';
import { FaMagic, FaCog, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useUser } from '@/contexts/UserContext';
import { cosmicRecipeSchema } from '@/types/cosmicRecipeSchema';
import type { z } from 'zod';

type CosmicRecipe = z.infer<typeof cosmicRecipeSchema>;

export default function CosmicRecipeGenerator() {
  const { currentUser } = useUser();

  const [prompt, setPrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ingredientsMain, setIngredientsMain] = useState("");
  const [disallowedIngredients, setDisallowedIngredients] = useState("");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Parse birthData from UserContext if available
  const bd = currentUser?.birthData;
  const birthData = bd?.dateTime ? (() => {
      const dt = new Date(bd.dateTime);
      return {
        year: dt.getFullYear(),
        month: dt.getMonth() + 1,
        day: dt.getDate(),
        hour: dt.getHours(),
        minute: dt.getMinutes(),
        latitude: bd.latitude ?? 40.7128,
        longitude: bd.longitude ?? -74.0060,
      };
  })() : undefined;

  const preferences = currentUser?.preferences;
  const dietArray = (preferences?.dietaryRestrictions ?? []) as string[];
  const diet = dietArray.length ? dietArray.join(", ") : "no-restrictions";

  const { object: rawObject, submit, isLoading } = useObject({
    api: '/api/generate-cosmic-recipe',
    schema: cosmicRecipeSchema as any,
    onFinish: async (event: any) => {
       if (event.object?.title) {
          await generateImage(event.object?.title, event.object?.short_description || "");
       }
    }
  });
  const object = rawObject as Partial<CosmicRecipe> | undefined;

  const handleGenerate = () => {
    setImageUrl(null);
    submit({
      prompt: prompt || "A nourishing, restorative meal",
      diet,
      ingredients_main: ingredientsMain.split(',').map(i => i.trim()).filter(Boolean),
      disallowed_ingredients: disallowedIngredients.split(',').map(i => i.trim()).filter(Boolean),
      birthData,
    });
  };

  const generateImage = async (title: string, description: string) => {
    try {
      setIsGeneratingImage(true);
      const res = await fetch('/api/nanobanana/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) setImageUrl(data.url);
      }
    } catch (e) {
      console.error("Nanobanana 2 Image Generation failed", e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 font-sans">
      {!currentUser && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✨</div>
            <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">
              Sign in to unlock personalized recipes woven from your unique <span className="font-bold underline decoration-purple-300">astrological blueprint</span>.
            </p>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new Event('open-signin-modal'))}
            className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-lg border border-purple-200 dark:border-purple-700 shadow-sm hover:bg-purple-50 dark:hover:bg-slate-700 transition-all"
          >
            Sign In Now
          </button>
        </div>
      )}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent flex items-center justify-center sm:justify-start gap-3">
          <FaMagic className="w-8 h-8 text-purple-600" />
          The Alchemist&apos;s Kitchen
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Describe what you&apos;re craving. We&apos;ll weave your astrological blueprint and the High Science Culinary Arts into the perfect dish.
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-4 mb-10 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What should we create? (e.g., A warm, grounding stew for Saturn day...)"
            className="flex-1 px-5 py-3.5 text-lg border border-slate-300 dark:border-slate-600 shadow-sm rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
          />
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Manifesting...
              </>
            ) : (
              <>
                Generate
                <FaMagic className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="pt-2">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-purple-600 transition-colors"
          >
            <FaCog className="w-4 h-4" />
            {showAdvanced ? 'Hide Elements & Restrictions' : 'Expand Culinary Settings'}
            {showAdvanced ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
          </button>
          
          {showAdvanced && (
            <div className="mt-4 grid sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Key Ingredients (use comma)
                </label>
                <input 
                  type="text" 
                  value={ingredientsMain}
                  onChange={(e) => setIngredientsMain(e.target.value)}
                  placeholder="e.g., Chicken, Basil, Garlic"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Avoid Ingredients
                </label>
                <input 
                  type="text" 
                  value={disallowedIngredients}
                  onChange={(e) => setDisallowedIngredients(e.target.value)}
                  placeholder="e.g., Peanuts, Coriander"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="sm:col-span-2 mt-2">
                <div className="flex gap-2 items-center text-xs text-slate-500 bg-white dark:bg-slate-900 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-purple-600">Active Profile:</span>
                  <span>{birthData ? `Birth Chart Attached` : `No Chart Provided`}</span>
                  <span className="mx-2">|</span>
                  <span className="capitalize text-slate-600 font-medium">Diet: {diet || 'None'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {object && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header Section */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-8 text-center sm:text-left">
            {object.tags?.meal_type && (
               <span className="inline-block px-3 py-1 mb-4 bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wide rounded-full">
                 {object.tags.meal_type}
               </span>
            )}
            <h2 className="text-4xl sm:text-5xl font-black mb-4 text-slate-900 dark:text-white leading-tight">
              {object.title || "Consulting the Stars..."}
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 font-serif italic max-w-3xl">
              {object.short_description}
            </p>
            
            {/* Image Box */}
            {!isLoading && (
              <div className="mt-8 transition-opacity duration-1000">
                {imageUrl ? (
                  <div className="relative group rounded-2xl overflow-hidden shadow-2xl">
	                     <Image
	                       src={imageUrl}
	                       alt={object.title || "Recipe Result"}
	                       fill
	                       unoptimized
	                       sizes="100vw"
	                       className="w-full h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
	                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                ) : isGeneratingImage ? (
                   <div className="w-full h-96 bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 animate-pulse rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                     <FaMagic className="w-10 h-10 text-purple-400 mb-3 animate-bounce" />
                     <p className="text-slate-500 font-semibold uppercase tracking-wider">Nanobanana 2 Visualizing...</p>
                   </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column (Meta & Elements) */}
            <div className="space-y-6">
               {/* Quick Stats */}
               <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Time</p>
                       <p className="font-semibold text-lg">{object.total_time?.toString() || '--'} min</p>
                     </div>
                     <div>
                       <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Serves</p>
                       <p className="font-semibold text-lg">{object.yields?.toString() || '--'}</p>
                     </div>
                     <div>
                       <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Difficulty</p>
                       <p className="font-semibold text-lg capitalize">{object.difficulty || '--'}</p>
                     </div>
                     <div>
                       <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Cuisine</p>
                       <p className="font-semibold text-lg capitalize">{object.cuisine || '--'}</p>
                     </div>
                  </div>
               </div>

              {/* Elemental Balance Bar */}
              {object.elementalBalance && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-5 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <span className="text-amber-500">✧</span> Elemental Profile
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Fire', val: object.elementalBalance.fire, color: 'bg-red-500', icon: '🔥' },
                      { name: 'Earth', val: object.elementalBalance.earth, color: 'bg-emerald-600', icon: '🌍' },
                      { name: 'Air', val: object.elementalBalance.air, color: 'bg-amber-400', icon: '💨' },
                      { name: 'Water', val: object.elementalBalance.water, color: 'bg-blue-500', icon: '💧' }
                    ].map((el) => (
                      <div key={el.name} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold flex items-center gap-2">{el.icon} {el.name}</span>
                          <span className="text-slate-500 font-medium">{el.val || 0}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${el.color} transition-all duration-1000 ease-out`} 
                            style={{ width: `${Math.min(100, el.val || 0)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Astro Details */}
              {object.astro_explanation && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6 rounded-2xl border border-indigo-100 dark:border-purple-900/50">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-indigo-900 dark:text-indigo-200">
                    Cosmic Mapping
                  </h3>
                  <p className="mb-4 text-indigo-800 dark:text-indigo-300 text-sm leading-relaxed font-medium">
                    {object.astro_explanation.summary}
                  </p>
                  <ul className="space-y-2.5">
                    {object.astro_explanation.correspondences?.map((item, i) => (
                      <li key={i} className="flex gap-2.5 text-indigo-700 dark:text-indigo-400 text-sm">
                        <span className="text-indigo-400 shrink-0">✦</span> 
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column (Ingredients & Methods) */}
            <div className="lg:col-span-2 space-y-10">
              {/* Ingredients */}
              <div>
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  Ingredients
                  <span className="text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                    {object.ingredients?.length || 0} items
                  </span>
                </h3>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {object.ingredients?.map((ing, i) => (
                    <li key={i} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight">{ing?.name}</span>
                        <span className="text-purple-600 dark:text-purple-400 font-semibold whitespace-nowrap ml-4">
                          {ing?.quantity} {ing?.unit}
                        </span>
                      </div>
                      {ing?.household_description && (
                        <span className="text-sm text-slate-500 block">{ing.household_description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Methods */}
              <div>
                <h3 className="text-2xl font-black mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
                  Alchemical Process
                </h3>
                <div className="space-y-6">
                  {object.steps?.sort((a,b)=>((a?.step_number || 0) - (b?.step_number || 0))).map((step, i) => (
                    <div key={i} className="flex gap-5 group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-lg border-2 border-white dark:border-slate-900 shadow-sm shadow-purple-200 dark:shadow-none group-hover:scale-110 transition-transform">
                        {step?.step_number}
                      </div>
                      <div className="flex-1 pt-1.5 border-b border-slate-100 dark:border-slate-800/50 pb-6 last:border-0 last:pb-0">
                        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                          {step?.instruction}
                        </p>
                        {step?.tips && step.tips.length > 0 && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl text-sm text-amber-900 dark:text-amber-200 border border-amber-100 dark:border-amber-900/30">
                            <div className="font-bold flex items-center gap-2 mb-2 uppercase tracking-wide text-[11px]">
                              <span>💡</span> Chef&apos;s Insight
                            </div>
                            <ul className="space-y-1.5 ml-1">
                               {step.tips.map((t, index) => <li key={index} className="flex gap-2"><span className="opacity-50">•</span> {t}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
