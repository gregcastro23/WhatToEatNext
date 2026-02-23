'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId || appId === 'undefined') {
    return (
      <div style={{ padding: '20px', color: '#991b1b', backgroundColor: '#fee2e2', textAlign: 'center' }}>
        <h2>Critical Error</h2>
        <p>NEXT_PUBLIC_PRIVY_APP_ID is missing from the build environment.</p>
        {/* DO NOT render PrivyProvider here, but render children so the app doesn't crash completely */}
        {children} 
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'google'],
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
          logo: 'https://alchm.kitchen/favicon.png',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
