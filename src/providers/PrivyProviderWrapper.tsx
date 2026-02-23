'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return (
      <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
        <h1>CRITICAL ERROR</h1>
        <p>Missing Privy App ID Environment Variable.</p>
        <p>Please configure NEXT_PUBLIC_PRIVY_APP_ID in your Vercel project settings.</p>
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
