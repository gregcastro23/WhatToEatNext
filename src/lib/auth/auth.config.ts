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

function buildProviders() {
  const providers: any[] = [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ];

  if (process.env.AUTH_AMAZON_ID && process.env.AUTH_AMAZON_SECRET) {
    providers.push({
      id: "amazon",
      name: "Amazon",
      type: "oauth",
      clientId: process.env.AUTH_AMAZON_ID,
      clientSecret: process.env.AUTH_AMAZON_SECRET,
      authorization: {
        url: "https://www.amazon.com/ap/oa",
        params: { scope: "profile" },
      },
      token: "https://api.amazon.com/auth/o2/token",
      userinfo: "https://api.amazon.com/user/profile",
      profile(profile: any) {
        return {
          id: profile.user_id,
          name: profile.name,
          email: profile.email,
          image: null,
        };
      },
      style: { bg: "#FF9900", text: "#000" },
    } as any);
  }

  return providers;
}

export const authConfig = {
  secret: getAuthSecret(),
  trustHost: true,
  providers: buildProviders(),
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
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-authjs.session-token` : `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".alchm.kitchen" : undefined,
      },
    },
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
     * Custom redirect callback to support cross-subdomain SSO.
     * By default, NextAuth blocks redirects to origins other than baseUrl.
     * This allows redirects back to agents.alchm.kitchen or other subdomains.
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // Allows callback URLs on the same domain (including subdomains)
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname.endsWith(".alchm.kitchen") || urlObj.hostname === "alchm.kitchen") {
          return url;
        }
      } catch {
        // Fallback for invalid URLs
      }

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },

    /**
     * Runs in middleware (currently Node.js runtime per src/middleware.ts).
     * The session object here is populated from the JWT cookie, which
     * was enriched by the jwt/session callbacks in auth.ts during sign-in.
     *
     * Server-only modules must still be dynamically imported so this file
     * stays loadable from any context that imports authConfig.
     */
    async authorized({ auth: session, request }) {
      const { pathname } = request.nextUrl;

      // Routes that require authentication
      const isProtected =
        pathname.startsWith("/profile") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/birth-chart") ||
        pathname.startsWith("/current-chart");

      // Routes that require premium tier (authenticated users without premium
      // get redirected to /upgrade instead of seeing errors)
      const isPremiumRoute =
        pathname.startsWith("/recipe-generator") ||
        pathname.startsWith("/planetary-chart") ||
        pathname.startsWith("/restaurant-creator") ||
        pathname.startsWith("/premium-table");

      // Not authenticated -> redirect to login for protected routes
      if ((isProtected || isPremiumRoute) && !session?.user) {
        return Response.redirect(new URL("/login", request.nextUrl.origin));
      }

      if (session?.user) {
        const user = session.user as Record<string, unknown>;
        const onboardingComplete = user.onboardingComplete === true;
        const tier = (user.tier as string) || "free";
        const isAdmin = user.role === "admin";

        // Soft session revocation: when AUTH_REVOCATION_CHECK=on, look up
        // the jti against the Redis/Postgres revocation store. If the
        // session has been revoked (DELETE /api/auth/sessions/[id], mass
        // revoke, or row deleted), redirect to /login as if the session
        // had expired. Fail-open if both stores error.
        if (
          process.env.AUTH_REVOCATION_CHECK === "on" &&
          (isProtected || isPremiumRoute) &&
          typeof user.sessionId === "string" &&
          user.sessionId.length > 0
        ) {
          const { isJtiRevoked } = await import("./sessionRevocation");
          if (await isJtiRevoked(user.sessionId)) {
            return Response.redirect(new URL("/login", request.nextUrl.origin));
          }
        }

        // Also check the short-lived cookie set after onboarding completes.
        // This prevents a redirect loop when the JWT hasn't propagated yet
        // (e.g., serverless instance isolation, DB unavailable for JWT callback).
        const onboardingCookie = request.cookies.get("onboarding_completed")?.value === "1";

        // Authenticated but onboarding incomplete -> force /onboarding,
        // preserving the original destination via ?return= so the user
        // lands back where they started after completing or skipping.
        if (!onboardingComplete && !onboardingCookie && pathname.startsWith("/profile")) {
          const onboardingUrl = new URL("/onboarding", request.nextUrl.origin);
          const originalPath =
            request.nextUrl.pathname + request.nextUrl.search;
          onboardingUrl.searchParams.set("return", originalPath);
          return Response.redirect(onboardingUrl);
        }

        // Authenticated and onboarding complete -> skip onboarding page
        if ((onboardingComplete || onboardingCookie) && pathname.startsWith("/onboarding")) {
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

        // Premium route gating — free users see upgrade page, not errors.
        // Admins always have premium access.
        if (isPremiumRoute && tier !== "premium" && !isAdmin) {
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
        // Surface the JWT id so middleware can look up revocation state
        // without re-decoding the token.
        session.user.sessionId = token.deviceSessionId ?? token.sessionId;
        session.user.recipesGeneratedToday = token.recipesGeneratedToday ?? 0;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
