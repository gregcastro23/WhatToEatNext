/**
 * /auth/establishing — post-OAuth splash.
 *
 * NextAuth redirects here after a successful Google callback when the
 * caller sets `callbackUrl=/auth/establishing?next=<dest>`. The handshake
 * component drives the 6-step checklist and refreshes the session once
 * the mesh propagation step completes, then routes to `next` (defaulting
 * to /profile or /onboarding).
 *
 * @file src/app/auth/establishing/page.tsx
 */

import { Suspense } from "react";
import { AuthHandshakeClient } from "./AuthHandshakeClient";

export const dynamic = "force-dynamic";

export default function AuthEstablishingPage() {
  return (
    <Suspense fallback={null}>
      <AuthHandshakeClient />
    </Suspense>
  );
}
