/**
 * Premium Context Provider
 *
 * Provides subscription state, feature gating, and usage tracking
 * to the entire application. Uses JWT-embedded tier for instant hydration,
 * sessionStorage caching for fast reloads, and BroadcastChannel for
 * cross-tab synchronization.
 *
 * @file src/contexts/PremiumContext.tsx
 */

"use client";

import { useSession } from "next-auth/react";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type {
  SubscriptionTier,
  UserSubscription,
} from "@/types/subscription";
import { TIER_LIMITS } from "@/types/subscription";
import { createLogger } from "@/utils/logger";

const logger = createLogger("PremiumContext");

const CACHE_KEY = "alchm_subscription_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const BROADCAST_CHANNEL = "alchm_subscription_sync";

interface CachedSubscription {
  subscription: UserSubscription;
  cachedAt: number;
}

interface SubscriptionApiResponse {
  subscription?: UserSubscription;
  [key: string]: unknown;
}

interface PortalApiResponse {
  url?: string;
}

interface PremiumContextValue {
  /** Current subscription (null while loading) */
  subscription: UserSubscription | null;
  /** Current tier (defaults to "free") */
  tier: SubscriptionTier;
  /** Whether the subscription data is still loading */
  isLoading: boolean;
  /** Check if user has access to a premium feature (boolean flag only). */
  hasFeature: (feature: string) => boolean;
  /** Open Stripe checkout for an upgrade */
  openCheckout: (tier: SubscriptionTier, options?: { trial?: boolean }) => Promise<void>;
  /** Open Stripe customer portal for managing subscription */
  openPortal: () => Promise<void>;
  /** Refresh subscription state from API */
  refresh: () => Promise<void>;
  /** Whether the user has premium access (premium tier or admin) */
  isPremium: boolean;
}

const PremiumContext = createContext<PremiumContextValue>({
  subscription: null,
  tier: "free",
  isLoading: true,
  hasFeature: () => false,
  openCheckout: async () => {},
  openPortal: async () => {},
  refresh: async () => {},
  isPremium: false,
});

/** Read cached subscription from sessionStorage */
function readCache(): CachedSubscription | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedSubscription;
    if (Date.now() - cached.cachedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

/** Write subscription to sessionStorage cache */
function writeCache(subscription: UserSubscription): void {
  if (typeof window === "undefined") return;
  try {
    const cached: CachedSubscription = {
      subscription,
      cachedAt: Date.now(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // sessionStorage full or unavailable — non-critical
  }
}

export function PremiumProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const { data: session, status } = useSession();

  // Optimistic tier from JWT (available instantly, no API call needed)
  const user = session?.user;
  const jwtTier: SubscriptionTier = user?.tier ?? "free";
  const isAdmin = user?.role === "admin";

  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  // Effective tier: JWT tier is the instant source of truth,
  // overridden by full subscription data once loaded.
  // Admins always get premium.
  const tier: SubscriptionTier = isAdmin
    ? "premium"
    : (subscription?.tier ?? jwtTier);
  const isPremium = tier === "premium";

  // Cross-tab synchronization via BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL);
      broadcastRef.current = channel;

      channel.onmessage = (event: MessageEvent<{ type: string; subscription?: UserSubscription }>): void => {
        const { data } = event;
        if (data.type === "subscription_updated" && data.subscription) {
          setSubscription(data.subscription);
          writeCache(data.subscription);
        }
      };

      return (): void => {
        channel.close();
        broadcastRef.current = null;
      };
    } catch {
      // BroadcastChannel not supported — fall back to storage events
      const handleStorage = (e: StorageEvent): void => {
        if (e.key === CACHE_KEY && typeof e.newValue === "string") {
          try {
            const cached = JSON.parse(e.newValue) as CachedSubscription;
            setSubscription(cached.subscription);
          } catch {
            // Ignore parse errors
          }
        }
      };
      window.addEventListener("storage", handleStorage);
      return (): void => {
        window.removeEventListener("storage", handleStorage);
      };
    }
  }, []);

  /** Broadcast subscription update to other tabs */
  const broadcastUpdate = useCallback(
    (sub: UserSubscription): void => {
      try {
        broadcastRef.current?.postMessage({
          type: "subscription_updated",
          subscription: sub,
        });
      } catch {
        // Channel closed or unavailable — non-critical
      }
    },
    [],
  );

  const fetchSubscription = useCallback(async (): Promise<void> => {
    if (status !== "authenticated") {
      setIsLoading(false);
      return;
    }

    // Try sessionStorage cache first for fast hydration
    const cached = readCache();
    if (cached) {
      setSubscription(cached.subscription);
      setIsLoading(false);
      // Still fetch fresh data in background
    }

    // Use AbortController for defensive timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch("/api/user/subscription", {
        signal: controller.signal,
      });

      // Session expired — the subscription API now returns a fallback
      // shape even on server errors, but handle 401 for re-auth
      if (res.status === 401) {
        // Don't redirect immediately — the JWT tier is still usable
        logger.warn("[PremiumContext] Session expired, using JWT tier");
        setIsLoading(false);
        return;
      }

      const data = (await res.json()) as SubscriptionApiResponse;

      if (res.ok) {
        if (data.subscription) {
          setSubscription(data.subscription);
          writeCache(data.subscription);
          broadcastUpdate(data.subscription);
        }
      } else {
        // Non-200 response — try to use parsed data if available as it might be a fallback
        if (data.subscription) {
          setSubscription(data.subscription);
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        logger.warn("[PremiumContext] Subscription fetch timed out after 8s");
      } else {
        logger.error("[PremiumContext] Failed to fetch subscription:", error);
      }
      // If cache was loaded or JWT tier is available, we still have data
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [status, broadcastUpdate]);

  useEffect(() => {
    fetchSubscription().catch(() => {});
  }, [fetchSubscription]);

  const hasFeature = useCallback(
    (feature: string): boolean => {
      // Admins have access to everything
      if (isAdmin) return true;
      // Pure boolean feature-flag lookup. Usage rates (recipe gen, etc.) are
      // throttled by the token economy, not gated here.
      const tierLimits = TIER_LIMITS[tier];
      return !!(tierLimits as Record<string, unknown>)[feature];
    },
    [tier, isAdmin],
  );

  const openCheckout = useCallback(
    async (_targetTier?: SubscriptionTier, _options?: { trial?: boolean }): Promise<void> => {
      window.location.href = "/vault";
      await Promise.resolve();
    },
    [],
  );

  const openPortal = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as PortalApiResponse;
        if (data.url) window.location.href = data.url;
      }
    } catch (error: unknown) {
      logger.error("[PremiumContext] Portal failed:", error);
    }
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        subscription,
        tier,
        isLoading,
        hasFeature,
        openCheckout,
        openPortal,
        refresh: fetchSubscription,
        isPremium,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextValue {
  return useContext(PremiumContext);
}

export default PremiumContext;
