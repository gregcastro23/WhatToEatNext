'use client';

import React, { useState, useEffect } from "react";
import { PrivyProvider } from '@privy-io/react-auth';
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlchemicalProvider } from "@/contexts/AlchemicalContext/provider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { RecipeBuilderProvider } from "@/contexts/RecipeBuilderContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

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

  // Aggressive check for missing, empty, or stringified 'undefined'
  if (!appId || appId.trim() === '' || appId === 'undefined') {
    return (
      <div style={{ padding: '20px', color: '#991b1b', backgroundColor: '#fee2e2', borderRadius: '8px', margin: '20px' }}>
        <h2 style={{ fontWeight: 'bold' }}>Critical Error</h2>
        <p><code>NEXT_PUBLIC_PRIVY_APP_ID</code> is missing from the build environment. Please add it to the Vercel dashboard and redeploy.</p>
        <hr style={{ margin: '15px 0', borderColor: '#fca5a5' }} />
        {content}
      </div>
    );
  }

  return (
    <PrivyProvider
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
    </PrivyProvider>
  );
}
