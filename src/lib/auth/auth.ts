/**
 * NextAuth.js (Auth.js v5) — Full Server-Side Configuration
 *
 * Extends the edge-safe auth.config.ts with server-only callbacks
 * that perform database lookups (signIn, jwt).
 *
 * This file is imported by:
 *   - src/app/api/auth/[...nextauth]/route.ts  (server-only, OK)
 *   - src/lib/auth/validateRequest.ts           (server-only, OK)
 *
 * It must NOT be imported from middleware.ts — use auth.config.ts there.
 *
 * @file src/lib/auth/auth.ts
 */

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { UserRole } from "./roles";

/** Admin emails that automatically get ADMIN role and full premium access */
const ADMIN_EMAILS = [
  process.env.AUTH_ADMIN_EMAIL || "xalchm@gmail.com",
  "gregcastro23@gmail.com",
  "cookingwithcastrollc@gmail.com",
  "xalchm@gmail.com",
];

/** Emails that automatically get full premium access (but NOT admin role) */
const PREMIUM_EMAILS = [
  "alchmnft@gmail.com",
  "liskater@gmail.com",
  "roberttcastro1@gmail.com",
  "zaby250@gmail.com",
  "atd250@gmail.com",
];

const isAdminEmail = (email: string) => ADMIN_EMAILS.includes(email);
const isPremiumEmail = (email: string) => PREMIUM_EMAILS.includes(email);

/** 
 * Simple short-lived cache to prevent redundant DB hits during the 
 * multi-step auth handshake (signIn -> jwt -> session).
 * Keys are email addresses, values are UserWithProfile.
 */
const userCache = new Map<string, { data: any; timestamp: number }>();
const pendingLookups = new Map<string, Promise<any>>();
const CACHE_TTL = 30000; // 30 seconds

async function getCachedUser(email: string) {
  const cached = userCache.get(email);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  // Check if there is already a lookup in progress for this email
  if (pendingLookups.has(email)) {
    return pendingLookups.get(email);
  }
  
  const lookupPromise = (async () => {
    try {
      const { userDatabase } = await import("@/services/userDatabaseService");
      // Set a timeout for the DB lookup
      const dbUser = await Promise.race([
        userDatabase.getUserByEmail(email),
        new Promise((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 8000))
      ]);
      
      if (dbUser) {
        userCache.set(email, { data: dbUser, timestamp: Date.now() });
      }
      return dbUser;
    } finally {
      pendingLookups.delete(email);
    }
  })();
  
  pendingLookups.set(email, lookupPromise);
  return lookupPromise;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  debug: process.env.NODE_ENV === "development" || process.env.DEBUG === "true",
  callbacks: {
    // Preserve the edge-safe authorized and session callbacks
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      console.log(`[auth] signIn callback started for ${user.email}`);
      if (!user.email || !account) {
        console.warn("[auth] signIn failed: Missing email or account");
        return true;
      }

      try {
        let dbUser = await getCachedUser(user.email);
        const isNewUser = !dbUser;
        console.log(`[auth] User lookup complete. isNewUser: ${isNewUser}`);

        if (!dbUser) {
          const { userDatabase } = await import("@/services/userDatabaseService");
          const isAdmin = isAdminEmail(user.email);
          console.log(`[auth] Creating new user. isAdmin: ${isAdmin}`);

          dbUser = await userDatabase.createUser({
            email: user.email,
            name: user.name || "",
            roles: isAdmin
              ? [UserRole.ADMIN, UserRole.USER]
              : [UserRole.USER],
          });
          
          if (dbUser) {
            userCache.set(user.email, { data: dbUser, timestamp: Date.now() });
          }
        }

        // Fire-and-forget non-critical tasks
        (async () => {
          try {
            if (!dbUser) return;
            console.log(`[auth] Starting background tasks for ${user.email}`);
            
            // 1. Auto-provision premium
            if (isAdminEmail(user.email!) || isPremiumEmail(user.email!)) {
              const { subscriptionService } = await import("@/services/subscriptionService");
              const sub = await subscriptionService.getOrCreateSubscription(dbUser.id);
              if (sub.tier !== "premium") {
                const now = new Date();
                const yearFromNow = new Date(now);
                yearFromNow.setFullYear(yearFromNow.getFullYear() + 10);
                await subscriptionService.updateSubscription(dbUser.id, {
                  tier: "premium",
                  status: "active",
                  currentPeriodStart: now.toISOString(),
                  currentPeriodEnd: yearFromNow.toISOString(),
                });
                console.log(`[auth] Auto-provisioned premium for ${user.email}`);
              }
            }

            // 2. Send emails
            const emailService = (await import("@/services/emailService")).default;
            emailService.ensureInitialized();
            if (emailService.isConfigured()) {
              const userName = user.name || user.email;
              const emailPromises = [
                emailService.sendLoginNotificationEmail(user.email!, userName!, isNewUser)
              ];
              if (isNewUser) {
                emailPromises.push(emailService.sendWelcomeEmail(user.email!, userName!));
              }
              await Promise.allSettled(emailPromises);
              console.log(`[auth] Background emails sent for ${user.email}`);
            }


            // 3. In-app notifications
            try {
              const { notificationDatabase } = await import(
                "@/services/notificationDatabaseService"
              );
              const userName = user.name || user.email;

              if (isNewUser) {
                notificationDatabase.createNotification(
                  dbUser.id,
                  "welcome",
                  "Welcome to Alchm Kitchen!",
                  `Welcome, ${userName}! Your personalized culinary journey begins now. Complete your birth chart to unlock cosmic food recommendations.`,
                ).catch(() => {});
              } else {
                notificationDatabase.createNotification(
                  dbUser.id,
                  "login_greeting",
                  "Welcome Back!",
                  `Good to see you again, ${userName}. Check out your latest cosmic insights.`,
                  { expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
                ).catch(() => {});
              }

              // Premium daily insight — only if user has a natal chart
              const isPremium =
                isAdminEmail(user.email) ||
                isPremiumEmail(user.email) ||
                (dbUser as any)?.tier === "premium";
              const natalChart =
                (dbUser as any)?.profile?.natalChart ||
                (dbUser as any)?.profile?.natal_chart;

              if (isPremium && natalChart?.planetaryPositions) {
                import("@/services/dailyInsightService").then(({ generateDailyInsightNotification }) => {
                  generateDailyInsightNotification(dbUser!.id, natalChart).catch(() => {});
                }).catch(() => {});
              }
            } catch (notifError) {
              console.error("[auth] Notification creation failed (non-blocking):", notifError);
            }
          } catch (bgError) {
            console.error("[auth] Background task error:", bgError);
          }
        })();
      } catch (error) {
        console.error(`[auth] Error during signIn callback for ${user.email}:`, error);
      }

      console.log(`[auth] signIn callback completed for ${user.email}`);
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // On initial sign-in, persist user info into the JWT
      if (user) {
        token.userId = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
      }
      if (account) {
        token.provider = account.provider;
      }

      // Resolve role, tier, and onboarding status from DB (on sign-in or session update)
      if (token.email && (user || trigger === "update")) {
        try {
          const dbUser = await getCachedUser(token.email);
          
          if (dbUser) {
            token.userId = dbUser.id;
            const isAdmin = dbUser.roles.includes(UserRole.ADMIN as never);
            token.role = isAdmin ? "admin" : "user";
            token.onboardingComplete = !!(
              dbUser.profile.birthData && dbUser.profile.natalChart
            );

            // Embed subscription tier into JWT for instant access everywhere
            // Admins always get premium regardless of subscription state
            if (isAdmin) {
              token.tier = "premium";
            } else {
              try {
                const { subscriptionService } = await import(
                  "@/services/subscriptionService"
                );
                const sub = await subscriptionService.getUserSubscription(dbUser.id);
                token.tier = sub?.tier || "free";
              } catch {
                // Preserve existing tier if DB unavailable
                if (!token.tier) token.tier = "free";
              }
            }
          } else {
            token.role = isAdminEmail(token.email) ? "admin" : "user";
            token.onboardingComplete = false;
            // Admin emails always get premium tier
            token.tier = isAdminEmail(token.email) ? "premium" : "free";
          }
        } catch {
          // Fallback if DB unavailable
          if (!token.role) {
            token.role = isAdminEmail(token.email) ? "admin" : "user";
          }
          if (token.onboardingComplete === undefined) {
            token.onboardingComplete = false;
          }
          if (!token.tier) {
            token.tier = isAdminEmail(token.email) ? "premium" : "free";
          }
        }
      }

      return token;
    },

    // session callback is inherited from authConfig.callbacks
  },
});
