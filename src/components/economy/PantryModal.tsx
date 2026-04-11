"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FaMountain } from "react-icons/fa";
import { emitTokenEconomyUpdate } from "@/hooks/useTokenEconomy";

interface Ingredient {
  id: string;
  name: string;
  description: string;
}

interface PantryModalProps {
  open: boolean;
  onClose: () => void;
}

export function PantryModal({ open, onClose }: PantryModalProps) {
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [fire, setFire] = useState(25);
  const [water, setWater] = useState(25);
  const [earth, setEarth] = useState(25);
  const [air, setAir] = useState(25);

  useEffect(() => {
    if (open) {
      setIngredient(null);
      setSuccess(null);
      setError(null);
      setFire(25); setWater(25); setEarth(25); setAir(25);
      fetchIngredient();
    }
  }, [open]);

  const fetchIngredient = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quests/masters-pantry");
      const data = await res.json();
      if (data.success) {
        setIngredient(data.ingredient);
      } else {
        setError("Could not find an ingredient to classify.");
      }
    } catch (err) {
      setError("Failed to fetch ingredient.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredient) return;

    // Validate sum is 100
    const total = fire + water + earth + air;
    if (total !== 100) {
      setError(`Elements must sum to 100. Current sum: ${total}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/quests/masters-pantry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId: ingredient.id,
          elements: { Fire: fire / 100, Water: water / 100, Earth: earth / 100, Air: air / 100 },
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(data.message);
        if (data.balances) {
          emitTokenEconomyUpdate({
            source: "quest",
            credits: { matter: 2 },
          });
        }
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(data.error || "Failed to submit verification.");
      }
    } catch (err) {
      setError("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0f0f13] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
        >
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">
            The Master's Pantry
          </h2>
          <p className="text-sm text-white/50 mb-6">
            Assign the elemental properties (summing to 100) for this ingredient. Earn 2 🝙 Matter.
          </p>

          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin" />
            </div>
          ) : success ? (
            <div className="h-32 flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-2">✨</span>
              <p className="text-emerald-400 font-bold">{success}</p>
            </div>
          ) : ingredient ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h3 className="text-lg font-bold text-white">{ingredient.name}</h3>
                <p className="text-xs text-white/50 mt-1">{ingredient.description}</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Fire", value: fire, setter: setFire, color: "text-amber-400" },
                  { label: "Water", value: water, setter: setWater, color: "text-blue-400" },
                  { label: "Earth", value: earth, setter: setEarth, color: "text-emerald-400" },
                  { label: "Air", value: air, setter: setAir, color: "text-purple-400" },
                ].map((el) => (
                  <div key={el.label} className="flex items-center gap-4">
                    <label className={`w-16 text-sm font-bold ${el.color}`}>{el.label}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={el.value}
                      onChange={(e) => el.setter(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-8 text-right text-xs text-white/50 font-mono">
                      {el.value}
                    </span>
                  </div>
                ))}
              </div>

              {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-bold text-white/50 hover:text-white uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  <FaMountain className="w-3 h-3" />
                  {submitting ? "Verifying..." : "Verify & Claim"}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-white/50">No ingredients need classification right now.</p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
