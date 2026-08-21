import { signOut } from "next-auth/react";
import React from "react";
import type { NatalChart } from "@/types/natalChart";
import type { UserPreferences } from "./types";

interface ProfileSettingsPanelProps {
  sessionUser?: { name?: string | null; email?: string | null; role?: string };
  natalChart: NatalChart;
  preferences: UserPreferences;
  isOperator?: boolean;
  onEditBirthData: () => void;
  onEditPreferences: () => void;
}

const IdentityCard: React.FC<{ rows: Array<{ label: string; value: string }> }> = ({ rows }) => (
  <div className="glass-card-premium rounded-3xl p-7 border-white/8">
    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-5">
      Alchemical Identity
    </h3>
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
          <span className="text-xs text-white/30">{r.label}</span>
          <span className={`text-xs font-semibold ${r.label === "Access" ? "text-amber-400" : "text-white/80"}`}>
            {r.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const TemporalOriginCard: React.FC<{ chartDate: string | null; birthData?: { latitude: number; longitude: number }; onEditBirthData: () => void }> = ({
  chartDate,
  birthData,
  onEditBirthData,
}) => (
  <div className="glass-card-premium rounded-3xl p-7 border-white/8">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
        Temporal Origin
      </h3>
      <button
        onClick={onEditBirthData}
        className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-[0.25em] transition-colors"
      >
        Recalibrate
      </button>
    </div>
    {chartDate && <p className="text-sm text-white/80 font-medium mb-1">{chartDate}</p>}
    {birthData && (
      <p className="text-[10px] text-white/25 font-mono">
        {birthData.latitude.toFixed(4)}, {birthData.longitude.toFixed(4)}
      </p>
    )}
  </div>
);

const CulinaryVectorsCard: React.FC<{ preferences: UserPreferences; onEditPreferences: () => void }> = ({
  preferences,
  onEditPreferences,
}) => (
  <div className="glass-card-premium rounded-3xl p-7 border-white/8">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
        Culinary Vectors
      </h3>
      <button
        onClick={onEditPreferences}
        className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-[0.25em] transition-colors"
      >
        Reconfigure
      </button>
    </div>
    <div className="space-y-2 text-xs text-white/50">
      {preferences.dietaryRestrictions.length > 0 && (
        <p>Dietary: <span className="text-white/80">{preferences.dietaryRestrictions.join(", ")}</span></p>
      )}
      {preferences.preferredCuisines.length > 0 && (
        <p>Cuisines: <span className="text-white/80">{preferences.preferredCuisines.join(", ")}</span></p>
      )}
      <div className="flex gap-6">
        <p>Spice: <span className="text-white/80 capitalize">{preferences.spicePreference}</span></p>
        <p>Complexity: <span className="text-white/80 capitalize">{preferences.complexity}</span></p>
      </div>
    </div>
  </div>
);

export const ProfileSettingsPanel: React.FC<ProfileSettingsPanelProps> = ({
  sessionUser,
  natalChart,
  preferences,
  isOperator = false,
  onEditBirthData,
  onEditPreferences,
}) => {
  const { dateTime } = natalChart.birthData;
  const chartDate = dateTime
    ? new Date(dateTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const rows = [
    { label: "Name", value: sessionUser?.name ?? "—" },
    { label: "Email", value: sessionUser?.email ?? "—" },
    { label: "Access", value: isOperator ? "Operator / Admin" : "Registered Practitioner" },
    { label: "Dominant Element", value: natalChart.dominantElement },
    { label: "Dominant Modality", value: natalChart.dominantModality },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <IdentityCard rows={rows} />
      <TemporalOriginCard
        chartDate={chartDate}
        birthData={natalChart.birthData}
        onEditBirthData={onEditBirthData}
      />
      <CulinaryVectorsCard
        preferences={preferences}
        onEditPreferences={onEditPreferences}
      />
      <div className="flex justify-center pt-2">
        <button
          onClick={(): void => { signOut({ callbackUrl: "/" }).catch(() => {}); }}
          className="px-8 py-3 bg-red-500/8 text-red-400 rounded-full hover:bg-red-500/15 transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/15"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
