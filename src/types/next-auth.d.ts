/**
 * NextAuth.js type augmentations
 *
 * Extends the default Session and JWT types to include
 * custom fields used by alchm.kitchen (role, tier, onboardingComplete).
 */

import "next-auth";
import "next-auth/jwt";

import type { SubscriptionTier } from "@/types/subscription";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string;
      role: string;
      tier: SubscriptionTier;
      onboardingComplete: boolean;
      /** JWT id (jti) — used by middleware to look up revocation state. */
      sessionId?: string;
    };
  }

  interface User {
    role?: string;
    tier?: SubscriptionTier;
    onboardingComplete?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    email?: string;
    name?: string;
    picture?: string;
    provider?: string;
    role?: string;
    tier?: SubscriptionTier;
    onboardingComplete?: boolean;
    /** UUID for the NextAuth `sessions` table row (revocable). */
    sessionId?: string;
    /** UUID for the `device_sessions` table row (UI-facing revocation target). */
    deviceSessionId?: string;
  }
}
