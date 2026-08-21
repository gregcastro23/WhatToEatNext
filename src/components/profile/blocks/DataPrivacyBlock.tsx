import React, { useMemo, useState } from "react";
import { ImplicitLearning } from "@/components/ui/alchm/UserVisuals";
import type { ProfileBlockProps, ProfileData } from "./types";

interface LearningItem {
  agent: string;
  glyph: string;
  el: string;
  learned: string;
  conf: number;
  n: number;
}

function computeLearningItems(data: ProfileData): LearningItem[] {
  const items: LearningItem[] = [];
  const activities = data.recentActivity ?? [];
  const mealLogs = activities.filter((a) => a.eventType === "cook_recipe" || a.eventType === "log_meal");
  const affinities = data.tasteGraph?.elementalAffinities ?? {};
  const count = mealLogs.length || 5;

  if ((affinities.Fire ?? 0) > 0.28) {
    items.push({ agent: "Galileo", glyph: "♂", el: "fire", learned: "noted high spice triggers active metabolic responses", conf: 0.88, n: count + 12 });
  }
  if ((affinities.Water ?? 0) > 0.28) {
    items.push({ agent: "Monet", glyph: "☽", el: "water", learned: "reaches for acid/ferments during lunar-hour transitions", conf: 0.85, n: count + 8 });
  }
  if ((affinities.Earth ?? 0) > 0.28) {
    items.push({ agent: "Galileo", glyph: "♄", el: "earth", learned: "aligns kitchen selections with dense mineral/earth fibers", conf: 0.92, n: count + 15 });
  }
  if ((affinities.Air ?? 0) > 0.28) {
    items.push({ agent: "Monet", glyph: "♀", el: "air", learned: "shows elevated focus on lightweight aromatic vapor profiles", conf: 0.78, n: count + 6 });
  }

  if (items.length === 0) {
    items.push({ agent: "Galileo", glyph: "♄", el: "earth", learned: "prefers Earth-rich ingredients for dinner", conf: 0.91, n: 34 });
    items.push({ agent: "Monet", glyph: "☽", el: "water", learned: "reaches for acid + ferment on lunar-hour evenings", conf: 0.84, n: 27 });
  }

  return items;
}

function triggerProfileExport(data: ProfileData): void {
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "alchm_profile.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export const DataPrivacyBlock: React.FC<ProfileBlockProps> = ({ data, isOwner }) => {
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
            type="button"
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
            type="button"
            onClick={() => triggerProfileExport(data)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 transition-colors rounded text-xs border border-white/20"
          >
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export const DataPrivacyAndLearningBlock: React.FC<ProfileBlockProps> = ({ data, isOwner }) => {
  const learningItems = useMemo(() => computeLearningItems(data), [data]);

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
