'use client';

import React, { useState } from 'react';

interface UserPreferences {
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  dislikedIngredients: string[];
  spicePreference: 'mild' | 'medium' | 'hot';
  complexity: 'simple' | 'moderate' | 'complex';
}

interface FoodPreferencesProps {
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
  onBack?: () => void;
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Halal',
  'Kosher',
];

const CUISINE_OPTIONS = [
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Indian',
  'Thai',
  'French',
  'Greek',
  'Mediterranean',
  'American',
  'Korean',
  'Vietnamese',
  'Middle-Eastern',
  'Spanish',
];

export const FoodPreferences: React.FC<FoodPreferencesProps> = ({
  preferences,
  onSave,
  onBack,
}) => {
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>({ ...preferences });
  const [dislikedInput, setDislikedInput] = useState('');

  const toggleDietary = (item: string) => {
    setLocalPrefs((prev) => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(item)
        ? prev.dietaryRestrictions.filter((d) => d !== item)
        : [...prev.dietaryRestrictions, item],
    }));
  };

  const toggleCuisine = (item: string) => {
    setLocalPrefs((prev) => ({
      ...prev,
      preferredCuisines: prev.preferredCuisines.includes(item)
        ? prev.preferredCuisines.filter((c) => c !== item)
        : [...prev.preferredCuisines, item],
    }));
  };

  const addDisliked = () => {
    const trimmed = dislikedInput.trim();
    if (trimmed && !localPrefs.dislikedIngredients.includes(trimmed)) {
      setLocalPrefs((prev) => ({
        ...prev,
        dislikedIngredients: [...prev.dislikedIngredients, trimmed],
      }));
      setDislikedInput('');
    }
  };

  const removeDisliked = (item: string) => {
    setLocalPrefs((prev) => ({
      ...prev,
      dislikedIngredients: prev.dislikedIngredients.filter((d) => d !== item),
    }));
  };

  return (
    <div className="bg-transparent max-w-2xl mx-auto space-y-10">
      <div className="text-left mb-6">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Foundation Rules
        </h2>
        <p className="text-slate-500 font-medium text-base mt-2">
          Tell us what you like so we can tailor recommendations to your taste.
        </p>
      </div>

      <div className="space-y-8">
        {/* Dietary Restrictions */}
        <section className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-1">Dietary Restrictions</h3>
          <p className="text-sm text-slate-500 mb-5 font-medium">Select any that apply to you.</p>
          <div className="flex flex-wrap gap-2.5">
            {DIETARY_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleDietary(item)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 ${
                  localPrefs.dietaryRestrictions.includes(item)
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border border-emerald-400'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Cuisine Preferences */}
        <section className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-1">Preferred Cuisines</h3>
          <p className="text-sm text-slate-500 mb-5 font-medium">Select cuisines you enjoy most.</p>
          <div className="flex flex-wrap gap-2.5">
            {CUISINE_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleCuisine(item)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 ${
                  localPrefs.preferredCuisines.includes(item)
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border border-emerald-400'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Spice Preference */}
        <section className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-1">Spice Tolerance</h3>
          <p className="text-sm text-slate-500 mb-5 font-medium">How spicy do you like your food?</p>
          <div className="grid grid-cols-3 gap-3">
            {(['mild', 'medium', 'hot'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setLocalPrefs((prev) => ({ ...prev, spicePreference: level }))}
                className={`px-4 py-4 rounded-xl text-base font-bold transition-all duration-300 active:scale-95 border ${
                  localPrefs.spicePreference === level
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border-emerald-400'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                }`}
              >
                {level === 'mild' ? 'Mild\n&#x1F33F;' : level === 'medium' ? 'Medium\n&#x1F336;&#xFE0F;' : 'Hot\n&#x1F525;'}
              </button>
            ))}
          </div>
        </section>

        {/* Recipe Complexity */}
        <section className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-1">Recipe Complexity</h3>
          <p className="text-sm text-slate-500 mb-5 font-medium">What level of cooking effort do you prefer?</p>
          <div className="grid grid-cols-3 gap-3">
            {(['simple', 'moderate', 'complex'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setLocalPrefs((prev) => ({ ...prev, complexity: level }))}
                className={`px-4 py-4 rounded-xl text-base font-bold transition-all duration-300 active:scale-95 border ${
                  localPrefs.complexity === level
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border-emerald-400'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* Disliked Ingredients */}
        <section className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-1">Ingredients to Avoid</h3>
          <p className="text-sm text-slate-500 mb-5 font-medium">Add any ingredients you dislike or want to avoid.</p>
          <div className="flex gap-3 mb-5">
            <input
              type="text"
              value={dislikedInput}
              onChange={(e) => setDislikedInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDisliked())}
              placeholder="e.g., cilantro, olives..."
              className="flex-1 px-5 py-3 border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium text-slate-800 shadow-sm"
            />
            <button
              type="button"
              onClick={addDisliked}
              className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-sm"
            >
              Block
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {localPrefs.dislikedIngredients.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 font-bold group"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeDisliked(item)}
                  className="text-red-400 hover:text-red-600 transition-colors w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100"
                >
                  &times;
                </button>
              </span>
            ))}
            {localPrefs.dislikedIngredients.length === 0 && (
              <p className="text-slate-400 text-sm font-medium italic">No ingredients blocked.</p>
            )}
          </div>
        </section>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-12 bg-white sticky bottom-6 p-4 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border border-slate-100 items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        ) : <div />}
        <button
          type="button"
          onClick={() => onSave(localPrefs)}
          className="flex-none px-8 py-4 bg-emerald-500 text-white rounded-xl font-black hover:bg-emerald-600 transition-all duration-300 shadow-md shadow-emerald-500/20 active:scale-95 hover:shadow-lg hover:shadow-emerald-500/30"
        >
          Save &amp; Optimize Algorithm
        </button>
      </div>
    </div>
  );
};
