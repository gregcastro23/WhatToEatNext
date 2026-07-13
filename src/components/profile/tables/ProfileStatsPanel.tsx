"use client";

/**
 * ProfileStatsPanel — §3.5 2×2 stat tiles: TABLES HOSTED / TABLES JOINED /
 * COMMENSALS / FOLLOWERS (copper numbers). Tiles whose counts are null
 * (PR 2 tables schema absent) are hidden entirely. FOLLOWERS and COMMENSALS
 * tiles open the FollowListSheet / commensal surface.
 */

import Link from "next/link";
import { GlassPanel, LabelXS } from "@/components/tables/ui";
import type { ProfileSocialBlock } from "@/types/social";
import type { JSX } from "react";

export interface ProfileStatsPanelProps {
  social: ProfileSocialBlock;
  onOpenFollowers: () => void;
  className?: string;
}

function StatTile({
  label,
  value,
  onClick,
  href,
}: {
  label: string;
  value: number;
  onClick?: () => void;
  href?: string;
}): JSX.Element {
  const body = (
    <>
      <span className="text-2xl font-black tabular-nums text-alchm-copper-bright">{value}</span>
      <LabelXS className="text-alchm-fg-dim">{label}</LabelXS>
    </>
  );
  const tileClass =
    "flex flex-col items-center justify-center gap-1 rounded-xl border border-white/8 bg-white/[0.02] py-4 px-2 w-full";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${tileClass} hover:border-white/20 transition-colors`}>
        {body}
      </button>
    );
  }
  if (href) {
    return (
      <Link href={href} className={`${tileClass} hover:border-white/20 transition-colors`}>
        {body}
      </Link>
    );
  }
  return <div className={tileClass}>{body}</div>;
}

export function ProfileStatsPanel({
  social,
  onOpenFollowers,
  className = "",
}: ProfileStatsPanelProps): JSX.Element {
  return (
    <GlassPanel className={`p-4 ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        {social.tablesHosted !== null && (
          <StatTile label="TABLES HOSTED" value={social.tablesHosted} />
        )}
        {social.tablesJoined !== null && (
          <StatTile label="TABLES JOINED" value={social.tablesJoined} />
        )}
        <StatTile label="COMMENSALS" value={social.commensals} href="/commensal" />
        <StatTile label="FOLLOWERS" value={social.followers} onClick={onOpenFollowers} />
      </div>
    </GlassPanel>
  );
}

export default ProfileStatsPanel;
