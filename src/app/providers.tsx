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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) return <>{children}</>;

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

  // Bulletproof guard: if the Privy App ID is missing the deployment is still
  // syncing environment variables. Show a holding screen rather than crashing.
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId || appId.trim() === '' || appId === 'undefined') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
        <div className="max-w-md p-6 bg-red-900/20 border border-red-500 rounded-lg">
          <h2 className="text-xl font-bold text-red-500 mb-4">Awaiting Environment Variables</h2>
          <p className="text-gray-300">The application is building and syncing configuration. Please wait for the deployment to finish.</p>
        </div>
        <div className="hidden">{children}</div>
      </div>
    );
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
