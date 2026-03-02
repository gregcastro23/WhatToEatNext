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

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

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

      const isProtected =
        pathname.startsWith("/profile") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/admin");

      // Not authenticated -> redirect to login for protected routes
      if (isProtected && !session?.user) {
        return Response.redirect(new URL("/login", request.nextUrl.origin));
      }

      if (session?.user) {
        const user = session.user as Record<string, unknown>;
        const onboardingComplete = user.onboardingComplete === true;

        // Also check the short-lived cookie set after onboarding completes.
        // This prevents a redirect loop when the JWT hasn't propagated yet
        // (e.g., serverless instance isolation, DB unavailable for JWT callback).
        const onboardingCookie = request.cookies.get("onboarding_completed")?.value === "1";

        // Authenticated but onboarding incomplete -> force /onboarding
        if (!onboardingComplete && !onboardingCookie && pathname.startsWith("/profile")) {
          return Response.redirect(
            new URL("/onboarding", request.nextUrl.origin),
          );
        }

        // Authenticated and onboarding complete -> skip onboarding page
        if (onboardingComplete && pathname.startsWith("/onboarding")) {
          return Response.redirect(
            new URL("/profile", request.nextUrl.origin),
          );
        }

        // Admin route protection
        if (pathname.startsWith("/admin") && user.role !== "admin") {
          return Response.redirect(
            new URL("/profile", request.nextUrl.origin),
          );
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
        session.user.id = (token.userId as string) || token.sub || "";
        session.user.email = (token.email as string) || "";
        session.user.name = (token.name as string) || "";
        session.user.image = (token.picture as string) || "";
        session.user.role = (token.role as string) || "user";
        session.user.onboardingComplete =
          (token.onboardingComplete as boolean) ?? false;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
