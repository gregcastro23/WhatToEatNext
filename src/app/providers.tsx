'use client';

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import React from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlchemicalProvider } from "@/contexts/AlchemicalContext/provider";
import { RecipeBuilderProvider } from "@/contexts/RecipeBuilderContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";

// Lazy-load PrivyProvider only when app ID is available to prevent
// build failures and avoid blocking page rendering for unauthenticated content
let PrivyProviderLazy: React.ComponentType<{ appId: string; config: Record<string, unknown>; children: React.ReactNode }> | null = null;

function getPrivyProvider() {
  if (PrivyProviderLazy) return PrivyProviderLazy;
  try {

    const mod = require('@privy-io/react-auth');
    PrivyProviderLazy = mod.PrivyProvider;
    return PrivyProviderLazy;
  } catch {
    return null;
  }
}

/**
 * Validates a Privy app ID format.
 * Privy app IDs follow the pattern: clXXXXXXXXXXXXXXXXXXXXXXX (starts with "cl" prefix)
 */
function isValidPrivyAppId(appId: string): boolean {
  if (!appId || appId.trim() === '' || appId === 'undefined' || appId === 'null') {
    return false;
  }
  // Privy app IDs must start with "cl" and be at least 10 chars
  const trimmed = appId.trim();
  return trimmed.startsWith('cl') && trimmed.length >= 10;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // Render providers on both server and client consistently.
  // All providers use useState with static initial values, so the SSR output
  // matches the client's initial render — no hydration mismatch.

  const content = (
    <ErrorBoundary>
      <ChakraProvider value={defaultSystem}>
        <ThemeProvider>
          <UserProvider>
            <AlchemicalProvider>
              <RecipeBuilderProvider>{children}</RecipeBuilderProvider>
            </AlchemicalProvider>
          </UserProvider>
        </ThemeProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );

  // If Privy App ID is missing or invalid, render content without Privy auth.
  // This prevents the entire app from crashing when the Privy app ID is
  // misconfigured (e.g., "Cannot initialize the Privy provider with an
  // invalid Privy app ID").
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!isValidPrivyAppId(appId || '')) {
    return content;
  }

  // Wrap with PrivyProvider only when available and configured.
  const Provider = getPrivyProvider();
  if (!Provider) {
    return content;
  }

  // Wrap PrivyProvider in its own ErrorBoundary so that if Privy fails
  // (invalid app ID, network issues, SDK errors), the rest of the app
  // still renders. Without this, a Privy error would crash the entire
  // React tree and show a blank screen.
  return (
    <ErrorBoundary fallback={content}>
      <Provider
        appId={appId!}
        config={{
          loginMethods: ['google'],
          appearance: {
            theme: 'dark',
            accentColor: '#676FFF',
          },
        }}
      >
        {content}
      </Provider>
    </ErrorBoundary>
  );
}
