import React, { useState, useEffect } from "react";

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
  const insights = data.insights?.length ? data.insights : [
    "You digest fire elements well.",
    "Drink more water with earth meals.",
    "Avoid heavy meals before sleep.",
    "Your palate DNA leans towards spicy."
  ];

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
      <h3 className="font-bold text-lg mb-2">Dietary Protocol</h3>
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPref()}
              className="bg-black/50 border border-white/10 rounded px-2 py-1 text-sm flex-1 text-white outline-none"
              placeholder="Add restriction (e.g. Vegan)"
            />
            <button onClick={addPref} className="px-3 py-1 bg-white/10 rounded text-sm hover:bg-white/20 transition-colors">+</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {prefs.map((p: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-red-500/20 text-red-200 rounded text-xs flex items-center gap-1 border border-red-500/30">
                {p} <button onClick={() => removePref(i)} className="hover:text-white">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsEditing(false)} className="text-xs text-white/50 hover:text-white">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-400">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-white/60">
            {prefs.length > 0 ? prefs.join(", ") : "No restrictions set."}
          </p>
          {isOwner && (
            <button onClick={() => setIsEditing(true)} className="mt-2 text-sm text-purple-400 hover:text-purple-300 hover:underline">
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
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
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

export const PROFILE_BLOCKS: Record<string, ProfileBlockDef> = {
  tasteGraph: {
    id: "tasteGraph",
    title: "Taste Graph",
    tab: "Palate",
    visibleTo: "public",
    render: ({ data, isOwner }) => (
      <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4">
        <h3 className="font-bold text-lg mb-2">Palate DNA</h3>
        <div className="flex flex-wrap gap-2">
          {data.tasteGraph?.cuisines?.slice(0, 3).map((c: any) => (
            <span key={c.name} className="px-2 py-1 bg-purple-500/20 rounded-full text-sm border border-purple-500/30 text-purple-200">
              {c.name}
            </span>
          ))}
          {(!data.tasteGraph?.cuisines || data.tasteGraph.cuisines.length === 0) && (
            <span className="text-sm text-white/40">No palate data available.</span>
          )}
        </div>
        {isOwner && (
          <button className="mt-4 text-sm text-purple-400 hover:text-purple-300 hover:underline">
            Refine Preferences
          </button>
        )}
      </div>
    ),
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
      return (
        <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4">
          <h3 className="font-bold text-lg mb-2">Natal Chart Highlights</h3>
          {positions.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {positions.slice(0, 6).map((pos: any, i: number) => (
                <div key={i} className="flex justify-between text-sm p-2 bg-white/5 rounded border border-white/5">
                  <span className="capitalize text-white/60">{pos.planet}</span>
                  <span className="font-medium text-white/90">{pos.sign} {pos.degree ? `${pos.degree}°` : ""}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">Chart data unavailable.</p>
          )}
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
      const dominant = data.dominantElement || "Balanced";
      return (
        <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4">
          <h3 className="font-bold text-lg mb-2">Constitution</h3>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-2xl font-black text-white/90">{dominant}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/40">Dominant Element</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
             <div className="bg-purple-500 h-full w-2/3 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
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
    render: ({ data }) => {
      const balances = data.balances || { spirit: 0, essence: 0, matter: 0, substance: 0 };
      return (
        <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4">
          <h3 className="font-bold text-lg mb-4">Yield Profile</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 p-3 rounded-xl text-center border border-white/10">
              <div className="text-[10px] uppercase tracking-widest text-amber-400/70 mb-1 font-bold">Spirit</div>
              <div className="text-xl font-black text-amber-400">{balances.spirit?.toFixed(1) || 0}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl text-center border border-white/10">
              <div className="text-[10px] uppercase tracking-widest text-blue-400/70 mb-1 font-bold">Essence</div>
              <div className="text-xl font-black text-blue-400">{balances.essence?.toFixed(1) || 0}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl text-center border border-white/10">
              <div className="text-[10px] uppercase tracking-widest text-emerald-400/70 mb-1 font-bold">Matter</div>
              <div className="text-xl font-black text-emerald-400">{balances.matter?.toFixed(1) || 0}</div>
            </div>
          </div>
        </div>
      );
    }
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
    render: ({ data, isOwner }) => <DataPrivacyBlock data={data} isOwner={isOwner} />,
  }
};
