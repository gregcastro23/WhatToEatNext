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

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    // Preserve the edge-safe authorized and session callbacks
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      if (!user.email || !account) return true;

      // Track whether this is a brand-new user. Declared outside the try block
      // so the email section can reliably read it even if DB lookup succeeds but
      // a later step throws.
      let isNewUser = false;

      try {
        // Dynamic import keeps Node.js deps (pg) out of the Edge bundle
        const { userDatabase } = await import(
          "@/services/userDatabaseService"
        );

        let dbUser = await userDatabase.getUserByEmail(user.email);
        isNewUser = !dbUser;

        if (!dbUser) {
          const allUsers = await userDatabase.getAllUsers();
          const isAdmin =
            isAdminEmail(user.email) || allUsers.length === 0;

          dbUser = await userDatabase.createUser({
            email: user.email,
            name: user.name || "",
            roles: isAdmin
              ? [UserRole.ADMIN, UserRole.USER]
              : [UserRole.USER],
          });
        }

        // Auto-provision premium access for admin and premium accounts
        if ((isAdminEmail(user.email) || isPremiumEmail(user.email)) && dbUser) {
          try {
            const { subscriptionService } = await import(
              "@/services/subscriptionService"
            );
            const sub = await subscriptionService.getOrCreateSubscription(dbUser.id);
            if (sub.tier !== "premium") {
              const now = new Date();
              const yearFromNow = new Date(now);
              yearFromNow.setFullYear(yearFromNow.getFullYear() + 10); // get 10-year access
              await subscriptionService.updateSubscription(dbUser.id, {
                tier: "premium",
                status: "active",
                currentPeriodStart: now.toISOString(),
                currentPeriodEnd: yearFromNow.toISOString(),
              });
            }
          } catch (subError) {
            console.warn("[auth] Could not auto-provision premium:", subError);
          }
        }

        // ─── In-app notifications (fire-and-forget) ────────────
        // These must not block the sign-in flow to prevent the login
        // page from spinning indefinitely.
        try {
          const { notificationDatabase } = await import(
            "@/services/notificationDatabaseService"
          );
          const userName = user.name || user.email;

          if (isNewUser) {
            notificationDatabase.createNotification(
              dbUser!.id,
              "welcome",
              "Welcome to Alchm Kitchen!",
              `Welcome, ${userName}! Your personalized culinary journey begins now. Complete your birth chart to unlock cosmic food recommendations.`,
            ).catch(() => {});
          } else {
            notificationDatabase.createNotification(
              dbUser!.id,
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

        // ─── Email notifications ─────────────────────────────
        // Capped at 5 seconds to prevent the login from spinning
        // indefinitely when SMTP is slow or unreachable.
        const emailTimeout = <T,>(promise: Promise<T>, ms = 5000): Promise<T> =>
          Promise.race([
            promise,
            new Promise<T>((_, reject) =>
              setTimeout(() => reject(new Error("Email timeout")), ms),
            ),
          ]);

        try {
          const emailService = (
            await import("@/services/emailService")
          ).default;

          // Re-check env vars in case they weren't available at module load
          emailService.ensureInitialized();

          if (emailService.isConfigured()) {
            const userName = user.name || user.email;

            const emailPromises: Array<Promise<void>> = [];

            // Login notification to admin team on EVERY sign-in
            emailPromises.push(
              emailTimeout(
                emailService
                  .sendLoginNotificationEmail(user.email, userName, isNewUser)
                  .then((success) => {
                    if (success) {
                      console.log(
                        `[auth] Login notification sent for ${isNewUser ? "new" : "returning"} user: ${user.email}`,
                      );
                    }
                  }),
              ),
            );

            // Welcome email only for brand-new users
            if (isNewUser) {
              emailPromises.push(
                emailTimeout(
                  emailService
                    .sendWelcomeEmail(user.email, userName)
                    .then((success) => {
                      if (success) {
                        console.log(
                          `[auth] Welcome email sent to new user: ${user.email}`,
                        );
                      }
                    }),
                ),
              );
            }

            // Await all emails — allSettled + timeout ensures we never block sign-in
            await Promise.allSettled(emailPromises);
          }
        } catch (emailError) {
          // Never block sign-in due to email issues
          console.error("[auth] Error initializing email service:", emailError);
        }
      } catch (error) {
        // Don't block sign-in if DB is unavailable
        console.error("Error during signIn callback DB sync:", error);
      }

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
          const { userDatabase } = await import(
            "@/services/userDatabaseService"
          );

          const dbUser = await userDatabase.getUserByEmail(
            token.email,
          );
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
          // Fallback if DB unavailable - preserve existing token values
          // so returning users don't get incorrectly redirected to onboarding
          if (!token.role) {
            token.role = isAdminEmail(token.email) ? "admin" : "user";
          }
          if (token.onboardingComplete === undefined) {
            token.onboardingComplete = false;
          }
          if (!token.tier) {
            token.tier = isAdminEmail(token.email) ? "premium" : "free";
          }
          // If token already has onboardingComplete=true from a previous
          // successful DB lookup, keep it rather than resetting to false
        }
      }

      return token;
    },

    // session callback is inherited from authConfig.callbacks
  },
});
