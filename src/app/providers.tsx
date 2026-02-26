'use client';

import React, { useState, useEffect } from "react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlchemicalProvider } from "@/contexts/AlchemicalContext/provider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { RecipeBuilderProvider } from "@/contexts/RecipeBuilderContext";

// Lazy-load PrivyProvider only when app ID is available to prevent
// build failures and avoid blocking page rendering for unauthenticated content
let PrivyProviderLazy: React.ComponentType<{ appId: string; config: Record<string, unknown>; children: React.ReactNode }> | null = null;

function getPrivyProvider() {
  if (PrivyProviderLazy) return PrivyProviderLazy;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@privy-io/react-auth');
    PrivyProviderLazy = mod.PrivyProvider;
    return PrivyProviderLazy;
  } catch {
    return null;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // Render providers on both server and client consistently.
  // All providers use useState with static initial values, so the SSR output
  // matches the client's initial render — no hydration mismatch.
  //
  // Previously, a `mounted` gate caused the entire child tree to unmount and
  // remount when switching from <>{children}</> to the full provider stack,
  // which led to blank-page issues.

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

  // If Privy App ID is missing, render content without Privy auth
  // This prevents the entire app from being blocked when env vars are not yet synced
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId || appId.trim() === '' || appId === 'undefined') {
    return content;
  }

  // Wrap with PrivyProvider only when available and configured
  const Provider = getPrivyProvider();
  if (!Provider) {
    return content;
  }

  return (
    <Provider
      appId={appId}
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
  );
}
