"use client";

/**
 * ProfileIdentityPanel — §3.5 identity header: avatar in the gradient ring
 * (element-sigil fallback, never an invented face), name, element chip
 * ("FIRE · ARIES SUN"), handle line, and the social CTAs. Owners get the
 * AvatarUpload affordance plus the "Post anonymously by default" toggle
 * (PATCH /api/user/identity). Composes ONLY kit primitives.
 */

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState, type JSX } from "react";
import { AvatarCircle, ElementChip, GlassPanel, LabelXS, type Element } from "@/components/tables/ui";
import { AvatarUpload } from "./AvatarUpload";
import { BreakBreadButton } from "./BreakBreadButton";
import { FollowButton } from "./FollowButton";

const ELEMENTS: readonly Element[] = ["Fire", "Water", "Earth", "Air"];

function asElement(value: string | null | undefined): Element | undefined {
  if (!value) return undefined;
  const match = ELEMENTS.find((el) => el.toLowerCase() === value.toLowerCase());
  return match;
}

interface NatalPosition {
  planet?: string;
  sign?: string;
}

export interface ProfileIdentityPanelProps {
  userId: string;
  name: string;
  isAgent: boolean;
  agentSlug: string | null;
  avatarUrl: string | null;
  dominantElement: string | null;
  natalPositions: NatalPosition[];
  bio: string | null;
  createdAt: string;
  isOwner: boolean;
  /** Owner-only field from the API; undefined for other viewers. */
  shareIdentity?: boolean;
  viewer: { follows: boolean; followedBy: boolean; isCommensal: boolean } | null;
  tablesAvailable: boolean;
  onAvatarChanged: (avatarUrl: string | null) => void;
}

export function ProfileIdentityPanel(props: ProfileIdentityPanelProps): JSX.Element {
  const {
    userId,
    name,
    isAgent,
    agentSlug,
    avatarUrl,
    dominantElement,
    natalPositions,
    bio,
    createdAt,
    isOwner,
    viewer,
    tablesAvailable,
    onAvatarChanged,
  } = props;

  const [shareIdentity, setShareIdentity] = useState(props.shareIdentity !== false);
  const [savingIdentity, setSavingIdentity] = useState(false);

  const element = asElement(dominantElement);
  const sunSign = natalPositions.find((p) => p.planet?.toLowerCase() === "sun")?.sign;
  const chipCopy = [dominantElement?.toUpperCase(), sunSign ? `${sunSign.toUpperCase()} SUN` : null]
    .filter(Boolean)
    .join(" · ");

  const sinceYear = Number.isNaN(Date.parse(createdAt))
    ? null
    : new Date(createdAt).getFullYear();
  const handleLine = isAgent
    ? agentSlug
      ? `@${agentSlug}`
      : "PLANETARY AGENT"
    : sinceYear
      ? `Alchemist since ${sinceYear}`
      : "Alchemist";

  const toggleShareIdentity = async () => {
    const next = !shareIdentity;
    setShareIdentity(next); // optimistic
    setSavingIdentity(true);
    try {
      const res = await fetch("/api/user/identity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareIdentity: next }),
      });
      const json = (await res.json().catch(() => null)) as { success?: boolean } | null;
      if (!res.ok || !json?.success) setShareIdentity(!next);
    } catch {
      setShareIdentity(!next);
    } finally {
      setSavingIdentity(false);
    }
  };

  const dmsEnabled = process.env.NEXT_PUBLIC_CHAT_DMS_ENABLED === "1";

  return (
    <GlassPanel className="p-6 flex flex-col items-center text-center gap-4">
      <div className="p-[2px] bg-gradient-alchm rounded-full">
        <div className="p-[3px] bg-alchm-bg rounded-full">
          <AvatarCircle
            name={name}
            src={avatarUrl ?? undefined}
            element={element ?? "Air"}
            size={128}
          />
        </div>
      </div>

      {isOwner && (
        <AvatarUpload hasAvatar={Boolean(avatarUrl)} onChanged={onAvatarChanged} />
      )}

      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">{name}</h1>
        <LabelXS as="p" className="mt-1 text-alchm-fg-dim">
          {handleLine}
        </LabelXS>
      </div>

      {element && chipCopy && <ElementChip element={element}>{chipCopy}</ElementChip>}

      {bio && <p className="text-sm text-alchm-fg-dim leading-relaxed max-w-xs">{bio}</p>}

      {!isOwner && (
        <div className="flex flex-wrap items-center justify-center gap-2 w-full">
          <FollowButton targetUserId={userId} viewer={viewer} />
          <BreakBreadButton inviteUserId={userId} tablesAvailable={tablesAvailable} />
          {dmsEnabled && (
            <Link
              href={`/messages?to=${encodeURIComponent(userId)}`}
              aria-label={`Message ${name}`}
              className="inline-flex items-center justify-center rounded-full w-11 h-11 border border-white/15 bg-white/5 text-alchm-fg-dim hover:text-white hover:border-white/30 transition-colors"
            >
              <MessageCircle size={18} aria-hidden />
            </Link>
          )}
        </div>
      )}

      {isOwner && (
        <label className="flex items-center gap-2.5 cursor-pointer rounded-full px-4 py-2 bg-white/[0.03] border border-white/10">
          <input
            type="checkbox"
            checked={!shareIdentity}
            disabled={savingIdentity}
            onChange={() => void toggleShareIdentity()}
            className="form-checkbox h-4 w-4 rounded text-alchm-violet"
          />
          <LabelXS className="text-alchm-fg-dim">Post anonymously by default</LabelXS>
        </label>
      )}
    </GlassPanel>
  );
}

export default ProfileIdentityPanel;
