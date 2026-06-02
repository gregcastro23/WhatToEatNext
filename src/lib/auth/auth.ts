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
import { isAdminEmail, isPremiumEmail } from "@/lib/auth/adminEmails";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import { logAuthEvent } from "@/services/authEventsService";
import { createLogger } from "@/utils/logger";
import { authConfig } from "./auth.config";
import { UserRole } from "./roles";

const logger = createLogger("auth");

const PROVIDER_GOOGLE = "google";

function describeError(err: unknown): { code: string; message: string } {
  if (err instanceof Error) {
    return { code: err.name || "Error", message: err.message.slice(0, 500) };
  }
  return { code: "UnknownError", message: String(err).slice(0, 500) };
}

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
    if (cached.data === "TIMEOUT_ERROR") {
      throw new Error("DB Timeout (Cached)");
    }
    return cached.data;
  }
  
  // Check if there is already a lookup in progress for this email
  if (pendingLookups.has(email)) {
    return pendingLookups.get(email);
  }
  
  const lookupPromise = (async () => {
    try {
      const { userDatabase } = await import("@/services/userDatabaseService");
      // 8s timeout: gives Vercel cold-start enough headroom for Railway TLS handshake
      // + first-connection setup. Vercel's default function limit is 10s, so this
      // still leaves slack for the rest of the handler.
      const dbUser = await Promise.race([
        userDatabase.getUserByEmail(email),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 8000))
      ]);
      
      // Cache both valid users and null (not found)
      userCache.set(email, { data: dbUser, timestamp: Date.now() });
      return dbUser;
    } catch (error) {
      // Cache the timeout/error momentarily so the jwt callback doesn't hang again
      // Using a string symbol for error caching
      userCache.set(email, { data: "TIMEOUT_ERROR", timestamp: Date.now() });
      throw error;
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
  events: {
    async signOut(message) {
      // In JWT mode NextAuth passes { token } — delete the DB session record so
      // the session slot is freed and can no longer be used to verify revocation.
      const token = (message as any)?.token as
        | { sessionId?: string; userId?: string; email?: string }
        | undefined;
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
      void logAuthEvent({
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

    async signIn({ user, account }) {
      logger.info(`signIn callback started for ${user.email}`);
      const provider = account?.provider ?? PROVIDER_GOOGLE;

      void logAuthEvent({
        type: "signin_started",
        status: "info",
        email: user.email ?? null,
        provider,
      });

      if (!user.email || !account) {
        logger.warn("signIn failed: Missing email or account");
        void logAuthEvent({
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
        let dbUser: any = null;
        try {
          dbUser = await getCachedUser(user.email);
          void logAuthEvent({
            type: "signin_user_lookup_success",
            status: "success",
            email: user.email,
            userId: dbUser?.id ?? null,
            provider,
            metadata: { isNewUser: !dbUser },
          });
        } catch (lookupErr) {
          const { code, message } = describeError(lookupErr);
          void logAuthEvent({
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

          // 8s timeout: createUser opens a transaction with 3+ INSERTs. On cold-start
          // the connection setup alone can eat 2-3s before the first query runs.
          try {
            dbUser = await Promise.race([
              userDatabase.createUser({
                email: user.email,
                name: user.name || "",
                image: user.image || undefined,
                roles: isAdmin
                  ? [UserRole.ADMIN, UserRole.USER]
                  : [UserRole.USER],
              }),
              new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Create User Timeout")), 8000))
            ]);
            if (dbUser) {
              userCache.set(user.email, { data: dbUser, timestamp: Date.now() });
              void logAuthEvent({
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
            void logAuthEvent({
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
          // Promote existing user to admin if they are in the admin list but don't have the role yet
          logger.info(`Promoting existing user ${user.email} to ADMIN`);
          const { userDatabase } = await import("@/services/userDatabaseService");
          await userDatabase.updateUserRole(dbUser.id, UserRole.ADMIN);
          // Refresh cache
          dbUser.roles = [UserRole.ADMIN, UserRole.USER];
          userCache.set(user.email, { data: dbUser, timestamp: Date.now() });
          void logAuthEvent({
            type: "signin_role_promoted",
            status: "info",
            userId: dbUser.id,
            email: user.email,
            metadata: { newRole: "ADMIN" },
          });
        }

        // Bump login_count + last_login_at on every successful sign-in so we
        // have real "active user" telemetry. Non-blocking — a failure here is
        // logged but never breaks the sign-in flow.
        if (dbUser?.id) {
          void (async () => {
            try {
              const { userDatabase } = await import("@/services/userDatabaseService");
              await userDatabase.updateUserAuth(dbUser.id, { lastLoginAt: new Date() });
              void logAuthEvent({
                type: "signin_last_login_updated",
                status: "success",
                userId: dbUser.id,
                email: user.email,
                provider,
              });
            } catch (updateErr) {
              const { code, message } = describeError(updateErr);
              void logAuthEvent({
                type: "signin_last_login_update_failed",
                status: "failure",
                userId: dbUser.id,
                email: user.email,
                provider,
                errorCode: code,
                errorMessage: message,
              });
            }
          })();
        }

        // Persist OAuth account link so accounts table stays in sync.
        // Wrapped in a short race to avoid blocking sign-in on DB hiccups.
        if (account) {
          void (async () => {
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
                  dbUser.id,
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
              void logAuthEvent({
                type: "signin_account_link_success",
                status: "success",
                userId: dbUser.id,
                email: user.email,
                provider: account.provider,
              });
            } catch (e) {
              logger.warn("Account link upsert failed (non-blocking):", e);
              const { code, message } = describeError(e);
              void logAuthEvent({
                type: "signin_account_link_failed",
                status: "failure",
                userId: dbUser.id,
                email: user.email,
                provider: account.provider,
                errorCode: code,
                errorMessage: message,
              });
            }
          })();
        }

        // Fire-and-forget non-critical tasks
        void (async () => {
          try {
            if (!dbUser) return;
            logger.info(`Starting background tasks for ${user.email}`);
            
            // 0. Calculate and synchronize natal chart if birth data is present but not computed
            const profile = (dbUser)?.profile || {};
            if (profile.birthData && (!profile.natalChart || !profile.onboardingComplete)) {
              try {
                logger.info(`Calculating missing natal chart for ${user.email}`);
                const { calculateNatalChart } = await import("@/services/natalChartService");
                const { userDatabase } = await import("@/services/userDatabaseService");
                const { commensalDatabase } = await import("@/services/commensalDatabaseService");
                
                const newChart = await calculateNatalChart(profile.birthData);
                await userDatabase.updateUserProfile(dbUser.id, {
                  natalChart: newChart,
                  onboardingComplete: true,
                });
                
                // Store in saved charts (Cosmic Identity registry)
                try {
                  const existingCharts = await commensalDatabase.getSavedChartsForUser(dbUser.id);
                  const hasCosmicIdentity = existingCharts.some(c => c.chartType === "cosmic_identity");
                  if (!hasCosmicIdentity) {
                    await commensalDatabase.createSavedChart({
                      ownerId: dbUser.id,
                      label: "My Cosmos",
                      chartType: "cosmic_identity",
                      birthData: newChart.birthData,
                      natalChart: newChart
                    });
                  }
                } catch (e) {
                   logger.error("Failed to sync cosmic identity to commensal db:", e);
                }

                logger.info(`Successfully generated missing natal chart for ${user.email}`);
              } catch (chartErr) {
                logger.error(`Failed to generate chart in background for ${user.email}:`, chartErr);
              }
            } else if (profile.natalChart) {
              // Ensure they have it registered in their saved charts even if profile already had it
              try {
                const { commensalDatabase } = await import("@/services/commensalDatabaseService");
                const existingCharts = await commensalDatabase.getSavedChartsForUser(dbUser.id);
                if (!existingCharts.some(c => c.chartType === "cosmic_identity")) {
                  await commensalDatabase.createSavedChart({
                    ownerId: dbUser.id,
                    label: "My Cosmos",
                    chartType: "cosmic_identity",
                    birthData: profile.natalChart.birthData || profile.birthData,
                    natalChart: profile.natalChart
                  });
                }
              } catch (_e) {
                // silent failure for sync
              }
            }
            
            // On first sign-in for an @agentic.alchm.kitchen email, POST to
            // PA's /api/internal/agent-sync. PA is the authority for agent
            // identities and propagates downstream to alchm.kitchen itself
            // (WTEN → PA → alchm.kitchen). Fire and forget — must never block
            // sign-in.
            if (isNewUser && user.email!.endsWith("@agentic.alchm.kitchen")) {
              const email = user.email!;
              const displayName = user.name ?? undefined;
              const agentId = email.split("@")[0]; // e.g. "monica-001"

              const paSecret = process.env.INTERNAL_API_SECRET;
              // PA Python backend is at api.agents.alchm.kitchen — the bare
              // agents.alchm.kitchen domain is the Next.js UI and would 404.
              // Safe resolver: never throw inside the sign-in path.
              const paBase = getServiceUrlSafe("planetaryAgentsApi");

              if (!paSecret) {
                logger.warn(
                  `agent-sync skipped for ${email}: missing INTERNAL_API_SECRET or PA base URL`,
                );
              } else {
                void (async () => {
                  try {
                    const resp = await fetch(
                      `${paBase}/api/internal/agent-sync`,
                      {
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
                      },
                    );
                    if (resp.ok) {
                      logger.info(`agent-sync ok for ${email} → PA`);
                    } else {
                      const text = await resp.text().catch(() => "(unreadable)");
                      logger.warn(
                        `agent-sync HTTP ${resp.status} for ${email} → PA: ${text}`,
                      );
                    }
                  } catch (syncErr) {
                    logger.warn(
                      `agent-sync request failed for ${email} → PA (non-blocking):`,
                      syncErr,
                    );
                  }
                })();
              }
            }

            // 1. Auto-provision premium
            if (isAdminEmail(user.email) || isPremiumEmail(user.email)) {
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

            // 1b. Welcome token grant — every new user starts with a small
            // even balance so they can try a couple of actions before
            // claiming their first daily Cosmic Yield (which itself requires
            // a completed natal chart). Idempotent via the per-user key, so
            // repeated sign-ins do not re-grant.
            try {
              const { tokenEconomy } = await import("@/services/TokenEconomyService");
              await tokenEconomy.creditMultipleTokens(
                dbUser.id,
                [
                  { tokenType: "Spirit", amount: 15 },
                  { tokenType: "Essence", amount: 15 },
                  { tokenType: "Matter", amount: 15 },
                  { tokenType: "Substance", amount: 15 },
                ],
                "signup_grant",
                {
                  description: "Welcome to Alchm.kitchen — starter cosmic balance",
                  idempotencyKey: `signup_grant:${dbUser.id}`,
                },
              );
            } catch (grantError) {
              logger.warn("Welcome token grant failed (non-blocking):", grantError);
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
              logger.info(`Background emails sent for ${user.email}`);
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
                (dbUser)?.tier === "premium";
              const natalChart =
                (dbUser)?.profile?.natalChart ||
                (dbUser)?.profile?.natal_chart;

              const hasPositions = !!(
                natalChart?.planetaryPositions ||
                natalChart?.planets?.length > 0 ||
                natalChart?.Sun
              );

              if (isPremium && hasPositions) {
                import("@/services/dailyInsightService").then(({ generateDailyInsightNotification }) => {
                  generateDailyInsightNotification(dbUser!.id, natalChart).catch(() => {});
                }).catch(() => {});
              }
            } catch (notifError) {
              logger.error("Notification creation failed (non-blocking):", notifError);
            }
          } catch (bgError) {
            logger.error("Background task error:", bgError);
          }
        })();
      } catch (error) {
        // DB failure during sign-in (e.g. Neon cold-start timeout).
        // Do NOT throw here — throwing inside the NextAuth signIn callback causes
        // the "Configuration" error page. Instead log the error and return true
        // so the user can still sign in. The JWT callback will handle missing data.
        logger.error(`DB error during signIn for ${user.email} (non-blocking):`, error);
        const { code, message } = describeError(error);
        void logAuthEvent({
          type: "signin_aborted",
          status: "failure",
          email: user.email,
          provider,
          errorCode: code,
          errorMessage: message,
        });
      }

      logger.info(`signIn callback completed for ${user.email}`);
      void logAuthEvent({
        type: "signin_complete",
        status: "success",
        email: user.email,
        provider,
      });
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // On initial sign-in, persist user info into the JWT
      if (user) {
        // NextAuth's user.id is the provider's account ID (e.g., Google sub).
        // DO NOT set token.userId = user.id here. The DB UUID must come from dbUser.id below.
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
      }
      if (account) {
        token.provider = account.provider;
      }

      // Sync recipesGeneratedToday dynamically from trigger update
      if (trigger === "update" && session && typeof session === "object" && "recipesGeneratedToday" in session) {
        token.recipesGeneratedToday = session.recipesGeneratedToday;
      }

      // Soft session revocation: on explicit session updates (e.g. after a
      // client calls `session.update()`), re-validate the jti against the
      // revocation store. If revoked, return null so NextAuth invalidates
      // the cookie. Belt-and-braces with the middleware check; protected
      // routes are already gated there. The natural updateAge refresh path
      // is intentionally NOT checked here — API-only users (no protected
      // page hits) keep a revoked JWT alive until its 30-day expiry, which
      // is acceptable for the "soft" revocation model.
      if (
        process.env.AUTH_REVOCATION_CHECK === "on" &&
        trigger === "update" &&
        typeof token.sessionId === "string" &&
        token.sessionId.length > 0
      ) {
        try {
          const { isJtiRevoked } = await import("./sessionRevocation");
          if (await isJtiRevoked(token.sessionId)) {
            logger.info(
              `Revoked jti detected on session.update for ${token.email}; clearing token`,
            );
            return null;
          }
        } catch (revErr) {
          // Fail-open consistent with sessionRevocation.ts.
          logger.warn("jwt-callback revocation check errored (non-blocking):", revErr);
        }
      }

      // Resolve role, tier, and onboarding status from DB (on sign-in or session update)
      if (token.email && (user || trigger === "update")) {
        try {
          // On explicit session update (e.g. after onboarding), bypass the 30-second
          // in-process cache so the JWT reflects the freshly-persisted profile data.
          if (trigger === "update") {
            userCache.delete(token.email);
          }
          const dbUser = await getCachedUser(token.email);
          
          if (dbUser) {
            token.userId = dbUser.id;
            const isAdmin = dbUser.roles.includes(UserRole.ADMIN);
            token.role = isAdmin ? "admin" : "user";
            token.onboardingComplete = dbUser.profile.onboardingComplete === true;

            // On initial sign-in: write a session record so sessions are revocable.
            // We use a UUID as the token (not the full JWT) so it fits VARCHAR(255).
            if (user && !token.sessionId) {
              try {
                const sessionId = crypto.randomUUID();
                const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const { executeQuery } = await import("@/lib/database");
                await executeQuery(
                  `INSERT INTO sessions ("sessionToken", "userId", expires)
                   VALUES ($1, $2, $3) ON CONFLICT ("sessionToken") DO NOTHING`,
                  [sessionId, dbUser.id, expiresAt]
                );
                token.sessionId = sessionId;
              } catch (e) {
                logger.warn("Session DB write failed (non-blocking):", e);
              }
            }

            // Also write a device_sessions row for the /profile/security UI.
            // The sessionId doubles as the jti so revocation targets the JWT.
            // Non-blocking: API falls back to JWT introspection if the table
            // is missing or the write fails.
            if (user && token.sessionId && !token.deviceSessionId) {
              try {
                const provider =
                  account?.provider ?? token.provider ?? "google";
                const { executeQuery } = await import("@/lib/database");
                await executeQuery(
                  `INSERT INTO device_sessions (id, user_id, jti, provider, current_for_jti)
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT (user_id, jti) DO UPDATE SET
                     last_seen_at = NOW(),
                     revoked_at = NULL`,
                  [
                    token.sessionId,
                    dbUser.id,
                    token.sessionId,
                    provider,
                    token.sessionId,
                  ],
                );
                token.deviceSessionId = token.sessionId;
              } catch (e) {
                logger.warn("device_sessions write failed (non-blocking):", e);
              }
            }

            // Embed subscription tier into JWT for instant access everywhere
            // Admins always get premium regardless of subscription state
            if (isAdmin) {
              token.tier = "premium";
            } else if (isPremiumEmail(token.email)) {
              token.tier = "premium";
            } else {
              try {
                const { subscriptionService } = await import(
                  "@/services/subscriptionService"
                );
                const sub = await Promise.race([
                  subscriptionService.getUserSubscription(dbUser.id),
                  new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Subscription Timeout")), 3000))
                ]);
                token.tier = sub?.tier || "free";
              } catch {
                // Preserve existing tier if DB unavailable or timeout
                if (!token.tier) token.tier = "free";
              }
            }

            // Resolve recipesGeneratedToday for free-tier users
            if (token.tier === "free") {
              try {
                const { executeQuery } = await import("@/lib/database");
                const limitRows = await executeQuery(
                  `SELECT recipes_generated FROM user_daily_limits 
                   WHERE user_id = $1 AND date = CURRENT_DATE`,
                  [dbUser.id]
                );
                token.recipesGeneratedToday = limitRows.rows[0]?.recipes_generated ?? 0;
              } catch (e) {
                logger.warn("Failed to fetch recipes_generated for JWT:", e);
                if (token.recipesGeneratedToday === undefined) {
                  token.recipesGeneratedToday = 0;
                }
              }
            } else {
              token.recipesGeneratedToday = 0; // Premium users get unlimited
            }
          } else {
            token.role = isAdminEmail(token.email) ? "admin" : "user";
            token.onboardingComplete = false;
            // Admin emails always get premium tier
            token.tier = isAdminEmail(token.email) ? "premium" : "free";
            token.recipesGeneratedToday = 0;
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
          if (token.recipesGeneratedToday === undefined) {
            token.recipesGeneratedToday = 0;
          }
        }
      }

      return token;
    },

    // session callback is inherited from authConfig.callbacks
  },
});
