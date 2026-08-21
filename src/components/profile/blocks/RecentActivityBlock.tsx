import React from "react";
import type { ProfileData } from "./types";

export const RecentActivityBlock: React.FC<{ data: ProfileData }> = ({ data }) => {
  const activity = data.recentActivity ?? [];

  return (
    <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4">
      <h3 className="font-bold text-lg mb-3">Activity Log</h3>
      {activity.length > 0 ? (
        <ul className="space-y-2">
          {activity.slice(0, 4).map((act) => (
            <li
              key={act.id}
              className="flex justify-between items-center p-2 rounded-lg border border-white/5 bg-white/[0.02]"
            >
              <span className="text-sm font-medium text-white/80">
                {act.eventType.replace(/_/g, " ")}
              </span>
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
};
