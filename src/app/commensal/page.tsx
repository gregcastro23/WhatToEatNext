'use client';

import React, { useState } from 'react';
import { LocationSearch } from '@/components/onboarding/LocationSearch';
import { CompositeEnergyVisualizer } from '@/components/commensal/CompositeEnergyVisualizer';
import { CookingMethodsList } from '@/components/commensal/CookingMethodsList';
import { RecommendedRecipeCard } from '@/components/commensal/RecommendedRecipeCard';
import { RestaurantList } from '@/components/commensal/RestaurantList';
import { SaveGroupButton } from '@/components/commensal/SaveGroupButton';
import { SignInPrompt } from '@/components/commensal/SignInPrompt';
import {
  CompositeEnergySkeleton,
  MethodsSkeleton,
  RecipeSkeleton,
  RestaurantSkeleton,
} from '@/components/commensal/skeletons';
import {
  useGuestRecommendations,
  type SearchLocation,
} from '@/hooks/useCommensalRecommendations';
import type { BirthData } from '@/types/natalChart';

interface GuestEntry {
  name: string;
  birthData: BirthData;
}

interface GuestFormProps {
  onAdd: (name: string, data: BirthData) => void;
}

function GuestForm({ onAdd }: GuestFormProps) {
  const [name, setName] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [timezone, setTimezone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && dateTime && latitude && longitude) {
      const data: BirthData = {
        dateTime: new Date(dateTime).toISOString(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timezone: timezone || undefined,
      };
      onAdd(name, data);
      setName('');
      setDateTime('');
      setLatitude('');
      setLongitude('');
      setTimezone('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card-premium rounded-2xl p-5 border border-white/10"
    >
      <h3 className="text-lg font-semibold mb-4 text-purple-100">Add Commensal</h3>
      <div className="mb-3">
        <label className="block text-xs text-purple-300/80 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-purple-900/60 bg-black/40 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          required
        />
      </div>
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs text-purple-300/80 mb-1">Birth date &amp; time *</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full border border-purple-900/60 bg-black/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-purple-300/80 mb-1">Birth location *</label>
          <LocationSearch
            onLocationSelect={(loc) => {
              setLatitude(loc.latitude.toString());
              setLongitude(loc.longitude.toString());
              if (loc.timezone) setTimezone(loc.timezone);
            }}
            compact
            showCoordinates
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={!name || !dateTime || !latitude || !longitude}
        className="w-full py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-500 disabled:opacity-50 transition-colors"
      >
        Add guest
      </button>
    </form>
  );
}

export default function CommensalPage() {
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);

  const {
    phase,
    composite,
    recipes,
    cookingMethods,
    restaurants,
    savableGuests,
    error: errorMessage,
    run,
  } = useGuestRecommendations();

  const generateRecommendations = () => {
    if (guests.length === 0) return;
    void run({ guests, location: searchLocation });
  };

  const removeGuest = (idx: number) => {
    setGuests((prev) => prev.filter((_, i) => i !== idx));
  };

  const showSkeletons = phase === 'composing' || phase === 'scoring';
  const showRestaurantSkeleton = phase === 'searching';
  const buttonLabel =
    phase === 'composing'
      ? 'Synthesizing cosmos…'
      : phase === 'scoring'
        ? 'Scoring recipes…'
        : phase === 'searching'
          ? 'Finding restaurants…'
          : 'Generate real-time recommendations';

  return (
    <div className="min-h-screen bg-[#08080e] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Commensal Group Recommendations
          </h1>
          <p className="mt-4 text-purple-200 max-w-2xl mx-auto text-lg">
            Add birth data for yourself and your companions. We&apos;ll find
            real-time, perfectly balanced meals, recipes, and local restaurants
            (via Foursquare) tailored for your group&apos;s composite energy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <aside className="md:col-span-1 space-y-5">
            <GuestForm
              onAdd={(name, data) =>
                setGuests((prev) => [...prev, { name, birthData: data }])
              }
            />

            <div className="glass-card-premium rounded-2xl p-5 border border-white/10">
              <h3 className="font-semibold mb-3 text-purple-100">
                Group members ({guests.length})
              </h3>
              {guests.length === 0 ? (
                <p className="text-sm text-purple-300/70">No guests added yet.</p>
              ) : (
                <ul className="space-y-2">
                  {guests.map((g, idx) => (
                    <li
                      key={`${g.name}-${idx}`}
                      className="flex justify-between items-center bg-white/5 border border-white/5 px-3 py-2 rounded-lg"
                    >
                      <span className="font-medium text-sm text-purple-100">
                        {g.name}
                      </span>
                      <button
                        onClick={() => removeGuest(idx)}
                        className="text-red-300/80 text-xs hover:text-red-200"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="glass-card-premium rounded-2xl p-5 border border-white/10">
              <label className="block text-xs uppercase tracking-wider text-purple-300/80 mb-2">
                Restaurant search location
              </label>
              <LocationSearch
                placeholder="City for nearby restaurants…"
                onLocationSelect={(loc) =>
                  setSearchLocation({
                    displayName: loc.displayName,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                  })
                }
                compact
                showCoordinates={false}
              />
              <p className="text-[11px] text-purple-300/60 mt-2 leading-relaxed">
                Optional — leave blank to skip restaurant suggestions. We pass
                exact coordinates to Foursquare for accurate local matches.
              </p>
            </div>

            <button
              onClick={() => void generateRecommendations()}
              disabled={guests.length === 0 || phase === 'composing' || phase === 'scoring' || phase === 'searching'}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-900/50"
            >
              {buttonLabel}
            </button>

            {errorMessage && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-400/20 text-xs text-red-200">
                {errorMessage}
              </div>
            )}

            {phase === 'done' && composite && savableGuests.length > 0 && (
              <>
                <SaveGroupButton
                  guests={savableGuests.map((g) => ({
                    name: g.name,
                    birthData: g.birthData,
                    natalChart: g.natalChart,
                    relationship: 'friend',
                  }))}
                  defaultGroupName={`${composite.dominantElement} group · ${new Date().toLocaleDateString()}`}
                />
                <SignInPrompt />
              </>
            )}
          </aside>

          <section className="md:col-span-2 space-y-6">
            {showSkeletons && (
              <>
                <CompositeEnergySkeleton />
                <MethodsSkeleton />
                <RecipeSkeleton />
              </>
            )}

            {composite && phase !== 'composing' && phase !== 'scoring' && (
              <CompositeEnergyVisualizer composite={composite} />
            )}

            {composite && cookingMethods.length > 0 && phase !== 'composing' && (
              <CookingMethodsList methods={cookingMethods} />
            )}

            {recipes.length > 0 && phase !== 'composing' && (
              <div className="space-y-4">
                <RecommendedRecipeCard scored={recipes[0]} />
                {recipes.length > 1 && (
                  <details className="glass-card-premium rounded-2xl p-5 border border-white/10">
                    <summary className="cursor-pointer text-sm font-semibold text-purple-100">
                      {recipes.length - 1} more recipe match
                      {recipes.length - 1 === 1 ? '' : 'es'}
                    </summary>
                    <div className="mt-4 space-y-3">
                      {recipes.slice(1).map((r) => (
                        <RecommendedRecipeCard
                          key={r.recipe.id ?? r.recipe.name}
                          scored={r}
                          compact
                        />
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}

            {showRestaurantSkeleton && <RestaurantSkeleton />}

            {phase === 'done' && restaurants.length > 0 && searchLocation && (
              <RestaurantList
                restaurants={restaurants}
                locationLabel={searchLocation.displayName}
              />
            )}

            {phase === 'idle' && !composite && (
              <div className="glass-card-premium rounded-3xl p-8 border border-white/10 text-center">
                <p className="text-purple-200">
                  Add at least one guest, then generate recommendations to see
                  the composite chart, scored recipes, dynamic cooking methods,
                  and nearby restaurant matches.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
