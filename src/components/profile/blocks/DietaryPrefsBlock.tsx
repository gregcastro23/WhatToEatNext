import React, { useState } from "react";
import { createLogger } from "@/utils/logger";
import type { ProfileBlockProps } from "./types";

const logger = createLogger("DietaryPrefsBlock");

interface ParsedRestriction {
  name: string;
  modifier: string;
}

function parseRestriction(p: string): ParsedRestriction {
  let name = p.trim();
  let modifier = "strict";
  if (p.includes(":") || p.includes("-") || p.includes("(")) {
    const parts = p.split(/[:\-(]/);
    if (parts.length > 1 && parts[0] && parts[1]) {
      name = parts[0].trim();
      const rawMod = parts[1].replace(/[)]/g, "").trim().toLowerCase();
      if (["strict", "flexible", "moderate", "high", "low"].includes(rawMod)) {
        modifier = rawMod;
      }
    }
  }
  return { name, modifier };
}

interface RestrictionBadgeProps {
  restriction: string;
  onRemove?: () => void;
}

const RestrictionBadge: React.FC<RestrictionBadgeProps> = ({ restriction, onRemove }) => {
  const { name, modifier } = parseRestriction(restriction);
  const isStrict = modifier === "strict" || modifier === "high";

  return (
    <span className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/[0.02] text-white/70 flex items-center gap-1.5 font-mono">
      {name}
      <span 
        className="px-2 py-0.5 rounded-full text-[9px] font-bold border border-white/10" 
        style={{ 
          background: isStrict ? "rgba(168, 85, 247, 0.15)" : "rgba(255,255,255,0.05)", 
          color: isStrict ? "#a855f7" : "rgba(255,255,255,0.4)"
        }}
      >
        {modifier.toUpperCase()}
      </span>
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-1 hover:text-white text-white/40 font-bold">&times;</button>
      )}
    </span>
  );
};

export const DietaryPrefsBlock: React.FC<ProfileBlockProps> = ({ data, isOwner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prefs, setPrefs] = useState<string[]>(data.dietary_preferences?.restrictions ?? []);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/dietary-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: { restrictions: prefs } }),
      });
      if (res.ok) {
        setIsEditing(false);
        data.dietary_preferences ??= {};
        data.dietary_preferences.restrictions = prefs;
      }
    } catch (e) {
      logger.error("Failed to save dietary preferences", e);
    }
    setSaving(false);
  };

  const addPref = (): void => {
    if (inputValue.trim()) {
      setPrefs([...prefs, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removePref = (idx: number): void => {
    setPrefs(prefs.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4">
      <h3 className="font-bold text-lg mb-3">Dietary Protocol</h3>
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addPref(); }}
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-sm flex-1 text-white outline-none focus:border-purple-500/50"
              placeholder="Add restriction (e.g. Gluten-free: strict)"
            />
            <button type="button" onClick={addPref} className="px-4 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-sm hover:bg-purple-500/30 transition-colors font-bold">+</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {prefs.map((p, i) => (
              <RestrictionBadge key={p + i} restriction={p} onRemove={() => removePref(i)} />
            ))}
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
            <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-white/50 hover:text-white px-3 py-1">Cancel</button>
            <button type="button" onClick={() => { handleSave().catch(() => {}); }} disabled={saving} className="text-xs bg-purple-500 hover:bg-purple-400 text-white font-bold px-4 py-1.5 rounded-xl disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {prefs.map((p, i) => (
              <RestrictionBadge key={p + i} restriction={p} />
            ))}
            {prefs.length === 0 && (
              <span className="text-sm text-white/40">No dietary restrictions set.</span>
            )}
          </div>
          {isOwner && (
            <button type="button" onClick={() => setIsEditing(true)} className="mt-3 text-xs text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider font-mono">
              Edit Protocol
            </button>
          )}
        </>
      )}
    </div>
  );
};
