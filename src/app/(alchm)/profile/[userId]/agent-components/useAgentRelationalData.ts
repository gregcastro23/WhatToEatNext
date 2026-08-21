import { useEffect, useState } from "react";
import type { TransitOverlayData, SynastryData, ViewerProfileData } from "./types";

interface UseAgentRelationalDataResult {
  transitOverlay: TransitOverlayData | null;
  loadingTransit: boolean;
  viewerProfile: ViewerProfileData | null;
  synastryData: SynastryData | null;
  loadingSynastry: boolean;
}

async function fetchTransit(lookupId: string): Promise<TransitOverlayData | null> {
  try {
    const r = await fetch(`/api/users/${lookupId}/transit-overlay`, { cache: "no-store" });
    const j = (await r.json()) as { success?: boolean; data?: TransitOverlayData };
    return (j.success && j.data) ? j.data : null;
  } catch {
    return null;
  }
}

async function fetchSynastry(
  currentUserId: string,
  lookupId: string,
): Promise<{ profile: ViewerProfileData | null; synastry: SynastryData | null }> {
  try {
    const viewerRes = await fetch(`/api/users/${currentUserId}`);
    const viewerData = (await viewerRes.json()) as { success?: boolean; profile?: ViewerProfileData };
    if (!viewerData.success || !viewerData.profile) return { profile: null, synastry: null };

    const synRes = await fetch(`/api/users/${lookupId}/synastry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        viewer: { id: currentUserId, natalChart: viewerData.profile.natalChart },
      }),
    });
    const synData = (await synRes.json()) as { success?: boolean; data?: SynastryData };
    return {
      profile: viewerData.profile,
      synastry: (synData.success && synData.data) ? synData.data : null,
    };
  } catch {
    return { profile: null, synastry: null };
  }
}

export function useAgentRelationalData(
  agentName: string | undefined,
  slug: string | null,
  currentUserId: string | undefined,
): UseAgentRelationalDataResult {
  const [transitOverlay, setTransitOverlay] = useState<TransitOverlayData | null>(null);
  const [loadingTransit, setLoadingTransit] = useState(false);
  const [viewerProfile, setViewerProfile] = useState<ViewerProfileData | null>(null);
  const [synastryData, setSynastryData] = useState<SynastryData | null>(null);
  const [loadingSynastry, setLoadingSynastry] = useState(false);

  const lookupId = agentName ? (slug ?? agentName.toLowerCase().replace(/\s+/g, "-")) : null;

  useEffect(() => {
    if (!lookupId) return;
    setLoadingTransit(true);
    fetchTransit(lookupId)
      .then((data) => { if (data) setTransitOverlay(data); })
      .catch(() => {})
      .finally(() => { setLoadingTransit(false); });
  }, [lookupId]);

  useEffect(() => {
    if (!currentUserId || !lookupId) return;
    setLoadingSynastry(true);
    fetchSynastry(currentUserId, lookupId)
      .then(({ profile, synastry }) => {
        if (profile) setViewerProfile(profile);
        if (synastry) setSynastryData(synastry);
      })
      .catch(() => {})
      .finally(() => { setLoadingSynastry(false); });
  }, [currentUserId, lookupId]);

  return { transitOverlay, loadingTransit, viewerProfile, synastryData, loadingSynastry };
}
