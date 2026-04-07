/**
 * NextAuth.js Edge-Compatible Configuration
 *
 * This file contains ONLY the auth configuration that is safe to import
 * from Edge Runtime contexts (e.g., Next.js middleware). It must NOT
 * import any Node.js-only modules (pg, jsonwebtoken, bcryptjs, etc.).
 *
 * Server-only callbacks (signIn, jwt with DB lookups) live in auth.ts,
 * which extends this config.
 *
 * @file src/lib/auth/auth.config.ts
 */

import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

/**
 * Resolve the auth secret. In preview/development environments where AUTH_SECRET
 * is not configured (e.g., dependabot PRs), use a placeholder to prevent
 * MissingSecret crashes. Auth features won't work, but the app won't 500.
 */
function getAuthSecret(): string | undefined {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }
  if (
    process.env.VERCEL_ENV === "preview" ||
    process.env.NODE_ENV === "development"
  ) {
    return `placeholder-secret-${process.env.VERCEL_GIT_COMMIT_SHA || "dev"}`;
  }
  return undefined;
}

export const authConfig = {
  secret: getAuthSecret(),
  trustHost: true, // Unconditionally trust host for v5 compatibility across all platforms
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days - keep users logged in
    updateAge: 24 * 60 * 60, // Refresh JWT once per day
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  cookies: {
    pkceCodeVerifier: {
      name: "authjs.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 900, // 15 minutes
      },
    },
  },
  callbacks: {
    /**
     * Runs in Edge Runtime (middleware). Must not use any Node.js APIs.
     * The session object here is populated from the JWT cookie, which
     * was enriched by the jwt/session callbacks in auth.ts during sign-in.
     */
    authorized({ auth: session, request }) {
      const { pathname } = request.nextUrl;
      console.log(`[auth] authorized callback for ${pathname}. Authenticated: ${!!session?.user}`);

      // Routes that require authentication
      const isProtected =
        pathname.startsWith("/profile") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/admin");

      // Routes that require premium tier (authenticated users without premium
      // get redirected to /upgrade instead of seeing errors)
      const isPremiumRoute =
        pathname.startsWith("/recipe-generator") ||
        pathname.startsWith("/planetary-chart");

      // Not authenticated -> redirect to login for protected routes
      if ((isProtected || isPremiumRoute) && !session?.user) {
        console.log(`[auth] Unauthorized access to ${pathname}, redirecting to /login`);
        return Response.redirect(new URL("/login", request.nextUrl.origin));
      }

      if (session?.user) {
        const user = session.user as Record<string, unknown>;
        const onboardingComplete = user.onboardingComplete === true;
        const tier = (user.tier as string) || "free";
        const isAdmin = user.role === "admin";

        // Also check the short-lived cookie set after onboarding completes.
        // This prevents a redirect loop when the JWT hasn't propagated yet
        // (e.g., serverless instance isolation, DB unavailable for JWT callback).
        const onboardingCookie = request.cookies.get("onboarding_completed")?.value === "1";

        // Authenticated but onboarding incomplete -> force /onboarding
        if (!onboardingComplete && !onboardingCookie && pathname.startsWith("/profile")) {
          console.log(`[auth] Profile incomplete for ${user.email}, forcing /onboarding`);
          return Response.redirect(
            new URL("/onboarding", request.nextUrl.origin),
          );
        }

        // Authenticated and onboarding complete -> skip onboarding page
        if ((onboardingComplete || onboardingCookie) && pathname.startsWith("/onboarding")) {
          console.log(`[auth] Onboarding already complete for ${user.email}, skipping to /profile`);
          return Response.redirect(
            new URL("/profile", request.nextUrl.origin),
          );
        }

        // Admin route protection
        if (pathname.startsWith("/admin") && user.role !== "admin") {
          console.log(`[auth] Non-admin access attempt to /admin by ${user.email}`);
          return Response.redirect(
            new URL("/profile", request.nextUrl.origin),
          );
        }

        // Premium route gating — free users see upgrade page, not errors.
        // Admins always have premium access.
        if (isPremiumRoute && tier !== "premium" && !isAdmin) {
          console.log(`[auth] Premium access required for ${pathname} by ${user.email}`);
          const upgradeUrl = new URL("/upgrade", request.nextUrl.origin);
          upgradeUrl.searchParams.set("from", pathname);
          return Response.redirect(upgradeUrl);
        }
      }

      return true;
    },

    /**
     * Maps JWT token fields to the session object.
     * This is edge-safe (no Node.js APIs) and is included here so
     * the middleware's authorized() callback can read custom fields.
     */
    session({ session, token }) {
      if (session.user) {
        // Use DB-backed userId only. token.sub can be OAuth provider subject,
        // which causes UUID mismatches in DB-backed API routes.
        session.user.id = (token.userId as string) || "";
        session.user.email = (token.email as string) || "";
        session.user.name = (token.name as string) || "";
        session.user.image = (token.picture as string) || "";
        session.user.role = (token.role as string) || "user";
        session.user.tier = (token.tier as "free" | "premium") || "free";
        session.user.onboardingComplete =
          (token.onboardingComplete as boolean) ?? false;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
