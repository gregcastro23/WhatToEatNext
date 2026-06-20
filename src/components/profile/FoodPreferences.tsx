'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/common/Toast';

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
  const { toast, showSuccess, showError } = useToast();
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>({ ...preferences });
  const [dislikedInput, setDislikedInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [hasSharedFeed, setHasSharedFeed] = useState(false);
  const [hasSharedSocial, setHasSharedSocial] = useState(false);

  const handleShareToFeed = async () => {
    setIsSharing(true);
    try {
      const res = await fetch("/api/feed/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareType: "preferences",
          shareName: false,
          payload: {
            dietaryRestrictions: localPrefs.dietaryRestrictions,
            preferredCuisines: localPrefs.preferredCuisines,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        let questMessage = "";
        if (data.completedQuests && data.completedQuests.length > 0) {
          const rewardQuest = data.completedQuests[0];
          questMessage = ` 🏆 Quest completed! Earned ${rewardQuest.tokenRewardAmount} ${rewardQuest.tokenRewardType}!`;
        }
        showSuccess(`Shared to feed successfully!${questMessage}`);
        setHasSharedFeed(true);
      } else {
        showError(data.message || "Failed to share to feed");
      }
    } catch (err) {
      showError("Error sharing to feed");
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareSocial = async () => {
    const restrictionsText = localPrefs.dietaryRestrictions.join(', ') || 'None';
    const cuisinesText = localPrefs.preferredCuisines.join(', ') || 'Any';
    const dislikesText = localPrefs.dislikedIngredients.join(', ') || 'None';
    
    const svgText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#022c22" />
          <stop offset="50%" stop-color="#0d9488" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg)" rx="32" />
      <circle cx="700" cy="100" r="150" fill="white" fill-opacity="0.03" filter="blur(40px)" />
      
      <text x="50" y="80" font-family="system-ui, sans-serif" font-weight="900" font-size="32" fill="#34d399">Alchm.kitchen</text>
      <text x="50" y="115" font-family="system-ui, sans-serif" font-size="16" fill="#94a3b8" letter-spacing="2">CULINARY CONSTITUTION</text>
      
      <rect x="50" y="160" width="700" height="380" fill="white" fill-opacity="0.05" rx="24" stroke="white" stroke-opacity="0.1" stroke-width="2" />
      
      <text x="90" y="220" font-family="system-ui, sans-serif" font-weight="800" font-size="20" fill="#e2e8f0">Dietary Profile</text>
      <text x="90" y="250" font-family="system-ui, sans-serif" font-size="16" fill="#a7f3d0">${restrictionsText}</text>
      
      <text x="90" y="310" font-family="system-ui, sans-serif" font-weight="800" font-size="20" fill="#e2e8f0">Preferred Cuisines</text>
      <text x="90" y="340" font-family="system-ui, sans-serif" font-size="16" fill="#a7f3d0">${cuisinesText}</text>
      
      <text x="90" y="400" font-family="system-ui, sans-serif" font-weight="800" font-size="20" fill="#e2e8f0">Ingredients Blocked</text>
      <text x="90" y="430" font-family="system-ui, sans-serif" font-size="16" fill="#fca5a5">${dislikesText}</text>

      <text x="90" y="490" font-family="system-ui, sans-serif" font-weight="800" font-size="20" fill="#e2e8f0">Attributes</text>
      <text x="90" y="515" font-family="system-ui, sans-serif" font-size="14" fill="#94a3b8">Spice: <tspan fill="#34d399" font-weight="bold">${localPrefs.spicePreference.toUpperCase()}</tspan>   ·   Complexity: <tspan fill="#34d399" font-weight="bold">${localPrefs.complexity.toUpperCase()}</tspan></text>
      
      <circle cx="650" cy="460" r="50" fill="none" stroke="#34d399" stroke-width="2" stroke-dasharray="4 4" />
      <text x="650" y="455" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#34d399" text-anchor="middle">ALCHEMICAL</text>
      <text x="650" y="475" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#34d399" text-anchor="middle">HARMONY</text>
    </svg>`;
    
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alchm-kitchen-profile.svg';
    a.click();
    URL.revokeObjectURL(url);
    
    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "share_preferences_social" }),
      });
      const data = await res.json();
      if (data.success) {
        let questMessage = "";
        if (data.completedQuests && data.completedQuests.length > 0) {
          const rewardQuest = data.completedQuests[0];
          questMessage = ` 🏆 Quest completed! Earned ${rewardQuest.tokenRewardAmount} ${rewardQuest.tokenRewardType}!`;
        }
        showSuccess(`Preferences Card downloaded successfully!${questMessage}`);
        setHasSharedSocial(true);
      }
    } catch (err) {
      console.error("Failed to complete social preferences quest", err);
    }
  };

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

      {/* Sharing Panel */}
      <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
        <div>
          <h4 className="font-bold text-slate-800 text-lg">Showcase Your Constitution</h4>
          <p className="text-sm text-slate-500 font-medium">Share your culinary settings or download your alchemical profile card.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => { void handleShareToFeed(); }}
            disabled={hasSharedFeed || isSharing}
            className={`flex-1 md:flex-none px-5 py-3 rounded-xl text-sm font-bold shadow-sm transition-all ${
              hasSharedFeed
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-teal-600 text-white hover:bg-teal-700 active:scale-95"
            }`}
          >
            {hasSharedFeed ? "✓ Shared to Feed" : "📢 Share to Feed"}
          </button>
          <button
            type="button"
            onClick={() => { void handleShareSocial(); }}
            disabled={hasSharedSocial}
            className={`flex-1 md:flex-none px-5 py-3 rounded-xl text-sm font-bold shadow-sm transition-all ${
              hasSharedSocial
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
            }`}
          >
            {hasSharedSocial ? "✓ Profile Saved" : "📸 Save Profile Card"}
          </button>
        </div>
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
          onClick={() => {
            onSave(localPrefs);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
          className={`flex-none px-8 py-4 rounded-xl font-black transition-all duration-300 shadow-md active:scale-95 ${
            saved
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30'
          }`}
        >
          {saved ? '✓ Saved Successfully!' : 'Save & Optimize Algorithm'}
        </button>
      </div>
      {toast}
    </div>
  );
};
