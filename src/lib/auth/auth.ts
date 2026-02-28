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

/** The admin email that automatically gets ADMIN role */
const ADMIN_EMAIL = process.env.AUTH_ADMIN_EMAIL || "xalchm@gmail.com";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    // Preserve the edge-safe authorized and session callbacks
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      if (!user.email || !account) return true;

      try {
        // Dynamic import keeps Node.js deps (pg) out of the Edge bundle
        const { userDatabase } = await import(
          "@/services/userDatabaseService"
        );

        let dbUser = await userDatabase.getUserByEmail(user.email);

        if (!dbUser) {
          const allUsers = await userDatabase.getAllUsers();
          const isAdmin =
            user.email === ADMIN_EMAIL || allUsers.length === 0;

          dbUser = await userDatabase.createUser({
            email: user.email,
            name: user.name || "",
            roles: isAdmin
              ? [UserRole.ADMIN, UserRole.USER]
              : [UserRole.USER],
          });
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
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      if (account) {
        token.provider = account.provider;
      }

      // Resolve role and onboarding status from DB (on sign-in or session update)
      if (token.email && (user || trigger === "update")) {
        try {
          const { userDatabase } = await import(
            "@/services/userDatabaseService"
          );

          const dbUser = await userDatabase.getUserByEmail(
            token.email as string,
          );
          if (dbUser) {
            token.userId = dbUser.id;
            const isAdmin = dbUser.roles.includes(UserRole.ADMIN as never);
            token.role = isAdmin ? "admin" : "user";
            token.onboardingComplete = !!(
              dbUser.profile.birthData && dbUser.profile.natalChart
            );
          } else {
            token.role = token.email === ADMIN_EMAIL ? "admin" : "user";
            token.onboardingComplete = false;
          }
        } catch {
          // Fallback if DB unavailable
          token.role = token.email === ADMIN_EMAIL ? "admin" : "user";
          token.onboardingComplete = false;
        }
      }

      return token;
    },

    // session callback is inherited from authConfig.callbacks
  },
});
