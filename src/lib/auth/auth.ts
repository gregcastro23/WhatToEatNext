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
import { isAdminEmail } from "@/lib/auth/adminEmails";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import { logAuthEvent } from "@/services/authEventsService";
import type { UserWithProfile } from "@/services/userDatabaseService";
import { createLogger } from "@/utils/logger";
import { authConfig } from "./auth.config";
import { UserRole } from "./roles";
import type { JWT } from "next-auth/jwt";

const logger = createLogger("auth");

const PROVIDER_GOOGLE = "google";

interface ExtendedJWT extends JWT {
  userId?: string;
  role?: "admin" | "user";
  onboardingComplete?: boolean;
  tier?: "free" | "premium";
  recipesGeneratedToday?: number;
  sessionId?: string;
  deviceSessionId?: string;
  provider?: string;
}

interface DailyLimitRow {
  recipes_generated: number;
}

interface UpdateSessionPayload {
  recipesGeneratedToday?: number;
}

function describeError(err: unknown): { code: string; message: string } {
  if (err instanceof Error) {
    return { code: err.name || "Error", message: err.message.slice(0, 500) };
  }
  return { code: "UnknownError", message: String(err).slice(0, 500) };
}

const recordAuthEvent = (params: Parameters<typeof logAuthEvent>[0]): void => {
  logAuthEvent(params).catch(() => {});
};

/** 
 * Simple short-lived cache to prevent redundant DB hits during the 
 * multi-step auth handshake (signIn -> jwt -> session).
 * Keys are email addresses, values are UserWithProfile.
 */
const userCache = new Map<string, { data: UserWithProfile | null | "TIMEOUT_ERROR"; timestamp: number }>();
const pendingLookups = new Map<string, Promise<UserWithProfile | null>>();
const CACHE_TTL = 30000; // 30 seconds

async function getCachedUser(email: string): Promise<UserWithProfile | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const cached = userCache.get(normalizedEmail);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    if (cached.data === "TIMEOUT_ERROR") {
      throw new Error("DB Timeout (Cached)");
    }
    return cached.data;
  }
  
  // Check if there is already a lookup in progress for this email
  if (pendingLookups.has(normalizedEmail)) {
    return pendingLookups.get(normalizedEmail)!;
  }
  
  const lookupPromise = (async (): Promise<UserWithProfile | null> => {
    try {
      const { userDatabase } = await import("@/services/userDatabaseService");
      // 8s timeout: gives Vercel cold-start enough headroom for Railway TLS handshake
      // + first-connection setup. Vercel's default function limit is 10s, so this
      // still leaves slack for the rest of the handler.
      const dbUser = await Promise.race([
        userDatabase.getUserByEmail(normalizedEmail),
        new Promise<UserWithProfile | null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 8000))
      ]);
      
      // Cache both valid users and null (not found)
      userCache.set(normalizedEmail, { data: dbUser, timestamp: Date.now() });
      return dbUser;
    } catch (error) {
      // Cache the timeout/error momentarily so the jwt callback doesn't hang again
      userCache.set(normalizedEmail, { data: "TIMEOUT_ERROR", timestamp: Date.now() });
      throw error;
    } finally {
      pendingLookups.delete(normalizedEmail);
    }
  })();
  
  pendingLookups.set(normalizedEmail, lookupPromise);
  return lookupPromise;
}

/**
 * Handle background asynchronous post-sign-in tasks
 */
async function runBackgroundSignInTasks(
  user: { email: string; name?: string | null },
  dbUser: UserWithProfile,
  isNewUser: boolean,
): Promise<void> {
  try {
    logger.info(`Starting background tasks for ${user.email}`);

    // Welcome token grant — run FIRST.
    const { tokenEconomy } = await import("@/services/TokenEconomyService");
    await tokenEconomy.grantSignupBonus(dbUser.id);

    // 0. Calculate and synchronize natal chart if birth data is present but not computed
    const { profile } = dbUser;
    const { birthData, natalChart } = profile;

    if (birthData && (!natalChart || !profile.onboardingComplete)) {
      try {
        logger.info(`Calculating missing natal chart for ${user.email}`);
        const { calculateNatalChart } = await import("@/services/natalChartService");
        const { userDatabase } = await import("@/services/userDatabaseService");
        const { commensalDatabase } = await import("@/services/commensalDatabaseService");
        
        const newChart = await calculateNatalChart(birthData);
        await userDatabase.updateUserProfile(dbUser.id, {
          natalChart: newChart,
          onboardingComplete: true,
        });
        
        // Store in saved charts (Cosmic Identity registry)
        try {
          const existingCharts = await commensalDatabase.getSavedChartsForUser(dbUser.id);
          const hasCosmicIdentity = existingCharts.some((c) => c.chartType === "cosmic_identity");
          if (!hasCosmicIdentity) {
            await commensalDatabase.createSavedChart({
              ownerId: dbUser.id,
              label: "My Cosmos",
              chartType: "cosmic_identity",
              birthData: newChart.birthData,
              natalChart: newChart,
            });
          }
        } catch (e) {
          logger.error("Failed to sync cosmic identity to commensal db:", e);
        }

        logger.info(`Successfully generated missing natal chart for ${user.email}`);
      } catch (chartErr) {
        logger.error(`Failed to generate chart in background for ${user.email}:`, chartErr);
      }
    } else if (natalChart) {
      // Ensure they have it registered in their saved charts even if profile already had it
      try {
        const { commensalDatabase } = await import("@/services/commensalDatabaseService");
        const existingCharts = await commensalDatabase.getSavedChartsForUser(dbUser.id);
        if (!existingCharts.some((c) => c.chartType === "cosmic_identity")) {
          await commensalDatabase.createSavedChart({
            ownerId: dbUser.id,
            label: "My Cosmos",
            chartType: "cosmic_identity",
            birthData: natalChart.birthData ?? birthData,
            natalChart,
          });
        }
      } catch (_e) {
        // silent failure for sync
      }
    }

    // Agent sync for agentic users
    if (isNewUser && user.email.endsWith("@agentic.alchm.kitchen")) {
      const { email } = user;
      const displayName = user.name ?? undefined;
      const [agentId] = email.split("@");

      const paSecret = process.env.INTERNAL_API_SECRET;
      const paBase = getServiceUrlSafe("planetaryAgentsApi");

      if (!paSecret) {
        logger.warn(`agent-sync skipped for ${email}: missing INTERNAL_API_SECRET or PA base URL`);
      } else {
        const executeAgentSync = async (): Promise<void> => {
          try {
            const resp = await fetch(`${paBase}/api/internal/agent-sync`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Sync-Secret": paSecret,
              },
              body: JSON.stringify({
                agentId,
                displayName: displayName ?? agentId,
                email,
              }),
            });
            if (resp.ok) {
              logger.info(`agent-sync ok for ${email} → PA`);
            } else {
              const text = await resp.text().catch(() => "(unreadable)");
              logger.warn(`agent-sync HTTP ${resp.status} for ${email} → PA: ${text}`);
            }
          } catch (syncErr) {
            logger.warn(`agent-sync request failed for ${email} → PA (non-blocking):`, syncErr);
          }
        };
        executeAgentSync().catch(() => {});
      }
    }

    // 1. Auto-provision admin
    if (isAdminEmail(user.email)) {
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
        logger.info(`Auto-provisioned premium for ${user.email}`);
      }
    }

    // 2. Send emails
    const emailService = (await import("@/services/emailService")).default;
    emailService.ensureInitialized();
    if (emailService.isConfigured()) {
      const userName = user.name ?? user.email;
      const emailPromises = [
        emailService.sendLoginNotificationEmail(user.email, userName, isNewUser)
      ];
      if (isNewUser) {
        emailPromises.push(emailService.sendWelcomeEmail(user.email, userName));
      }
      await Promise.allSettled(emailPromises);
      logger.info(`Background emails sent for ${user.email}`);
    }

    // 3. In-app notifications
    try {
      const { notificationDatabase } = await import("@/services/notificationDatabaseService");
      const userName = user.name ?? user.email;

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

      // Daily insight notification — for users with a natal chart
      const chartForInsight = profile.natalChart;

      const hasPositions = Boolean(
        chartForInsight?.planetaryPositions ??
        (chartForInsight?.planets && chartForInsight.planets.length > 0)
      );

      if (hasPositions && chartForInsight) {
        import("@/services/dailyInsightService").then(({ generateDailyInsightNotification }) => {
          generateDailyInsightNotification(dbUser.id, chartForInsight).catch(() => {});
        }).catch(() => {});
      }
    } catch (notifError) {
      logger.error("Notification creation failed (non-blocking):", notifError);
    }
  } catch (bgError) {
    logger.error("Background task error:", bgError);
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  debug: process.env.NODE_ENV === "development" || process.env.DEBUG === "true",
  events: {
    async signOut(message) {
      // In JWT mode NextAuth passes { token } — delete the DB session record so
      // the session slot is freed and can no longer be used to verify revocation.
      const rawToken = "token" in message ? message.token : undefined;
      const token = rawToken as ExtendedJWT | undefined;
      const sessionId = token?.sessionId;
      if (sessionId) {
        try {
          const { executeQuery } = await import("@/lib/database");
          await executeQuery(
            `DELETE FROM sessions WHERE "sessionToken" = $1`,
            [sessionId]
          );
        } catch (e) {
          logger.warn("Session cleanup on signOut failed (non-blocking):", e);
        }
      }
      recordAuthEvent({
        type: "signout",
        status: "info",
        userId: token?.userId ?? null,
        email: token?.email ?? null,
        metadata: { sessionId: sessionId ?? null },
      });
    },
  },
  callbacks: {
    // Preserve the edge-safe authorized and session callbacks
    ...authConfig.callbacks,

    async signIn({ user, account }): Promise<boolean> {
      logger.info(`signIn callback started for ${user.email}`);
      const provider = account?.provider ?? PROVIDER_GOOGLE;

      recordAuthEvent({
        type: "signin_started",
        status: "info",
        email: user.email ?? null,
        provider,
      });

      if (!user.email || !account) {
        logger.warn("signIn failed: Missing email or account");
        recordAuthEvent({
          type: "signin_aborted",
          status: "failure",
          email: user.email ?? null,
          provider,
          errorCode: "missing_email_or_account",
          errorMessage: "Provider returned without email or account context",
        });
        return true;
      }

      try {
        let dbUser: UserWithProfile | null = null;
        try {
          dbUser = await getCachedUser(user.email);
          recordAuthEvent({
            type: "signin_user_lookup_success",
            status: "success",
            email: user.email,
            userId: dbUser?.id ?? null,
            provider,
            metadata: { isNewUser: !dbUser },
          });
        } catch (lookupErr) {
          const { code, message } = describeError(lookupErr);
          recordAuthEvent({
            type: "signin_user_lookup_failed",
            status: "failure",
            email: user.email,
            provider,
            errorCode: code,
            errorMessage: message,
          });
          throw lookupErr;
        }

        const isNewUser = !dbUser;
        logger.info(`User lookup complete. isNewUser: ${isNewUser}`);

        const isAdmin = isAdminEmail(user.email);

        if (!dbUser) {
          const { userDatabase } = await import("@/services/userDatabaseService");
          logger.info(`Creating new user. isAdmin: ${isAdmin}`);

          try {
            dbUser = await Promise.race([
              userDatabase.createUser({
                email: user.email,
                name: user.name ?? "",
                image: user.image ?? undefined,
                roles: isAdmin
                  ? [UserRole.ADMIN, UserRole.USER]
                  : [UserRole.USER],
              }),
              new Promise<UserWithProfile | null>((_, reject) => setTimeout(() => reject(new Error("Create User Timeout")), 8000))
            ]);
            if (dbUser) {
              const normEmail = user.email.toLowerCase().trim();
              userCache.set(normEmail, { data: dbUser, timestamp: Date.now() });
              if (dbUser.email) {
                userCache.set(dbUser.email.toLowerCase().trim(), { data: dbUser, timestamp: Date.now() });
              }
              recordAuthEvent({
                type: "signin_user_created",
                status: "success",
                userId: dbUser.id,
                email: user.email,
                provider,
                metadata: { isAdmin },
              });
            }
          } catch (createErr) {
            const { code, message } = describeError(createErr);
            recordAuthEvent({
              type: "signin_user_create_failed",
              status: "failure",
              email: user.email,
              provider,
              errorCode: code,
              errorMessage: message,
            });
            throw createErr;
          }
        } else if (isAdmin && !dbUser.roles.includes(UserRole.ADMIN)) {
          logger.info(`Promoting existing user ${user.email} to ADMIN`);
          const { userDatabase } = await import("@/services/userDatabaseService");
          await userDatabase.updateUserRole(dbUser.id, UserRole.ADMIN);
          dbUser.roles = [UserRole.ADMIN, UserRole.USER];
          const normEmail = user.email.toLowerCase().trim();
          userCache.set(normEmail, { data: dbUser, timestamp: Date.now() });
          recordAuthEvent({
            type: "signin_role_promoted",
            status: "info",
            userId: dbUser.id,
            email: user.email,
            metadata: { newRole: "ADMIN" },
          });
        }

        // Bump login_count + last_login_at on every successful sign-in
        if (dbUser?.id) {
          const targetUserId = dbUser.id;
          const updateAuthMetrics = async (): Promise<void> => {
            try {
              const { userDatabase } = await import("@/services/userDatabaseService");
              await userDatabase.updateUserAuth(targetUserId, { lastLoginAt: new Date() });
              recordAuthEvent({
                type: "signin_last_login_updated",
                status: "success",
                userId: targetUserId,
                email: user.email ?? null,
                provider,
              });
            } catch (updateErr) {
              const { code, message } = describeError(updateErr);
              recordAuthEvent({
                type: "signin_last_login_update_failed",
                status: "failure",
                userId: targetUserId,
                email: user.email ?? null,
                provider,
                errorCode: code,
                errorMessage: message,
              });
            }
          };
          updateAuthMetrics().catch(() => {});
        }

        // Persist OAuth account link so accounts table stays in sync.
        if (dbUser && account) {
          const targetUserId = dbUser.id;
          const linkAccount = async (): Promise<void> => {
            try {
              const { executeQuery } = await import("@/lib/database");
              await executeQuery(
                `INSERT INTO accounts ("userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 ON CONFLICT (provider, "providerAccountId") DO UPDATE SET
                   access_token = EXCLUDED.access_token,
                   refresh_token = EXCLUDED.refresh_token,
                   expires_at = EXCLUDED.expires_at,
                   updated_at = NOW()`,
                [
                  targetUserId,
                  account.type,
                  account.provider,
                  account.providerAccountId,
                  account.refresh_token ?? null,
                  account.access_token ?? null,
                  account.expires_at ?? null,
                  account.token_type ?? null,
                  account.scope ?? null,
                  account.id_token ?? null,
                  account.session_state ?? null,
                ]
              );
              recordAuthEvent({
                type: "signin_account_link_success",
                status: "success",
                userId: targetUserId,
                email: user.email ?? null,
                provider: account.provider,
              });
            } catch (e) {
              logger.warn("Account link upsert failed (non-blocking):", e);
              const { code, message } = describeError(e);
              recordAuthEvent({
                type: "signin_account_link_failed",
                status: "failure",
                userId: targetUserId,
                email: user.email ?? null,
                provider: account.provider,
                errorCode: code,
                errorMessage: message,
              });
            }
          };
          linkAccount().catch(() => {});
        }

        // Fire-and-forget non-critical background tasks
        if (dbUser && user.email) {
          runBackgroundSignInTasks(
            { email: user.email, name: user.name },
            dbUser,
            isNewUser,
          ).catch(() => {});
        }
      } catch (error) {
        logger.error(`DB error during signIn for ${user.email} (non-blocking):`, error);
        const { code, message } = describeError(error);
        recordAuthEvent({
          type: "signin_aborted",
          status: "failure",
          email: user.email,
          provider,
          errorCode: code,
          errorMessage: message,
        });
      }

      logger.info(`signIn callback completed for ${user.email}`);
      recordAuthEvent({
        type: "signin_complete",
        status: "success",
        email: user.email,
        provider,
      });
      return true;
    },

    async jwt({ token, user, account, trigger, session }): Promise<JWT | null> {
      const extToken = token as ExtendedJWT;
      // On initial sign-in, persist user info into the JWT
      if (user) {
        extToken.email = user.email ?? undefined;
        extToken.name = user.name ?? undefined;
        extToken.picture = user.image ?? undefined;
      }
      if (account) {
        extToken.provider = account.provider;
      }

      // Sync recipesGeneratedToday dynamically from trigger update
      if (trigger === "update" && session && typeof session === "object" && "recipesGeneratedToday" in session) {
        const updatePayload = session as UpdateSessionPayload;
        extToken.recipesGeneratedToday = updatePayload.recipesGeneratedToday;
      }

      // Soft session revocation check
      if (
        process.env.AUTH_REVOCATION_CHECK === "on" &&
        trigger === "update" &&
        typeof extToken.sessionId === "string" &&
        extToken.sessionId.length > 0
      ) {
        try {
          const { isJtiRevoked } = await import("./sessionRevocation");
          if (await isJtiRevoked(extToken.sessionId)) {
            logger.info(
              `Revoked jti detected on session.update for ${extToken.email}; clearing token`,
            );
            return null;
          }
        } catch (revErr) {
          logger.warn("jwt-callback revocation check errored (non-blocking):", revErr);
        }
      }

      // Resolve role, tier, and onboarding status from DB
      if (extToken.email && (user || trigger === "update" || !extToken.userId)) {
        try {
          const normTokenEmail = extToken.email.toLowerCase().trim();
          if (trigger === "update") {
            userCache.delete(normTokenEmail);
          }
          let dbUser = await getCachedUser(normTokenEmail);

          // JIT Fallback: If dbUser is missing/null, attempt creation
          if (!dbUser && extToken.email) {
            try {
              const { userDatabase } = await import("@/services/userDatabaseService");
              const isAdmin = isAdminEmail(extToken.email);
              dbUser = await Promise.race([
                userDatabase.createUser({
                  email: extToken.email,
                  name: extToken.name ?? "",
                  image: extToken.picture ?? undefined,
                  roles: isAdmin ? [UserRole.ADMIN, UserRole.USER] : [UserRole.USER],
                }),
                new Promise<UserWithProfile | null>((_, reject) => setTimeout(() => reject(new Error("JIT Create User Timeout")), 8000))
              ]);
              if (dbUser) {
                userCache.set(normTokenEmail, { data: dbUser, timestamp: Date.now() });
              }
            } catch (jitErr) {
              logger.warn(`JIT createUser fallback in jwt callback failed for ${extToken.email}:`, jitErr);
            }
          }

          if (dbUser) {
            extToken.userId = dbUser.id;
            const isAdmin = dbUser.roles.includes(UserRole.ADMIN);
            extToken.role = isAdmin ? "admin" : "user";
            extToken.onboardingComplete = dbUser.profile.onboardingComplete === true;

            // On initial sign-in: write a session record so sessions are revocable.
            if (user && !extToken.sessionId) {
              try {
                const sessionId = crypto.randomUUID();
                const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const { executeQuery } = await import("@/lib/database");
                await executeQuery(
                  `INSERT INTO sessions ("sessionToken", "userId", expires)
                   VALUES ($1, $2, $3) ON CONFLICT ("sessionToken") DO NOTHING`,
                  [sessionId, dbUser.id, expiresAt]
                );
                extToken.sessionId = sessionId;
              } catch (e) {
                logger.warn("Session DB write failed (non-blocking):", e);
              }
            }

            // Also write a device_sessions row for the /profile/security UI.
            if (user && extToken.sessionId && !extToken.deviceSessionId) {
              try {
                const provider =
                  account?.provider ?? extToken.provider ?? "google";
                const { executeQuery } = await import("@/lib/database");
                await executeQuery(
                  `INSERT INTO device_sessions (id, user_id, jti, provider, current_for_jti)
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT (user_id, jti) DO UPDATE SET
                     last_seen_at = NOW(),
                     revoked_at = NULL`,
                  [
                    extToken.sessionId,
                    dbUser.id,
                    extToken.sessionId,
                    provider,
                    extToken.sessionId,
                  ],
                );
                extToken.deviceSessionId = extToken.sessionId;
              } catch (e) {
                logger.warn("device_sessions write failed (non-blocking):", e);
              }
            }

            // Embed subscription tier into JWT
            if (isAdmin) {
              extToken.tier = "premium";
            } else {
              try {
                const { subscriptionService } = await import(
                  "@/services/subscriptionService"
                );
                const sub = await Promise.race([
                  subscriptionService.getUserSubscription(dbUser.id),
                  new Promise<{ tier?: "free" | "premium" } | null>((_, reject) => setTimeout(() => reject(new Error("Subscription Timeout")), 3000))
                ]);
                extToken.tier = sub?.tier === "premium" ? "premium" : "free";
              } catch {
                extToken.tier ??= "free";
              }
            }

            // Resolve recipesGeneratedToday for free-tier users
            if (extToken.tier === "free") {
              try {
                const { executeQuery } = await import("@/lib/database");
                const limitRows = await executeQuery<DailyLimitRow>(
                  `SELECT recipes_generated FROM user_daily_limits 
                   WHERE user_id = $1 AND date = CURRENT_DATE`,
                  [dbUser.id]
                );
                extToken.recipesGeneratedToday = limitRows.rows[0]?.recipes_generated ?? 0;
              } catch (e) {
                logger.warn("Failed to fetch recipes_generated for JWT:", e);
                extToken.recipesGeneratedToday ??= 0;
              }
            } else {
              extToken.recipesGeneratedToday = 0;
            }
          } else {
            extToken.role = isAdminEmail(extToken.email) ? "admin" : "user";
            extToken.onboardingComplete = false;
            extToken.tier = isAdminEmail(extToken.email) ? "premium" : "free";
            extToken.recipesGeneratedToday = 0;
          }
        } catch {
          extToken.role ??= isAdminEmail(extToken.email) ? "admin" : "user";
          extToken.onboardingComplete ??= false;
          extToken.tier ??= isAdminEmail(extToken.email) ? "premium" : "free";
          extToken.recipesGeneratedToday ??= 0;
        }
      }

      return extToken;
    },
  },
});
