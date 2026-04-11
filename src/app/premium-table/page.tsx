"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePremium } from "@/contexts/PremiumContext";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import type { Recipe } from "@/types/recipe";

export default function AdeptTablePage() {
  const { isPremium } = usePremium();
  const searchParams = useSearchParams();
  const isInvite = searchParams?.get("invite") === "true";
  
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [composite, setComposite] = useState<any>(null);

  // Friend's inputs
  const [friendFire, setFriendFire] = useState(25);
  const [friendWater, setFriendWater] = useState(25);
  const [friendEarth, setFriendEarth] = useState(25);
  const [friendAir, setFriendAir] = useState(25);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLink(`${window.location.origin}/premium-table?invite=true&host_fire=30&host_water=20&host_earth=10&host_air=40`);
    }
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    setLoading(true);
    try {
      const hostFire = Number(searchParams?.get("host_fire")) || 25;
      const hostWater = Number(searchParams?.get("host_water")) || 25;
      const hostEarth = Number(searchParams?.get("host_earth")) || 25;
      const hostAir = Number(searchParams?.get("host_air")) || 25;

      const hostData = {
        elementalBalance: { Fire: hostFire, Water: hostWater, Earth: hostEarth, Air: hostAir },
        alchemicalProperties: { Spirit: hostFire, Essence: hostWater, Matter: hostEarth, Substance: hostAir },
        dominantElement: "Fire",
        dominantModality: "Cardinal"
      };

      const friendData = {
        elementalBalance: { Fire: friendFire, Water: friendWater, Earth: friendEarth, Air: friendAir },
        alchemicalProperties: { Spirit: friendFire, Essence: friendWater, Matter: friendEarth, Substance: friendAir },
        dominantElement: "Water",
        dominantModality: "Fixed"
      };

      const res = await fetch("/api/premium-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostData, friendData })
      });
      const data = await res.json();
      if (data.success) {
        setComposite(data.compositeChart);
        setRecipes(data.recipes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium && !isInvite) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="glass-card-premium rounded-3xl p-8 max-w-md text-center border-amber-500/30">
          <h1 className="text-2xl font-black text-amber-400 mb-4">Premium Status Required</h1>
          <p className="text-white/60 mb-6">Group Rituals and the Alchemical Midpoint table are exclusive to Premium users.</p>
          <button className="px-6 py-2 rounded-full bg-amber-500 text-black font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors">
            Upgrade Now
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-amber-400 to-purple-500 text-transparent bg-clip-text uppercase tracking-tighter">
            Premium Group Rituals
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto">
            Invite a friend to your Table. We calculate the Alchemical Midpoint between your natal charts to recommend the perfect harmonizing meal.
          </p>
        </header>

        {!isInvite ? (
          <div className="glass-card-premium rounded-3xl p-8 max-w-xl mx-auto border-white/10 text-center">
            <h2 className="text-xl font-bold mb-4">Invite to your Table</h2>
            <p className="text-sm text-white/40 mb-6">Share this link with your dining partner. Once they enter their data, your harmonized menu will be revealed.</p>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2 mb-4">
              <input type="text" readOnly value={link} className="bg-transparent border-none outline-none flex-1 text-xs text-white/70 px-2" />
              <button onClick={copyLink} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-xs font-bold transition-colors">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {!composite ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-premium rounded-3xl p-8 max-w-md mx-auto border-white/10">
                <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">Join the Table</h2>
                <p className="text-sm text-white/50 mb-6 text-center">Enter your elemental resonance to calculate the group's Alchemical Midpoint.</p>
                <div className="space-y-4 mb-8">
                  {[
                    { label: "Fire", val: friendFire, set: setFriendFire, color: "text-amber-400" },
                    { label: "Water", val: friendWater, set: setFriendWater, color: "text-blue-400" },
                    { label: "Earth", val: friendEarth, set: setFriendEarth, color: "text-emerald-400" },
                    { label: "Air", val: friendAir, set: setFriendAir, color: "text-purple-400" },
                  ].map((el) => (
                    <div key={el.label} className="flex items-center gap-4">
                      <span className={`w-16 text-sm font-bold ${el.color}`}>{el.label}</span>
                      <input type="range" min="0" max="100" value={el.val} onChange={(e) => el.set(Number(e.target.value))} className="flex-1" />
                      <span className="w-8 text-right font-mono text-sm">{el.val}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { void handleJoin(); }}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 text-white font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Calculating Midpoint..." : "Calculate Harmony"}
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                <div className="glass-card-premium rounded-3xl p-8 text-center border-purple-500/30">
                  <h2 className="text-xl font-bold text-purple-400 mb-2">Alchemical Midpoint Achieved</h2>
                  <p className="text-white/60 mb-6">Your combined resonance is {composite.dominantElement} dominant.</p>
                  <div className="flex justify-center gap-8 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-black text-amber-400">{composite.alchemicalProperties.Spirit.toFixed(1)}</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Spirit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-400">{composite.alchemicalProperties.Essence.toFixed(1)}</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Essence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-400">{composite.alchemicalProperties.Matter.toFixed(1)}</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Matter</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-purple-400">{composite.alchemicalProperties.Substance.toFixed(1)}</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Substance</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-center">Harmonized Menu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
