'use client';

import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { CompanionSuggestions } from '@/components/commensal/CompanionSuggestions';
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
import { LocationSearch } from '@/components/onboarding/LocationSearch';
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
  onCompanionSaved?: () => void;
}

function GuestForm({ onAdd, onCompanionSaved }: GuestFormProps) {
  const { status: authStatus } = useSession();
  const [name, setName] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [timezone, setTimezone] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && dateTime && latitude && longitude) {
      const data: BirthData = {
        dateTime: new Date(dateTime).toISOString(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timezone: timezone || undefined,
      };

      setErrorMsg(null);
      setSuccessMsg(null);

      if (authStatus === 'authenticated') {
        setLoading(true);
        void (async () => {
          try {
            const res = await fetch('/api/user/commensals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name,
                relationship: 'friend',
                birthData: data,
              }),
            });
            const result = await res.json();
            if (!res.ok || !result.success) {
              throw new Error(result.message || 'Failed to save companion chart');
            }

            // Companion saved successfully!
            setSuccessMsg(`✓ Saved ${name}! Quest complete: Earned 20 Matter tokens.`);
            
            // Trigger global token widget update
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('tokenEconomy:updated'));
            }

            // Call parent to add guest to the local recommendation list
            onAdd(name, data);
            
            // Trigger companion suggestions tab reload
            if (onCompanionSaved) onCompanionSaved();

            // Reset fields
            setName('');
            setDateTime('');
            setLatitude('');
            setLongitude('');
            setTimezone('');
          } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'Saved companion locally instead due to a temporary error.');
            // Fallback to local-only guest addition so user can still compute recommendations
            onAdd(name, data);
            setName('');
            setDateTime('');
            setLatitude('');
            setLongitude('');
            setTimezone('');
          } finally {
            setLoading(false);
          }
        })();
      } else {
        // Fallback for anonymous users: add locally
        onAdd(name, data);
        setSuccessMsg(`Added locally. Sign in to save permanently & earn 20 Matter tokens!`);
        setName('');
        setDateTime('');
        setLatitude('');
        setLongitude('');
        setTimezone('');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card-premium rounded-2xl p-5 border border-white/10 space-y-4"
    >
      <div>
        <h3 className="text-lg font-bold text-purple-100 flex items-center gap-2">
          Add Commensal
        </h3>
        <p className="text-[11px] text-purple-300/60 leading-relaxed">
          Input your dining guest or any moment of alignment to compute alchemical compatibility.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="commensal-name" className="block text-xs text-white/50 mb-1">Name / Moment Identifier</label>
          <input
            id="commensal-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Partner, Birthday Moment"
            className="w-full px-3 py-2 border border-alchm-violet/30 bg-black/40 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-alchm-violet/40"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="commensal-datetime" className="block text-xs text-white/50 mb-1">Birth date &amp; time *</label>
          <input
            id="commensal-datetime"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full border border-alchm-violet/30 bg-black/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-alchm-violet/40"
            required
            disabled={loading}
          />
        </div>
        <div>
          <div className="block text-xs text-white/50 mb-1">Birth location *</div>
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
        disabled={loading || !name || !dateTime || !latitude || !longitude}
        className="w-full py-2.5 bg-gradient-to-r from-alchm-copper to-alchm-violet text-white text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? 'Calculating heavens & saving...' : 'Add guest & Save Chart'}
      </button>

      {successMsg && (
        <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-xs text-emerald-200">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-400/20 text-xs text-red-200">
          {errorMsg}
        </div>
      )}
    </form>
  );
}

export default function CommensalPage() {
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const handleInviteCompanion = (name: string, birthData: BirthData) => {
    if (guests.some((g) => g.name.toLowerCase() === name.toLowerCase())) return;
    setGuests((prev) => [...prev, { name, birthData }]);
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
    <div className="min-h-screen bg-transparent text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-alchm-copper to-alchm-violet">
            Commensal Group Recommendations
          </h1>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-lg">
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
              onCompanionSaved={() => setRefreshTrigger((prev) => prev + 1)}
            />

            <CompanionSuggestions
              onInvite={handleInviteCompanion}
              activeGuests={guests}
              refreshTrigger={refreshTrigger}
            />

            <div className="glass-card-premium rounded-2xl p-5 border border-white/10">
              <h3 className="font-semibold mb-3 text-white/90">
                Group members ({guests.length})
              </h3>
              {guests.length === 0 ? (
                <p className="text-sm text-white/40">No guests added yet.</p>
              ) : (
                <ul className="space-y-2">
                  {guests.map((g, idx) => (
                    <li
                      key={`${g.name}-${idx}`}
                      className="flex justify-between items-center bg-white/5 border border-white/5 px-3 py-2 rounded-lg"
                    >
                      <span className="font-medium text-sm text-white/90">
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
              <div className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                Restaurant search location
              </div>
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
              <p className="text-[11px] text-white/40 mt-2 leading-relaxed">
                Optional — leave blank to skip restaurant suggestions. We pass
                exact coordinates to Foursquare for accurate local matches.
              </p>
            </div>

            <button
              onClick={() => void generateRecommendations()}
              disabled={guests.length === 0 || phase === 'composing' || phase === 'scoring' || phase === 'searching'}
              className="w-full py-4 bg-gradient-to-r from-alchm-copper to-alchm-violet text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-alchm-violet/20"
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
                    <summary className="cursor-pointer text-sm font-semibold text-white/90">
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
                <p className="text-white/70">
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
