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
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-600">
          Food Preferences
        </h2>
        <p className="text-gray-600 text-sm mt-2">
          Tell us what you like so we can tailor recommendations to your taste.
        </p>
      </div>

      <div className="space-y-8">
        {/* Dietary Restrictions */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Dietary Restrictions</h3>
          <p className="text-xs text-gray-500 mb-3">Select any that apply to you.</p>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleDietary(item)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  localPrefs.dietaryRestrictions.includes(item)
                    ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Cuisine Preferences */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Preferred Cuisines</h3>
          <p className="text-xs text-gray-500 mb-3">Select cuisines you enjoy most.</p>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleCuisine(item)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  localPrefs.preferredCuisines.includes(item)
                    ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Spice Preference */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Spice Tolerance</h3>
          <p className="text-xs text-gray-500 mb-3">How spicy do you like your food?</p>
          <div className="flex gap-3">
            {(['mild', 'medium', 'hot'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setLocalPrefs((prev) => ({ ...prev, spicePreference: level }))}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  localPrefs.spicePreference === level
                    ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level === 'mild' ? 'Mild' : level === 'medium' ? 'Medium' : 'Hot'}
              </button>
            ))}
          </div>
        </section>

        {/* Recipe Complexity */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Recipe Complexity</h3>
          <p className="text-xs text-gray-500 mb-3">What level of cooking effort do you prefer?</p>
          <div className="flex gap-3">
            {(['simple', 'moderate', 'complex'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setLocalPrefs((prev) => ({ ...prev, complexity: level }))}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  localPrefs.complexity === level
                    ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* Disliked Ingredients */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Ingredients to Avoid</h3>
          <p className="text-xs text-gray-500 mb-3">Add any ingredients you dislike or want to avoid.</p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={dislikedInput}
              onChange={(e) => setDislikedInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDisliked())}
              placeholder="e.g., cilantro, olives..."
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
            />
            <button
              type="button"
              onClick={addDisliked}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {localPrefs.dislikedIngredients.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm border border-red-200"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeDisliked(item)}
                  className="text-red-400 hover:text-red-600 font-bold"
                >
                  &times;
                </button>
              </span>
            ))}
            {localPrefs.dislikedIngredients.length === 0 && (
              <p className="text-gray-400 text-sm italic">None added yet</p>
            )}
          </div>
        </section>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={() => onSave(localPrefs)}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-orange-700 transition-all duration-200"
        >
          Save &amp; View Recommendations
        </button>
      </div>
    </div>
  );
};
