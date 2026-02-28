/**
 * NextAuth.js (Auth.js v5) Configuration
 *
 * Provides Google OAuth authentication with JWT session strategy.
 * Compatible with existing JWT infrastructure and PostgreSQL backend.
 *
 * Required environment variables:
 *   AUTH_SECRET          - Random secret for signing tokens (generate with `npx auth secret`)
 *   AUTH_URL             - Canonical app URL (e.g., http://localhost:3000)
 *   AUTH_GOOGLE_ID       - Google OAuth client ID
 *   AUTH_GOOGLE_SECRET   - Google OAuth client secret
 *
 * Optional:
 *   AUTH_ADMIN_EMAIL     - Email that receives ADMIN role on first sign-in
 *   AUTH_TRUST_HOST      - Set to "true" for non-Vercel deployments
 *
 * When AUTH_SECRET is missing (e.g., Vercel preview deployments from dependabot),
 * a placeholder secret is used so the app doesn't crash. Auth functionality
 * will be non-functional but pages will still render.
 *
 * @file src/lib/auth/auth.ts
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { UserRole } from "@/lib/auth/jwt-auth";
import { userDatabase } from "@/services/userDatabaseService";

/**
 * Resolve the auth secret. In preview/development environments where AUTH_SECRET
 * is not configured (e.g., dependabot PRs), use a placeholder to prevent
 * MissingSecret crashes. Auth features won't work, but the app won't 500.
 */
function getAuthSecret(): string | undefined {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }
  // On Vercel preview deployments (e.g., dependabot), allow graceful degradation
  if (process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development") {
    return `placeholder-secret-${process.env.VERCEL_GIT_COMMIT_SHA || "dev"}`;
  }
  // In production, let Auth.js throw MissingSecret so it's caught immediately
  return undefined;
}

/** The admin email that automatically gets ADMIN role */
const ADMIN_EMAIL = process.env.AUTH_ADMIN_EMAIL || "xalchm@gmail.com";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: getAuthSecret(),
  trustHost: process.env.AUTH_TRUST_HOST === "true" || !!process.env.VERCEL,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth: session, request }) {
      const { pathname } = request.nextUrl;

      // Protect /profile and /onboarding routes
      const isProtected = pathname.startsWith("/profile") ||
        pathname.startsWith("/onboarding");
      if (isProtected && !session?.user) {
        return Response.redirect(new URL("/login", request.nextUrl.origin));
      }
      return true;
    },

    async signIn({ user, account }) {
      if (!user.email || !account) return true;

      try {
        // Look up or create the user in our database
        let dbUser = await userDatabase.getUserByEmail(user.email);

        if (!dbUser) {
          // Determine role: admin email or first-ever user gets ADMIN
          const allUsers = await userDatabase.getAllUsers();
          const isAdmin = user.email === ADMIN_EMAIL || allUsers.length === 0;

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
          const dbUser = await userDatabase.getUserByEmail(token.email);
          if (dbUser) {
            token.userId = dbUser.id;
            const isAdmin = dbUser.roles.includes(UserRole.ADMIN as any);
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

    async session({ session, token }) {
      // Expose token fields on the session object for client use
      if (session.user) {
        session.user.id = token.userId || token.sub || "";
        session.user.email = token.email || "";
        session.user.name = token.name || "";
        session.user.image = token.picture || "";
        session.user.role = token.role || "user";
        session.user.onboardingComplete = token.onboardingComplete ?? false;
      }
      return session;
    },
  },
});
