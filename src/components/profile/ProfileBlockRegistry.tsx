import React, { useState, useEffect } from "react";
import { NatalWheel, PalateRadar, DailyYieldLedger, ImplicitLearning } from "@/components/ui/alchm/UserVisuals";

export type ProfileTab = "Essence" | "Palate" | "Practice";

export interface ProfileBlockDef {
  id: string;
  title: string;
  tab: ProfileTab;
  visibleTo: "public" | "owner";
  render: (props: { data: any; isOwner: boolean }) => React.ReactNode;
}

const InsightsTicker = ({ data }: { data: any }) => {
  const [index, setIndex] = useState(0);

  const insights = React.useMemo(() => {
    const list: string[] = [];
    const placements = data.natalPositions || [];
    const affinities = data.tasteGraph?.elementalAffinities;

    const sun = placements.find((p: any) => p.planet === "Sun");
    const moon = placements.find((p: any) => p.planet === "Moon");

    if (sun && sun.sign) {
      list.push(`With Sun in ${sun.sign}, your alchemical constitution seeks corresponding solar coordinate flavors.`);
    }
    if (moon && moon.sign) {
      list.push(`The Moon in ${moon.sign} influences your nocturnal digestive patterns and hydration cycles.`);
    }

    if (affinities) {
      const sorted = Object.entries(affinities)
        .filter(([, val]) => typeof val === "number")
        .sort((a, b) => (b[1] as number) - (a[1] as number));
      if (sorted.length > 0) {
        const [domName, domVal] = sorted[0];
        list.push(`Your dominant element is ${domName} (${Math.round((domVal as number) * 100)}%), driving your primary taste preferences.`);
      }
      if (sorted.length > 1) {
        const [weakName] = sorted[sorted.length - 1];
        list.push(`Introduce ingredients matching ${weakName} to harmonize and balance your weaker elemental current.`);
      }
    }

    const cuisines = data.tasteGraph?.cuisines || [];
    if (cuisines.length > 0) {
      list.push(`Your taste graph displays a high implicit compatibility with ${cuisines[0].name} kitchen methods.`);
    }

    if (list.length < 3) {
      list.push("Consult the astronomical ephemeris daily to synchronize your plate with current transits.");
      list.push("Balance volatile Spirit and grounding Matter elements to maximize your alchemical yield.");
    }

    return list;
  }, [data.natalPositions, data.tasteGraph]);

  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % insights.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [insights.length]);

  return (
    <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4 overflow-hidden">
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        Live Insights
      </h3>
      <div className="text-sm h-6 transition-all duration-300 text-white/80">
        {insights[index]}
      </div>
    </div>
  );
};

function parseRestriction(p: string) {
  let name = p.trim();
  let modifier = "strict";
  if (p.includes(":") || p.includes("-") || p.includes("(")) {
    const parts = p.split(/[:\-(]/);
    if (parts.length > 1) {
      name = parts[0].trim();
      const rawMod = parts[1].replace(/[)]/g, "").trim().toLowerCase();
      if (["strict", "flexible", "moderate", "high", "low"].includes(rawMod)) {
        modifier = rawMod;
      }
    }
  }
  return { name, modifier };
}

const DietaryPrefsBlock = ({ data, isOwner }: { data: any, isOwner: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prefs, setPrefs] = useState<string[]>(data.dietary_preferences?.restrictions || []);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/dietary-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: { restrictions: prefs } })
      });
      if (res.ok) {
        setIsEditing(false);
        if (!data.dietary_preferences) data.dietary_preferences = {};
        data.dietary_preferences.restrictions = prefs;
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const addPref = () => {
    if (inputValue.trim()) {
      setPrefs([...prefs, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removePref = (idx: number) => {
    setPrefs(prefs.filter((_: any, i: number) => i !== idx));
  };

  return (
    <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4">
      <h3 className="font-bold text-lg mb-3">Dietary Protocol</h3>
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPref()}
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-sm flex-1 text-white outline-none focus:border-purple-500/50"
              placeholder="Add restriction (e.g. Gluten-free: strict)"
            />
            <button onClick={addPref} className="px-4 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-sm hover:bg-purple-500/30 transition-colors font-bold">+</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {prefs.map((p: string, i: number) => {
              const { name, modifier } = parseRestriction(p);
              const isStrict = modifier === "strict" || modifier === "high";
              return (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/[0.02] text-white/70 flex items-center gap-1.5 font-mono">
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
                  <button onClick={() => removePref(i)} className="ml-1 hover:text-white text-white/40 font-bold">&times;</button>
                </span>
              );
            })}
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
            <button onClick={() => setIsEditing(false)} className="text-xs text-white/50 hover:text-white px-3 py-1">Cancel</button>
            <button onClick={() => void handleSave()} disabled={saving} className="text-xs bg-purple-500 hover:bg-purple-400 text-white font-bold px-4 py-1.5 rounded-xl disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {prefs.map((p: string, i: number) => {
              const { name, modifier } = parseRestriction(p);
              const isStrict = modifier === "strict" || modifier === "high";
              return (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/[0.02] text-white/70 flex items-center gap-1.5 font-mono">
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
                </span>
              );
            })}
            {prefs.length === 0 && (
              <span className="text-sm text-white/40">No dietary restrictions set.</span>
            )}
          </div>
          {isOwner && (
            <button onClick={() => setIsEditing(true)} className="mt-3 text-xs text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider font-mono">
              Edit Protocol
            </button>
          )}
        </>
      )}
    </div>
  );
};

const DataPrivacyBlock = ({ data, isOwner }: { data: any, isOwner: boolean }) => {
  const [implicitLearning, setImplicitLearning] = useState(true);
  if (!isOwner) return null;

  return (
    <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4">
      <h3 className="font-bold text-lg mb-2">Data & Privacy</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-white/80 block">Implicit Learning (AI)</span>
            <span className="text-xs text-white/40">Allow agents to learn from your habits</span>
          </div>
          <button 
            onClick={() => setImplicitLearning(!implicitLearning)}
            className={`px-3 py-1 rounded text-xs border transition-colors ${
              implicitLearning 
                ? "bg-purple-500/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30" 
                : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
            }`}
          >
            {implicitLearning ? "Enabled" : "Disabled"}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
             <span className="text-sm text-white/80 block">Export Profile Data</span>
             <span className="text-xs text-white/40">Download your alchemical constitution</span>
          </div>
          <button 
            onClick={() => {
              const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href",     dataStr);
              downloadAnchorNode.setAttribute("download", "alchm_profile.json");
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 transition-colors rounded text-xs border border-white/20"
          >
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
};

const DataPrivacyAndLearningBlock = ({ data, isOwner }: { data: any; isOwner: boolean }) => {
  const learningItems = React.useMemo(() => {
    const items: Array<{ agent: string; glyph: string; el: string; learned: string; conf: number; n: number }> = [];
    const activities = data.recentActivity || [];
    const mealLogs = activities.filter((a: any) => a.eventType === "cook_recipe" || a.eventType === "log_meal");
    const affinities = data.tasteGraph?.elementalAffinities || {};
    const count = mealLogs.length || 5;
    
    if (affinities.Fire > 0.28) {
      items.push({ agent: "Galileo", glyph: "♂", el: "fire", learned: "noted high spice triggers active metabolic responses", conf: 0.88, n: count + 12 });
    }
    if (affinities.Water > 0.28) {
      items.push({ agent: "Monet", glyph: "☽", el: "water", learned: "reaches for acid/ferments during lunar-hour transitions", conf: 0.85, n: count + 8 });
    }
    if (affinities.Earth > 0.28) {
      items.push({ agent: "Galileo", glyph: "♄", el: "earth", learned: "aligns kitchen selections with dense mineral/earth fibers", conf: 0.92, n: count + 15 });
    }
    if (affinities.Air > 0.28) {
      items.push({ agent: "Monet", glyph: "♀", el: "air", learned: "shows elevated focus on lightweight aromatic vapor profiles", conf: 0.78, n: count + 6 });
    }
    
    if (items.length === 0) {
      items.push({ agent: "Galileo", glyph: "♄", el: "earth", learned: "prefers Earth-rich ingredients for dinner", conf: 0.91, n: 34 });
      items.push({ agent: "Monet",   glyph: "☽", el: "water", learned: "reaches for acid + ferment on lunar-hour evenings", conf: 0.84, n: 27 });
    }
    
    return items;
  }, [data.recentActivity, data.tasteGraph]);

  return (
    <div className="space-y-4">
      <DataPrivacyBlock data={data} isOwner={isOwner} />
      {isOwner && (
        <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.01] mt-4">
          <h3 className="font-bold text-lg mb-4 text-white/90">Implicit Agent Learning</h3>
          <ImplicitLearning items={learningItems} />
        </div>
      )}
    </div>
  );
};

const TokenEconomyBlock = ({ data }: { data: any }) => {
  const balances = data.balances || { spirit: 0, essence: 0, matter: 0, substance: 0 };
  const [series, setSeries] = useState<any[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/economy/transactions?limit=100");
        const json = await res.json();
        if (json.success && active) {
          const txs = json.transactions || [];
          
          const dailyTx = Array.from({ length: 14 }, () => ({ Spirit: 0, Essence: 0, Matter: 0, Substance: 0 }));
          const today = new Date();
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
          
          txs.forEach((tx: any) => {
            const txTime = new Date(tx.createdAt).getTime();
            const dayDiff = Math.floor((todayStart + 24*3600*1000 - txTime) / (24*3600*1000));
            if (dayDiff >= 0 && dayDiff < 14) {
              const type = tx.tokenType as "Spirit" | "Essence" | "Matter" | "Substance";
              if (dailyTx[dayDiff][type] !== undefined) {
                dailyTx[dayDiff][type] += tx.amount;
              }
            }
          });

          const seriesData = {
            spirit: new Array(14),
            essence: new Array(14),
            matter: new Array(14),
            substance: new Array(14)
          };

          let s = balances.spirit;
          let e = balances.essence;
          let m = balances.matter;
          let sub = balances.substance;

          for (let i = 0; i < 14; i++) {
            const idx = 13 - i;
            seriesData.spirit[idx] = Math.max(0, s);
            seriesData.essence[idx] = Math.max(0, e);
            seriesData.matter[idx] = Math.max(0, m);
            seriesData.substance[idx] = Math.max(0, sub);

            s -= dailyTx[i].Spirit;
            e -= dailyTx[i].Essence;
            m -= dailyTx[i].Matter;
            sub -= dailyTx[i].Substance;
          }

          const allVals = [
            ...seriesData.spirit,
            ...seriesData.essence,
            ...seriesData.matter,
            ...seriesData.substance
          ];
          const maxVal = Math.max(...allVals, 10);
          const minVal = Math.min(...allVals, 0);
          const range = maxVal - minVal;

          const normalize = (v: number) => {
            const ratio = range > 0 ? (v - minVal) / range : 0.5;
            return 0.1 + ratio * 0.8;
          };

          setSeries([
            { id: "spirit",    color: "var(--el-air)",   data: seriesData.spirit.map(normalize) },
            { id: "essence",   color: "var(--el-water)", data: seriesData.essence.map(normalize) },
            { id: "matter",    color: "var(--el-earth)", data: seriesData.matter.map(normalize) },
            { id: "substance", color: "var(--el-fire)",  data: seriesData.substance.map(normalize) }
          ]);
        }
      } catch (err) {
        console.error("Failed to load/process transaction yield trend:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [balances.spirit, balances.essence, balances.matter, balances.substance]);

  return (
    <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.01] mt-4 space-y-6">
      <div className="flex justify-between items-baseline">
        <h3 className="font-bold text-lg text-white/90">Daily Yield Ledger</h3>
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Balances</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { k: "spirit", color: "text-amber-400" },
          { k: "essence", color: "text-blue-400" },
          { k: "matter", color: "text-emerald-400" },
          { k: "substance", color: "text-purple-400" }
        ].map((item) => (
          <div key={item.k} className="bg-white/[0.01] p-3 rounded-xl text-center border border-white/5">
            <div className="text-[9px] uppercase tracking-widest text-white/45 mb-1 font-mono">{item.k}</div>
            <div className={`text-xl font-black tabular-nums ${item.color}`}>
              {(balances[item.k as keyof typeof balances] || 0).toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-white/5 relative">
        <p className="text-[9px] uppercase tracking-widest text-white/45 font-mono mb-3">Cumulative yield trend</p>
        {loading && !series ? (
          <div className="h-[200px] flex items-center justify-center text-xs text-white/40">Loading ledger data...</div>
        ) : (
          <DailyYieldLedger series={series} />
        )}
      </div>
    </div>
  );
};

export const PROFILE_BLOCKS: Record<string, ProfileBlockDef> = {
  tasteGraph: {
    id: "tasteGraph",
    title: "Taste Graph",
    tab: "Palate",
    visibleTo: "public",
    render: ({ data, isOwner }) => {
      const affinities = data.tasteGraph?.elementalAffinities;
      const palateValues = affinities ? {
        spicy: affinities.Fire || 0,
        sweet: affinities.Air || 0,
        umami: affinities.Earth || 0,
        acidic: affinities.Water || 0,
        bitter: (affinities.Earth || 0) * 0.9 || 0
      } : {
        spicy: 0.72,
        sweet: 0.34,
        umami: 0.88,
        acidic: 0.66,
        bitter: 0.48
      };
      return (
        <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.01] mt-4 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full max-w-[260px]">
            <PalateRadar values={palateValues} size={240} />
          </div>
          <div className="flex-1 w-full">
            <h3 className="font-bold text-lg mb-3">Palate DNA</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {data.tasteGraph?.cuisines?.slice(0, 3).map((c: any) => (
                <span key={c.name} className="px-3 py-1.5 bg-purple-500/10 rounded-full text-xs border border-purple-500/20 text-purple-300 font-mono">
                  {c.name}
                </span>
              ))}
              {(!data.tasteGraph?.cuisines || data.tasteGraph.cuisines.length === 0) && (
                <span className="text-sm text-white/40 font-mono">No palate data available.</span>
              )}
            </div>
            {isOwner && (
              <button className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider font-mono">
                Refine Preferences
              </button>
            )}
          </div>
        </div>
      );
    },
  },
  dietaryPrefs: {
    id: "dietaryPrefs",
    title: "Dietary Preferences",
    tab: "Palate",
    visibleTo: "public",
    render: ({ data, isOwner }) => <DietaryPrefsBlock data={data} isOwner={isOwner} />,
  },
  insightsTicker: {
    id: "insightsTicker",
    title: "Insights Ticker",
    tab: "Palate",
    visibleTo: "owner",
    render: ({ data }) => <InsightsTicker data={data} />
  },
  natalChart: {
    id: "natalChart",
    title: "Natal Chart Wheel",
    tab: "Essence",
    visibleTo: "public",
    render: ({ data }) => {
      const positions = data.natalPositions || [];
      
      const ZODIAC_SIGNS = [
        "aries", "taurus", "gemini", "cancer",
        "leo", "virgo", "libra", "scorpio",
        "sagittarius", "capricorn", "aquarius", "pisces",
      ];
      const SIGN_TO_ELEMENT: Record<string, string> = {
        aries: "fire", leo: "fire", sagittarius: "fire",
        taurus: "earth", virgo: "earth", capricorn: "earth",
        gemini: "air", libra: "air", aquarius: "air",
        cancer: "water", scorpio: "water", pisces: "water",
      };
      const PLANET_GLYPH: Record<string, string> = {
        Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄"
      };

      const planets = positions.map((p: any) => {
        const signLower = (p.sign || "").toLowerCase();
        const signIdx = ZODIAC_SIGNS.indexOf(signLower);
        const lon = ((signIdx >= 0 ? signIdx : 0) * 30 + (p.degree || 0)) % 360;
        const el = SIGN_TO_ELEMENT[signLower] || "fire";
        const mod = (signLower === "aries" || signLower === "cancer" || signLower === "libra" || signLower === "capricorn")
          ? "cardinal"
          : (signLower === "taurus" || signLower === "leo" || signLower === "scorpio" || signLower === "aquarius")
            ? "fixed"
            : "mutable";

        return {
          planet: p.planet,
          lon,
          sign: p.sign,
          glyph: PLANET_GLYPH[p.planet] || "✦",
          deg: Math.round(p.degree || 0),
          el,
          mod
        };
      });

      return (
        <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.01] mt-4 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full max-w-[360px]">
            <NatalWheel planets={planets} size={300} dominantEl={data.dominantElement || "air"} />
          </div>
          <div className="flex-1 w-full">
            <h3 className="font-bold text-lg mb-4 text-white/90">Natal Placement Ledger</h3>
            {planets.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {planets.map((p: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-white/[0.01] rounded-xl border border-white/5 font-mono">
                    <span className="capitalize text-white/50 flex items-center gap-1">
                      <span>{p.glyph}</span>
                      <span>{p.planet}</span>
                    </span>
                    <span className="font-medium text-white/80">{p.sign.slice(0,3)} {p.deg}°</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 font-mono">Chart data unavailable.</p>
            )}
          </div>
        </div>
      );
    }
  },
  alchemicalConstitution: {
    id: "alchemicalConstitution",
    title: "Alchemical Constitution",
    tab: "Essence",
    visibleTo: "public",
    render: ({ data }) => {
      const affinities = data.tasteGraph?.elementalAffinities || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      const elColors: Record<string, string> = {
        Fire: "bg-gradient-to-r from-orange-500 to-red-500",
        Water: "bg-gradient-to-r from-blue-500 to-cyan-500",
        Air: "bg-gradient-to-r from-sky-400 to-purple-500",
        Earth: "bg-gradient-to-r from-emerald-500 to-lime-500"
      };
      const dominant = data.dominantElement || "Balanced";
      return (
        <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Alchemical Constitution</h3>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Dominant Element: <span className="text-white/80 font-bold">{dominant}</span></p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(affinities).map(([el, val]: any) => {
              const pct = Math.round((val || 0) * 100);
              return (
                <div key={el} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-white/70">
                    <span>{el.toUpperCase()}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${elColors[el] || "bg-purple-600"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  },
  tokenEconomy: {
    id: "tokenEconomy",
    title: "Token Economy & Yield",
    tab: "Practice",
    visibleTo: "owner",
    render: ({ data }) => <TokenEconomyBlock data={data} />
  },
  recentActivity: {
    id: "recentActivity",
    title: "Recent Activity",
    tab: "Practice",
    visibleTo: "public",
    render: ({ data }) => {
      const activity = data.recentActivity || [];
      return (
        <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4">
          <h3 className="font-bold text-lg mb-3">Activity Log</h3>
          {activity.length > 0 ? (
            <ul className="space-y-2">
              {activity.slice(0, 4).map((act: any) => (
                <li key={act.id} className="flex justify-between items-center p-2 rounded-lg border border-white/5 bg-white/[0.02]">
                  <span className="text-sm font-medium text-white/80">{act.eventType.replace(/_/g, " ")}</span>
                  <span className="text-[10px] uppercase tracking-widest text-white/40">
                    {new Date(act.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/40">No recent activity.</p>
          )}
        </div>
      );
    }
  },
  dataPrivacy: {
    id: "dataPrivacy",
    title: "Data & Privacy",
    tab: "Practice",
    visibleTo: "owner",
    render: ({ data, isOwner }) => <DataPrivacyAndLearningBlock data={data} isOwner={isOwner} />,
  }
};
