/**
 * NextAuth.js (Auth.js v5) Configuration
 *
 * Provides Google OAuth authentication with JWT session strategy.
 * Compatible with existing JWT infrastructure and PostgreSQL backend.
 *
 * Required environment variables:
 *   AUTH_SECRET          - Random secret for signing tokens (generate with `npx auth secret`)
 *   AUTH_GOOGLE_ID       - Google OAuth client ID
 *   AUTH_GOOGLE_SECRET   - Google OAuth client secret
 *
 * @file src/lib/auth/auth.ts
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
      // Protect /profile and /onboarding routes
      const isProtected = request.nextUrl.pathname.startsWith("/profile") ||
        request.nextUrl.pathname.startsWith("/onboarding");
      if (isProtected && !session?.user) {
        return Response.redirect(new URL("/login", request.nextUrl.origin));
      }
      return true;
    },
    async jwt({ token, user, account }) {
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
      return token;
    },
    async session({ session, token }) {
      // Expose token fields on the session object for client use
      if (session.user) {
        session.user.id = (token.userId as string) || token.sub || "";
        session.user.email = (token.email as string) || "";
        session.user.name = (token.name as string) || "";
        session.user.image = (token.picture as string) || "";
      }
      return session;
    },
  },
});
